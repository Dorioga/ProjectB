import { useMemo, useState } from "react";
import DataTable from "../atoms/DataTable";
import SimpleButton from "../atoms/SimpleButton";

const AlertTable = ({ alerts, onRefresh }) => {
  console.log("Alertas recibidas en AlertTable:", alerts);
  // Definir las columnas para el DataTable
  const columns = useMemo(
    () => [
      {
        accessorKey: "numero_identificacion",
        header: "Documento",
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
        meta: {
          hideOnXL: true,
        },
      },
      {
        accessorKey: "nombre_sede",
        header: "Sede",
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
