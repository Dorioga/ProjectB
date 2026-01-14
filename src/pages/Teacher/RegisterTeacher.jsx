import React, { useEffect, useMemo, useState } from "react";
import SimpleButton from "../../components/atoms/SimpleButton";
import JourneySelect from "../../components/atoms/JourneySelect";
import SedeSelect from "../../components/atoms/SedeSelect";
import TypeDocumentSelector from "../../components/molecules/TypeDocumentSelector";
import AsignatureSelector from "../../components/molecules/AsignatureSelector";
import useSchool from "../../lib/hooks/useSchool";
import useStudent from "../../lib/hooks/useStudent";
import { sha256 } from "js-sha256";
import useData from "../../lib/hooks/useData";

const RegisterTeacher = () => {
  const {
    sedes,
    reloadSedes,
    registerTeacher,
    getGradeAsignature,
    loading: teacherLoading,
  } = useSchool();
  const { institutionSedes } = useData();
  const { students, loading: studentsLoading, reload } = useStudent();
  const [formData, setFormData] = useState({
    first_name: "",
    second_name: "",
    first_lastname: "",
    second_lastname: "",
    telephone: "",
    email: "",
    identification: "",
    identificationtype: 0,
    sede: 0,
    password: "",
    workday: 0,
    fecha_nacimiento: "",
    direccion: "",
    asignature: [],
  });

  const [tempAsignature, setTempAsignature] = useState("");
  const [tempAsignatureName, setTempAsignatureName] = useState("");
  const [tempGrades, setTempGrades] = useState([]);
  const [availableAsignatureGrades, setAvailableAsignatureGrades] = useState(
    []
  );
  const [loadingAsignatureGrades, setLoadingAsignatureGrades] = useState(false);

  // Cargar estudiantes cuando se monta el componente
  useEffect(() => {
    reload();
  }, [reload]);

  // Cargar sedes cuando se monta el componente
  useEffect(() => {
    reloadSedes();
  }, [reloadSedes]);
  const [submitOk, setSubmitOk] = useState(false);

  const sedeJornada = useMemo(() => {
    const sedeId = String(formData.sede ?? "").trim();
    if (!sedeId || !Array.isArray(institutionSedes)) return null;

    const sede = institutionSedes.find((s) => String(s?.id) === sedeId);
    return sede?.fk_workday ? String(sede.fk_workday) : null;
  }, [formData.sede, institutionSedes]);

  // Limpiar jornada cuando cambie la sede
  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      workday: "",
    }));
  }, [formData.sede]);

  // Cargar grados cuando se seleccione una asignatura
  useEffect(() => {
    if (!tempAsignature || !formData.sede) {
      setAvailableAsignatureGrades([]);
      return;
    }

    const loadGrades = async () => {
      setLoadingAsignatureGrades(true);
      try {
        const payload = {
          idAsignature: Number(tempAsignature),
          idSede: Number(formData.sede),
        };
        console.log("Payload para grados de asignatura:", payload);
        const response = await getGradeAsignature(payload);

        // Extraer los grados de la respuesta
        const grades = Array.isArray(response) ? response : [];
        setAvailableAsignatureGrades(grades);
      } catch (error) {
        console.error("Error al cargar grados de asignatura:", error);
        setAvailableAsignatureGrades([]);
      } finally {
        setLoadingAsignatureGrades(false);
      }
    };

    loadGrades();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tempAsignature, formData.sede]);

  // Auto-seleccionar jornada si fk_workday no es 3
  useEffect(() => {
    if (!sedeJornada) return;

    // Si fk_workday es 3 (ambas), el usuario puede elegir, no auto-seleccionar
    if (sedeJornada === "3") return;

    // Si es 1 o 2, auto-seleccionar esa jornada
    setFormData((prev) => ({
      ...prev,
      workday: parseInt(sedeJornada, 10),
    }));
  }, [sedeJornada]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Convertir a número si es sede, workday o identificationtype
    const finalValue =
      name === "sede" || name === "workday" || name === "identificationtype"
        ? value
          ? Number(value)
          : 0
        : value;

    setFormData((prev) => ({
      ...prev,
      [name]: finalValue,
    }));
  };

  const toggleAsignatureGrade = (gradeId) => {
    setTempGrades((prev) => {
      const current = Array.isArray(prev) ? prev : [];
      const exists = current.includes(gradeId);
      return exists
        ? current.filter((g) => g !== gradeId)
        : [...current, gradeId];
    });
  };

  const addAsignatureWithGrades = () => {
    if (!tempAsignature || tempGrades.length === 0) {
      return;
    }

    setFormData((prev) => ({
      ...prev,
      asignature: [
        ...prev.asignature,
        {
          idAsignature: tempAsignature,
          nameAsignature: tempAsignatureName,
          grades: tempGrades,
        },
      ],
    }));

    // Limpiar formulario temporal
    setTempAsignature("");
    setTempAsignatureName("");
    setTempGrades([]);
    setAvailableAsignatureGrades([]);
  };

  const removeAsignature = (index) => {
    setFormData((prev) => ({
      ...prev,
      asignature: prev.asignature.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitOk(false);

    if (!formData.identificationtype || formData.identificationtype === 0) {
      toast.error("El tipo de documento es obligatorio.");
      return;
    }
    if (!String(formData.identification ?? "").trim()) {
      toast.error("El número de identificación es obligatorio.");
      return;
    }
    if (!String(formData.first_name ?? "").trim()) {
      toast.error("El primer nombre es obligatorio.");
      return;
    }
    if (!String(formData.first_lastname ?? "").trim()) {
      toast.error("El primer apellido es obligatorio.");
      return;
    }
    if (!String(formData.email ?? "").trim()) {
      toast.error("El correo es obligatorio.");
      return;
    }
    if (!formData.asignature || formData.asignature.length === 0) {
      toast.error("Debe agregar al menos una asignatura con sus grados.");
      return;
    }

    // Preparar payload JSON para enviar al backend
    const payload = {
      first_name: formData.first_name,
      second_name: formData.second_name || "",
      first_lastname: formData.first_lastname,
      second_lastname: formData.second_lastname || "",
      sede: formData.sede,
      workday: formData.workday,
      identification: formData.identification,
      identificationtype: formData.identificationtype,
      fecha_nacimiento: formData.fecha_nacimiento || "",
      telephone: formData.telephone || "",
      email: formData.email,
      password: formData.password ? sha256(String(formData.password)) : "",
      direccion: formData.direccion || "",
      asignature: formData.asignature.map((asig) => ({
        idAsignature: parseInt(asig.idAsignature, 10),
        grades: asig.grades.map((gradeId) => ({
          idgrade: parseInt(gradeId, 10),
        })),
      })),
    };

    // Mostrar en consola qué se va a enviar
    console.log("📤 Datos que se enviarán al backend:");
    console.log(payload);

    try {
      const result = await registerTeacher(payload);
      console.log("Docente registrado exitosamente:", result);
      setSubmitOk(true);

      // Limpiar formulario después del registro exitoso
      setFormData({
        first_name: "",
        second_name: "",
        first_lastname: "",
        second_lastname: "",
        sede: 0,
        workday: 0,
        identification: "",
        identificationtype: 0,
        fecha_nacimiento: "",
        telephone: "",
        email: "",
        password: "",
        direccion: "",
        asignature: [],
      });
    } catch (err) {
      console.error("Error al registrar docente:", err);
      toast.error(
        err?.message || "Error al registrar el docente. Intenta nuevamente."
      );
    }
  };

  return (
    <div className="border p-6 rounded bg-bg h-full gap-4 flex flex-col">
      <h2 className="font-bold text-2xl ">Registrar Docente</h2>
      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 md:grid-cols-3 gap-4"
      >
        <div className="md:col-span-3 font-bold">Información personal</div>

        <SedeSelect name="sede" value={formData.sede} onChange={handleChange} />
        <JourneySelect
          name="workday"
          value={formData.workday}
          filterValue={sedeJornada}
          onChange={handleChange}
          disabled={!String(formData.sede ?? "").trim()}
        />

        <TypeDocumentSelector
          name="identificationtype"
          value={formData.identificationtype}
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
            className="w-full p-2 border rounded bg-white"
          />
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

        <div className="md:col-span-3 font-bold mt-4">
          Información de contacto
        </div>

        <div>
          <label>Teléfono</label>
          <input
            type="text"
            name="telephone"
            value={formData.telephone}
            onChange={handleChange}
            className="w-full p-2 border rounded bg-white"
          />
        </div>

        <div>
          <label>Correo</label>
          <input
            type="email"
            name="email"
            value={formData.email}
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

        <div className="md:col-span-3 font-bold mt-4">Asignaturas y Grados</div>

        {/* Formulario para agregar asignatura */}
        <div className="md:col-span-3 border p-4 rounded bg-gray-50">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <AsignatureSelector
              name="tempAsignature"
              label="Seleccionar Asignatura"
              value={tempAsignature}
              onChange={(e) => {
                const selectedId = e.target.value;
                const selectedName =
                  e.target.options[e.target.selectedIndex]?.text || "";
                setTempAsignature(selectedId);
                setTempAsignatureName(selectedName);
              }}
              sedeId={formData.sede}
              workdayId={formData.workday}
              labelClassName="font-semibold"
            />
          </div>

          {/* Checkboxes de grados */}
          {tempAsignature && (
            <div className="mt-4">
              <label className="font-semibold">
                Grados donde dictará esta asignatura:
              </label>
              {!formData.sede || !formData.workday ? (
                <div className="text-sm text-gray-600 mt-2">
                  Selecciona primero una sede y jornada.
                </div>
              ) : loadingAsignatureGrades ? (
                <div className="text-sm text-gray-600 mt-2">
                  Cargando grados...
                </div>
              ) : availableAsignatureGrades.length === 0 ? (
                <div className="text-sm text-gray-600 mt-2">
                  No hay grados disponibles para esta asignatura.
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 mt-2">
                  {availableAsignatureGrades.map((grade) => {
                    const gradeId = String(grade?.id_grado ?? "");
                    const gradeName = String(grade?.grado ?? "");
                    const checked = tempGrades.includes(gradeId);
                    return (
                      <label
                        key={gradeId}
                        className="flex items-center gap-2 bg-white rounded-sm p-2 border border-gray-300"
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleAsignatureGrade(gradeId)}
                        />
                        <span>{gradeName}</span>
                      </label>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          <div className="mt-4">
            <button
              type="button"
              onClick={addAsignatureWithGrades}
              disabled={!tempAsignature || tempGrades.length === 0}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              Agregar Asignatura
            </button>
          </div>
        </div>

        {/* Lista de asignaturas agregadas */}
        {formData.asignature.length > 0 && (
          <div className="md:col-span-3 mt-2">
            <label className="font-semibold">Asignaturas agregadas:</label>
            <div className="space-y-2 mt-2">
              {formData.asignature.map((asig, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between bg-white p-3 border rounded"
                >
                  <div>
                    <span className="font-medium">
                      Asignatura: {asig.nameAsignature || asig.idAsignature}
                    </span>
                    <span className="text-sm text-gray-600 ml-2">
                      ({asig.grades.length} grado
                      {asig.grades.length !== 1 ? "s" : ""})
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeAsignature(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    Eliminar
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {submitOk ? (
          <div className="md:col-span-3 p-4 rounded-lg border-l-4 border-green-500 bg-gray-50 text-green-700">
            <div className="flex items-start gap-3">
              <svg
                className="w-6 h-6 flex-shrink-0 mt-0.5"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <div className="flex-1">
                <h4 className="font-bold text-base mb-1">¡Éxito!</h4>
                <p className="text-sm leading-relaxed">
                  Docente registrado exitosamente.
                </p>
              </div>
            </div>
          </div>
        ) : null}

        <div className="md:col-span-3 mt-4 flex justify-center">
          <div className="w-full md:w-1/2">
            <SimpleButton
              msj={teacherLoading ? "Registrando..." : "Registrar docente"}
              text={"text-white"}
              bg={"bg-accent"}
              icon={"Save"}
              disabled={teacherLoading}
            />
          </div>
        </div>
      </form>
    </div>
  );
};

export default RegisterTeacher;
