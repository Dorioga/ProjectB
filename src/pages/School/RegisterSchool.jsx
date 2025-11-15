import React, { useState } from "react";
import ProgressPage from "../../components/atoms/progressPage";
import FileChooser from "../../components/atoms/FileChooser";
import SimpleButton from "../../components/atoms/SimpleButton";

const RegisterSchool = ({ isUpdate = false }) => {
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    phone: "",
    email: "",
    principalName: "",
    signaturePrincipal: "",
    coordinadorName: "",
    logo: null,
  });

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "file" ? files[0] : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const dataToSend = new FormData();
    for (const key in formData) {
      dataToSend.append(key, formData[key]);
    }

    for (let [key, value] of dataToSend.entries()) {
      console.log(`${key}:`, value);
    }
    // Aquí la lógica para enviar al backend
  };

  return (
    <div className="border p-6 rounded bg-bg h-full gap-4 flex flex-col">
      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 md:grid-cols-2 gap-4"
      >
        <h2 className="text-xl font-semibold mb-2 md:col-span-2">
          {isUpdate ? "Actualizar Institución" : "Registrar Nueva Institución"}
        </h2>
        <div className="md:col-span-2">
          <label>Nombre de la Institución</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full p-2 border rounded bg-white"
            required
          />
        </div>
        <div className="md:col-span-2">
          <label>Dirección</label>
          <input
            type="text"
            name="address"
            value={formData.address}
            onChange={handleChange}
            className="w-full p-2 border rounded bg-white"
          />
        </div>
        <div>
          <label>Teléfono</label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            className="w-full p-2 border rounded bg-white"
          />
        </div>
        <div>
          <label>Correo Electrónico</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full p-2 border rounded bg-white"
          />
        </div>
        <div className="">
          <label>Nombre del Director</label>
          <input
            type="text"
            name="principalName"
            value={formData.principalName}
            onChange={handleChange}
            className="w-full p-2 border rounded bg-white"
          />
        </div>
        <div className="">
          <label>Firma del Director</label>
          <FileChooser
            name="signaturePrincipal"
            onChange={handleChange}
            className="w-full p-2 border rounded"
          />
        </div>
        <div className="md:col-span-2">
          <label>Nombre del Coordinador</label>
          <input
            type="text"
            name="coordinadorName"
            value={formData.coordinadorName}
            onChange={handleChange}
            className="w-full p-2 border rounded bg-white"
          />
        </div>
        <div className="">
          <label>Logo de la Institución</label>
          <FileChooser
            name="logo"
            onChange={handleChange}
            className="w-full p-2 border rounded"
          />
        </div>
        <div className="md:col-span-2 mt-4">
          <SimpleButton
            onClick={() => console.log("Acción secundaria")}
            className="mt-2"
            msj={"Registrar Institucion"}
            icon={"Save"}
            text={"text-white"}
            bg={"bg-accent"}
          ></SimpleButton>
        </div>
      </form>
      <div className="mt-4 border-t pt-4">
        <ProgressPage />
      </div>
    </div>
  );
};

export default RegisterSchool;
