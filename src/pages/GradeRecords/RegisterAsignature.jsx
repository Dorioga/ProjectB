import { useMemo, useState } from "react";
import SimpleButton from "../../components/atoms/SimpleButton";
import useStudent from "../../lib/hooks/useStudent";

const RegisterAsignature = () => {
  const { students, loading: studentsLoading } = useStudent();
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    description: "",
    grades_scholar: [],
  });

  const [submitError, setSubmitError] = useState("");
  const [submitOk, setSubmitOk] = useState(false);

  const availableGrades = useMemo(() => {
    const source = Array.isArray(students) ? students : [];
    const unique = new Set(
      source
        .map((s) => s?.grade_scholar)
        .filter((g) => g !== null && g !== undefined && String(g).trim() !== "")
        .map((g) => String(g).trim())
    );
    return Array.from(unique).sort((a, b) => Number(a) - Number(b));
  }, [students]);

  const toggleGrade = (grade) => {
    setFormData((prev) => {
      const current = Array.isArray(prev.grades_scholar)
        ? prev.grades_scholar
        : [];
      const exists = current.includes(grade);
      return {
        ...prev,
        grades_scholar: exists
          ? current.filter((g) => g !== grade)
          : [...current, grade],
      };
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitOk(false);
    setSubmitError("");

    if (!String(formData.name ?? "").trim()) {
      setSubmitError("El nombre de la asignatura es obligatorio.");
      return;
    }
    if (!String(formData.code ?? "").trim()) {
      setSubmitError("El código de la asignatura es obligatorio.");
      return;
    }
    if (
      !Array.isArray(formData.grades_scholar) ||
      formData.grades_scholar.length === 0
    ) {
      setSubmitError("Selecciona al menos un grado.");
      return;
    }

    // Aquí iría la lógica real de registro (API). Por ahora, seguimos el patrón del proyecto:
    // validar y mostrar el payload en consola.
    console.log("Asignatura a registrar:", {
      ...formData,
      grades_scholar: formData.grades_scholar
        .slice()
        .sort((a, b) => Number(a) - Number(b)),
    });
    setSubmitOk(true);
  };

  return (
    <div className="border p-6 rounded bg-bg h-full gap-4 flex flex-col">
      <h2 className="font-bold text-2xl ">Registrar Asignatura</h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label className=" text-lg font-semibold">
            Nombre de la asignatura
          </label>
          <input
            className="bg-white rounded-sm p-2 border border-gray-300 w-full focus:outline-none focus:ring-2 focus:ring-secondary"
            type="text"
            placeholder="Ingrese el nombre de la asignatura"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
        </div>

        <div>
          <label className=" text-lg font-semibold">
            Código de la asignatura
          </label>
          <input
            className="bg-white rounded-sm p-2 border border-gray-300 w-full focus:outline-none focus:ring-2 focus:ring-secondary"
            type="text"
            placeholder="Ingrese el código de la asignatura"
            value={formData.code}
            onChange={(e) => setFormData({ ...formData, code: e.target.value })}
          />
        </div>

        <div>
          <label className=" text-lg font-semibold">
            Descripción de la asignatura
          </label>
          <input
            className="bg-white rounded-sm p-2 border border-gray-300 w-full focus:outline-none focus:ring-2 focus:ring-secondary"
            type="text"
            placeholder="Ingrese la descripción de la asignatura"
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
          />
        </div>

        <div>
          <div className="text-lg font-semibold">Grados donde se dictará</div>
          {studentsLoading ? (
            <div className="text-sm opacity-80">Cargando grados...</div>
          ) : availableGrades.length === 0 ? (
            <div className="text-sm opacity-80">No hay grados disponibles.</div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 mt-2">
              {availableGrades.map((grade) => {
                const checked = Array.isArray(formData.grades_scholar)
                  ? formData.grades_scholar.includes(grade)
                  : false;
                return (
                  <label
                    key={grade}
                    className="flex items-center gap-2 bg-white rounded-sm p-2 border border-gray-300"
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleGrade(grade)}
                    />
                    <span>Grado {grade}</span>
                  </label>
                );
              })}
            </div>
          )}
        </div>

        {submitError ? (
          <div className="text-sm text-red-600">{submitError}</div>
        ) : null}
        {submitOk ? (
          <div className="text-sm text-green-700">
            Asignatura lista para registrar.
          </div>
        ) : null}

        <div className="mt-2 flex justify-center">
          <div className="w-full md:w-1/2">
            <SimpleButton
              msj="Registrar asignatura"
              text={"text-white"}
              bg={"bg-accent"}
              icon={"Save"}
            />
          </div>
        </div>
      </form>
    </div>
  );
};

export default RegisterAsignature;
