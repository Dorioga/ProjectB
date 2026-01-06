import React, { useEffect, useMemo, useState } from "react";

import JourneySelect from "../../components/atoms/JourneySelect";
import SimpleButton from "../../components/atoms/SimpleButton";
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

const RegisterAssistance = () => {
  const [journey, setJourney] = useState("");
  const [asignatureCode, setAsignatureCode] = useState("");
  const [grade, setGrade] = useState("");
  const [group, setGroup] = useState("");
  const [attendanceByStudent, setAttendanceByStudent] = useState({});

  const canShowStudents = Boolean(journey && asignatureCode && grade && group);

  useEffect(() => {
    setGrade("");
    setGroup("");
  }, [journey]);

  useEffect(() => {
    setGroup("");
  }, [grade]);

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

  const handleAttendanceChange = (studentKey, value) => {
    setAttendanceByStudent((prev) => ({
      ...(prev ?? {}),
      [studentKey]: value,
    }));
  };

  const handleToggleAttendance = (studentKey, option) => (e) => {
    const checked = Boolean(e.target.checked);
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

  const handleSubmitAll = (e) => {
    e.preventDefault();

    const payload = filteredStudents.map((student) => {
      const studentKey = getStudentKey(student);
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
        attendance: attendanceByStudent?.[studentKey] ?? "",
      };
    });

    console.log("Registro de asistencia (grupo):", payload);
  };

  const selectedCount = useMemo(() => {
    const values = Object.values(attendanceByStudent ?? {});
    return values.filter((v) => String(v ?? "").trim() !== "").length;
  }, [attendanceByStudent]);

  return (
    <div className="border p-6 rounded bg-bg h-full gap-4 flex flex-col">
      <h2 className="font-bold text-2xl">Registrar Asistencia</h2>

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
                <span className="font-medium">{filteredStudents.length}</span> ·
                Marcados: <span className="font-medium">{selectedCount}</span>
              </div>
              <div className="w-full md:w-56">
                <SimpleButton
                  type="submit"
                  msj="Guardar asistencia"
                  text="text-white"
                  bg="bg-accent"
                  icon="Save"
                  disabled={selectedCount === 0}
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <div className="min-w-[720px]">
                <div className="grid grid-cols-10 bg-primary text-white font-semibold">
                  <div className="col-span-6 p-3">Estudiante</div>
                  <div className="col-span-2 p-3 text-center">Presente</div>
                  <div className="col-span-2 p-3 text-center">Ausente</div>
                </div>

                {filteredStudents.map((student) => {
                  const studentKey = getStudentKey(student);
                  const fullName = getStudentName(student);
                  const attendance = attendanceByStudent?.[studentKey] ?? "";

                  return (
                    <div
                      key={studentKey}
                      className="grid grid-cols-10 border-t hover:bg-gray-50"
                    >
                      <div className="col-span-6 p-3">
                        <div className="font-medium">
                          {fullName || "Estudiante"}
                        </div>
                        <div className="text-xs opacity-80">
                          Doc: {student?.identification || "-"} · Curso:{" "}
                          {student?.grade_scholar || "-"} · Grupo:{" "}
                          {student?.group_grade || "-"}
                        </div>
                      </div>

                      <div className="col-span-2 p-3 flex justify-center items-center">
                        <input
                          type="checkbox"
                          className="w-6 h-6 cursor-pointer"
                          checked={attendance === "PRESENTE"}
                          onChange={handleToggleAttendance(
                            studentKey,
                            "PRESENTE"
                          )}
                        />
                      </div>

                      <div className="col-span-2 p-3 flex justify-center items-center">
                        <input
                          type="checkbox"
                          className="w-6 h-6 cursor-pointer"
                          checked={attendance === "AUSENTE"}
                          onChange={handleToggleAttendance(
                            studentKey,
                            "AUSENTE"
                          )}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default RegisterAssistance;
