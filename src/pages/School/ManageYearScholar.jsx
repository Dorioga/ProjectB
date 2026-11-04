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
import { getBoletin } from "../../services/studentService";

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

const getEffectiveNote = (nota, recuperacion) => {
  const notaValue = toNumber(nota);
  const recuperacionValue = toNumber(recuperacion);
  if (notaValue == null) return recuperacionValue;
  if (recuperacionValue == null) return notaValue;
  return Math.max(notaValue, recuperacionValue);
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
    if (period.totalAsignaturas == null && row?.total_asignaturas != null) {
      const total = parseInt(row.total_asignaturas, 10);
      if (!Number.isNaN(total)) period.totalAsignaturas = total;
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

  const sortedPeriods = Array.from(periodMap.values()).sort(
    (a, b) => Number(a.idPeriodo) - Number(b.idPeriodo),
  );

  for (const period of sortedPeriods) {
    let periodSum = 0;
    let periodCount = 0;

    for (const asignatura of period.asignaturas) {
      if (asignatura.tieneNota !== "SI") continue;
      const effectiveNote = getEffectiveNote(
        asignatura.nota,
        asignatura.notaRecuperacion,
      );
      if (effectiveNote == null) continue;
      periodSum += effectiveNote;
      periodCount += 1;
      generalSum += effectiveNote;
      generalCount += 1;
    }

    const divisor =
      period.totalAsignaturas && period.totalAsignaturas > 0
        ? period.totalAsignaturas
        : periodCount;
    period.promedio =
      divisor > 0 ? (periodSum / divisor).toFixed(2) : null;
    if (!period.nombrePeriodo) {
      period.nombrePeriodo = `Periodo ${period.idPeriodo}`;
    }
    delete period.asignaturasMap;
    periods[period.idPeriodo] = period;
  }

  return {
    studentId: String(getStudentId(student)),
    nombre: getStudentName(student) || "Estudiante",
    grado: student?.grado ?? "",
    year: String(year),
    periodIdConsultado: FINAL_PERIOD_ID,
    periods,
    annual: {
      estadoFinal: annualEstadoFinal,
      definitiva: annualDefinitiva,
      promedioGeneral:
        generalCount > 0 ? (generalSum / generalCount).toFixed(2) : null,
    },
  };
};

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
            <th className="text-center px-3 py-2 font-semibold">Definitiva</th>
            <th className="text-center px-3 py-2 font-semibold">
              Estado final
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
              <td className="px-3 py-2 text-center">
                {asignatura.escala ?? "-"}
              </td>
              <td className="px-3 py-2 text-center">
                {asignatura.estadoPeriodo ?? "-"}
              </td>
              <td className="px-3 py-2 text-center">
                {asignatura.definitiva ?? "-"}
              </td>
              <td className="px-3 py-2 text-center">
                {asignatura.estadoFinal ?? "-"}
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

  const [historyByStudent, setHistoryByStudent] = useState({});
  const [historyModalStudent, setHistoryModalStudent] = useState(null);
  const [summaryOpen, setSummaryOpen] = useState(false);
  const [loadingStudentId, setLoadingStudentId] = useState(null);
  const [loadingAll, setLoadingAll] = useState(false);
  const [progressAll, setProgressAll] = useState({ current: 0, total: 0 });

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
    setHistoryByStudent({});
    setHistoryModalStudent(null);
    setSummaryOpen(false);
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
      setHistoryByStudent((prev) => ({
        ...prev,
        [String(studentId)]: history,
      }));
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
        setHistoryModalStudent(history);
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

  const handleApproveAll = useCallback(async () => {
    if (!students.length || loadingAll) return;
    setLoadingAll(true);
    setProgressAll({ current: 0, total: students.length });
    let failed = 0;

    for (let index = 0; index < students.length; index += 1) {
      try {
        await fetchStudentHistory(students[index]);
      } catch (err) {
        failed += 1;
        console.error("ManageYearScholar - historial masivo error:", err);
      }
      setProgressAll({ current: index + 1, total: students.length });
    }

    setLoadingAll(false);
    setSummaryOpen(true);
    if (failed > 0) {
      notifyRef.current.warning(
        `No se pudieron cargar ${failed} de ${students.length} historiales.`,
      );
    }
  }, [students, loadingAll, fetchStudentHistory]);

  const summaryPeriods = useMemo(() => {
    const ids = new Set();
    Object.values(historyByStudent).forEach((history) => {
      Object.keys(history.periods).forEach((periodId) => ids.add(periodId));
    });
    return Array.from(ids).sort((a, b) => Number(a) - Number(b));
  }, [historyByStudent]);

  const summaryRows = useMemo(
    () =>
      students.map((student) => {
        const studentId = String(getStudentId(student));
        return {
          student,
          history: historyByStudent[studentId] ?? null,
        };
      }),
    [students, historyByStudent],
  );

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
        header: "Aprobar / Pasar año",
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
              noRounded={false}
              onClick={() => handleLoadStudentHistory(student)}
              disabled={
                !studentId ||
                isCurrentLoading ||
                loadingAll ||
                loadingStudentId != null
              }
            />
          );
        },
      },
    ],
    [
      handleLoadStudentHistory,
      loadingAll,
      loadingStudentId,
    ],
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
          {!isLoading && students.length > 0 && (
            <div className="flex justify-end mb-3">
              <div className="w-64">
                <SimpleButton
                  type="button"
                  msj={
                    loadingAll
                      ? `Aprobar todos (${progressAll.current}/${progressAll.total})`
                      : "Aprobar todos"
                  }
                  icon="CheckSquare"
                  bg="bg-secondary"
                  text="text-surface"
                  onClick={handleApproveAll}
                  disabled={loadingAll || loadingStudentId != null}
                />
              </div>
            </div>
          )}
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
              <span>
                <strong>Estado final:</strong>{" "}
                {historyModalStudent.annual.estadoFinal ?? "-"}
              </span>
            </div>
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
        isOpen={summaryOpen}
        onClose={() => setSummaryOpen(false)}
        title="Historial de notas — Curso"
        size="7xl"
      >
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-primary/10">
              <tr>
                <th className="text-left px-3 py-2 font-semibold">
                  Estudiante
                </th>
                {summaryPeriods.map((periodId) => (
                  <th
                    key={periodId}
                    className="text-center px-3 py-2 font-semibold"
                  >
                    Periodo {periodId}
                  </th>
                ))}
                <th className="text-center px-3 py-2 font-semibold">
                  Promedio general
                </th>
                <th className="text-center px-3 py-2 font-semibold">
                  Estado final
                </th>
                <th className="text-center px-3 py-2 font-semibold">
                  Detalle
                </th>
              </tr>
            </thead>
            <tbody>
              {summaryRows.map(({ student, history }) => (
                <tr
                  key={String(getStudentId(student))}
                  className="border-t border-primary/10"
                >
                  <td className="px-3 py-2">{getStudentName(student)}</td>
                  {summaryPeriods.map((periodId) => (
                    <td
                      key={periodId}
                      className="px-3 py-2 text-center"
                    >
                      {history?.periods?.[periodId]?.promedio ?? "-"}
                    </td>
                  ))}
                  <td className="px-3 py-2 text-center">
                    {history?.annual?.promedioGeneral ?? "-"}
                  </td>
                  <td className="px-3 py-2 text-center">
                    {history?.annual?.estadoFinal ?? "-"}
                  </td>
                  <td className="px-3 py-2 text-center">
                    <SimpleButton
                      type="button"
                      msj="Ver"
                      icon="Eye"
                      bg="bg-secondary"
                      text="text-surface"
                      noRounded={false}
                      onClick={() => setHistoryModalStudent(history)}
                      disabled={!history}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Modal>
    </div>
  );
};

export default ManageYearScholar;
