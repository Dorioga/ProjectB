import { useEffect, useState } from "react";
import useAuth from "../../lib/hooks/useAuth";
import useTeacher from "../../lib/hooks/useTeacher";
import ProfileTeacher from "../../components/molecules/ProfileTeacher";
import Loader from "../../components/atoms/Loader";
import { mapTeacherRowsToProcessed } from "../../utils/teacherUtils";

/**
 * Página standalone de ProfileTeacher.
 * Al acceder por ruta directa (/dashboard/profileTeacher) carga
 * automáticamente los datos del docente usando idDocente e idSede
 * guardados en localStorage (vía AuthContext).
 */
const ProfileTeacherPage = () => {
  const { idDocente, idSede } = useAuth();
  const { getDataTeacher } = useTeacher();

  const [teacherData, setTeacherData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!idDocente) return;

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const payload = {
          id_docente: Number(idDocente),
          fk_sede: Number(idSede),
        };
        const res = await getDataTeacher(payload);
        console.log("ProfileTeacherPage - getDataTeacher response:", res);

        let processed;
        if (res && typeof res === "object" && (res.basic || res.subjects)) {
          // ya viene procesado
          processed = res;
        } else {
          const rawData = Array.isArray(res) ? res : (res?.data ?? res);
          processed = mapTeacherRowsToProcessed(rawData, {});
        }

        setTeacherData(processed);
      } catch (err) {
        console.error("ProfileTeacherPage - error loading teacher:", err);
        setError(err?.message || "Error al cargar los datos del docente");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [idDocente, idSede, getDataTeacher]);

  if (loading) {
    return <Loader message="Cargando datos del docente..." size={96} />;
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-error text-lg">{error}</p>
      </div>
    );
  }

  return (
    <div className=" p-6  h-full gap-4 flex flex-col">
      <ProfileTeacher
        data={teacherData ?? {}}
        initialEditing={false}
        mode="page"
      />
    </div>
  );
};

export default ProfileTeacherPage;
