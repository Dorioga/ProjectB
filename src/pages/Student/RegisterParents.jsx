import React, { useState } from "react";
import SimpleButton from "../../components/atoms/SimpleButton";
import Modal from "../../components/atoms/Modal";
import TypeDocumentSelector from "../../components/molecules/TypeDocumentSelector";
import { useNotify } from "../../lib/hooks/useNotify";
import useAuth from "../../lib/hooks/useAuth";
import {
  registerGuardian,
  getStudentByIdentification,
  getGuardianByInstitution,
  assignGuardianExisting,
} from "../../services/studentService";
import Loader from "../../components/atoms/Loader";
import tourRegisterParents from "../../tour/tourRegisterParents";
import { toUpperCaseField } from "../../utils/formatUtils";

const INITIAL_FORM = {
  first_name: "",
  second_name: "",
  first_lastname: "",
  second_lastname: "",
  telephone: "",
  email: "",
  identification: "",
  identificationtype: "",
  password: "",
};

const Field = ({ label, error, required, children }) => (
  <div className="flex flex-col gap-1">
    {label && (
      <label className="text-sm font-medium text-on-surface">
        {label}
        {required && <span className="text-error ml-1">*</span>}
      </label>
    )}
    {children}
    {error && <p className="text-xs text-error">{error}</p>}
  </div>
);

const input =
  "w-full p-2 border rounded bg-surface text-sm text-on-surface outline-none focus:ring-2 focus:ring-primary/40 border-secondary/40";

const RegisterParents = ({ fkEstudiante, onSuccess }) => {
  const { idInstitution } = useAuth();
  const notify = useNotify();

  const [form, setForm] = useState({ ...INITIAL_FORM });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const [studentIdInput, setStudentIdInput] = useState("");
  const [foundStudentId, setFoundStudentId] = useState(null);
  const [foundStudentFkSede, setFoundStudentFkSede] = useState("");
  const [foundStudentName, setFoundStudentName] = useState("");
  const [foundGuardianName, setFoundGuardianName] = useState("");
  const [hasActiveGuardian, setHasActiveGuardian] = useState(false);
  const [searchStatus, setSearchStatus] = useState("idle"); // idle | loading | found | not_found

  const [guardianCheckStatus, setGuardianCheckStatus] = useState("idle"); // idle | loading | found | not_found
  const [guardianRegisteredStudents, setGuardianRegisteredStudents] = useState(
    [],
  );
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assignLoading, setAssignLoading] = useState(false);

  const handleSearchStudent = async () => {
    const value = studentIdInput.trim();
    if (!value) {
      notify.error("Ingresa la identificación del estudiante para buscar.");
      return;
    }
    setSearchStatus("loading");
    setFoundStudentId(null);
    setHasActiveGuardian(false);
    try {
      const found = await getStudentByIdentification({
        numero_identificacion_estu: value,
        fk_institucion: Number(idInstitution),
      });
setFoundStudentId(found.id_estudiante);
      setFoundStudentFkSede(found.fk_sede);
      setFoundStudentName(found.nombre || "");
      setFoundGuardianName(found.acudiente || "");
      setHasActiveGuardian(
        Boolean(found.id_acudiente && found.acudiente) &&
          found.estado_usuario_acudiente === "Activo",
      );
      setSearchStatus("found");
      setErrors((prev) => ({ ...prev, fk_estudiante: "" }));
      notify.success(`Estudiante encontrado: ${found.nombre ?? ""}.`);
    } catch (err) {
      setSearchStatus("not_found");
      notify.error(err?.message ?? "Error al buscar el estudiante.");
    }
  };

  const handleCheckGuardian = async () => {
    const value = form.identification.trim();
    if (!value) {
      notify.error("Ingresa el número de identificación del acudiente.");
      return;
    }
    setGuardianCheckStatus("loading");
    setGuardianRegisteredStudents([]);
    try {
      const data = await getGuardianByInstitution({
        numero_identificacion_acudiente: value,
        fk_institucion: Number(idInstitution),
      });
      if (Array.isArray(data) && data.length > 0) {
        setGuardianRegisteredStudents(data);
        setGuardianCheckStatus("found");
        setShowAssignModal(true);
      } else {
        setGuardianCheckStatus("not_found");
      }
    } catch (err) {
      setGuardianCheckStatus("not_found");
      notify.error(err?.message ?? "Error al validar la identificación.");
    }
  };

  const handleConfirmAssign = async () => {
    const record = guardianRegisteredStudents[0];
    if (!record) {
      notify.error("No se encontró el acudiente registrado.");
      return;
    }
    setAssignLoading(true);
    try {
      await assignGuardianExisting({
        id_acudiente: record.id_acudiente,
        fk_persona: record.fk_persona,
        fk_estudiante: Number(foundStudentId),
        link_identificacion: record.link_identificacion,
        link_firma: record.link_firma,
      });
      setShowAssignModal(false);
      notify.success("Estudiante asignado al acudiente correctamente.");
      setForm({ ...INITIAL_FORM });
      setErrors({});
      setStudentIdInput("");
      setSearchStatus("idle");
      setFoundStudentId(null);
      setFoundStudentFkSede("");
      setFoundStudentName("");
      setFoundGuardianName("");
      setHasActiveGuardian(false);
      setGuardianCheckStatus("idle");
      setGuardianRegisteredStudents([]);
      onSuccess?.();
    } catch (err) {
      notify.error(err?.message ?? "Error al asignar el estudiante.");
    } finally {
      setAssignLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: toUpperCaseField(name, value) }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
    if (name === "identification") {
      setGuardianCheckStatus("idle");
      setGuardianRegisteredStudents([]);
      setShowAssignModal(false);
    }
  };

  const validate = () => {
    const e = {};

    if (!form.first_name.trim())
      e.first_name = "El primer nombre es obligatorio.";
    else if (!/^[a-záéíóúüñA-ZÁÉÍÓÚÜÑ\s'-]+$/i.test(form.first_name.trim()))
      e.first_name = "El primer nombre solo puede contener letras.";

    if (
      form.second_name.trim() &&
      !/^[a-záéíóúüñA-ZÁÉÍÓÚÜÑ\s'-]+$/i.test(form.second_name.trim())
    )
      e.second_name = "El segundo nombre solo puede contener letras.";

    if (!form.first_lastname.trim())
      e.first_lastname = "El primer apellido es obligatorio.";
    else if (!/^[a-záéíóúüñA-ZÁÉÍÓÚÜÑ\s'-]+$/i.test(form.first_lastname.trim()))
      e.first_lastname = "El primer apellido solo puede contener letras.";

    if (
      form.second_lastname.trim() &&
      !/^[a-záéíóúüñA-ZÁÉÍÓÚÜÑ\s'-]+$/i.test(form.second_lastname.trim())
    )
      e.second_lastname = "El segundo apellido solo puede contener letras.";

    if (!form.telephone.trim()) e.telephone = "El teléfono es obligatorio.";
    else if (!/^\d{7,15}$/.test(form.telephone.trim()))
      e.telephone = "El teléfono debe contener entre 7 y 15 dígitos numéricos.";

    if (
      form.email.trim() &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())
    )
      e.email = "Ingresa un correo electrónico válido.";

    if (!form.identification.trim())
      e.identification = "La identificación es obligatoria.";
    else if (form.identification.trim().length < 5)
      e.identification = "La identificación debe tener al menos 5 caracteres.";

    if (!form.identificationtype)
      e.identificationtype = "Selecciona el tipo de documento.";

    if (!form.password.trim()) e.password = "La contraseña es obligatoria.";
    else if (form.password.trim().length < 6)
      e.password = "Mínimo 6 caracteres.";
    else if (!/[A-Z]/.test(form.password))
      e.password = "La contraseña debe tener al menos una mayúscula.";
    else if (!/\d/.test(form.password))
      e.password = "La contraseña debe tener al menos un número.";

    if (!foundStudentId)
      e.fk_estudiante = "No se pudo identificar al estudiante.";

    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    const payload = {
      first_name: form.first_name.trim(),
      second_name: form.second_name.trim(),
      first_lastname: form.first_lastname.trim(),
      second_lastname: form.second_lastname.trim(),
      telephone: form.telephone.trim(),
      email: form.email.trim(),
      identification: form.identification.trim(),
      identificationtype: Number(form.identificationtype),
      sede: String(foundStudentFkSede || ""),
      password: form.password.trim(),
      fk_estudiante: Number(foundStudentId),
    };

    setLoading(true);
    let existing = null;
    try {
      const data = await getGuardianByInstitution(
        {
          numero_identificacion_acudiente: form.identification.trim(),
          fk_institucion: Number(idInstitution),
        },
        { silent: true },
      );
      existing = Array.isArray(data) && data.length > 0 ? data[0] : null;
    } catch {
      existing = null;
    }
    try {
      if (existing?.id_acudiente) {
        await assignGuardianExisting({
          id_acudiente: existing.id_acudiente,
          fk_persona: existing.fk_persona,
          fk_estudiante: Number(foundStudentId),
          link_identificacion: existing.link_identificacion,
          link_firma: existing.link_firma,
        });
      } else {
        await registerGuardian(payload);
      }
      notify.success("Acudiente registrado correctamente.");
      setForm({ ...INITIAL_FORM });
      setErrors({});
      setStudentIdInput("");
      setSearchStatus("idle");
      setFoundStudentId(null);
      setFoundStudentFkSede("");
      setFoundStudentName("");
      setFoundGuardianName("");
      setHasActiveGuardian(false);
      setGuardianCheckStatus("idle");
      setGuardianRegisteredStudents([]);
      onSuccess?.();
    } catch (err) {
      notify.error(err?.message ?? "Error al registrar el acudiente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className=" p-6  h-full gap-4 flex flex-col">
      {loading && <Loader message="Registrando acudiente…" />}
      <div className="w-full grid grid-cols-7 items-center bg-primary text-surface p-3 rounded-lg">
        <h2 className="text-2xl col-span-4 font-bold">Datos de Acudiente</h2>
        <div className="col-span-3 flex justify-end">
          <SimpleButton
            type="button"
            onClick={() => tourRegisterParents({ searchStatus })}
            icon="HelpCircle"
            msjtooltip="Iniciar tutorial"
            noRounded={false}
            bg="bg-info"
            text="text-surface"
            className="w-auto px-3 py-1.5"
          />
        </div>
      </div>

      {/* Búsqueda de estudiante por número de identificación */}
      <div className="flex flex-col gap-2 p-4 border border-secondary/30 rounded-lg bg-surface/50">
        <label className="text-sm font-semibold text-on-surface">
          Buscar estudiante por identificación
        </label>
        <div className="grid grid-cols-5 gap-2  items-center">
          <input
            type="text"
            value={studentIdInput}
            onChange={(e) => {
              setStudentIdInput(e.target.value);
              setSearchStatus("idle");
              setFoundStudentId(null);
              setFoundStudentFkSede("");
              setFoundStudentName("");
              setFoundGuardianName("");
              setHasActiveGuardian(false);
            }}
            onKeyDown={(e) => e.key === "Enter" && handleSearchStudent()}
            placeholder="Ej: 1043482950"
            id="tour-search-student"
            className="col-span-3 w-full p-2 border rounded bg-surface text-sm text-on-surface outline-none focus:ring-2 focus:ring-primary/40 border-secondary/40"
          />
          <div className="col-span-2">
            <SimpleButton
              type="button"
              msj={searchStatus === "loading" ? "Buscando..." : "Buscar"}
              text="text-surface"
              bg="bg-primary"
              icon="Search"
              disabled={searchStatus === "loading"}
              onClick={handleSearchStudent}
            />
          </div>
        </div>
        {searchStatus === "found" && (
          <p className="text-xs text-success font-medium">
            ✓ Estudiante vinculado: {foundStudentName}
          </p>
        )}
        {searchStatus === "found" && hasActiveGuardian && (
          <div className="p-3 border border-error/30 rounded-lg bg-error/10">
            <p className="text-sm text-error font-semibold">
              El estudiante {foundStudentName} tiene un acudiente Activo{" "}
              {foundGuardianName}
            </p>
          </div>
        )}
        {searchStatus === "not_found" && (
          <p className="text-xs text-error">
            No se encontró ningún estudiante con esa identificación.
          </p>
        )}
        {errors.fk_estudiante && (
          <p className="text-xs text-error">{errors.fk_estudiante}</p>
        )}
      </div>

      {searchStatus === "found" && !hasActiveGuardian && (
        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-4"
          noValidate
        >
          {/* Primera fila: tipo de documento y número de identificación */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field required error={errors.identificationtype}>
              <TypeDocumentSelector
                id="tour-doctype"
                name="identificationtype"
                value={form.identificationtype}
                onChange={handleChange}
                placeholder="Selecciona un tipo"
                className={input}
              />
            </Field>

            <Field
              label="N.º de identificación"
              required
              error={errors.identification}
            >
              <div className="grid grid-cols-2 gap-2 items-center">
                <input
                  id="tour-identification"
                  type="text"
                  name="identification"
                  value={form.identification}
                  onChange={handleChange}
                  className={input}
                />
                <SimpleButton
                  type="button"
                  msj={guardianCheckStatus === "loading" ? "Validando..." : ""}
                  icon="Search"
                  msjtooltip="Verificar si el acudiente ya está registrado en la institución"
                  bg="bg-primary"
                  text="text-surface"
                  disabled={guardianCheckStatus === "loading" || loading}
                  onClick={handleCheckGuardian}
                  className="w-auto shrink-0"
                />
              </div>
            </Field>
          </div>

          {/* Si el acudiente ya está registrado se abre el modal de confirmación */}
          {guardianCheckStatus === "not_found" && (
            <p className="text-xs text-success font-medium">
              El número de identificación no está registrado como acudiente en
              la institución.
            </p>
          )}

          {/* Segunda fila: resto de datos */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4">
            {/* Primer nombre */}
            <Field label="Primer nombre" required error={errors.first_name}>
              <input
                id="tour-firstname"
                type="text"
                name="first_name"
                value={form.first_name}
                onChange={handleChange}
                className={input}
              />
            </Field>

            {/* Segundo nombre */}
            <Field label="Segundo nombre" error={errors.second_name}>
              <input
                id="tour-secondname"
                type="text"
                name="second_name"
                value={form.second_name}
                onChange={handleChange}
                className={input}
              />
            </Field>

            {/* Primer apellido */}
            <Field
              label="Primer apellido"
              required
              error={errors.first_lastname}
            >
              <input
                id="tour-firstlastname"
                type="text"
                name="first_lastname"
                value={form.first_lastname}
                onChange={handleChange}
                className={input}
              />
            </Field>

            {/* Segundo apellido */}
            <Field label="Segundo apellido" error={errors.second_lastname}>
              <input
                id="tour-secondlastname"
                type="text"
                name="second_lastname"
                value={form.second_lastname}
                onChange={handleChange}
                className={input}
              />
            </Field>

            {/* Teléfono */}
            <Field label="Teléfono" required error={errors.telephone}>
              <input
                id="tour-telephone"
                type="tel"
                name="telephone"
                value={form.telephone}
                onChange={handleChange}
                className={input}
              />
            </Field>

            {/* Correo electrónico */}
            <Field label="Correo electrónico" error={errors.email}>
              <input
                id="tour-email"
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                className={input}
              />
            </Field>

            {/* Contraseña */}
            <Field label="Contraseña" required error={errors.password}>
              <input
                id="tour-password"
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                autoComplete="new-password"
                className={input}
              />
            </Field>
          </div>

          <div id="tour-submit" className="w-full flex justify-center mt-2">
            <div className="w-1/2">
              <SimpleButton
                type="submit"
                msj={loading ? "Registrando..." : "Registrar acudiente"}
                text="text-surface"
                bg="bg-accent"
                icon="Save"
                disabled={loading}
              />
            </div>
          </div>
        </form>
      )}

      <Modal
        isOpen={showAssignModal}
        onClose={() => !assignLoading && setShowAssignModal(false)}
        title="Acudiente ya registrado"
        size="md"
      >
        <p className="text-sm text-on-surface">
          Este número de identificación ya está registrado para la institución
          como acudiente:{" "}
          <span className="font-semibold">
            {guardianRegisteredStudents[0]?.acudiente || ""}
          </span>{" "}
          del estudiante:{" "}
          <span className="font-semibold">
            {guardianRegisteredStudents[0]?.estudiante || ""}
          </span>
          . ¿Desea asignar el estudiante{" "}
          <span className="font-semibold">{foundStudentName}</span> a este
          acudiente?
        </p>
        <div className="w-full flex justify-end gap-2 mt-6">
          <SimpleButton
            type="button"
            msj="No"
            text="text-surface"
            bg="bg-error"
            disabled={assignLoading}
            onClick={() => {
              setShowAssignModal(false);
              setGuardianCheckStatus("idle");
              setGuardianRegisteredStudents([]);
              setForm((prev) => ({ ...prev, identification: "" }));
            }}
            className="w-auto px-4 py-2"
          />
          <SimpleButton
            type="button"
            msj={assignLoading ? "Asignando..." : "Sí"}
            text="text-surface"
            bg="bg-accent"
            icon="Check"
            disabled={assignLoading}
            onClick={handleConfirmAssign}
            className="w-auto px-4 py-2"
          />
        </div>
      </Modal>
    </div>
  );
};

export default RegisterParents;
