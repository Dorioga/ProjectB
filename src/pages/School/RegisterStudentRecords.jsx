import React, { useEffect, useMemo, useState } from "react";

import JourneySelect from "../../components/atoms/JourneySelect";
import SimpleButton from "../../components/atoms/SimpleButton";
import useSchool from "../../lib/hooks/useSchool";
import { asignatureResponse } from "../../services/DataExamples/asignatureResponse";
import { studentsResponse } from "../../services/DataExamples/studentsResponse";

const normalize = (value) =>
  String(value ?? "")
    .trim()
    .toLowerCase();

const uniqueSorted = (values) => {
  const normalized = values.map((v) => String(v ?? "").trim()).filter(Boolean);
  return Array.from(new Set(normalized)).sort((a, b) =>
    a.localeCompare(b, "es", { sensitivity: "base", numeric: true })
  );
};

const RegisterStudentRecords = () => {
  const { records, loadingRecords, errorRecords, reloadRecords } = useSchool();
  const [journey, setJourney] = useState("");
  const [asignatureCode, setAsignatureCode] = useState("");
  const [grade, setGrade] = useState("");
  const [group, setGroup] = useState("");
  const [recordValuesByStudent, setRecordValuesByStudent] = useState({});

  const canShowStudents = Boolean(journey && asignatureCode && grade && group);

  useEffect(() => {
    reloadRecords();
  }, [reloadRecords]);

  const asignatureOptions = useMemo(() => {
    const source = Array.isArray(asignatureResponse) ? asignatureResponse : [];
    return source
      .filter(Boolean)
      .map((a) => ({
        value: String(a.codigo ?? "").trim(),
        label: String(a.nombre ?? a.codigo ?? "").trim(),
      }))
      .filter((opt) => opt.value);
  }, []);

  const gradeOptions = useMemo(() => {
    const base = Array.isArray(studentsResponse) ? studentsResponse : [];
    const filtered = journey
      ? base.filter((s) => normalize(s?.journey) === normalize(journey))
      : base;
    return uniqueSorted(filtered.map((s) => s?.grade_scholar));
  }, [journey]);

  const groupOptions = useMemo(() => {
    const base = Array.isArray(studentsResponse) ? studentsResponse : [];
    const filtered = base.filter((s) => {
      if (journey && normalize(s?.journey) !== normalize(journey)) return false;
      if (grade && String(s?.grade_scholar ?? "").trim() !== String(grade)) {
        return false;
      }
      return true;
    });
    return uniqueSorted(filtered.map((s) => s?.group_grade));
  }, [grade, journey]);

  useEffect(() => {
    setGrade("");
    setGroup("");
  }, [journey]);

  useEffect(() => {
    setGroup("");
  }, [grade]);

  useEffect(() => {
    setRecordValuesByStudent({});
  }, [asignatureCode, grade, group, journey]);

  const filteredStudents = useMemo(() => {
    const base = Array.isArray(studentsResponse) ? studentsResponse : [];
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
  }, [grade, group, journey]);

  const recordsList = useMemo(() => {
    return Array.isArray(records) ? records : [];
  }, [records]);

  const getStudentKey = (student) => {
    const id = student?.id_student ?? student?.identification;
    return String(id ?? "").trim();
  };

  const getStudentName = (student) => {
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
      const p = Number(r?.porcentual);
      return acc + (Number.isFinite(p) ? p : 0);
    }, 0);

    const weightedSum = list.reduce((acc, r) => {
      const name = String(r?.name ?? "").trim();
      if (!name) return acc;

      const p = Number(r?.porcentual);
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
          const name = String(r?.name ?? "").trim();
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

  const handleSubmitAll = (e) => {
    e.preventDefault();

    const payload = filteredStudents.map((student) => {
      const studentKey = getStudentKey(student);
      const values = recordValuesByStudent?.[studentKey] ?? {};
      return {
        student: {
          id_student: student?.id_student,
          identification: student?.identification,
          fullName: getStudentName(student),
          journey: student?.journey,
          grade_scholar: student?.grade_scholar,
          group_grade: student?.group_grade,
        },
        asignatureCode,
        records: recordsList.map((r) => ({
          name: r?.name,
          porcentual: r?.porcentual,
          goal: r?.goal,
          value: values?.[r?.name] ?? "",
        })),
      };
    });

    console.log("Registro de notas (grupo):", payload);
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
        <JourneySelect
          value={journey}
          onChange={(e) => setJourney(e.target.value)}
          placeholder="Selecciona una jornada"
          includeAmbas={false}
        />

        <div>
          <label>Asignatura</label>
          <select
            value={asignatureCode}
            onChange={(e) => setAsignatureCode(e.target.value)}
            className="w-full p-2 border rounded bg-white"
          >
            <option value="">Selecciona una asignatura</option>
            {asignatureOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label>Curso</label>
          <select
            value={grade}
            onChange={(e) => setGrade(e.target.value)}
            className="w-full p-2 border rounded bg-white"
            disabled={!journey}
          >
            <option value="">
              {journey ? "Selecciona un curso" : "Selecciona jornada primero"}
            </option>
            {gradeOptions.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label>Grupo</label>
          <select
            value={group}
            onChange={(e) => setGroup(e.target.value)}
            className="w-full p-2 border rounded bg-white"
            disabled={!journey || !grade}
          >
            <option value="">
              {journey && grade
                ? "Selecciona un grupo"
                : "Selecciona jornada y curso"}
            </option>
            {groupOptions.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
        </div>
      </div>

      {!asignatureCode ? (
        <div className="text-sm opacity-80">
          Selecciona una asignatura para registrar notas.
        </div>
      ) : null}

      {loadingRecords ? (
        <div className="text-sm opacity-80">
          Cargando estructura de notas...
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
            Completa los filtros (jornada, asignatura, curso y grupo) para ver
            los estudiantes.
          </div>
        ) : filteredStudents.length === 0 ? (
          <div className="text-sm opacity-80">
            No hay estudiantes para los filtros seleccionados.
          </div>
        ) : (
          <form onSubmit={handleSubmitAll} className="bg-white border rounded">
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

            {recordsList.some((r) => String(r?.goal ?? "").trim()) ? (
              <div className="px-4 pb-4 text-center">
                <div className="font-semibold">Logros</div>
                <div className="mt-2 grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
                  {recordsList
                    .filter((r) => String(r?.goal ?? "").trim())
                    .map((r) => {
                      const recordName = String(r?.name ?? "").trim();
                      const goal = String(r?.goal ?? "").trim();
                      return (
                        <div
                          key={recordName || goal}
                          className="opacity-90 text-center"
                        >
                          <span className="font-medium">
                            {recordName || "Nota"}:
                          </span>{" "}
                          <span>{goal}</span>
                        </div>
                      );
                    })}
                </div>
              </div>
            ) : null}

            <div className="overflow-x-auto">
              <table className="w-full min-w-[920px]">
                <thead className="bg-primary text-white font-semibold">
                  <tr>
                    <th className="p-3 text-left">Estudiante</th>
                    {recordsList.map((r) => {
                      const recordName = String(r?.name ?? "").trim();
                      if (!recordName) return null;
                      const porcentual = Number(r?.porcentual);
                      return (
                        <th key={recordName} className="p-3 text-center">
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
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.map((student) => {
                    const studentKey = getStudentKey(student);
                    const fullName = getStudentName(student);
                    const studentValues =
                      recordValuesByStudent?.[studentKey] ?? {};
                    const finalInfo = computeFinalRecord(studentValues);

                    return (
                      <tr
                        key={studentKey}
                        className="border-t bg-white hover:bg-gray-50"
                      >
                        <td className="p-3 align-top">
                          <div className="font-medium">
                            {fullName || "Estudiante"}
                          </div>
                          <div className="text-xs opacity-80">
                            Doc: {student?.identification || "-"} · Curso:{" "}
                            {student?.grade_scholar || "-"} · Grupo:{" "}
                            {student?.group_grade || "-"}
                          </div>
                        </td>

                        {recordsList.map((r) => {
                          const recordName = String(r?.name ?? "").trim();
                          if (!recordName) return null;
                          const value = studentValues?.[recordName] ?? "";

                          return (
                            <td key={recordName} className="p-2 align-top">
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
                                    sanitizeGradeInput(e.target.value)
                                  )
                                }
                                className="w-full p-2 border rounded bg-white text-center"
                                placeholder="1.00"
                                disabled={!asignatureCode || loadingRecords}
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
                  text="text-white"
                  bg="bg-accent"
                  icon="Save"
                  disabled={
                    !asignatureCode ||
                    loadingRecords ||
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
