import { useEffect, useState } from "react";
import useAuth from "../../lib/hooks/useAuth";
import useStudent from "../../lib/hooks/useStudent";
import ProfileStudent from "../../components/molecules/ProfileStudent";
import Loader from "../../components/atoms/Loader";

/**
 * Página standalone de ProfileStudent.
 * Al acceder por ruta directa (/dashboard/profileStudent) carga
 * automáticamente los datos del estudiante usando idEstudiante
 * guardado en AuthContext (localStorage).
 */
const ProfileStudentPage = () => {
  const { idEstudiante, idSede } = useAuth();
  const { getStudent } = useStudent();

  const [studentData, setStudentData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!idEstudiante) return;

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await getStudent({
          id_estudiante: Number(idEstudiante),
          fk_sede: Number(idSede),
        });
        setStudentData(res ?? null);
      } catch (err) {
        console.error("ProfileStudentPage - error loading student:", err);
        setError(err?.message || "Error al cargar los datos del estudiante");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [idEstudiante, getStudent]);

  if (loading) {
    return <Loader message="Cargando datos del estudiante..." size={96} />;
  }

  if (error) {
    return (
      <div className="border p-6 rounded bg-bg h-full flex items-center justify-center">
        <p className="text-red-600 text-lg">{error}</p>
      </div>
    );
  }

  if (!studentData) {
    return (
      <div className="border p-6 rounded bg-bg h-full flex items-center justify-center">
        <p className="text-muted text-lg">
          No se encontraron datos del estudiante.
        </p>
      </div>
    );
  }

  return (
    <div className="border p-6 rounded bg-bg h-full overflow-auto">
      <ProfileStudent data={studentData} />
    </div>
  );
};

export default ProfileStudentPage;
