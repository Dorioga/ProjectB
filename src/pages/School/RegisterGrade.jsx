import { useState } from "react";
import SimpleButton from "../../components/atoms/SimpleButton";
import JourneySelect from "../../components/atoms/JourneySelect";
import SedeSelect from "../../components/atoms/SedeSelect";
import useSchool from "../../lib/hooks/useSchool";

const RegisterGrade = () => {
  const { journeys, loadingJourneys, registerGrade, loading } = useSchool();

  const [formData, setFormData] = useState({
    name_grade: "",
    workday: "",
    id_sede: "",
    group: [],
  });
  const [numGroups, setNumGroups] = useState(0);

  const resizeGroups = (previousGroups, count) => {
    const safeCount = Math.max(
      0,
      Math.min(26, Number.isFinite(count) ? count : 0)
    );

    return Array.from({ length: safeCount }, (_, index) => {
      const prevGroup = previousGroups?.[index];
      // Si ya es un objeto con name_group, mantenerlo
      if (
        prevGroup &&
        typeof prevGroup === "object" &&
        prevGroup.name_group !== undefined
      ) {
        return prevGroup;
      }
      // Si es un string (compatibilidad con datos anteriores), convertir a objeto
      if (typeof prevGroup === "string") {
        return { name_group: prevGroup };
      }
      // Por defecto, crear un objeto vacío
      return { name_group: "" };
    });
  };

  const handleNameChange = (event) => {
    const value = event.target.value;
    setFormData((prev) => ({ ...prev, name_grade: value }));
  };

  const handleJornadaChange = (event) => {
    const value = event.target.value;
    setFormData((prev) => ({ ...prev, workday: value }));
  };

  const handleSedeChange = (event) => {
    const value = event.target.value;
    setFormData((prev) => ({ ...prev, id_sede: value }));
  };

  const handleNumGroupsChange = (event) => {
    const rawValue = event.target.value;
    const parsed = rawValue === "" ? 0 : Number.parseInt(rawValue, 10);
    const safeCount = Number.isNaN(parsed)
      ? 0
      : Math.max(0, Math.min(26, parsed));

    setNumGroups(safeCount);
    setFormData((prev) => ({
      ...prev,
      group: resizeGroups(prev.group, safeCount),
    }));
  };

  const handleGroupChange = (index) => (event) => {
    const value = event.target.value;
    setFormData((prev) => {
      const nextGroups = [...prev.group];
      nextGroups[index] = { name_group: value };
      return { ...prev, group: nextGroups };
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    // Validaciones
    if (!formData.name_grade.trim()) {
      return;
    }

    if (!formData.workday) {
      return;
    }

    if (!formData.id_sede) {
      return;
    }

    if (formData.group.length === 0) {
      return;
    }

    // Validar que todos los grupos tengan nombre
    const emptyGroups = formData.group.filter((g) => !g.name_group?.trim());
    if (emptyGroups.length > 0) {
      return;
    }

    const dataToSubmit = {
      name_grade: formData.name_grade,
      workday: Number(formData.workday),
      id_sede: Number(formData.id_sede),
      group: formData.group,
    };

    console.log("Registro de grado:", dataToSubmit);

    // Llamar al servicio para registrar el grado
    try {
      await registerGrade(dataToSubmit);

      // Limpiar formulario después de éxito
      setTimeout(() => {
        setFormData({ name_grade: "", workday: "", id_sede: "", group: [] });
        setNumGroups(0);
      }, 1000);
    } catch (error) {
      console.error("Error al registrar grado:", error);
    }
  };

  return (
    <div className="border p-6 rounded bg-bg h-full gap-4 flex flex-col">
      <h2 className="font-bold text-2xl ">Registrar Grado</h2>

      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 md:grid-cols-4 gap-4"
      >
        <div className="md:col-span-4 font-bold">Información del grado</div>

        <div>
          <label>Nombre del grado</label>
          <input
            type="text"
            name="name_grade"
            value={formData.name_grade}
            onChange={handleNameChange}
            className="w-full p-2 border rounded bg-white"
            placeholder="Ej: 6°"
          />
        </div>
        <SedeSelect value={formData.id_sede} onChange={handleSedeChange} />
        <JourneySelect
          name="workday"
          label="Jornada"
          value={formData.workday}
          onChange={handleJornadaChange}
          includeAmbas={false}
          disabled={loadingJourneys}
          placeholder="Selecciona una jornada"
          className="w-full p-2 border rounded bg-white"
        />

        <div>
          <label>¿Cuántos grupos?</label>
          <input
            type="number"
            min={0}
            max={26}
            name="numGroups"
            value={numGroups}
            onChange={handleNumGroupsChange}
            className="w-full p-2 border rounded bg-white"
            placeholder="Ej: 2"
          />
        </div>

        <div className="md:col-span-4">
          <label>Grupos a crear</label>
          {formData.group.length === 0 ? (
            <div className="w-full p-2 border rounded bg-white text-sm">
              Selecciona cuántos grupos deseas crear.
            </div>
          ) : (
            <div className="w-full p-4 border rounded bg-white grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {formData.group.map((group, index) => (
                <div key={index} className="flex flex-col gap-1">
                  <label className="text-sm">Grupo {index + 1}</label>
                  <input
                    type="text"
                    value={group.name_group || ""}
                    onChange={handleGroupChange(index)}
                    className="w-full p-2 border rounded bg-white"
                    placeholder={`Ej: ${String.fromCharCode(65 + index)}`}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="md:col-span-3 mt-4 flex justify-center">
          <div className="w-full md:w-1/2">
            <SimpleButton
              msj={loading ? "Registrando..." : "Registrar grado"}
              text={"text-white"}
              bg={"bg-accent"}
              icon={"Save"}
              disabled={loading}
            />
          </div>
        </div>
      </form>
    </div>
  );
};
export default RegisterGrade;
