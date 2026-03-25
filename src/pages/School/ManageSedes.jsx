import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import useAuth from "../../lib/hooks/useAuth";
import useData from "../../lib/hooks/useData";
import useSchool from "../../lib/hooks/useSchool";
import DataTable from "../../components/atoms/DataTable";
import SimpleButton from "../../components/atoms/SimpleButton";
import SedeModal from "../../components/molecules/SedeModal";
import Modal from "../../components/atoms/Modal";
import RegisterSede from "../../components/molecules/RegisterSede";
import { useNotify } from "../../lib/hooks/useNotify";

const ManageSedes = () => {
  const { idInstitution } = useAuth();
  const { loadInstitutionSedes, loadingInstitutionSedes } = useData();
  const notify = useNotify();

  const [sedes, setSedes] = useState([]);
  const [tableData, setTableData] = useState([]);
  const [selectedSede, setSelectedSede] = useState(null);
  const [fetchError, setFetchError] = useState(null);
  const prevSedesRef = useRef([]);
  const hasFetchedRef = useRef(false);
  const lastResponseRef = useRef(null);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [initialEditing, setInitialEditing] = useState(false);
  // Función para abrir el modal con los datos de la sede
  const { getDataSede, updateSede } = useSchool();
  // Helper: compara sedes por id para evitar setState innecesarios
  const sedesEqual = (a = [], b = []) => {
    if (a === b) return true;
    if (!Array.isArray(a) || !Array.isArray(b)) return false;
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
      const ai = a[i];
      const bi = b[i];
      if (!bi) return false;
      if (ai.id !== bi.id) return false;
    }
    return true;
  };

  // Cargar las sedes al montar el componente
  const fetchSedesData = async () => {
    setIsFetching(true);
    try {
      setFetchError(null);

      if (!idInstitution) {
        setIsFetching(false);
        return;
      }

      const response = await loadInstitutionSedes(idInstitution);

      // Guardar la respuesta cruda para depuración
      lastResponseRef.current = response;

      const newSedes = Array.isArray(response)
        ? response
        : (response?.data ?? []);

      // Actualizar tableData primero para asegurar que DataTable reciba los datos
      prevSedesRef.current = newSedes;
      setTableData(newSedes);

      setSedes(newSedes);
      hasFetchedRef.current = true;
    } catch (error) {
      console.error("Error al cargar sedes:", error);
      setFetchError(error?.message || String(error));
      hasFetchedRef.current = false;
    } finally {
      setIsFetching(false);
    }
  };

  useEffect(() => {
    let mounted = true;

    // Cargar al montar (misma estructura que ManageStudent/ManageTeacher)
    fetchSedesData();

    return () => {
      mounted = false;
    };
  }, [idInstitution, loadInstitutionSedes]);

  const handleViewSede = useCallback(
    async (sede) => {
      setSelectedSede(null);
      setInitialEditing(false);
      setIsModalOpen(true);

      try {
        const payload = {
          idInstitution: idInstitution,
          idSede: sede.id ?? sede.id_sede,
        };
        const res = await getDataSede(payload);

        // Extraer primer elemento si viene en array o en data:[]
        const fetched = Array.isArray(res)
          ? res[0]
          : Array.isArray(res?.data)
            ? res.data[0]
            : res;

        // Mergear campos básicos (id, fk_institucion)
        const merged = { ...sede, ...fetched };
        setSelectedSede(merged);
      } catch (err) {
        console.error("Error al obtener datos de sede:", err);
      }
    },
    [getDataSede, idInstitution],
  );

  const handleEditSede = useCallback(
    async (sede) => {
      setSelectedSede(null);
      setInitialEditing(true);
      setIsModalOpen(true);
      console.log("Editing sede:", sede);
      try {
        const payload = {
          idInstitution: idInstitution,
          idSede: sede.id ?? sede.id_sede,
        };
        const res = await getDataSede(payload);

        const fetched = Array.isArray(res)
          ? res[0]
          : Array.isArray(res?.data)
            ? res.data[0]
            : res;

        const merged = { ...sede, ...fetched };
        setSelectedSede(merged);
      } catch (err) {
        console.error("Error al obtener datos de sede:", err);
      }
    },
    [getDataSede, idInstitution],
  );

  // Define las columnas para la tabla
  const columns = useMemo(
    () => [
      {
        accessorKey: "id",
        header: "ID Sede",
        meta: {
          hideOnSM: true,
        },
      },
      {
        accessorKey: "nombre",
        header: "Nombre Sede",
      },
      {
        accessorKey: "name_workday",
        header: "Jornada",
        meta: {
          hideOnLG: true,
        },
      },
      {
        accessorKey: "fk_institucion",
        header: "ID Institución",
        meta: {
          hideOnSM: true,
        },
      },
      {
        id: "actions",
        header: "Acciones",
        cell: ({ row }) => (
          <div className="w-full h-full flex items-stretch gap-2 p-2">
            <SimpleButton
              className="h-full"
              onClick={() => handleViewSede(row.original)}
              icon="Eye"
              bg="bg-secondary"
              text="text-surface"
              noRounded={false}
              msjtooltip="Ver detalles"
            />
            <SimpleButton
              className="h-full"
              onClick={() => handleEditSede(row.original)}
              icon="Pencil"
              bg="bg-secondary"
              text="text-surface"
              noRounded={false}
              msjtooltip="Editar sede"
            />
          </div>
        ),
      },
    ],
    [handleViewSede, handleEditSede],
  );

  return (
    <div className=" p-6  h-full gap-4 flex flex-col">
      <div className="w-full flex justify-between items-center bg-primary text-surface p-3 rounded-lg">
        <h2 className="text-2xl font-bold">Datos de Sedes</h2>
        <div className="w-56">
          <SimpleButton
            onClick={() => setIsAddOpen(true)}
            msj="Agregar sede"
            icon="Plus"
            bg="bg-secondary"
            text="text-surface"
            noRounded={false}
          />
        </div>
      </div>

      <div className="relative flex-1 p-4">
        <DataTable
          key="sedes-table"
          data={tableData || []}
          columns={columns}
          fileName="Export_Sedes"
          mode="Sede"
          showDownloadButtons={false}
          loading={isFetching}
          loaderMessage="Cargando sedes..."
        />

        {fetchError && (
          <div className="mt-4 text-center text-red-600">
            Error al cargar sedes: {fetchError}
          </div>
        )}
      </div>

      {/* Modal para ver/editar sede */}
      <SedeModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        sede={selectedSede}
        initialEditing={initialEditing}
        onSave={async (id, updated) => {
          try {
            const saved = await updateSede(idInstitution, id, updated);

            const newRow =
              saved && typeof saved === "object" ? saved : { ...updated };

            // Actualizar tabla con los datos devueltos por el backend
            setTableData((prev) =>
              (prev || []).map((row) =>
                row.id === id ? { ...row, ...newRow } : row,
              ),
            );
            setSedes((prev) =>
              (prev || []).map((s) => (s.id === id ? { ...s, ...newRow } : s)),
            );

            notify.success("Sede actualizada exitosamente");
            setIsModalOpen(false);
          } catch (err) {
            console.error("Error al guardar sede:", err);
            notify.error(err?.message || "Error al actualizar la sede");
          }
        }}
      />

      {/* Modal para agregar sede */}
      <Modal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title="Agregar sede(s)"
        size="7xl"
      >
        <div className="p-4">
          <RegisterSede
            onSuccess={() => {
              setIsAddOpen(false);
              fetchSedesData();
            }}
          />
        </div>
      </Modal>
    </div>
  );
};

export default ManageSedes;
