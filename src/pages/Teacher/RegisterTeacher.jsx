import React, { useEffect, useMemo, useState } from "react";
import SimpleButton from "../../components/atoms/SimpleButton";
import JourneySelect from "../../components/atoms/JourneySelect";
import SedeSelect from "../../components/atoms/SedeSelect";
import TypeDocumentSelector from "../../components/molecules/TypeDocumentSelector";
import useSchool from "../../lib/hooks/useSchool";
import useStudent from "../../lib/hooks/useStudent";
import { asignatureResponse } from "../../services/DataExamples/asignatureResponse";
import { sha256 } from "js-sha256";

const RegisterTeacher = () => {
  const {
    sedes,
    reloadSedes,
    registerTeacher,
    loading: teacherLoading,
  } = useSchool();
  const { students, loading: studentsLoading, reload } = useStudent();
  const [formData, setFormData] = useState({
    first_name: "",
    second_name: "",
    first_lastname: "",
    second_lastname: "",
    telephone: "",
    email: "",
    identification: "",
    identificationtype: 0,
    sede: 0,
    password: "",
    workday: 0,
    fecha_nacimiento: "",
    direccion: "",
    asignature: [],
    grades_scholar: [],
  });

  const [submitError, setSubmitError] = useState("");

  // Cargar estudiantes cuando se monta el componente
  useEffect(() => {
    reload();
  }, [reload]);

  // Cargar sedes cuando se monta el componente
  useEffect(() => {
    reloadSedes();
  }, [reloadSedes]);
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
    const sedeId = String(formData.sede ?? "").trim();
    if (!sedeId) return "";

    const source = Array.isArray(sedes) ? sedes : [];
    const sede = source.find((s) => String(s?.id ?? "").trim() === sedeId);
    return String(sede?.jornada ?? sede?.journeys ?? "").trim();
  }, [formData.sede, sedes]);

  useEffect(() => {
    const sedeId = String(formData.sede ?? "").trim();

    // Si no hay sede, no hay restricción: limpiamos jornada
    if (!sedeId) {
      setFormData((prev) => ({ ...prev, workday: "" }));
      return;
    }

    const ref = String(sedeJornada ?? "")
      .trim()
      .toLowerCase();
    if (!ref) return;

    setFormData((prev) => {
      const current = String(prev.workday ?? "")
        .trim()
        .toLowerCase();

      if (ref === "ambas") {
        const isAllowed = current === "mañana" || current === "tarde";
        return isAllowed ? prev : { ...prev, workday: "" };
      }

      // Si la sede solo tiene una jornada, forzamos esa jornada
      return current === ref ? prev : { ...prev, workday: ref };
    });
  }, [formData.sede, sedeJornada]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Convertir a número si es sede, workday o identificationtype
    const finalValue =
      name === "sede" || name === "workday" || name === "identificationtype"
        ? value
          ? Number(value)
          : 0
        : value;

    setFormData((prev) => ({
      ...prev,
      [name]: finalValue,
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitOk(false);
    setSubmitError("");

    if (!String(formData.identificationtype ?? "").trim()) {
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

    // Preparar payload JSON para enviar al backend
    const payload = {
      first_name: formData.first_name,
      second_name: formData.second_name || "",
      first_lastname: formData.first_lastname,
      second_lastname: formData.second_lastname || "",
      sede: formData.sede,
      workday: formData.workday,
      identification: formData.identification,
      identificationtype: formData.identificationtype,
      fecha_nacimiento: formData.fecha_nacimiento || "",
      telephone: formData.telephone || "",
      email: formData.email,
      password: formData.password ? sha256(String(formData.password)) : "",
      direccion: formData.direccion || "",
    };

    // Mostrar en consola qué se va a enviar
    console.log("📤 Datos que se enviarán al backend:");
    console.table(payload);

    try {
      const result = await registerTeacher(payload);
      console.log("Docente registrado exitosamente:", result);
      setSubmitOk(true);

      // Limpiar formulario después del registro exitoso
      setFormData({
        first_name: "",
        second_name: "",
        first_lastname: "",
        second_lastname: "",
        sede: 0,
        workday: 0,
        identification: "",
        identificationtype: 0,
        fecha_nacimiento: "",
        telephone: "",
        email: "",
        password: "",
        direccion: "",
        asignature: [],
        grades_scholar: [],
      });
    } catch (err) {
      console.error("Error al registrar docente:", err);
      setSubmitError(
        err?.message || "Error al registrar el docente. Intenta nuevamente."
      );
    }
  };

  return (
    <div className="border p-6 rounded bg-bg h-full gap-4 flex flex-col">
      <h2 className="font-bold text-2xl ">Registrar Docente</h2>
      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 md:grid-cols-3 gap-4"
      >
        <div className="md:col-span-3 font-bold">Información personal</div>

        <SedeSelect name="sede" value={formData.sede} onChange={handleChange} />
        <JourneySelect
          name="workday"
          value={formData.workday}
          filterValue={sedeJornada}
          onChange={handleChange}
          disabled={!String(formData.sede ?? "").trim()}
        />

        <TypeDocumentSelector
          name="identificationtype"
          value={formData.identificationtype}
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
            name="fecha_nacimiento"
            value={formData.fecha_nacimiento}
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
          <label>Contraseña</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className="w-full p-2 border rounded bg-white"
          />
        </div>

        <div>
          <label>Dirección</label>
          <input
            type="text"
            name="direccion"
            value={formData.direccion}
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
          <div className="md:col-span-3 p-4 rounded-lg border-l-4 border-red-500 bg-gray-50 text-red-600">
            <div className="flex items-start gap-3">
              <svg
                className="w-6 h-6 flex-shrink-0 mt-0.5"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
              <div className="flex-1">
                <h4 className="font-bold text-base mb-1">Error</h4>
                <p className="text-sm leading-relaxed">{submitError}</p>
              </div>
            </div>
          </div>
        ) : null}
        {submitOk ? (
          <div className="md:col-span-3 p-4 rounded-lg border-l-4 border-green-500 bg-gray-50 text-green-700">
            <div className="flex items-start gap-3">
              <svg
                className="w-6 h-6 flex-shrink-0 mt-0.5"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <div className="flex-1">
                <h4 className="font-bold text-base mb-1">¡Éxito!</h4>
                <p className="text-sm leading-relaxed">
                  Docente registrado exitosamente.
                </p>
              </div>
            </div>
          </div>
        ) : null}

        <div className="md:col-span-3 mt-4 flex justify-center">
          <div className="w-full md:w-1/2">
            <SimpleButton
              msj={teacherLoading ? "Registrando..." : "Registrar docente"}
              text={"text-white"}
              bg={"bg-accent"}
              icon={"Save"}
              disabled={teacherLoading}
            />
          </div>
        </div>
      </form>
    </div>
  );
};

export default RegisterTeacher;
