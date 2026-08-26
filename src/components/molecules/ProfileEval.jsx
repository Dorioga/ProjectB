import { useState, useEffect, useRef, useMemo } from "react";
import SimpleButton from "../atoms/SimpleButton";
import FileChooser from "../atoms/FileChooser";
import SedeSelect from "../atoms/SedeSelect";
import GradeSelector from "../atoms/GradeSelector";
import AsignatureSelector from "./AsignatureSelector";
import PeriodSelector from "../atoms/PeriodSelector";
import useTeacher from "../../lib/hooks/useTeacher";
import useAuth from "../../lib/hooks/useAuth";
import { useNotify } from "../../lib/hooks/useNotify";
import { upload } from "../../services/uploadService";

const QUESTION_TYPE = {
  SINGLE: "1",
  OPEN: "2",
  FILE: "3",
  BOOLEAN: "4",
  MULTIPLE: "5",
};

const detectType = (fkTypeQuestion) => {
  const v = String(fkTypeQuestion ?? "");
  if (v === QUESTION_TYPE.SINGLE) return "single";
  if (v === QUESTION_TYPE.FILE) return "file";
  if (v === QUESTION_TYPE.BOOLEAN) return "boolean";
  if (v === QUESTION_TYPE.MULTIPLE) return "multiple";
  return "open";
};

const toId = (v) => {
  if (v === "" || v == null) return v;
  const n = Number(v);
  return Number.isFinite(n) ? n : v;
};

const emptyAnswer = () => ({
  description_answer: "",
  correcta: false,
  state: "Activo",
});

const initAnswersForType = (type) => {
  switch (type) {
    case "single":
    case "multiple":
      return [0, 1, 2, 3].map(() => emptyAnswer());
    case "boolean":
      return [
        { description_answer: "Verdadero", correcta: false, state: "Activo" },
        { description_answer: "Falso", correcta: false, state: "Activo" },
      ];
    default:
      return [emptyAnswer()];
  }
};

const emptyQuestion = () => ({
  description_question: "",
  fk_type_question: "",
  url_file: "",
  minCorrectas: 1,
  maxCorrectas: "",
  state: "Activo",
  answers: initAnswersForType("open"),
});

const normalizeQuestion = (q = {}) => {
  const fk = String(q.fk_type_question ?? "");
  const type = detectType(fk);
  const rawAnswers = Array.isArray(q.answer) ? q.answer : [];
  const answers =
    rawAnswers.length > 0
      ? rawAnswers.map((a) => {
          const raw = String(a.incorrect_answer ?? "").trim();
          return {
            id_answer: toId(a.id_answer ?? null),
            description_answer: String(a.description_answer ?? ""),
            correcta: raw === "0" || ["Correcto", "Correcta"].includes(raw),
            state: "Activo",
          };
        })
      : initAnswersForType(type);
  return {
    id_ask: toId(q.id_ask ?? null),
    description_question: String(
      q.description_question ?? q.descripcion ?? "",
    ),
    fk_type_question: fk,
    url_file: String(q.url_file ?? ""),
    minCorrectas:
      q.minCorrectas != null && q.minCorrectas !== ""
        ? Number(q.minCorrectas)
        : 1,
    maxCorrectas:
      q.maxCorrectas != null && q.maxCorrectas !== ""
        ? Number(q.maxCorrectas)
        : "",
    state: "Activo",
    answers,
  };
};

const ProfileEval = ({
  initialValues,
  onSave,
  onClose,
  fkTeacher,
  readOnly = false,
  allowEdit = true,
  idElement: idElementProp = null,
}) => {
  const {
    getTypeQuestion,
    getTypeElement,
    getTeacherSede,
    getTeacherGrades,
    getTeacherSubjects,
  } = useTeacher();
  const { token, idSede, nameSede } = useAuth();
  const notify = useNotify();

  const idElement = toId(idElementProp ?? initialValues?.id_element ?? null);

  const [isEditing, setIsEditing] = useState(!readOnly);

  const [typeElements, setTypeElements] = useState([]);
  const [typeQuestions, setTypeQuestions] = useState([]);
  const [loadingTypes, setLoadingTypes] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [uploading, setUploading] = useState({});
  const [errors, setErrors] = useState({});

  const [sedeSelected, setSedeSelected] = useState("");
  const [grade, setGrade] = useState("");
  const [asignature, setAsignature] = useState("");
  const [period, setPeriod] = useState("");
  const [teacherSedes, setTeacherSedes] = useState([]);
  const [loadingTeacherSedes, setLoadingTeacherSedes] = useState(false);

  const disabled = isSaving || (readOnly && !isEditing);

  const isUpdate = idElement != null && idElement !== "";

  const [form, setForm] = useState(() => ({
    name_element: String(
      initialValues?.name_element ?? initialValues?.titulo ?? "",
    ),
    fk_type_element: String(
      initialValues?.fk_type_element ??
        initialValues?.tipo_evaluacion ??
        initialValues?.tipo ??
        "",
    ),
    questions: Array.isArray(initialValues?.question)
      ? initialValues.question.map(normalizeQuestion)
      : Array.isArray(initialValues?.preguntas)
        ? initialValues.preguntas.map(normalizeQuestion)
        : [],
  }));

  const initialQuestionsRef = useRef([]);
  useEffect(() => {
    const raw = Array.isArray(initialValues?.question)
      ? initialValues.question
      : Array.isArray(initialValues?.preguntas)
        ? initialValues.preguntas
        : [];
    initialQuestionsRef.current = raw.map(normalizeQuestion);
  }, [initialValues]);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoadingTypes(true);
      try {
        const [te, tq] = await Promise.all([
          getTypeElement(),
          getTypeQuestion(),
        ]);
        if (!mounted) return;
        setTypeElements(Array.isArray(te) ? te : (te?.data ?? []));
        setTypeQuestions(Array.isArray(tq) ? tq : (tq?.data ?? []));
      } catch (err) {
        console.error("ProfileEval - error cargando tipos:", err);
      } finally {
        if (mounted) setLoadingTypes(false);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, [getTypeElement, getTypeQuestion]);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      if (!fkTeacher || !getTeacherSede || !token) {
        if (mounted) setTeacherSedes([]);
        return;
      }
      if (mounted) setLoadingTeacherSedes(true);
      try {
        const res = await getTeacherSede({ idTeacher: Number(fkTeacher) });
        const list = Array.isArray(res) ? res : (res?.data ?? []);
        const mapped = (Array.isArray(list) ? list : [])
          .filter(Boolean)
          .map((s) => ({
            id: String(s?.id ?? s?.id_sede ?? "").trim(),
            name: String(s?.name ?? s?.nombre ?? s?.nombre_sede ?? "").trim(),
          }));
        if (mounted) setTeacherSedes(mapped || []);
      } catch (err) {
        console.error("ProfileEval - Error cargando sedes de docente:", err);
        if (mounted) setTeacherSedes([]);
      } finally {
        if (mounted) setLoadingTeacherSedes(false);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, [fkTeacher, getTeacherSede, token]);

  const teacherSedeData = useMemo(() => {
    if (teacherSedes.length) return teacherSedes;
    if (idSede && nameSede) return [{ id: idSede, name: nameSede }];
    return null;
  }, [teacherSedes, idSede, nameSede]);

  const teacherGradesParams = useMemo(
    () => ({
      ...(fkTeacher && { idTeacher: Number(fkTeacher) }),
      ...(sedeSelected ? { idSede: Number(sedeSelected) } : {}),
    }),
    [fkTeacher, sedeSelected],
  );

  const teacherSubjectsParams = useMemo(
    () =>
      grade && fkTeacher
        ? {
            idGrade: Number(grade),
            idTeacher: Number(fkTeacher),
          }
        : {},
    [grade, fkTeacher],
  );

  const typeElementOptions = (Array.isArray(typeElements) ? typeElements : [])
    .filter(Boolean)
    .filter((t) => !t.state || t.state === "Activo")
    .map((t) => ({
      id: t.id_type_element ?? t.id,
      name: t.nombre_type_element ?? t.nombre ?? t.name ?? "",
    }))
    .filter((t) => t.id && t.name);

  const typeQuestionOptions = (Array.isArray(typeQuestions) ? typeQuestions : [])
    .filter(Boolean)
    .filter((t) => !t.state || t.state === "Activo")
    .map((t) => ({
      id: t.id_type_question ?? t.id,
      name: t.nombre_type_question ?? t.nombre ?? t.name ?? "",
    }))
    .filter((t) => t.id && t.name);

  const handleNameElementChange = (e) => {
    const value = e.target.value;
    setForm((prev) => ({ ...prev, name_element: value }));
    setErrors((prev) => ({ ...prev, name_element: "" }));
  };

  const handleTypeElementChange = (e) => {
    const value = e.target.value;
    setForm((prev) => ({ ...prev, fk_type_element: value }));
    setErrors((prev) => ({ ...prev, fk_type_element: "" }));
  };

  const addQuestion = () => {
    setForm((prev) => ({
      ...prev,
      questions: [...prev.questions, emptyQuestion()],
    }));
    setErrors((prev) => ({ ...prev, questions: "" }));
  };

  const removeQuestion = (index) => {
    setForm((prev) => ({
      ...prev,
      questions: prev.questions.filter((_, i) => i !== index),
    }));
    setErrors((prev) => ({ ...prev, questions: "" }));
  };

  const updateQuestion = (index, patch) => {
    setForm((prev) => {
      const next = prev.questions.map((q, i) =>
        i === index ? { ...q, ...patch } : q,
      );
      return { ...prev, questions: next };
    });
    setErrors((prev) => {
      const next = { ...prev };
      delete next[`question-${index}`];
      delete next.questions;
      return next;
    });
  };

  const handleQuestionDescription = (index) => (e) => {
    updateQuestion(index, { description_question: e.target.value });
  };

  const handleTypeQuestion = (index) => (e) => {
    const fk = e.target.value;
    const type = detectType(fk);
    updateQuestion(index, {
      fk_type_question: fk,
      answers: initAnswersForType(type),
    });
  };

  const handleQuestionState = (index) => (e) => {
    updateQuestion(index, { state: e.target.value });
  };

  const extractUploadUrl = (res) => {
    const direct =
      res?.data?.url ??
      res?.data?.file_url ??
      res?.data?.url_file ??
      res?.url ??
      "";
    if (direct) return direct;

    if (Array.isArray(res?.data)) {
      const entry = res.data.find((e) => e?.field === "file") ?? res.data[0];
      const file = entry?.files?.[0];
      if (file?.fileName) {
        const folder = file.folder?.replace("/var/www", "") ?? "";
        return `https://www.nexusplataforma.com${folder}/${file.fileName}`;
      }
      if (entry?.url ?? entry?.url_file) return entry?.url ?? entry?.url_file;
    }
    return "";
  };

  const handleFileUpload = (index) => async (file) => {
    if (!file) return;
    setUploading((prev) => ({ ...prev, [index]: true }));
    try {
      const dot = file.name.lastIndexOf(".");
      const ext = dot >= 0 ? file.name.slice(dot) : "";
      const newName = `${fkTeacher}_${Date.now()}${ext}`;
      const renamed = new File([file], newName, { type: file.type });
      const form = new FormData();
      form.append("file", renamed);
      const res = await upload(form, "upload/elementos");
      const url = extractUploadUrl(res);
      updateQuestion(index, { url_file: url || String(file.name) });
      if (!url) {
        notify.warning(
          "El archivo se subió, pero no se pudo obtener la URL automáticamente.",
        );
      }
    } catch (err) {
      console.error("ProfileEval - upload error:", err);
      notify.error(err?.message || "Error al subir el archivo.");
    } finally {
      setUploading((prev) => ({ ...prev, [index]: false }));
    }
  };

  const handleMinCorrectas = (index) => (e) => {
    const v = e.target.value;
    updateQuestion(index, {
      minCorrectas: v === "" ? 1 : Math.max(1, Number(v) || 1),
    });
  };

  const handleMaxCorrectas = (index) => (e) => {
    const v = e.target.value;
    const max = v === "" ? "" : Number(v) || "";
    setForm((prev) => {
      const next = prev.questions.map((q, i) => {
        if (i !== index) return q;
        let correctas = 0;
        const answers = q.answers.map((a) => {
          if (a.correcta) {
            correctas += 1;
            if (max !== "" && correctas > max) {
              return { ...a, correcta: false };
            }
          }
          return a;
        });
        return { ...q, maxCorrectas: max, answers };
      });
      return { ...prev, questions: next };
    });
  };

  const handleOptionCount = (index) => (e) => {
    const count = Math.max(2, Number(e.target.value) || 2);
    setForm((prev) => {
      const next = prev.questions.map((q, i) => {
        if (i !== index) return q;
        const current = q.answers;
        if (current.length === count) return q;
        if (current.length < count) {
          return {
            ...q,
            answers: [
              ...current,
              ...Array.from({ length: count - current.length }, () =>
                emptyAnswer(),
              ),
            ],
          };
        }
        return { ...q, answers: current.slice(0, count) };
      });
      return { ...prev, questions: next };
    });
  };

  const updateAnswer = (qIndex, aIndex, patch) => {
    setForm((prev) => {
      const next = prev.questions.map((q, i) => {
        if (i !== qIndex) return q;
        const answers = q.answers.map((a, j) =>
          j === aIndex ? { ...a, ...patch } : a,
        );
        return { ...q, answers };
      });
      return { ...prev, questions: next };
    });
  };

  const handleAnswerText = (qIndex, aIndex) => (e) => {
    updateAnswer(qIndex, aIndex, { description_answer: e.target.value });
  };

  const handleAnswerCorrect = (qIndex, aIndex, exclusive) => (e) => {
    const checked = e.target.checked;
    const q = form.questions[qIndex];

    if (!exclusive && checked) {
      const correctas = q.answers.filter((a) => a.correcta).length;
      const max =
        q.maxCorrectas != null && q.maxCorrectas !== ""
          ? Number(q.maxCorrectas)
          : null;
      if (max != null && correctas >= max) {
        notify.warning(
          `Solo puedes marcar máximo ${max} opción(es) como correcta(s).`,
        );
        return;
      }
    }

    setForm((prev) => {
      const next = prev.questions.map((qq, i) => {
        if (i !== qIndex) return qq;
        const answers = qq.answers.map((a, j) => {
          if (exclusive) {
            return { ...a, correcta: j === aIndex && checked };
          }
          return { ...a, correcta: j === aIndex ? checked : a.correcta };
        });
        return { ...qq, answers };
      });
      return { ...prev, questions: next };
    });
  };

  const addAnswerOption = (qIndex) => {
    setForm((prev) => {
      const next = prev.questions.map((q, i) =>
        i === qIndex ? { ...q, answers: [...q.answers, emptyAnswer()] } : q,
      );
      return { ...prev, questions: next };
    });
  };

  const removeAnswerOption = (qIndex, aIndex) => {
    setForm((prev) => {
      const next = prev.questions.map((q, i) => {
        if (i !== qIndex) return q;
        const answers = q.answers.filter((_, j) => j !== aIndex);
        return { ...q, answers };
      });
      return { ...prev, questions: next };
    });
  };

  const handleAnswerState = (qIndex, aIndex) => (e) => {
    updateAnswer(qIndex, aIndex, { state: e.target.value });
  };

  const validateForm = () => {
    const next = {};
    if (!readOnly) {
      if (!sedeSelected) next.sede = "Selecciona la sede.";
      if (!grade) next.grade = "Selecciona el grado.";
      if (!asignature) next.asignature = "Selecciona la asignatura.";
      if (!period) next.period = "Selecciona el periodo.";
    }
    if (!form.name_element || !String(form.name_element).trim())
      next.name_element = "El nombre de la evaluación es obligatorio.";
    if (!form.fk_type_element)
      next.fk_type_element = "Selecciona el tipo de evaluación.";
    if (form.questions.length === 0)
      next.questions = "Debes agregar al menos una pregunta.";

    form.questions.forEach((q, index) => {
      if (q.state === "Inactivo") return;
      const type = detectType(q.fk_type_question);
      const activeAnswers = q.answers.filter((a) => a.state !== "Inactivo");
      const qErrors = [];
      if (!q.fk_type_question) qErrors.push("Selecciona el tipo de respuesta.");
      if (!q.description_question || !String(q.description_question).trim())
        qErrors.push("La descripción de la pregunta es obligatoria.");

      if (type === "single") {
        const hasEmpty = activeAnswers.some(
          (a) => !String(a.description_answer).trim(),
        );
        if (hasEmpty) qErrors.push("Completa las 4 opciones de respuesta.");
        const correctas = activeAnswers.filter((a) => a.correcta).length;
        if (correctas !== 1)
          qErrors.push("Marca exactamente una opción como correcta.");
      } else if (type === "multiple") {
        const hasEmpty = activeAnswers.some(
          (a) => !String(a.description_answer).trim(),
        );
        if (hasEmpty) qErrors.push("Completa todas las opciones de respuesta.");
        const correctas = activeAnswers.filter((a) => a.correcta).length;
        const min = q.minCorrectas != null ? Number(q.minCorrectas) : 1;
        const max =
          q.maxCorrectas != null && q.maxCorrectas !== ""
            ? Number(q.maxCorrectas)
            : null;
        if (correctas < min)
          qErrors.push(`Marca al menos ${min} opción(es) como correcta(s).`);
        if (max != null && correctas > max)
          qErrors.push(`Marca como máximo ${max} opción(es) como correcta(s).`);
      } else if (type === "boolean") {
        const correctas = activeAnswers.filter((a) => a.correcta).length;
        if (correctas !== 1)
          qErrors.push("Marca exactamente una opción como correcta.");
      } else if (type === "file") {
        if (!q.url_file || !String(q.url_file).trim())
          qErrors.push("El archivo de la pregunta es obligatorio.");
      }

      if (qErrors.length > 0) next[`question-${index}`] = qErrors.join(" · ");
    });

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const buildPayload = () => ({
    name_element: String(form.name_element || "").trim(),
    fk_teacher: toId(fkTeacher),
    fk_type_element: toId(form.fk_type_element),
    fk_sede: toId(sedeSelected),
    fk_grade: toId(grade),
    fk_asignature: toId(asignature),
    fk_period: toId(period),
    question: form.questions.map((q, index) => {
      const type = detectType(q.fk_type_question);
      const question = {
        name_question: `Pregunta ${index + 1}`,
        description_question: String(q.description_question || "").trim(),
        fk_type_question: toId(q.fk_type_question),
      };
      if (type === "file") {
        question.url_file = String(q.url_file || "").trim();
        question.answer = [{ description_answer: "", incorrect_answer: "" }];
      } else if (type === "open") {
        question.answer = [{ description_answer: "", incorrect_answer: "" }];
      } else {
        question.answer = q.answers.map((a) => ({
          description_answer: String(a.description_answer || "").trim(),
          incorrect_answer: a.correcta ? "Correcto" : "Incorrecto",
        }));
      }
      return question;
    }),
  });

  const buildUpdatePayload = () => {
    if (idElement == null || idElement === "") return null;

    const toIncorrect = (correcta) => (correcta ? "0" : "1");

    const initialQuestions = initialQuestionsRef.current || [];

    const findOriginal = (q) =>
      initialQuestions.find(
        (oq) => oq.id_ask != null && oq.id_ask === q.id_ask,
      );

    const answerChanged = (a, origA) => {
      if (!origA) return true;
      if (
        String(a.description_answer || "").trim() !==
        String(origA.description_answer || "").trim()
      )
        return true;
      if (Boolean(a.correcta) !== Boolean(origA.correcta)) return true;
      return false;
    };

    const questionChanged = (q, orig) => {
      if (!orig) return true;
      if (
        String(q.description_question || "").trim() !==
        String(orig.description_question || "").trim()
      )
        return true;
      if (
        String(q.url_file || "").trim() !==
        String(orig.url_file || "").trim()
      )
        return true;

      const type = detectType(q.fk_type_question);
      if (type === "file" || type === "open") return false;

      const origAnswers = Array.isArray(orig.answers) ? orig.answers : [];
      const origMap = new Map(
        origAnswers
          .filter((a) => a.id_answer != null && a.id_answer !== "")
          .map((a) => [a.id_answer, a]),
      );
      const currentIds = new Set(
        q.answers
          .filter((a) => a.id_answer != null && a.id_answer !== "")
          .map((a) => a.id_answer),
      );

      for (const a of q.answers) {
        if (a.state === "Inactivo") return true;
        if (a.id_answer == null || a.id_answer === "") return true;
        if (answerChanged(a, origMap.get(a.id_answer))) return true;
      }
      return origAnswers.some(
        (oa) =>
          oa.id_answer != null &&
          oa.id_answer !== "" &&
          !currentIds.has(oa.id_answer),
      );
    };

    const questionsDelete = form.questions
      .filter(
        (q) =>
          q.id_ask != null && q.id_ask !== "" && q.state === "Inactivo",
      )
      .map((q) => toId(q.id_ask));

    const questionsCreate = form.questions
      .filter(
        (q) =>
          (q.id_ask == null || q.id_ask === "") && q.state === "Activo",
      )
      .map((q) => {
        const type = detectType(q.fk_type_question);
        const question = {
          name_ask: `Pregunta ${form.questions.indexOf(q) + 1}`,
          description_ask: String(q.description_question || "").trim(),
          fk_type_ask: toId(q.fk_type_question),
          url_file:
            q.url_file && String(q.url_file).trim()
              ? String(q.url_file).trim()
              : null,
        };
        if (type === "file" || type === "open") {
          question.answers = [{ description_answer: "", incorrect_answer: "" }];
        } else {
          question.answers = q.answers
            .filter((a) => a.state === "Activo")
            .map((a) => ({
              description_answer: String(a.description_answer || "").trim(),
              incorrect_answer: toIncorrect(a.correcta),
            }));
        }
        return question;
      });

    const questionsUpdate = form.questions
      .filter(
        (q) =>
          q.id_ask != null && q.id_ask !== "" && q.state === "Activo",
      )
      .filter((q) => questionChanged(q, findOriginal(q)))
      .map((q) => {
        const orig = findOriginal(q);
        const type = detectType(q.fk_type_question);

        const descriptionChanged =
          !orig ||
          String(q.description_question || "").trim() !==
            String(orig.description_question || "").trim();
        const urlChanged =
          !orig ||
          String(q.url_file || "").trim() !==
            String(orig.url_file || "").trim();

        const question = { id_ask: toId(q.id_ask) };
        if (descriptionChanged) {
          question.description_ask = String(
            q.description_question || "",
          ).trim();
        }
        if (urlChanged && q.url_file && String(q.url_file).trim()) {
          question.url_file = String(q.url_file).trim();
        }

        if (type === "file" || type === "open") {
          question.answers = { create: [], update: [], delete: [] };
        } else {
          const origAnswers = Array.isArray(orig?.answers)
            ? orig.answers
            : [];
          const origMap = new Map(
            origAnswers
              .filter((a) => a.id_answer != null && a.id_answer !== "")
              .map((a) => [a.id_answer, a]),
          );
          const currentIds = new Set(
            q.answers
              .filter((a) => a.id_answer != null && a.id_answer !== "")
              .map((a) => a.id_answer),
          );

          question.answers = {
            create: q.answers
              .filter(
                (a) =>
                  (a.id_answer == null || a.id_answer === "") &&
                  a.state === "Activo",
              )
              .map((a) => ({
                description_answer: String(a.description_answer || "").trim(),
                incorrect_answer: toIncorrect(a.correcta),
              })),
            update: q.answers
              .filter(
                (a) =>
                  a.id_answer != null &&
                  a.id_answer !== "" &&
                  a.state === "Activo" &&
                  answerChanged(a, origMap.get(a.id_answer)),
              )
              .map((a) => ({
                id_answer: toId(a.id_answer),
                description_answer: String(a.description_answer || "").trim(),
                incorrect_answer: toIncorrect(a.correcta),
              })),
            delete: [
              ...q.answers
                .filter(
                  (a) =>
                    a.id_answer != null &&
                    a.id_answer !== "" &&
                    a.state === "Inactivo",
                )
                .map((a) => toId(a.id_answer)),
              ...origAnswers
                .filter(
                  (oa) =>
                    oa.id_answer != null &&
                    oa.id_answer !== "" &&
                    !currentIds.has(oa.id_answer),
                )
                .map((oa) => toId(oa.id_answer)),
            ],
          };
        }
        return question;
      });

    if (
      questionsCreate.length === 0 &&
      questionsUpdate.length === 0 &&
      questionsDelete.length === 0
    ) {
      return null;
    }

    return {
      id_element: idElement,
      element: {},
      questions: {
        create: questionsCreate,
        update: questionsUpdate,
        delete: questionsDelete,
      },
    };
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    setIsSaving(true);
    try {
      const payload = isUpdate ? buildUpdatePayload() : buildPayload();
      if (payload == null) {
        notify.info("No se detectaron cambios.");
        setErrors({});
        return;
      }
      if (typeof onSave === "function") {
        await onSave(payload);
      }
      setErrors({});
    } catch (err) {
      console.error("ProfileEval - save error:", err);
      throw err;
    } finally {
      setIsSaving(false);
    }
  };

  const renderAnswers = (q, index) => {
    const type = detectType(q.fk_type_question);
    if (type === "open") {
      return (
        <div className="w-full p-3 border rounded bg-surface text-sm text-gray-500">
          El estudiante responderá de forma abierta. No se configuran opciones.
        </div>
      );
    }
    if (type === "file") {
      return (
        <div className="flex flex-col gap-2">
          <label className="">Archivo</label>
          <FileChooser
            value=""
            onChange={handleFileUpload(index)}
            disabled={disabled || !!uploading[index]}
            label={uploading[index] ? "Subiendo..." : "Seleccionar archivo"}
          />
          <label className="">URL del archivo</label>
          <input
            name="url_file"
            value={q.url_file}
            readOnly
            disabled={disabled}
            className="w-full p-2 border rounded bg-surface"
            placeholder="URL del archivo a descargar por el estudiante"
          />
          {q.url_file && (
            <div className="text-sm text-gray-500">
              Archivo actual: <span className="break-all">{q.url_file}</span>
            </div>
          )}
        </div>
      );
    }

    const exclusive = type === "single" || type === "boolean";
    return (
      <div className="flex flex-col gap-2">
        {type === "multiple" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 p-2 border rounded bg-surface">
            <div>
              <label className="">N° de opciones</label>
              <input
                type="number"
                min={2}
                value={q.answers.length}
                onChange={handleOptionCount(index)}
                disabled={disabled}
                className="w-full p-2 border rounded bg-surface"
              />
            </div>
            <div>
              <label className="">Mín. correctas</label>
              <input
                type="number"
                min={1}
                value={q.minCorrectas}
                onChange={handleMinCorrectas(index)}
                disabled={disabled}
                className="w-full p-2 border rounded bg-surface"
              />
            </div>
            <div>
              <label className="">Máx. correctas</label>
              <input
                type="number"
                min={1}
                value={q.maxCorrectas}
                onChange={handleMaxCorrectas(index)}
                disabled={disabled}
                className="w-full p-2 border rounded bg-surface"
                placeholder="Sin límite"
              />
            </div>
          </div>
        )}
        <div
          className={
            type === "multiple"
              ? "grid grid-cols-1 md:grid-cols-2 gap-2"
              : "flex flex-col gap-2"
          }
        >
          {q.answers.map((a, aIndex) => (
            <div key={aIndex} className="flex items-center gap-2">
              {isUpdate && !(readOnly && !isEditing) && (
                <select
                  name={`state-answer-${index}-${aIndex}`}
                  value={a.state}
                  onChange={handleAnswerState(index, aIndex)}
                  disabled={disabled}
                  className="p-2 border rounded bg-surface text-sm"
                >
                  <option value="Activo">Activo</option>
                  <option value="Inactivo">Inactivo</option>
                </select>
              )}
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={a.correcta}
                  onChange={handleAnswerCorrect(index, aIndex, exclusive)}
                  disabled={disabled}
                  className="w-4 h-4"
                />
                Correcta
              </label>
              <input
                name={`answer-${index}-${aIndex}`}
                value={a.description_answer}
                onChange={handleAnswerText(index, aIndex)}
                disabled={disabled}
                className="w-full p-2 border rounded bg-surface"
                placeholder={`Opción ${aIndex + 1}`}
              />
              {type === "multiple" &&
                q.answers.length > 2 &&
                !isUpdate &&
                !(readOnly && !isEditing) && (
                  <SimpleButton
                    type="button"
                    onClick={() => removeAnswerOption(index, aIndex)}
                    icon="X"
                    bg="bg-error"
                    text="text-surface"
                    noRounded={false}
                    msjtooltip="Eliminar opción"
                  />
                )}
            </div>
          ))}
        </div>
        {type === "multiple" && !(readOnly && !isEditing) && (
          <div className="w-40">
            <SimpleButton
              type="button"
              onClick={() => addAnswerOption(index)}
              msj="Agregar opción"
              icon="Plus"
              bg="bg-secondary"
              text="text-surface"
              noRounded={false}
            />
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="w-full flex flex-col gap-4">
      {!readOnly && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
            {errors.sede && (
              <div className="text-sm text-red-600 mt-1">{errors.sede}</div>
            )}
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
            {errors.grade && (
              <div className="text-sm text-red-600 mt-1">{errors.grade}</div>
            )}
          </div>
          <div>
            <AsignatureSelector
              label="Asignatura"
              value={asignature}
              onChange={(e) => setAsignature(e.target.value)}
              placeholder="Selecciona asignatura"
              sedeId={sedeSelected}
              autoLoad={true}
              customFetchMethod={getTeacherSubjects}
              additionalParams={teacherSubjectsParams}
              disabled={!grade}
            />
            {errors.asignature && (
              <div className="text-sm text-red-600 mt-1">
                {errors.asignature}
              </div>
            )}
          </div>
          <div>
            <PeriodSelector
              label="Periodo"
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              autoLoad={true}
            />
            {errors.period && (
              <div className="text-sm text-red-600 mt-1">{errors.period}</div>
            )}
          </div>
        </div>
      )}

      <div id="tour-pe-titulo">
        <label className="">
          Nombre de la evaluación <span className="text-error">*</span>
        </label>
        <input
          name="name_element"
          value={form.name_element}
          onChange={handleNameElementChange}
          disabled={disabled}
          className="w-full p-2 border rounded bg-surface"
          placeholder="Ej: Examen sobre la IA"
        />
        {errors.name_element && (
          <div className="text-sm text-red-600 mt-1">{errors.name_element}</div>
        )}
      </div>

      <div id="tour-pe-tipo">
        <label className="">
          Tipo de evaluación <span className="text-error">*</span>
        </label>
        <select
          name="fk_type_element"
          value={form.fk_type_element}
          onChange={handleTypeElementChange}
          disabled={disabled || loadingTypes}
          className="w-full p-2 border rounded bg-surface"
        >
          <option value="">
            {loadingTypes ? "Cargando tipos..." : "Selecciona el tipo"}
          </option>
          {typeElementOptions.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </select>
        {errors.fk_type_element && (
          <div className="text-sm text-red-600 mt-1">
            {errors.fk_type_element}
          </div>
        )}
      </div>

      <div id="tour-pe-questions">
        <div className="flex items-center justify-between">
          <label className="font-bold">Preguntas</label>
          {!(readOnly && !isEditing) && (
            <div className="w-48 pb-2">
              <SimpleButton
                type="button"
                onClick={addQuestion}
                msj="Agregar pregunta"
                icon="Plus"
                bg="bg-secondary"
                text="text-surface"
                noRounded={false}
              />
            </div>
          )}
        </div>
        {errors.questions && (
          <div className="text-sm text-red-600 mt-1">{errors.questions}</div>
        )}

        {form.questions.length === 0 ? (
          <div className="w-full p-4 border rounded bg-surface text-sm text-gray-500">
            Aún no hay preguntas. Haz clic en "Agregar pregunta" para crear la
            primera.
          </div>
        ) : (
          form.questions.map((q, index) => (
            <div
              key={index}
              className="w-full p-4 border rounded bg-surface flex flex-col gap-3 mt-2"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-semibold">
                  Pregunta {index + 1}
                </span>
                {isUpdate && !(readOnly && !isEditing) ? (
                  <select
                    name={`state-question-${index}`}
                    value={q.state}
                    onChange={handleQuestionState(index)}
                    disabled={disabled}
                    className="p-2 border rounded bg-surface text-sm"
                  >
                    <option value="Activo">Activo</option>
                    <option value="Inactivo">Inactivo</option>
                  </select>
                ) : (
                  !(readOnly && !isEditing) && (
                    <SimpleButton
                      type="button"
                      onClick={() => removeQuestion(index)}
                      icon="Trash2"
                      bg="bg-error"
                      text="text-surface"
                      noRounded={false}
                      msjtooltip="Eliminar pregunta"
                    />
                  )
                )}
              </div>

              {isUpdate &&
                q.id_ask != null &&
                q.id_ask !== "" &&
                isEditing ? null : (
                  <div>
                    <label className="">
                      Tipo de respuesta <span className="text-error">*</span>
                    </label>
                    <select
                      name="fk_type_question"
                      value={q.fk_type_question}
                      onChange={handleTypeQuestion(index)}
                      disabled={disabled || loadingTypes}
                      className="w-full p-2 border rounded bg-surface"
                    >
                      <option value="">
                        {loadingTypes
                          ? "Cargando tipos..."
                          : "Selecciona el tipo"}
                      </option>
                      {typeQuestionOptions.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

              <div>
                <label className="">
                  Descripción <span className="text-error">*</span>
                </label>
                <input
                  name="description_question"
                  value={q.description_question}
                  onChange={handleQuestionDescription(index)}
                  disabled={disabled}
                  className="w-full p-2 border rounded bg-surface"
                  placeholder=""
                />
              </div>

              {q.fk_type_question ? (
                renderAnswers(q, index)
              ) : (
                <div className="w-full p-3 border rounded bg-surface text-sm text-gray-500">
                  Selecciona el tipo de respuesta para configurar la pregunta.
                </div>
              )}

              {errors[`question-${index}`] && (
                <div className="text-sm text-red-600">
                  {errors[`question-${index}`]}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {typeof onClose === "function" && (
        <div className="flex justify-center items-center gap-2">
          {readOnly && !isEditing && allowEdit && (
            <div className="w-40">
              <SimpleButton
                type="button"
                onClick={() => setIsEditing(true)}
                msj="Editar"
                icon="Edit"
                bg="bg-secondary"
                text="text-surface"
                noRounded={false}
              />
            </div>
          )}
          {typeof onSave === "function" && (readOnly ? isEditing : true) && (
            <div className="w-40">
              <SimpleButton
                type="button"
                onClick={handleSubmit}
                msj={
                  isSaving
                    ? "Guardando..."
                    : idElement != null && idElement !== ""
                      ? "Guardar"
                      : "Registrar"
                }
                icon="Save"
                bg="bg-secondary"
                text="text-surface"
                disabled={disabled}
              />
            </div>
          )}
          <div className="w-40">
            <SimpleButton
              type="button"
              onClick={onClose}
              msj={readOnly && !isEditing ? "Cerrar" : "Cancelar"}
              bg="bg-error"
              text="text-surface"
              noRounded={false}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileEval;
