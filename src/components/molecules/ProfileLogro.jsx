import { useEffect, useState } from "react";
import AsignatureSelector from "../molecules/AsignatureSelector";
import GradeSelector from "../atoms/GradeSelector";
import PeriodSelector from "../atoms/PeriodSelector";
import SimpleButton from "../atoms/SimpleButton";
import useTeacher from "../../lib/hooks/useTeacher";
import useAuth from "../../lib/hooks/useAuth";

const ProfileLogro = ({ initial = {}, onSubmit, onClose }) => {
  const { idInstitution, idSede } = useAuth();
  const { getLogroType } = useTeacher();

  const [asignature, setAsignature] = useState(initial.fk_asignatura || "");
  const [grade, setGrade] = useState(initial.fk_grado || "");
  const [period, setPeriod] = useState(initial.fk_periodo || "");
  const [tipoLogro, setTipoLogro] = useState(initial.fk_tipo_logro || "");
  const [descripcion, setDescripcion] = useState(initial.descripcion || "");

  const [tipos, setTipos] = useState([]);
  const [loadingTipos, setLoadingTipos] = useState(false);

  useEffect(() => {
    let mounted = true;
    const loadTipos = async () => {
      setLoadingTipos(true);
      try {
        const res = await getLogroType();
        const data = Array.isArray(res) ? res : (res?.data ?? []);
        if (!mounted) return;
        setTipos(data);
      } catch (err) {
        console.error("ProfileLogro - getLogroType error:", err);
        setTipos([]);
      } finally {
        setLoadingTipos(false);
      }
    };
    loadTipos();
    return () => {
      mounted = false;
    };
  }, [getLogroType]);

  const handleSearch = async () => {
    const payload = {
      fk_asignatura: Number(asignature) || null,
      fk_grado: Number(grade) || null,
      fk_periodo: Number(period) || null,
      descripcion: descripcion || "",
      fk_tipo_logro: Number(tipoLogro) || null,
      fk_institucion: Number(idInstitution) || null,
    };

    if (onSubmit) await onSubmit(payload);
  };

  return (
    <div className="p-4 space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <AsignatureSelector
          label="Asignatura"
          value={asignature}
          onChange={(e) => setAsignature(e.target.value)}
          placeholder="Selecciona asignatura"
          sedeId={idSede}
        />

        <GradeSelector
          label="Grado"
          value={grade}
          onChange={(e) => setGrade(e.target.value)}
          placeholder="Selecciona grado"
        />

        <PeriodSelector
          label="Periodo"
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
        />

        <div>
          <label className="block text-sm font-medium mb-1">
            Tipo de logro
          </label>
          <select
            className="w-full p-2 border rounded bg-surface"
            value={tipoLogro}
            onChange={(e) => setTipoLogro(e.target.value)}
            disabled={loadingTipos}
          >
            <option value="">
              {loadingTipos ? "Cargando..." : "Seleccione tipo"}
            </option>
            {Array.isArray(tipos) &&
              tipos.map((t) => (
                <option
                  key={t.id_type_logro ?? t.id}
                  value={t.id_type_logro ?? t.id}
                >
                  {t.nombre_tipo_logro || t.nombre || t.name}
                </option>
              ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Descripción</label>
        <input
          className="w-full p-2 border rounded bg-surface"
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
          placeholder="Texto para filtrar descripción (opcional)"
        />
      </div>

      <div className="flex gap-2 justify-end">
        <SimpleButton
          msj="Cancelar"
          onClick={onClose}
          bg="bg-gray-200"
          text="text-gray-700"
        />
        <SimpleButton
          msj="Buscar logros"
          onClick={handleSearch}
          bg="bg-primary"
          text="text-surface"
        />
      </div>
    </div>
  );
};

export default ProfileLogro;
