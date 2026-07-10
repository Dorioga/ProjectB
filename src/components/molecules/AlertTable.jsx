import { useMemo, useState } from "react";
import DataTable from "../atoms/DataTable";
import SimpleButton from "../atoms/SimpleButton";

const AlertTable = ({ alerts, onRefresh }) => {
  // Definir las columnas para el DataTable
  const columns = useMemo(
    () => [
      {
        accessorKey: "numero_identificacion",
        header: "Documento",
        meta: {
          hideOnXL: true,
        },
      },
      {
        accessorKey: "nombre_estudiante",
        header: "Nombre del estudiante",
        cell: ({ row }) => (
          <span className="font-medium">{row.original.nombre_estudiante}</span>
        ),
      },
      {
        accessorKey: "nombre_grado",
        header: "Grado",
        cell: ({ row }) => (
          <span>
            {[row.original.nombre_grado, row.original.grupo]
              .filter(Boolean)
              .join(" - ")}
          </span>
        ),
      },
      {
        accessorKey: "nombre_sede",
        header: "Sede",
        cell: ({ getValue }) => {
          const value = getValue() || "";
          return (
            <span
              className="block max-w-[150px] truncate text-left"
              title={value}
            >
              {value}
            </span>
          );
        },
        meta: {
          hideOnXL: true,
        },
      },

      {
        accessorKey: "nombre_jornada",
        header: "Jornada",
        meta: {
          hideOnXL: true,
        },
      },
      {
        id: "motivoAlerta",
        header: "Motivo de alerta",
        cell: ({ row }) => {
          const a = row.original;
          const motivos = [];
          if (!a.Doc_estudiante) motivos.push("Sin doc. estudiante");
          if (!a.Doc_acudiente) motivos.push("Sin doc. acudiente");
          if (a.sin_acudiente) motivos.push("Sin acudiente");
          if (
            a.primera_etapa === "Excusa" &&
            (!Array.isArray(a.excusas) ||
              !a.excusas.some(
                (e) => e.etapa?.toLowerCase() === "primera etapa" && e.link,
              ))
          ) {
            motivos.push("Sin doc. excusa etapa1");
          }
          if (
            a.segunda_etapa === "Excusa" &&
            (!Array.isArray(a.excusas) ||
              !a.excusas.some(
                (e) => e.etapa?.toLowerCase() === "segunda etapa" && e.link,
              ))
          ) {
            motivos.push("Sin doc. excusa etapa2");
          }
          return (
            <span className="text-sm">
              {motivos.join(", ") || "Sin alerta"}
            </span>
          );
        },
      },
    ],
    [],
  );
  const [isOpen, setIsOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);

  const handleToggleOpen = () => setIsOpen((prev) => !prev);

  const handleRefresh = async () => {
    if (!onRefresh || isRefreshing) return;
    setIsRefreshing(true);
    try {
      await onRefresh();
      setIsOpen(true);
      setHasLoadedOnce(true);
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <div className="alert-table flex flex-col gap-4">
      <div className="w-full flex justify-between items-center bg-error text-surface p-3 rounded-t-lg">
        <h2 className="text-2xl font-bold">Alertas ({alerts.length})</h2>
        <div className="flex items-center gap-2">
          {onRefresh && (
            <SimpleButton
              onClick={handleRefresh}
              bg="bg-surface"
              icon={
                isRefreshing || !hasLoadedOnce
                  ? "HardDriveDownload"
                  : "RefreshCw"
              }
              text="text-error"
              title="Actualizar alertas"
              disabled={isRefreshing}
            />
          )}
          <SimpleButton
            onClick={handleToggleOpen}
            bg="bg-surface"
            icon={isOpen ? "Minimize2" : "Maximize2"}
            text="text-error"
          />
        </div>
      </div>

      <div
        className={`bg-bg rounded-b-lg overflow-y-auto transition-all duration-500 ease-in-out ${
          isOpen
            ? "max-h-[1000px] opacity-100 translate-y-0"
            : "max-h-0 opacity-0 -translate-y-4"
        }`}
      >
        {isOpen && (
          <DataTable
            data={alerts}
            columns={columns}
            fileName="Alertas_Export"
          />
        )}
      </div>
    </div>
  );
};

export default AlertTable;
