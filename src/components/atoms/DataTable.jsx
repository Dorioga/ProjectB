// filepath: src/components/molecules/DataTable.jsx
import React, { useState, useRef, useEffect } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  flexRender,
} from "@tanstack/react-table";
import * as XLSX from "xlsx";
import { FileUp, ChevronDown, ChevronRight } from "lucide-react";
import SimpleButton from "./SimpleButton";
import Loader from "./Loader";
import DocumentModal from "../molecules/DocumentModal";

const DataTable = ({
  data,
  columns,
  fileName = "export",
  mode = null,
  refreshKey = 0,
  showDownloadButtons = true,
  // optional: function (row) => string | string
  rowClassName,
  // optional default page size for pagination (defaults to 20)
  pageSize = 20,
  // Loader support
  loading = false,
  loaderMessage = "Cargando...",
  loaderSize = 96,
  // optional initial sorting: [{ id: 'column_key', desc: false }]
  initialSorting = [],
  // optional: accessor key to group rows by (accordion mode, disables pagination)
  groupBy = null,
  // optional: function (rows) => ReactNode — extra summary shown in the accordion header
  groupSummary = null,
  // optional: si true, exporta a Excel sin fila de encabezados
  exportWithoutHeaders = false,
  // optional: string[] — filas de encabezado institucional que se insertan antes de los datos en el Excel
  exportHeaderRows = null,
}) => {
  const [sorting, setSorting] = useState(initialSorting);
  const [globalFilter, setGlobalFilter] = useState("");
  const tableRef = useRef(null);
  const [isOpen, setIsOpen] = useState(false);
  const [downloadTypeMode, setDownloadTypeMode] = useState("all");
  const [closedGroups, setClosedGroups] = useState(new Set());

  // Función de filtro personalizada que busca todos los términos en toda la fila
  const globalFilterFn = (row, columnId, filterValue) => {
    if (!filterValue) return true;

    // Dividir el texto de búsqueda en términos individuales
    const searchTerms = filterValue
      .toLowerCase()
      .split(/\s+/)
      .filter((term) => term.length > 0);

    // Concatenar todos los valores de la fila en un solo string
    const rowText = columns
      .map((column) => {
        // Ignorar columnas de acciones
        if (column.id === "actions") return "";

        let value;
        if (column.accessorFn) {
          value = column.accessorFn(row.original);
        } else if (column.accessorKey) {
          value = row.original[column.accessorKey];
        }

        // Ignorar valores que sean objetos (JSX, React elements, etc.)
        if (
          value !== null &&
          value !== undefined &&
          typeof value === "object"
        ) {
          return "";
        }
        return value != null ? String(value).toLowerCase() : "";
      })
      .join(" ");

    // Verificar que todos los términos estén presentes en la fila
    return searchTerms.every((term) => rowText.includes(term));
  };

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      globalFilter,
    },
    initialState: {
      pagination: {
        pageSize: Number(pageSize) || 20, // default page size (overridable via prop)
      },
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: globalFilterFn,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  // Asegurar que react-table use la última data cuando cambie la prop o se requiera un refresh
  useEffect(() => {
    try {
      table.setOptions((prev) => ({ ...prev, data }));
    } catch (err) {
      console.warn("DataTable: error en setOptions ->", err);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, refreshKey]);

  // Reiniciar grupos cerrados cuando cambian los datos o el filtro
  useEffect(() => {
    if (groupBy) setClosedGroups(new Set());
  }, [data, globalFilter, groupBy]);

  const handleExport = () => {
    // Obtener todas las filas filtradas
    const filteredRows = table.getFilteredRowModel().rows;

    // Crear los datos para exportar
    const exportData = filteredRows.map((row) => {
      const rowData = {};

      // Iterar sobre las columnas visibles
      columns.forEach((column) => {
        // Ignorar la columna de acciones
        if (column.id === "actions") return;

        // Extraer el texto del header (puede ser JSX o string)
        const header =
          column.meta?.exportHeader ??
          (typeof column.header === "string"
            ? column.header
            : (column.accessorKey ?? column.id ?? "columna"));

        // Obtener el valor usando accessorFn si existe, sino usar accessorKey
        let value;
        if (column.accessorFn) {
          value = column.accessorFn(row.original);
        } else if (column.accessorKey) {
          value = row.original[column.accessorKey];
        }

        // Si el valor es un objeto (JSX, React element, etc.) dejarlo vacío
        if (
          value !== null &&
          value !== undefined &&
          typeof value === "object"
        ) {
          value = "";
        }

        rowData[header] = value ?? "";
      });

      return rowData;
    });

    // Crear el worksheet — con o sin encabezado institucional
    let worksheet;
    if (exportHeaderRows && exportHeaderRows.length > 0) {
      // Convertir cada string en una fila AOA de una sola celda
      const headerAOA = exportHeaderRows.map((row) => [row]);
      headerAOA.push([]); // fila vacía separadora
      worksheet = XLSX.utils.aoa_to_sheet(headerAOA);
      XLSX.utils.sheet_add_json(worksheet, exportData, {
        origin: headerAOA.length,
        skipHeader: exportWithoutHeaders,
      });
    } else {
      worksheet = XLSX.utils.json_to_sheet(exportData, {
        skipHeader: exportWithoutHeaders,
      });
    }

    // Prevenir inyección de fórmulas en Excel: forzar tipo string en celdas
    // cuyos valores comiencen con caracteres interpretados como fórmulas (=, -, +, @)
    const formulaPrefixes = ["=", "-", "+", "@"];
    Object.keys(worksheet).forEach((cellAddr) => {
      if (cellAddr.startsWith("!")) return; // omitir metadatos del worksheet
      const cell = worksheet[cellAddr];
      if (
        cell &&
        typeof cell.v === "string" &&
        formulaPrefixes.some((ch) => cell.v.startsWith(ch))
      ) {
        cell.t = "s"; // forzar tipo string para evitar evaluación como fórmula
      }
    });

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Datos");

    // Generar el nombre del archivo con fecha
    const fecha = new Date().toISOString().split("T")[0];
    const nombreArchivo = globalFilter
      ? `${fileName}_filtrado_${fecha}.xlsx`
      : `${fileName}_${fecha}.xlsx`;

    XLSX.writeFile(workbook, nombreArchivo);
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Loader modal (se usa el Loader global que ya es un modal) */}
      {loading ? <Loader message={loaderMessage} size={loaderSize} /> : null}
      <div
        className={` grid w-full  gap-2  ${
          mode !== null ? "grid-cols-7 " : "grid-cols-1"
        } `}
      >
        <input
          type="text"
          value={globalFilter ?? ""}
          onChange={(e) => setGlobalFilter(e.target.value)}
          placeholder="Buscar en la tabla..."
          className="border p-2 rounded col-span-3 bg-surface"
        />

        <div className="grid grid-cols-3  col-span-4  gap-4">
          {mode !== null && showDownloadButtons && (
            <>
              <SimpleButton
                onClick={() => {
                  setIsOpen(true);
                  setDownloadTypeMode("habeasData");
                }}
                bg="bg-green-600"
                icon="Download"
                text="text-surface"
                msj="Descargar archivos (Habeas Data)"
              />
              <SimpleButton
                onClick={() => {
                  setIsOpen(true);
                  setDownloadTypeMode("all");
                }}
                bg="bg-green-600"
                icon="Download"
                text="text-surface"
                msj="Descargar archivos de auditoria"
              />
            </>
          )}
          <div
            className={` grid w-full col-end-8 gap-2  ${
              mode !== null ? "" : ""
            } `}
          >
            <SimpleButton
              onClick={handleExport}
              bg="bg-green-600"
              icon="FileUp"
              text="text-surface"
              msj="Exportar a Excel"
            />
          </div>
        </div>
      </div>

      <div className="rounded-lg border">
        <table ref={tableRef} className="w-full">
          <thead className="bg-primary text-surface">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className={`p-3 text-center font-semibold cursor-pointer ${
                      header.column.columnDef.meta?.hideOnSM
                        ? "hidden sm:table-cell"
                        : ""
                    }${
                      header.column.columnDef.meta?.hideOnMD
                        ? "hidden md:table-cell"
                        : ""
                    } 
                    ${
                      header.column.columnDef.meta?.hideOnLG
                        ? "hidden lg:table-cell"
                        : ""
                    }${
                      header.column.columnDef.meta?.hideOnXL
                        ? "hidden xl:table-cell"
                        : ""
                    }`}
                    onClick={header.column.getToggleSortingHandler()}
                  >
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext(),
                    )}
                    {{
                      asc: " 🔼",
                      desc: " 🔽",
                    }[header.column.getIsSorted()] ?? null}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {groupBy ? (
              (() => {
                const filteredRows = table.getSortedRowModel().rows;
                const colCount =
                  table.getHeaderGroups()?.[0]?.headers?.length || 1;
                if (filteredRows.length === 0) {
                  return (
                    <tr>
                      <td
                        colSpan={colCount}
                        className="p-6 text-center text-gray-500"
                      >
                        Sin datos
                      </td>
                    </tr>
                  );
                }
                const groupMap = new Map();
                filteredRows.forEach((row) => {
                  const key = String(row.getValue(groupBy) ?? "(Sin valor)");
                  if (!groupMap.has(key)) groupMap.set(key, []);
                  groupMap.get(key).push(row);
                });
                return Array.from(groupMap.entries()).flatMap(
                  ([groupKey, rows]) => {
                    const isOpen = !closedGroups.has(groupKey);
                    return [
                      <tr
                        key={`group-${groupKey}`}
                        className="bg-blue-50 border-b cursor-pointer select-none hover:bg-blue-100 transition-colors"
                        onClick={() =>
                          setClosedGroups((prev) => {
                            const next = new Set(prev);
                            if (next.has(groupKey)) next.delete(groupKey);
                            else next.add(groupKey);
                            return next;
                          })
                        }
                      >
                        <td colSpan={colCount} className="px-4 py-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              {isOpen ? (
                                <ChevronDown
                                  size={16}
                                  className="text-primary"
                                />
                              ) : (
                                <ChevronRight
                                  size={16}
                                  className="text-primary"
                                />
                              )}
                              <span className="font-semibold text-sm text-gray-800">
                                {groupKey}
                              </span>
                            </div>
                            <div className="flex items-center gap-3">
                              {groupSummary && groupSummary(rows)}
                              <span className="text-xs text-gray-500 font-medium">
                                {rows.length}{" "}
                                {rows.length === 1 ? "registro" : "registros"}
                              </span>
                            </div>
                          </div>
                        </td>
                      </tr>,
                      ...(isOpen
                        ? rows.map((row) => (
                            <tr
                              key={row.id}
                              className={`border-b bg-surface hover:bg-gray-50 transition-colors duration-300 ${
                                typeof rowClassName === "function"
                                  ? rowClassName(row)
                                  : (rowClassName ?? "")
                              }`}
                            >
                              {row.getVisibleCells().map((cell) => (
                                <td
                                  key={cell.id}
                                  className={`p-0 h-full text-center ${
                                    cell.column.columnDef.meta?.hideOnSM
                                      ? "hidden sm:table-cell"
                                      : ""
                                  }${
                                    cell.column.columnDef.meta?.hideOnMD
                                      ? "hidden md:table-cell"
                                      : ""
                                  } 
                                  ${
                                    cell.column.columnDef.meta?.hideOnLG
                                      ? "hidden lg:table-cell"
                                      : ""
                                  }${
                                    cell.column.columnDef.meta?.hideOnXL
                                      ? "hidden xl:table-cell"
                                      : ""
                                  }`}
                                >
                                  <div className=" p-0 block">
                                    {flexRender(
                                      cell.column.columnDef.cell,
                                      cell.getContext(),
                                    )}
                                  </div>
                                </td>
                              ))}
                            </tr>
                          ))
                        : []),
                    ];
                  },
                );
              })()
            ) : table.getRowModel().rows.length === 0 ? (
              <tr>
                <td
                  colSpan={table.getHeaderGroups()?.[0]?.headers?.length || 1}
                  className="p-6 text-center text-gray-500"
                >
                  Sin datos
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  className={`border-b bg-surface hover:bg-gray-50 transition-colors duration-300 ${
                    typeof rowClassName === "function"
                      ? rowClassName(row)
                      : (rowClassName ?? "")
                  }`}
                >
                  {row.getVisibleCells().map((cell) => (
                    <td
                      key={cell.id}
                      className={`p-0 h-full text-center ${
                        cell.column.columnDef.meta?.hideOnSM
                          ? "hidden sm:table-cell"
                          : ""
                      }${
                        cell.column.columnDef.meta?.hideOnMD
                          ? "hidden md:table-cell"
                          : ""
                      } 
                      ${
                        cell.column.columnDef.meta?.hideOnLG
                          ? "hidden lg:table-cell"
                          : ""
                      }${
                        cell.column.columnDef.meta?.hideOnXL
                          ? "hidden xl:table-cell"
                          : ""
                      }`}
                    >
                      <div className=" p-0 block">
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </div>
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between mt-4">
        <div className="text-sm text-gray-600">
          <p>
            Página{" "}
            <strong>
              {table.getState().pagination.pageIndex + 1} de{" "}
              {table.getPageCount()}
            </strong>
          </p>
          <p>
            Mostrando <strong>{table.getFilteredRowModel().rows.length}</strong>{" "}
            de <strong>{data.length}</strong> registros
            {globalFilter && (
              <span className="text-blue-600"> (filtrados)</span>
            )}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            className="border rounded px-2 py-1 hover:bg-gray-100 disabled:opacity-50"
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
          >
            {"<<"}
          </button>
          <button
            className="border rounded px-2 py-1 hover:bg-gray-100 disabled:opacity-50"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            {"<"}
          </button>
          <button
            className="border rounded px-2 py-1 hover:bg-gray-100 disabled:opacity-50"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            {">"}
          </button>
          <button
            className="border rounded px-2 py-1 hover:bg-gray-100 disabled:opacity-50"
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
          >
            {">>"}
          </button>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm">Mostrar:</span>
          <select
            value={table.getState().pagination.pageSize}
            onChange={(e) => {
              table.setPageSize(Number(e.target.value));
            }}
            className="border p-2 rounded"
          >
            {[10, 20, 50, 100, 150].map((pageSize) => (
              <option key={pageSize} value={pageSize}>
                {pageSize}
              </option>
            ))}
          </select>
        </div>
      </div>
      <DocumentModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        type={downloadTypeMode}
        title={
          downloadTypeMode === "all" ? "Documentos de auditoría" : "Habeas Data"
        }
      />
    </div>
  );
};

export default DataTable;
