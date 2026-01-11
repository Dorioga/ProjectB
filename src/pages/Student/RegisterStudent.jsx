import React, { useState } from "react";
import FileChooser from "../../components/atoms/FileChooser";
import SimpleButton from "../../components/atoms/SimpleButton";
import ProgressPage from "../../components/atoms/progressPage";
import SedeSelect from "../../components/atoms/SedeSelect";
import JourneySelect from "../../components/atoms/JourneySelect";
import BecaSelector from "../../components/atoms/BecaSelector";
import TypeDocumentSelector from "../../components/molecules/TypeDocumentSelector";
import useStudent from "../../lib/hooks/useStudent";
import Loader from "../../components/atoms/Loader";

const RegisterStudent = () => {
  const { registerStudent, loading, error } = useStudent();
  const [successMessage, setSuccessMessage] = useState("");
  const [formData, setFormData] = useState({
    first_name: "",
    second_name: "",
    first_lastname: "",
    second_lastname: "",
    telephone: "",
    email: "",
    identification: "",
    identificationtype: "",
    sede: "",
    password: "",
    workday: "",
    fecha_nacimiento: "",
    direccion: "",
    gender: "",
    photo_link: null,
    nui: "",
    per_id: "",
    fk_beca: "",
    link_identificacion: null,
    link_habeas: null,
  });

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "file" ? files[0] : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMessage(""); // Limpiar mensaje previo

    try {
      const dataToSend = new FormData();

      // Agrega todos los campos del estado al FormData
      // Convierte null a string vacío antes de agregar
      for (const key in formData) {
        const value = formData[key];
        // Si el valor es null, enviamos string vacío
        // Si es un archivo (File object), lo enviamos tal cual
        if (value === null) {
          dataToSend.append(key, "");
        } else if (value instanceof File) {
          dataToSend.append(key, value);
        } else {
          dataToSend.append(key, value);
        }
      }

      // Mostrar el contenido del FormData antes de enviar
      console.log("=== FormData a enviar ===");
      for (let [key, value] of dataToSend.entries()) {
        if (value instanceof File) {
          console.log(`${key}: [File] ${value.name} (${value.size} bytes)`);
        } else {
          console.log(`${key}: ${value}`);
        }
      }
      console.log("=========================");

      // Enviar los datos al backend
      const result = await registerStudent(dataToSend);

      console.log("¡Estudiante registrado exitosamente!", result);
      setSuccessMessage("¡Estudiante registrado exitosamente!");

      // Limpiar el formulario después del registro exitoso
      setFormData({
        first_name: "",
        second_name: "",
        first_lastname: "",
        second_lastname: "",
        telephone: "",
        email: "",
        identification: "",
        identificationtype: "",
        sede: "",
        password: "",
        workday: "",
        fecha_nacimiento: "",
        direccion: "",
        gender: "",
        photo_link: null,
        nui: "",
        per_id: "",
        fk_beca: "",
        link_identificacion: null,
        link_habeas: null,
      });

      // Limpiar mensaje de éxito después de 5 segundos
      setTimeout(() => setSuccessMessage(""), 5000);
    } catch (err) {
      console.error("Error al registrar estudiante:", err);
    }
  };

  return (
    <div className="border p-6 rounded bg-bg h-full gap-4 flex flex-col">
      <h2 className="text-xl font-semibold mb-4">Registrar estudiante</h2>
      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 md:grid-cols-3 gap-4"
      >
        {/* -- Campos del formulario -- */}
        <div className="md:col-span-3 font-bold">Información personal</div>
        <TypeDocumentSelector
          name="identificationtype"
          label="Tipo de documento"
          value={formData.identificationtype}
          onChange={handleChange}
          placeholder="Selecciona un tipo de documento"
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
          <label>NUI</label>
          <input
            type="text"
            name="nui"
            value={formData.nui}
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
        <div>
          <label>Género</label>
          <select
            name="gender"
            value={formData.gender}
            onChange={handleChange}
            className="w-full p-2 border rounded bg-white"
          >
            <option value=""></option>
            <option value="Masculino">Masculino</option>
            <option value="Femenino">Femenino</option>
          </select>
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
          <label>Teléfono</label>
          <input
            type="tel"
            name="telephone"
            value={formData.telephone}
            onChange={handleChange}
            className="w-full p-2 border rounded bg-white"
          />
        </div>
        <div>
          <label>Email</label>
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
            name="direccion"
            value={formData.direccion}
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

        <div className="md:col-span-3 font-bold mt-4">
          Información académica
        </div>
        <SedeSelect
          name="sede"
          label="Sede"
          value={formData.sede}
          onChange={handleChange}
          placeholder="Selecciona una sede"
        />
        <JourneySelect
          name="workday"
          label="Jornada"
          value={formData.workday}
          onChange={handleChange}
          placeholder="Selecciona una jornada"
          includeAmbas={false}
        />
        <BecaSelector
          name="fk_beca"
          label="Beca"
          value={formData.fk_beca}
          onChange={handleChange}
          placeholder="Selecciona una beca"
        />
        <div>
          <label>PER ID</label>
          <input
            type="text"
            name="per_id"
            value={formData.per_id}
            onChange={handleChange}
            className="w-full p-2 border rounded bg-white"
          />
        </div>

        <div className="md:col-span-3 font-bold mt-4">
          Documentos y archivos
        </div>
        <div>
          <label>Foto del estudiante</label>
          <FileChooser name="photo_link" onChange={handleChange} />
        </div>
        <div>
          <label>Documento de identificación</label>
          <FileChooser name="link_identificacion" onChange={handleChange} />
        </div>
        <div>
          <label>Habeas Data</label>
          <FileChooser name="link_habeas" onChange={handleChange} />
        </div>

        <div className="md:col-span-3 mt-4 flex flex-col items-center gap-4">
          {loading && <Loader message="Registrando estudiante..." />}

          {successMessage && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded w-full max-w-md text-center">
              {successMessage}
            </div>
          )}

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded w-full max-w-md text-center">
              Error:{" "}
              {error.message || "Ocurrió un error al registrar el estudiante"}
            </div>
          )}

          {!loading && (
            <SimpleButton
              msj="Registrar estudiante"
              text={"text-white"}
              bg={"bg-accent"}
              icon={"Save"}
            />
          )}
        </div>
      </form>
      <ProgressPage />
    </div>
  );
};

export default RegisterStudent;
