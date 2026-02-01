import { useEffect, useMemo, useState } from "react";
import SimpleButton from "../../components/atoms/SimpleButton";
import JourneySelect from "../../components/atoms/JourneySelect";
import SedeSelect from "../../components/atoms/SedeSelect";
import useSchool from "../../lib/hooks/useSchool";
import useData from "../../lib/hooks/useData";
import { useNotify } from "../../lib/hooks/useNotify";

const RegisterAsignature = () => {
  const {
    registerAsignature,
    getGradeSede,
    loading: schoolLoading,
  } = useSchool();
  const { institutionSedes } = useData();
  const notify = useNotify();
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    description: "",
    jornada: "",
    sedeId: "",
    grades_scholar: [],
  });

  const inputClassName =
    "bg-surface rounded-sm p-2 border border-gray-300 w-full focus:outline-none focus:ring-2 focus:ring-secondary";
  const labelClassName = "text-lg font-semibold";

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [availableGrades, setAvailableGrades] = useState([]);
  const [loadingGrades, setLoadingGrades] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState({});

  // Inicializar grupos expandidos cuando cambien los grados disponibles
  useEffect(() => {
    const groupNames = [
      ...new Set(availableGrades.map((g) => g.nombre || "Sin nombre")),
    ];
    setExpandedGroups((prev) => {
      const next = { ...prev };
      groupNames.forEach((name) => {
        if (!(name in next)) next[name] = true; // expandir por defecto
      });
      return next;
    });
  }, [availableGrades]);

  const toggleGroup = (name) => {
    setExpandedGroups((prev) => ({ ...prev, [name]: !prev[name] }));
  };

  const isGroupAllSelected = (grades) => {
    const selected = Array.isArray(formData.grades_scholar)
      ? formData.grades_scholar
      : [];
    return grades.every((g) => selected.includes(g.id));
  };

  const toggleSelectAllGroup = (grades) => {
    setFormData((prev) => {
      const current = new Set(prev.grades_scholar || []);
      const ids = grades.map((g) => g.id);
      const allSelected = ids.every((id) => current.has(id));
      if (allSelected) {
        ids.forEach((id) => current.delete(id));
      } else {
        ids.forEach((id) => current.add(id));
      }
      return { ...prev, grades_scholar: Array.from(current) };
    });
  };

  // Obtener fk_workday de la sede seleccionada para filtrar jornadas
  const sedeWorkday = useMemo(() => {
    if (!formData.sedeId || !Array.isArray(institutionSedes)) return null;
    const sede = institutionSedes.find(
      (s) => String(s?.id) === String(formData.sedeId),
    );
    return sede?.fk_workday ? String(sede.fk_workday) : null;
  }, [formData.sedeId, institutionSedes]);

  // Limpiar jornada y grados cuando cambie la sede
  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      jornada: "",
      grades_scholar: [],
    }));
    setAvailableGrades([]);
  }, [formData.sedeId]);

  // Auto-seleccionar jornada si fk_workday no es 3
  useEffect(() => {
    if (!sedeWorkday) return;

    // Si fk_workday es 3 (ambas), el usuario puede elegir, no auto-seleccionar
    if (sedeWorkday === "3") return;

    // Si es 1 o 2, auto-seleccionar esa jornada
    setFormData((prev) => ({
      ...prev,
      jornada: sedeWorkday,
    }));
  }, [sedeWorkday]);

  // Cargar grados cuando se seleccionen jornada y sede
  useEffect(() => {
    // Solo ejecutar si ambos campos tienen valores válidos
    if (!formData.jornada || !formData.sedeId) {
      setAvailableGrades([]);
      setLoadingGrades(false);
      return;
    }

    const loadGrades = async () => {
      setLoadingGrades(true);
      try {
        const payload = {
          idSede: Number(formData.sedeId),
          idWorkDay: Number(formData.jornada),
        };

        const response = await getGradeSede(payload);

        // Extraer los grados de la respuesta
        const grades = Array.isArray(response)
          ? response
          : Array.isArray(response?.data)
            ? response.data
            : [];

        // Guardar los objetos completos de grado
        const processedGrades = grades
          .filter((g) => g?.id_grado && g?.estado === "Activo")
          .map((g) => ({
            id: g.id_grado,
            nombre: g.nombre_grado,
            grupo: g.grupo,
          }));

        setAvailableGrades(processedGrades);
      } catch (error) {
        console.error("Error al cargar grados:", error);
        setAvailableGrades([]);
      } finally {
        setLoadingGrades(false);
      }
    };

    loadGrades();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.jornada, formData.sedeId]);

  const toggleGrade = (gradeId) => {
    setFormData((prev) => {
      const current = Array.isArray(prev.grades_scholar)
        ? prev.grades_scholar
        : [];
      const exists = current.includes(gradeId);
      return {
        ...prev,
        grades_scholar: exists
          ? current.filter((g) => g !== gradeId)
          : [...current, gradeId],
      };
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!String(formData.name ?? "").trim()) {
      notify.error("El nombre de la asignatura es obligatorio.");
      return;
    }
    if (!String(formData.code ?? "").trim()) {
      notify.error("El código de la asignatura es obligatorio.");
      return;
    }
    if (!formData.sedeId) {
      notify.error("Selecciona una sede.");
      return;
    }
    if (!formData.jornada) {
      notify.error("Selecciona una jornada.");
      return;
    }
    if (
      !Array.isArray(formData.grades_scholar) ||
      formData.grades_scholar.length === 0
    ) {
      notify.error("Selecciona al menos un grado.");
      return;
    }

    setIsSubmitting(true);
    try {
      // Preparar el payload según lo que espera el backend
      const payload = {
        fk_sede: parseInt(formData.sedeId, 10),
        fk_grade: formData.grades_scholar
          .slice()
          .sort((a, b) => Number(a) - Number(b))
          .map((gradeId) => ({ idgrade: parseInt(gradeId, 10) })),
        name_asignature: formData.name.trim(),
        code_asignature: formData.code.trim(),
        description: formData.description.trim(),
      };

      console.log("Asignatura a registrar:", payload);

      await registerAsignature(payload);

      // Limpiar el formulario después de un registro exitoso
      setFormData({
        name: "",
        code: "",
        description: "",
        jornada: "",
        sedeId: "",
        grades_scholar: [],
      });
    } catch (err) {
      console.error("Error al registrar asignatura:", err);
      notify.error(
        err?.message || "Error al registrar la asignatura. Intenta de nuevo.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="border p-6 rounded bg-bg h-full gap-4 flex flex-col">
      <h2 className="font-bold text-2xl ">Registrar Asignatura</h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label className={labelClassName}>Nombre de la asignatura</label>
          <input
            className={inputClassName}
            type="text"
            placeholder="Ingrese el nombre de la asignatura"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
        </div>

        <div>
          <label className={labelClassName}>Código de la asignatura</label>
          <input
            className={inputClassName}
            type="text"
            placeholder="Ingrese el código de la asignatura"
            value={formData.code}
            onChange={(e) => setFormData({ ...formData, code: e.target.value })}
          />
        </div>

        <div>
          <label className={labelClassName}>Descripción de la asignatura</label>
          <input
            className={inputClassName}
            type="text"
            placeholder="Ingrese la descripción de la asignatura"
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
          />
        </div>
        <SedeSelect
          value={formData.sedeId}
          onChange={handleChange}
          className={inputClassName}
          labelClassName={labelClassName}
        />
        <JourneySelect
          value={formData.jornada}
          onChange={handleChange}
          filterValue={sedeWorkday}
          includeAmbas={false}
          className={inputClassName}
          labelClassName={labelClassName}
        />

        <div>
          <div className="text-lg font-semibold">Grados donde se dictará</div>
          {!formData.sedeId || !formData.jornada ? (
            <div className="text-sm opacity-80">
              Selecciona primero una sede y jornada.
            </div>
          ) : loadingGrades ? (
            <div className="text-sm opacity-80">Cargando grados...</div>
          ) : availableGrades.length === 0 ? (
            <div className="text-sm opacity-80">
              No hay grados disponibles para esta sede y jornada.
            </div>
          ) : (
            <>
              {/* Agrupar grados por nombre de asignatura con controles y conteos */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-2">
                {(() => {
                  const grouped = availableGrades.reduce((acc, g) => {
                    const key = g.nombre || "Sin nombre";
                    if (!acc[key]) acc[key] = [];
                    acc[key].push(g);
                    return acc;
                  }, {});

                  const entries = Object.entries(grouped).sort((a, b) =>
                    a[0].localeCompare(b[0]),
                  );

                  return entries.map(([name, grades]) => {
                    // Orden numérico ascendente cuando sea posible, fallback a comparación de cadenas
                    grades.sort((x, y) => {
                      const a = String(x.grupo ?? "").trim();
                      const b = String(y.grupo ?? "").trim();

                      const na = parseFloat(a.replace(/[^0-9.\-]+/g, ""));
                      const nb = parseFloat(b.replace(/[^0-9.\-]+/g, ""));

                      if (!Number.isNaN(na) && !Number.isNaN(nb)) {
                        return na - nb;
                      }

                      // Si no son numéricos, comparar por texto
                      return a.localeCompare(b);
                    });
                    const expanded = Boolean(expandedGroups[name]);
                    const allSelected = isGroupAllSelected(grades);
                    const selectedCount = grades.filter((g) =>
                      Array.isArray(formData.grades_scholar)
                        ? formData.grades_scholar.includes(g.id)
                        : false,
                    ).length;

                    return (
                      <div key={name} className="p-2 rounded">
                        <div className="flex items-center justify-between p-2 bg-primary rounded-lg">
                          <div className="flex items-center gap-3 rounded">
                            <div className="font-semibold bg-surface px-2 py-1 rounded">
                              Grado {name}
                            </div>
                            <div className="text-sm opacity-70">
                              (
                              <span className="text-surface font-semibold">
                                {grades.length}
                              </span>
                              {selectedCount > 0 && (
                                <>
                                  {" "}
                                  <span className="text-surface font-semibold">
                                    • {selectedCount} seleccionados
                                  </span>
                                </>
                              )}
                              )
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <SimpleButton
                              type="button"
                              onClick={() => toggleSelectAllGroup(grades)}
                              icon={allSelected ? "Square" : "CheckSquare"}
                              msjtooltip={
                                allSelected
                                  ? "Deseleccionar"
                                  : "Seleccionar todo"
                              }
                              noRounded={false}
                              bg={"bg-primary"}
                              text={"text-surface"}
                              className="w-auto px-2 py-0.5 text-xs"
                            />
                            <SimpleButton
                              type="button"
                              onClick={() => toggleGroup(name)}
                              icon={expanded ? "EyeOff" : "Eye"}
                              msjtooltip={expanded ? "Ocultar" : "Mostrar"}
                              noRounded={false}
                              bg={"bg-primary"}
                              text={"text-surface"}
                              className="w-auto px-2 py-0.5 text-xs"
                            />
                          </div>
                        </div>

                        {expanded && (
                          <div className="grid grid-cols-2 gap-2 py-2">
                            {grades.map((grade) => {
                              const checked = Array.isArray(
                                formData.grades_scholar,
                              )
                                ? formData.grades_scholar.includes(grade.id)
                                : false;
                              return (
                                <label
                                  key={grade.id}
                                  className="flex items-center gap-2 bg-surface rounded-sm p-2 border border-gray-300"
                                >
                                  <input
                                    type="checkbox"
                                    checked={checked}
                                    onChange={() => toggleGrade(grade.id)}
                                  />
                                  <span className="text-primary font-medium">
                                    {grade.grupo}
                                  </span>
                                </label>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  });
                })()}
              </div>
            </>
          )}
        </div>

        <div className="mt-2 flex justify-center">
          <div className="w-full md:w-1/2">
            <SimpleButton
              msj="Registrar asignatura"
              text={"text-surface"}
              bg={"bg-accent"}
              icon={"Save"}
              disabled={isSubmitting || schoolLoading}
            />
          </div>
        </div>
      </form>
    </div>
  );
};

export default RegisterAsignature;
