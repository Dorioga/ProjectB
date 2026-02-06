import React, { useEffect, useMemo, useState } from "react";
import SimpleButton from "../../components/atoms/SimpleButton";
import JourneySelect from "../../components/atoms/JourneySelect";
import SedeSelect from "../../components/atoms/SedeSelect";
import TypeDocumentSelector from "../../components/molecules/TypeDocumentSelector";
import AsignatureGrades from "../../components/molecules/AsignatureGrades";
import useSchool from "../../lib/hooks/useSchool";
import useStudent from "../../lib/hooks/useStudent";
import { sha256 } from "js-sha256";
import useData from "../../lib/hooks/useData";
import { useNotify } from "../../lib/hooks/useNotify";

const RegisterTeacher = ({ onSuccess }) => {
  const {
    sedes,
    reloadSedes,
    registerTeacher,
    loading: teacherLoading,
  } = useSchool();
  const { institutionSedes } = useData();
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
  });

  // El componente AsignatureGrades gestiona su estado interno y la carga de grados.
  const handleAddAsignature = (asign) => {
    console.log("Agregar asignatura:", asign);
    setFormData((prev) => ({
      ...prev,
      asignature: [...prev.asignature, asign],
    }));
  };

  const handleRemoveAsignature = (index) => {
    setFormData((prev) => ({
      ...prev,
      asignature: prev.asignature.filter((_, i) => i !== index),
    }));
  };

  // Cargar estudiantes cuando se monta el componente
  useEffect(() => {
    reload();
  }, [reload]);

  // Cargar sedes cuando se monta el componente
  useEffect(() => {
    reloadSedes();
  }, [reloadSedes]);

  const [submitOk, setSubmitOk] = useState(false);
  const notify = useNotify();

  const sedeJornada = useMemo(() => {
    const sedeId = String(formData.sede ?? "").trim();
    if (!sedeId || !Array.isArray(institutionSedes)) return null;

    const sede = institutionSedes.find((s) => String(s?.id) === sedeId);
    return sede?.fk_workday ? String(sede.fk_workday) : null;
  }, [formData.sede, institutionSedes]);

  // Limpiar jornada cuando cambie la sede
  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      workday: "",
    }));
  }, [formData.sede]);

  // Auto-seleccionar jornada si fk_workday no es 3
  useEffect(() => {
    if (!sedeJornada) return;

    // Si fk_workday es 3 (ambas), el usuario puede elegir, no auto-seleccionar
    if (sedeJornada === "3") return;

    // Si es 1 o 2, auto-seleccionar esa jornada
    setFormData((prev) => ({
      ...prev,
      workday: parseInt(sedeJornada, 10),
    }));
  }, [sedeJornada]);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitOk(false);

    if (!formData.identificationtype || formData.identificationtype === 0) {
      notify.error("El tipo de documento es obligatorio.");
      return;
    }
    if (!String(formData.identification ?? "").trim()) {
      notify.error("El número de identificación es obligatorio.");
      return;
    }
    if (!String(formData.first_name ?? "").trim()) {
      notify.error("El primer nombre es obligatorio.");
      return;
    }
    if (!String(formData.first_lastname ?? "").trim()) {
      notify.error("El primer apellido es obligatorio.");
      return;
    }
    if (!String(formData.email ?? "").trim()) {
      notify.error("El correo es obligatorio.");
      return;
    }
    if (!formData.asignature || formData.asignature.length === 0) {
      notify.error("Debe agregar al menos una asignatura con sus grados.");
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
      asignature: formData.asignature.map((asig) => ({
        idAsignature: parseInt(asig.idAsignature, 10),
        grades: asig.grades.map((gradeId) => ({
          idgrade: parseInt(gradeId, 10),
        })),
      })),
    };

    // Mostrar en consola qué se va a enviar
    console.log("📤 Datos que se enviarán al backend:");
    console.log(payload);

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
      });

      // Notificar al componente padre que el registro fue exitoso (si fue pasado)
      if (typeof onSuccess === "function") {
        try {
          onSuccess(result);
        } catch (err) {
          console.warn("onSuccess callback failed:", err);
        }
      }
    } catch (err) {
      console.error("Error al registrar docente:", err);
      toast.error(
        err?.message || "Error al registrar el docente. Intenta nuevamente.",
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
            className="w-full p-2 border rounded bg-surface"
          />
        </div>

        <div>
          <label>Fecha de nacimiento</label>
          <input
            type="date"
            name="fecha_nacimiento"
            value={formData.fecha_nacimiento}
            onChange={handleChange}
            className="w-full p-2 border rounded bg-surface"
          />
        </div>

        <div>
          <label>Primer nombre</label>
          <input
            type="text"
            name="first_name"
            value={formData.first_name}
            onChange={handleChange}
            className="w-full p-2 border rounded bg-surface"
          />
        </div>

        <div>
          <label>Segundo nombre</label>
          <input
            type="text"
            name="second_name"
            value={formData.second_name}
            onChange={handleChange}
            className="w-full p-2 border rounded bg-surface"
          />
        </div>

        <div>
          <label>Primer apellido</label>
          <input
            type="text"
            name="first_lastname"
            value={formData.first_lastname}
            onChange={handleChange}
            className="w-full p-2 border rounded bg-surface"
          />
        </div>

        <div>
          <label>Segundo apellido</label>
          <input
            type="text"
            name="second_lastname"
            value={formData.second_lastname}
            onChange={handleChange}
            className="w-full p-2 border rounded bg-surface"
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
            className="w-full p-2 border rounded bg-surface"
          />
        </div>

        <div>
          <label>Correo</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full p-2 border rounded bg-surface"
          />
        </div>

        <div>
          <label>Contraseña</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className="w-full p-2 border rounded bg-surface"
          />
        </div>

        <div>
          <label>Dirección</label>
          <input
            type="text"
            name="direccion"
            value={formData.direccion}
            onChange={handleChange}
            className="w-full p-2 border rounded bg-surface"
          />
        </div>

        <AsignatureGrades
          sede={formData.sede}
          workday={formData.workday}
          asignatures={formData.asignature}
          onAdd={handleAddAsignature}
          onRemove={handleRemoveAsignature}
        />

        {submitOk ? (
          <div className="md:col-span-3 p-4 rounded-lg border-l-4 border-green-500 bg-gray-50 text-green-700">
            <div className="flex items-start gap-3">
              <svg
                className="w-6 h-6 shrink-0 mt-0.5"
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
              text={"text-surface"}
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
