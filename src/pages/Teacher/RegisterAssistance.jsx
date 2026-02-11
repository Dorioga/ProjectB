import React, { useEffect, useMemo, useState } from "react";

import SedeSelect from "../../components/atoms/SedeSelect";
import JourneySelect from "../../components/atoms/JourneySelect";
import SimpleButton from "../../components/atoms/SimpleButton";
import GradeSelector from "../../components/atoms/GradeSelector";
import AsignatureSelector from "../../components/molecules/AsignatureSelector";
import useSchool from "../../lib/hooks/useSchool";
import useTeacher from "../../lib/hooks/useTeacher";
import useData from "../../lib/hooks/useData";
import useAuth from "../../lib/hooks/useAuth";
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

  const [studentsFromService, setStudentsFromService] = useState([]);
  const [loadingData, setLoadingData] = useState(false);

  const notify = useNotify();

  // Hooks y servicios
  const { getStudentGrades } = useSchool();
  const { getTeacherGrades, getTeacherSubjects, getTeacherSede } = useTeacher();
  const { institutionSedes } = useData();
  const { idSede: authIdSede, nameSede, rol, idDocente, token } = useAuth();

  const canShowStudents = Boolean(
    sedeSelected && journey && asignatureCode && grade,
  );

  // Limpiar cascada cuando cambia la sede
  useEffect(() => {
    setGrade("");
    setDetectedJourney(null);
  }, [sedeSelected]);

  // Cuando cambia la jornada, solo evitar limpiar grado para prevenir parpadeos
  // useEffect(() => {
  //   setGroup("");
  // }, [journey]);

  // Seleccionar sede desde auth si rol=7
  useEffect(() => {
    if (String(rol) === "7" && authIdSede) {
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

  // Opciones / params para asignaturas basadas en el grado y docente
  const teacherSubjectsParams = useMemo(() => {
    return grade && idDocente
      ? { idGrade: Number(grade), idTeacher: Number(idDocente) }
      : {};
  }, [grade, idDocente]);

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

  // Auto-seleccionar jornada basada en el fk_workday de la sede
  useEffect(() => {
    if (!sedeWorkday) return;

    // Si fk_workday es 3 (Ambas/Completa), el usuario debe elegir manualmente
    if (sedeWorkday === "3") return;

    setJourney(sedeWorkday);
  }, [sedeWorkday]);

  // Datos de la sede del docente: preferir resultado de getTeacherSede si existe
  const teacherSedeData = useMemo(() => {
    if (teacherSedes.length) return teacherSedes;
    if (String(rol) === "7" && authIdSede && nameSede) {
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

  // Cargar estudiantes del servicio cuando haya grado seleccionado (DESACTIVADO - sin servicio)
  // useEffect(() => {
  //   const fetchStudents = async () => {
  //     if (!grade) {
  //       setStudentsFromService([]);
  //       return;
  //     }
  //     setLoadingData(true);
  //     try {
  //       const res = await getStudentGrades({ idGrade: Number(grade) });
  //       const list = Array.isArray(res) ? res : (res?.data ?? []);
  //       setStudentsFromService(list);
  //     } catch (err) {
  //       console.error("RegisterAssistance - Error cargando estudiantes:", err);
  //       notify.error(
  //         "No fue posible cargar estudiantes para el curso seleccionado",
  //       );
  //       setStudentsFromService([]);
  //     } finally {
  //       setLoadingData(false);
  //     }
  //   };

  //   fetchStudents();
  // }, [grade, getStudentGrades, notify]);

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
          label="Curso"
          labelClassName="text-lg font-semibold"
          value={grade}
          onChange={(e) => setGrade(e.target.value)}
          className="w-full p-2 border rounded bg-surface"
          sedeId={sedeSelected}
          workdayId={journey}
          customFetchMethod={getTeacherGrades}
          additionalParams={teacherGradesParams}
          disabled={!sedeSelected}
        />

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

      {canShowStudents && (
        <div className="mt-4 p-4 bg-surface border rounded">
          <p className="text-sm opacity-80">
            Sede: <span className="font-medium">{sedeSelected}</span> · Curso:{" "}
            <span className="font-medium">{grade}</span> · Asignatura:{" "}
            <span className="font-medium">{asignatureCode}</span> · Jornada:{" "}
            <span className="font-medium">{journey}</span>
          </p>
        </div>
      )}

      {/* <div className="flex flex-col gap-4">
        {!canShowStudents ? (
          <div className="text-sm opacity-80">
            Completa los 4 filtros (sede, curso, asignatura y jornada).
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
                <span className="font-medium">{filteredStudents.length}</span> ·
                Marcados: <span className="font-medium">{selectedCount}</span>
              </div>
              <div className="w-full md:w-56">
                <SimpleButton
                  type="submit"
                  msj="Guardar asistencia"
                  text="text-surface"
                  bg="bg-accent"
                  icon="Save"
                  disabled={selectedCount === 0}
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <div className="min-w-[720px]">
                <div className="grid grid-cols-10 bg-primary text-surface font-semibold">
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
                            "PRESENTE",
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
                            "AUSENTE",
                          )}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </form>
        )} */}
    </div>
  );
};

export default RegisterAssistance;
