import React, { useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import ProgressPage from "../../components/atoms/progressPage";
import FileChooser from "../../components/atoms/FileChooser";
import SimpleButton from "../../components/atoms/SimpleButton";
import ThemeModal from "../../components/molecules/ThemeModal";
import JourneySelect from "../../components/atoms/JourneySelect";
import DepartmentSelector from "../../components/molecules/DepartmentSelector";
import CitySelector from "../../components/molecules/CitySelector";
import { getInputClassName, getLabelClassName } from "../../utils/cssUtils";
import useSchool from "../../lib/hooks/useSchool";

const ManageSchool = ({ mode: modeProp, schoolId }) => {
  const params = useParams();
  const modeFromParams = params?.mode;
  const mode = (modeProp ?? modeFromParams ?? "register").toLowerCase();
  const isUpdate = mode === "update";

  const { addSchool, updateSchool, loading } = useSchool();

  const [formData, setFormData] = useState({
    municipality: "1",
    name: "",
    slogan: "",
    address: "",
    email: "",
    phone: "",
    principalName: "",
    coordinadorName: "",
    logo: "",
    mainColor: "#0b3d91",
    secondaryColor: "#f59e0b",
    workday: "",
    codDane: "",
    signaturePrincipal: "",
    sede: [],
    department_id: "",
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
    setFormData((prev) => {
      const newData = {
        ...prev,
        [name]: type === "file" ? files?.[0] : value,
      };

      // Si cambió el departamento, limpiar municipality
      if (name === "department_id") {
        newData.municipality = "";
      }

      return newData;
    });
  };

  const addSede = () => {
    setFormData((prev) => ({
      ...prev,
      sede: [
        ...(Array.isArray(prev.sede) ? prev.sede : []),
        {
          name_sede: "",
          adress: "",
          phone: "",
          jornada: "",
        },
      ],
    }));
  };

  const updateSedeField = (index, field, value) => {
    setFormData((prev) => ({
      ...prev,
      sede: (Array.isArray(prev.sede) ? prev.sede : []).map((sede, i) =>
        i === index
          ? {
              ...sede,
              [field]: value,
            }
          : sede
      ),
    }));
  };

  const removeSede = (index) => {
    setFormData((prev) => ({
      ...prev,
      sede: (Array.isArray(prev.sede) ? prev.sede : []).filter(
        (_, i) => i !== index
      ),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const payload = { ...formData };

      // Procesar sedes
      let sedeData = payload.sede ?? [];

      // Si no hay sedes, crear una sede principal automáticamente
      if (sedeData.length === 0) {
        sedeData = [
          {
            name_sede: "principal",
            adress: "",
            phone: "",
            jornada: parseInt(payload.workday),
          },
        ];
      } else {
        // Convertir jornada a número para cada sede existente
        sedeData = sedeData.map((sede) => ({
          ...sede,
          jornada: parseInt(sede.jornada),
        }));
      }

      payload.sede = sedeData;

      // Excluir campos auxiliares que no se envían al backend
      delete payload.department_id;

      console.log("Datos a enviar:", payload);

      let result;
      if (isUpdate && schoolId) {
        // Modo actualización
        result = await updateSchool(schoolId, payload);
        console.log("Institución actualizada:", result);
      } else {
        // Modo creación
        result = await addSchool(payload);
        console.log("Institución creada:", result);
      }

      // Opcional: resetear formulario en modo create
      if (!isUpdate) {
        // Podrías resetear el form o redirigir
      }
    } catch (error) {
      console.error("Error al enviar formulario:", error);
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
          <label>Slogan</label>
          <input
            type="text"
            name="slogan"
            value={formData.slogan}
            onChange={handleChange}
            className="w-full p-2 border rounded bg-white"
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
          <DepartmentSelector
            name="department_id"
            label="Departamento"
            value={formData.department_id}
            onChange={handleChange}
            className="w-full p-2 border rounded bg-white"
          />
        </div>

        <div>
          <CitySelector
            name="municipality"
            label="Ciudad/Municipio"
            value={formData.municipality}
            onChange={handleChange}
            departmentId={formData.department_id}
            className="w-full p-2 border rounded bg-white"
          />
        </div>

        <div>
          <label className={getLabelClassName("", false)}>Teléfono</label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            className={getInputClassName(
              "w-full p-2 border rounded bg-white",
              false
            )}
          />
        </div>

        <div>
          <label className={getLabelClassName("", false)}>
            Correo electrónico
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className={getInputClassName(
              "w-full p-2 border rounded bg-white",
              false
            )}
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

        <div>
          <label className={getLabelClassName("", isUpdate)}>Código DANE</label>
          <input
            type="text"
            name="codDane"
            value={formData.codDane}
            onChange={handleChange}
            className={getInputClassName(
              "w-full p-2 border rounded bg-white",
              isUpdate
            )}
            disabled={isUpdate}
            placeholder={
              isUpdate
                ? "No se puede modificar en modo actualización"
                : "Ingrese código DANE"
            }
          />
        </div>

        <div>
          <JourneySelect
            label="Jornada"
            name="workday"
            value={formData.workday}
            onChange={handleChange}
            className="w-full p-2 border rounded bg-white"
          />
        </div>

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

            {Array.isArray(formData.sede) && formData.sede.length > 0 ? (
              <div className="mt-4 grid grid-cols-1 gap-3">
                {formData.sede.map((sede, index) => (
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
                          value={sede?.name_sede ?? ""}
                          onChange={(e) =>
                            updateSedeField(index, "name_sede", e.target.value)
                          }
                          className="w-full p-2 border rounded bg-white"
                        />
                      </div>

                      <div>
                        <label>Teléfono</label>
                        <input
                          type="text"
                          value={sede?.phone ?? ""}
                          onChange={(e) =>
                            updateSedeField(index, "phone", e.target.value)
                          }
                          className="w-full p-2 border rounded bg-white"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label>Dirección</label>
                        <input
                          type="text"
                          value={sede?.adress ?? ""}
                          onChange={(e) =>
                            updateSedeField(index, "adress", e.target.value)
                          }
                          className="w-full p-2 border rounded bg-white"
                        />
                      </div>

                      <JourneySelect
                        label="Jornada"
                        name="jornada"
                        value={sede?.jornada ?? ""}
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
            type="submit"
            msj={loading ? "Procesando..." : primaryButtonLabel}
            icon={loading ? "Loader" : "Save"}
            text={"text-white"}
            bg={loading ? "bg-gray-400" : "bg-accent"}
            disabled={loading}
          />
        </div>
      </form>

      {!isUpdate ? (
        <div className="mt-4 border-t pt-4">
          <ProgressPage />
        </div>
      ) : null}

      <ThemeModal
        isOpen={isThemeModalOpen}
        onClose={() => setIsThemeModalOpen(false)}
        color={{
          mainColor: formData.mainColor,
          secondaryColor: formData.secondaryColor,
        }}
        setColor={(colorData) => {
          setFormData((prev) => ({
            ...prev,
            mainColor: colorData.mainColor,
            secondaryColor: colorData.secondaryColor,
          }));
        }}
      />
    </div>
  );
};

export default ManageSchool;
