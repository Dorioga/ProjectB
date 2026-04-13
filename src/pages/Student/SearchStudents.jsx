import React, { useState, useMemo, useEffect, useCallback } from "react";
import DataTable from "../../components/atoms/DataTable";
import useStudent from "../../lib/hooks/useStudent";
import useSchool from "../../lib/hooks/useSchool";
import SimpleButton from "../../components/atoms/SimpleButton";
import SedeSelect from "../../components/atoms/SedeSelect";
import JourneySelect from "../../components/atoms/JourneySelect";
import GradeSelector from "../../components/atoms/GradeSelector";
import Loader from "../../components/atoms/Loader";
import StudentModal from "../../components/molecules/StudentModal";

const SearchStudents = () => {
  const { updateStudent } = useStudent();
  const { getStudentGrades } = useSchool();

  // ── Filtros ──────────────────────────────────────────────────────────────
  const [sedeId, setSedeId] = useState("");
  const [workdayId, setWorkdayId] = useState("");
  const [gradeId, setGradeId] = useState("");

  // ── Tabla ────────────────────────────────────────────────────────────────
  const [studentsData, setStudentsData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // ── Modal ────────────────────────────────────────────────────────────────
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);

  const handleViewProfile = (student) => {
    setSelectedStudent(student);
    setIsModalOpen(true);
  };

  // Limpiar tabla y grado cuando cambian sede o jornada
  useEffect(() => {
    setGradeId("");
    setStudentsData([]);
  }, [sedeId, workdayId]);

  // ── Cargar estudiantes al seleccionar grado ──────────────────────────────
  const fetchStudents = useCallback(async () => {
    if (!gradeId) {
      setStudentsData([]);
      return;
    }
    setIsLoading(true);
    try {
      const res = await getStudentGrades({ idGrade: Number(gradeId) });
      const data = Array.isArray(res) ? res : (res?.data ?? []);
      setStudentsData(data);
    } catch (err) {
      console.error("SearchStudents - fetchStudents error:", err);
      setStudentsData([]);
    } finally {
      setIsLoading(false);
    }
  }, [gradeId, getStudentGrades]);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  // ── Columnas ─────────────────────────────────────────────────────────────
  const columns = useMemo(
    () => [
      {
        accessorKey: "id_estudiante",
        header: "ID",
        meta: { hideOnLG: true },
      },
      {
        accessorFn: (row) =>
          `${row.nombre_estudiante ?? row.nombre ?? ""} ${row.apellido_estudiante ?? row.apellido ?? ""}`.trim(),
        id: "nombre_completo",
        header: "Nombre completo",
      },
      {
        accessorKey: "nombre_grado",
        header: "Grado",
        meta: { hideOnLG: true },
      },
      {
        accessorKey: "nombre_jornada",
        header: "Jornada",
        meta: { hideOnLG: true },
      },
      {
        id: "actions",
        header: "Acciones",
        cell: ({ row }) => (
          <div className="w-full h-full flex items-stretch">
            <SimpleButton
              className="h-full"
              onClick={() => handleViewProfile(row.original)}
              noRounded={true}
              bg="bg-primary"
              text="text-surface"
              msj="Ver perfil"
              icon="User"
            />
          </div>
        ),
      },
    ],
    [],
  );

  const handleSave = async (studentId, personId, updatedData) => {
    try {
      await updateStudent(studentId, personId, updatedData);
    } catch (err) {
      console.error("Error al actualizar estudiante:", err);
    }
  };

  return (
    <div className="p-6 h-full gap-4 flex flex-col">
      <h1 className="text-2xl font-bold mb-4">Buscar estudiantes</h1>

      {/* ── Filtros ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-3xl">
        <div className="flex flex-col gap-1">
          <SedeSelect
            label="Sede"
            value={sedeId}
            onChange={(e) => setSedeId(e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-1">
          <JourneySelect
            label="Jornada"
            value={workdayId}
            onChange={(e) => setWorkdayId(e.target.value)}
            disabled={!sedeId}
          />
        </div>
        <div className="flex flex-col gap-1">
          <GradeSelector
            label="Grado"
            value={gradeId}
            onChange={(e) => setGradeId(e.target.value)}
            sedeId={sedeId}
            workdayId={workdayId}
            disabled={!sedeId || !workdayId}
          />
        </div>
      </div>

      {/* ── Tabla ── */}
      {isLoading && <Loader />}
      {!isLoading && studentsData.length > 0 && (
        <DataTable
          data={studentsData}
          columns={columns}
          title="Estudiantes del grado"
        />
      )}
      {!isLoading && gradeId && studentsData.length === 0 && (
        <p className="text-sm text-gray-500">
          No se encontraron estudiantes para el grado seleccionado.
        </p>
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
