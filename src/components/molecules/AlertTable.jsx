import { useMemo, useState } from "react";
import DataTable from "../atoms/DataTable";
import SimpleButton from "../atoms/SimpleButton";

const AlertTable = ({ alerts }) => {
  // Definir las columnas para el DataTable
  const columns = useMemo(
    () => [
      {
        accessorKey: "nombreEstudiante",
        header: "Nombre Estudiante",
        cell: ({ row }) => (
          <span className="font-medium">{row.original.nombreEstudiante}</span>
        ),
      },
      {
        accessorKey: "documento",
        header: "Documento",
      },
      {
        accessorKey: "grado",
        header: "Grado",
      },
      {
        accessorKey: "jornada",
        header: "Jornada",
        cell: ({ row }) => (
          <span className="capitalize">{row.original.jornada}</span>
        ),
      },
      {
        accessorKey: "motivoAlerta",
        header: "Motivo de Alerta",
        cell: ({ row }) => (
          <span className="text-sm">{row.original.motivoAlerta}</span>
        ),
      },
    ],
    []
  );
  const [isOpen, setIsOpen] = useState(false);
  const handleToggleOpen = () => {
    setIsOpen(!isOpen);
  };
  return (
    <div className="alert-table flex flex-col gap-4 ">
      <div className="w-full flex justify-between items-center bg-error text-white p-3 rounded-t-lg">
        <h2 className="text-2xl font-bold">Alertas ({alerts.length})</h2>
        <div>
          <SimpleButton
            onClick={handleToggleOpen}
            bg="bg-white"
            icon={isOpen ? "Minimize2" : "Maximize2"}
            text="text-error"
          />
        </div>
      </div>

      <div
        className={`bg-bg rounded-b-lg overflow-hidden transition-all duration-500 ease-in-out ${
          isOpen
            ? "max-h-[1000px] opacity-100 translate-y-0"
            : "max-h-0 opacity-0 -translate-y-4"
        }`}
      >
        <DataTable data={alerts} columns={columns} fileName="Alertas_Export" />
      </div>
    </div>
  );
};

export default AlertTable;
