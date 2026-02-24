import React, { useState } from "react";
import SimpleButton from "../atoms/SimpleButton";
import SedeSelect from "../atoms/SedeSelect";

import TypeDocumentSelector from "../molecules/TypeDocumentSelector";
import Loader from "../atoms/Loader";
import useData from "../../lib/hooks/useData";
import useAuth from "../../lib/hooks/useAuth";
import { useNotify } from "../../lib/hooks/useNotify";

// ───────────────────── Constantes ─────────────────────

const INITIAL_STUDENT = {
  first_name: "",
  second_name: "",
  first_lastname: "",
  second_lastname: "",
  telephone: "",
  email: "",
  identification: "",
  identificationtype: "",
  sede: "",
  fecha_nacimiento: "",
  direccion: "",
  gender: "",
  nui: "",
  per_id: "",
  cuenta_piar: false, // estos pueden quedarse aunque no se muestren
};

const INITIAL_GUARDIAN = {
  first_name: "",
  second_name: "",
  first_lastname: "",
  second_lastname: "",
  telephone: "",
  email: "",
  identification: "",
  identificationtype: "",
};

const inputClass =
  "w-full p-2 border rounded bg-surface text-sm text-on-surface outline-none focus:ring-2 focus:ring-primary/40 border-secondary/40";

const Field = ({ label, error, children }) => (
  <div className="flex flex-col gap-1">
    <label className="text-sm font-medium text-on-surface">{label}</label>
    {children}
    {error && <p className="text-xs text-error">{error}</p>}
  </div>
);

// ───────────────────── Componente principal ─────────────────────

const ReserveSpot = ({ onSuccess }) => {
  const notify = useNotify();

  const [student, setStudent] = useState(INITIAL_STUDENT);
  const [guardian, setGuardian] = useState(INITIAL_GUARDIAN);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // ─── Handlers genéricos ───
  const handleStudentChange = (e) => {
    const { name, value, type, files } = e.target;
    setStudent((prev) => ({
      ...prev,
      [name]: type === "file" ? files[0] : value,
    }));
    setErrors((prev) => ({ ...prev, [`student_${name}`]: "" }));
  };

  const handleGuardianChange = (e) => {
    const { name, value } = e.target;
    setGuardian((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [`guardian_${name}`]: "" }));
  };

  // ─── Validación ───
  const validate = () => {
    const e = {};
    // Estudiante
    if (!student.first_name.trim()) e.student_first_name = "Obligatorio.";
    if (!student.first_lastname.trim())
      e.student_first_lastname = "Obligatorio.";
    if (!student.identification.trim())
      e.student_identification = "Obligatorio.";
    if (!student.identificationtype)
      e.student_identificationtype = "Selecciona tipo de documento.";
    if (!student.sede) e.student_sede = "Selecciona una sede.";

    // Acudiente
    if (!guardian.first_name.trim()) e.guardian_first_name = "Obligatorio.";
    if (!guardian.first_lastname.trim())
      e.guardian_first_lastname = "Obligatorio.";
    if (!guardian.telephone.trim()) e.guardian_telephone = "Obligatorio.";
    if (!guardian.identification.trim())
      e.guardian_identification = "Obligatorio.";
    if (!guardian.identificationtype)
      e.guardian_identificationtype = "Selecciona tipo de documento.";

    return e;
  };

  // ─── Submit ───
  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      notify.error("Revisa los campos obligatorios.");
      return;
    }

    setLoading(true);

    try {
      // ── Construir un solo FormData con toda la información ──
      const fd = new FormData();

      // --- Datos del estudiante (prefijo student_) ---
      fd.append("student_first_name", student.first_name.trim());
      fd.append("student_second_name", student.second_name.trim());
      fd.append("student_first_lastname", student.first_lastname.trim());
      fd.append("student_second_lastname", student.second_lastname.trim());
      fd.append("student_telephone", student.telephone.trim());
      fd.append("student_email", student.email.trim());
      fd.append("student_identification", student.identification.trim());
      fd.append(
        "student_identificationtype",
        student.identificationtype ? Number(student.identificationtype) : "",
      );
      fd.append("student_sede", student.sede ? Number(student.sede) : "");
      // campos básicos del estudiante ya añadidos más arriba
      fd.append("student_fecha_nacimiento", student.fecha_nacimiento || "");
      fd.append("student_direccion", student.direccion.trim());
      fd.append("student_gender", student.gender || "");
      fd.append("student_nui", student.nui.trim());
      fd.append("student_per_id", student.per_id.trim());
      fd.append("student_cuenta_piar", student.cuenta_piar ? "1" : "0");

      // Archivos opcionales (se conservaron en estado pero no se muestran)
      if (student.link_identificacion) {
        fd.append("student_cedula", student.link_identificacion);
      }
      if (student.link_piar) {
        fd.append("student_piar", student.link_piar);
      }
      if (student.photo_link && student.photo_link instanceof File) {
        fd.append("student_photo", student.photo_link);
      }

      // --- Datos del acudiente (prefijo guardian_) ---
      fd.append("guardian_first_name", guardian.first_name.trim());
      fd.append("guardian_second_name", guardian.second_name.trim());
      fd.append("guardian_first_lastname", guardian.first_lastname.trim());
      fd.append("guardian_second_lastname", guardian.second_lastname.trim());
      fd.append("guardian_telephone", guardian.telephone.trim());
      fd.append("guardian_email", guardian.email.trim());
      fd.append("guardian_identification", guardian.identification.trim());
      fd.append(
        "guardian_identificationtype",
        guardian.identificationtype ? Number(guardian.identificationtype) : "",
      );

      // ── Log para depuración ──
      console.log("=== ReserveSpot FormData ===");
      for (const [key, val] of fd.entries()) {
        console.log(key, val instanceof File ? `[File] ${val.name}` : val);
      }
      console.log("============================");

      // ── Enviar al backend (ajusta la ruta según tu API) ──
      // Ejemplo: await ApiClient.instance.post("/reserve-spot", fd);
      // Por ahora emitimos el FormData mediante onSuccess para que el padre lo procese.
      if (typeof onSuccess === "function") {
        await onSuccess(fd);
      }

      notify.success("Reserva de cupo enviada correctamente.");

      // Resetear formularios
      setStudent(INITIAL_STUDENT);
      setGuardian(INITIAL_GUARDIAN);
      setErrors({});
    } catch (err) {
      console.error("Error en ReserveSpot:", err);
      notify.error(
        err?.message || "Error al enviar la reserva. Intenta nuevamente.",
      );
    } finally {
      setLoading(false);
    }
  };

  // ═══════════════════════ RENDER ═══════════════════════

  return (
    <div className="p-6 h-full gap-4 flex flex-col">
      <h2 className="text-2xl font-bold text-on-surface">Reservar cupo</h2>

      {loading && <Loader message="Enviando reserva de cupo…" />}

      <form onSubmit={handleSubmit} className="flex flex-col gap-8">
        {/* ═══════════════ ZONA 1: ESTUDIANTE ═══════════════ */}
        <section className="border border-secondary/30 rounded-lg overflow-hidden">
          <div className="bg-primary text-surface p-3">
            <h3 className="text-xl font-bold">Datos del estudiante</h3>
          </div>

          <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* ── Información personal ── */}
            <div className="md:col-span-3 font-bold text-on-surface">
              Información personal
            </div>

            <Field error={errors.student_identificationtype}>
              <TypeDocumentSelector
                name="identificationtype"
                value={student.identificationtype}
                onChange={handleStudentChange}
                placeholder="Selecciona un tipo"
                className={inputClass}
              />
            </Field>

            <Field
              label="N.º de identificación"
              error={errors.student_identification}
            >
              <input
                type="text"
                name="identification"
                value={student.identification}
                onChange={handleStudentChange}
                className={inputClass}
              />
            </Field>

            <Field label="NUI" error={errors.student_nui}>
              <input
                type="text"
                name="nui"
                value={student.nui}
                onChange={handleStudentChange}
                className={inputClass}
              />
            </Field>

            <Field label="Primer nombre" error={errors.student_first_name}>
              <input
                type="text"
                name="first_name"
                value={student.first_name}
                onChange={handleStudentChange}
                className={inputClass}
              />
            </Field>

            <Field label="Segundo nombre" error={errors.student_second_name}>
              <input
                type="text"
                name="second_name"
                value={student.second_name}
                onChange={handleStudentChange}
                className={inputClass}
              />
            </Field>

            <Field
              label="Primer apellido"
              error={errors.student_first_lastname}
            >
              <input
                type="text"
                name="first_lastname"
                value={student.first_lastname}
                onChange={handleStudentChange}
                className={inputClass}
              />
            </Field>

            <Field
              label="Segundo apellido"
              error={errors.student_second_lastname}
            >
              <input
                type="text"
                name="second_lastname"
                value={student.second_lastname}
                onChange={handleStudentChange}
                className={inputClass}
              />
            </Field>

            <Field label="Género" error={errors.student_gender}>
              <select
                name="gender"
                value={student.gender}
                onChange={handleStudentChange}
                className={inputClass}
              >
                <option value="">Selecciona</option>
                <option value="Masculino">Masculino</option>
                <option value="Femenino">Femenino</option>
              </select>
            </Field>

            <Field
              label="Fecha de nacimiento"
              error={errors.student_fecha_nacimiento}
            >
              <input
                type="date"
                name="fecha_nacimiento"
                value={student.fecha_nacimiento}
                onChange={handleStudentChange}
                className={inputClass}
              />
            </Field>

            <Field label="Teléfono" error={errors.student_telephone}>
              <input
                type="tel"
                name="telephone"
                value={student.telephone}
                onChange={handleStudentChange}
                className={inputClass}
              />
            </Field>

            <Field label="Email" error={errors.student_email}>
              <input
                type="email"
                name="email"
                value={student.email}
                onChange={handleStudentChange}
                className={inputClass}
              />
            </Field>

            <Field label="Dirección" error={errors.student_direccion}>
              <input
                type="text"
                name="direccion"
                value={student.direccion}
                onChange={handleStudentChange}
                className={inputClass}
              />
            </Field>
          </div>
        </section>

        {/* ═══════════════ ZONA 2: ACUDIENTE ═══════════════ */}
        <section className="border border-secondary/30 rounded-lg overflow-hidden">
          <div className="bg-primary text-surface p-3">
            <h3 className="text-xl font-bold">Datos del acudiente</h3>
          </div>

          <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field error={errors.guardian_identificationtype}>
              <TypeDocumentSelector
                name="identificationtype"
                value={guardian.identificationtype}
                onChange={handleGuardianChange}
                placeholder="Selecciona un tipo"
                className={inputClass}
              />
            </Field>

            <Field
              label="N.º de identificación"
              error={errors.guardian_identification}
            >
              <input
                type="text"
                name="identification"
                value={guardian.identification}
                onChange={handleGuardianChange}
                className={inputClass}
              />
            </Field>

            <Field label="Primer nombre" error={errors.guardian_first_name}>
              <input
                type="text"
                name="first_name"
                value={guardian.first_name}
                onChange={handleGuardianChange}
                className={inputClass}
              />
            </Field>

            <Field label="Segundo nombre" error={errors.guardian_second_name}>
              <input
                type="text"
                name="second_name"
                value={guardian.second_name}
                onChange={handleGuardianChange}
                className={inputClass}
              />
            </Field>

            <Field
              label="Primer apellido"
              error={errors.guardian_first_lastname}
            >
              <input
                type="text"
                name="first_lastname"
                value={guardian.first_lastname}
                onChange={handleGuardianChange}
                className={inputClass}
              />
            </Field>

            <Field
              label="Segundo apellido"
              error={errors.guardian_second_lastname}
            >
              <input
                type="text"
                name="second_lastname"
                value={guardian.second_lastname}
                onChange={handleGuardianChange}
                className={inputClass}
              />
            </Field>

            <Field label="Teléfono" error={errors.guardian_telephone}>
              <input
                type="tel"
                name="telephone"
                value={guardian.telephone}
                onChange={handleGuardianChange}
                className={inputClass}
              />
            </Field>

            <Field label="Correo electrónico" error={errors.guardian_email}>
              <input
                type="email"
                name="email"
                value={guardian.email}
                onChange={handleGuardianChange}
                className={inputClass}
              />
            </Field>
          </div>
        </section>

        {/* ═══════════════ BOTÓN DE ENVÍO ═══════════════ */}
        <div className="flex justify-center">
          {!loading && (
            <SimpleButton
              msj="Reservar cupo"
              text="text-surface"
              bg="bg-accent"
              icon="Save"
            />
          )}
        </div>
      </form>
    </div>
  );
};

export default ReserveSpot;
