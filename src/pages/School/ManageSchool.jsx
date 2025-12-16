import React, { useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import ProgressPage from "../../components/atoms/progressPage";
import FileChooser from "../../components/atoms/FileChooser";
import SimpleButton from "../../components/atoms/SimpleButton";
import ThemeModal from "../../components/molecules/ThemeModal";
import JourneySelect from "../../components/atoms/JourneySelect";

const ManageSchool = ({ mode: modeProp }) => {
  const params = useParams();
  const modeFromParams = params?.mode;
  const mode = (modeProp ?? modeFromParams ?? "register").toLowerCase();
  const isUpdate = mode === "update";

  const [formData, setFormData] = useState({
    name: "",
    address: "",
    phone: "",
    email: "",
    principalName: "",
    signaturePrincipal: "",
    coordinadorName: "",
    logo: null,
    sedes: [],
  });

  const [isThemeModalOpen, setIsThemeModalOpen] = useState(false);

  const title = useMemo(() => {
    return isUpdate ? "Actualizar institución" : "Registrar nueva institución";
  }, [isUpdate]);

  const primaryButtonLabel = useMemo(() => {
    return isUpdate ? "Actualizar institución" : "Registrar institución";
  }, [isUpdate]);

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "file" ? files?.[0] : value,
    }));
  };

  const addSede = () => {
    setFormData((prev) => ({
      ...prev,
      sedes: [
        ...(Array.isArray(prev.sedes) ? prev.sedes : []),
        {
          name: "",
          address: "",
          tel: "",
          jornada: "",
          journeys: "",
        },
      ],
    }));
  };

  const updateSedeField = (index, field, value) => {
    setFormData((prev) => ({
      ...prev,
      sedes: (Array.isArray(prev.sedes) ? prev.sedes : []).map((sede, i) =>
        i === index
          ? {
              ...sede,
              [field]: value,
              ...(field === "jornada" ? { journeys: value } : {}),
            }
          : sede
      ),
    }));
  };

  const removeSede = (index) => {
    setFormData((prev) => ({
      ...prev,
      sedes: (Array.isArray(prev.sedes) ? prev.sedes : []).filter(
        (_, i) => i !== index
      ),
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const dataToSend = new FormData();
    for (const key in formData) {
      if (key === "sedes") {
        dataToSend.append(key, JSON.stringify(formData.sedes ?? []));
        continue;
      }

      dataToSend.append(key, formData[key]);
    }

    console.log(`Formulario para ${isUpdate ? "actualizar" : "registrar"}:`);
    for (let [key, value] of dataToSend.entries()) {
      console.log(`${key}:`, value);
    }
  };

  return (
    <div className="border p-6 rounded bg-bg h-full gap-4 flex flex-col">
      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 md:grid-cols-2 gap-4"
      >
        <h2 className="text-xl font-semibold mb-2 md:col-span-2">{title}</h2>

        <div className="md:col-span-2">
          <label>Nombre de la institución</label>
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
          <label>Correo electrónico</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full p-2 border rounded bg-white"
          />
        </div>

        <div>
          <label>Nombre del director</label>
          <input
            type="text"
            name="principalName"
            value={formData.principalName}
            onChange={handleChange}
            className="w-full p-2 border rounded bg-white"
          />
        </div>

        <div>
          <label>Firma del director</label>
          <FileChooser
            name="signaturePrincipal"
            onChange={handleChange}
            className="w-full p-2 border rounded"
          />
        </div>

        <div className="md:col-span-2">
          <label>Nombre del coordinador</label>
          <input
            type="text"
            name="coordinadorName"
            value={formData.coordinadorName}
            onChange={handleChange}
            className="w-full p-2 border rounded bg-white"
          />
        </div>

        <div>
          <label>Logo de la institución</label>
          <FileChooser
            name="logo"
            onChange={handleChange}
            className="w-full p-2 border rounded"
          />
        </div>

        {isUpdate ? (
          <div>
            <label>Tema</label>
            <SimpleButton
              type="button"
              onClick={() => setIsThemeModalOpen(true)}
              className="mt-2"
              msj={"Modificar tema"}
              icon={"Pencil"}
              text={"text-white"}
              bg={"bg-accent"}
            />
          </div>
        ) : null}

        {!isUpdate ? (
          <div className="md:col-span-2 mt-2 border-t pt-4">
            <h3 className="text-lg font-semibold mb-2">Sedes</h3>

            <div className="flex justify-center ">
              <div className="w-2/5">
                <SimpleButton
                  type="button"
                  onClick={addSede}
                  msj={"Agregar sede"}
                  icon={"Plus"}
                  text={"text-white"}
                  bg={"bg-accent"}
                />
              </div>
            </div>

            {Array.isArray(formData.sedes) && formData.sedes.length > 0 ? (
              <div className="mt-4 grid grid-cols-1 gap-3">
                {formData.sedes.map((sede, index) => (
                  <div
                    key={`${sede?.name || "sede"}-${index}`}
                    className="border rounded p-4 bg-white"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <p className="font-semibold">Sede #{index + 1}</p>
                      <div>
                        <SimpleButton
                          type="button"
                          onClick={() => removeSede(index)}
                          msj={"Borrar"}
                          icon={"Trash2"}
                          text={"text-white"}
                          bg={"bg-red-600"}
                          className="w-auto px-3"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label>Nombre</label>
                        <input
                          type="text"
                          value={sede?.name ?? ""}
                          onChange={(e) =>
                            updateSedeField(index, "name", e.target.value)
                          }
                          className="w-full p-2 border rounded bg-white"
                        />
                      </div>

                      <div>
                        <label>Teléfono</label>
                        <input
                          type="text"
                          value={sede?.tel ?? ""}
                          onChange={(e) =>
                            updateSedeField(index, "tel", e.target.value)
                          }
                          className="w-full p-2 border rounded bg-white"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label>Dirección</label>
                        <input
                          type="text"
                          value={sede?.address ?? ""}
                          onChange={(e) =>
                            updateSedeField(index, "address", e.target.value)
                          }
                          className="w-full p-2 border rounded bg-white"
                        />
                      </div>

                      <JourneySelect
                        label="Jornada"
                        name="jornada"
                        value={sede?.jornada ?? sede?.journeys ?? ""}
                        onChange={(e) =>
                          updateSedeField(index, "jornada", e.target.value)
                        }
                        className="w-full p-2 border rounded bg-white"
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        ) : null}

        <div className="md:col-span-2 mt-4">
          <SimpleButton
            msj={primaryButtonLabel}
            icon={"Save"}
            text={"text-white"}
            bg={"bg-accent"}
          />
        </div>
      </form>

      {!isUpdate ? (
        <div className="mt-4 border-t pt-4">
          <ProgressPage />
        </div>
      ) : null}

      {isUpdate ? (
        <ThemeModal
          isOpen={isThemeModalOpen}
          onClose={() => setIsThemeModalOpen(false)}
        />
      ) : null}
    </div>
  );
};

export default ManageSchool;
