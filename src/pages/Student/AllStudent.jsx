import { useState, useMemo, useEffect } from "react";
import useStudent from "../../lib/hooks/useStudent";
import DataTable from "../../components/atoms/DataTable";
import StudentModal from "../../components/molecules/StudentModal"; // 1. Importa el modal
import { User } from "lucide-react";

const AllStudent = () => {
  const { students, loading, reload, updateStudent } = useStudent();

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
            className={`px-2 py-1 rounded-full text-xs font-semibold ${
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
            className={`px-2 py-1 rounded-full text-xs font-semibold ${
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
        accessorKey: "state_institutional",
        header: "Estado Institucional",
        cell: ({ getValue }) => (
          <span
            className={`px-2 py-1 rounded-full text-xs font-semibold ${
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
            className={`px-2 py-1 rounded-full text-xs font-semibold ${
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
          <div className="flex gap-2 items-center justify-center">
            <button
              onClick={() => handleViewProfile(row.original)} // Llama a la función con los datos de la fila
              className=" flex flex-row items-center px-3 py-1 bg-primary text-white rounded text-sm hover:bg-primary/90"
            >
              <User /> Ver Perfil
            </button>
            {/* Puedes añadir más botones aquí, como eliminar */}
          </div>
        ),
      },
    ],
    []
  );
  // Carga los estudiantes al montar el componente
  return (
    <div className="border p-6 rounded bg-bg h-full gap-4 flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Estudiantes Registrados</h1>
      </div>

      <DataTable data={students} columns={columns} fileName="Export_Student" />

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
