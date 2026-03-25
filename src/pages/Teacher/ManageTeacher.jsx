import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import useSchool from "../../lib/hooks/useSchool";
import useTeacher from "../../lib/hooks/useTeacher";
import useAuth from "../../lib/hooks/useAuth";
import { mapTeacherRowsToProcessed } from "../../utils/teacherUtils";
import DataTable from "../../components/atoms/DataTable";
import SimpleButton from "../../components/atoms/SimpleButton";
import Modal from "../../components/atoms/Modal";
import RegisterTeacher from "./RegisterTeacher";
import TeacherModal from "../../components/molecules/TeacherModal";
import { useNotify } from "../../lib/hooks/useNotify";

const ManageTeacher = () => {
  const { idInstitution } = useAuth();
  const { loading } = useSchool();
  const { fetchAllTeachers, updateTeacher, getDataTeacher } = useTeacher();

  const [teachers, setTeachers] = useState([]);
  const [tableData, setTableData] = useState([]); // datos concretos que pasaremos a DataTable
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const prevTeachersRef = useRef([]);
  const hasFetchedRef = useRef(false); // evita múltiples llamadas al servicio
  const lastResponseRef = useRef(null); // para depuración: guarda la última respuesta cruda
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [isTableLoading, setIsTableLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [initialEditing, setInitialEditing] = useState(false);
  const [selectedTeacherForModal, setSelectedTeacherForModal] = useState(null);
  const notify = useNotify();

  // Cargar los docentes al montar el componente (solo una llamada)
  // Extraer la lógica de carga en una función reutilizable para poder invocarla desde fuera (p.ej. al crear un docente)
  const fetchTeachersData = async () => {
    try {
      setIsTableLoading(true);

      console.log("ManageTeacher - idInstitution:", idInstitution);
      if (!idInstitution) {
        console.warn(
          "ManageTeacher - idInstitution no disponible; abortando fetchAllTeachers.",
        );
        notify.error("No hay idInstitution — revisa la sesión de usuario.");
        setIsTableLoading(false);
        return;
      }

      const payload = { institucion: idInstitution };
      console.log("Cargando docentes con payload:", payload);
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
      console.error("Error al cargar docentes:", error);
      notify.error(error?.message || "Error al cargar docentes");
      // Permitir reintento en caso de error
      hasFetchedRef.current = false;
    } finally {
      setIsTableLoading(false);
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

        // If processed doesn't include director_of_grade but the table row has it, preserve it
        if (!processed?.director_of_grade && teacher?.director_of_grade) {
          processed = {
            ...processed,
            director_of_grade: teacher.director_of_grade,
          };
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
          hideOnXL: true,
        },
      },
      {
        accessorKey: "estado",
        header: "Estado",
        meta: {
          hideOnXL: true,
        },
      },

      {
        accessorKey: "grado_grupo",
        header: "Grados Asignados",
        meta: {
          hideOnLG: true,
        },
        cell: ({ row }) => {
          const val = row.original.grado_grupo ?? row.original.grupo ?? "";
          const parts = String(val || "")
            .split(",")
            .map((p) => p.trim())
            .filter(Boolean);
          if (parts.length === 0) return null;
          return (
            <div className="grid grid-cols-2 2xl:grid-cols-3 items-start gap-1 p-2">
              {parts.map((p, i) => (
                <div key={i} className="text-left text-sm">
                  -{p}
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
        accessorKey: "director_of_grade",
        header: "Director de grado",
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
              onClick={() => handleViewProfile(row.original)}
              icon="UserSearch"
              bg="bg-secondary"
              text="text-surface"
              noRounded={false}
              msjtooltip="Ver perfil"
            />
            <SimpleButton
              className="h-full"
              onClick={() => handleEditTeacher(row.original)}
              icon="Pencil"
              bg="bg-secondary"
              text="text-surface"
              noRounded={false}
              msjtooltip="Actualizar"
            />
          </div>
        ),
      },
    ],
    [handleViewProfile, handleEditTeacher],
  );

  return (
    <div className=" p-6 h-full gap-4 flex flex-col">
      <div className="w-full grid sm:grid-cols-2 lg:grid-cols-5 justify-between items-center bg-primary text-surface p-3 rounded-lg">
        <h2 className="text-2xl font-bold lg:col-span-4">Datos de Docentes</h2>
        <div className="">
          <SimpleButton
            onClick={() => setIsAddOpen(true)}
            msj="Registrar docente"
            icon="Plus"
            bg="bg-secondary"
            text="text-surface"
            noRounded={false}
            disabled={isTableLoading}
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
          loading={isTableLoading || isFetching}
          loaderMessage={
            isFetching
              ? "Cargando datos del docente..."
              : "Cargando docentes..."
          }
        />

        <Modal
          isOpen={isAddOpen}
          onClose={() => setIsAddOpen(false)}
          title="Registrar docente"
          size="7xl"
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
          onClose={() => {
            setIsModalOpen(false);
            fetchTeachersData();
          }}
          teacher={selectedTeacherForModal}
          initialEditing={initialEditing}
          onSave={async (teacherId, personId, payload) => {
            try {
              await updateTeacher(teacherId, personId, payload);
              setIsModalOpen(false);
              fetchTeachersData();
              notify.success("Docente actualizado exitosamente");
            } catch (err) {
              notify.error(err?.message || "Error al actualizar docente");
            }
          }}
          onReload={async () => {
            if (selectedTeacher) {
              await openTeacherModal(selectedTeacher, initialEditing);
            }
          }}
        />
      </div>
    </div>
  );
};

export default ManageTeacher;
