import React, { useMemo, useState } from "react";
import { sha256 } from "js-sha256";
import Loader from "../../components/atoms/Loader";
import SimpleButton from "../../components/atoms/SimpleButton";
import RoleSelector from "../../components/molecules/RoleSelector";
import TypeDocumentSelector from "../../components/molecules/TypeDocumentSelector";
import useSchool from "../../lib/hooks/useSchool";
import useData from "../../lib/hooks/useData";

const RegisterUser = () => {
  const { schools, loading } = useSchool();
  const { registerUser, loadingRegisterUser, errorRegisterUser } = useData();

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
    institutionId: "",
  });

  const institutionOptions = useMemo(() => {
    const source = Array.isArray(schools) ? schools : [];
    return source
      .filter(Boolean)
      .map((s) => {
        const id = String(s?.id ?? s?._id ?? "").trim();
        const name = String(
          s?.name ?? s?.nombre ?? s?.school_name ?? id
        ).trim();
        return { id, name };
      })
      .filter((x) => x.id);
  }, [schools]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      ...formData,
      password: formData.password ? sha256(formData.password) : "",
    };

    const fd = new FormData();
    for (const [key, value] of Object.entries(payload)) {
      fd.append(key, value ?? "");
    }

    try {
      const res = await registerUser(fd);
      console.log("Usuario registrado:", res);
    } catch (err) {
      console.error("Error registrando usuario:", err);
    }
  };

  return (
    <div className="border p-6 rounded bg-bg h-full gap-4 flex flex-col">
      <h2 className="font-bold text-2xl">Registrar Usuario</h2>

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

        <TypeDocumentSelector
          name="identificationtype"
          value={formData.identificationtype}
          onChange={handleChange}
          placeholder="Selecciona un tipo"
          disabled={loadingRegisterUser}
        />

        <div>
          <label>N.º de identificación</label>
          <input
            type="text"
            name="identification"
            value={formData.identification}
            onChange={handleChange}
            className="w-full p-2 border rounded bg-white"
            disabled={loadingRegisterUser}
          />
        </div>

        <div>
          <label>Teléfono</label>
          <input
            type="tel"
            name="telephone"
            value={formData.telephone}
            onChange={handleChange}
            className="w-full p-2 border rounded bg-white"
            disabled={loadingRegisterUser}
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
            disabled={loadingRegisterUser}
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
            disabled={loadingRegisterUser}
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
            disabled={loadingRegisterUser}
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
            disabled={loadingRegisterUser}
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
            disabled={loadingRegisterUser}
          />
        </div>

        <div className="md:col-span-3 font-bold mt-4">Acceso</div>

        <div>
          <label>Contraseña</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className="w-full p-2 border rounded bg-white"
            disabled={loadingRegisterUser}
          />
        </div>

        <div>
          <RoleSelector
            name="role"
            value={formData.role}
            onChange={handleChange}
            placeholder="Selecciona un rol"
            disabled={loadingRegisterUser}
          />
        </div>

        <div>
          <label>Institución</label>
          <select
            name="institutionId"
            value={formData.institutionId}
            onChange={handleChange}
            className="w-full p-2 border rounded bg-white"
            disabled={loadingRegisterUser}
          >
            <option value="">
              {loading
                ? "Cargando instituciones..."
                : "Selecciona una institución"}
            </option>
            {institutionOptions.map((opt) => (
              <option key={opt.id} value={opt.id}>
                {opt.name}
              </option>
            ))}
          </select>
        </div>

        <div className="md:col-span-3 mt-4 flex justify-center">
          <div className="w-full md:w-1/2">
            <SimpleButton
              msj={loadingRegisterUser ? "Registrando..." : "Registrar usuario"}
              text={"text-white"}
              bg={"bg-accent"}
              icon={"Save"}
              disabled={loadingRegisterUser}
            />
          </div>
        </div>
      </form>
    </div>
  );
};

export default RegisterUser;
