import React, { useState, useMemo } from "react";
import FileChooser from "../../components/atoms/FileChooser";
import DataTable from "../../components/atoms/DataTable";
import useStudent from "../../lib/hooks/useStudent";
import SimpleButton from "../../components/atoms/SimpleButton";
import { User } from "lucide-react";
import StudentModal from "../../components/molecules/StudentModal";

const SearchStudents = () => {
  const [files, setFiles] = useState([]);
  const [studentsData, setStudentsData] = useState([]);
  const { getRandomStudents, updateStudent } = useStudent();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);

  const handleFilesSelected = (selectedFiles) => {
    //setFiles(selectedFiles);
    // // Simular carga de datos de estudiantes desde los archivos
    // const mockStudents = selectedFiles.map((file, index) => ({
    //   id: index + 1,
    //   name: `Estudiante ${index + 1}`,
    //   email: `estudiante${index + 1}@example.com`,
    //   fileName: file.name,
    //   fileSize: (file.size / 1024).toFixed(2) + " KB",
    //   uploadDate: new Date().toLocaleDateString(),
    // }));
    // guardar en el estado para mostrar en la tabla
  };
  // 3. Función para abrir el modal con los datos del estudiante
  const handleViewProfile = (student) => {
    setSelectedStudent(student);
    setIsModalOpen(true);
  };
  const loadFiveRandom = async () => {
    console.log("Cargando cinco estudiantes aleatorios...");
    try {
      const five = await getRandomStudents(5);
      setStudentsData(five);
    } catch (err) {
      console.error("Error cargando estudiantes aleatorios:", err);
    }
  };
  console.log("Students Data:", studentsData);
  const handleRemoveFile = (index) => {
    const newFiles = files.filter((_, i) => i !== index);
    const newStudents = studentsData.filter((_, i) => i !== index);
    setFiles(newFiles);
    setStudentsData(newStudents);
  };

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
            className={`block w-full h-full p-4 text-center text-xs font-semibold ${
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
        accessorKey: "state_institutional",
        header: "Estado Institucional",
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
              onClick={() => handleViewProfile(row.original)} // Llama a la función con los datos de la fila
              noRounded={true}
              bg="bg-primary"
              text="text-white"
              msj="Ver Perfil"
              icon="User"
            />
            {/* Puedes añadir más botones aquí, como eliminar */}
          </div>
        ),
      },
    ],
    []
  );
  const handleSave = (identification, updatedData) => {
    updateStudent(identification, updatedData);
    //setIsModalOpen(false);
  };

  return (
    <div className="border p-6 rounded bg-bg h-full gap-4 flex flex-col">
      <h1 className="text-2xl font-bold mb-4">Buscar Estudiantes</h1>
      <div className="flex flex-row items-center justify-start gap-4 w-1/2">
        <h2 className="text-lg font-semibold">Cargar datos de Archivos</h2>
        <div className="flex flex-col gap-2">
          <SimpleButton
            msj="Cargar Archivos"
            bg="bg-primary"
            text="text-white"
            icon="Upload"
            onClick={() => loadFiveRandom()}
          />
          {/* <FileChooser
            onFilesSelected={handleFilesSelected}
            acceptedTypes=".csv,.xlsx,.json"
          /> */}
        </div>
      </div>

      {studentsData.length > 0 && (
        <DataTable
          data={studentsData}
          columns={columns}
          title="Datos de Estudiantes Cargados"
        />
      )}
      <StudentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        student={selectedStudent}
        onSave={handleSave}
      />
    </div>
  );
};

export default SearchStudents;
