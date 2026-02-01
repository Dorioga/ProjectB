import React, { useEffect, useMemo, useState } from "react";

import SimpleButton from "../../components/atoms/SimpleButton";
import SedeSelect from "../../components/atoms/SedeSelect";
import JourneySelect from "../../components/atoms/JourneySelect";
import PeriodSelector from "../../components/atoms/PeriodSelector";
import GradeSelector from "../../components/atoms/GradeSelector";
import AsignatureSelector from "../../components/molecules/AsignatureSelector";
import useSchool from "../../lib/hooks/useSchool";
import useData from "../../lib/hooks/useData";
import useAuth from "../../lib/hooks/useAuth";
import { asignatureResponse } from "../../services/DataExamples/asignatureResponse";
import { studentsResponse } from "../../services/DataExamples/studentsResponse";

const normalize = (value) =>
  String(value ?? "")
    .trim()
    .toLowerCase();

const RegisterStudentRecords = () => {
  const {
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
  const { idSede, nameSede, rol, idDocente } = useAuth();
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

  // Memoizar additionalParams para evitar re-renders
  const teacherGradesParams = useMemo(() => {
    return idDocente ? { idTeacher: Number(idDocente) } : {};
  }, [idDocente]);

  const teacherSubjectsParams = useMemo(() => {
    return gradeSelected && idDocente
      ? { idGrade: Number(gradeSelected), idTeacher: Number(idDocente) }
      : {};
  }, [gradeSelected, idDocente]);

  // Obtener el fk_workday de la sede seleccionada
  const sedeWorkday = useMemo(() => {
    if (!sedeSelected || !Array.isArray(institutionSedes)) return null;
    const sede = institutionSedes.find(
      (s) => String(s?.id) === String(sedeSelected),
    );
    return sede?.fk_workday ? String(sede.fk_workday) : null;
  }, [sedeSelected, institutionSedes]);

  // Datos de la sede del docente desde AuthContext
  const teacherSedeData = useMemo(() => {
    if ((rol === "7" || rol === 7) && idSede && nameSede) {
      return [{ id: idSede, name: nameSede }];
    }
    return null;
  }, [rol, idSede, nameSede]);

  const canShowStudents = Boolean(
    sedeSelected &&
    gradeSelected &&
    asignatureSelected &&
    workdaySelected &&
    periodSelected &&
    journey &&
    asignatureCode,
  );

  // Si el rol es 7, cargar idsede y establecerlo como seleccionado
  useEffect(() => {
    if ((rol === "7" || rol === 7) && idSede) {
      setSedeSelected(idSede);
    }
  }, [rol, idSede]);

  // Limpiar jornada cuando cambia la sede
  useEffect(() => {
    setWorkdaySelected("");
  }, [sedeSelected]);

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

  useEffect(() => {
    reloadRecords();
  }, [reloadRecords]);

  useEffect(() => {
    setRecordValuesByStudent({});
  }, [asignatureCode, journey]);

  // Llamar a los servicios cuando se tengan los 4 campos requeridos
  useEffect(() => {
    const fetchData = async () => {
      // Validar que todos los campos requeridos estén presentes
      if (
        !idDocente ||
        !asignatureSelected ||
        !gradeSelected ||
        !periodSelected
      ) {
        setNotesFromService([]);
        setStudentsFromService([]);
        return;
      }

      setLoadingData(true);
      try {
        // Llamar a ambos servicios en paralelo
        const [notesResponse, studentsResponse] = await Promise.all([
          getStudentNotes({
            fk_docente: Number(idDocente),
            fk_asignatura: Number(asignatureSelected),
            fk_grade: Number(gradeSelected),
            fk_period: Number(periodSelected),
          }),
          getStudentGrades({
            idGrade: Number(gradeSelected),
          }),
        ]);

        console.log("Notas recibidas:", notesResponse);
        console.log("Estudiantes recibidos:", studentsResponse);

        // Guardar las notas
        const notesArray = Array.isArray(notesResponse)
          ? notesResponse
          : (notesResponse?.data ?? []);
        setNotesFromService(notesArray);

        // Guardar los estudiantes
        const studentsArray = Array.isArray(studentsResponse)
          ? studentsResponse
          : (studentsResponse?.data ?? []);
        setStudentsFromService(studentsArray);

        // Limpiar valores y comentarios cuando cambian los parámetros
        setRecordValuesByStudent({});
        setCommentsById({});
      } catch (error) {
        console.error("Error al cargar datos:", error);
        setNotesFromService([]);
        setStudentsFromService([]);
      } finally {
        setLoadingData(false);
      }
    };

    fetchData();
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
      if (!name) return acc;

      const p = Number(r?.porcentaje ?? r?.porcentual);
      const porcentual = Number.isFinite(p) ? p : 0;
      const rawValue = values?.[name];
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
          if (!name) return false;
          const v = values?.[name];
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

  const handleRecordValueChange = (studentKey, recordName, value) => {
    setRecordValuesByStudent((prev) => {
      const prevStudent = prev?.[studentKey] ?? {};
      return {
        ...prev,
        [studentKey]: {
          ...prevStudent,
          [recordName]: value,
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
        const noteValue = values?.[recordName];

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

      // Opcional: Limpiar los valores después de guardar
      // setRecordValuesByStudent({});
      // setCommentsById({});
    } catch (error) {
      console.error("Error al guardar notas:", error);
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
          disabled={rol === "7" || rol === 7}
          data={teacherSedeData}
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
          onJourneyDetected={(journeyId) => {
            setWorkdaySelected(String(journeyId));
          }}
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
      ) : errorRecords ? (
        <div className="text-sm text-red-600">
          No se pudieron cargar las notas.
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
                      if (!recordName) return null;
                      const porcentual = Number(r?.porcentaje ?? r?.porcentual);
                      return (
                        <th
                          key={r?.id_nota ?? recordName}
                          className="p-3 text-center"
                        >
                          <div>{recordName}</div>
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
                          if (!recordName) return null;
                          const value = studentValues?.[recordName] ?? "";

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
                                    recordName,
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
