import { useState, useMemo, useCallback } from "react";
import useStudent from "../../lib/hooks/useStudent";
import { useNotification } from "../../lib/context/NotificationContext";
import DataTable from "../../components/atoms/DataTable";
import SimpleButton from "../../components/atoms/SimpleButton";
import Modal from "../../components/atoms/Modal";
import ObservadorEstudiante from "./ObservadorEstudiante";
import ProfileObserver from "../../components/molecules/ProfileObserver";
import useAuth from "../../lib/hooks/useAuth";
import tourManageObserver from "../../tour/tourManageObserver";

const ManageObserver = () => {
  const { getObservationData } = useStudent();
  const { addNotification } = useNotification();
  const { idInstitution, fkInstitucion, nameRole, rol } = useAuth();
  const isDocenteRole =
    (typeof nameRole === "string" &&
      nameRole.toLowerCase().includes("docente")) ||
    String(rol) === "7";
  const effectiveInstitution = isDocenteRole ? fkInstitucion : idInstitution;
  const [numberId, setNumberId] = useState("");
  const [tableData, setTableData] = useState([]);
  const [isFetching, setIsFetching] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);
  const [isEditOpen, setIsEditOpen] = useState(false);

  const handleSearch = useCallback(async () => {
    const value = numberId.trim();
    if (!value) return;
    console.log(
      "ManageObserver - Searching for ID:",
      value,
      "Institution ID:",
      effectiveInstitution,
    );
    setIsFetching(true);
    try {
      const data = await getObservationData({
        numberId: value,
        fk_institucion: Number(effectiveInstitution),
      });
      setTableData(Array.isArray(data) ? data : []);
      if (!data || data.length === 0) {
        addNotification("No hay datos para retornar.", "warning");
      }
    } catch (err) {
      console.error("ManageObserver - error:", err);
      addNotification("Error al consultar observaciones.", "error");
      setTableData([]);
    } finally {
      setIsFetching(false);
    }
  }, [numberId, getObservationData, addNotification]);

  const columns = useMemo(
    () => [
      { accessorKey: "identificacion_estudiante", header: "Identificación" },
      { accessorKey: "nombre_estudiante", header: "Estudiante" },

      {
        accessorKey: "fecha_observacion",
        header: "Fecha de creación",
        meta: { hideOnLG: true },
        cell: ({ getValue }) => {
          const v = getValue();
          if (!v) return "-";
          // Extraer la parte de fecha del ISO string (YYYY-MM-DD) sin conversión de zona horaria
          const datePart = String(v).slice(0, 10);
          const [year, month, day] = datePart.split("-");
          if (!year || !month || !day) return String(v);
          return `${day}/${month}/${year}`;
        },
      },
      {
        accessorKey: "observacion",
        header: "Observación",
        cell: ({ getValue }) => {
          const value = String(getValue() ?? "");
          const max = 30;
          if (value.length <= max) return value;
          return (
            <span title={value} className="truncate block max-w-88">
              {value.slice(0, max)}...
            </span>
          );
        },
      },
      {
        id: "actions",
        header: "Acciones",
        cell: ({ row }) => (
          <div className="w-full h-full flex items-stretch gap-2 p-2">
            <SimpleButton
              onClick={() => {
                setSelectedRow(row.original);
                setIsEditOpen(true);
              }}
              icon="Pencil"
              bg="bg-secondary"
              text="text-surface"
              noRounded={false}
              msjtooltip="Editar observación"
            />
          </div>
        ),
      },
    ],
    [],
  );

  return (
    <div className="p-6 h-full gap-4 flex flex-col">
      {/* Título + botón registrar */}
      <div
        id="tour-mo-header"
        className="w-full grid gap-2 grid-cols-1 lg:grid-cols-5 xl:grid-cols-4 justify-between items-center bg-primary text-surface p-3 rounded-lg"
      >
        <div className=" lg:col-span-3 xl:col-span-2 flex items-center gap-3">
          <h2 className="text-2xl font-bold">Gestión de Observador</h2>
        </div>
        <div
          id="tour-mo-add-btn"
          className=" grid grid-cols-2 col-span-2 xl:col-span-2 gap-2"
        >
          <SimpleButton
            onClick={() => setIsModalOpen(true)}
            msj="Registrar observación"
            icon="Plus"
            bg="bg-secondary"
            text="text-surface"
            noRounded={false}
          />
          <SimpleButton
            type="button"
            onClick={tourManageObserver}
            icon="HelpCircle"
            msjtooltip="Iniciar tutorial"
            noRounded={false}
            bg="bg-info"
            text="text-surface"
            className="w-auto px-3 py-1.5"
          />
        </div>
      </div>

      {/* Búsqueda */}
      <div className="bg-surface p-4 rounded-lg shadow grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
        <div
          id="tour-mo-search-input"
          className="md:col-span-3 flex flex-col gap-1"
        >
          <label className="text-sm font-semibold">
            Documento de identidad del estudiante
          </label>
          <input
            type="text"
            placeholder="Documento de identidad"
            value={numberId}
            onChange={(e) => setNumberId(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            disabled={isFetching}
            className="bg-surface rounded p-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-secondary"
          />
        </div>
        <div id="tour-mo-search-btn">
          <SimpleButton
            type="button"
            msj={isFetching ? "Buscando…" : "Buscar"}
            onClick={handleSearch}
            bg="bg-secondary"
            text="text-surface"
            hover="hover:bg-secondary/80"
            icon="Search"
            disabled={isFetching}
          />
        </div>
      </div>

      {/* Tabla */}
      <div id="tour-mo-table" className="relative flex-1 p-4">
        <DataTable
          key="observer-table"
          data={tableData}
          columns={columns}
          fileName="Export_Observaciones"
          showDownloadButtons={false}
          loading={isFetching}
          loaderMessage="Cargando observaciones..."
        />
      </div>

      {/* Modal Registrar Observación */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Registrar observación"
        size="screen-2xl"
      >
        <ObservadorEstudiante />
      </Modal>

      {/* Modal Editar Observación */}
      <Modal
        isOpen={isEditOpen}
        onClose={() => {
          setIsEditOpen(false);
          setSelectedRow(null);
        }}
        title="Editar observación"
        size="screen-2xl"
      >
        {selectedRow && (
          <ProfileObserver
            data={selectedRow}
            onClose={() => {
              setIsEditOpen(false);
              setSelectedRow(null);
            }}
            onSaved={handleSearch}
          />
        )}
      </Modal>
    </div>
  );
};

export default ManageObserver;
