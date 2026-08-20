import { useState, useEffect } from "react";
import SimpleButton from "../atoms/SimpleButton";
import FileChooser from "../atoms/FileChooser";
import useTeacher from "../../lib/hooks/useTeacher";
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

const emptyAnswer = () => ({ description_answer: "", correcta: false });

const initAnswersForType = (type) => {
  switch (type) {
    case "single":
    case "multiple":
      return [0, 1, 2, 3].map(() => emptyAnswer());
    case "boolean":
      return [
        { description_answer: "Verdadero", correcta: false },
        { description_answer: "Falso", correcta: false },
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
  answers: initAnswersForType("open"),
});

const normalizeQuestion = (q = {}) => {
  const fk = String(q.fk_type_question ?? "");
  const type = detectType(fk);
  const rawAnswers = Array.isArray(q.answer) ? q.answer : [];
  const answers =
    rawAnswers.length > 0
      ? rawAnswers.map((a) => ({
          description_answer: String(a.description_answer ?? ""),
          correcta: ["Correcto", "Correcta"].includes(
            String(a.incorrect_answer ?? ""),
          ),
        }))
      : initAnswersForType(type);
  return {
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
    answers,
  };
};

const ProfileEval = ({
  initialValues,
  onSave,
  onClose,
  fkTeacher,
  fkSede,
  fkGrade,
  fkAsignature,
  fkPeriodo,
  readOnly = false,
}) => {
  const { getTypeQuestion, getTypeElement } = useTeacher();
  const notify = useNotify();

  const [isEditing, setIsEditing] = useState(!readOnly);

  const [typeElements, setTypeElements] = useState([]);
  const [typeQuestions, setTypeQuestions] = useState([]);
  const [loadingTypes, setLoadingTypes] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [uploading, setUploading] = useState({});
  const [errors, setErrors] = useState({});

  const disabled = isSaving || (readOnly && !isEditing);

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
      const form = new FormData();
      form.append("file", file);
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

  const validateForm = () => {
    const next = {};
    if (!form.name_element || !String(form.name_element).trim())
      next.name_element = "El nombre de la evaluación es obligatorio.";
    if (!form.fk_type_element)
      next.fk_type_element = "Selecciona el tipo de evaluación.";
    if (form.questions.length === 0)
      next.questions = "Debes agregar al menos una pregunta.";

    form.questions.forEach((q, index) => {
      const type = detectType(q.fk_type_question);
      const qErrors = [];
      if (!q.fk_type_question) qErrors.push("Selecciona el tipo de respuesta.");
      if (!q.description_question || !String(q.description_question).trim())
        qErrors.push("La descripción de la pregunta es obligatoria.");

      if (type === "single") {
        const hasEmpty = q.answers.some(
          (a) => !String(a.description_answer).trim(),
        );
        if (hasEmpty) qErrors.push("Completa las 4 opciones de respuesta.");
        const correctas = q.answers.filter((a) => a.correcta).length;
        if (correctas !== 1)
          qErrors.push("Marca exactamente una opción como correcta.");
      } else if (type === "multiple") {
        const hasEmpty = q.answers.some(
          (a) => !String(a.description_answer).trim(),
        );
        if (hasEmpty) qErrors.push("Completa todas las opciones de respuesta.");
        const correctas = q.answers.filter((a) => a.correcta).length;
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
        const correctas = q.answers.filter((a) => a.correcta).length;
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
    fk_sede: toId(fkSede),
    fk_grade: toId(fkGrade),
    fk_asignature: toId(fkAsignature),
    fk_periodo: toId(fkPeriodo),
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

  const handleSubmit = async () => {
    if (!validateForm()) return;
    setIsSaving(true);
    try {
      const payload = buildPayload();
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
              <div className="grid grid-cols-12 items-center justify-between">
                <span className="font-semibold col-span-11">
                  Pregunta {index + 1}
                </span>
                {!(readOnly && !isEditing) && (
                  <SimpleButton
                    type="button"
                    onClick={() => removeQuestion(index)}
                    icon="Trash2"
                    bg="bg-error"
                    text="text-surface"
                    noRounded={false}
                    msjtooltip="Eliminar pregunta"
                  />
                )}
              </div>

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
                    {loadingTypes ? "Cargando tipos..." : "Selecciona el tipo"}
                  </option>
                  {typeQuestionOptions.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>

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
          {readOnly && !isEditing && (
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
                msj={isSaving ? "Registrando..." : "Registrar"}
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
