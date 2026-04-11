import { useState, useMemo, useEffect, useCallback } from "react";
import useSchool from "../../lib/hooks/useSchool";
import useAuth from "../../lib/hooks/useAuth";
import useData from "../../lib/hooks/useData";
import { sortAlphabetically } from "../../utils/formatUtils";
import DataTable from "../../components/atoms/DataTable";
import SimpleButton from "../../components/atoms/SimpleButton";
import Modal from "../../components/atoms/Modal";
import RegisterAsignature from "../GradeRecords/RegisterAsignature";
import JourneySelect from "../../components/atoms/JourneySelect";
import SedeSelect from "../../components/atoms/SedeSelect";
import { useNotify } from "../../lib/hooks/useNotify";
import ProfileAssignature from "../../components/molecules/ProfileAssignature";
import tourManageAsignature from "../../tour/tourManageAsignature";

const ManageAsignature = () => {
  const { idInstitution, idSede: authIdSede } = useAuth();
  const { getSedeAsignature, updateAssignature } = useSchool();
  const { institutionSedes } = useData();
  const notify = useNotify();

  const [tableData, setTableData] = useState([]);
  const [fetchError, setFetchError] = useState(null);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedAsignature, setSelectedAsignature] = useState(null);

  // Filtros
  const [selectedSede, setSelectedSede] = useState("");
  const [selectedJornada, setSelectedJornada] = useState("");

  // Auto-seleccionar la sede del usuario si está disponible
  useEffect(() => {
    if (authIdSede && !selectedSede) {
      setSelectedSede(String(authIdSede));
    }
  }, [authIdSede, selectedSede]);

  // Obtener fk_workday de la sede seleccionada para filtrar jornadas
  const sedeWorkday = useMemo(() => {
    if (!selectedSede || !Array.isArray(institutionSedes)) return null;
    const sede = institutionSedes.find(
      (s) => String(s?.id) === String(selectedSede),
    );
    return sede?.fk_workday ? String(sede.fk_workday) : null;
  }, [selectedSede, institutionSedes]);

  // Limpiar jornada cuando cambie la sede
  useEffect(() => {
    setSelectedJornada("");
  }, [selectedSede]);

  // Auto-seleccionar jornada si fk_workday no es 3
  useEffect(() => {
    if (!sedeWorkday) return;

    // Si fk_workday es 3 (ambas), el usuario puede elegir, no auto-seleccionar
    if (sedeWorkday === "3") return;

    // Si es 1 o 2, auto-seleccionar esa jornada
    setSelectedJornada(sedeWorkday);
  }, [sedeWorkday]);

  // Cargar asignaturas
  const fetchAsignatures = useCallback(async () => {
    if (!selectedSede || !selectedJornada) {
      setTableData([]);
      return;
    }

    setIsFetching(true);
    setFetchError(null);

    try {
      const payload = {
        idSede: Number(selectedSede),
        idWorkDay: Number(selectedJornada),
      };

      console.log(
        "ManageAsignature - llamando getSedeAsignature con:",
        payload,
      );
      const response = await getSedeAsignature(payload);

      // Extraer el array de asignaturas de la respuesta
      const asignaturas = Array.isArray(response)
        ? response
        : (response?.data ?? []);

      console.log("ManageAsignature - asignaturas recibidas:", asignaturas);
      setTableData(sortAlphabetically(asignaturas, "nombre_asignatura"));
    } catch (error) {
      console.error("Error al cargar asignaturas:", error);
      setFetchError(error?.message || String(error));
      setTableData([]);
    } finally {
      setIsFetching(false);
    }
  }, [selectedSede, selectedJornada, getSedeAsignature]);

  useEffect(() => {
    fetchAsignatures();
  }, [fetchAsignatures]);

  // Abrir modal de edición
  const handleEditAsignature = useCallback((asignature) => {
    setSelectedAsignature(asignature);
    setIsEditModalOpen(true);
  }, []);

  // Guardar cambios de asignatura
  const handleSaveAsignature = useCallback(
    async (updatedData) => {
      if (!selectedAsignature || !selectedSede) {
        notify.error("Datos de asignatura no disponibles.");
        return;
      }

      try {
        const asignaturaId =
          selectedAsignature.id_asignatura || selectedAsignature.id;

        await updateAssignature(
          Number(selectedSede),
          Number(asignaturaId),
          updatedData,
        );

        notify.success("Asignatura actualizada exitosamente.");
        setIsEditModalOpen(false);
        setSelectedAsignature(null);
        fetchAsignatures();
      } catch (err) {
        console.error("Error al actualizar asignatura:", err);
        notify.error(err?.message || "Error al actualizar asignatura.");
      }
    },
    [
      selectedAsignature,
      selectedSede,
      updateAssignature,
      notify,
      fetchAsignatures,
    ],
  );

  // Define las columnas para la tabla
  const columns = useMemo(
    () => [
      {
        accessorKey: "id_asignatura",
        header: "ID",
        meta: {
          hideOnMD: true,
        },
      },
      {
        accessorKey: "nombre_asignatura",
        header: "Nombre",
      },
      {
        accessorKey: "codigo_asignatura",
        header: "Código",
        meta: {
          hideOnXL: true,
        },
      },
      {
        accessorKey: "nombre_jornada",
        header: "Jornada",
        meta: {
          hideOnLG: true,
        },
      },
      {
        accessorKey: "descripcion",
        header: "Descripción",
        meta: {
          hideOnXL: true,
        },
      },
      {
        accessorKey: "estado_grade_asignature",
        header: "Estado",
        meta: {
          hideOnXL: true,
        },
      },
      {
        accessorKey: "grados",
        header: "Grados",
        meta: {
          hideOnXL: true,
        },
      },
      {
        id: "actions",
        header: "Acciones",
        cell: ({ row }) => (
          <div className="w-full h-full flex items-stretch gap-2 p-2">
            <SimpleButton
              className="h-full"
              onClick={() => handleEditAsignature(row.original)}
              icon="Pencil"
              bg="bg-secondary"
              text="text-surface"
              noRounded={false}
              msjtooltip="Editar"
            />
          </div>
        ),
      },
    ],
    [handleEditAsignature],
  );

  return (
    <div className="p-6 h-full gap-4 flex flex-col">
      <div
        id="tour-ma-header"
        className="w-full grid gap-2 grid-cols-1 lg:grid-cols-5 xl:grid-cols-4 justify-between items-center bg-primary text-surface p-3 rounded-lg"
      >
        <div className=" lg:col-span-3 xl:col-span-2 flex items-center">
          <h2 className="text-2xl font-bold">Gestión de Asignaturas</h2>
        </div>
        <div
          id="tour-ma-add-btn"
          className=" grid grid-cols-2 col-span-2 xl:col-span-2 gap-2"
        >
          <SimpleButton
            onClick={() => setIsAddOpen(true)}
            msj="Registrar asignatura"
            icon="Plus"
            bg="bg-secondary"
            text="text-surface"
            noRounded={false}
          />
          <SimpleButton
            type="button"
            onClick={tourManageAsignature}
            icon="HelpCircle"
            msjtooltip="Iniciar tutorial"
            noRounded={false}
            bg="bg-info"
            text="text-surface"
            className="w-auto px-3 py-1.5"
          />
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-surface p-4 rounded-lg shadow grid grid-cols-1 md:grid-cols-2 gap-4">
        <div id="tour-ma-sede">
          <SedeSelect
            value={selectedSede}
            onChange={(e) => setSelectedSede(e.target.value)}
            className="bg-surface rounded-sm p-2 border border-gray-300 w-full focus:outline-none focus:ring-2 focus:ring-secondary"
          />
        </div>
        <div id="tour-ma-jornada">
          <JourneySelect
            value={selectedJornada}
            onChange={(e) => setSelectedJornada(e.target.value)}
            className="bg-surface rounded-sm p-2 border border-gray-300 w-full focus:outline-none focus:ring-2 focus:ring-secondary"
            filterValue={sedeWorkday}
          />
        </div>
      </div>

      <div id="tour-ma-table" className="relative flex-1 p-4">
        {!selectedSede || !selectedJornada ? (
          <div className="text-center py-8 text-gray-500">
            Selecciona una sede y jornada para ver las asignaturas
          </div>
        ) : (
          <DataTable
            key="asignatures-table"
            data={tableData || []}
            columns={columns}
            fileName="Export_Asignatures"
            showDownloadButtons={false}
            loading={isFetching}
            loaderMessage="Cargando asignaturas..."
          />
        )}

        {fetchError && (
          <div className="mt-4 text-center text-red-600">
            Error al cargar asignaturas: {fetchError}
          </div>
        )}

        {/* Modal Agregar */}
        <Modal
          isOpen={isAddOpen}
          onClose={() => setIsAddOpen(false)}
          title="Registrar asignatura"
          size="screen-2xl"
        >
          <RegisterAsignature
            onSuccess={() => {
              setIsAddOpen(false);
              fetchAsignatures();
            }}
          />
        </Modal>

        {/* Modal Editar */}
        <Modal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedAsignature(null);
          }}
          title="Editar asignatura"
          size="screen-2xl"
        >
          {selectedAsignature && (
            <ProfileAssignature
              data={selectedAsignature}
              onSave={async (payload) => {
                await handleSaveAsignature(payload);
              }}
              initialEditing={false}
            />
          )}
        </Modal>
      </div>
    </div>
  );
};

export default ManageAsignature;
