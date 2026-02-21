import React, { useEffect, useMemo, useState } from "react";
import SimpleButton from "../../components/atoms/SimpleButton";
import JourneySelect from "../../components/atoms/JourneySelect";
import SedeSelect from "../../components/atoms/SedeSelect";
import TypeDocumentSelector from "../../components/molecules/TypeDocumentSelector";
import AsignatureGrades from "../../components/molecules/AsignatureGrades";
import useSchool from "../../lib/hooks/useSchool";
import useTeacher from "../../lib/hooks/useTeacher";
import useStudent from "../../lib/hooks/useStudent";
import useData from "../../lib/hooks/useData";
import { useNotify } from "../../lib/hooks/useNotify";
import { minLength, matchesPattern } from "../../utils/validationUtils";
import tourRegisterTeacher from "../../tour/tourRegisterTeacher";

const RegisterTeacher = ({ onSuccess }) => {
  const { sedes, reloadSedes } = useSchool();
  const { addTeacher, loadingTeachers: teacherLoading } = useTeacher();
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
    // Representante de curso (boolean) y lista de grados donde es director
    representante_curso: false,
    director_curso: [],
  });

  // El componente AsignatureGrades gestiona su estado interno y la carga de grados.
  const handleAddAsignature = (asign) => {
    console.log("Agregar asignatura:", asign);
    setFormData((prev) => ({
      ...prev,
      asignature: [...prev.asignature, asign],
    }));
  };

  const handleRemoveAsignature = (index) => {
    setFormData((prev) => ({
      ...prev,
      asignature: prev.asignature.filter((_, i) => i !== index),
    }));
  };

  // Cargar estudiantes cuando se monta el componente
  useEffect(() => {
    reload();
  }, [reload]);

  // Cargar sedes cuando se monta el componente
  useEffect(() => {
    reloadSedes();
  }, [reloadSedes]);

  const [submitOk, setSubmitOk] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const notify = useNotify();

  // Tour mode local (resaltado en tiempo real durante el tour)
  const [isTourMode, setIsTourMode] = useState(false);

  // Deshabilitar el botón de "Registrar" si faltan campos obligatorios
  const canSubmit = useMemo(() => {
    if (teacherLoading) return false;
    if (!formData.identificationtype || formData.identificationtype === 0)
      return false;
    if (!String(formData.identification ?? "").trim()) return false;
    if (!String(formData.first_name ?? "").trim()) return false;
    if (!String(formData.first_lastname ?? "").trim()) return false;
    if (!String(formData.email ?? "").trim()) return false;
    if (!Array.isArray(formData.asignature) || formData.asignature.length === 0)
      return false;
    return true;
  }, [
    teacherLoading,
    formData.identificationtype,
    formData.identification,
    formData.first_name,
    formData.first_lastname,
    formData.email,
    formData.asignature,
  ]);

  // Lista legible de campos faltantes (para tooltip / helper text)
  const missingFields = useMemo(() => {
    const missing = [];
    if (!formData.identificationtype || formData.identificationtype === 0)
      missing.push("Tipo de documento");
    if (!String(formData.identification ?? "").trim())
      missing.push("N.º de identificación");
    if (!String(formData.first_name ?? "").trim())
      missing.push("Primer nombre");
    if (!String(formData.first_lastname ?? "").trim())
      missing.push("Primer apellido");
    if (!String(formData.email ?? "").trim()) missing.push("Correo");
    if (!Array.isArray(formData.asignature) || formData.asignature.length === 0)
      missing.push("Asignaturas");
    return missing;
  }, [
    formData.identificationtype,
    formData.identification,
    formData.first_name,
    formData.first_lastname,
    formData.email,
    formData.asignature,
  ]);

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

    // limpiar error del campo al modificarlo
    setFormErrors((prev) => {
      if (!prev || !prev[name]) return prev;
      const next = { ...prev };
      delete next[name];
      return next;
    });
  };

  const handleSubmit = async (e) => {
    console.log("Iniciando proceso de registro de docente...");
    e.preventDefault();
    setSubmitOk(false);

    // limpiar errores previos
    setFormErrors({});

    if (!formData.identificationtype || formData.identificationtype === 0) {
      notify.error("El tipo de documento es obligatorio.");
      return;
    }
    if (!String(formData.identification ?? "").trim()) {
      notify.error("El número de identificación es obligatorio.");
      return;
    }
    if (!String(formData.first_name ?? "").trim()) {
      notify.error("El primer nombre es obligatorio.");
      return;
    }
    if (!String(formData.first_lastname ?? "").trim()) {
      notify.error("El primer apellido es obligatorio.");
      return;
    }
    if (!String(formData.email ?? "").trim()) {
      notify.error("El correo es obligatorio.");
      return;
    }

    // Validar contraseña si fue ingresada (opcional pero con reglas)
    if (String(formData.password ?? "").trim()) {
      const pwd = String(formData.password);
      const min = minLength(
        pwd,
        8,
        "La contraseña debe tener al menos 8 caracteres.",
      );
      if (!min.valid) {
        setFormErrors({ password: min.msg });
        notify.error(min.msg);
        return;
      }
      const pat = matchesPattern(
        pwd,
        /(?=.*[A-Za-z])(?=.*\d)/,
        "La contraseña debe contener al menos una letra y un número.",
      );
      if (!pat.valid) {
        setFormErrors({ password: pat.msg });
        notify.error(pat.msg);
        return;
      }
    }

    if (!formData.asignature || formData.asignature.length === 0) {
      notify.error("Debe agregar al menos una asignatura con sus grados.");
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
      password: formData.password,
      direccion: formData.direccion || "",
      representante_curso: !!formData.representante_curso,
      // director_curso: array de grades marcados como director
      director_curso: Array.isArray(formData.director_curso)
        ? formData.director_curso.map((id) => ({ idgrade: Number(id) }))
        : [],
      asignature: (formData.asignature || []).map((asig) => ({
        idAsignature: parseInt(asig.idAsignature, 10),
        grades: (asig.grades || []).map((g) => {
          const gid = typeof g === "object" ? (g.idgrade ?? g.id ?? g) : g;
          return { idgrade: Number(gid) };
        }),
      })),
    };

    // Mostrar en consola qué se va a enviar
    console.log("📤 Datos que se enviarán al backend:");
    console.log(payload);

    try {
      const result = await addTeacher(payload);
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
        // representante de curso
        representante_curso: false,
        director_curso: [],
        asignature: [],
      });
      setFormErrors({});

      // Notificar al componente padre que el registro fue exitoso (si fue pasado)
      if (typeof onSuccess === "function") {
        try {
          onSuccess(result);
        } catch (err) {
          console.warn("onSuccess callback failed:", err);
        }
      }
    } catch (err) {
      console.error("Error al registrar docente:", err);
      notify.error(
        err?.message || "Error al registrar el docente. Intenta nuevamente.",
      );
    }
  };

  return (
    <div className="border p-6 rounded bg-bg h-full gap-4 flex flex-col">
      <div className="grid grid-cols-5 items-center justify-between">
        <h2 className="col-span-4 font-bold text-2xl">Registrar Docente</h2>
        <SimpleButton
          type="button"
          onClick={() => {
            setIsTourMode(true);
            tourRegisterTeacher();
            const checkDriverVisible = () =>
              !!document.querySelector(
                ".driver-popover, .driver-overlay, .driver-container, .driver",
              );
            const observer = new MutationObserver(() => {
              if (!checkDriverVisible()) {
                setIsTourMode(false);
                observer.disconnect();
              }
            });
            observer.observe(document.body, { childList: true, subtree: true });
            setTimeout(
              () => {
                setIsTourMode(false);
                observer.disconnect();
              },
              3 * 60 * 1000,
            );
          }}
          icon="HelpCircle"
          msjtooltip="Iniciar tutorial"
          noRounded={false}
          bg="bg-info"
          text="text-surface"
          className="w-auto px-3 py-1.5"
        />
        <div className="col-span-5 mt-2 text-sm text-gray-600">
          Campos marcados con <span className="text-red-500">*</span> son
          obligatorios.
        </div>
      </div>
      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 md:grid-cols-3 gap-4"
      >
        <div className="md:col-span-3 font-bold">Información personal</div>

        <div id="tour-sede">
          <SedeSelect
            name="sede"
            value={formData.sede}
            onChange={handleChange}
          />
        </div>
        <div id="tour-workday">
          <JourneySelect
            name="workday"
            value={formData.workday}
            filterValue={sedeJornada}
            onChange={handleChange}
            disabled={!String(formData.sede ?? "").trim()}
          />
        </div>

        <div id="tour-doctype">
          <TypeDocumentSelector
            name="identificationtype"
            value={formData.identificationtype}
            onChange={handleChange}
            placeholder="Selecciona un tipo"
            required
            className={`w-full p-2 border rounded bg-surface ${isTourMode && (!formData.identificationtype || formData.identificationtype === 0) ? "border-red-500 ring-2 ring-red-100" : ""}`}
          />
        </div>

        <div id="tour-identification">
          <label>
            N.º de identificación <span className="text-red-500 ml-1">*</span>
          </label>
          <input
            type="text"
            name="identification"
            value={formData.identification}
            onChange={handleChange}
            className={`w-full p-2 border rounded bg-surface ${isTourMode && !String(formData.identification).trim() ? "border-red-500 ring-2 ring-red-100" : ""}`}
          />
        </div>

        <div id="tour-birthdate">
          <label>Fecha de nacimiento</label>
          <input
            type="date"
            name="fecha_nacimiento"
            value={formData.fecha_nacimiento}
            onChange={handleChange}
            className="w-full p-2 border rounded bg-surface"
          />
        </div>

        <div id="tour-firstname">
          <label>
            Primer nombre <span className="text-red-500 ml-1">*</span>
          </label>
          <input
            type="text"
            name="first_name"
            value={formData.first_name}
            onChange={handleChange}
            className={`w-full p-2 border rounded bg-surface ${isTourMode && !String(formData.first_name).trim() ? "border-red-500 ring-2 ring-red-100" : ""}`}
          />
        </div>

        <div id="tour-secondname">
          <label>Segundo nombre</label>
          <input
            type="text"
            name="second_name"
            value={formData.second_name}
            onChange={handleChange}
            className="w-full p-2 border rounded bg-surface"
          />
        </div>

        <div id="tour-firstlastname">
          <label>
            Primer apellido <span className="text-red-500 ml-1">*</span>
          </label>
          <input
            type="text"
            name="first_lastname"
            value={formData.first_lastname}
            onChange={handleChange}
            className={`w-full p-2 border rounded bg-surface ${isTourMode && !String(formData.first_lastname).trim() ? "border-red-500 ring-2 ring-red-100" : ""}`}
          />
        </div>

        <div id="tour-secondlastname">
          <label>Segundo apellido</label>
          <input
            type="text"
            name="second_lastname"
            value={formData.second_lastname}
            onChange={handleChange}
            className="w-full p-2 border rounded bg-surface"
          />
        </div>

        <div id="tour-contact-info" className="md:col-span-3 font-bold mt-4">
          Información de contacto
        </div>

        <div>
          <label>Teléfono</label>
          <input
            type="text"
            name="telephone"
            value={formData.telephone}
            onChange={handleChange}
            className="w-full p-2 border rounded bg-surface"
          />
        </div>

        <div>
          <label>
            Correo <span className="text-red-500 ml-1">*</span>
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className={`w-full p-2 border rounded bg-surface ${isTourMode && !String(formData.email).trim() ? "border-red-500 ring-2 ring-red-100" : ""}`}
          />
        </div>

        <div>
          <label>Contraseña</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className={`w-full p-2 border rounded bg-surface ${formErrors.password ? "border-red-500" : ""}`}
          />
          <p className="text-xs text-gray-500 mt-1">
            Opcional — si se ingresa, mínimo 8 caracteres y debe contener letras
            y números.
          </p>
          {formErrors.password && (
            <p className="text-red-600 text-sm mt-1">{formErrors.password}</p>
          )}
        </div>

        <div>
          <label>Dirección</label>
          <input
            type="text"
            name="direccion"
            value={formData.direccion}
            onChange={handleChange}
            className="w-full p-2 border rounded bg-surface"
          />
        </div>

        <div id="tour-asignatures" className="md:col-span-3">
          <label className="font-semibold">
            Asignaturas <span className="text-red-500 ml-1">*</span>
          </label>
          <AsignatureGrades
            sede={formData.sede}
            workday={formData.workday}
            asignatures={formData.asignature}
            onAdd={handleAddAsignature}
            onRemove={(index) => {
              // remover asignatura y limpiar director_curso si corresponde
              setFormData((prev) => {
                const newAsign = (prev.asignature || []).filter(
                  (_, i) => i !== index,
                );
                // obtener ids de grados restantes
                const remainingGradeIds = new Set(
                  newAsign.flatMap((a) =>
                    (Array.isArray(a.grades) ? a.grades : []).map((gr) =>
                      typeof gr === "object"
                        ? String(gr.idgrade ?? gr.id ?? "")
                        : String(gr),
                    ),
                  ),
                );
                return {
                  ...prev,
                  asignature: newAsign,
                  director_curso: (prev.director_curso || []).filter((g) =>
                    remainingGradeIds.has(String(g)),
                  ),
                };
              });
            }}
          />
        </div>

        {/* Representante de curso + selección de grados (director_curso) */}
        <div className="md:col-span-3 p-4 bg-bg rounded-lg shadow-md">
          <label className="text-lg font-medium">Representante de curso</label>
          <div className="flex items-center gap-3 mt-2">
            <input
              type="checkbox"
              name="representante_curso"
              checked={!!formData.representante_curso}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  representante_curso: !!e.target.checked,
                  // si se desmarca limpiar director_curso
                  director_curso: e.target.checked
                    ? prev.director_curso || []
                    : [],
                }))
              }
              className="w-4 h-4"
            />
            <span
              className={`px-3 py-1 rounded-lg text-sm font-semibold text-center border border-solid  ${formData.representante_curso ? "bg-green-100 text-green-800 border-green-200" : "bg-yellow-100 text-yellow-800 border-yellow-200"}`}
            >
              {formData.representante_curso ? "Sí" : "No"}
            </span>
          </div>

          {formData.representante_curso && (
            <div className="mt-4">
              <label className="block text-sm font-medium mb-2">
                Selecciona los grados donde será Director/Representante:
              </label>
              {Array.isArray(formData.asignature) &&
              formData.asignature.length > 0 ? (
                // construir lista única de {id, name} a partir de las asignaturas añadidas
                (() => {
                  const entries = [];
                  formData.asignature.forEach((a) => {
                    (Array.isArray(a.grades) ? a.grades : []).forEach((g) => {
                      const id =
                        typeof g === "object"
                          ? String(g.idgrade ?? g.id ?? "")
                          : String(g);
                      const name =
                        typeof g === "object"
                          ? String(g.nombre_grado ?? g.grado ?? `Grado ${id}`)
                          : `Grado ${g}`;
                      if (id) entries.push({ id, name });
                    });
                  });
                  const unique = Array.from(
                    new Map(entries.map((x) => [x.id, x])).values(),
                  );
                  return (
                    <div className="grid grid-cols-2 gap-2">
                      {unique.map((grade) => (
                        <label
                          key={grade.id}
                          className="flex items-center gap-2 p-2 border rounded bg-surface"
                        >
                          <input
                            type="checkbox"
                            checked={(formData.director_curso || []).includes(
                              String(grade.id),
                            )}
                            onChange={(e) =>
                              setFormData((prev) => {
                                const current = Array.isArray(
                                  prev.director_curso,
                                )
                                  ? prev.director_curso
                                  : [];
                                return {
                                  ...prev,
                                  director_curso: e.target.checked
                                    ? [...current, String(grade.id)]
                                    : current.filter(
                                        (x) => x !== String(grade.id),
                                      ),
                                };
                              })
                            }
                          />
                          <span className="text-sm">{grade.name}</span>
                        </label>
                      ))}
                    </div>
                  );
                })()
              ) : (
                <div className="text-sm text-gray-600">
                  No hay grados asignados a las asignaturas.
                </div>
              )}
            </div>
          )}
        </div>

        {submitOk ? (
          <div className="md:col-span-3 p-4 rounded-lg border-l-4 border-green-500 bg-gray-50 text-green-700">
            <div className="flex items-start gap-3">
              <svg
                className="w-6 h-6 shrink-0 mt-0.5"
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

        <div
          id="tour-submit"
          className="md:col-span-3 mt-4 flex justify-center"
        >
          <div className="w-full md:w-1/2">
            <SimpleButton
              msj={teacherLoading ? "Registrando..." : "Registrar docente"}
              msjtooltip={
                !canSubmit && missingFields.length > 0
                  ? `Faltan: ${missingFields.join(", ")}`
                  : undefined
              }
              tooltip={!!(!canSubmit && missingFields.length > 0)}
              text={"text-surface"}
              bg={"bg-accent"}
              icon={"Save"}
              disabled={teacherLoading || !canSubmit}
            />
            {!canSubmit && missingFields.length > 0 && (
              <p className="mt-2 text-sm text-center text-red-600">
                Faltan campos obligatorios: {missingFields.join(", ")}
              </p>
            )}
          </div>
        </div>
      </form>
    </div>
  );
};

export default RegisterTeacher;
