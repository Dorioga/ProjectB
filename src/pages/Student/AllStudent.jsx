import { useState, useMemo, useEffect } from "react";
import useStudent from "../../lib/hooks/useStudent";
import DataTable from "../../components/atoms/DataTable";
import StudentModal from "../../components/molecules/StudentModal"; // 1. Importa el modal
import { User } from "lucide-react";
import AlertTable from "../../components/molecules/AlertTable";
import { alertsResponse } from "../../services/DataExamples/alertsResponse";
import SimpleButton from "../../components/atoms/SimpleButton";

const AllStudent = () => {
  const { students, loading, reload, updateStudent } = useStudent();
  const alerts = alertsResponse;
  // 2. Estados para controlar el modal y el estudiante seleccionado
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);

  useEffect(() => {
    reload();
  }, [reload]);
  // 3. Función para abrir el modal con los datos del estudiante
  const handleViewProfile = (student) => {
    setSelectedStudent(student);
    setIsModalOpen(true);
  };
  console.log(students);
  // Función para abrir el modal para crear un nuevo estudiante
  const handleCreateStudent = () => {
    setSelectedStudent(null); // Asegúrate de que no hay ningún estudiante seleccionado
    setIsModalOpen(true);
  };

  const handleSave = (identification, updatedData) => {
    updateStudent(identification, updatedData);
    //setIsModalOpen(false);
  };

  // 5. Define las columnas para la tabla, incluyendo la de "Acciones"
  const columns = useMemo(
    () => [
      {
        accessorKey: "identification",
        header: "Documento",
        meta: {
          hideOnSM: true,
        },
      },
      {
        accessorFn: (row) =>
          `${row.first_name} ${row.second_name} ${row.first_lastname} ${row.second_lastname}`,
        header: "Nombre Completo",
      },
      {
        accessorFn: (row) => `${row.grade_scholar} ${row.group_grade}`,
        header: "Grado Curso",
        meta: {
          hideOnLG: true,
        },
      },
      {
        accessorKey: "journey",
        header: "Jornada",
        meta: {
          hideOnLG: true,
        },
      },
      {
        accessorKey: "state_first",
        header: "Estado Primera Etapa",
        cell: ({ getValue }) => (
          <span
            className={`block w-full h-full p-4   text-center text-xs font-semibold ${
              getValue() === "Registrado"
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            {getValue()}
          </span>
        ),
        meta: {
          hideOnLG: true,
        },
      },
      {
        accessorKey: "state_second",
        header: "Estado Segunda Etapa ",
        cell: ({ getValue }) => (
          <span
            className={`block w-full h-full p-4 text-center text-xs font-semibold ${
              getValue() === "Validado"
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            {getValue()}
          </span>
        ),
        meta: {
          hideOnLG: true,
        },
      },
      {
        accessorKey: "state_beca",
        header: "Estado Beca",
        cell: ({ getValue }) => (
          <span
            className={`block w-full h-full p-4 text-center text-xs font-semibold ${
              getValue() === "Activo"
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            {getValue()}
          </span>
        ),
        meta: {
          hideOnLG: true,
        },
      },
      {
        accessorKey: "state_process",
        header: "Estado Proceso",
        cell: ({ getValue }) => (
          <span
            className={`block w-full h-full p-4 text-center text-xs font-semibold ${
              getValue() === "Correcto"
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            {getValue()}
          </span>
        ),
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
    []
  );
  // Carga los estudiantes al montar el componente
  return (
    <div className="border p-6 rounded bg-bg h-full gap-4 flex flex-col">
      {alerts.length > 0 && <AlertTable alerts={alerts} />}
      <div className="w-full flex justify-between items-center bg-primary text-white p-3 rounded-t-lg">
        <h2 className="text-2xl font-bold">Datos Estudiantes</h2>
      </div>
      <DataTable
        data={students}
        columns={columns}
        fileName="Export_Student"
        mode="Student"
      />

      <StudentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        student={selectedStudent}
        onSave={handleSave}
      />
    </div>
  );
};

export default AllStudent;
