import React, { useEffect, useMemo, useState } from "react";

import SedeSelect from "../../components/atoms/SedeSelect";
import JourneySelect from "../../components/atoms/JourneySelect";
import SimpleButton from "../../components/atoms/SimpleButton";
import GradeSelector from "../../components/atoms/GradeSelector";
import PeriodSelector from "../../components/atoms/PeriodSelector";
import AsignatureSelector from "../../components/molecules/AsignatureSelector";
import DataTable from "../../components/atoms/DataTable";
import useSchool from "../../lib/hooks/useSchool";
import useTeacher from "../../lib/hooks/useTeacher";
import useData from "../../lib/hooks/useData";
import useAuth from "../../lib/hooks/useAuth";
import Loader from "../../components/atoms/Loader";
import tourRegisterAssistance from "../../tour/tourRegisterAssistance";
import { useNotify } from "../../lib/hooks/useNotify";
import { asignatureResponse } from "../../services/DataExamples/asignatureResponse";
import { studentsResponse } from "../../services/DataExamples/studentsResponse";

const normalize = (value) =>
  String(value ?? "")
    .trim()
    .toLowerCase();

const uniqueSorted = (values) => {
  const normalized = values.map((v) => String(v ?? "").trim()).filter(Boolean);
  return Array.from(new Set(normalized)).sort((a, b) =>
    a.localeCompare(b, "es", { sensitivity: "base", numeric: true }),
  );
};

const RegisterAssistance = () => {
  const [sedeSelected, setSedeSelected] = useState("");
  const [teacherSedes, setTeacherSedes] = useState([]);
  const [loadingTeacherSedes, setLoadingTeacherSedes] = useState(false);
  const [detectedJourney, setDetectedJourney] = useState(null);

  const [journey, setJourney] = useState("");
  const [asignatureCode, setAsignatureCode] = useState("");
  const [grade, setGrade] = useState("");
  const [group, setGroup] = useState("");
  const [attendanceByStudent, setAttendanceByStudent] = useState({});
  // Modo edición para permitir cambiar los checkboxes de asistencia
  const [isEditMode, setIsEditMode] = useState(false);

  const [studentsFromService, setStudentsFromService] = useState([]);
  const [loadingData, setLoadingData] = useState(false);
  const [period, setPeriod] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fechaAsistencia, setFechaAsistencia] = useState("");

  const notify = useNotify();

  // Hooks y servicios
  const { getStudentGrades } = useSchool();
  const {
    getTeacherGrades,
    getTeacherSubjects,
    getTeacherSede,
    registerAssistance,
  } = useTeacher();
  const { institutionSedes } = useData();
  const { idSede: authIdSede, nameSede, rol, idDocente, token } = useAuth();

  // Detectar si el usuario es docente
  const isTeacher = Boolean(idDocente);

  const canShowStudents = Boolean(
    sedeSelected && journey && asignatureCode && grade && period,
  );

  // Handlers de cascada: limpian los selectores hijos al cambiar el padre.
  // Se ejecutan inline (no en useEffect) para evitar un render intermedio
  // con valores obsoletos que dispararía llamadas a la API con parámetros inválidos.
  const handleSedeChange = (e) => {
    const val = e.target.value;
    setSedeSelected(val);
    setGrade("");
    setAsignatureCode("");
    setJourney("");
    setDetectedJourney(null);
  };

  // Para docentes: Sede -> Grado -> Asignatura -> Jornada
  const handleGradeChangeTeacher = (e) => {
    setGrade(e.target.value);
    setAsignatureCode("");
    setJourney("");
    setDetectedJourney(null);
  };

  // Para no docentes: Sede -> Jornada -> Asignatura -> Grado
  const handleJourneyChangeNonTeacher = (e) => {
    setJourney(e.target.value);
    setAsignatureCode("");
    setGrade("");
  };

  const handleAsignatureChangeNonTeacher = (e) => {
    setAsignatureCode(e.target.value);
    setGrade("");
  };

  // Cuando cambia la jornada, solo evitar limpiar grado para prevenir parpadeos
  // useEffect(() => {
  //   setGroup("");
  // }, [journey]);

  // Seleccionar sede desde auth si rol=7
  useEffect(() => {
    // aceptar tanto rol numérico '7' como la cadena 'docente'
    if (
      (String(rol).toLowerCase() === "docente" || String(rol) === "7") &&
      authIdSede
    ) {
      setSedeSelected(authIdSede);
    }
  }, [rol, authIdSede]);

  // Si existe idDocente, cargar sedes desde el servicio y mapear a {id, name}
  useEffect(() => {
    let mounted = true;

    if (!window.__inflightTeacherSedeRequests)
      window.__inflightTeacherSedeRequests = new Map();
    const inflight = window.__inflightTeacherSedeRequests;

    const load = async () => {
      if (!idDocente || !getTeacherSede || !token) {
        if (mounted) setTeacherSedes([]);
        return;
      }

      const key = String(idDocente);

      if (inflight.has(key)) {
        try {
          if (mounted) setLoadingTeacherSedes(true);
          const mapped = await inflight.get(key);
          if (mounted) setTeacherSedes(mapped || []);
          return;
        } catch (err) {
          console.warn("RegisterAssistance - petición ya en curso falló:", err);
          if (mounted) setTeacherSedes([]);
          return;
        } finally {
          if (mounted) setLoadingTeacherSedes(false);
        }
      }

      if (mounted) setLoadingTeacherSedes(true);

      const prom = (async () => {
        const res = await getTeacherSede({ idTeacher: Number(idDocente) });
        const list = Array.isArray(res) ? res : (res?.data ?? []);
        const mapped = (Array.isArray(list) ? list : [])
          .filter(Boolean)
          .map((s) => ({
            id: String(s?.id ?? s?.id_sede ?? "").trim(),
            name: String(s?.name ?? s?.nombre ?? s?.nombre_sede ?? "").trim(),
            fk_workday: s?.fk_workday ?? s?.fkWorkday ?? undefined,
          }));
        return mapped;
      })();

      inflight.set(key, prom);

      try {
        const mapped = await prom;
        if (mounted) setTeacherSedes(mapped || []);

        if (mounted && mapped.length === 1 && !sedeSelected) {
          setSedeSelected(mapped[0].id);
        }
      } catch (err) {
        console.error(
          "RegisterAssistance - Error cargando sedes de docente:",
          err,
        );
        notify.error("No fue posible cargar las sedes del docente");
        if (mounted) setTeacherSedes([]);
      } finally {
        inflight.delete(key);
        if (mounted) setLoadingTeacherSedes(false);
      }
    };

    load();

    return () => {
      mounted = false;
    };
  }, [idDocente, getTeacherSede, token, sedeSelected]);

  // Limpiar asignatura y detectedJourney cuando cambia el grado para evitar incoherencias
  useEffect(() => {
    setAsignatureCode("");
    setDetectedJourney(null);
  }, [grade]);

  // NOTE: `getStudentKey`, `getStudentName` y `handleToggleAttendance` están
  // definidos más abajo (implementaciones consolidadas). Se eliminó la
  // duplicación para evitar conflictos de declaración.

  const selectedCount = useMemo(() => {
    const values = Object.values(attendanceByStudent ?? {});
    // Contar únicamente los marcados como PRESENTE
    return values.filter((v) => String(v ?? "").trim() === "PRESENTE").length;
  }, [attendanceByStudent]);

  const handleSubmitAll = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);

    const fecha_assistance =
      fechaAsistencia || new Date().toISOString().slice(0, 10); // YYYY-MM-DD

    const rows = (studentsFromService || []).map((student) => {
      const studentKey = getStudentKey(student);
      // Forzar PRESENTE en el payload (checkbox siempre seleccionado)
      return {
        fk_estudiante:
          Number(
            student?.id_estudiante ?? student?.id_student ?? student?.id,
          ) || null,
        fk_asignatura: Number(asignatureCode) || null,
        fk_grado: Number(grade) || null,
        fk_periodo: Number(period) || null,
        presente: String(
          (attendanceByStudent?.[studentKey] ?? "PRESENTE") === "PRESENTE"
            ? "Si"
            : "No",
        ),
        fk_sede: Number(sedeSelected) || null,
        fecha_assistance,
      };
    });
    console.log(
      "RegisterAssistance - payload para registrar asistencia:",
      rows,
    );

    try {
      await registerAssistance(rows);
      notify.success("Asistencia registrada correctamente");
      // regresar al modo no edición para mostrar el botón "Activar Asistencia"
      setIsEditMode(false);
      // marcar todas las filas como guardadas (persistente)
      setRowSavedById((prev) => {
        const next = { ...(prev ?? {}) };
        (studentsFromService || []).forEach((s) => {
          next[getStudentKey(s)] = true;
        });
        return next;
      });
      // opcional: limpiar seleccion
      setAttendanceByStudent({});
    } catch (err) {
      console.error("RegisterAssistance - error registrando asistencia:", err);
      notify.error(err?.message || "Error al registrar asistencia");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Opciones / params para asignaturas basadas en el grado y docente
  const teacherSubjectsParams = useMemo(() => {
    return grade && idDocente
      ? { idGrade: Number(grade), idTeacher: Number(idDocente) }
      : {};
  }, [grade, idDocente]);

  // Cargar estudiantes cuando estén los filtros mínimos
  useEffect(() => {
    let mounted = true;
    const loadStudents = async () => {
      if (!canShowStudents) {
        if (mounted) setStudentsFromService([]);
        return;
      }

      setLoadingData(true);
      try {
        const res = await getStudentGrades({ idGrade: Number(grade) });
        const list = Array.isArray(res) ? res : (res?.data ?? []);
        if (!mounted) return;
        setStudentsFromService(list || []);
        // inicializar estado de asistencia para los estudiantes si no existe
        const initial = {};
        (list || []).forEach((s) => {
          const key = getStudentKey(s);
          // Por defecto marcar PRESENTE si no hay valor previo
          initial[key] = attendanceByStudent[key] ?? "PRESENTE";
        });
        if (mounted)
          setAttendanceByStudent((prev) => ({ ...initial, ...prev }));
      } catch (err) {
        console.error("RegisterAssistance - error cargando estudiantes:", err);
        notify.error(
          "No fue posible cargar estudiantes para el curso seleccionado",
        );
        if (mounted) setStudentsFromService([]);
      } finally {
        if (mounted) setLoadingData(false);
      }
    };

    loadStudents();
    return () => {
      mounted = false;
    };
  }, [canShowStudents, grade, getStudentGrades]);

  const teacherGradesParams = useMemo(() => {
    return {
      ...(idDocente && { idTeacher: Number(idDocente) }),
      ...(sedeSelected && { idSede: Number(sedeSelected) }),
    };
  }, [idDocente, sedeSelected]);

  // Obtener el fk_workday de la sede seleccionada (buscar tanto en institutionSedes como en teacherSedes)
  const sedeWorkday = useMemo(() => {
    if (!sedeSelected) return null;
    const candidates = Array.isArray(institutionSedes) ? institutionSedes : [];
    const teacherCandidates = Array.isArray(teacherSedes) ? teacherSedes : [];
    const combined = [...candidates, ...teacherCandidates];

    const sede = combined.find(
      (s) => String(s?.id ?? s?.id_sede) === String(sedeSelected),
    );
    return sede?.fk_workday ? String(sede.fk_workday) : null;
  }, [sedeSelected, institutionSedes, teacherSedes]);

  // Auto-seleccionar jornada basada en el fk_workday de la sede (solo docentes)
  useEffect(() => {
    if (!sedeWorkday || sedeWorkday === "3") return;
    if (isTeacher) {
      setJourney(sedeWorkday);
    }
  }, [sedeWorkday, isTeacher]);

  // Datos de la sede del docente: preferir resultado de getTeacherSede si existe
  const teacherSedeData = useMemo(() => {
    if (teacherSedes.length) return teacherSedes;
    // aceptar tanto rol numérico '7' como la cadena 'docente'
    if (
      (String(rol).toLowerCase() === "docente" || String(rol) === "7") &&
      authIdSede &&
      nameSede
    ) {
      return [{ id: authIdSede, name: nameSede }];
    }
    return null;
  }, [rol, authIdSede, nameSede, teacherSedes]);

  const gradeOptions = useMemo(() => {
    const base =
      Array.isArray(studentsFromService) && studentsFromService.length > 0
        ? studentsFromService
        : Array.isArray(studentsResponse)
          ? studentsResponse
          : [];
    const filtered = journey
      ? base.filter((s) => normalize(s?.journey) === normalize(journey))
      : base;
    return uniqueSorted(filtered.map((s) => s?.grade_scholar));
  }, [journey, studentsFromService]);

  const groupOptions = useMemo(() => {
    const base =
      Array.isArray(studentsFromService) && studentsFromService.length > 0
        ? studentsFromService
        : Array.isArray(studentsResponse)
          ? studentsResponse
          : [];
    const filtered = base.filter((s) => {
      if (journey && normalize(s?.journey) !== normalize(journey)) return false;
      if (grade && String(s?.grade_scholar ?? "").trim() !== String(grade)) {
        return false;
      }
      return true;
    });
    return uniqueSorted(filtered.map((s) => s?.group_grade));
  }, [grade, journey, studentsFromService]);

  const filteredStudents = useMemo(() => {
    const base =
      Array.isArray(studentsFromService) && studentsFromService.length > 0
        ? studentsFromService
        : Array.isArray(studentsResponse)
          ? studentsResponse
          : [];
    return base.filter((s) => {
      if (journey && normalize(s?.journey) !== normalize(journey)) return false;
      if (grade && String(s?.grade_scholar ?? "").trim() !== String(grade)) {
        return false;
      }
      if (group && String(s?.group_grade ?? "").trim() !== String(group)) {
        return false;
      }
      return true;
    });
  }, [grade, group, journey, studentsFromService]);

  const getStudentKey = (student) => {
    const id =
      student?.id_estudiante ??
      student?.id_student ??
      student?.identification ??
      student?.id;
    return String(id ?? "").trim();
  };

  const getStudentName = (student) => {
    if (student?.nombre) return String(student.nombre).trim();
    const firstName = String(student?.first_name ?? "").trim();
    const secondName = String(student?.second_name ?? "").trim();
    const firstLastname = String(student?.first_lastname ?? "").trim();
    const secondLastname = String(student?.second_lastname ?? "").trim();
    return [firstLastname, secondLastname, firstName, secondName]
      .filter(Boolean)
      .join(" ");
  };

  const handleAttendanceChange = (studentKey, value) => {
    // al modificar la asistencia, marcar la fila como 'no guardada'
    setRowSavedById((prev) => ({ ...(prev ?? {}), [studentKey]: false }));
    setAttendanceByStudent((prev) => ({
      ...(prev ?? {}),
      [studentKey]: value,
    }));
  };

  const handleToggleAttendance = (studentKey, option) => (e) => {
    const checked = Boolean(e.target.checked);
    // al modificar la asistencia, marcar la fila como 'no guardada'
    setRowSavedById((prev) => ({ ...(prev ?? {}), [studentKey]: false }));
    setAttendanceByStudent((prev) => {
      const next = { ...(prev ?? {}) };
      if (!checked) {
        if (next[studentKey] === option) {
          next[studentKey] = "";
        }
        return next;
      }
      next[studentKey] = option;
      return next;
    });
  };

  // Estados por fila para carga/guardado individual
  const [rowLoadingById, setRowLoadingById] = useState({});
  const [rowSavedById, setRowSavedById] = useState({});

  const saveRow = async (student) => {
    const key = getStudentKey(student);

    // permitir guardar aunque no haya marca: ausente por defecto ("No")
    const attendance = attendanceByStudent?.[key] ?? "";

    setRowLoadingById((prev) => ({ ...(prev ?? {}), [key]: true }));
    try {
      const payload = {
        fk_estudiante:
          Number(
            student?.id_estudiante ?? student?.id_student ?? student?.id,
          ) || null,
        fk_asignatura: Number(asignatureCode) || null,
        fk_grado: Number(grade) || null,
        fk_periodo: Number(period) || null,
        presente: String(attendance === "PRESENTE" ? "Si" : "No"),
        fk_sede: Number(sedeSelected) || null,
      };
      await registerAssistance(payload);
      // marcar como guardado (persistente hasta que el usuario cambie la fila)
      setRowSavedById((prev) => ({ ...(prev ?? {}), [key]: true }));
      notify.success(
        "Asistencia guardada para " + (getStudentName(student) || key),
      );
    } catch (err) {
      console.error("saveRow error:", err);
      notify.error(err?.message || "No se pudo guardar la asistencia");
    } finally {
      setRowLoadingById((prev) => ({ ...(prev ?? {}), [key]: false }));
    }
  };

  return (
    <div className="p-3 h-full gap-4 flex flex-col">
      {/* Global loader when any row or data is loading */}
      {(Object.values(rowLoadingById || {}).some(Boolean) ||
        loadingData ||
        loadingTeacherSedes) && (
        <Loader
          message={
            Object.values(rowLoadingById || {}).some(Boolean)
              ? "Guardando..."
              : "Cargando..."
          }
          size={56}
        />
      )}
      <div className="w-full grid grid-cols-5 justify-between items-center  text-surface  rounded-lg">
        <h2 className="col-span-4 text-2xl font-bold"></h2>
        <SimpleButton
          type="button"
          onClick={tourRegisterAssistance}
          icon="HelpCircle"
          msjtooltip="Iniciar tutorial"
          noRounded={false}
          bg="bg-info"
          text="text-surface"
          className="w-auto px-3 py-1.5"
        />
      </div>

      <div
        id="tour-filters-assistance"
        className="grid grid-cols-1 md:grid-cols-5 gap-4"
      >
        <div id="tour-sede-assistance">
          <SedeSelect
            value={sedeSelected}
            onChange={handleSedeChange}
            className="w-full p-2 border rounded bg-surface"
            labelClassName="text-lg font-semibold"
            data={teacherSedeData}
            loading={loadingTeacherSedes}
          />
        </div>

        {/* Orden para Docentes: Sede -> Grado -> Asignatura -> Jornada */}
        {isTeacher ? (
          <>
            <div id="tour-grade-assistance">
              <GradeSelector
                name="grade"
                label="Curso"
                labelClassName="text-lg font-semibold"
                value={grade}
                onChange={handleGradeChangeTeacher}
                className="w-full p-2 border rounded bg-surface"
                sedeId={sedeSelected}
                workdayId={journey}
                customFetchMethod={getTeacherGrades}
                additionalParams={teacherGradesParams}
                disabled={!sedeSelected}
              />
            </div>
            <div id="tour-asignature-assistance">
              <AsignatureSelector
                name="asignature"
                label="Asignatura"
                labelClassName="text-lg font-semibold"
                value={asignatureCode}
                onChange={(e) => setAsignatureCode(e.target.value)}
                className="w-full p-2 border rounded bg-surface"
                sedeId={sedeSelected}
                workdayId={journey}
                customFetchMethod={getTeacherSubjects}
                additionalParams={teacherSubjectsParams}
                onJourneyDetected={(journeyObj) => {
                  if (journeyObj && journeyObj.id) {
                    setJourney(String(journeyObj.id));
                    setDetectedJourney(journeyObj);
                  }
                }}
                disabled={!grade}
              />
            </div>
            <div id="tour-journey-assistance">
              <JourneySelect
                name="workday"
                label="Jornada"
                labelClassName="text-lg font-semibold"
                value={journey}
                onChange={(e) => setJourney(e.target.value)}
                className="w-full p-2 border rounded bg-surface"
                filterValue={sedeWorkday}
                includeAmbas={false}
                subjectJourney={detectedJourney}
                useTeacherSubjects={!Boolean(asignatureCode) && Boolean(grade)}
                sedeId={sedeSelected}
                idTeacher={idDocente}
                lockByAsignature={true}
              />
            </div>
          </>
        ) : (
          /* Orden para No Docentes: Sede -> Jornada -> Asignatura -> Grado */
          <>
            <div id="tour-journey-assistance">
              <JourneySelect
                name="workday"
                label="Jornada"
                labelClassName="text-lg font-semibold"
                value={journey}
                onChange={handleJourneyChangeNonTeacher}
                className="w-full p-2 border rounded bg-surface"
                filterValue={sedeWorkday}
                includeAmbas={false}
                disabled={!sedeSelected}
              />
            </div>
            <div id="tour-asignature-assistance">
              <AsignatureSelector
                name="asignature"
                label="Asignatura"
                labelClassName="text-lg font-semibold"
                value={asignatureCode}
                onChange={handleAsignatureChangeNonTeacher}
                className="w-full p-2 border rounded bg-surface"
                sedeId={sedeSelected}
                workdayId={journey}
                disabled={!journey}
              />
            </div>
            <div id="tour-grade-assistance">
              <GradeSelector
                name="grade"
                label="Curso"
                labelClassName="text-lg font-semibold"
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
                className="w-full p-2 border rounded bg-surface"
                sedeId={sedeSelected}
                workdayId={journey}
                disabled={!asignatureCode}
              />
            </div>
          </>
        )}
        <div id="tour-period-assistance">
          <PeriodSelector
            name="period"
            label="Período"
            labelClassName="text-lg font-semibold"
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="w-full p-2 border rounded bg-surface"
          />
        </div>
        <div id="tour-date-assistance">
          <label className="text-lg font-semibold block mb-1">
            Fecha de asistencia
          </label>
          <input
            type="date"
            value={fechaAsistencia}
            onChange={(e) => setFechaAsistencia(e.target.value)}
            className="w-full p-2 border rounded bg-surface"
          />
          {!fechaAsistencia && (
            <p className="text-xs opacity-60 mt-1">
              Se usará la fecha de hoy ({new Date().toISOString().slice(0, 10)})
            </p>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-4">
        {!canShowStudents ? (
          <div className="text-sm opacity-80">
            Completa los filtros (sede, curso, asignatura, jornada y período).
          </div>
        ) : (studentsFromService || []).length === 0 ? (
          <div className="text-sm opacity-80">
            No hay estudiantes para los filtros seleccionados.
          </div>
        ) : (
          <div className="bg-surface border rounded">
            <div className="p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <div id="tour-assistance-count" className="text-sm opacity-80">
                Estudiantes:{" "}
                <span className="font-medium">
                  {studentsFromService.length}
                </span>{" "}
                · Marcados: <span className="font-medium">{selectedCount}</span>
              </div>

              <div className="flex gap-2">
                <SimpleButton
                  type="button"
                  onClick={() => setIsEditMode((s) => !s)}
                  icon={isEditMode ? "X" : "Edit"}
                  bg={isEditMode ? "bg-error" : "bg-secondary"}
                  text="text-surface"
                  msj={isEditMode ? "Cerrar Asistencia" : "Activar Asistencia"}
                  className="px-3 py-1.5 tour-edit-toggle"
                />

                {isEditMode && (
                  <SimpleButton
                    type="button"
                    onClick={handleSubmitAll}
                    icon="Save"
                    bg="bg-accent"
                    text="text-surface"
                    msj="Guardar asistencias"
                    className="px-3 py-1.5"
                    disabled={isSubmitting}
                  />
                )}
              </div>
            </div>

            <div id="tour-assistance-table" className="p-4">
              <DataTable
                data={(studentsFromService || []).map((s) => ({
                  id: getStudentKey(s),
                  identification:
                    s?.identification || s?.id_estudiante || s?.id || "",
                  fullName: s?.nombre || getStudentName(s),
                  grade: s?.grado || s?.grade_scholar || s?.grade || "",
                  group: s?.group_grade || s?.group || "",
                }))}
                rowClassName={(row) =>
                  rowSavedById?.[row.original.id] ? "saved-row" : ""
                }
                columns={[
                  { accessorKey: "identification", header: "Documento" },
                  {
                    accessorKey: "fullName",
                    header: "Estudiante",
                    meta: { hideOnSM: false },
                  },
                  {
                    id: "present",
                    header: "Presente",
                    cell: ({ row }) => {
                      const key = row.original.id;
                      const attendance = attendanceByStudent?.[key] ?? "";
                      return (
                        <input
                          type="checkbox"
                          className="w-5 h-5 m-2  mx-auto tour-present-checkbox"
                          checked={
                            isEditMode ? attendance === "PRESENTE" : true
                          }
                          onChange={
                            isEditMode
                              ? handleToggleAttendance(key, "PRESENTE")
                              : undefined
                          }
                          disabled={!isEditMode}
                          aria-label={
                            isEditMode
                              ? "Editar presencia"
                              : "Presente (siempre seleccionado)"
                          }
                        />
                      );
                    },
                  },
                ]}
                pageSize={50}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RegisterAssistance;
