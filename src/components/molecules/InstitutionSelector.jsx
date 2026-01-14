import React, { useEffect, useMemo, useRef } from "react";
import useSchool from "../../lib/hooks/useSchool";

const InstitutionSelector = ({
  name = "institution_id",
  label = "Tipo de Institución",
  labelClassName = "",
  value = "",
  onChange,
  placeholder = "Seleccionar tipo de institución",
  className = "w-full p-2 border rounded bg-white",
  disabled = false,
  autoLoad = true,
}) => {
  const { getInstitution, loading } = useSchool();
  const [institutions, setInstitutions] = React.useState([]);
  const [loadingInstitutions, setLoadingInstitutions] = React.useState(false);
  const loadedRef = useRef(false);

  useEffect(() => {
    if (!autoLoad) return;
    if (loadedRef.current) return;

    const fetchInstitutions = async () => {
      loadedRef.current = true;
      setLoadingInstitutions(true);
      try {
        const response = await getInstitution();
        console.log("InstitutionSelector - fetched institutions:", response);

        // El response puede ser un array directo o tener una propiedad data
        let data = [];
        if (Array.isArray(response)) {
          data = response;
        } else if (Array.isArray(response?.data)) {
          data = response.data;
        }

        setInstitutions(data);
      } catch (error) {
        console.error("Error al cargar instituciones:", error);
        setInstitutions([]);
        loadedRef.current = false; // Permitir reintento en caso de error
      } finally {
        setLoadingInstitutions(false);
      }
    };

    fetchInstitutions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const items = useMemo(() => {
    return institutions
      .filter(Boolean)
      .map((inst) => ({
        id: String(inst?.id_institution ?? "").trim(),
        name: String(inst?.nombre_institution ?? "").trim(),
      }))
      .filter((x) => x.id && x.name);
  }, [institutions]);

  const isDisabled = disabled || loading || loadingInstitutions;
  const selectClassName = isDisabled
    ? `${className} bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200 opacity-60`
    : className;

  return (
    <div>
      <label
        className={`${labelClassName} ${isDisabled ? "text-gray-400" : ""}`}
      >
        {label}
      </label>
      <select
        name={name}
        value={value}
        onChange={onChange}
        className={selectClassName}
        disabled={isDisabled}
      >
        <option value="">
          {loadingInstitutions ? "Cargando Instituciones..." : placeholder}
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

export default InstitutionSelector;
