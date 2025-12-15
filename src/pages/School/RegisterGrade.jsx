import { useState } from "react";
import SimpleButton from "../../components/atoms/SimpleButton";

const RegisterGrade = () => {
  const [formData, setFormData] = useState({
    name: "",
    jornada: "",
    group: [],
  });
  const [numGroups, setNumGroups] = useState(0);

  const resizeGroups = (previousGroups, count) => {
    const safeCount = Math.max(
      0,
      Math.min(26, Number.isFinite(count) ? count : 0)
    );

    return Array.from({ length: safeCount }, (_, index) =>
      typeof previousGroups?.[index] === "string" ? previousGroups[index] : ""
    );
  };

  const handleNameChange = (event) => {
    const value = event.target.value;
    setFormData((prev) => ({ ...prev, name: value }));
  };

  const handleJornadaChange = (event) => {
    const value = event.target.value;
    setFormData((prev) => ({ ...prev, jornada: value }));
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
      nextGroups[index] = value;
      return { ...prev, group: nextGroups };
    });
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    console.log("Registro de grado:", { ...formData, numGroups });
  };

  return (
    <div className="border p-6 rounded bg-bg h-full gap-4 flex flex-col">
      <h2 className="font-bold text-2xl ">Registrar Grado</h2>

      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 md:grid-cols-3 gap-4"
      >
        <div className="md:col-span-3 font-bold">Información del grado</div>

        <div>
          <label>Nombre del grado</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleNameChange}
            className="w-full p-2 border rounded bg-white"
            placeholder="Ej: 6°"
          />
        </div>

        <div>
          <label>Jornada</label>
          <select
            name="jornada"
            value={formData.jornada}
            onChange={handleJornadaChange}
            className="w-full p-2 border rounded bg-white"
          >
            <option value="">Selecciona una jornada</option>
            <option value="mañana">Mañana</option>
            <option value="tarde">Tarde</option>
            <option value="unica">Única</option>
          </select>
        </div>

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

        <div className="md:col-span-3">
          <label>Grupos a crear</label>
          {formData.group.length === 0 ? (
            <div className="w-full p-2 border rounded bg-white text-sm">
              Selecciona cuántos grupos deseas crear.
            </div>
          ) : (
            <div className="w-full p-4 border rounded bg-white grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {formData.group.map((groupName, index) => (
                <div key={index} className="flex flex-col gap-1">
                  <label className="text-sm">Grupo {index + 1}</label>
                  <input
                    type="text"
                    value={groupName}
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
              msj="Registrar grado"
              text={"text-white"}
              bg={"bg-accent"}
              icon={"Save"}
            />
          </div>
        </div>
      </form>
    </div>
  );
};
export default RegisterGrade;
