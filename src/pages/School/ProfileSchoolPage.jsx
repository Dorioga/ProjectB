import { useEffect, useState } from "react";
import useAuth from "../../lib/hooks/useAuth";
import useSchool from "../../lib/hooks/useSchool";
import ProfileSchool from "./ProfileSchool";
import Loader from "../../components/atoms/Loader";

/**
 * Página standalone de ProfileSchool.
 * Al acceder por ruta directa (/dashboard/profileSchool) carga
 * automáticamente los datos de la institución usando el idInstitution
 * guardado en localStorage (vía AuthContext).
 */
const ProfileSchoolPage = () => {
  const { idInstitution } = useAuth();
  const { getDataSchool } = useSchool();

  const [schoolData, setSchoolData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!idInstitution) return;

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await getDataSchool({ idInstitution });
        const d =
          res?.data && Array.isArray(res.data)
            ? res.data[0]
            : Array.isArray(res)
              ? res[0]
              : res;
        setSchoolData(d ?? null);
      } catch (err) {
        console.error("ProfileSchoolPage - error loading school:", err);
        setError(err?.message || "Error al cargar los datos de la institución");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [idInstitution, getDataSchool]);

  if (loading) {
    return <Loader message="Cargando datos de la institución..." size={96} />;
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
      <ProfileSchool
        mode={schoolData ? "update" : "register"}
        initialData={schoolData}
        initialEditing={false}
        schoolId={schoolData?.id_institution || schoolData?.id || idInstitution}
      />
    </div>
  );
};

export default ProfileSchoolPage;
