import React, { useState } from "react";
import SimpleButton from "../../components/atoms/SimpleButton";
import ProgressPage from "../../components/atoms/progressPage";
import FileChooser from "../../components/atoms/FileChooser";
import TypeDocumentSelector from "../../components/molecules/TypeDocumentSelector";

const RegisterParents = () => {
  const [formData, setFormData] = useState({
    identificationType: "",
    identification: "",
    fullName: "",
    phone: "",
    idDocumentPhoto: null,
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

    // Enviar al backend con nombres esperados (español),
    // pero mantener el estado del formulario en inglés.
    dataToSend.append("tipo_documento_acudiente", formData.identificationType);
    dataToSend.append(
      "numero_identificacion_acudiente",
      formData.identification,
    );
    dataToSend.append("nombre_acudiente", formData.fullName);
    dataToSend.append("telefono_acudiente", formData.phone);
    dataToSend.append("img_idacudiente", formData.idDocumentPhoto);

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
        <TypeDocumentSelector
          name="identificationType"
          value={formData.identificationType}
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
        <div className="md:col-span-2">
          <label>Nombre completo</label>
          <input
            type="text"
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            className="w-full p-2 border rounded bg-surface"
          />
        </div>
        <div>
          <label>Teléfono</label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            className="w-full p-2 border rounded bg-surface"
          />
        </div>
        <div>
          <label>Foto del documento del acudiente</label>
          <FileChooser
            onChange={(file) =>
              setFormData((prev) => ({ ...prev, idDocumentPhoto: file }))
            }
          />
        </div>
        <div className="md:col-span-2 mt-4">
          <SimpleButton
            msj="Registrar acudiente"
            text={"text-surface"}
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
