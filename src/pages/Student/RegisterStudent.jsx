import React, { useState } from "react";
import FileChooser from "../../components/atoms/FileChooser";
import SimpleButton from "../../components/atoms/SimpleButton";
import ProgressPage from "../../components/atoms/progressPage";

const RegisterStudent = () => {
  const [formData, setFormData] = useState({
    journey: "",
    grade_scholar: "",
    group_grade: "",
    nui: "",
    identification: "",
    identificationType: "",
    first_lastname: "",
    second_lastname: "",
    first_name: "",
    second_name: "",
    genre: "",
    birthday: "",
    habeas_data: "",
    url_photo: null,
    reasigned: "",
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
    // ej: await studentService.register(dataToSend);
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
        <div>
          <label>Tipo de documento</label>
          <select
            name="identificationType"
            value={formData.identificationType}
            onChange={handleChange}
            className="w-full p-2 border rounded bg-white"
          >
            <option value=""></option>
            <option value="RC">RC</option>
            <option value="TI">TI</option>
            <option value="CC">CC</option>
          </select>
        </div>
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
            name="genre"
            value={formData.genre}
            onChange={handleChange}
            className="w-full p-2 border rounded bg-white"
          >
            <option value="MASCULINO">Masculino</option>
            <option value="FEMENINO">Femenino</option>
          </select>
        </div>
        <div>
          <label>Fecha de nacimiento</label>
          <input
            type="date"
            name="birthday"
            value={formData.birthday}
            onChange={handleChange}
            className="w-full p-2 border rounded bg-white"
          />
        </div>

        <div className="md:col-span-3 font-bold mt-4">
          Información académica
        </div>
        <div>
          <label>Jornada</label>
          <select
            name="journey"
            value={formData.journey}
            onChange={handleChange}
            className="w-full p-2 border rounded bg-white"
          >
            <option value="MAÑANA">Mañana</option>
            <option value="TARDE">Tarde</option>
            <option value="NOCHE">Noche</option>
          </select>
        </div>
        <div>
          <label>Grado</label>
          <input
            type="text"
            name="grade_scholar"
            value={formData.grade_scholar}
            onChange={handleChange}
            className="w-full p-2 border rounded bg-white"
          />
        </div>
        <div>
          <label>Grupo</label>
          <input
            type="text"
            name="group_grade"
            value={formData.group_grade}
            onChange={handleChange}
            className="w-full p-2 border rounded bg-white"
          />
        </div>

        <div className="md:col-span-3 font-bold mt-4">
          Datos complementarios
        </div>
        <div>
          <label>Foto del estudiante</label>
          <FileChooser name="url_photo" onChange={handleChange} />
        </div>
        <div>
          <label>Reasignado</label>
          <select
            name="reasigned"
            value={formData.reasigned}
            onChange={handleChange}
            className="w-full p-2 border rounded bg-white"
          >
            <option value=""></option>
            <option value={true}>Sí</option>
            <option value={false}>No</option>
          </select>
        </div>
        <div className="flex items-center justify-center gap-2">
          <input
            type="checkbox"
            name="habeas_data"
            checked={formData.habeas_data === "Sí"}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                habeas_data: e.target.checked ? "Sí" : "No",
              }))
            }
          />
          <label>¿Acepta Habeas Data?</label>
        </div>

        <div className="md:col-span-3 mt-4 flex justify-center ">
          <SimpleButton
            msj="Registrar estudiante"
            text={"text-white"}
            bg={"bg-accent"}
            icon={"Save"}
          />
        </div>
      </form>
      <ProgressPage />
    </div>
  );
};

export default RegisterStudent;
