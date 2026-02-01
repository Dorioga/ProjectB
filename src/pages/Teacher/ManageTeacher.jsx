import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import useSchool from "../../lib/hooks/useSchool";
import useAuth from "../../lib/hooks/useAuth";
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
  const { fetchAllTeachers, loading, updateTeacher } = useSchool();
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

  // Helper: compara por id_docente y largo para evitar setState innecesarios
  const teachersEqual = (a = [], b = []) => {
    if (a === b) return true;
    if (!Array.isArray(a) || !Array.isArray(b)) return false;
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
      const ai = a[i];
      const bi = b[i];
      if (!bi) return false;
      if (ai.id_docente !== bi.id_docente) return false;
    }
    return true;
  };

  // Cargar los profesores al montar el componente (solo una llamada)
  // Extraer la lógica de carga en una función reutilizable para poder invocarla desde fuera (p.ej. al crear un docente)
  const fetchTeachersData = async () => {
    try {
      setFetchError(null);

      if (!idInstitution) {
        return;
      }

      const payload = { institucion: idInstitution };
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

  // Función para abrir el modal con los datos del profesor
  const handleViewProfile = useCallback((teacher) => {
    setSelectedTeacher(teacher);
    setSelectedTeacherForModal(teacher);
    setInitialEditing(false);
    setIsModalOpen(true);
  }, []);

  const handleEditTeacher = useCallback((teacher) => {
    setSelectedTeacher(teacher);
    setSelectedTeacherForModal(teacher);
    setInitialEditing(true);
    setIsModalOpen(true);
  }, []);

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
        accessorKey: "nombre_jornada",
        header: "Jornada",
        meta: {
          hideOnLG: true,
        },
      },
      {
        accessorKey: "nombre_asignatura",
        header: "Asignatura",
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
    [handleViewProfile],
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
