import React, { useState, useCallback, useContext } from "react";
import { StudentContext } from "../../lib/context/StudentContext";
import Loader from "../../components/atoms/Loader";
import SimpleButton from "../../components/atoms/SimpleButton";
import { handleNumericInput } from "../../utils/formatUtils";
import useAuth from "../../lib/hooks/useAuth";
import useStudent from "../../lib/hooks/useStudent";
import { useNotification } from "../../lib/context/NotificationContext";

// ─── Tarjeta de observación ───────────────────────────────────────────────────
const ObservacionCard = ({ entry, index, onDelete }) => {
  const fmtDate = (iso) => {
    if (!iso) return "-";
    const d = new Date(iso);
    if (isNaN(d.getTime())) return String(iso);
    return d.toLocaleDateString("es-CO", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  return (
    <div className="border rounded bg-surface shadow-sm overflow-hidden">
      {/* Cabecera con fecha */}
      <div className="bg-primary/10 px-4 py-2 flex items-center justify-between">
        <span className="font-semibold text-sm">{fmtDate(entry.fecha)}</span>
        <button
          onClick={() => onDelete(index)}
          className="text-red-500 hover:text-red-700 transition-colors"
          title="Eliminar observación"
        >
          ✕
        </button>
      </div>
      {/* Texto */}
      <div className="px-4 py-3 text-sm whitespace-pre-wrap">
        {entry.observacion || (
          <span className="text-gray-400 italic">Sin observación</span>
        )}
      </div>
      {/* Firmas */}
      {(entry.docente != null ||
        entry.estudiante != null ||
        entry.acudiente != null) && (
        <div className="border-t grid grid-cols-3 divide-x text-xs">
          {[
            { label: "DOCENTE", val: entry.docente },
            { label: "ESTUDIANTE", val: entry.estudiante },
            { label: "ACUDIENTE", val: entry.acudiente },
          ].map(({ label, val }) => (
            <div key={label} className="px-3 py-2">
              <span className="font-bold">{label}:</span>{" "}
              <span>{val || ""}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ─── Página principal ─────────────────────────────────────────────────────────
const ObservadorEstudiante = ({ onClose }) => {
  const { getStudentObserver, registerObservation } = useStudent();
  const {
    imgSchool,
    userName,
    nameRole,
    idDocente,
    idInstitution,
    fkInstitucion,
    rol,
  } = useAuth();
  const { addNotification } = useNotification();

  const isDocente =
    (typeof nameRole === "string" &&
      nameRole.toLowerCase().includes("docente")) ||
    String(rol) === "7";

  const teacherName = isDocente ? userName || "" : "";
  const effectiveInstitution = isDocente ? fkInstitucion : idInstitution;

  const [studentId, setStudentId] = useState("");
  const [student, setStudent] = useState(null);
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [hasHistory, setHasHistory] = useState(false);

  const [form, setForm] = useState({
    observacion: "",
    estudiante: "",
    docente: teacherName,
    acudiente: "",
    lugar_nacimiento: "",
    ocupacion: "",
    telefono: "",
    direccion: "",
  });

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!form.observacion.trim()) return;

    setSubmitLoading(true);
    console.log("handleFormSubmit invoked with form data:", form);
    const datePrefix = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
    const payload = {
      fk_estudiante: student.id_estudiante,
      fk_grado: student.id_grado ?? student.fk_grado,
      lugar_nacimiento: form.lugar_nacimiento,
      fk_acudiente: student.id_acudiente,
      ocupacion: form.ocupacion,
      observacion: `${datePrefix}: ${form.observacion} ${userName} |-|`,
      telefono: form.telefono,
      direccion: form.direccion,
      fk_institucion: Number(effectiveInstitution),
    };
    if (isDocente && idDocente) {
      payload.fk_docente = idDocente;
    }

    try {
      const res = await registerObservation(payload);
      setEntries((prev) => [
        ...prev,
        {
          observacion: form.observacion,
          docente: form.docente,
          acudiente: form.acudiente,
          fecha: new Date().toISOString(),
        },
      ]);
      addNotification("¡Observación registrada correctamente!", "success");
      setForm((prev) => ({
        ...prev,
        observacion: "",
        docente: teacherName,
      }));

      if (res && (res.code === "OK" || res.status === 200)) {
        onClose?.();
      }
    } catch (err) {
      console.error("handleFormSubmit error", err);
      addNotification(
        "Error al registrar la observación. Intenta nuevamente.",
        "error",
      );
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleSearch = async () => {
    console.log("handleSearch invoked, studentId=", studentId);
    const value = studentId.trim();
    if (!value) {
      console.log("handleSearch aborted: empty value");
      return;
    }
    setLoading(true);
    try {
      let found = await getStudentObserver({
        numberId: value,
        fk_institucion: effectiveInstitution,
      });
      console.log("ObservadorEstudiante: Resultado de búsqueda:", found);
      // soporte en caso que contexto no normalice
      if (Array.isArray(found)) found = found[0] || null;
      if (found?.tiene_observacion) {
        setHasHistory(true);
        setStudent(null);
        setLoading(false);
        return;
      }
      setHasHistory(false);
      setStudent(found);
      setForm({
        observacion: "",
        estudiante: found?.nombre_estudiante || "",
        docente: teacherName,
        acudiente: found?.nombre_acudiente || "",
        lugar_nacimiento: found?.lugar_nacimiento || "",
        ocupacion: found?.ocupacion_acudiente || "",
        telefono: found?.telefono_observacion || "",
        direccion: found?.direccion_observacion || "",
      });
      setEntries([]);
    } catch (err) {
      console.error("handleSearch error", err);
      addNotification("Estudiante no encontrado.", "error");
      setStudent(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="border p-6 rounded  h-full flex flex-col gap-6">
      <h2 className="font-bold text-2xl">Observador del Estudiante</h2>

      {/* ── Búsqueda ── */}
      <div className="flex flex-col gap-3 border-b pb-4">
        <div className="grid grid-cols-1 md:grid-cols-4 xl:grid-cols-8 gap-3 items-end">
          <div className="col-span-1 md:col-span-2 xl:col-span-3 flex flex-col gap-1">
            <label className="text-sm font-semibold">
              Documento de identidad del estudiante
            </label>
            <input
              type="text"
              placeholder="Documento de identidad"
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              disabled={loading}
              className="bg-surface rounded p-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-secondary"
            />
          </div>
          <div className="col-span-1 md:col-span-1 xl:col-span-2">
            <SimpleButton
              type="button"
              msj={loading ? "Buscando…" : "Buscar"}
              onClick={handleSearch}
              bg="bg-secondary"
              text="text-surface"
              hover="hover:bg-secondary/80"
              icon="Search"
              disabled={loading}
            />
          </div>
        </div>
      </div>

      {/* ── Aviso historial existente ── */}
      {hasHistory && (
        <div className="flex flex-col items-center gap-4 py-8">
          <span className="text-4xl">⚠️</span>
          <p className="text-lg font-semibold text-center">
            Estudiante ya tiene historial
          </p>
          <div className="w-36">
            <SimpleButton
              msj="Aceptar"
              type="button"
              onClick={() => {
                setHasHistory(false);
                setStudentId("");
                onClose?.();
              }}
              bg="bg-secondary"
              text="text-surface"
              hover="hover:bg-secondary/80"
            />
          </div>
        </div>
      )}

      {/* ── Loader ── */}
      {loading && <Loader message="Buscando estudiante..." size={64} />}

      {/* ── Datos del estudiante ── */}
      {student && (
        <>
          <div className="bg-surface border rounded p-4 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            {/* Foto */}
            <div className="flex flex-col items-center justify-center">
              <img
                src={imgSchool}
                alt="Foto estudiante"
                className="w-24 h-24 rounded-full object-cover border-2 border-secondary"
                onError={(e) => {
                  e.target.src = "";
                  e.target.style.display = "none";
                }}
              />
            </div>

            {/* Información básica */}
            <div className="flex flex-col gap-2 md:col-span-1 xl:col-span-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-2 text-sm">
                {[
                  { label: "ID Estudiante", val: student.id_estudiante },
                  {
                    label: "Identificación",
                    val: student.identificacion_estudiante,
                  },
                  { label: "Nombre", val: student.nombre_estudiante },
                  {
                    label: "Fecha Nacimiento",
                    val: student.fecha_estudiante
                      ? new Date(student.fecha_estudiante).toLocaleDateString(
                          "es-CO",
                        )
                      : "-",
                  },

                  { label: "Grado", val: student.nombre_grado },
                  { label: "Grupo", val: student.grupo },
                  { label: "Jornada", val: student.nombre_jornada },
                  { label: "ID Acudiente", val: student.id_acudiente },
                  { label: "Nombre Acudiente", val: student.nombre_acudiente },
                  {
                    label: "Identif. Acudiente",
                    val: student.identificacion_padre,
                  },
                ].map(({ label, val }) => (
                  <div key={label} className="flex flex-col">
                    <span className="font-semibold text-xs text-gray-500 uppercase">
                      {label}
                    </span>
                    <span className="font-medium truncate">{val || "-"}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── Datos adicionales acudiente ── */}
          <div className="bg-surface border rounded p-4 grid grid-cols-1 sm:grid-cols-4 gap-4 text-sm">
            <div className="flex flex-col gap-1">
              <label className="font-semibold text-xs text-gray-500 uppercase">
                Dirección
              </label>
              <input
                type="text"
                name="direccion"
                value={form.direccion}
                onChange={handleFormChange}
                placeholder="-"
                className="border border-gray-300 rounded p-2 focus:outline-none focus:ring-2 focus:ring-secondary"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="font-semibold text-xs text-gray-500 uppercase">
                Lugar Nacimiento
              </label>
              <input
                type="text"
                name="lugar_nacimiento"
                value={form.lugar_nacimiento}
                onChange={handleFormChange}
                placeholder="-"
                className="border border-gray-300 rounded p-2 focus:outline-none focus:ring-2 focus:ring-secondary"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="font-semibold text-xs text-gray-500 uppercase">
                Ocupación Acudiente
              </label>
              <input
                type="text"
                name="ocupacion"
                value={form.ocupacion}
                onChange={handleFormChange}
                placeholder="-"
                className="border border-gray-300 rounded p-2 focus:outline-none focus:ring-2 focus:ring-secondary"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="font-semibold text-xs text-gray-500 uppercase">
                Teléfono Acudiente
              </label>
              <input
                type="text"
                name="telefono"
                value={form.telefono}
                onChange={handleFormChange}
                placeholder="-"
                className="border border-gray-300 rounded p-2 focus:outline-none focus:ring-2 focus:ring-secondary"
              />
            </div>
          </div>

          {/* ── Acciones ── */}
          <h3 className="font-semibold text-lg">
            Observaciones ({entries.length})
          </h3>

          {/* ── Formulario inline ── */}
          <form
            onSubmit={handleFormSubmit}
            className="bg-surface border rounded p-4 flex flex-col gap-4"
          >
            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold">Observación</label>
              <textarea
                name="observacion"
                value={form.observacion}
                onChange={handleFormChange}
                rows={4}
                required
                placeholder="Describe la observación..."
                className=" border border-gray-300 rounded p-2 focus:outline-none focus:ring-2 focus:ring-secondary resize-y"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-sm font-semibold">Docente</label>
                <input
                  type="text"
                  name="docente"
                  value={form.docente}
                  onChange={handleFormChange}
                  placeholder="Nombre del docente"
                  className="  border border-gray-300 rounded p-2 focus:outline-none focus:ring-2 focus:ring-secondary"
                  disabled={!isDocente}
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-sm font-semibold">Estudiante</label>
                <input
                  type="text"
                  name="estudiante"
                  value={form.estudiante}
                  onChange={handleFormChange}
                  placeholder="Nombre del estudiante"
                  className="  border border-gray-300 rounded p-2 focus:outline-none focus:ring-2 focus:ring-secondary"
                  disabled
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-sm font-semibold">Acudiente</label>
                <input
                  type="text"
                  name="acudiente"
                  value={form.acudiente}
                  onChange={handleFormChange}
                  placeholder="Nombre del acudiente"
                  className="  border border-gray-300 rounded p-2 focus:outline-none focus:ring-2 focus:ring-secondary"
                  disabled
                />
              </div>
            </div>

            <div className="flex justify-end">
              <div className="w-36">
                <SimpleButton
                  msj={submitLoading ? "Guardando…" : "Guardar"}
                  type="submit"
                  bg="bg-secondary"
                  text="text-surface"
                  hover="hover:bg-secondary/80"
                  icon="Save"
                  disabled={submitLoading}
                />
              </div>
            </div>
          </form>
        </>
      )}
    </div>
  );
};

export default ObservadorEstudiante;
