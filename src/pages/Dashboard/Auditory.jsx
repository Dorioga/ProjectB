import { useMemo, useState, useCallback } from "react";
import DataTable from "../../components/atoms/DataTable";
import SimpleButton from "../../components/atoms/SimpleButton";
import AuditoryModal from "../../components/molecules/AuditoryModal";

const data = [
  {
    id: 1,
    year: "2025",
    startdate: "2025-11-17", // ✅ Formato correcto
    enddate: "",
    personext: "Juan Perez",
    personint: "Pedro Gomez",
    observation: "Se inició la auditoría en la sede 1 y finalizó en la sede 2.",
  },
  {
    id: 2,
    year: "2025",
    startdate: "2025-11-17",
    enddate: "2025-11-23",
    personext: "Juan Perez",
    personint: "Pedro Gomez",
    observation:
      "Se realizó la auditoría con algunas ausencias, pero con soporte.",
  },
];

const Auditory = () => {
  const [isOpenModal, setIsOpenModal] = useState(false);
  const [modeModal, setModeModal] = useState("");
  const [selectedData, setSelectedData] = useState(null);

  // Función auxiliar para convertir YYYY-MM-DD a DD-MM-YYYY (para mostrar)
  const formatDateForDisplay = (dateStr) => {
    if (!dateStr) return "";
    const [year, month, day] = dateStr.split("-");
    return `${day}/${month}/${year}`;
  };

  // Handler estable
  const handleOpenModal = useCallback((mode, rowData = null) => {
    console.log("Abriendo modal en modo:", mode, "con datos:", rowData);
    setModeModal(mode);
    setSelectedData(rowData);
    setIsOpenModal(true);
  }, []);
  const handleCloseModal = () => {
    setIsOpenModal(false);
    setSelectedData(null);
    setModeModal("");
  };

  const columns = useMemo(
    () => [
      {
        accessorKey: "year",
        header: "Año",
        cell: ({ row }) => (
          <div className="text-center">{row.original.year}</div>
        ),
      },
      {
        accessorKey: "startdate",
        header: "Fecha de inicio",
        cell: ({ row }) => (
          <div className="text-center">
            {formatDateForDisplay(row.original.startdate)}
          </div>
        ),
      },
      {
        accessorKey: "enddate",
        header: "Fecha de cierre",
        cell: ({ row }) => (
          <div className="text-center">
            {formatDateForDisplay(row.original.enddate)}
          </div>
        ),
      },
      {
        accessorKey: "observation",
        header: "Observaciones",
        cell: ({ row }) => (
          <div className="text-left px-2">{row.original.observation}</div>
        ),
      },
      {
        id: "actions",
        header: "Acciones",
        cell: ({ row }) => (
          <div className="w-full h-full flex justify-center">
            <SimpleButton
              onClick={() => {
                handleOpenModal("view", row.original);
              }}
              msj="Ver"
              icon="Eye"
              bg="bg-blue-500"
              text="text-surface"
              noRounded={true}
            />
          </div>
        ),
      },
    ],
    [],
  );

  return (
    <div className="border p-6 rounded bg-bg h-full gap-4 flex flex-col">
      <div className="grid grid-cols-6 items-center gap-4">
        <h2 className="text-2xl font-bold col-span-5">Auditorías</h2>
        <SimpleButton
          onClick={() => handleOpenModal("create")}
          msj="Crear"
          icon="Plus"
          bg="bg-blue-500"
          text="text-surface"
        />
      </div>
      <DataTable data={data} columns={columns} fileName="Reporte_Auditorias" />
      {isOpenModal && (
        <AuditoryModal
          isOpen={isOpenModal}
          onClose={handleCloseModal}
          mode={modeModal}
          data={selectedData}
        />
      )}
    </div>
  );
};

export default Auditory;
