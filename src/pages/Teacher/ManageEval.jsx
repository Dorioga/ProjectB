import { useState, useCallback, useEffect, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Modal from "../../components/atoms/Modal";
import DataTable from "../../components/atoms/DataTable";
import SimpleButton from "../../components/atoms/SimpleButton";
import Loader from "../../components/atoms/Loader";
import ProfileEval from "../../components/molecules/ProfileEval";
import SedeSelect from "../../components/atoms/SedeSelect";
import AsignatureSelector from "../../components/molecules/AsignatureSelector";
import GradeSelector from "../../components/atoms/GradeSelector";
import PeriodSelector from "../../components/atoms/PeriodSelector";
import useTeacher from "../../lib/hooks/useTeacher";
import { useNotify } from "../../lib/hooks/useNotify";
import useAuth from "../../lib/hooks/useAuth";
import tourManageEval from "../../tour/tourManageEval";

const buildElementDetail = (rows) => {
  const list = Array.isArray(rows) ? rows : [];
  const first = list[0] ?? {};
  const questionsMap = new Map();
  list.forEach((row) => {
    const key = row.id_ask ?? row.name_ask ?? row.description_ask ?? "";
    if (!questionsMap.has(key)) {
      questionsMap.set(key, {
        id_ask: row.id_ask ?? null,
        name_ask: row.name_ask ?? null,
        description_question: String(row.description_ask ?? ""),
        fk_type_question: String(row.id_type_ask ?? ""),
        url_file: String(row.url_file ?? ""),
        answer: [],
      });
    }
    questionsMap.get(key).answer.push({
      id_answer: row.id_answer ?? null,
      description_answer: String(row.description_answer ?? ""),
      incorrect_answer: String(row.incorrect_answer ?? ""),
    });
  });
  return {
    id_element: first.id_element ?? first.id_elemente ?? first.id ?? null,
    name_element: first.name_element ?? "",
    fk_type_element: String(first.id_type_element ?? ""),
    question: Array.from(questionsMap.values()),
  };
};

const buildStudentResult = (rows) => {
  const list = Array.isArray(rows) ? rows : [];
  const first = list[0] ?? {};
  const map = new Map();
  list.forEach((row) => {
    const key = row.id_ask ?? row.name_ask ?? row.description_ask ?? "";
    if (!map.has(key)) {
      map.set(key, {
        id_ask: row.id_ask ?? null,
        name_ask: row.name_ask ?? "",
        description_ask: String(row.description_ask ?? ""),
        url_file: String(row.url_file ?? ""),
        fk_type_ask: String(row.fk_type_ask ?? ""),
        name_type_ask: String(row.name_type_ask ?? ""),
        pendiente: row.pendiente ?? null,
        answers: [],
      });
    }
    map.get(key).answers.push({
      id_answer: row.id_answer ?? null,
      description_answer: String(row.description_answer ?? ""),
      incorrect_answer: String(row.incorrect_answer ?? ""),
      id_answer_student: row.id_answer_student ?? null,
      link_answer: row.link_answer ?? null,
      student_description_answer: row.student_description_answer ?? null,
      student_answer: Boolean(row.student_answer),
    });
  });
  return {
    id_element: first.id_element ?? first.id_elemente ?? null,
    name_element: first.name_element ?? "",
    name_type_element: first.name_type_element ?? "",
    note_answer_student: first.note_answer_student ?? null,
    questions: Array.from(map.values()),
  };
};

const ManageEval = () => {
  const {
    getElementQuestions,
    getElementStudent,
    getElementInstitution,
    getElementNotes,
    getElementStudentResult,
    createElement,
    updateElement,
    getElementData,
    getTeacherSede,
    getTeacherGrades,
    getTeacherSubjects,
  } = useTeacher();
  const {
    idSede,
    nameSede,
    idDocente,
    token,
    rol,
    idInstitution,
    idGrado,
    idEstudiante,
  } = useAuth();
  const notify = useNotify();
  const navigate = useNavigate();

  const getElementQuestionsRef = useRef(getElementQuestions);
  useEffect(() => {
    getElementQuestionsRef.current = getElementQuestions;
  }, [getElementQuestions]);
  const getElementStudentRef = useRef(getElementStudent);
  useEffect(() => {
    getElementStudentRef.current = getElementStudent;
  }, [getElementStudent]);
  const getElementInstitutionRef = useRef(getElementInstitution);
  useEffect(() => {
    getElementInstitutionRef.current = getElementInstitution;
  }, [getElementInstitution]);
  const getElementDataRef = useRef(getElementData);
  useEffect(() => {
    getElementDataRef.current = getElementData;
  }, [getElementData]);
  const getElementNotesRef = useRef(getElementNotes);
  useEffect(() => {
    getElementNotesRef.current = getElementNotes;
  }, [getElementNotes]);
  const getElementStudentResultRef = useRef(getElementStudentResult);
  useEffect(() => {
    getElementStudentResultRef.current = getElementStudentResult;
  }, [getElementStudentResult]);
  const handleViewEvalRef = useRef(null);
  const handleTakeEvalRef = useRef(null);
  const notifyRef = useRef(notify);
  useEffect(() => {
    notifyRef.current = notify;
  }, [notify]);

  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [detailData, setDetailData] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const [sedeSelected, setSedeSelected] = useState("");
  const [grade, setGrade] = useState("");
  const [asignature, setAsignature] = useState("");
  const [period, setPeriod] = useState("");

  const [adminFilters, setAdminFilters] = useState({
    tipo: "",
    docente: "",
    grupo: "",
    asignatura: "",
    periodo: "",
  });

  const [teacherSedes, setTeacherSedes] = useState([]);
  const [loadingTeacherSedes, setLoadingTeacherSedes] = useState(false);

  const [activeTab, setActiveTab] = useState("exams");
  const [noteSede, setNoteSede] = useState("");
  const [noteResults, setNoteResults] = useState([]);
  const [noteLoading, setNoteLoading] = useState(false);

  const [studentResult, setStudentResult] = useState(null);
  const [studentResultLoading, setStudentResultLoading] = useState(false);
  const handleViewStudentResultRef = useRef(null);

  const isDocente = useMemo(
    () => String(rol).toLowerCase() === "docente" || String(rol) === "7",
    [rol],
  );

  const isAdminInstitucional = useMemo(() => String(rol) === "3", [rol]);

  const isStudentOrGuardian = useMemo(
    () => ["5", "6"].includes(String(rol)),
    [rol],
  );

  const isGuardian = useMemo(() => String(rol) === "5", [rol]);

  const teacherGradesParams = useMemo(
    () => ({
      ...(idDocente && { idTeacher: Number(idDocente) }),
      ...(sedeSelected
        ? { idSede: Number(sedeSelected) }
        : { idSede: Number(idSede) }),
    }),
    [idDocente, sedeSelected, idSede],
  );

  const teacherSubjectsParams = useMemo(
    () =>
      grade && idDocente
        ? {
            idGrade: Number(grade),
            idTeacher: Number(idDocente),
          }
        : {},
    [grade, idDocente],
  );

  const teacherSedeData = useMemo(() => {
    if (!isDocente) return null;
    if (teacherSedes.length) return teacherSedes;
    if (idSede && nameSede) return [{ id: idSede, name: nameSede }];
    return null;
  }, [isDocente, idSede, nameSede, teacherSedes]);

  useEffect(() => {
    if (!isDocente) {
      setTeacherSedes([]);
      return;
    }
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
        const mapped = (Array.isArray(list) ? list : [])
          .filter(Boolean)
          .map((s) => ({
            id: String(s?.id ?? s?.id_sede ?? "").trim(),
            name: String(s?.name ?? s?.nombre ?? s?.nombre_sede ?? "").trim(),
          }));
        if (mounted) setTeacherSedes(mapped || []);
      } catch (err) {
        console.error("ManageEval - Error cargando sedes de docente:", err);
        if (mounted) setTeacherSedes([]);
      } finally {
        if (mounted) setLoadingTeacherSedes(false);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, [isDocente, idDocente, getTeacherSede, token]);

  const fkSede = sedeSelected || idSede;

  const filtersReady = Boolean(
    idDocente && fkSede && grade && period && asignature,
  );

  const studentFiltersReady = Boolean(fkSede && idGrado && period);

  const adminRowValue = (row, field) => {
    if (field === "tipo")
      return (
        row.name_type_element ??
        row.tipo ??
        row.tipo_evaluacion ??
        row.nombre_tipo_element ??
        row.fk_type_element ??
        ""
      );
    if (field === "docente")
      return row.docente ?? row.nombre_docente ?? row.nombre ?? "";
    if (field === "grupo") return row.grupo ?? row.grado_grupo ?? "";
    if (field === "asignatura")
      return row.nombre_asignatura ?? row.asignatura ?? "";
    if (field === "periodo") return row.nombre_periodo ?? row.periodo ?? "";
    return "";
  };

  const adminFilterOptions = useMemo(() => {
    const fields = ["tipo", "docente", "grupo", "asignatura", "periodo"];
    const opts = {};
    for (const field of fields) {
      const values = (Array.isArray(results) ? results : [])
        .map((r) => String(adminRowValue(r, field)).trim())
        .filter(Boolean);
      opts[field] = Array.from(new Set(values)).sort((a, b) =>
        a.localeCompare(b, "es", { sensitivity: "base" }),
      );
    }
    return opts;
  }, [results]);

  const filteredResults = useMemo(() => {
    const list = Array.isArray(results) ? results : [];
    const active = Object.keys(adminFilters).some(
      (k) => String(adminFilters[k] ?? "").trim() !== "",
    );
    if (!active) return list;
    return list.filter((row) =>
      Object.keys(adminFilters).every((field) => {
        const value = String(adminFilters[field] ?? "").trim();
        if (!value) return true;
        return String(adminRowValue(row, field)).trim() === value;
      }),
    );
  }, [results, adminFilters]);

  const handleAdminFilter = (field) => (e) => {
    setAdminFilters((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const resetAdminFilters = () =>
    setAdminFilters({ tipo: "", docente: "", grupo: "", asignatura: "", periodo: "" });

  const fetchEvaluations = useCallback(async () => {
    setLoading(true);
    try {
      let res;
      if (isAdminInstitucional) {
        res = await getElementInstitutionRef.current({
          institution: Number(idInstitution),
        });
      } else if (isStudentOrGuardian) {
        res = await getElementStudentRef.current({
          fk_sede: Number(fkSede),
          fk_grado: Number(idGrado),
          fk_period: Number(period),
          fk_student: Number(idEstudiante),
        });
      } else {
        res = await getElementQuestionsRef.current({
          fk_docente: Number(idDocente),
          fk_sede: Number(fkSede),
          fk_grado: Number(grade),
          fk_period: Number(period),
          fk_asignatura: Number(asignature),
        });
      }
      const data = Array.isArray(res) ? res : (res?.data ?? []);
      setResults(data);
      if (isAdminInstitucional) {
        resetAdminFilters();
      }
    } catch (err) {
      console.error("ManageEval - cargar evaluaciones error:", err);
      notifyRef.current.error(
        err?.message || "Error al cargar las evaluaciones.",
      );
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, [
    isAdminInstitucional,
    isStudentOrGuardian,
    idInstitution,
    idDocente,
    fkSede,
    grade,
    period,
    asignature,
  ]);

  useEffect(() => {
    if (isAdminInstitucional) {
      if (idInstitution) {
        fetchEvaluations();
      } else {
        setResults([]);
      }
      return;
    }
    if (isStudentOrGuardian) {
      if (studentFiltersReady) {
        fetchEvaluations();
      } else {
        setResults([]);
      }
      return;
    }
    if (!filtersReady) {
      setResults([]);
      return;
    }
    fetchEvaluations();
  }, [
    isAdminInstitucional,
    isStudentOrGuardian,
    idInstitution,
    studentFiltersReady,
    filtersReady,
    fetchEvaluations,
  ]);

  const isRealizado = (row) =>
    row.realizado === true ||
    String(row.realizado).toLowerCase() === "true";

  const columns = useMemo(() => {
    const accionesColumn = {
      id: "actions",
      header: "Acciones",
      cell: ({ row }) => {
        const alreadyDone =
          isStudentOrGuardian && !isGuardian && isRealizado(row.original);
        if (alreadyDone) return null;
        return (
          <div className="flex justify-center ">
            <SimpleButton
              type="button"
              onClick={() =>
                isStudentOrGuardian && !isGuardian
                  ? handleTakeEvalRef.current?.(row.original)
                  : handleViewEvalRef.current?.(row.original)
              }
              msj={isStudentOrGuardian && !isGuardian ? "Realizar examen" : "Ver"}
              icon="Eye"
              bg="bg-secondary"
              text="text-surface"
              noRounded={true}
              className="w-auto px-3 py-1.5"
            />
          </div>
        );
      },
    };

    if (isStudentOrGuardian) {
      return [
        {
          accessorKey: "name_element",
          header: "Nombre",
          accessorFn: (row) =>
            row.name_element ?? row.nombre_element ?? row.titulo ?? row.title ?? "",
        },
        {
          accessorKey: "name_type_element",
          header: "Tipo",
          accessorFn: (row) =>
            row.name_type_element ??
            row.tipo ??
            row.tipo_evaluacion ??
            row.nombre_tipo_element ??
            row.fk_type_element ??
            "",
        },
        {
          accessorKey: "group",
          header: "Grupo",
          accessorFn: (row) => row.group ?? row.grupo ?? row.grado_grupo ?? "",
        },
        {
          accessorKey: "name_subject",
          header: "Asignatura",
          accessorFn: (row) =>
            row.name_subject ?? row.nombre_asignatura ?? row.asignatura ?? "",
        },
        {
          accessorKey: "name_period",
          header: "Periodo",
          accessorFn: (row) =>
            row.name_period ?? row.nombre_periodo ?? row.periodo ?? "",
        },
        {
          accessorKey: "note_answer_student",
          header: "Calificación",
          accessorFn: (row) =>
            row.note_answer_student != null && row.note_answer_student !== ""
              ? row.note_answer_student
              : "Sin calificar",
        },
        {
          accessorKey: "realizado",
          header: "Estado",
          accessorFn: (row) => (isRealizado(row) ? "Realizado" : "Pendiente"),
          cell: (info) => {
            const label = info.getValue();
            const done = label === "Realizado";
            return (
              <span
                className={`px-2 py-1 block text-xs font-semibold ${
                  done
                    ? "bg-green-100 text-green-700"
                    : "bg-yellow-100 text-yellow-700"
                }`}
              >
                {label}
              </span>
            );
          },
        },
        ...(!isGuardian ? [accionesColumn] : []),
      ];
    }

    return [
      {
        accessorKey: "name_element",
        header: "Nombre",
        accessorFn: (row) =>
          row.name_element ?? row.nombre_element ?? row.titulo ?? row.title ?? "",
      },
      {
        accessorKey: "name_type_element",
        header: "Tipo",
        accessorFn: (row) =>
          row.name_type_element ??
          row.tipo ??
          row.tipo_evaluacion ??
          row.nombre_tipo_element ??
          row.fk_type_element ??
          "",
      },
      {
        accessorKey: "docente",
        header: "Docente",
        accessorFn: (row) =>
          row.docente ?? row.nombre_docente ?? row.nombre ?? "",
      },
      {
        accessorKey: "grupo",
        header: "Grupo",
        accessorFn: (row) => row.grupo ?? row.grado_grupo ?? "",
      },
      {
        accessorKey: "nombre_asignatura",
        header: "Asignatura",
        accessorFn: (row) => row.nombre_asignatura ?? row.asignatura ?? "",
      },
      {
        accessorKey: "nombre_periodo",
        header: "Periodo",
        accessorFn: (row) => row.nombre_periodo ?? row.periodo ?? "",
      },
      {
        accessorKey: "nombre_sede",
        header: "Sede",
        accessorFn: (row) => row.nombre_sede ?? row.sede ?? "",
      },
      accionesColumn,
    ];
  }, [isStudentOrGuardian, isGuardian]);

  const handleRegister = useCallback(
    async (payload) => {
      try {
        setLoading(true);
        await createElement(payload);
        notify.success("Evaluación registrada exitosamente.");
        setIsRegisterOpen(false);
        fetchEvaluations();
      } catch (err) {
        console.error("ManageEval - createElement error:", err);
        notify.error(err?.message || "Error al registrar la evaluación.");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [createElement, notify, fetchEvaluations],
  );

  const handleViewEval = useCallback(async (row) => {
    const id =
      row?.id_element ??
      row?.id_elemente ??
      row?.id ??
      row?.id_elemento ??
      row?.idelement;
    if (!id) {
      notifyRef.current.error("No se pudo identificar la evaluación.");
      return;
    }
    setDetailLoading(true);
    try {
      const res = await getElementDataRef.current({
        id_element: Number(id),
      });
      const data = Array.isArray(res) ? res : (res?.data ?? []);
      setDetailData(buildElementDetail(data));
    } catch (err) {
      console.error("ManageEval - getElementData error:", err);
      notifyRef.current.error(
        err?.message || "Error al cargar el detalle de la evaluación.",
      );
      setDetailData(null);
    } finally {
      setDetailLoading(false);
    }
  }, []);

  const handleUpdateEval = useCallback(
    async (payload) => {
      try {
        setLoading(true);
        await updateElement(payload);
        notify.success("Evaluación actualizada exitosamente.");
        setDetailData(null);
        fetchEvaluations();
      } catch (err) {
        console.error("ManageEval - updateElement error:", err);
        notify.error(err?.message || "Error al actualizar la evaluación.");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [updateElement, notify, fetchEvaluations],
  );

  const handleTakeEval = useCallback((row) => {
    const id =
      row?.id_element ??
      row?.id_elemente ??
      row?.id ??
      row?.id_elemento ??
      row?.idelement;
    if (!id) {
      notifyRef.current.error("No se pudo identificar la evaluación.");
      return;
    }
    navigate(`/dashboard/studentEval/${Number(id)}`);
  }, [navigate]);

  const fetchElementNotes = useCallback(async () => {
    if (!noteSede || !idDocente) return;
    setNoteLoading(true);
    try {
      const res = await getElementNotesRef.current({
        fk_teacher: Number(idDocente),
        fk_sede: Number(noteSede),
      });
      setNoteResults(Array.isArray(res) ? res : (res?.data ?? []));
    } catch (err) {
      console.error("ManageEval - getElementNotes error:", err);
      notifyRef.current.error(
        err?.message || "Error al cargar las notas de exámenes.",
      );
      setNoteResults([]);
    } finally {
      setNoteLoading(false);
    }
  }, [noteSede, idDocente]);

  useEffect(() => {
    if (noteSede && idDocente) {
      fetchElementNotes();
    }
  }, [noteSede, idDocente, fetchElementNotes]);

  const handleViewStudentResult = useCallback(async (row) => {
    const idElement = row?.id_elemente ?? row?.id_element ?? row?.id ?? null;
    const fkStudent = row?.id_estudiante ?? row?.fk_student ?? row?.fk_student ?? null;
    if (!idElement || !fkStudent) {
      notifyRef.current.error("No se pudo identificar el examen o el estudiante.");
      return;
    }
    setStudentResultLoading(true);
    setStudentResult(null);
    try {
      const res = await getElementStudentResultRef.current({
        id_element: Number(idElement),
        fk_student: Number(fkStudent),
      });
      const data = Array.isArray(res) ? res : (res?.data ?? []);
      setStudentResult(buildStudentResult(data));
    } catch (err) {
      console.error("ManageEval - getElementStudentResult error:", err);
      notifyRef.current.error(
        err?.message || "Error al cargar el resultado del examen.",
      );
      setStudentResult(null);
    } finally {
      setStudentResultLoading(false);
    }
  }, []);

  useEffect(() => {
    handleViewStudentResultRef.current = handleViewStudentResult;
  }, [handleViewStudentResult]);

  const noteColumns = useMemo(
    () => [
      {
        accessorKey: "nombre_estudiante",
        header: "Estudiante",
        accessorFn: (row) => row.nombre_estudiante ?? "",
      },
      {
        accessorKey: "name_element",
        header: "Examen",
        accessorFn: (row) => row.name_element ?? "",
      },
      {
        accessorKey: "grado",
        header: "Grado",
        accessorFn: (row) => row.grado ?? "",
      },
      {
        accessorKey: "nombre_asignatura",
        header: "Asignatura",
        accessorFn: (row) => row.nombre_asignatura ?? "",
      },
      {
        accessorKey: "nombre_periodo",
        header: "Periodo",
        accessorFn: (row) => row.nombre_periodo ?? "",
      },
      {
        accessorKey: "note_answer_student",
        header: "Nota",
        accessorFn: (row) =>
          row.note_answer_student != null && row.note_answer_student !== ""
            ? row.note_answer_student
            : "—",
      },
      {
        accessorKey: "pendiente",
        header: "Estado",
        cell: ({ row }) => {
          const p = String(row.original.pendiente ?? "").toLowerCase();
          let label = "No aplica";
          let cls = "bg-gray-100 text-gray-600";
          if (p === "pendiente") {
            label = "Por revisar";
            cls = "bg-yellow-100 text-yellow-700";
          } else if (p === "completo") {
            label = "Revisado";
            cls = "bg-green-100 text-green-700";
          }
          return (
            <span className={`px-2 py-1 block text-xs font-semibold ${cls}`}>
              {label}
            </span>
          );
        },
      },
      {
        id: "actions",
        header: "Acciones",
        cell: ({ row }) => (
          <div className="flex justify-center ">
            <SimpleButton
              type="button"
              onClick={() => handleViewStudentResultRef.current?.(row.original)}
              msj="Ver"
              icon="Eye"
              bg="bg-secondary"
              text="text-surface"
              noRounded={true}
              className="w-auto px-3 py-1.5"
            />
          </div>
        ),
      },
    ],
    [],
  );

  useEffect(() => {
    handleTakeEvalRef.current = handleTakeEval;
  }, [handleTakeEval]);

  useEffect(() => {
    handleViewEvalRef.current = handleViewEval;
  }, [handleViewEval]);

  return (
    <div className="p-6 h-full gap-4 flex flex-col">
      <div
        id="tour-me-header"
        className="w-full grid gap-2 grid-cols-1 lg:grid-cols-5 xl:grid-cols-4 justify-between items-center bg-primary text-surface p-3 rounded-lg"
      >
        <div className="lg:col-span-3 xl:col-span-2 flex items-center">
          <h2 className="text-2xl font-bold">Gestión de Evaluaciones</h2>
        </div>
        <div
          id="tour-me-add-btn"
          className="grid grid-cols-2 col-span-2 xl:col-span-2 gap-2"
        >
          {!isAdminInstitucional && !isStudentOrGuardian && (
            <SimpleButton
              onClick={() => setIsRegisterOpen(true)}
              msj="Registrar evaluación"
              icon="Plus"
              bg="bg-secondary"
              text="text-surface"
            />
          )}
          <SimpleButton
            type="button"
            onClick={tourManageEval}
            icon="HelpCircle"
            msjtooltip="Iniciar tutorial"
            noRounded={false}
            bg="bg-info"
            text="text-surface"
            className="w-auto px-3 py-1.5"
          />
        </div>
      </div>

      {isDocente ? (
        <>
          <div className="flex gap-0 border-b border-gray-300">
            <button
              type="button"
              onClick={() => setActiveTab("exams")}
              className={`px-5 py-2 text-sm font-semibold transition-colors rounded-tl rounded-tr cursor-pointer ${
                activeTab === "exams"
                  ? "bg-primary text-white border-2 border-primary"
                  : "bg-secondary text-primary hover:bg-gray-100"
              }`}
            >
              Exámenes
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("notes")}
              className={`px-5 py-2 text-sm font-semibold transition-colors rounded-tl rounded-tr cursor-pointer ${
                activeTab === "notes"
                  ? "bg-primary text-white border-2 border-primary"
                  : "bg-secondary text-primary hover:bg-gray-100"
              }`}
            >
              Calificar
            </button>
          </div>

          {activeTab === "exams" && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-2">
                <div>
                  <SedeSelect
                    value={sedeSelected}
                    onChange={(e) => {
                      setSedeSelected(e.target.value);
                      setGrade("");
                      setAsignature("");
                    }}
                    data={teacherSedeData}
                    loading={loadingTeacherSedes}
                  />
                </div>
                <div>
                  <GradeSelector
                    label="Grado"
                    value={grade}
                    onChange={(e) => {
                      setGrade(e.target.value);
                      setAsignature("");
                    }}
                    placeholder="Selecciona grado"
                    sedeId={sedeSelected}
                    autoLoad={true}
                    customFetchMethod={getTeacherGrades}
                    additionalParams={teacherGradesParams}
                    disabled={!sedeSelected}
                  />
                </div>
                <div>
                  <AsignatureSelector
                    label="Asignatura"
                    value={asignature}
                    onChange={(e) => setAsignature(e.target.value)}
                    placeholder="Selecciona asignatura"
                    sedeId={fkSede}
                    autoLoad={true}
                    customFetchMethod={getTeacherSubjects}
                    additionalParams={teacherSubjectsParams}
                    disabled={!grade}
                  />
                </div>
                <div>
                  <PeriodSelector
                    label="Periodo"
                    value={period}
                    onChange={(e) => setPeriod(e.target.value)}
                    autoLoad={true}
                  />
                </div>
              </div>

              <div id="tour-me-table" className="relative flex-1 ">
                <DataTable
                  data={results || []}
                  columns={columns}
                  fileName="Export_Evaluaciones"
                  initialSorting={[{ id: "name_element", desc: false }]}
                  loading={loading}
                  loaderMessage="Cargando evaluaciones..."
                />
              </div>
            </>
          )}

          {activeTab === "notes" && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-2">
                <div>
                  <SedeSelect
                    label="Sede"
                    value={noteSede}
                    onChange={(e) => setNoteSede(e.target.value)}
                    data={teacherSedeData}
                    loading={loadingTeacherSedes}
                  />
                </div>
              </div>

              <div id="tour-me-table" className="relative flex-1 ">
                <DataTable
                  data={noteResults || []}
                  columns={noteColumns}
                  fileName="Notas_Examenes"
                  groupBy="grado"
                  loading={noteLoading}
                  loaderMessage="Cargando notas de exámenes..."
                />
              </div>
            </>
          )}
        </>
      ) : isStudentOrGuardian ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4 mt-2 max-w-lg">
            <div>
              <PeriodSelector
                label="Periodo"
                value={period}
                onChange={(e) => {
                  setPeriod(e.target.value);
                }}
                autoLoad={true}
              />
            </div>
          </div>

          <div id="tour-me-table" className="relative flex-1 ">
            <DataTable
              data={results || []}
              columns={columns}
              fileName="Export_Evaluaciones"
              initialSorting={[{ id: "name_element", desc: false }]}
              loading={loading}
              loaderMessage="Cargando evaluaciones..."
              groupBy="realizado"
              groupOrder={["Pendiente", "Realizado"]}
              groupHeaderClassName={(key) =>
                key === "Pendiente"
                  ? "bg-yellow-100 border-b cursor-pointer select-none hover:bg-yellow-200 transition-colors"
                  : key === "Realizado"
                    ? "bg-green-100 border-b cursor-pointer select-none hover:bg-green-200 transition-colors"
                    : "bg-blue-50 border-b cursor-pointer select-none hover:bg-blue-100 transition-colors"
              }
            />
          </div>
        </>
      ) : isAdminInstitucional ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 mt-2">
          <div>
            <label className="">Tipo</label>
            <select
              name="filter-tipo"
              value={adminFilters.tipo}
              onChange={handleAdminFilter("tipo")}
              className="w-full p-2 border rounded bg-surface"
            >
              <option value="">Todos</option>
              {adminFilterOptions.tipo.map((v) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="">Docente</label>
            <select
              name="filter-docente"
              value={adminFilters.docente}
              onChange={handleAdminFilter("docente")}
              className="w-full p-2 border rounded bg-surface"
            >
              <option value="">Todos</option>
              {adminFilterOptions.docente.map((v) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="">Grupo</label>
            <select
              name="filter-grupo"
              value={adminFilters.grupo}
              onChange={handleAdminFilter("grupo")}
              className="w-full p-2 border rounded bg-surface"
            >
              <option value="">Todos</option>
              {adminFilterOptions.grupo.map((v) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="">Asignatura</label>
            <select
              name="filter-asignatura"
              value={adminFilters.asignatura}
              onChange={handleAdminFilter("asignatura")}
              className="w-full p-2 border rounded bg-surface"
            >
              <option value="">Todos</option>
              {adminFilterOptions.asignatura.map((v) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="">Periodo</label>
            <select
              name="filter-periodo"
              value={adminFilters.periodo}
              onChange={handleAdminFilter("periodo")}
              className="w-full p-2 border rounded bg-surface"
            >
              <option value="">Todos</option>
              {adminFilterOptions.periodo.map((v) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div id="tour-me-table" className="relative flex-1 ">
          <DataTable
            data={filteredResults}
            columns={columns}
            fileName="Export_Evaluaciones"
            initialSorting={[{ id: "name_element", desc: false }]}
            loading={loading}
            loaderMessage="Cargando evaluaciones..."
          />
        </div>
        </>
      ) : null}

      <Modal
        isOpen={isRegisterOpen}
        onClose={() => setIsRegisterOpen(false)}
        title="Registrar evaluación"
        size="7xl"
      >
        <ProfileEval
          onSave={handleRegister}
          onClose={() => setIsRegisterOpen(false)}
          fkTeacher={idDocente}
        />
      </Modal>

      <Modal
        isOpen={!!detailData}
        onClose={() => setDetailData(null)}
        title="Detalle de la evaluación"
        size="7xl"
      >
        {detailLoading ? (
          <Loader message="Cargando detalle..." />
        ) : detailData ? (
          <ProfileEval
            readOnly
            initialValues={detailData}
            onSave={handleUpdateEval}
            onClose={() => setDetailData(null)}
            allowEdit={!isAdminInstitucional}
          />
        ) : null}
      </Modal>

      <Modal
        isOpen={!!studentResult}
        onClose={() => setStudentResult(null)}
        title="Resultado del examen"
        size="7xl"
      >
        {studentResultLoading ? (
          <Loader message="Cargando resultado..." />
        ) : studentResult ? (
          <div className="flex flex-col gap-4">
            <div className="w-full bg-primary text-surface p-3 rounded-lg">
              <h2 className="text-2xl font-bold">{studentResult.name_element}</h2>
              {studentResult.name_type_element && (
                <div className="text-sm opacity-90">
                  {studentResult.name_type_element}
                </div>
              )}
              <div className="text-sm">
                Nota:{" "}
                {studentResult.note_answer_student != null &&
                studentResult.note_answer_student !== ""
                  ? studentResult.note_answer_student
                  : "Sin calificar"}
              </div>
            </div>

            {studentResult.questions.length === 0 ? (
              <div className="w-full p-4 border rounded bg-surface text-sm text-gray-500">
                Sin preguntas.
              </div>
            ) : (
              studentResult.questions.map((q) => (
                <div
                  key={q.id_ask ?? q.name_ask}
                  className="w-full p-4 border rounded bg-surface flex flex-col gap-3"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold">
                      {q.name_ask || "Pregunta"}
                    </span>
                    {q.name_type_ask && (
                      <span className="text-xs px-2 py-1 rounded bg-secondary text-surface">
                        {q.name_type_ask}
                      </span>
                    )}
                  </div>
                  <div className="text-sm">{q.description_ask}</div>

                  {q.fk_type_ask === "2" ? (
                    <div className="text-sm border rounded bg-surface p-2">
                      Respuesta del estudiante:{" "}
                      <span className="font-medium">
                        {q.answers[0]?.student_description_answer ??
                          "Sin respuesta abierta"}
                      </span>
                    </div>
                  ) : q.fk_type_ask === "3" ? (
                    <div className="text-sm border rounded bg-surface p-2 break-all">
                      Archivo del estudiante:{" "}
                      {q.answers[0]?.link_answer ? (
                        <a
                          href={q.answers[0].link_answer}
                          target="_blank"
                          rel="noreferrer"
                          className="text-primary underline"
                        >
                          {q.answers[0].link_answer}
                        </a>
                      ) : (
                        "Sin link"
                      )}
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-2">
                      {q.answers.map((a) => {
                        const isCorrect =
                          String(a.incorrect_answer).toLowerCase() ===
                          "correcto";
                        return (
                          <div
                            key={a.id_answer ?? a.description_answer}
                            className={`flex items-center gap-2 rounded p-2 ${
                              a.student_answer
                                ? "bg-green-100"
                                : "bg-gray-50"
                            }`}
                          >
                            <span className="text-sm flex-1">
                              {a.description_answer}
                            </span>
                            {isCorrect && (
                              <span className="text-xs px-2 py-0.5 rounded bg-blue-100 text-blue-700 font-semibold">
                                Correcta
                              </span>
                            )}
                            {a.student_answer && (
                              <span className="text-xs px-2 py-0.5 rounded bg-green-200 text-green-800 font-semibold">
                                Elegida
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  <div className="text-sm">
                    Estado:{" "}
                    {String(q.pendiente ?? "").toLowerCase() === "pendiente" ? (
                      <span className="px-2 py-0.5 rounded text-xs font-semibold bg-yellow-100 text-yellow-700">
                        Por revisar
                      </span>
                    ) : String(q.pendiente ?? "").toLowerCase() === "completo" ? (
                      <span className="px-2 py-0.5 rounded text-xs font-semibold bg-green-100 text-green-700">
                        Revisado
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded text-xs font-semibold bg-gray-100 text-gray-600">
                        No aplica
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        ) : null}
      </Modal>
    </div>
  );
};

export default ManageEval;
