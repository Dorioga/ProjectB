import React, { useState } from "react";
import { sha256 } from "js-sha256";
import SimpleButton from "../../components/atoms/SimpleButton";
import TypeDocumentSelector from "../../components/molecules/TypeDocumentSelector";
import { useNotify } from "../../lib/hooks/useNotify";
import useAuth from "../../lib/hooks/useAuth";
import {
  registerGuardian,
  getStudentByIdentification,
} from "../../services/studentService";
import Loader from "../../components/atoms/Loader";
import tourRegisterParents from "../../tour/tourRegisterParents";

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
  const { idSede, idInstitution } = useAuth();
  const notify = useNotify();

  const [form, setForm] = useState({ ...INITIAL_FORM });
  // sede se resuelve desde el estudiante encontrado o del auth; no se muestra en el form
  const [resolvedSede, setResolvedSede] = useState(
    idSede ? String(idSede) : "",
  );
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const [studentIdInput, setStudentIdInput] = useState("");
  const [foundStudentId, setFoundStudentId] = useState(null);
  const [searchStatus, setSearchStatus] = useState("idle"); // idle | loading | found | not_found

  const handleSearchStudent = async () => {
    const value = studentIdInput.trim();
    if (!value) {
      notify.error("Ingresa un número de identificación para buscar.");
      return;
    }
    setSearchStatus("loading");
    setFoundStudentId(null);
    try {
      const found = await getStudentByIdentification({
        numero_identificacion_estu: Number(value),
        fk_institucion: Number(idInstitution),
      });
      console.log("Estudiante encontrado:", found);
      setFoundStudentId(found.id_estudiante);
      setSearchStatus("found");
      setErrors((prev) => ({ ...prev, fk_estudiante: "" }));
      notify.success(`Estudiante encontrado: ${found.nombre ?? ""}.`);
    } catch (err) {
      setSearchStatus("not_found");
      notify.error(err?.message ?? "Error al buscar el estudiante.");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
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
      sede: Number(resolvedSede),
      password: sha256(form.password.trim()),
      fk_estudiante: Number(foundStudentId),
    };

    setLoading(true);
    try {
      await registerGuardian(payload);
      notify.success("Acudiente registrado correctamente.");
      setForm({ ...INITIAL_FORM });
      setResolvedSede(idSede ? String(idSede) : "");
      setErrors({});
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
          Buscar estudiante por N.º de identificación
        </label>
        <div className="grid grid-cols-5 gap-2  items-center">
          <input
            type="text"
            value={studentIdInput}
            onChange={(e) => {
              setStudentIdInput(e.target.value);
              setSearchStatus("idle");
              setFoundStudentId(null);
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
            ✓ Estudiante vinculado (ID: {foundStudentId})
          </p>
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

      {searchStatus === "found" && (
        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4"
          noValidate
        >
          {/* Tipo de documento */}
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

          {/* N.º de identificación */}
          <Field
            label="N.º de identificación"
            required
            error={errors.identification}
          >
            <input
              id="tour-identification"
              type="text"
              name="identification"
              value={form.identification}
              onChange={handleChange}
              className={input}
            />
          </Field>

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
          <Field label="Primer apellido" required error={errors.first_lastname}>
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

          <div
            id="tour-submit"
            className="w-full flex justify-center md:col-span-5 mt-2"
          >
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
    </div>
  );
};

export default RegisterParents;
