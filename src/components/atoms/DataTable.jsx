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
import { FileUp } from "lucide-react";
import SimpleButton from "./SimpleButton";
import DocumentModal from "../molecules/DocumentModal";

const DataTable = ({
  data,
  columns,
  fileName = "export",
  mode = null,
  refreshKey = 0,
  showDownloadButtons = true,
}) => {
  const [sorting, setSorting] = useState([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const tableRef = useRef(null);
  const [isOpen, setIsOpen] = useState(false);
  const [downloadTypeMode, setDownloadTypeMode] = useState("all");

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
        pageSize: 20, // <-- AQUÍ: establece la cantidad por defecto
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

        const columnId = column.accessorKey || column.id;
        const header = column.header;

        // Obtener el valor usando accessorFn si existe, sino usar accessorKey
        let value;
        if (column.accessorFn) {
          value = column.accessorFn(row.original);
        } else if (column.accessorKey) {
          value = row.original[column.accessorKey];
        }

        rowData[header] = value;
      });

      return rowData;
    });

    // Crear el worksheet desde los datos JSON
    const worksheet = XLSX.utils.json_to_sheet(exportData);
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
          className="border p-2 rounded col-span-2 bg-surface"
        />

        <div className="grid grid-cols-2  col-span-4  gap-4">
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
        </div>

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

      <div className="overflow-x-auto rounded-lg border">
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
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id} className="border-b bg-surface hover:bg-gray-50">
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
            ))}
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
            {[10, 20, 50, 100].map((pageSize) => (
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
