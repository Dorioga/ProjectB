import { useState, useMemo, useEffect, useCallback } from "react";
import useSchool from "../../lib/hooks/useSchool";
import useAuth from "../../lib/hooks/useAuth";
import useData from "../../lib/hooks/useData";
import DataTable from "../../components/atoms/DataTable";
import SimpleButton from "../../components/atoms/SimpleButton";
import Modal from "../../components/atoms/Modal";
import RegisterGrade from "./RegisterGrade";
import JourneySelect from "../../components/atoms/JourneySelect";
import SedeSelect from "../../components/atoms/SedeSelect";
import { useNotify } from "../../lib/hooks/useNotify";
import ProfileGrade from "../../components/molecules/ProfileGrade";

const ManageGrade = () => {
  const { idSede: authIdSede } = useAuth();
  const { getGradeSede, updateGrado } = useSchool();
  const { institutionSedes } = useData();
  const notify = useNotify();

  const [tableData, setTableData] = useState([]);
  const [fetchError, setFetchError] = useState(null);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedGrade, setSelectedGrade] = useState(null);

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
    if (sedeWorkday === "3") return;
    setSelectedJornada(sedeWorkday);
  }, [sedeWorkday]);

  // Cargar grados
  const fetchGrades = useCallback(async () => {
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

      console.log("ManageGrade - llamando getGradeSede con:", payload);
      const response = await getGradeSede(payload);

      const grados = Array.isArray(response)
        ? response
        : (response?.data ?? []);

      console.log("ManageGrade - grados recibidos:", grados);
      setTableData(grados);
    } catch (error) {
      console.error("Error al cargar grados:", error);
      setFetchError(error?.message || String(error));
      setTableData([]);
    } finally {
      setIsFetching(false);
    }
  }, [selectedSede, selectedJornada, getGradeSede]);

  useEffect(() => {
    fetchGrades();
  }, [fetchGrades]);

  // Abrir modal de edición
  const handleEditGrade = useCallback((grade) => {
    setSelectedGrade(grade);
    setIsEditModalOpen(true);
  }, []);

  // Guardar cambios de grado
  const handleSaveGrade = useCallback(
    async (updatedData) => {
      if (!selectedGrade || !selectedSede) {
        notify.error("Datos del grado no disponibles.");
        return;
      }

      try {
        const gradoId = selectedGrade.id_grado || selectedGrade.id;

        await updateGrado(Number(selectedSede), Number(gradoId), updatedData);

        notify.success("Grado actualizado exitosamente.");
        setIsEditModalOpen(false);
        setSelectedGrade(null);
        fetchGrades();
      } catch (err) {
        console.error("Error al actualizar grado:", err);
        notify.error(err?.message || "Error al actualizar grado.");
      }
    },
    [selectedGrade, selectedSede, updateGrado, notify, fetchGrades],
  );

  // Columnas de la tabla
  const columns = useMemo(
    () => [
      {
        accessorKey: "nombre_grado",
        header: "Nombre",
      },
      {
        accessorKey: "grupo",
        header: "Grupo",
        meta: { hideOnLG: true },
      },
      {
        accessorKey: "estado",
        header: "Estado",
        meta: { hideOnLG: true },
      },
      {
        id: "actions",
        header: "Acciones",
        cell: ({ row }) => (
          <div className="w-full h-full flex items-stretch gap-2 p-2">
            <SimpleButton
              className="h-full"
              onClick={() => handleEditGrade(row.original)}
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
    [handleEditGrade],
  );

  return (
    <div className="p-6 h-full gap-4 flex flex-col">
      <div className="w-full grid grid-cols-5 justify-between items-center bg-primary text-surface p-3 rounded-t-lg">
        <h2 className="text-2xl col-span-4 font-bold">Gestión de Grados</h2>
        <SimpleButton
          onClick={() => setIsAddOpen(true)}
          msj="Agregar grado"
          icon="Plus"
          bg="bg-accent"
          text="text-surface"
          noRounded={false}
        />
      </div>

      {/* Filtros */}
      <div className="bg-surface p-4 rounded-lg shadow grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <SedeSelect
            value={selectedSede}
            onChange={(e) => setSelectedSede(e.target.value)}
            className="bg-surface rounded-sm p-2 border border-gray-300 w-full focus:outline-none focus:ring-2 focus:ring-secondary"
          />
        </div>
        <div>
          <JourneySelect
            value={selectedJornada}
            onChange={(e) => setSelectedJornada(e.target.value)}
            className="bg-surface rounded-sm p-2 border border-gray-300 w-full focus:outline-none focus:ring-2 focus:ring-secondary"
            filterValue={sedeWorkday}
          />
        </div>
      </div>

      <div className="relative flex-1 p-4">
        {!selectedSede || !selectedJornada ? (
          <div className="text-center py-8 text-gray-500">
            Selecciona una sede y jornada para ver los grados
          </div>
        ) : (
          <DataTable
            key="grades-table"
            data={tableData || []}
            columns={columns}
            fileName="Export_Grades"
            showDownloadButtons={false}
          />
        )}

        {isFetching && (
          <div className="absolute inset-0 flex items-center justify-center bg-surface/60 z-10">
            <div className="text-center py-8 bg-transparent">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2" />
              <div className="text-sm font-medium text-primary">
                Cargando grados...
              </div>
            </div>
          </div>
        )}

        {fetchError && (
          <div className="mt-4 text-center text-red-600">
            Error al cargar grados: {fetchError}
          </div>
        )}

        {/* Modal Agregar */}
        <Modal
          isOpen={isAddOpen}
          onClose={() => setIsAddOpen(false)}
          title="Agregar grado"
          size="6xl"
        >
          <RegisterGrade
            onSuccess={() => {
              setIsAddOpen(false);
              fetchGrades();
            }}
          />
        </Modal>

        {/* Modal Editar */}
        <Modal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedGrade(null);
          }}
          title="Editar grado"
          size="4xl"
        >
          {selectedGrade && (
            <ProfileGrade
              data={selectedGrade}
              onSave={async (payload) => {
                await handleSaveGrade(payload);
              }}
              initialEditing={false}
            />
          )}
        </Modal>
      </div>
    </div>
  );
};

export default ManageGrade;
