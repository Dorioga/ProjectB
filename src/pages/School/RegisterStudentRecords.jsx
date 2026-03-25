import React, {
  useEffect,
  useMemo,
  useState,
  useRef,
  useCallback,
} from "react";
import { Edit, Plus } from "lucide-react";

import SimpleButton from "../../components/atoms/SimpleButton";
import DataTable from "../../components/atoms/DataTable";
import Loader from "../../components/atoms/Loader";
import SedeSelect from "../../components/atoms/SedeSelect";
import JourneySelect from "../../components/atoms/JourneySelect";
import PeriodSelector from "../../components/atoms/PeriodSelector";
import GradeSelector from "../../components/atoms/GradeSelector";
import AsignatureSelector from "../../components/molecules/AsignatureSelector";
import useSchool from "../../lib/hooks/useSchool";
import useTeacher from "../../lib/hooks/useTeacher";
import useData from "../../lib/hooks/useData";
import useAuth from "../../lib/hooks/useAuth";
import tourRegisterStudentRecords from "../../tour/tourRegisterStudentRecords";
import { useNotify } from "../../lib/hooks/useNotify";
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
    getStudentGrades,
  } = useSchool();
  const {
    getTeacherSede,
    getTeacherGrades,
    getTeacherSubjects,
    getStudentNotes,
    saveAssignmentNotes,
    updateAssignmentNote,
    getLogroType,
    getAllLogros,
  } = useTeacher();
  const { institutionSedes } = useData();
  const { idSede, nameSede, rol, idDocente, token, idInstitution } = useAuth();
  const notify = useNotify();

  // Detectar si el usuario es docente
  const isTeacher = Boolean(idDocente);

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
  // Metadatos de notas por estudiante: { [studentKey]: { [recordKey]: { id_estudiante_nota } } }
  const [noteMetaByStudent, setNoteMetaByStudent] = useState({});
  const [loadingData, setLoadingData] = useState(false);
  // Estado de carga por fila: { [studentKey]: boolean }
  const [rowLoadingById, setRowLoadingById] = useState({});
  // Estado de guardado por fila para mostrar check temporal: { [studentKey]: boolean }
  const [rowSavedById, setRowSavedById] = useState({});
  // Snapshot de valores iniciales por fila (para revertir cuando se cancela edición)
  const [rowInitialValuesById, setRowInitialValuesById] = useState({});
  // Control de edición por fila: true = editable, false = locked por servicio
  const [rowEditById, setRowEditById] = useState({});
  const [commentsById, setCommentsById] = useState({});
  const [recoveryNotesById, setRecoveryNotesById] = useState({});

  // --- Logros (para comentarios): tipos y lista filtrada por tipo (por fila) ---
  const [tipoLogroOptions, setTipoLogroOptions] = useState([]);
  const [loadingTipoLogroOptions, setLoadingTipoLogroOptions] = useState(false);
  const [tipoByStudent, setTipoByStudent] = useState({}); // { studentKey: tipoId }
  const [logrosOptionsByStudent, setLogrosOptionsByStudent] = useState({}); // { studentKey: [ {id, descripcion} ] }
  const [loadingLogrosByStudent, setLoadingLogrosByStudent] = useState({});
  const [selectedLogroByStudent, setSelectedLogroByStudent] = useState({});

  // === Refs para estado mutable en celdas (evitar pérdida de foco por recreación de columnas) ===
  const recordValuesByStudentRef = useRef(recordValuesByStudent);
  const commentsByIdRef = useRef(commentsById);
  const recoveryNotesByIdRef = useRef(recoveryNotesById);
  const rowEditByIdRef = useRef(rowEditById);
  const rowLoadingByIdRef = useRef(rowLoadingById);
  const rowSavedByIdRef = useRef(rowSavedById);
  const loadingDataRef = useRef(loadingData);
  const handleAddRef = useRef(null);
  const handleEditRef = useRef(null);

  // Logros refs (para selects por fila)
  const tipoByStudentRef = useRef(tipoByStudent);
  const logrosOptionsByStudentRef = useRef(logrosOptionsByStudent);
  const loadingLogrosByStudentRef = useRef(loadingLogrosByStudent);
  const selectedLogroByStudentRef = useRef(selectedLogroByStudent);
  // Refs para el estado de tipos de logro (evitan dependencias en useCallback)
  const tipoLogroOptionsRef = useRef(tipoLogroOptions);
  const loadingTipoLogroOptionsRef = useRef(loadingTipoLogroOptions);

  // Sincronizar refs en cada render
  recordValuesByStudentRef.current = recordValuesByStudent;
  commentsByIdRef.current = commentsById;
  recoveryNotesByIdRef.current = recoveryNotesById;
  rowEditByIdRef.current = rowEditById;
  rowLoadingByIdRef.current = rowLoadingById;
  rowSavedByIdRef.current = rowSavedById;
  loadingDataRef.current = loadingData;

  // Logros refs
  tipoByStudentRef.current = tipoByStudent;
  logrosOptionsByStudentRef.current = logrosOptionsByStudent;
  loadingLogrosByStudentRef.current = loadingLogrosByStudent;
  selectedLogroByStudentRef.current = selectedLogroByStudent;
  tipoLogroOptionsRef.current = tipoLogroOptions;
  loadingTipoLogroOptionsRef.current = loadingTipoLogroOptions;

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
    // aceptar tanto rol numérico '7' como la cadena 'docente'
    if (
      (String(rol).toLowerCase() === "docente" || String(rol) === "7") &&
      idSede &&
      nameSede
    ) {
      return [
        { id: idSede, name: nameSede, fk_institucion: idInstitution ?? null },
      ];
    }
    return null;
  }, [rol, idSede, nameSede, teacherSedes, idInstitution]);

  const canShowStudents = Boolean(
    sedeSelected &&
    gradeSelected &&
    asignatureSelected &&
    workdaySelected &&
    periodSelected &&
    journey &&
    asignatureCode,
  );

  // Derivar fk_institucion igual que en ManageLogro: preferir fk de la sede del docente, si existe
  const fkInstitucion = useMemo(() => {
    if (
      (String(rol).toLowerCase() === "docente" || String(rol) === "7") &&
      Array.isArray(teacherSedeData) &&
      teacherSedeData.length > 0
    ) {
      return teacherSedeData[0]?.fk_institucion ?? null;
    }
    return idInstitution ? Number(idInstitution) : null;
  }, [rol, teacherSedeData, idInstitution]);

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
            fk_institucion:
              s?.fk_institucion ??
              s?.fkInstitution ??
              s?.id_institucion ??
              undefined,
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

  // Handlers de cascada: limpian los selectores hijos al cambiar el padre.
  // Se ejecutan inline (no en useEffect) para evitar un render intermedio
  // con valores obsoletos que dispararía llamadas a la API con parámetros inválidos.
  const handleSedeChange = (e) => {
    const val = e.target.value;
    setSedeSelected(val);
    setGradeSelected("");
    setAsignatureSelected("");
    setWorkdaySelected("");
    setDetectedJourney(null);
  };

  // Para docentes: Sede -> Grado -> Asignatura -> Jornada
  const handleGradeChangeTeacher = (e) => {
    setGradeSelected(e.target.value);
    setAsignatureSelected("");
    setWorkdaySelected("");
    setDetectedJourney(null);
  };

  // Para no docentes: Sede -> Jornada -> Asignatura -> Grado
  const handleWorkdayChangeNonTeacher = (e) => {
    setWorkdaySelected(e.target.value);
    setAsignatureSelected("");
    setGradeSelected("");
  };

  const handleAsignatureChangeNonTeacher = (e) => {
    setAsignatureSelected(e.target.value);
    setGradeSelected("");
  };

  // Auto-seleccionar jornada basada en el fk_workday de la sede (solo docentes)
  useEffect(() => {
    if (!sedeWorkday || sedeWorkday === "3") return;
    if (isTeacher) {
      setWorkdaySelected(sedeWorkday);
    }
  }, [sedeWorkday, isTeacher]);

  // Sincronizar journey con workdaySelected
  useEffect(() => {
    setJourney(workdaySelected);
  }, [workdaySelected]);

  // Sincronizar asignatureCode con asignatureSelected
  useEffect(() => {
    setAsignatureCode(asignatureSelected);
  }, [asignatureSelected]);

  // --- Lazy-load tipos de logro (solo cuando una fila está en modo edición y sus notas están completas) ---
  // Los refs se usan para las guardas internas y así la función no se recrea
  // cada vez que cambia el estado de carga (evita bucles de recreación).
  const loadTipoLogroOptions = useCallback(
    async (force = false) => {
      // si no es forzado y ya tenemos opciones retornamos (leemos ref, no estado)
      if (
        !force &&
        Array.isArray(tipoLogroOptionsRef.current) &&
        tipoLogroOptionsRef.current.length > 0
      )
        return;
      // evitar llamadas concurrentes (leemos ref, no estado)
      if (loadingTipoLogroOptionsRef.current) return;

      setLoadingTipoLogroOptions(true);
      try {
        if (!getLogroType) {
          console.warn("loadTipoLogroOptions - getLogroType no disponible");
          return;
        }
        const res = await getLogroType();
        const data = Array.isArray(res) ? res : (res?.data ?? []);
        setTipoLogroOptions(data);
      } catch (err) {
        console.error("RegisterStudentRecords - getLogroType error:", err);
        setTipoLogroOptions([]);
        notify.error("No fue posible cargar tipos de logro.");
      } finally {
        setLoadingTipoLogroOptions(false);
      }
    },
    // tipoLogroOptions y loadingTipoLogroOptions se leen vía refs, no deps
    [getLogroType, notify],
  );

  // Vigilar filas en modo edición y cargar tipos sólo cuando haya al menos
  // una fila editable cuya calculadora de notas indique `isComplete === true`.
  // Los estados de carga se leen a través de refs para no ser deps del effect.
  useEffect(() => {
    if (
      Array.isArray(tipoLogroOptionsRef.current) &&
      tipoLogroOptionsRef.current.length > 0
    )
      return;
    if (loadingTipoLogroOptionsRef.current) return;

    const editingKeys = Object.keys(rowEditById || {}).filter(
      (k) => rowEditById?.[k],
    );
    if (editingKeys.length === 0) return;

    for (const key of editingKeys) {
      const values = recordValuesByStudent?.[key] ?? {};
      const finalInfo = computeFinalRecord(values);
      if (finalInfo && finalInfo.isComplete) {
        loadTipoLogroOptions().catch((err) =>
          console.warn("loadTipoLogroOptions failed:", err),
        );
        break;
      }
    }
  }, [rowEditById, recordValuesByStudent, loadTipoLogroOptions]);

  const reloadOnceRef = useRef(false);

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
    console.debug(
      "clear recordValuesByStudent because asignatureCode/journey changed",
      { asignatureCode, journey },
    );
    setRecordValuesByStudent({});
    setRecoveryNotesById({});
  }, [asignatureCode, journey]);

  // Llamar a los servicios cuando se tengan los 4 campos requeridos (secuencial):
  // 1) cargar estudiantes del grado
  // 2) por cada estudiante llamar a getStudentNotes con fk_estudiante y consolidar
  const loadStudentsAndNotes = useCallback(async () => {
    if (
      !idDocente ||
      !asignatureSelected ||
      !gradeSelected ||
      !periodSelected
    ) {
      console.debug(
        "fetchData early exit - clearing records because missing params",
        { idDocente, asignatureSelected, gradeSelected, periodSelected },
      );
      setNotesFromService([]);
      setStudentsFromService([]);
      setRecordValuesByStudent({});
      setNoteMetaByStudent({});
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
      const metaByStudent = {};

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

        // temporales para comentarios/tipo/logro/opciones por estudiante
        const commentsForStudent = commentsById || {};
        const tipoForStudent = {};
        const logroForStudent = selectedLogroByStudent || {};
        const logroOptionsForStudent = {};
        const recoveryForStudent = {};

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

          // Guardar metadatos por student+note (ej. id_estudiante_nota)
          const studentNoteId =
            n?.id_estudiante_nota ?? n?.id_student_note ?? n?.id ?? null;
          if (studentNoteId != null) {
            metaByStudent[studentKey] = metaByStudent[studentKey] || {};
            metaByStudent[studentKey][key] = {
              id_estudiante_nota: Number(studentNoteId),
            };
          }

          // Extraer comentario / goal si viene en la respuesta (prefiere first non-empty)
          const noteComment =
            n?.goal_student ??
            n?.goalStudent ??
            n?.goal ??
            n?.comentario ??
            n?.comentario_docente ??
            null;
          if (noteComment && !commentsForStudent[studentKey]) {
            commentsForStudent[studentKey] = String(noteComment);
          }

          // Extraer nota de recuperación si viene en la respuesta
          const noteRecovery =
            n?.nota_recuperacion ?? n?.recovery_note ?? n?.recoveryNote ?? null;
          if (
            noteRecovery != null &&
            (recoveryForStudent[studentKey] === undefined ||
              recoveryForStudent[studentKey] === null)
          ) {
            recoveryForStudent[studentKey] = String(noteRecovery);
          }

          // Extraer fk_tipo_logro (primer select) y id_logro (segundo select) si vienen
          const noteTipo =
            n?.fk_tipo_logro ?? n?.fkTipoLogro ?? n?.fk_type_logro ?? null;
          const noteLogro =
            n?.id_logro ?? n?.idLogro ?? n?.fk_logro ?? n?.fkLogro ?? null;
          const noteLogroDesc =
            n?.descripcion_logro ??
            n?.descripcion ??
            n?.desc_logro ??
            n?.descripcion_logro_estudiante ??
            null;

          if (noteTipo && !tipoForStudent[studentKey]) {
            tipoForStudent[studentKey] = String(noteTipo);
          }

          if (noteLogro && !logroForStudent[studentKey]) {
            logroForStudent[studentKey] = String(noteLogro);
          }

          if (noteLogro && noteLogroDesc) {
            logroOptionsForStudent[studentKey] =
              logroOptionsForStudent[studentKey] || [];
            // evitar duplicados
            if (
              !logroOptionsForStudent[studentKey].some(
                (o) => String(o.id) === String(noteLogro),
              )
            ) {
              logroOptionsForStudent[studentKey].push({
                id: noteLogro,
                descripcion: String(noteLogroDesc),
              });
            }
          }
        });

        // Asignar maps extraídos (si hubo datos)
        if (Object.keys(commentsForStudent).length > 0)
          setCommentsById((prev) => ({ ...prev, ...commentsForStudent }));
        if (Object.keys(tipoForStudent).length > 0)
          setTipoByStudent((prev) => ({ ...prev, ...tipoForStudent }));
        if (Object.keys(logroForStudent).length > 0)
          setSelectedLogroByStudent((prev) => ({
            ...prev,
            ...logroForStudent,
          }));
        if (Object.keys(logroOptionsForStudent).length > 0)
          setLogrosOptionsByStudent((prev) => ({
            ...prev,
            ...logroOptionsForStudent,
          }));
        if (Object.keys(recoveryForStudent).length > 0)
          setRecoveryNotesById((prev) => ({ ...prev, ...recoveryForStudent }));
      });

      const consolidatedNotes = Array.from(notesMap.values());
      setNotesFromService(consolidatedNotes);
      console.debug("initial valuesByStudent set", { valuesByStudent });
      setRecordValuesByStudent(valuesByStudent);
      setCommentsById({});
      setNoteMetaByStudent(metaByStudent);

      // Inicializar estados por fila basados en valores traídos del servicio:
      setRowInitialValuesById(valuesByStudent);
      // Si el estudiante tiene valores, bloquear inputs (editable=false). Si no, desbloquear.
      const editMap = {};
      (studentsArray || []).forEach((s) => {
        const key = getStudentKey(s);
        const hasValues = Boolean(
          valuesByStudent?.[key] &&
          Object.keys(valuesByStudent[key]).length > 0,
        );
        editMap[key] = !hasValues; // editable si NO tiene valores desde servicio
      });
      setRowEditById(editMap);
      setRowSavedById({});
    } catch (error) {
      console.error("Error al cargar datos secuencialmente:", error);
      setNotesFromService([]);
      setStudentsFromService([]);
      setRecordValuesByStudent({});
      setNoteMetaByStudent({});
      notify.error("No fue posible cargar estudiantes o notas");
    } finally {
      setLoadingData(false);
    }
  }, [
    idDocente,
    asignatureSelected,
    gradeSelected,
    periodSelected,
    getStudentNotes,
    getStudentGrades,
  ]);

  useEffect(() => {
    loadStudentsAndNotes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadStudentsAndNotes]);

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

  const sanitizeGradeInput = useCallback((raw) => {
    const text = String(raw ?? "").trim();
    if (text === "") return "";

    const normalizedText = text.replace(",", ".");
    const n = Number(normalizedText);
    if (!Number.isFinite(n)) return raw; // Mantener el valor durante la edición

    // No validar límites mientras se escribe
    if (n < 0 || n > 5) return raw;

    return text;
  }, []);

  // Normalizar valores numéricos en el payload: reemplazar coma por punto y convertir a Number
  const normalizeNumericInPayload = (payload) => {
    if (!payload || typeof payload !== "object") return payload;
    const copy = { ...payload };

    if (Array.isArray(copy.note_student)) {
      copy.note_student = copy.note_student.map((it) => {
        const item = { ...it };
        [
          "value_note",
          "note_percentage_final",
          "nota_periodo_porcentual",
          "nota_final",
        ].forEach((k) => {
          if (item[k] != null) {
            const s = String(item[k]).trim().replace(/,/g, ".");
            const n = Number(s);
            if (Number.isFinite(n)) item[k] = n;
          }
        });
        return item;
      });
    }

    if (copy.recovery_note != null) {
      const s = String(copy.recovery_note).trim().replace(/,/g, ".");
      const n = Number(s);
      if (Number.isFinite(n)) copy.recovery_note = n;
    }

    return copy;
  };

  // Clampear y formatear valores al perder foco: asegurar 0 <= n <= 5 y redondear a 2 decimales
  const clampAndFormatNoteValue = useCallback((studentKey, recordKey) => {
    setRecordValuesByStudent((prev) => {
      const prevStudent = prev?.[studentKey] ?? {};
      const raw = prevStudent?.[recordKey];
      const s = String(raw ?? "")
        .trim()
        .replace(/,/g, ".");
      const n = Number(s);
      if (!Number.isFinite(n)) return prev; // si no es número, no cambiar
      const clamped = Math.min(5, Math.max(0, n));
      const rounded = Math.round((clamped + Number.EPSILON) * 100) / 100;
      return {
        ...prev,
        [studentKey]: {
          ...prevStudent,
          [recordKey]: String(rounded),
        },
      };
    });
  }, []);

  const clampAndFormatRecovery = useCallback((studentKey) => {
    setRecoveryNotesById((prev) => {
      const raw = prev?.[studentKey];
      const s = String(raw ?? "")
        .trim()
        .replace(/,/g, ".");
      const n = Number(s);
      if (!Number.isFinite(n)) return prev;
      const clamped = Math.min(5, Math.max(0, n));
      const rounded = Math.round((clamped + Number.EPSILON) * 100) / 100;
      return {
        ...prev,
        [studentKey]: String(rounded),
      };
    });
  }, []);

  const handleRecordValueChange = useCallback(
    (studentKey, recordKey, value) => {
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
    },
    [],
  );

  const handleCommentChange = useCallback((studentKey, value) => {
    setCommentsById((prev) => ({
      ...prev,
      [studentKey]: value,
    }));
  }, []);

  const handleRecoveryNoteChange = useCallback((studentKey, value) => {
    setRecoveryNotesById((prev) => ({
      ...prev,
      [studentKey]: value,
    }));
  }, []);

  // --- Handlers para selects de logros en la columna "Comentarios" ---
  const handleTipoSelectForStudent = useCallback(
    async (studentKey, tipoId) => {
      setTipoByStudent((prev) => ({ ...prev, [studentKey]: tipoId }));
      // limpiar logros y comentario previos
      setLogrosOptionsByStudent((prev) => ({ ...prev, [studentKey]: [] }));
      setSelectedLogroByStudent((prev) => ({ ...prev, [studentKey]: "" }));
      setCommentsById((prev) => ({ ...prev, [studentKey]: "" }));

      if (!tipoId) return;
      setLoadingLogrosByStudent((prev) => ({ ...prev, [studentKey]: true }));

      try {
        const payload = {
          ...(fkInstitucion ? { fk_institucion: Number(fkInstitucion) } : {}),
          ...(asignatureSelected
            ? { fk_asignatura: Number(asignatureSelected) }
            : {}),
          ...(gradeSelected ? { fk_grado: Number(gradeSelected) } : {}),
          ...(periodSelected ? { fk_periodo: Number(periodSelected) } : {}),
          fk_tipo_logro: Number(tipoId),
        };
        const res = await getAllLogros(payload);
        const list = Array.isArray(res) ? res : (res?.data ?? []);
        const mapped = (Array.isArray(list) ? list : []).map((l) => ({
          id: l.id_logro ?? l.id,
          descripcion: l.descripcion ?? l.description ?? l.nombre ?? "",
        }));
        setLogrosOptionsByStudent((prev) => ({
          ...prev,
          [studentKey]: mapped,
        }));
      } catch (err) {
        console.error("RegisterStudentRecords - getAllLogros error:", err);
        notify.error("No fue posible cargar logros para el tipo seleccionado.");
      } finally {
        setLoadingLogrosByStudent((prev) => ({ ...prev, [studentKey]: false }));
      }
    },
    [
      getAllLogros,
      fkInstitucion,
      asignatureSelected,
      gradeSelected,
      periodSelected,
      notify,
    ],
  );

  const handleLogroSelectForStudent = useCallback((studentKey, logroId) => {
    const options = logrosOptionsByStudentRef.current?.[studentKey] ?? [];
    const chosen = options.find((o) => String(o.id) === String(logroId));
    const text = chosen?.descripcion ?? "";
    setSelectedLogroByStudent((prev) => ({ ...prev, [studentKey]: logroId }));
    setCommentsById((prev) => ({ ...prev, [studentKey]: text }));
  }, []);

  // Cargar opciones de `logro` para una fila concreta sin limpiar selección previa.
  const loadLogrosOptionsForStudent = useCallback(
    async (studentKey, tipoId, { preserveSelection = true } = {}) => {
      if (!tipoId) return;
      // si ya están y no forzamos, no volver a cargarlas
      const existing = logrosOptionsByStudentRef.current?.[studentKey];
      if (preserveSelection && Array.isArray(existing) && existing.length > 0)
        return;

      setLoadingLogrosByStudent((prev) => ({ ...prev, [studentKey]: true }));
      try {
        const payload = {
          ...(fkInstitucion ? { fk_institucion: Number(fkInstitucion) } : {}),
          ...(asignatureSelected
            ? { fk_asignatura: Number(asignatureSelected) }
            : {}),
          ...(gradeSelected ? { fk_grado: Number(gradeSelected) } : {}),
          ...(periodSelected ? { fk_periodo: Number(periodSelected) } : {}),
          fk_tipo_logro: Number(tipoId),
        };
        const res = await getAllLogros(payload);
        const list = Array.isArray(res) ? res : (res?.data ?? []);
        const mapped = (Array.isArray(list) ? list : []).map((l) => ({
          id: l.id_logro ?? l.id,
          descripcion: l.descripcion ?? l.description ?? l.nombre ?? "",
        }));

        setLogrosOptionsByStudent((prev) => ({
          ...prev,
          [studentKey]: mapped,
        }));

        // Si no preservamos selección, limpiar selección y comentario (igual que handleTipoSelect)
        if (!preserveSelection) {
          setSelectedLogroByStudent((prev) => ({ ...prev, [studentKey]: "" }));
          setCommentsById((prev) => ({ ...prev, [studentKey]: "" }));
        }
      } catch (err) {
        console.error(
          "RegisterStudentRecords - getAllLogros error (on edit):",
          err,
        );
        // no notificamos al usuario aquí para no ser intrusivos; usar console
      } finally {
        setLoadingLogrosByStudent((prev) => ({ ...prev, [studentKey]: false }));
      }
    },
    [
      getAllLogros,
      fkInstitucion,
      asignatureSelected,
      gradeSelected,
      periodSelected,
    ],
  );

  /**
   * Guarda notas para UNA sola fila (estudiante).
   * - Construye payload con fk_grado, fk_sede, fk_beca y note_student[]
   * - Cada item de note_student incluye note_percentage_final y, si está completo, final_note
   */
  const saveStudentNotes = async (student, { action } = {}) => {
    const studentKey = getStudentKey(student);
    const values = recordValuesByStudent?.[studentKey] ?? {};
    const comment = commentsById?.[studentKey] ?? "";
    const recoveryNote =
      String(periodSelected) === "4"
        ? (recoveryNotesById?.[studentKey] ?? "")
        : "";

    // id seleccionado del select "logro" (segundo select de comentarios)
    const selectedLogro =
      selectedLogroByStudentRef.current?.[studentKey] ??
      selectedLogroByStudent?.[studentKey] ??
      "";

    // id seleccionado del primer select (tipo de logro)
    const selectedTipo =
      tipoByStudentRef.current?.[studentKey] ??
      tipoByStudent?.[studentKey] ??
      "";

    const finalInfo = computeFinalRecord(values);
    console.debug("saveStudentNotes - computed finalInfo", {
      finalInfo,
      values,
    });
    // Separar notas en dos grupos según si el servidor ya tiene un registro (meta) o no:
    // - insertArray: notas SIN valor del servidor → invocar saveAssignmentNotes (INSERT)
    // - updateArray: notas CON valor del servidor → invocar updateAssignmentNote (UPDATE)
    const insertArray = [];
    const updateArray = [];

    recordsList.forEach((record) => {
      const recordName = String(
        record?.nombre_nota ?? record?.name ?? "",
      ).trim();
      if (!recordName && !record?.id_nota) return;
      const recordKey = record?.id_nota
        ? String(record?.id_nota)
        : `name:${recordName}`;
      const noteValue = values?.[recordKey] ?? values?.[recordName];

      if (!noteValue || String(noteValue).trim() === "") return;

      const percent = Number(record?.porcentaje ?? record?.porcentual) || 0;
      const noteNum = Number(noteValue);
      let notePercentageFinal = round2(noteNum * (percent / 100));
      if (finalInfo.isComplete) {
        notePercentageFinal = finalInfo.final;
      }

      const fk_student = Number(
        student?.id_estudiante ?? student?.id ?? student?.id_student,
      );
      const fk_note = record?.id_nota ? Number(record.id_nota) : undefined;

      // ¿El servidor ya tenía un registro para esta nota?
      const meta = noteMetaByStudent?.[studentKey]?.[recordKey];
      const hasServerRecord = Boolean(meta?.id_estudiante_nota);

      if (hasServerRecord) {
        // UPDATE: nota que ya existe en el servidor
        const updateItem = {
          id_estudiante_nota: meta.id_estudiante_nota,
          fk_student,
          fk_note,
          value_note: noteNum,
          nota_periodo_porcentual: notePercentageFinal,
          ...(selectedLogro ? { id_logro: Number(selectedLogro) } : {}),
          // recovery note por estudiante sigue igual para todas las notas
          ...(recoveryNote && String(recoveryNote).trim() !== ""
            ? { recovery_note: Number(recoveryNote) }
            : {}),
        };
        if (finalInfo.isComplete) updateItem.nota_final = finalInfo.final;
        updateArray.push(updateItem);
      } else {
        // INSERT: nota nueva que aún no tiene registro en el servidor
        const insertItem = {
          fk_student,
          fk_note,
          value_note: noteNum,
          goal_student: comment || "",
          note_percentage_final: notePercentageFinal,
          ...(selectedLogro ? { id_logro: Number(selectedLogro) } : {}),
          ...(recoveryNote && String(recoveryNote).trim() !== ""
            ? { recovery_note: Number(recoveryNote) }
            : {}),
        };
        if (finalInfo.isComplete) insertItem.final_note = finalInfo.final;
        insertArray.push(insertItem);
      }
    });

    if (insertArray.length === 0 && updateArray.length === 0) {
      notify.info("No hay notas para guardar en esta fila.");
      return;
    }

    // Mapear estado de beca del estudiante a fk_beca (fallback 1)
    const becaIdMap = { Activo: 1, Retirado: 0 };
    const fk_beca = student?.state_beca
      ? (becaIdMap[student.state_beca] ?? 1)
      : (student?.fk_beca ?? 1);

    try {
      setRowLoadingById((prev) => ({ ...prev, [studentKey]: true }));

      // Ejecutar INSERT y UPDATE en paralelo solo si cada array tiene elementos
      const ops = [];

      if (insertArray.length > 0) {
        const insertPayload = normalizeNumericInPayload({
          fk_grado: Number(gradeSelected),
          fk_sede: Number(sedeSelected),
          ...(fkInstitucion ? { fk_institucion: Number(fkInstitucion) } : {}),
          fk_beca: Number(fk_beca),
          ...(selectedTipo ? { fk_tipo_logro: Number(selectedTipo) } : {}),
          ...(selectedLogro ? { id_logro: Number(selectedLogro) } : {}),
          note_student: insertArray,
        });
        ops.push(saveAssignmentNotes(insertPayload));
      }

      if (updateArray.length > 0) {
        // el recovery_note ya está dentro de cada updateItem, no lo añadimos
        const updatePayload = normalizeNumericInPayload({
          fk_grado: Number(gradeSelected),
          fk_sede: Number(sedeSelected),
          ...(fkInstitucion ? { fk_institucion: Number(fkInstitucion) } : {}),
          fk_beca: Number(fk_beca),
          ...(selectedTipo ? { fk_tipo_logro: Number(selectedTipo) } : {}),
          ...(selectedLogro ? { id_logro: Number(selectedLogro) } : {}),
          note_student: updateArray,
        });
        ops.push(updateAssignmentNote(updatePayload));
      }

      await Promise.all(ops);

      // Recargar datos de la tabla
      await loadStudentsAndNotes();

      setRowInitialValuesById((prev) => ({
        ...prev,
        [studentKey]: { ...(values || {}) },
      }));
      setRowEditById((prev) => ({ ...prev, [studentKey]: false }));
      setRowSavedById((prev) => ({ ...prev, [studentKey]: true }));

      const modeLabel =
        insertArray.length > 0 && updateArray.length > 0
          ? `${insertArray.length} registradas, ${updateArray.length} actualizadas`
          : insertArray.length > 0
            ? "registradas"
            : "actualizadas";

      notify.success(`Notas ${modeLabel} para ${getStudentName(student)}`);

      setTimeout(() => {
        setRowSavedById((prev) => ({ ...prev, [studentKey]: false }));
      }, 3000);
    } catch (error) {
      console.error("Error guardando notas por fila:", error);
      notify.error("Error al guardar notas");
    } finally {
      setRowLoadingById((prev) => ({ ...prev, [studentKey]: false }));
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

  // Funciones para los botones de acciones
  const handleAdd = async (student) => {
    await saveStudentNotes(student, { action: "add" });
  };

  const handleEdit = useCallback(
    (student) => {
      const studentKey = getStudentKey(student);
      const isEditing = Boolean(rowEditById?.[studentKey]);

      if (isEditing) {
        // Cancelar edición: revertir a snapshot inicial
        setRecordValuesByStudent((prev) => ({
          ...prev,
          [studentKey]: rowInitialValuesById?.[studentKey] ?? {},
        }));
        setRowEditById((prev) => ({ ...prev, [studentKey]: false }));
        notify.info(`Edición cancelada para ${getStudentName(student)}`);
      } else {
        // Habilitar edición de la fila
        setRowEditById((prev) => ({ ...prev, [studentKey]: true }));

        // Siempre solicitar al servicio los tipos cuando se entra en modo edición
        // (asegura datos frescos para el select `Tipo de logro`).
        loadTipoLogroOptions(true)
          .catch((err) =>
            console.warn("loadTipoLogroOptions failed on edit:", err),
          )
          .finally(() => {
            // Si ya existe un `tipo` para este estudiante, cargar también sus `logros`
            const existingTipo =
              tipoByStudentRef.current?.[studentKey] ??
              tipoByStudent?.[studentKey];
            const existingLogros =
              logrosOptionsByStudentRef.current?.[studentKey] ?? [];

            if (
              existingTipo &&
              (!Array.isArray(existingLogros) || existingLogros.length === 0)
            ) {
              loadLogrosOptionsForStudent(studentKey, existingTipo, {
                preserveSelection: true,
              }).catch((err) =>
                console.warn(
                  "loadLogrosOptionsForStudent failed on edit:",
                  err,
                ),
              );
            }
          });
      }
    },
    [
      rowEditById,
      rowInitialValuesById,
      notify,
      loadTipoLogroOptions,
      loadLogrosOptionsForStudent,
    ],
  );

  // Mantener refs de handlers actualizados para las celdas
  handleAddRef.current = handleAdd;
  handleEditRef.current = handleEdit;

  // Definir las columnas para DataTable
  const tableColumns = useMemo(() => {
    const columns = [
      {
        id: "studentInfo",
        // accessorFn retorna texto plano para que búsqueda y exportación Excel funcionen
        accessorFn: (student) =>
          [
            getStudentName(student),
            student?.grado ?? student?.grade_scholar ?? "",
          ]
            .filter(Boolean)
            .join(" "),
        meta: { exportHeader: "Estudiante" },
        header: (
          <div className="lowercase first-letter:uppercase">Estudiante</div>
        ),
        cell: ({ row }) => {
          const student = row.original;
          const fullName = getStudentName(student);
          return (
            <div className="text-left p-3">
              <div className="font-medium">{fullName || "Estudiante"}</div>
              <div className="text-xs opacity-80">
                - Grado: {student?.grado || student?.grade_scholar || "-"}
              </div>
            </div>
          );
        },
      },
    ];

    // Agregar una columna por cada nota
    recordsList.forEach((r) => {
      const recordName = String(r?.nombre_nota ?? r?.name ?? "").trim();
      if (!recordName && !r?.id_nota) return;
      const recordKey = r?.id_nota ? String(r?.id_nota) : `name:${recordName}`;
      const porcentual = Number(r?.porcentaje ?? r?.porcentual);

      columns.push({
        id: recordKey,
        accessorFn: (student) => {
          const key = getStudentKey(student);
          const vals = recordValuesByStudentRef.current?.[key] ?? {};
          return vals?.[recordKey] ?? vals?.[recordName] ?? "";
        },
        meta: {
          exportHeader: recordName
            ? `${recordName}${Number.isFinite(porcentual) ? ` (${porcentual}%)` : ""}`
            : String(r?.id_nota),
        },
        header: (
          <div>
            <div className="lowercase first-letter:uppercase">
              {recordName || String(r?.id_nota)}
            </div>
            {Number.isFinite(porcentual) ? (
              <div className="text-xs opacity-90">{porcentual}%</div>
            ) : null}
          </div>
        ),
        cell: ({ row }) => {
          const student = row.original;
          const studentKey = getStudentKey(student);
          const studentValues =
            recordValuesByStudentRef.current?.[studentKey] ?? {};
          const value =
            studentValues?.[recordKey] ?? studentValues?.[recordName] ?? "";

          const editing = rowEditByIdRef.current?.[studentKey] !== false;
          return (
            <div className="p-2">
              <input
                type="number"
                min={0}
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
                onBlur={() => clampAndFormatNoteValue(studentKey, recordKey)}
                className="w-full p-2 border rounded bg-surface text-center tour-grade-input"
                placeholder="0.00"
                disabled={loadingDataRef.current || editing === false}
              />
            </div>
          );
        },
      });
    });

    // Columna de nota final
    columns.push({
      id: "final",
      accessorKey: "__notaFinal",
      meta: { exportHeader: "Nota Final" },
      header: <div className="lowercase first-letter:uppercase">Final</div>,
      cell: ({ row }) => {
        const student = row.original;
        const studentKey = getStudentKey(student);
        const studentValues =
          recordValuesByStudentRef.current?.[studentKey] ?? {};
        const finalInfo = computeFinalRecord(studentValues);

        const nota = parseFloat(finalInfo.final);
        const bgClass = !isNaN(nota)
          ? nota < 3
            ? "bg-red-100"
            : nota <= 3.5
              ? "bg-yellow-100"
              : "bg-green-100"
          : finalInfo.isComplete
            ? "bg-green-100"
            : "bg-yellow-100";

        return (
          <div className={`p-3 text-center ${bgClass} rounded`}>
            <div className="font-medium">{finalInfo.final}</div>
            <div className="text-xs opacity-80">
              {finalInfo.isComplete ? "Completo" : "Progreso"}
              {finalInfo.porcentualTotal !== 100 ? (
                <span className="opacity-80">
                  {" "}
                  · Total %: {finalInfo.porcentualTotal}
                </span>
              ) : null}
            </div>
          </div>
        );
      },
    });

    // Columna de nota de recuperación (solo periodo 4)
    if (String(periodSelected) === "4") {
      columns.push({
        id: "recovery",
        accessorFn: (student) =>
          recoveryNotesByIdRef.current?.[getStudentKey(student)] ?? "",
        meta: { exportHeader: "Recuperación" },
        header: (
          <div className="lowercase first-letter:uppercase">Recuperación</div>
        ),
        cell: ({ row }) => {
          const student = row.original;
          const studentKey = getStudentKey(student);
          const recoveryValue =
            recoveryNotesByIdRef.current?.[studentKey] ?? "";
          const editing = rowEditByIdRef.current?.[studentKey] !== false;

          return (
            <div className="p-2">
              <input
                type="number"
                min={0}
                max={5}
                step={0.01}
                value={recoveryValue}
                onChange={(e) =>
                  handleRecoveryNoteChange(
                    studentKey,
                    sanitizeGradeInput(e.target.value),
                  )
                }
                onBlur={() => clampAndFormatRecovery(studentKey)}
                className="w-full p-2 border rounded bg-surface text-center"
                placeholder="0.00"
                disabled={loadingDataRef.current || editing === false}
              />
            </div>
          );
        },
      });
    }

    // Columna de comentarios (ahora: tipo de logro + logro filtrado)
    columns.push({
      id: "comments",
      accessorFn: (student) => {
        const key = getStudentKey(student);
        const comment = commentsByIdRef.current?.[key] ?? "";
        if (comment) return comment;
        const selectedLogro = selectedLogroByStudentRef.current?.[key] ?? "";
        if (!selectedLogro) return "";
        const options = logrosOptionsByStudentRef.current?.[key] ?? [];
        const logro = options.find(
          (l) => String(l.id) === String(selectedLogro),
        );
        return logro?.descripcion ?? String(selectedLogro);
      },
      meta: { exportHeader: "Comentarios del docente" },
      header: (
        <div className="lowercase first-letter:uppercase">
          Comentarios del docente
        </div>
      ),
      cell: ({ row }) => {
        const student = row.original;
        const studentKey = getStudentKey(student);
        const comment = commentsByIdRef.current?.[studentKey] ?? "";
        const tipoValue = tipoByStudentRef.current?.[studentKey] ?? "";
        const logroOptions =
          logrosOptionsByStudentRef.current?.[studentKey] ?? [];
        const selectedLogro =
          selectedLogroByStudentRef.current?.[studentKey] ?? "";
        const loadingLogros = Boolean(
          loadingLogrosByStudentRef.current?.[studentKey],
        );

        // Detectar si la fila está en modo edición
        const editing = rowEditByIdRef.current?.[studentKey] !== false;

        // Comprobar si todas las notas del estudiante están presentes (finalInfo.isComplete)
        const studentValuesForCheck =
          recordValuesByStudentRef.current?.[studentKey] ?? {};
        const finalInfoForRow = computeFinalRecord(studentValuesForCheck);
        const selectsEnabled = Boolean(editing && finalInfoForRow?.isComplete);

        // MODO LECTURA: mostrar texto (comentario o logro) en lugar de los selects
        if (!editing) {
          const logroText = (
            Array.isArray(logroOptions)
              ? logroOptions.find((l) => String(l.id) === String(selectedLogro))
              : null
          )?.descripcion;

          const display =
            comment ||
            logroText ||
            (selectedLogro ? String(selectedLogro) : "-");

          return (
            <div className="p-2 text-sm text-gray-700 wrap-break-words">
              {display}
            </div>
          );
        }

        // Si estamos en modo edición pero NO hay todas las notas, no renderizar los selects
        if (!selectsEnabled) {
          return (
            <div className="p-2 text-sm text-gray-600">
              Completa todas las notas para habilitar Tipo/Logro
            </div>
          );
        }

        // MODO EDICIÓN + todas las notas completas: mostrar selects para tipo + logro
        return (
          <div className="p-2 flex flex-col gap-2">
            <select
              value={tipoValue}
              onChange={(e) =>
                handleTipoSelectForStudent(studentKey, e.target.value)
              }
              className="w-full min-w-[200px] p-2 border rounded bg-surface text-sm tour-tipo-logro"
              disabled={
                loadingDataRef.current || loadingTipoLogroOptionsRef.current
              }
            >
              <option value="">
                {loadingTipoLogroOptionsRef.current
                  ? "Cargando..."
                  : "-- Tipo de logro --"}
              </option>

              {/* Si no hay tipos y no está cargando, mostrar mensaje para el usuario */}
              {!loadingTipoLogroOptionsRef.current &&
                (!Array.isArray(tipoLogroOptionsRef.current) ||
                  tipoLogroOptionsRef.current.length === 0) && (
                  <option value="" disabled>
                    Sin tipos disponibles
                  </option>
                )}

              {Array.isArray(tipoLogroOptionsRef.current) &&
                tipoLogroOptionsRef.current.map((t) => (
                  <option
                    key={t.id_type_logro ?? t.id}
                    value={t.id_type_logro ?? t.id}
                  >
                    {t.nombre_tipo_logro || t.nombre || t.name}
                  </option>
                ))}
            </select>

            <select
              value={selectedLogro}
              onChange={(e) =>
                handleLogroSelectForStudent(studentKey, e.target.value)
              }
              className="w-full min-w-[200px] p-2 border rounded bg-surface text-sm tour-select-logro"
              disabled={
                loadingDataRef.current ||
                loadingLogros ||
                !(Array.isArray(logroOptions) && logroOptions.length > 0)
              }
            >
              <option value="">
                {loadingLogros
                  ? "Cargando logros..."
                  : "-- Selecciona logro --"}
              </option>
              {Array.isArray(logroOptions) &&
                logroOptions.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.descripcion}
                  </option>
                ))}
            </select>
          </div>
        );
      },
    });

    // Columna de acciones
    columns.push({
      id: "actions",
      header: <div className="lowercase first-letter:uppercase">Acciones</div>,
      cell: ({ row }) => {
        const student = row.original;
        const studentKey = getStudentKey(student);
        const rowLoading = Boolean(rowLoadingByIdRef.current?.[studentKey]);
        const editing = rowEditByIdRef.current?.[studentKey] !== false;
        const saved = Boolean(rowSavedByIdRef.current?.[studentKey]);
        return (
          <div className="p-3 flex gap-2 justify-center">
            {editing ? (
              <div className="w-10">
                <SimpleButton
                  type="button"
                  onClick={() => handleAddRef.current?.(student)}
                  icon={rowLoading ? "Loader2" : saved ? "Check" : "Save"}
                  bg={
                    rowLoading
                      ? "bg-gray-400"
                      : saved
                        ? "bg-green-700"
                        : "bg-green-600"
                  }
                  text="text-surface"
                  msjtooltip="Guardar"
                  tooltip={true}
                  className={`w-10 h-10 p-2 ${rowLoading ? "animate-spin" : ""} tour-save-row`}
                  disabled={rowLoading || loadingDataRef.current}
                />
              </div>
            ) : null}

            <div className="w-10">
              <SimpleButton
                type="button"
                onClick={() => handleEditRef.current?.(student)}
                icon={editing ? "X" : "Edit"}
                bg={editing ? "bg-error" : "bg-secondary"}
                text="text-surface"
                msjtooltip={editing ? "Cancelar" : "Editar"}
                tooltip={true}
                className={`w-10 h-10 p-2 tour-edit-row ${editing ? "" : ""}`}
                disabled={rowLoading || loadingDataRef.current}
              />
            </div>
          </div>
        );
      },
    });

    return columns;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    recordsList,
    handleRecordValueChange,
    handleCommentChange,
    handleRecoveryNoteChange,
    sanitizeGradeInput,
    periodSelected,
    // Forzar re-registro de columnas cuando tipos de logro carguen
    // (cell renderer lee refs, pero el useMemo debe reejecutarse para reflejar cambios)
    tipoLogroOptions,
  ]);

  // Preparar los datos para DataTable
  // Se incluye __notaFinal calculada para que el buscador global del DataTable la indexe correctamente
  const tableData = useMemo(() => {
    return (Array.isArray(filteredStudents) ? filteredStudents : []).map(
      (s) => {
        const finalInfo = computeFinalRecord(
          recordValuesByStudent?.[getStudentKey(s)] ?? {},
        );
        return {
          ...s,
          // Incluye nota y estado para que el buscador global del DataTable los indexe
          __notaFinal: `${finalInfo.final} ${finalInfo.isComplete ? "Completo" : "Progreso"}`,
        };
      },
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filteredStudents, recordValuesByStudent]);

  return (
    <div className=" p-2 w-full h-full gap-4 flex flex-col">
      {/* Global loader for row / data operations */}
      {(loadingDataRef.current ||
        Object.values(rowLoadingByIdRef.current || {}).some(Boolean)) && (
        <Loader
          message={loadingDataRef.current ? "Cargando..." : "Procesando..."}
          size={56}
        />
      )}

      <div className="w-full grid grid-cols-5 justify-between items-center  text-surface  rounded-lg">
        <h2 className="col-span-4 text-2xl font-bold"></h2>
        <SimpleButton
          type="button"
          onClick={tourRegisterStudentRecords}
          icon="HelpCircle"
          msjtooltip="Iniciar tutorial"
          noRounded={false}
          bg="bg-info"
          text="text-surface"
          className="w-auto px-3 py-1.5"
        />
      </div>

      <div
        id="tour-filters-students"
        className="grid grid-cols-1 md:grid-cols-5 gap-4"
      >
        <SedeSelect
          value={sedeSelected}
          onChange={handleSedeChange}
          className="w-full p-2 border rounded bg-surface"
          labelClassName="text-lg font-semibold"
          data={teacherSedeData}
          loading={loadingTeacherSedes}
        />

        {/* Orden para Docentes: Sede -> Grado -> Asignatura -> Jornada */}
        {isTeacher ? (
          <>
            <GradeSelector
              name="grade"
              label="Grado"
              labelClassName="text-lg font-semibold"
              value={gradeSelected}
              onChange={handleGradeChangeTeacher}
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
              useTeacherSubjects={
                !Boolean(asignatureSelected) && Boolean(gradeSelected)
              }
              sedeId={sedeSelected}
              idTeacher={idDocente}
              lockByAsignature={true}
            />
          </>
        ) : (
          /* Orden para No Docentes: Sede -> Jornada -> Asignatura -> Grado */
          <>
            <JourneySelect
              name="workday"
              label="Jornada"
              labelClassName="text-lg font-semibold"
              value={workdaySelected}
              onChange={handleWorkdayChangeNonTeacher}
              className="w-full p-2 border rounded bg-surface"
              filterValue={sedeWorkday}
              includeAmbas={false}
              disabled={!sedeSelected}
            />
            <AsignatureSelector
              name="asignature"
              label="Asignatura"
              labelClassName="text-lg font-semibold"
              value={asignatureSelected}
              onChange={handleAsignatureChangeNonTeacher}
              className="w-full p-2 border rounded bg-surface"
              sedeId={sedeSelected}
              workdayId={workdaySelected}
              disabled={!workdaySelected}
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
              disabled={!asignatureSelected}
            />
          </>
        )}

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
        <div className="p-4">
          <Loader message="Cargando estructura de notas y estudiantes..." />
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
          <div className="bg-surface border rounded">
            <div className="p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <div id="tour-students-count" className="text-sm opacity-80">
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

            <div id="tour-students-table" className="px-4">
              <DataTable
                data={tableData}
                columns={tableColumns}
                fileName="registro_notas_estudiantes"
                showDownloadButtons={false}
                pageSize={50}
              />
            </div>

            {/* Guardado por fila: usar botones en la columna "Acciones" */}
          </div>
        )}
      </div>
    </div>
  );
};

export default RegisterStudentRecords;
