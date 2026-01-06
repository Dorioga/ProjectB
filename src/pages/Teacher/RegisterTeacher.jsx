import React, { useEffect, useMemo, useState } from "react";
import SimpleButton from "../../components/atoms/SimpleButton";
import JourneySelect from "../../components/atoms/JourneySelect";
import SedeSelect from "../../components/atoms/SedeSelect";
import TypeDocumentSelector from "../../components/molecules/TypeDocumentSelector";
import useSchool from "../../lib/hooks/useSchool";
import useStudent from "../../lib/hooks/useStudent";
import { asignatureResponse } from "../../services/DataExamples/asignatureResponse";

const RegisterTeacher = () => {
  const { sedes } = useSchool();
  const { students, loading: studentsLoading } = useStudent();
  const [formData, setFormData] = useState({
    sedeId: "",
    jornada: "",
    identification: "",
    identificationType: "",
    first_name: "",
    second_name: "",
    first_lastname: "",
    second_lastname: "",
    birthdate: "",
    telephone: "",
    email: "",
    address: "",
    asignature: [],
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

  const sedeJornada = useMemo(() => {
    const sedeId = String(formData.sedeId ?? "").trim();
    if (!sedeId) return "";

    const source = Array.isArray(sedes) ? sedes : [];
    const sede = source.find((s) => String(s?.id ?? "").trim() === sedeId);
    return String(sede?.jornada ?? sede?.journeys ?? "").trim();
  }, [formData.sedeId, sedes]);

  useEffect(() => {
    const sedeId = String(formData.sedeId ?? "").trim();

    // Si no hay sede, no hay restricción: limpiamos jornada
    if (!sedeId) {
      setFormData((prev) => ({ ...prev, jornada: "" }));
      return;
    }

    const ref = String(sedeJornada ?? "")
      .trim()
      .toLowerCase();
    if (!ref) return;

    setFormData((prev) => {
      const current = String(prev.jornada ?? "")
        .trim()
        .toLowerCase();

      if (ref === "ambas") {
        const isAllowed = current === "mañana" || current === "tarde";
        return isAllowed ? prev : { ...prev, jornada: "" };
      }

      // Si la sede solo tiene una jornada, forzamos esa jornada
      return current === ref ? prev : { ...prev, jornada: ref };
    });
  }, [formData.sedeId, sedeJornada]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const toggleAsignature = (code) => {
    setFormData((prev) => {
      const current = Array.isArray(prev.asignature) ? prev.asignature : [];
      const exists = current.includes(code);
      return {
        ...prev,
        asignature: exists
          ? current.filter((c) => c !== code)
          : [...current, code],
      };
    });
  };

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

    if (!String(formData.identificationType ?? "").trim()) {
      setSubmitError("El tipo de documento es obligatorio.");
      return;
    }
    if (!String(formData.identification ?? "").trim()) {
      setSubmitError("El número de identificación es obligatorio.");
      return;
    }
    if (!String(formData.first_name ?? "").trim()) {
      setSubmitError("El primer nombre es obligatorio.");
      return;
    }
    if (!String(formData.first_lastname ?? "").trim()) {
      setSubmitError("El primer apellido es obligatorio.");
      return;
    }
    if (!String(formData.email ?? "").trim()) {
      setSubmitError("El correo es obligatorio.");
      return;
    }
    if (
      !Array.isArray(formData.asignature) ||
      formData.asignature.length === 0
    ) {
      setSubmitError("Selecciona al menos una asignatura.");
      return;
    }
    if (
      !Array.isArray(formData.grades_scholar) ||
      formData.grades_scholar.length === 0
    ) {
      setSubmitError("Selecciona al menos un grado.");
      return;
    }

    console.log("Docente a registrar:", {
      ...formData,
      // Alias para backend si espera snake_case
      identification_type: formData.identificationType,
      grades_scholar: formData.grades_scholar
        .slice()
        .sort((a, b) => Number(a) - Number(b)),
      asignature: formData.asignature.slice().sort(),
    });
    setSubmitOk(true);
  };

  return (
    <div className="border p-6 rounded bg-bg h-full gap-4 flex flex-col">
      <h2 className="font-bold text-2xl ">Registrar Docente</h2>
      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 md:grid-cols-3 gap-4"
      >
        <div className="md:col-span-3 font-bold">Información personal</div>

        <SedeSelect value={formData.sedeId} onChange={handleChange} />
        <JourneySelect
          value={formData.jornada}
          filterValue={sedeJornada}
          onChange={handleChange}
          disabled={!String(formData.sedeId ?? "").trim()}
        />

        <TypeDocumentSelector
          name="identificationType"
          value={formData.identificationType}
          onChange={handleChange}
          placeholder="Selecciona un tipo"
        />

        <div>
          <label>N.º de identificación</label>
          <input
            type="text"
            name="identification"
            value={formData.identification}
            onChange={handleChange}
            className="w-full p-2 border rounded bg-white"
          />
        </div>

        <div>
          <label>Fecha de nacimiento</label>
          <input
            type="date"
            name="birthdate"
            value={formData.birthdate}
            onChange={handleChange}
            className="w-full p-2 border rounded bg-white"
          />
        </div>

        <div>
          <label>Primer nombre</label>
          <input
            type="text"
            name="first_name"
            value={formData.first_name}
            onChange={handleChange}
            className="w-full p-2 border rounded bg-white"
          />
        </div>

        <div>
          <label>Segundo nombre</label>
          <input
            type="text"
            name="second_name"
            value={formData.second_name}
            onChange={handleChange}
            className="w-full p-2 border rounded bg-white"
          />
        </div>

        <div>
          <label>Primer apellido</label>
          <input
            type="text"
            name="first_lastname"
            value={formData.first_lastname}
            onChange={handleChange}
            className="w-full p-2 border rounded bg-white"
          />
        </div>

        <div>
          <label>Segundo apellido</label>
          <input
            type="text"
            name="second_lastname"
            value={formData.second_lastname}
            onChange={handleChange}
            className="w-full p-2 border rounded bg-white"
          />
        </div>

        <div className="md:col-span-3 font-bold mt-4">
          Información de contacto
        </div>

        <div>
          <label>Teléfono</label>
          <input
            type="text"
            name="telephone"
            value={formData.telephone}
            onChange={handleChange}
            className="w-full p-2 border rounded bg-white"
          />
        </div>

        <div>
          <label>Correo</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full p-2 border rounded bg-white"
          />
        </div>

        <div>
          <label>Dirección</label>
          <input
            type="text"
            name="address"
            value={formData.address}
            onChange={handleChange}
            className="w-full p-2 border rounded bg-white"
          />
        </div>

        <div className="md:col-span-3 font-bold mt-4">Asignaturas</div>
        <div className="md:col-span-3">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 mt-2">
            {asignatureResponse.map((asig) => {
              const code = String(asig?.codigo ?? "");
              const name = String(asig?.nombre ?? "");
              const checked = Array.isArray(formData.asignature)
                ? formData.asignature.includes(code)
                : false;
              return (
                <label
                  key={code}
                  className="flex items-center gap-2 bg-white rounded-sm p-2 border border-gray-300"
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleAsignature(code)}
                  />
                  <span>{name}</span>
                </label>
              );
            })}
          </div>
        </div>

        <div className="md:col-span-3 font-bold mt-4">Grados donde dictará</div>
        <div className="md:col-span-3">
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
          <div className="md:col-span-3 text-sm text-red-600">
            {submitError}
          </div>
        ) : null}
        {submitOk ? (
          <div className="md:col-span-3 text-sm text-green-700">
            Docente listo para registrar.
          </div>
        ) : null}

        <div className="md:col-span-3 mt-4 flex justify-center">
          <div className="w-full md:w-1/2">
            <SimpleButton
              msj="Registrar docente"
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

export default RegisterTeacher;
