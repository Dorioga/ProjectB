import React, { useMemo, useState, useEffect } from "react";
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
import { useNotify } from "../../lib/hooks/useNotify";

const ProfileSchool = ({
  mode: modeProp,
  schoolId,
  initialData = null,
  onSuccess = null,
  initialEditing = undefined,
}) => {
  const params = useParams();
  const modeFromParams = params?.mode;
  const mode = (modeProp ?? modeFromParams ?? "register").toLowerCase();
  const isUpdate = mode === "update";

  const { addSchool, updateSchool, updateInstitution, loading, journeys } =
    useSchool();

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
    mainColor: "#131a27",
    secondaryColor: "#ff9300",
    workday: "",
    codDane: "",
    signaturePrincipal: "",
    sede: [],
    department_id: "",
  });

  // Si se pasa initialData, sincronizar el form
  useEffect(() => {
    if (!initialData) return;
    // Mapear campos de la institución recibida a nuestro formData
    const map = {
      municipality: initialData.municipality ?? initialData.municipio ?? "1",
      name: initialData.nombre_institucion || "",
      slogan: initialData.eslogan ?? "",
      address: initialData.address ?? initialData.direccion ?? "",
      email: initialData.email ?? initialData.correo ?? "",
      phone: initialData.phone ?? initialData.telefono ?? "",
      principalName: initialData.director ?? "",
      coordinadorName: initialData.coordinador ?? "",
      logo: initialData.link_logo ?? "",
      mainColor: initialData.color_principal ?? "#131a27",
      secondaryColor: initialData.color_secundario ?? "#ff9300",
      workday: initialData.fk_jornada ? String(initialData.fk_jornada) : "",
      codDane: initialData.cod_dane ?? "",
      signaturePrincipal: initialData.link_firma ?? "",
      sede: Array.isArray(initialData.sede) ? initialData.sede : [],
      department_id: initialData.department_id ?? "",
    };

    setFormData((prev) => ({ ...prev, ...map }));
  }, [initialData]);
  const [isThemeModalOpen, setIsThemeModalOpen] = useState(false);

  // Modo de edición (por defecto: editable en modo registro, vista en modo update)
  const [isEditing, setIsEditing] = useState(
    typeof initialEditing === "boolean" ? initialEditing : !isUpdate,
  );

  useEffect(() => {
    if (typeof initialEditing === "boolean") {
      setIsEditing(initialEditing);
    } else {
      setIsEditing(!isUpdate);
    }
  }, [initialEditing, isUpdate]);

  const toggleEditing = async () => {
    if (isEditing) {
      await handleSubmit();
    }
    setIsEditing((v) => !v);
  };

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
    setFormData((prev) => {
      const currentWorkday =
        prev && prev.workday !== undefined && prev.workday !== null
          ? String(prev.workday)
          : "";

      return {
        ...prev,
        sede: [
          ...(Array.isArray(prev.sede) ? prev.sede : []),
          {
            name_sede: "",
            adress: "",
            phone: "",
            jornada: currentWorkday,
          },
        ],
      };
    });
  };

  const notify = useNotify();

  // Si la institución cambia de jornada, aplicamos reglas a las sedes:
  // - Si es '3' (Ambas): limpiamos jornadas inválidas para forzar al usuario a elegir 1 o 2
  // - Si es '1' o '2': forzamos todas las sedes a usar ese valor (y notificamos)
  useEffect(() => {
    const w = String(formData.workday);

    if (w === "3") {
      const seats = Array.isArray(formData.sede) ? formData.sede : [];
      let changed = false;
      const newSedes = seats.map((s) => {
        const j =
          s && s.jornada !== undefined && s.jornada !== null
            ? String(s.jornada)
            : "";
        // mantener si ya es 1 o 2; si es vacío mantener vacío; para '3' u otros limpiar
        if (j === "1" || j === "2" || j === "") return s;
        changed = true;
        return { ...s, jornada: "" };
      });

      if (changed) {
        setFormData((prev) => ({ ...prev, sede: newSedes }));
        notify.info(
          "Se limpiaron jornadas no válidas en las sedes. Por favor selecciona 'Mañana' o 'Tarde' para cada sede.",
        );
      }

      return;
    }

    // Si es diferente de '3' y no está vacío, actualizar todas las sedes para que usen ese workday
    if (w !== "3" && w !== "") {
      const seats = Array.isArray(formData.sede) ? formData.sede : [];
      let changed = false;
      const newSedes = seats.map((s) => {
        const j =
          s && s.jornada !== undefined && s.jornada !== null
            ? String(s.jornada)
            : "";
        if (j === w) return s;
        changed = true;
        return { ...s, jornada: w };
      });

      if (changed) {
        setFormData((prev) => ({ ...prev, sede: newSedes }));
        const opt = (Array.isArray(journeys) ? journeys : []).find(
          (o) => String(o.value) === w,
        );
        const label = opt ? opt.label : `Jornada ${w}`;
        notify.success(
          `Se actualizaron automáticamente las jornadas de las sedes a "${label}"`,
        );
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.workday, journeys]);

  const updateSedeField = (index, field, value) => {
    setFormData((prev) => ({
      ...prev,
      sede: (Array.isArray(prev.sede) ? prev.sede : []).map((sede, i) =>
        i === index
          ? {
              ...sede,
              [field]: value,
            }
          : sede,
      ),
    }));
  };

  const removeSede = (index) => {
    setFormData((prev) => ({
      ...prev,
      sede: (Array.isArray(prev.sede) ? prev.sede : []).filter(
        (_, i) => i !== index,
      ),
    }));
  };

  const handleSubmit = async (e) => {
    if (e && e.preventDefault) e.preventDefault();

    try {
      const payload = { ...formData };

      let result;

      if (isUpdate && schoolId) {
        // Para actualización, enviar sólo los campos permitidos
        const updatePayload = {
          address: payload.address ?? "",
          codDane: payload.codDane ?? "",
          coordinadorName: payload.coordinadorName ?? "",
          email: payload.email ?? "",
          logo: payload.logo ?? "",
          mainColor: payload.mainColor ?? "",
          municipality: payload.municipality ?? "",
          name: payload.name ?? "",
          phone: payload.phone ?? "",
          principalName: payload.principalName ?? "",
          secondaryColor: payload.secondaryColor ?? "",
          signaturePrincipal: payload.signaturePrincipal ?? "",
          slogan: payload.slogan ?? "",
          workday: payload.workday ? parseInt(payload.workday) : null,
        };

        console.log("Datos a enviar (update):", updatePayload);

        // Usar updateInstitution si existe, si no usar updateSchool como fallback
        if (typeof updateInstitution === "function") {
          result = await updateInstitution(schoolId, updatePayload);
          console.log("Institución actualizada (updateInstitution):", result);
        } else {
          result = await updateSchool(schoolId, updatePayload);
          console.log(
            "Institución actualizada (updateSchool fallback):",
            result,
          );
        }
      } else {
        // Modo creación: procesar sedes y enviar payload completo
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

        console.log("Datos a enviar (create):", payload);

        result = await addSchool(payload);
        console.log("Institución creada:", result);
      }

      // Llamar al callback onSuccess si fue provisto (para cerrar modal y refrescar listados)
      if (typeof onSuccess === "function") {
        try {
          onSuccess(result);
        } catch (e) {
          console.warn("ManageSchool: onSuccess callback falló:", e);
        }
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
    <div
      className={`border p-6 rounded bg-bg h-full gap-4 flex flex-col ${isEditing ? "ring-2 ring-accent" : "opacity-95"}`}
    >
      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 md:grid-cols-2 gap-4"
      >
        <div className=" grid grid-cols-5 md:col-span-2  justify-between items-center mb-2">
          <h2 className="text-xl font-semibold flex items-center col-span-4">
            {title}
            <span
              className={`ml-3 inline-flex items-center px-2 py-1 rounded text-xs font-medium ${isEditing ? "bg-green-100 text-green-800" : "bg-gray-200 text-gray-700"}`}
            >
              {isEditing ? "Modo edición" : "Solo lectura"}
            </span>
          </h2>
          <SimpleButton
            type="button"
            onClick={toggleEditing}
            msj={isEditing ? "Guardar" : "Editar"}
            icon={isEditing ? "Save" : "Pencil"}
            bg={isEditing ? "bg-accent" : "bg-secondary"}
            text={"text-surface"}
          />
        </div>

        <div className="md:col-span-2">
          <label className={getLabelClassName("", !isEditing)}>
            Nombre de la institución
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            disabled={!isEditing}
            className={getInputClassName(
              "w-full p-2 border rounded bg-surface",
              !isEditing,
            )}
            required
          />
        </div>

        <div className="md:col-span-2">
          <label className={getLabelClassName("", !isEditing)}>Slogan</label>
          <input
            type="text"
            name="slogan"
            value={formData.slogan}
            onChange={handleChange}
            disabled={!isEditing}
            className={getInputClassName(
              "w-full p-2 border rounded bg-surface",
              !isEditing,
            )}
          />
        </div>

        <div className="md:col-span-2">
          <label className={getLabelClassName("", !isEditing)}>Dirección</label>
          <input
            type="text"
            name="address"
            value={formData.address}
            onChange={handleChange}
            disabled={!isEditing}
            className={getInputClassName(
              "w-full p-2 border rounded bg-surface",
              !isEditing,
            )}
          />
        </div>

        <div>
          <DepartmentSelector
            name="department_id"
            label="Departamento"
            value={formData.department_id}
            onChange={handleChange}
            className={getInputClassName(
              "w-full p-2 border rounded bg-surface",
              !isEditing,
            )}
            disabled={!isEditing}
          />
        </div>

        <div>
          <CitySelector
            name="municipality"
            label="Ciudad/Municipio"
            value={formData.municipality}
            onChange={handleChange}
            departmentId={formData.department_id}
            className={getInputClassName(
              "w-full p-2 border rounded bg-surface",
              !isEditing,
            )}
            disabled={!isEditing}
          />
        </div>

        <div>
          <label className={getLabelClassName("", !isEditing)}>Teléfono</label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            disabled={!isEditing}
            className={getInputClassName(
              "w-full p-2 border rounded bg-surface",
              !isEditing,
            )}
          />
        </div>

        <div>
          <label className={getLabelClassName("", !isEditing)}>
            Correo electrónico
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            disabled={!isEditing}
            className={getInputClassName(
              "w-full p-2 border rounded bg-surface",
              !isEditing,
            )}
          />
        </div>

        <div>
          <label className={getLabelClassName("", !isEditing)}>
            Nombre del director
          </label>
          <input
            type="text"
            name="principalName"
            value={formData.principalName}
            onChange={handleChange}
            disabled={!isEditing}
            className={getInputClassName(
              "w-full p-2 border rounded bg-surface",
              !isEditing,
            )}
          />
        </div>

        <div>
          <label>Firma del director</label>
          {isEditing ? (
            <FileChooser
              name="signaturePrincipal"
              onChange={handleChange}
              className="w-full p-2 border rounded"
            />
          ) : (
            <p className="p-2">
              {formData.signaturePrincipal ? "Archivo cargado" : "No cargado"}
            </p>
          )}
        </div>

        <div className="md:col-span-2">
          <label className={getLabelClassName("", !isEditing)}>
            Nombre del coordinador
          </label>
          <input
            type="text"
            name="coordinadorName"
            value={formData.coordinadorName}
            onChange={handleChange}
            disabled={!isEditing}
            className={getInputClassName(
              "w-full p-2 border rounded bg-surface",
              !isEditing,
            )}
          />
        </div>

        <div>
          <label>Logo de la institución</label>
          {isEditing ? (
            <FileChooser
              name="logo"
              onChange={handleChange}
              className="w-full p-2 border rounded"
            />
          ) : (
            <p className="p-2">
              {formData.logo ? "Archivo cargado" : "No cargado"}
            </p>
          )}
        </div>

        <div>
          <label>Tema</label>
          <SimpleButton
            type="button"
            onClick={() => setIsThemeModalOpen(true)}
            className="mt-2"
            msj={"Modificar tema"}
            icon={"Pencil"}
            text={"text-surface"}
            bg={"bg-accent"}
            disabled={!isEditing}
          />
        </div>

        <div>
          <label className={getLabelClassName("", !isEditing || isUpdate)}>
            Código DANE
          </label>
          <input
            type="text"
            name="codDane"
            value={formData.codDane}
            onChange={handleChange}
            disabled={!isEditing || isUpdate}
            className={getInputClassName(
              "w-full p-2 border rounded bg-surface",
              !isEditing || isUpdate,
            )}
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
            className={getInputClassName(
              "w-full p-2 border rounded bg-surface",
              !isEditing,
            )}
            disabled={!isEditing}
          />
        </div>

        {!isUpdate ? (
          <div className="md:col-span-2 mt-2 border-t pt-4">
            <h3 className="text-lg font-semibold mb-2">Sedes</h3>

            {isEditing && (
              <div className="flex justify-center ">
                <div className="w-2/5">
                  <SimpleButton
                    type="button"
                    onClick={addSede}
                    msj={"Agregar sede"}
                    icon={"Plus"}
                    text={"text-surface"}
                    bg={"bg-accent"}
                  />
                </div>
              </div>
            )}

            {Array.isArray(formData.sede) && formData.sede.length > 0 ? (
              <div className="mt-4 grid grid-cols-1 gap-3">
                {formData.sede.map((sede, index) => (
                  <div
                    key={`${sede?.name || "sede"}-${index}`}
                    className="border rounded p-4 bg-surface"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <p className="font-semibold">Sede #{index + 1}</p>
                      <div>
                        {isEditing && (
                          <SimpleButton
                            type="button"
                            onClick={() => removeSede(index)}
                            msj={"Borrar"}
                            icon={"Trash2"}
                            text={"text-surface"}
                            bg={"bg-red-600"}
                            className="w-auto px-3"
                          />
                        )}
                      </div>
                    </div>

                    {isEditing ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label>Nombre</label>
                          <input
                            type="text"
                            value={sede?.name_sede ?? ""}
                            onChange={(e) =>
                              updateSedeField(
                                index,
                                "name_sede",
                                e.target.value,
                              )
                            }
                            className="w-full p-2 border rounded bg-surface"
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
                            className="w-full p-2 border rounded bg-surface"
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
                            className="w-full p-2 border rounded bg-surface"
                          />
                        </div>

                        <JourneySelect
                          label="Jornada"
                          name="jornada"
                          value={sede?.jornada ?? ""}
                          filterValue={
                            String(formData.workday) !== "3"
                              ? String(formData.workday)
                              : "3"
                          }
                          onChange={(e) =>
                            updateSedeField(index, "jornada", e.target.value)
                          }
                          className="w-full p-2 border rounded bg-surface"
                        />
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label>Nombre</label>
                          <p className="p-2">{sede?.name_sede ?? "-"}</p>
                        </div>

                        <div>
                          <label>Teléfono</label>
                          <p className="p-2">{sede?.phone ?? "-"}</p>
                        </div>

                        <div className="md:col-span-2">
                          <label>Dirección</label>
                          <p className="p-2">{sede?.adress ?? "-"}</p>
                        </div>

                        <div>
                          <label>Jornada</label>
                          <p className="p-2">{sede?.jornada ?? "-"}</p>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        ) : null}

        {isEditing && (
          <div className="md:col-span-2 mt-4">
            <SimpleButton
              type="submit"
              msj={loading ? "Procesando..." : primaryButtonLabel}
              icon={loading ? "Loader" : "Save"}
              text={"text-surface"}
              bg={loading ? "bg-gray-400" : "bg-accent"}
              disabled={loading}
            />
          </div>
        )}
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

export default ProfileSchool;
