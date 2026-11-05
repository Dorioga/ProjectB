import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import DataTable from "../../components/atoms/DataTable";
import SimpleButton from "../../components/atoms/SimpleButton";
import Modal from "../../components/atoms/Modal";
import SedeSelect from "../../components/atoms/SedeSelect";
import GradeSelector from "../../components/atoms/GradeSelector";
import Loader from "../../components/atoms/Loader";
import useSchool from "../../lib/hooks/useSchool";
import useTeacher from "../../lib/hooks/useTeacher";
import useAuth from "../../lib/hooks/useAuth";
import { useNotify } from "../../lib/hooks/useNotify";
import {
  getBoletin,
  getStudent,
  getValidateStudentNote,
  updateStudentGrade,
} from "../../services/studentService";

const CURRENT_YEAR = new Date().getFullYear();
const FINAL_PERIOD_ID = 4;

const getStudentId = (student) =>
  student?.id_estudiante ?? student?.id_student ?? student?.id ?? "";

const getStudentName = (student) =>
  `${student?.nombre_estudiante ?? student?.nombre ?? ""} ${
    student?.apellido_estudiante ?? student?.apellido ?? ""
  }`.trim();

const toNumber = (value) => {
  const parsed = parseFloat(value);
  return Number.isNaN(parsed) ? null : parsed;
};

const getGradeStudentLinkId = (student) =>
  student?.id_grade_student ??
  student?.fk_grade_student ??
  student?.id_grado_estudiante ??
  student?.grade_student_id ??
  "";

const getGradeValue = (grade) =>
  grade?.id_grade ?? grade?.id ?? grade?.id_grado ?? "";

const getGradeLabel = (grade) => {
  const name =
    grade?.grado ??
    grade?.nombre ??
    grade?.nombre_grado ??
    grade?.name ??
    "";
  const group = grade?.grupo ? ` - ${grade.grupo}` : "";
  return `${name}${group}`.trim();
};

const getEffectiveNote = (nota, recuperacion) => {
  const recuperacionValue = toNumber(recuperacion);
  if (recuperacionValue != null) return recuperacionValue;
  return toNumber(nota);
};

const colorAprobacion = (estado) => {
  if (!estado) return "#111827";
  const lower = String(estado).toLowerCase();
  if (
    lower.includes("no aprobado") ||
    lower.includes("reprobado") ||
    lower.includes("no promovido") ||
    lower.includes("perdi")
  ) {
    return "#dc2626";
  }
  if (lower.includes("aprobado") || lower.includes("promovido")) {
    return "#15803d";
  }
  return "#111827";
};

const buildStudentHistory = (rows, student, year) => {
  const periodMap = new Map();
  let annualEstadoFinal = null;
  let annualDefinitiva = null;

  for (const row of rows ?? []) {
    if (!annualEstadoFinal && row?.estado_final) {
      annualEstadoFinal = row.estado_final;
    }
    if (annualDefinitiva == null && row?.definitiva != null) {
      annualDefinitiva = row.definitiva;
    }

    const periodId = row?.id_periodo;
    if (!periodId) continue;

    if (!periodMap.has(periodId)) {
      periodMap.set(periodId, {
        idPeriodo: periodId,
        nombrePeriodo: row?.nombre_periodo || "",
        totalAsignaturas: null,
        promedio: null,
        asignaturas: [],
        asignaturasMap: new Map(),
      });
    }

    const period = periodMap.get(periodId);
    if (!period.nombrePeriodo && row?.nombre_periodo) {
      period.nombrePeriodo = row.nombre_periodo;
    }

    const asigKey = row?.id_asignatura_grado ?? row?.id_asignatura;
    if (!asigKey) continue;

    let asignatura = period.asignaturasMap.get(asigKey);
    if (!asignatura) {
      asignatura = {
        idAsignaturaGrado: asigKey,
        nombreAsignatura: String(
          row?.nombre_asignatura_grado ?? row?.nombre_asignatura ?? asigKey,
        ),
        nombreArea: row?.nombre_area ?? "",
        tieneNota: row?.tiene_nota ?? "NO",
        nota: null,
        notaRecuperacion: null,
        escala: null,
        estadoPeriodo: null,
        definitiva: null,
        estadoFinal: null,
        logros: [],
      };
      period.asignaturasMap.set(asigKey, asignatura);
      period.asignaturas.push(asignatura);
    }

    if (row?.nota_periodo_porcentual != null) {
      const current = toNumber(asignatura.nota);
      const next = toNumber(row.nota_periodo_porcentual);
      if (next != null && (current == null || next > current)) {
        asignatura.nota = row.nota_periodo_porcentual;
      }
    }
    if (
      asignatura.notaRecuperacion == null &&
      row?.nota_recuperacion != null
    ) {
      asignatura.notaRecuperacion = row.nota_recuperacion;
    }
    if (!asignatura.escala && row?.escala_nota) {
      asignatura.escala = row.escala_nota;
    }
    if (!asignatura.estadoPeriodo && row?.estado_periodo) {
      asignatura.estadoPeriodo = row.estado_periodo;
    }
    if (asignatura.definitiva == null && row?.definitiva != null) {
      asignatura.definitiva = row.definitiva;
    }
    if (!asignatura.estadoFinal && row?.estado_final) {
      asignatura.estadoFinal = row.estado_final;
    }
    if (row?.logro) {
      const logro = row?.nombre_tipo
        ? `${row.nombre_tipo}: ${row.logro}`
        : row.logro;
      if (!asignatura.logros.includes(logro)) {
        asignatura.logros.push(logro);
      }
    }
  }

  let generalSum = 0;
  let generalCount = 0;
  const periods = {};
  const annualSubjectsMap = new Map();

  const sortedPeriods = Array.from(periodMap.values()).sort(
    (a, b) => Number(a.idPeriodo) - Number(b.idPeriodo),
  );

  for (const period of sortedPeriods) {
    let periodSum = 0;

    for (const asignatura of period.asignaturas) {
      if (asignatura.tieneNota !== "SI") continue;
      const effectiveNote = getEffectiveNote(
        asignatura.nota,
        asignatura.notaRecuperacion,
      );
      if (effectiveNote == null) continue;
      periodSum += effectiveNote;
      generalSum += effectiveNote;
      generalCount += 1;
    }

    // Resumen anual por asignatura (notas de los periodos 1 a 4).
    const periodNumber = Number(period.idPeriodo);
    for (const asignatura of period.asignaturas) {
      const key = asignatura.idAsignaturaGrado;
      if (!annualSubjectsMap.has(key)) {
        annualSubjectsMap.set(key, {
          idAsignaturaGrado: key,
          nombreAsignatura: asignatura.nombreAsignatura,
          nombreArea: asignatura.nombreArea,
          estadoFinal: null,
          suma: 0,
          count: 0,
        });
      }
      const entry = annualSubjectsMap.get(key);
      if (!entry.nombreArea && asignatura.nombreArea) {
        entry.nombreArea = asignatura.nombreArea;
      }
      if (!entry.estadoFinal && asignatura.estadoFinal) {
        entry.estadoFinal = asignatura.estadoFinal;
      }
      if (periodNumber >= 1 && periodNumber <= 4) {
        const effectiveNote = getEffectiveNote(
          asignatura.nota,
          asignatura.notaRecuperacion,
        );
        if (effectiveNote != null) {
          entry.suma += effectiveNote;
          entry.count += 1;
        }
      }
    }

    // Total de asignaturas: cantidad de id_asignatura_grado distintos.
    period.totalAsignaturas = period.asignaturas.length;
    period.promedio =
      period.totalAsignaturas > 0
        ? (periodSum / period.totalAsignaturas).toFixed(2)
        : null;
    if (!period.nombrePeriodo) {
      period.nombrePeriodo = `Periodo ${period.idPeriodo}`;
    }
    delete period.asignaturasMap;
    periods[period.idPeriodo] = period;
  }

  const annualSubjects = Array.from(annualSubjectsMap.values())
    .map((entry) => ({
      idAsignaturaGrado: entry.idAsignaturaGrado,
      nombreAsignatura: entry.nombreAsignatura,
      nombreArea: entry.nombreArea,
      definitiva:
        entry.count > 0 ? (entry.suma / entry.count).toFixed(2) : null,
      estadoFinal: entry.estadoFinal,
    }))
    .sort((a, b) =>
      a.nombreAsignatura.localeCompare(b.nombreAsignatura, "es", {
        sensitivity: "base",
      }),
    );

  return {
    studentId: String(getStudentId(student)),
    nombre: getStudentName(student) || "Estudiante",
    grado: student?.grado ?? "",
    year: String(year),
    periodIdConsultado: FINAL_PERIOD_ID,
    periods,
    annualSubjects,
    annual: {
      estadoFinal: annualEstadoFinal,
      definitiva: annualDefinitiva,
      promedioGeneral:
        generalCount > 0 ? (generalSum / generalCount).toFixed(2) : null,
    },
  };
};

const AnnualSummary = ({ subjects }) => (
  <div className="border border-primary/20 rounded-lg overflow-hidden">
    <div className="bg-primary text-surface px-3 py-2">
      <h3 className="font-bold">Resumen anual</h3>
    </div>
    <div className="overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead className="bg-primary/10">
          <tr>
            <th className="text-left px-3 py-2 font-semibold">Asignatura</th>
            <th className="text-left px-3 py-2 font-semibold">Área</th>
            <th className="text-center px-3 py-2 font-semibold">
              Definitiva
            </th>
            <th className="text-center px-3 py-2 font-semibold">
              Estado final
            </th>
          </tr>
        </thead>
        <tbody>
          {subjects.length === 0 ? (
            <tr>
              <td colSpan={4} className="px-3 py-2 text-center">
                Sin asignaturas para mostrar.
              </td>
            </tr>
          ) : (
            subjects.map((asignatura) => (
              <tr
                key={asignatura.idAsignaturaGrado}
                className="border-t border-primary/10"
              >
                <td className="px-3 py-2">{asignatura.nombreAsignatura}</td>
                <td className="px-3 py-2">{asignatura.nombreArea || "-"}</td>
                <td className="px-3 py-2 text-center font-semibold">
                  {asignatura.definitiva ?? "-"}
                </td>
                <td
                  className="px-3 py-2 text-center font-semibold"
                  style={{ color: colorAprobacion(asignatura.estadoFinal) }}
                >
                  {asignatura.estadoFinal ?? "-"}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  </div>
);

const PeriodHistory = ({ period }) => (
  <div className="border border-primary/20 rounded-lg overflow-hidden">
    <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between bg-primary text-surface px-3 py-2">
      <h3 className="font-bold">{period.nombrePeriodo}</h3>
      <span className="text-sm">
        Total asignaturas: {period.totalAsignaturas ?? "-"} | Promedio:{" "}
        {period.promedio ?? "-"}
      </span>
    </div>
    <div className="overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead className="bg-primary/10">
          <tr>
            <th className="text-left px-3 py-2 font-semibold">Asignatura</th>
            <th className="text-left px-3 py-2 font-semibold">Área</th>
            <th className="text-center px-3 py-2 font-semibold">Nota</th>
            <th className="text-center px-3 py-2 font-semibold">
              Recuperación
            </th>
            <th className="text-center px-3 py-2 font-semibold">Escala</th>
            <th className="text-center px-3 py-2 font-semibold">
              Estado período
            </th>
          </tr>
        </thead>
        <tbody>
          {period.asignaturas.map((asignatura) => (
            <tr
              key={asignatura.idAsignaturaGrado}
              className="border-t border-primary/10"
            >
              <td className="px-3 py-2">{asignatura.nombreAsignatura}</td>
              <td className="px-3 py-2">{asignatura.nombreArea || "-"}</td>
              <td className="px-3 py-2 text-center">
                {asignatura.nota ?? "-"}
              </td>
              <td className="px-3 py-2 text-center">
                {asignatura.notaRecuperacion ?? "-"}
              </td>
              <td
                className="px-3 py-2 text-center font-semibold"
                style={{
                  color: colorAprobacion(asignatura.estadoPeriodo),
                }}
              >
                {asignatura.escala ?? "-"}
              </td>
              <td
                className="px-3 py-2 text-center font-semibold"
                style={{
                  color: colorAprobacion(asignatura.estadoPeriodo),
                }}
              >
                {asignatura.estadoPeriodo ?? "-"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

const ManageYearScholar = () => {
  const { getStudentGrades, getGradeOnlySede } = useSchool();
  const { getTeacherSede, getTeacherGrades } = useTeacher();
  const { idSede, nameSede, idDocente, token, rol } = useAuth();
  const notify = useNotify();

  const [sedeId, setSedeId] = useState("");
  const [gradeId, setGradeId] = useState("");
  const [teacherSedes, setTeacherSedes] = useState([]);
  const [loadingTeacherSedes, setLoadingTeacherSedes] = useState(false);
  const [students, setStudents] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const [historyModalStudent, setHistoryModalStudent] = useState(null);
  const [loadingStudentId, setLoadingStudentId] = useState(null);
  const [promoteModalOpen, setPromoteModalOpen] = useState(false);
  const [confirmPromoteOpen, setConfirmPromoteOpen] = useState(false);
  const [targetGrades, setTargetGrades] = useState([]);
  const [loadingTargetGrades, setLoadingTargetGrades] = useState(false);
  const [targetGradeId, setTargetGradeId] = useState("");
  const [promoting, setPromoting] = useState(false);

  const notifyRef = useRef(notify);
  useEffect(() => {
    notifyRef.current = notify;
  });

  const isTeacher = Boolean(idDocente);
  const isRol3 = useMemo(() => String(rol) === "3", [rol]);

  const teacherGradesParams = useMemo(
    () => ({
      ...(idDocente && { idTeacher: Number(idDocente) }),
      ...(sedeId ? { idSede: Number(sedeId) } : { idSede: Number(idSede) }),
    }),
    [idDocente, sedeId, idSede],
  );

  const gradeSede3Params = useMemo(
    () => ({ idSede: Number(sedeId || idSede) }),
    [sedeId, idSede],
  );

  const teacherSedeData = useMemo(() => {
    if (teacherSedes.length) return teacherSedes;
    if (idSede && nameSede) return [{ id: idSede, name: nameSede }];
    return null;
  }, [idSede, nameSede, teacherSedes]);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      if (!idDocente || !getTeacherSede || !token) {
        if (mounted) setTeacherSedes([]);
        return;
      }
      if (mounted) setLoadingTeacherSedes(true);
      try {
        const res = await getTeacherSede({ idTeacher: Number(idDocente) });
        const list = Array.isArray(res) ? res : (res?.data ?? []);
        const mapped = list.filter(Boolean).map((s) => ({
          id: String(s?.id ?? s?.id_sede ?? "").trim(),
          name: String(s?.name ?? s?.nombre ?? s?.nombre_sede ?? "").trim(),
          fk_workday: s?.fk_workday ?? s?.fkWorkday ?? undefined,
          fk_institucion:
            s?.fk_institucion ??
            s?.fkInstitution ??
            s?.id_institucion ??
            undefined,
        }));
        if (mounted) setTeacherSedes(mapped);
      } catch (err) {
        console.error(
          "ManageYearScholar - Error cargando sedes de docente:",
          err,
        );
        if (mounted) setTeacherSedes([]);
      } finally {
        if (mounted) setLoadingTeacherSedes(false);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, [idDocente, getTeacherSede, token]);

  useEffect(() => {
    if (!promoteModalOpen) return undefined;
    let cancelled = false;
    setTargetGradeId("");
    const loadTargetGrades = async () => {
      setLoadingTargetGrades(true);
      try {
        const res = await getGradeOnlySede({ idSede: Number(sedeId) });
        const list = Array.isArray(res) ? res : (res?.data ?? []);
        const filtered = list
          .filter(Boolean)
          .filter(
            (grade) => String(getGradeValue(grade)) !== String(gradeId),
          );
        if (!cancelled) setTargetGrades(filtered);
      } catch (err) {
        console.error(
          "ManageYearScholar - Error cargando grados destino:",
          err,
        );
        if (!cancelled) {
          setTargetGrades([]);
          notifyRef.current.error(
            err?.message || "No se pudieron cargar los grados.",
          );
        }
      } finally {
        if (!cancelled) setLoadingTargetGrades(false);
      }
    };
    loadTargetGrades();
    return () => {
      cancelled = true;
    };
  }, [promoteModalOpen, sedeId, gradeId, getGradeOnlySede]);

  const fetchStudents = useCallback(async () => {
    if (!gradeId) {
      setStudents([]);
      return;
    }
    setIsLoading(true);
    try {
      const res = await getStudentGrades({ idGrade: Number(gradeId) });
      const data = Array.isArray(res) ? res : (res?.data ?? []);
      setStudents(data);
      if (data.length === 0) {
        notifyRef.current.info(
          "No se encontraron estudiantes para el grado seleccionado.",
        );
      }
    } catch (err) {
      console.error("ManageYearScholar - fetchStudents error:", err);
      setStudents([]);
      notifyRef.current.error(err?.message || "Error al cargar estudiantes.");
    } finally {
      setIsLoading(false);
    }
  }, [gradeId, getStudentGrades]);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  useEffect(() => {
    setHistoryModalStudent(null);
  }, [gradeId]);

  useEffect(() => {
    setStudents([]);
  }, [sedeId]);

  const fetchStudentHistory = useCallback(
    async (student) => {
      const studentId = getStudentId(student);
      if (!studentId) {
        throw new Error("El estudiante no tiene identificador.");
      }
      const res = await getBoletin({
        studentId,
        periodId: FINAL_PERIOD_ID,
        year: String(CURRENT_YEAR),
        fk_rol: String(rol ?? "3"),
      });
      const rows = Array.isArray(res) ? res : (res?.data ?? []);
      const history = buildStudentHistory(rows, student, CURRENT_YEAR);
      return history;
    },
    [rol],
  );

  const handleLoadStudentHistory = useCallback(
    async (student) => {
      const studentId = String(getStudentId(student));
      if (!studentId) {
        notifyRef.current.error(
          "No se pudo identificar el estudiante seleccionado.",
        );
        return;
      }
      setLoadingStudentId(studentId);
      try {
        const history = await fetchStudentHistory(student);
        setHistoryModalStudent({ ...history, rawStudent: student });
      } catch (err) {
        console.error("ManageYearScholar - historial error:", err);
        notifyRef.current.error(
          err?.message || "No se pudo cargar el historial de notas.",
        );
      } finally {
        setLoadingStudentId(null);
      }
    },
    [fetchStudentHistory],
  );

  const promoteStudent = useCallback(
    async (student, targetGrade) => {
      const studentId = getStudentId(student);
      if (!studentId) {
        throw new Error("El estudiante no tiene identificador.");
      }

      let gradeStudentId = getGradeStudentLinkId(student);
      if (!gradeStudentId) {
        const info = await getStudent({
          id_estudiante: Number(studentId),
          ...(sedeId || idSede
            ? { fk_sede: Number(sedeId || idSede) }
            : {}),
        });
        gradeStudentId = getGradeStudentLinkId(info);
      }
      if (!gradeStudentId) {
        throw new Error(
          "No se encontró el registro de grado del estudiante.",
        );
      }

      const notas = await getValidateStudentNote(studentId);

      await updateStudentGrade({
        fk_student: Number(studentId),
        fk_grade: Number(targetGrade),
        fk_grade_student: Number(gradeStudentId),
        notas_estudiante: Array.isArray(notas?.notas_estudiante)
          ? notas.notas_estudiante
          : [],
        notas_asignatura_enfasis: Array.isArray(
          notas?.notas_asignatura_enfasis,
        )
          ? notas.notas_asignatura_enfasis
          : [],
      });
    },
    [sedeId, idSede],
  );

  const handleOpenPromoteModal = useCallback(() => {
    setTargetGradeId("");
    setPromoteModalOpen(true);
  }, []);

  const handleClosePromoteModal = useCallback(() => {
    if (promoting) return;
    setPromoteModalOpen(false);
    setTargetGradeId("");
  }, [promoting]);

  const handleSendPromote = useCallback(() => {
    if (!targetGradeId) return;
    setPromoteModalOpen(false);
    setConfirmPromoteOpen(true);
  }, [targetGradeId]);

  const handleCloseConfirmPromote = useCallback(() => {
    if (promoting) return;
    setConfirmPromoteOpen(false);
  }, [promoting]);

  const handleConfirmPromote = useCallback(async () => {
    const student = historyModalStudent?.rawStudent;
    if (!student || !targetGradeId || promoting) return;
    setPromoting(true);
    try {
      await promoteStudent(student, targetGradeId);
      notifyRef.current.success(
        `${historyModalStudent?.nombre ?? "El estudiante"} fue promovido correctamente.`,
      );
      setConfirmPromoteOpen(false);
      setTargetGradeId("");
      setHistoryModalStudent(null);
      fetchStudents();
    } catch (err) {
      console.error("ManageYearScholar - promover error:", err);
      notifyRef.current.error(
        err?.message || "No se pudo promover al estudiante.",
      );
    } finally {
      setPromoting(false);
    }
  }, [historyModalStudent, targetGradeId, promoting, promoteStudent, fetchStudents]);

  const targetGradeLabel = useMemo(() => {
    const selected = targetGrades.find(
      (grade) => String(getGradeValue(grade)) === String(targetGradeId),
    );
    return getGradeLabel(selected) || targetGradeId;
  }, [targetGrades, targetGradeId]);

  const columns = useMemo(
    () => [
      {
        accessorKey: "id_estudiante",
        header: "ID",
        meta: { hideOnLG: true },
      },
      {
        accessorFn: (row) =>
          `${row.nombre_estudiante ?? row.nombre ?? ""} ${row.apellido_estudiante ?? row.apellido ?? ""}`.trim(),
        id: "nombre_completo",
        header: "Nombre",
      },
      {
        accessorKey: "grado",
        header: "Grado",
        meta: { hideOnLG: true },
      },
      {
        id: "aprobar",
        header: "Pasar año",
        cell: ({ row }) => {
          const student = row.original;
          const studentId = String(getStudentId(student));
          const isCurrentLoading = loadingStudentId === studentId;
          return (
            <SimpleButton
              type="button"
              msj={isCurrentLoading ? "Cargando..." : "Pasar año"}
              icon="CheckSquare"
              bg="bg-secondary"
              text="text-surface"
              noRounded={true}
              onClick={() => handleLoadStudentHistory(student)}
              disabled={
                !studentId || isCurrentLoading || loadingStudentId != null
              }
            />
          );
        },
      },
    ],
    [handleLoadStudentHistory, loadingStudentId],
  );

  const canShowTable = Boolean(sedeId && gradeId);

  return (
    <div className="p-6 h-full gap-4 flex flex-col">
      <div className="w-full grid gap-2 grid-cols-1 lg:grid-cols-5 justify-between items-center bg-primary text-surface p-3 rounded-lg">
        <div className="lg:col-span-4 flex items-center">
          <h2 className="text-2xl font-bold">Gestión de Año Escolar</h2>
        </div>
        <SimpleButton
          type="button"
          icon="HelpCircle"
          msjtooltip="Ayuda"
          noRounded={false}
          bg="bg-info"
          text="text-surface"
          className="w-auto px-3 py-1.5"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <SedeSelect
          value={sedeId}
          onChange={(e) => {
            setSedeId(e.target.value);
            setGradeId("");
          }}
          labelClassName="text-lg font-semibold"
          data={teacherSedeData}
          loading={loadingTeacherSedes}
        />
        {isTeacher ? (
          <GradeSelector
            label="Grado"
            labelClassName="text-lg font-semibold"
            value={gradeId}
            onChange={(e) => setGradeId(e.target.value)}
            sedeId={sedeId}
            customFetchMethod={getTeacherGrades}
            additionalParams={teacherGradesParams}
            disabled={!sedeId}
          />
        ) : isRol3 ? (
          <GradeSelector
            label="Grado"
            labelClassName="text-lg font-semibold"
            value={gradeId}
            onChange={(e) => setGradeId(e.target.value)}
            sedeId={sedeId}
            customFetchMethod={getGradeOnlySede}
            additionalParams={gradeSede3Params}
            disabled={!sedeId}
          />
        ) : (
          <GradeSelector
            label="Grado"
            labelClassName="text-lg font-semibold"
            value={gradeId}
            onChange={(e) => setGradeId(e.target.value)}
            sedeId={sedeId}
            disabled={!sedeId}
          />
        )}
      </div>

      {!sedeId && (
        <p className="text-sm opacity-70">Selecciona una sede para comenzar.</p>
      )}
      {sedeId && !gradeId && (
        <p className="text-sm opacity-70">
          Selecciona un grado para ver los estudiantes.
        </p>
      )}

      {canShowTable && (
        <div className="flex-1 mt-2">
          {isLoading ? (
            <Loader message="Cargando estudiantes..." size={96} />
          ) : (
            <DataTable
              data={students}
              columns={columns}
              fileName="gestion_anio_escolar"
              pageSize={50}
              initialSorting={[{ id: "nombre_completo", desc: false }]}
              
            />
          )}
        </div>
      )}

      <Modal
        isOpen={Boolean(historyModalStudent)}
        onClose={() => setHistoryModalStudent(null)}
        title={`Historial de notas — ${historyModalStudent?.nombre ?? ""}`}
        size="7xl"
      >
        {historyModalStudent && (
          <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex flex-col gap-1 text-sm">
              <span>
                <strong>Año:</strong> {historyModalStudent.year}
              </span>
              <span>
                <strong>Grado:</strong> {historyModalStudent.grado || "-"}
              </span>
              <span>
                <strong>Promedio general:</strong>{" "}
                {historyModalStudent.annual.promedioGeneral ?? "-"}
              </span>
            </div>
            <div className="flex gap-2">
              <div className="w-36">
                <SimpleButton
                  type="button"
                  msj="Promover"
                  icon="CheckSquare"
                  bg="bg-primary"
                  text="text-surface"
                  noRounded={false}
                  onClick={handleOpenPromoteModal}
                  disabled={promoting}
                />
              </div>
              <div className="w-36">
                <SimpleButton
                  type="button"
                  msj="Mantener"
                  icon="Minus"
                  bg="bg-secondary"
                  text="text-surface"
                  noRounded={false}
                />
              </div>
            </div>
          </div>
            <AnnualSummary
              subjects={historyModalStudent.annualSubjects ?? []}
            />
            {Object.keys(historyModalStudent.periods).length === 0 ? (
              <p className="text-sm opacity-70">
                No se encontraron períodos con notas para este estudiante.
              </p>
            ) : (
              Object.values(historyModalStudent.periods).map((period) => (
                <PeriodHistory key={period.idPeriodo} period={period} />
              ))
            )}
          </div>
        )}
      </Modal>

      <Modal
        isOpen={promoteModalOpen}
        onClose={handleClosePromoteModal}
        title="Promover estudiante"
        size="lg"
      >
        <div className="flex flex-col gap-4">
          <p className="text-sm opacity-80">
            ¿A qué grado desea promover a{" "}
            <strong>{historyModalStudent?.nombre ?? "el estudiante"}</strong>?
          </p>
          <GradeSelector
            label="Grado destino"
            labelClassName="text-sm font-semibold"
            value={targetGradeId}
            onChange={(e) => setTargetGradeId(e.target.value)}
            staticOptions={targetGrades}
            disabled={loadingTargetGrades || targetGrades.length === 0}
            placeholder={
              loadingTargetGrades
                ? "Cargando grados..."
                : "Selecciona un grado"
            }
          />
          {!loadingTargetGrades && targetGrades.length === 0 && (
            <p className="text-sm opacity-70">
              No hay otros grados disponibles para esta sede.
            </p>
          )}
          <div className="flex justify-end gap-2">
            <div className="w-36">
              <SimpleButton
                type="button"
                msj="Cancelar"
                bg="bg-secondary"
                text="text-surface"
                onClick={handleClosePromoteModal}
              />
            </div>
            <div className="w-36">
              <SimpleButton
                type="button"
                msj="Enviar"
                icon="Send"
                bg="bg-primary"
                text="text-surface"
                onClick={handleSendPromote}
                disabled={
                  !targetGradeId ||
                  loadingTargetGrades ||
                  targetGrades.length === 0
                }
              />
            </div>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={confirmPromoteOpen}
        onClose={handleCloseConfirmPromote}
        title="Confirmar promoción"
        size="lg"
      >
        <div className="flex flex-col gap-4">
          <p className="text-sm opacity-80">
            ¿Está seguro de promover a{" "}
            <strong>{historyModalStudent?.nombre ?? "el estudiante"}</strong>{" "}
            al grado <strong>{targetGradeLabel || "-"}</strong>?
          </p>
          <div className="flex justify-end gap-2">
            <div className="w-36">
              <SimpleButton
                type="button"
                msj="Cancelar"
                bg="bg-secondary"
                text="text-surface"
                onClick={handleCloseConfirmPromote}
                disabled={promoting}
              />
            </div>
            <div className="w-36">
              <SimpleButton
                type="button"
                msj={promoting ? "Promoviendo..." : "Sí, promover"}
                icon="CheckSquare"
                bg="bg-primary"
                text="text-surface"
                onClick={handleConfirmPromote}
                disabled={promoting}
              />
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ManageYearScholar;
