import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import useSchool from "../../lib/hooks/useSchool";
import useAuth from "../../lib/hooks/useAuth";
import { mapTeacherRowsToProcessed } from "../../utils/teacherUtils";
import DataTable from "../../components/atoms/DataTable";
import AlertTable from "../../components/molecules/AlertTable";
import { alertsResponse } from "../../services/DataExamples/alertsResponse";
import SimpleButton from "../../components/atoms/SimpleButton";
import Modal from "../../components/atoms/Modal";
import RegisterTeacher from "./RegisterTeacher";
import TeacherModal from "../../components/molecules/TeacherModal";
import { useNotify } from "../../lib/hooks/useNotify";

const ManageTeacher = () => {
  const { idInstitution } = useAuth();
  const { fetchAllTeachers, loading, updateTeacher, getDataTeacher } =
    useSchool();
  const alerts = alertsResponse;

  const [teachers, setTeachers] = useState([]);
  const [tableData, setTableData] = useState([]); // datos concretos que pasaremos a DataTable
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [fetchError, setFetchError] = useState(null);
  const prevTeachersRef = useRef([]);
  const hasFetchedRef = useRef(false); // evita múltiples llamadas al servicio
  const lastResponseRef = useRef(null); // para depuración: guarda la última respuesta cruda
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [initialEditing, setInitialEditing] = useState(false);
  const [selectedTeacherForModal, setSelectedTeacherForModal] = useState(null);
  const notify = useNotify();

  // Cargar los profesores al montar el componente (solo una llamada)
  // Extraer la lógica de carga en una función reutilizable para poder invocarla desde fuera (p.ej. al crear un docente)
  const fetchTeachersData = async () => {
    try {
      setFetchError(null);

      if (!idInstitution) {
        return;
      }

      const payload = { institucion: idInstitution };
      console.log("Cargando profesores con payload:", payload);
      const response = await fetchAllTeachers(payload);

      // Guardar la respuesta cruda también para depuración
      lastResponseRef.current = response;

      const newTeachers = Array.isArray(response)
        ? response
        : (response?.data ?? []);

      // Actualizar el state: actualizar primero `tableData` para que `DataTable` reciba los datos inmediatamente
      prevTeachersRef.current = newTeachers;
      setTableData(newTeachers);

      setTeachers(newTeachers);
      hasFetchedRef.current = true;
    } catch (error) {
      console.error("Error al cargar profesores:", error);
      setFetchError(error?.message || String(error));
      // Permitir reintento en caso de error
      hasFetchedRef.current = false;
    }
  };

  useEffect(() => {
    let mounted = true;
    // cargar al montar
    fetchTeachersData();

    return () => {
      mounted = false;
    };
  }, [idInstitution, fetchAllTeachers]);

  // Abrir modal (ver o editar) y cargar datos del docente
  const openTeacherModal = useCallback(
    async (teacher, editing = false) => {
      try {
        setIsFetching(true);
        const payload = {
          id_docente: Number(teacher?.id_docente),
          fk_sede: Number(
            teacher?.id_sede ?? teacher?.idSede ?? teacher?.id_sede,
          ),
        };

        const res = await getDataTeacher(payload);
        console.log("ManageTeacher getDataTeacher response:", res);

        let processed;
        // Si getDataTeacher ya devolvió la estructura procesada, úsala tal cual
        if (res && typeof res === "object" && (res.basic || res.subjects)) {
          processed = res;
        } else {
          const rawData = Array.isArray(res) ? res : (res?.data ?? res);
          processed = mapTeacherRowsToProcessed(rawData, teacher);
        }

        setSelectedTeacher(teacher);
        setSelectedTeacherForModal(processed);
        setInitialEditing(Boolean(editing));
        setIsModalOpen(true);
      } catch (err) {
        console.error("Error fetching teacher details:", err);
        notify.error(err?.message || "Error al obtener datos del docente");
      } finally {
        setIsFetching(false);
      }
    },
    [getDataTeacher, notify],
  );

  const handleViewProfile = useCallback(
    (t) => openTeacherModal(t, false),
    [openTeacherModal],
  );
  const handleEditTeacher = useCallback(
    (t) => openTeacherModal(t, true),
    [openTeacherModal],
  );

  // Define las columnas para la tabla
  const columns = useMemo(
    () => [
      {
        accessorKey: "id_docente",
        header: "ID Docente",
        meta: {
          hideOnSM: true,
        },
      },
      {
        accessorKey: "nombre_docente",
        header: "Nombre Completo",
      },
      {
        accessorKey: "nombre_sede",
        header: "Sede",
        meta: {
          hideOnLG: true,
        },
      },
      {
        accessorKey: "estado",
        header: "Estado",
        meta: {
          hideOnLG: true,
        },
      },

      {
        accessorKey: "grados",
        header: "Grados Asignados",
        meta: {
          hideOnLG: true,
        },
      },
      {
        accessorKey: "grupos",
        header: "Grupos Asignados",
        meta: {
          hideOnLG: true,
        },
        cell: ({ row }) => {
          const val = row.original.grupos ?? row.original.grupo ?? "";
          const parts = String(val || "")
            .split(",")
            .map((p) => p.trim())
            .filter(Boolean);
          if (parts.length === 0) return null;
          return (
            <div className="flex flex-col items-start gap-0">
              {parts.map((p, i) => (
                <div key={i} className="text-left text-sm">
                  - {p}
                </div>
              ))}
            </div>
          );
        },
      },
      {
        accessorKey: "asignaturas",
        header: "Asignaturas",
        meta: {
          hideOnLG: true,
        },
        cell: ({ row }) => {
          const val =
            row.original.asignaturas ?? row.original.nombre_asignatura ?? "";
          const parts = String(val || "")
            .split(",")
            .map((p) => p.trim())
            .filter(Boolean);
          if (parts.length === 0) return null;
          return (
            <div className="flex flex-col items-start gap-0">
              {parts.map((p, i) => (
                <div key={i} className="text-left text-sm">
                  - {p}
                </div>
              ))}
            </div>
          );
        },
      },

      {
        id: "actions",
        header: "Acciones",
        cell: ({ row }) => (
          <div className="w-full h-full flex items-stretch ">
            <SimpleButton
              className="h-full"
              onClick={() => handleViewProfile(row.original)}
              icon="UserSearch"
              bg="bg-primary"
              text="text-surface"
              noRounded={true}
              msjtooltip="Ver perfil"
            />
            <SimpleButton
              className="h-full"
              onClick={() => handleEditTeacher(row.original)}
              icon="Pencil"
              bg="bg-secondary"
              text="text-surface"
              noRounded={true}
              msjtooltip="Actualizar"
            />
          </div>
        ),
      },
    ],
    [handleViewProfile, handleEditTeacher],
  );

  return (
    <div className="border p-6 rounded bg-bg h-full gap-4 flex flex-col">
      <div className="w-full flex justify-between items-center bg-primary text-surface p-3 rounded-t-lg">
        <h2 className="text-2xl font-bold">Datos de Profesores</h2>
        <div className="w-56">
          <SimpleButton
            onClick={() => setIsAddOpen(true)}
            msj="Agregar docente"
            icon="Plus"
            bg="bg-accent"
            text="text-surface"
            noRounded={false}
          />
        </div>
      </div>

      {/* Mantener la tabla montada siempre para evitar parpadeos. Mostrar un overlay mientras carga. */}
      <div className="relative flex-1">
        <DataTable
          key="teachers-table"
          data={tableData || []}
          columns={columns}
          fileName="Export_Teachers"
          mode="Teacher"
          showDownloadButtons={false}
        />

        {isFetching && (
          <div className="absolute inset-0 flex items-center justify-center bg-surface/60 z-10">
            <div className="text-center py-8 bg-transparent">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2" />
              <div className="text-sm font-medium text-primary">
                Cargando profesores...
              </div>
            </div>
          </div>
        )}

        {fetchError && (
          <div className="mt-4 text-center text-red-600">
            Error al cargar profesores: {fetchError}
          </div>
        )}

        <Modal
          isOpen={isAddOpen}
          onClose={() => setIsAddOpen(false)}
          title="Agregar docente"
          size="4xl"
        >
          <RegisterTeacher
            onSuccess={(result) => {
              // cerrar modal y refrescar la tabla
              setIsAddOpen(false);
              fetchTeachersData();
            }}
          />
        </Modal>

        {/* Modal para ver/editar docente */}
        <TeacherModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          teacher={selectedTeacherForModal}
          initialEditing={initialEditing}
          onSave={async (id, payload) => {
            try {
              await updateTeacher(id, payload);
              setIsModalOpen(false);
              fetchTeachersData();
              notify.success("Docente actualizado exitosamente");
            } catch (err) {
              notify.error(err?.message || "Error al actualizar docente");
            }
          }}
        />

        {/* Debug UI: mostrar cuantos registros hay en state */}
        <div className="mt-3">
          <div className="text-sm text-gray-700">
            Registros en state: <strong>{teachers.length}</strong>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManageTeacher;
