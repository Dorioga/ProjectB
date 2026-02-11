import React, { useEffect, useMemo, useState, useRef } from "react";

import SimpleButton from "../../components/atoms/SimpleButton";
import SedeSelect from "../../components/atoms/SedeSelect";
import JourneySelect from "../../components/atoms/JourneySelect";
import PeriodSelector from "../../components/atoms/PeriodSelector";
import GradeSelector from "../../components/atoms/GradeSelector";
import AsignatureSelector from "../../components/molecules/AsignatureSelector";
import useSchool from "../../lib/hooks/useSchool";
import useData from "../../lib/hooks/useData";
import useAuth from "../../lib/hooks/useAuth";
import { useNotify } from "../../lib/hooks/useNotify";
import { asignatureResponse } from "../../services/DataExamples/asignatureResponse";
import { studentsResponse } from "../../services/DataExamples/studentsResponse";

const normalize = (value) =>
  String(value ?? "")
    .trim()
    .toLowerCase();

const RegisterStudentRecords = () => {
  const {
    getTeacherSede,
    records,
    loadingRecords,
    errorRecords,
    reloadRecords,
    getTeacherGrades,
    getTeacherSubjects,
    getStudentGrades,
    getStudentNotes,
    saveAssignmentNotes,
  } = useSchool();
  const { institutionSedes } = useData();
  const { idSede, nameSede, rol, idDocente, token } = useAuth();
  const notify = useNotify();
  const [sedeSelected, setSedeSelected] = useState("");
  const [workdaySelected, setWorkdaySelected] = useState("");
  const [gradeSelected, setGradeSelected] = useState("");
  const [asignatureSelected, setAsignatureSelected] = useState("");
  const [periodSelected, setPeriodSelected] = useState("");
  const [journey, setJourney] = useState("");
  const [asignatureCode, setAsignatureCode] = useState("");
  const [recordValuesByStudent, setRecordValuesByStudent] = useState({});
  const [notesFromService, setNotesFromService] = useState([]);
  const [studentsFromService, setStudentsFromService] = useState([]);
  const [loadingData, setLoadingData] = useState(false);
  const [commentsById, setCommentsById] = useState({});

  // SedEs del docente (obtenidas vía getTeacherSede)
  const [teacherSedes, setTeacherSedes] = useState([]);
  const [loadingTeacherSedes, setLoadingTeacherSedes] = useState(false);
  const [detectedJourney, setDetectedJourney] = useState(null);

  // Memoizar additionalParams para evitar re-renders
  const teacherGradesParams = useMemo(
    () => ({
      ...(idDocente && { idTeacher: Number(idDocente) }),
      ...(sedeSelected && { idSede: Number(sedeSelected) }),
    }),
    [idDocente, sedeSelected],
  );

  const teacherSubjectsParams = useMemo(
    () =>
      gradeSelected && idDocente
        ? { idGrade: Number(gradeSelected), idTeacher: Number(idDocente) }
        : {},
    [gradeSelected, idDocente],
  );

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

  // Datos de la sede del docente: preferir resultado de getTeacherSede si existe
  const teacherSedeData = useMemo(() => {
    if (teacherSedes.length) return teacherSedes;
    if (String(rol) === "7" && idSede && nameSede) {
      return [{ id: idSede, name: nameSede }];
    }
    return null;
  }, [rol, idSede, nameSede, teacherSedes]);

  const canShowStudents = Boolean(
    sedeSelected &&
    gradeSelected &&
    asignatureSelected &&
    workdaySelected &&
    periodSelected &&
    journey &&
    asignatureCode,
  );

  // Si existe idDocente, cargar sedes desde el servicio y mapear a {id, name}
  // Mejoras: esperar a que haya token y evitar llamadas duplicadas (deduplicación por idDocente)
  useEffect(() => {
    let mounted = true;

    // Usar cache temporal a nivel global para evitar duplicados entre mounts en StrictMode
    if (!window.__inflightTeacherSedeRequests)
      window.__inflightTeacherSedeRequests = new Map();
    const inflight = window.__inflightTeacherSedeRequests;

    const load = async () => {
      if (!idDocente || !getTeacherSede || !token) {
        // Si no hay idDocente o token aún, limpiar y salir
        if (mounted) setTeacherSedes([]);
        return;
      }

      const key = String(idDocente);

      // Si ya hay una petición en curso para este docente, reutilizarla
      if (inflight.has(key)) {
        try {
          if (mounted) setLoadingTeacherSedes(true);
          const mapped = await inflight.get(key);
          if (mounted) setTeacherSedes(mapped || []);
          return;
        } catch (err) {
          console.warn(
            "RegisterStudentRecords - petición ya en curso falló:",
            err,
          );
          if (mounted) setTeacherSedes([]);
          return;
        } finally {
          if (mounted) setLoadingTeacherSedes(false);
        }
      }

      if (mounted) setLoadingTeacherSedes(true);

      const prom = (async () => {
        const res = await getTeacherSede({ idTeacher: Number(idDocente) });
        // Respuesta esperada: array de objetos o { code, data: [...] }
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

        // Si solo hay una sede, autoseleccionar si no hay selección
        if (mounted && mapped.length === 1 && !sedeSelected) {
          setSedeSelected(mapped[0].id);
        }
      } catch (err) {
        console.error(
          "RegisterStudentRecords - Error cargando sedes de docente:",
          err,
        );
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

  // Limpiar cascada cuando cambia la sede
  useEffect(() => {
    setGradeSelected("");
    setAsignatureSelected("");
    setWorkdaySelected("");
    setDetectedJourney(null);
  }, [sedeSelected]);

  // Limpiar cascada cuando cambia el grado
  useEffect(() => {
    setAsignatureSelected("");
    setWorkdaySelected("");
    setDetectedJourney(null);
  }, [gradeSelected]);

  // Auto-seleccionar jornada basada en el fk_workday de la sede
  useEffect(() => {
    if (!sedeWorkday) return;

    // Si fk_workday es 3 (Ambas/Completa), el usuario debe elegir manualmente
    if (sedeWorkday === "3") return;

    setWorkdaySelected(sedeWorkday);
  }, [sedeWorkday]);

  // Sincronizar journey con workdaySelected
  useEffect(() => {
    setJourney(workdaySelected);
  }, [workdaySelected]);

  // Sincronizar asignatureCode con asignatureSelected
  useEffect(() => {
    setAsignatureCode(asignatureSelected);
  }, [asignatureSelected]);

  const reloadOnceRef = useRef(false);
  const errorNotifiedRef = useRef(false);

  useEffect(() => {
    if (reloadOnceRef.current) return;
    reloadOnceRef.current = true;

    try {
      const res = reloadRecords();
      if (res && typeof res.then === "function") {
        res
          .then(() => notify.success("Estructura de notas recargada"))
          .catch((err) => {
            console.error("reloadRecords error:", err);
            notify.error("No fue posible recargar la estructura de notas");
          });
      } else {
        notify.success("Estructura de notas recargada");
      }
    } catch (err) {
      console.error("reloadRecords threw:", err);
      notify.error("No fue posible recargar la estructura de notas");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reloadRecords]);

  useEffect(() => {
    if (errorRecords && !errorNotifiedRef.current) {
      notify.error("No fue posible cargar la estructura de notas");
      errorNotifiedRef.current = true;
    } else if (!errorRecords) {
      errorNotifiedRef.current = false;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [errorRecords]);

  useEffect(() => {
    setRecordValuesByStudent({});
  }, [asignatureCode, journey]);

  // Llamar a los servicios cuando se tengan los 4 campos requeridos (secuencial):
  // 1) cargar estudiantes del grado
  // 2) por cada estudiante llamar a getStudentNotes con fk_estudiante y consolidar
  useEffect(() => {
    const fetchData = async () => {
      if (
        !idDocente ||
        !asignatureSelected ||
        !gradeSelected ||
        !periodSelected
      ) {
        setNotesFromService([]);
        setStudentsFromService([]);
        setRecordValuesByStudent({});
        return;
      }

      setLoadingData(true);
      try {
        // 1) Cargar estudiantes
        const studentsResponse = await getStudentGrades({
          idGrade: Number(gradeSelected),
        });
        const studentsArray = Array.isArray(studentsResponse)
          ? studentsResponse
          : (studentsResponse?.data ?? []);

        setStudentsFromService(studentsArray);

        // 2) Para cada estudiante pedir sus notas con fk_estudiante
        const notePromises = (studentsArray || []).map((s) =>
          getStudentNotes({
            fk_estudiante: Number(s?.id_estudiante ?? s?.id_student ?? s?.id),
            fk_docente: Number(idDocente),
            fk_asignatura: Number(asignatureSelected),
            fk_period: Number(periodSelected),
            fk_grade: Number(gradeSelected),
          }),
        );

        const settled = await Promise.allSettled(notePromises);

        const notesMap = new Map();
        const valuesByStudent = {};

        settled.forEach((res, idx) => {
          const student = studentsArray[idx];
          const studentKey = getStudentKey(student);
          if (res.status !== "fulfilled") {
            console.warn(
              "getStudentNotes failed for student",
              studentKey,
              res.reason,
            );
            return;
          }

          const data = Array.isArray(res.value)
            ? res.value
            : (res.value?.data ?? []);

          data.forEach((n) => {
            const name = String(
              n?.nombre_nota ?? n?.name ?? n?.nombre ?? "",
            ).trim();
            const id = n?.id_nota ?? n?.id ?? null;
            const key = id != null ? String(id) : `name:${name}`;
            if (!name && !id) return;

            if (!notesMap.has(key)) {
              notesMap.set(key, {
                nombre_nota: name,
                id_nota: id ?? undefined,
                porcentaje: n?.porcentaje ?? n?.porcentual ?? undefined,
              });
            }

            // Preferir el campo 'valor_nota' si lo entrega el servicio
            const studentValue =
              n?.valor_nota ?? n?.value_note ?? n?.value ?? n?.nota ?? n?.valor;
            if (studentValue !== undefined) {
              valuesByStudent[studentKey] = valuesByStudent[studentKey] || {};
              valuesByStudent[studentKey][key] = String(studentValue);
            }
          });
        });

        const consolidatedNotes = Array.from(notesMap.values());
        setNotesFromService(consolidatedNotes);
        setRecordValuesByStudent(valuesByStudent);
        setCommentsById({});
      } catch (error) {
        console.error("Error al cargar datos secuencialmente:", error);
        setNotesFromService([]);
        setStudentsFromService([]);
        setRecordValuesByStudent({});
        notify.error("No fue posible cargar estudiantes o notas");
      } finally {
        setLoadingData(false);
      }
    };

    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    idDocente,
    asignatureSelected,
    gradeSelected,
    periodSelected,
    getStudentNotes,
    getStudentGrades,
  ]);

  const filteredStudents = useMemo(() => {
    return Array.isArray(studentsFromService) ? studentsFromService : [];
  }, [studentsFromService]);

  const recordsList = useMemo(() => {
    return Array.isArray(notesFromService) ? notesFromService : [];
  }, [notesFromService]);

  const getStudentKey = (student) => {
    const id =
      student?.id_estudiante ?? student?.id_student ?? student?.identification;
    return String(id ?? "").trim();
  };

  const getStudentName = (student) => {
    // Primero intentar con el campo "nombre" del servicio
    if (student?.nombre) {
      return String(student.nombre).trim();
    }
    // Fallback al formato anterior
    const firstName = String(student?.first_name ?? "").trim();
    const secondName = String(student?.second_name ?? "").trim();
    const firstLastname = String(student?.first_lastname ?? "").trim();
    const secondLastname = String(student?.second_lastname ?? "").trim();
    return [firstLastname, secondLastname, firstName, secondName]
      .filter(Boolean)
      .join(" ");
  };

  const round2 = (n) => Math.round((Number(n) + Number.EPSILON) * 100) / 100;

  const computeFinalRecord = (studentValues) => {
    const list = Array.isArray(recordsList) ? recordsList : [];
    const values = studentValues ?? {};
    const totalPorcentual = list.reduce((acc, r) => {
      const p = Number(r?.porcentaje ?? r?.porcentual);
      return acc + (Number.isFinite(p) ? p : 0);
    }, 0);

    const weightedSum = list.reduce((acc, r) => {
      const name = String(r?.nombre_nota ?? r?.name ?? "").trim();
      const id = r?.id_nota ?? r?.id ?? name;
      if (!name && !id) return acc;

      const p = Number(r?.porcentaje ?? r?.porcentual);
      const porcentual = Number.isFinite(p) ? p : 0;
      const rawValue = values?.[id] ?? values?.[name];
      const n = Number(rawValue);
      const nota = Number.isFinite(n) ? n : 0;
      return acc + nota * (porcentual / 100);
    }, 0);

    return {
      final: round2(weightedSum),
      porcentualTotal: round2(totalPorcentual),
      isComplete:
        list.length > 0 &&
        list.every((r) => {
          const name = String(r?.nombre_nota ?? r?.name ?? "").trim();
          const id = r?.id_nota ?? r?.id ?? name;
          if (!id) return false;
          const v = values?.[id] ?? values?.[name];
          return String(v ?? "").trim() !== "";
        }),
    };
  };

  const sanitizeGradeInput = (raw) => {
    const text = String(raw ?? "").trim();
    if (text === "") return "";

    const normalizedText = text.replace(",", ".");
    const n = Number(normalizedText);
    if (!Number.isFinite(n)) return "";

    const clamped = Math.min(5, Math.max(1, n));
    const rounded = Math.round((clamped + Number.EPSILON) * 100) / 100;
    return String(rounded);
  };

  const handleRecordValueChange = (studentKey, recordKey, value) => {
    setRecordValuesByStudent((prev) => {
      const prevStudent = prev?.[studentKey] ?? {};
      return {
        ...prev,
        [studentKey]: {
          ...prevStudent,
          [recordKey]: value,
        },
      };
    });
  };

  const handleCommentChange = (studentKey, value) => {
    setCommentsById((prev) => ({
      ...prev,
      [studentKey]: value,
    }));
  };

  const handleSubmitAll = async (e) => {
    e.preventDefault();

    // Construir el array note_student según el formato requerido
    const noteStudentArray = [];
    filteredStudents.forEach((student) => {
      const studentKey = getStudentKey(student);
      const values = recordValuesByStudent?.[studentKey] ?? {};
      const comment = commentsById?.[studentKey] ?? "";
      const studentId = student?.id_estudiante;

      // Agregar una entrada por cada nota del estudiante
      recordsList.forEach((record) => {
        const recordName = String(
          record?.nombre_nota ?? record?.name ?? "",
        ).trim();
        const recordKey = record?.id_nota
          ? String(record?.id_nota)
          : `name:${recordName}`;
        // Leer el valor según la clave consolidada (id o name)
        const noteValue = values?.[recordKey] ?? values?.[recordName];

        // Solo agregar si hay un valor ingresado
        if (noteValue && String(noteValue).trim() !== "") {
          noteStudentArray.push({
            fk_student: Number(studentId),
            fk_note: Number(record?.id_nota),
            value_note: Number(noteValue),
            goal_student: comment || "",
          });
        }
      });
    });

    const payload = {
      note_student: noteStudentArray,
    };

    console.log("Registro de notas (payload):", payload);

    try {
      setLoadingData(true);
      await saveAssignmentNotes(payload);
      console.log("Notas guardadas exitosamente");
      notify.success("Notas guardadas exitosamente");

      // Opcional: Limpiar los valores después de guardar
      // setRecordValuesByStudent({});
      // setCommentsById({});
    } catch (error) {
      console.error("Error al guardar notas:", error);
      notify.error("Error al guardar notas");
    } finally {
      setLoadingData(false);
    }
  };

  const completedCount = useMemo(() => {
    return filteredStudents.reduce((acc, student) => {
      const studentKey = getStudentKey(student);
      const values = recordValuesByStudent?.[studentKey] ?? {};
      const finalInfo = computeFinalRecord(values);
      return acc + (finalInfo.isComplete ? 1 : 0);
    }, 0);
  }, [filteredStudents, recordValuesByStudent, recordsList]);

  return (
    <div className="border p-6 rounded bg-bg h-full gap-4 flex flex-col">
      <h2 className="font-bold text-2xl">Registrar Notas Estudiantes</h2>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <SedeSelect
          value={sedeSelected}
          onChange={(e) => setSedeSelected(e.target.value)}
          className="w-full p-2 border rounded bg-surface"
          labelClassName="text-lg font-semibold"
          data={teacherSedeData}
          loading={loadingTeacherSedes}
        />
        <GradeSelector
          name="grade"
          label="Grado"
          labelClassName="text-lg font-semibold"
          value={gradeSelected}
          onChange={(e) => setGradeSelected(e.target.value)}
          className="w-full p-2 border rounded bg-surface"
          sedeId={sedeSelected}
          workdayId={workdaySelected}
          customFetchMethod={getTeacherGrades}
          additionalParams={teacherGradesParams}
          disabled={!sedeSelected}
        />
        <AsignatureSelector
          name="asignature"
          label="Asignatura"
          labelClassName="text-lg font-semibold"
          value={asignatureSelected}
          onChange={(e) => setAsignatureSelected(e.target.value)}
          className="w-full p-2 border rounded bg-surface"
          sedeId={sedeSelected}
          workdayId={workdaySelected}
          customFetchMethod={getTeacherSubjects}
          additionalParams={teacherSubjectsParams}
          onJourneyDetected={(journey) => {
            console.log(
              "RegisterStudentRecords - Jornada detectada de asignatura:",
              journey,
            );
            if (journey && journey.id) {
              setWorkdaySelected(String(journey.id));
              setDetectedJourney(journey);
            }
          }}
          disabled={!gradeSelected}
        />
        <JourneySelect
          name="workday"
          label="Jornada"
          labelClassName="text-lg font-semibold"
          value={workdaySelected}
          onChange={(e) => setWorkdaySelected(e.target.value)}
          className="w-full p-2 border rounded bg-surface"
          filterValue={sedeWorkday}
          includeAmbas={false}
          subjectJourney={detectedJourney}
          // Solo cargar jornadas si hay grado seleccionado y no hay asignatura
          useTeacherSubjects={
            !Boolean(asignatureSelected) && Boolean(gradeSelected)
          }
          sedeId={sedeSelected}
          idTeacher={idDocente}
          lockByAsignature={true}
        />

        <PeriodSelector
          name="period"
          label="Período"
          labelClassName="text-lg font-semibold"
          value={periodSelected}
          onChange={(e) => setPeriodSelected(e.target.value)}
          className="w-full p-2 border rounded bg-surface"
          autoLoad={true}
        />
      </div>

      {!sedeSelected ? (
        <div className="text-sm opacity-80">
          Selecciona una sede para comenzar.
        </div>
      ) : !gradeSelected ? (
        <div className="text-sm opacity-80">
          Selecciona un grado para continuar.
        </div>
      ) : !asignatureSelected ? (
        <div className="text-sm opacity-80">
          Selecciona una asignatura para continuar.
        </div>
      ) : !workdaySelected ? (
        <div className="text-sm opacity-80">
          Selecciona una jornada para continuar.
        </div>
      ) : !periodSelected ? (
        <div className="text-sm opacity-80">
          Selecciona un período para continuar.
        </div>
      ) : !asignatureCode ? (
        <div className="text-sm opacity-80">
          Selecciona una asignatura para registrar notas.
        </div>
      ) : null}

      {loadingRecords || loadingData ? (
        <div className="text-sm opacity-80">
          Cargando estructura de notas y estudiantes...
        </div>
      ) : recordsList.length === 0 ? (
        <div className="text-sm opacity-80">No hay notas configuradas.</div>
      ) : null}

      <div className="flex flex-col gap-4">
        {!canShowStudents ? (
          <div className="text-sm opacity-80">
            Completa los filtros para ver los estudiantes.
          </div>
        ) : filteredStudents.length === 0 ? (
          <div className="text-sm opacity-80">
            No hay estudiantes para los filtros seleccionados.
          </div>
        ) : (
          <form
            onSubmit={handleSubmitAll}
            className="bg-surface border rounded"
          >
            <div className="p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <div className="text-sm opacity-80">
                Estudiantes:{" "}
                <span className="font-medium">{filteredStudents.length}</span>
                {recordsList.length > 0 ? (
                  <>
                    {" "}
                    · Completos:{" "}
                    <span className="font-medium">{completedCount}</span>
                  </>
                ) : null}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[920px]">
                <thead className="bg-primary text-surface font-semibold">
                  <tr>
                    <th className="p-3 text-left">Estudiante</th>
                    {recordsList.map((r) => {
                      const recordName = String(
                        r?.nombre_nota ?? r?.name ?? "",
                      ).trim();
                      if (!recordName && !r?.id_nota) return null;
                      const porcentual = Number(r?.porcentaje ?? r?.porcentual);
                      return (
                        <th
                          key={r?.id_nota ?? recordName}
                          className="p-3 text-center"
                        >
                          <div>{recordName || r?.id_nota}</div>
                          {Number.isFinite(porcentual) ? (
                            <div className="text-xs opacity-90">
                              {porcentual}%
                            </div>
                          ) : null}
                        </th>
                      );
                    })}
                    <th className="p-3 text-center">Final</th>
                    <th className="p-3 text-center">Comentarios del docente</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.map((student) => {
                    const studentKey = getStudentKey(student);
                    const fullName = getStudentName(student);
                    const studentValues =
                      recordValuesByStudent?.[studentKey] ?? {};
                    const finalInfo = computeFinalRecord(studentValues);
                    const comment = commentsById?.[studentKey] ?? "";

                    return (
                      <tr
                        key={studentKey}
                        className="border-t bg-surface hover:bg-gray-50"
                      >
                        <td className="p-3 align-top">
                          <div className="font-medium">
                            {fullName || "Estudiante"}
                          </div>
                          <div className="text-xs opacity-80">
                            ID: {student?.id_estudiante || "-"} · Grado:{" "}
                            {student?.grado || student?.grade_scholar || "-"}
                          </div>
                        </td>

                        {recordsList.map((r) => {
                          const recordName = String(
                            r?.nombre_nota ?? r?.name ?? "",
                          ).trim();
                          if (!recordName && !r?.id_nota) return null;
                          const recordKey = r?.id_nota
                            ? String(r?.id_nota)
                            : `name:${recordName}`;
                          const value =
                            studentValues?.[recordKey] ??
                            studentValues?.[recordName] ??
                            "";

                          return (
                            <td
                              key={r?.id_nota ?? recordName}
                              className="p-2 align-top"
                            >
                              <input
                                type="number"
                                min={1}
                                max={5}
                                step={0.01}
                                value={value}
                                onChange={(e) =>
                                  handleRecordValueChange(
                                    studentKey,
                                    recordKey,
                                    sanitizeGradeInput(e.target.value),
                                  )
                                }
                                className="w-full p-2 border rounded bg-surface text-center"
                                placeholder="1.00"
                                disabled={loadingData}
                              />
                            </td>
                          );
                        })}

                        <td className="p-3 align-top text-center">
                          <div className="font-medium">{finalInfo.final}</div>
                          <div className="text-xs opacity-80">
                            {finalInfo.isComplete ? "Completo" : "En progreso"}
                            {finalInfo.porcentualTotal !== 100 ? (
                              <span className="opacity-80">
                                {" "}
                                · Total %: {finalInfo.porcentualTotal}
                              </span>
                            ) : null}
                          </div>
                        </td>

                        <td className="p-2 align-top">
                          <textarea
                            value={comment}
                            onChange={(e) =>
                              handleCommentChange(studentKey, e.target.value)
                            }
                            className="w-full min-w-[200px] p-2 border rounded bg-surface resize-y"
                            placeholder="Escribe un comentario..."
                            rows={2}
                            disabled={loadingData}
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="p-4 border-t flex justify-end">
              <div className="w-full md:w-56">
                <SimpleButton
                  type="submit"
                  msj="Guardar notas"
                  text="text-surface"
                  bg="bg-accent"
                  icon="Save"
                  disabled={
                    !sedeSelected ||
                    !gradeSelected ||
                    !asignatureSelected ||
                    !workdaySelected ||
                    !periodSelected ||
                    !asignatureCode ||
                    loadingRecords ||
                    loadingData ||
                    recordsList.length === 0 ||
                    filteredStudents.length === 0
                  }
                />
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default RegisterStudentRecords;
