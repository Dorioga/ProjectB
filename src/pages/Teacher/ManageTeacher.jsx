import { useState, useMemo, useEffect } from "react";
import useSchool from "../../lib/hooks/useSchool";
import useAuth from "../../lib/hooks/useAuth";
import DataTable from "../../components/atoms/DataTable";
import AlertTable from "../../components/molecules/AlertTable";
import { alertsResponse } from "../../services/DataExamples/alertsResponse";
import SimpleButton from "../../components/atoms/SimpleButton";

const ManageTeacher = () => {
  const { idInstitution } = useAuth();
  const { fetchAllTeachers, loading } = useSchool();
  const alerts = alertsResponse;

  const [teachers, setTeachers] = useState([]);
  const [selectedTeacher, setSelectedTeacher] = useState(null);

  // Cargar los profesores al montar el componente
  useEffect(() => {
    const loadTeachers = async () => {
      try {
        if (idInstitution) {
          const payload = { institucion: idInstitution };
          const response = await fetchAllTeachers(payload);
          setTeachers(
            Array.isArray(response) ? response : (response?.data ?? []),
          );
        }
      } catch (error) {
        console.error("Error al cargar profesores:", error);
      }
    };

    loadTeachers();
  }, [idInstitution, fetchAllTeachers]);

  // Función para abrir el modal con los datos del profesor
  const handleViewProfile = (teacher) => {
    setSelectedTeacher(teacher);
    // Aquí puedes agregar lógica para abrir un modal si es necesario
  };

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
          <div className="w-full h-full flex">
            <SimpleButton
              onClick={() => handleViewProfile(row.original)}
              msj="Ver Perfil"
              icon="User"
              bg="bg-primary"
              text="text-white"
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
      <div className="w-full flex justify-between items-center bg-primary text-white p-3 rounded-t-lg">
        <h2 className="text-2xl font-bold">Datos de Profesores</h2>
      </div>
      {loading ? (
        <div className="text-center py-8">Cargando profesores...</div>
      ) : (
        <DataTable
          data={teachers}
          columns={columns}
          fileName="Export_Teachers"
          mode="Teacher"
        />
      )}
    </div>
  );
};

export default ManageTeacher;
