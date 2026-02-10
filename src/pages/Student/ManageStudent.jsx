import { useState, useMemo, useEffect, useCallback } from "react";
import useSchool from "../../lib/hooks/useSchool";
import useAuth from "../../lib/hooks/useAuth";
import DataTable from "../../components/atoms/DataTable";
import SimpleButton from "../../components/atoms/SimpleButton";
import Modal from "../../components/atoms/Modal";
import RegisterStudent from "./RegisterStudent";
import StudentModal from "../../components/molecules/StudentModal";
import useStudent from "../../lib/hooks/useStudent";
import { useNotify } from "../../lib/hooks/useNotify";

const ManageStudent = () => {
  const { idInstitution, idSede } = useAuth();
  const { fetchAllStudents } = useSchool();
  const { updateStudent, getStudent } = useStudent();
  const notify = useNotify();

  const [tableData, setTableData] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [fetchError, setFetchError] = useState(null);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [initialEditing, setInitialEditing] = useState(false);
  const [isFetching, setIsFetching] = useState(false);

  // Cargar estudiantes - memoizado para evitar recreación en cada render
  const fetchStudentsData = useCallback(async () => {
    if (!idInstitution) return;

    setIsFetching(true);
    setFetchError(null);

    try {
      const response = await fetchAllStudents({ institucion: idInstitution });
      const students = Array.isArray(response)
        ? response
        : (response?.data ?? []);
      setTableData(students);
    } catch (error) {
      console.error("Error al cargar estudiantes:", error);
      setFetchError(error?.message || String(error));
    } finally {
      setIsFetching(false);
    }
  }, [idInstitution, fetchAllStudents]);

  useEffect(() => {
    fetchStudentsData();
  }, [fetchStudentsData]);

  // Abrir modal (ver o editar) y cargar datos del estudiante
  const openStudentModal = useCallback(
    async (student, editing = false) => {
      setInitialEditing(Boolean(editing));
      setIsFetching(true);

      try {
        const studentId = Number(
          student?.id_estudiante ?? student?.id_student ?? student?.id,
        );
        const sedeId = Number(
          student?.id_sede ??
            student?.fk_sede ??
            student?.sede_id ??
            idSede ??
            0,
        );

        if (!studentId) {
          console.warn("ManageStudent: id_estudiante no disponible:", student);
          setSelectedStudent(student);
          setIsModalOpen(true);
          return;
        }

        const detailed = await getStudent({
          id_estudiante: studentId,
          fk_sede: sedeId,
        });

        // Combinar información de la fila con los detalles del backend
        const combinedData = {
          ...student, // Información escolar de la fila
          ...detailed, // Detalles completos del backend (sobrescribe si hay duplicados)
        };

        setSelectedStudent(combinedData);

        setIsModalOpen(true);
      } catch (err) {
        console.error("Error al obtener detalles del estudiante:", err);
        notify.error(
          err?.message || "Error al obtener detalles del estudiante.",
        );
        setSelectedStudent(student);
        setIsModalOpen(true);
      } finally {
        setIsFetching(false);
      }
    },
    [getStudent, notify, idSede],
  );

  const handleViewProfile = useCallback(
    (s) => openStudentModal(s, false),
    [openStudentModal],
  );
  const handleEditStudent = useCallback(
    (s) => openStudentModal(s, true),
    [openStudentModal],
  );

  // Define las columnas para la tabla
  const columns = useMemo(
    () => [
      {
        accessorKey: "id_estudiante",
        header: "ID Estudiante",
        meta: {
          hideOnSM: true,
        },
      },
      {
        accessorKey: "nombre",
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
        accessorKey: "nombre_grado",
        header: "Grado",
        meta: {
          hideOnLG: true,
        },
      },
      {
        accessorKey: "grupo",
        header: "Grupo",
        meta: {
          hideOnLG: true,
        },
      },
      {
        accessorKey: "nombre_jornada_estudiante",
        header: "Jornada",
        meta: {
          hideOnLG: true,
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
              bg="bg-primary"
              text="text-surface"
              noRounded={false}
              msjtooltip="Ver perfil"
            />
            <SimpleButton
              className="h-full"
              onClick={() => handleEditStudent(row.original)}
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
    [handleViewProfile, handleEditStudent],
  );

  return (
    <div className="border rounded-lg bg-bg h-full gap-4 flex flex-col">
      <div className="w-full flex justify-between items-center bg-primary text-surface p-3 rounded-t-lg">
        <h2 className="text-2xl font-bold">Datos de Estudiantes</h2>
        <div className="w-56">
          <SimpleButton
            onClick={() => setIsAddOpen(true)}
            msj="Agregar estudiante"
            icon="Plus"
            bg="bg-accent"
            text="text-surface"
            noRounded={false}
          />
        </div>
      </div>
      <div className="relative flex-1 p-4">
        <DataTable
          key="students-table"
          data={tableData || []}
          columns={columns}
          fileName="Export_Students"
          mode="Student"
          showDownloadButtons={false}
        />

        {isFetching && (
          <div className="absolute inset-0 flex items-center justify-center bg-surface/60 z-10">
            <div className="text-center py-8 bg-transparent">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2" />
              <div className="text-sm font-medium text-primary">
                Cargando estudiantes...
              </div>
            </div>
          </div>
        )}

        {fetchError && (
          <div className="mt-4 text-center text-red-600">
            Error al cargar estudiantes: {fetchError}
          </div>
        )}

        <Modal
          isOpen={isAddOpen}
          onClose={() => setIsAddOpen(false)}
          title="Agregar estudiante"
          size="4xl"
        >
          <RegisterStudent
            onSuccess={() => {
              setIsAddOpen(false);
              fetchStudentsData();
            }}
          />
        </Modal>

        <StudentModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          student={selectedStudent}
          initialEditing={initialEditing}
          isLoading={isFetching}
          onSave={async (studentId, personId, updatedData) => {
            try {
              await updateStudent(studentId, personId, updatedData);
              notify.success("Estudiante actualizado exitosamente.");
              setIsModalOpen(false);
              fetchStudentsData();
            } catch (err) {
              console.error("Error al actualizar estudiante:", err);
              notify.error(err?.message || "Error al actualizar estudiante.");
            }
          }}
        />
      </div>
    </div>
  );
};

export default ManageStudent;
