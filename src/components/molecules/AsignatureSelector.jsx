import React, { useEffect, useMemo, useState } from "react";
import useSchool from "../../lib/hooks/useSchool";

const AsignatureSelector = ({
  name = "asignature",
  label = "Asignatura",
  labelClassName = "",
  value = "",
  onChange,
  placeholder = "Selecciona una asignatura",
  className = "w-full p-2 border rounded bg-white",
  disabled = false,
  sedeId = null,
  workdayId = null,
  multiple = false,
  autoLoad = true,
}) => {
  const { getSedeAsignature, loading: schoolLoading } = useSchool();
  const [asignaturas, setAsignaturas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Cargar asignaturas cuando cambie la sede o jornada
  useEffect(() => {
    if (!autoLoad) return;
    if (!sedeId || !workdayId) {
      setAsignaturas([]);
      return;
    }

    const loadAsignaturas = async () => {
      setLoading(true);
      setError(null);
      try {
        const payload = {
          idSede: Number(sedeId),
          idWorkDay: Number(workdayId),
        };
        console.log(
          "AsignatureSelector - Cargando asignaturas con payload:",
          payload
        );
        const response = await getSedeAsignature(payload);
        console.log("AsignatureSelector - Respuesta:", response);

        // Extraer las asignaturas de la respuesta
        const data = Array.isArray(response)
          ? response
          : Array.isArray(response?.data)
          ? response.data
          : [];

        console.log("AsignatureSelector - Asignaturas procesadas:", data);
        setAsignaturas(data);
      } catch (err) {
        console.error("Error al cargar asignaturas:", err);
        setError(err);
        setAsignaturas([]);
      } finally {
        setLoading(false);
      }
    };

    loadAsignaturas();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sedeId, workdayId, autoLoad]);

  const items = useMemo(() => {
    return (Array.isArray(asignaturas) ? asignaturas : [])
      .filter(Boolean)
      .filter((x) => x?.estado === "Activo") // Solo asignaturas activas
      .map((x) => ({
        id: String(x?.id_asignatura || x?.id || "").trim(),
        name: String(x?.nombre_asignatura || x?.nombre || x?.name || "").trim(),
        code: String(x?.codigo_asignatura || x?.codigo || x?.code || "").trim(),
      }))
      .filter((x) => x.id && x.name);
  }, [asignaturas]);

  const isLoading = loading || schoolLoading;

  return (
    <div>
      <label className={labelClassName}>{label}</label>
      <select
        name={name}
        value={value}
        onChange={onChange}
        className={className}
        disabled={disabled || isLoading || !sedeId || !workdayId}
        multiple={multiple}
      >
        <option value="">
          {!sedeId || !workdayId
            ? "Selecciona primero una sede y jornada"
            : isLoading
            ? "Cargando asignaturas..."
            : error
            ? "Error al cargar asignaturas"
            : items.length === 0
            ? "No hay asignaturas disponibles"
            : placeholder}
        </option>
        {items.map((opt) => (
          <option key={opt.id} value={opt.id}>
            {opt.name}
          </option>
        ))}
      </select>
    </div>
  );
};

export default AsignatureSelector;
