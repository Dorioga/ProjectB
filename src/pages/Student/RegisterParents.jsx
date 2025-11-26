import React, { useState } from "react";
import SimpleButton from "../../components/atoms/SimpleButton";
import ProgressPage from "../../components/atoms/progressPage";
import FileChooser from "../../components/atoms/FileChooser";

const RegisterParents = () => {
  const [formData, setFormData] = useState({
    tipo_documento_acudiente: "",
    numero_identificacion_acudiente: "",
    nombre_acudiente: "",
    telefono_acudiente: "",
    img_idacudiente: null,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const dataToSend = new FormData();

    // Agrega todos los campos del estado al FormData
    for (const key in formData) {
      dataToSend.append(key, formData[key]);
    }

    // Aquí puedes ver el contenido del FormData
    console.log("FormData a enviar:");
    for (let [key, value] of dataToSend.entries()) {
      console.log(`${key}:`, value);
    }

    // Aquí iría la lógica para enviar los datos al backend
    // ej: await parentService.register(dataToSend);
  };

  return (
    <div className="border p-6 rounded bg-bg h-full gap-4 flex flex-col">
      <h2 className="text-xl font-semibold mb-4">Registrar acudiente</h2>
      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 md:grid-cols-2 gap-4"
      >
        <div>
          <label>Tipo de documento</label>
          <select
            name="tipo_documento_acudiente"
            value={formData.tipo_documento_acudiente}
            onChange={handleChange}
            className="w-full p-2 border rounded bg-white"
          >
            <option value=""></option>
            <option value="CC">Cédula de Ciudadanía</option>
            <option value="CE">Cédula de Extranjería</option>
            <option value="PA">Pasaporte</option>
          </select>
        </div>
        <div>
          <label>N.º de identificación</label>
          <input
            type="text"
            name="numero_identificacion_acudiente"
            value={formData.numero_identificacion_acudiente}
            onChange={handleChange}
            className="w-full p-2 border rounded bg-white"
          />
        </div>
        <div className="md:col-span-2">
          <label>Nombre completo</label>
          <input
            type="text"
            name="nombre_acudiente"
            value={formData.nombre_acudiente}
            onChange={handleChange}
            className="w-full p-2 border rounded bg-white"
          />
        </div>
        <div>
          <label>Teléfono</label>
          <input
            type="tel"
            name="telefono_acudiente"
            value={formData.telefono_acudiente}
            onChange={handleChange}
            className="w-full p-2 border rounded bg-white"
          />
        </div>
        <div>
          <label>Foto del documento del acudiente</label>
          <FileChooser name="img_idacudiente" onChange={handleChange} />
        </div>
        <div className="md:col-span-2 mt-4">
          <SimpleButton
            msj="Registrar acudiente"
            text={"text-white"}
            bg={"bg-accent"}
            icon={"Save"}
          />
        </div>

        <ProgressPage />
      </form>
    </div>
  );
};

export default RegisterParents;
