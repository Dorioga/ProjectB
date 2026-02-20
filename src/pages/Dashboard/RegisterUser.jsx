import React, { useEffect, useMemo, useState } from "react";
import { sha256 } from "js-sha256";
import Loader from "../../components/atoms/Loader";
import SimpleButton from "../../components/atoms/SimpleButton";
import tourRegisterUser from "../../tour/tourRegisterUser";
import RoleSelector from "../../components/molecules/RoleSelector";
import TypeDocumentSelector from "../../components/molecules/TypeDocumentSelector";
import InstitutionSelector from "../../components/molecules/InstitutionSelector";
import useSchool from "../../lib/hooks/useSchool";
import useData from "../../lib/hooks/useData";
import useAuth from "../../lib/hooks/useAuth";
import {
  required,
  isEmail,
  minLength,
  isText,
  matchesPattern,
} from "../../utils/validationUtils";

const RegisterUser = () => {
  const { schools, loading, reload } = useSchool();
  const { registerUser, loadingRegisterUser, errorRegisterUser } = useData();
  const { idInstitution, rol } = useAuth();

  const [formData, setFormData] = useState({
    identificationtype: "",
    identification: "",
    telephone: "",
    email: "",
    first_name: "",
    second_name: "",
    first_lastname: "",
    second_lastname: "",
    password: "",
    role: "",
    idInstitution: "",
  });

  const [formErrors, setFormErrors] = useState({});

  // Cargar las escuelas cuando se monta el componente
  useEffect(() => {
    reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const institutionOptions = useMemo(() => {
    const source = Array.isArray(schools) ? schools : [];
    return source
      .filter(Boolean)
      .map((s) => {
        const id = String(s?.id ?? s?._id ?? "").trim();
        const name = String(
          s?.name ?? s?.nombre ?? s?.school_name ?? id,
        ).trim();
        return { id, name };
      })
      .filter((x) => x.id);
  }, [schools]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    // actualizar valor
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // validar campo al vuelo
    const fieldValidation = validateField(name, value);
    setFormErrors((prev) => ({ ...prev, [name]: fieldValidation }));
  };

  const validateField = (name, value) => {
    // devuelve null si válido o mensaje de error
    switch (name) {
      case "identificationtype": {
        const r = required(value, "Selecciona un tipo de documento");
        return r.valid ? null : r.msg;
      }
      case "identification": {
        const r = required(value, "Número de identificación requerido");
        if (!r.valid) return r.msg;
        const digits = matchesPattern(value, /^[0-9]+$/, "Sólo dígitos");
        if (!digits.valid) return digits.msg;
        const min = minLength(value, 6, "Número demasiado corto");
        return min.valid ? null : min.msg;
      }
      case "telephone": {
        if (!value) return null; // opcional
        const ok = matchesPattern(
          value,
          /^[0-9+\s\-()]{7,}$/,
          "Teléfono inválido",
        );
        return ok.valid ? null : ok.msg;
      }
      case "email": {
        const r = required(value, "Correo requerido");
        if (!r.valid) return r.msg;
        const e = isEmail(value, "Correo inválido");
        return e.valid ? null : e.msg;
      }
      case "first_name": {
        const r = required(value, "Primer nombre requerido");
        if (!r.valid) return r.msg;
        const t = isText(value, "Sólo letras y espacios");
        return t.valid ? null : t.msg;
      }
      case "second_name": {
        if (!value) return null;
        const t = isText(value, "Sólo letras y espacios");
        return t.valid ? null : t.msg;
      }
      case "first_lastname": {
        const r = required(value, "Primer apellido requerido");
        if (!r.valid) return r.msg;
        const t = isText(value, "Sólo letras y espacios");
        return t.valid ? null : t.msg;
      }
      case "second_lastname": {
        if (!value) return null;
        const t = isText(value, "Sólo letras y espacios");
        return t.valid ? null : t.msg;
      }
      case "password": {
        const r = required(value, "Contraseña requerida");
        if (!r.valid) return r.msg;
        const m = minLength(value, 6, "Mínimo 6 caracteres");
        return m.valid ? null : m.msg;
      }
      case "role": {
        const r = required(value, "Selecciona un rol");
        return r.valid ? null : r.msg;
      }
      case "idInstitution": {
        // si el selector está visible, es requerido
        if (["2", "3", "4"].includes(rol)) return null;
        const r = required(value, "Selecciona una institución");
        return r.valid ? null : r.msg;
      }
      default:
        return null;
    }
  };

  const validateForm = () => {
    const keys = Object.keys(formData);
    const errors = {};
    keys.forEach((k) => {
      const msg = validateField(k, formData[k]);
      if (msg) errors[k] = msg;
    });
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const payload = {
      ...formData,
      password: formData.password ? sha256(formData.password) : "",
      // Convertir a número los campos especificados
      identificationtype: parseInt(formData.identificationtype, 10) || 0,
      role: parseInt(formData.role, 10) || 0,
    };

    // Si el rol es 2, 3 o 4, excluir idInstitution del payload
    if (["2", "3", "4"].includes(rol)) {
      payload.idInstitution = parseInt(idInstitution, 10);
    } else {
      // Convertir idInstitution a número
      payload.idInstitution = parseInt(formData.idInstitution, 10);
    }

    console.log("Payload a enviar:", payload);

    try {
      const res = await registerUser(payload);
      console.log("Usuario registrado:", res);
    } catch (err) {
      console.error("Error registrando usuario:", err);
    }
  };

  return (
    <div className=" p-6  h-full gap-4 flex flex-col">
      <div className="w-full grid grid-cols-5 justify-between items-center  p-2 rounded-t-lg">
        <h2 className="col-span-4 font-bold text-2xl">Registrar Usuario</h2>
        <SimpleButton
          type="button"
          onClick={tourRegisterUser}
          icon="HelpCircle"
          msjtooltip="Iniciar tutorial"
          noRounded={false}
          bg="bg-info"
          text="text-surface"
          className="w-auto px-3 py-1.5"
        />
      </div>

      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 md:grid-cols-3 gap-4"
      >
        {(loadingRegisterUser || errorRegisterUser) && (
          <div className="md:col-span-3 flex flex-col gap-2">
            {loadingRegisterUser && <Loader message="Registrando…" />}
            {!loadingRegisterUser && errorRegisterUser && (
              <div className="p-3 rounded border border-error bg-error/10 text-error">
                {errorRegisterUser?.message || "Ocurrió un error."}
              </div>
            )}
          </div>
        )}

        <div className="md:col-span-3 font-bold">Información personal</div>

        <div id="tour-doctype">
          <TypeDocumentSelector
            name="identificationtype"
            value={formData.identificationtype}
            onChange={handleChange}
            placeholder="Selecciona un tipo"
            disabled={loadingRegisterUser}
          />
        </div>

        <div id="tour-identification">
          <label>N.º de identificación</label>
          <input
            type="text"
            name="identification"
            value={formData.identification}
            onChange={handleChange}
            className={`w-full p-2 border rounded bg-surface ${formErrors.identification ? "border-error" : ""}`}
            disabled={loadingRegisterUser}
          />
          {formErrors.identification ? (
            <p className="text-sm text-red-600 mt-1">
              {formErrors.identification}
            </p>
          ) : null}
        </div>

        <div id="tour-telephone">
          <label>Teléfono</label>
          <input
            type="tel"
            name="telephone"
            value={formData.telephone}
            onChange={handleChange}
            className={`w-full p-2 border rounded bg-surface ${formErrors.telephone ? "border-error" : ""}`}
            disabled={loadingRegisterUser}
          />
          {formErrors.telephone ? (
            <p className="text-sm text-red-600 mt-1">{formErrors.telephone}</p>
          ) : null}
        </div>

        <div id="tour-email">
          <label>Correo</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className={`w-full p-2 border rounded bg-surface ${formErrors.email ? "border-error" : ""}`}
            disabled={loadingRegisterUser}
          />
          {formErrors.email ? (
            <p className="text-sm text-red-600 mt-1">{formErrors.email}</p>
          ) : null}
        </div>

        <div id="tour-firstname">
          <label>Primer nombre</label>
          <input
            type="text"
            name="first_name"
            value={formData.first_name}
            onChange={handleChange}
            className={`w-full p-2 border rounded bg-surface ${formErrors.first_name ? "border-error" : ""}`}
            disabled={loadingRegisterUser}
          />
          {formErrors.first_name ? (
            <p className="text-sm text-red-600 mt-1">{formErrors.first_name}</p>
          ) : null}
        </div>

        <div id="tour-secondname">
          <label>Segundo nombre</label>
          <input
            type="text"
            name="second_name"
            value={formData.second_name}
            onChange={handleChange}
            className={`w-full p-2 border rounded bg-surface ${formErrors.second_name ? "border-error" : ""}`}
            disabled={loadingRegisterUser}
          />
          {formErrors.second_name ? (
            <p className="text-sm text-red-600 mt-1">
              {formErrors.second_name}
            </p>
          ) : null}
        </div>

        <div id="tour-firstlastname">
          <label>Primer apellido</label>
          <input
            type="text"
            name="first_lastname"
            value={formData.first_lastname}
            onChange={handleChange}
            className={`w-full p-2 border rounded bg-surface ${formErrors.first_lastname ? "border-error" : ""}`}
            disabled={loadingRegisterUser}
          />
          {formErrors.first_lastname ? (
            <p className="text-sm text-red-600 mt-1">
              {formErrors.first_lastname}
            </p>
          ) : null}
        </div>

        <div id="tour-secondlastname">
          <label>Segundo apellido</label>
          <input
            type="text"
            name="second_lastname"
            value={formData.second_lastname}
            onChange={handleChange}
            className={`w-full p-2 border rounded bg-surface ${formErrors.second_lastname ? "border-error" : ""}`}
            disabled={loadingRegisterUser}
          />
          {formErrors.second_lastname ? (
            <p className="text-sm text-red-600 mt-1">
              {formErrors.second_lastname}
            </p>
          ) : null}
        </div>

        <div id="tour-contact-info" className="md:col-span-3 font-bold mt-4">
          Acceso
        </div>

        <div id="tour-password">
          <label>Contraseña</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className={`w-full p-2 border rounded bg-surface ${formErrors.password ? "border-error" : ""}`}
            disabled={loadingRegisterUser}
          />
          {formErrors.password ? (
            <p className="text-sm text-red-600 mt-1">{formErrors.password}</p>
          ) : null}
        </div>

        <div id="tour-role">
          <RoleSelector
            name="role"
            value={formData.role}
            onChange={handleChange}
            placeholder="Selecciona un rol"
            disabled={loadingRegisterUser}
          />
        </div>

        {![".2", "3", "4"].includes(rol) && (
          <div id="tour-institution">
            <InstitutionSelector
              name="idInstitution"
              label="Institución"
              value={formData.idInstitution}
              onChange={handleChange}
              placeholder="Selecciona una institución"
              className="w-full p-2 border rounded bg-surface"
              disabled={loadingRegisterUser}
            />
          </div>
        )}

        <div
          id="tour-submit"
          className="md:col-span-3 mt-4 flex justify-center"
        >
          <div className="w-full md:w-1/2">
            <SimpleButton
              msj={loadingRegisterUser ? "Registrando..." : "Registrar usuario"}
              text={"text-surface"}
              bg={"bg-accent"}
              icon={"Save"}
              disabled={
                loadingRegisterUser || Object.values(formErrors).some(Boolean)
              }
            />
            {Object.values(formErrors).some(Boolean) ? (
              <p className="mt-2 text-sm text-red-600">
                Corrige los errores del formulario antes de continuar.
              </p>
            ) : null}
          </div>
        </div>
      </form>
    </div>
  );
};

export default RegisterUser;
