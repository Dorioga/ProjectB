import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import useSchool from "../../lib/hooks/useSchool";
import useAuth from "../../lib/hooks/useAuth";
import DataTable from "../../components/atoms/DataTable";
import AlertTable from "../../components/molecules/AlertTable";
import { alertsResponse } from "../../services/DataExamples/alertsResponse";
import SimpleButton from "../../components/atoms/SimpleButton";
import Modal from "../../components/atoms/Modal";
import RegisterStudent from "./RegisterStudent";
import StudentModal from "../../components/molecules/StudentModal";
import useStudent from "../../lib/hooks/useStudent";
import { useNotify } from "../../lib/hooks/useNotify";

const ManageStudent = () => {
  const { idInstitution } = useAuth();
  const { fetchAllStudents, loading } = useSchool();
  const alerts = alertsResponse;

  const [students, setStudents] = useState([]);
  const [tableData, setTableData] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [fetchError, setFetchError] = useState(null);
  const prevStudentsRef = useRef([]);
  const hasFetchedRef = useRef(false);
  const lastResponseRef = useRef(null);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isFetching, setIsFetching] = useState(false);

  const { updateStudent } = useStudent();
  const notify = useNotify();

  // Cargar los estudiantes al montar el componente (una sola llamada)
  // Extraer la lógica de carga en una función reutilizable para poder invocarla desde fuera (p.ej. al crear un estudiante)
  const fetchStudentsData = async () => {
    setIsFetching(true);
    try {
      setFetchError(null);

      if (!idInstitution) return;

      const payload = { institucion: idInstitution };
      const response = await fetchAllStudents(payload);

      // Guardar respuesta cruda para depuración si hace falta
      lastResponseRef.current = response;

      const newStudents = Array.isArray(response)
        ? response
        : (response?.data ?? []);

      // Actualizar tableData primero para asegurar que DataTable reciba los datos
      prevStudentsRef.current = newStudents;
      setTableData(newStudents);

      setStudents(newStudents);
      hasFetchedRef.current = true;
    } catch (error) {
      console.error("Error al cargar estudiantes:", error);
      setFetchError(error?.message || String(error));
      hasFetchedRef.current = false; // permitir reintento
    } finally {
      setIsFetching(false);
    }
  };

  useEffect(() => {
    let mounted = true;

    if (!mounted) return;
    // Cargar al montar
    fetchStudentsData();

    return () => {
      mounted = false;
    };
  }, [idInstitution, fetchAllStudents]);

  // Función para abrir el modal con los datos del estudiante
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [initialEditing, setInitialEditing] = useState(false);

  const handleViewProfile = useCallback((student) => {
    setSelectedStudent(student);
    setInitialEditing(false);
    setIsModalOpen(true);
  }, []);

  const handleEditStudent = useCallback((student) => {
    setSelectedStudent(student);
    setInitialEditing(true);
    setIsModalOpen(true);
  }, []);

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
          <div className="w-full h-full flex ">
            <SimpleButton
              onClick={() => handleViewProfile(row.original)}
              icon="UserSearch"
              bg="bg-primary"
              text="text-surface"
              noRounded={true}
              msjtooltip="Ver perfil"
            />
            <SimpleButton
              onClick={() => handleEditStudent(row.original)}
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
            onSuccess={(result) => {
              // cerrar modal y refrescar la tabla
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
