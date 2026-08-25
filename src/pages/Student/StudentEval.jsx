import { useState, useEffect, useMemo, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Loader from "../../components/atoms/Loader";
import SimpleButton from "../../components/atoms/SimpleButton";
import FileChooser from "../../components/atoms/FileChooser";
import useTeacher from "../../lib/hooks/useTeacher";
import useAuth from "../../lib/hooks/useAuth";
import { useNotify } from "../../lib/hooks/useNotify";
import { upload } from "../../services/uploadService";

const QUESTIONS_PER_PAGE = 5;

const buildExam = (rows) => {
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
        id_type_ask: String(row.id_type_ask ?? ""),
        name_type_ask: String(row.name_type_ask ?? ""),
        answers: [],
      });
    }
    if (row.id_answer != null || row.description_answer != null) {
      map.get(key).answers.push({
        id_answer: row.id_answer ?? null,
        description_answer: String(row.description_answer ?? ""),
      });
    }
  });
  return {
    id_element: first.id_element ?? first.id_elemente ?? null,
    name_element: first.name_element ?? "",
    name_type_element: first.name_type_element ?? "",
    questions: Array.from(map.values()),
  };
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

const StudentEval = () => {
  const { idElement } = useParams();
  const navigate = useNavigate();
  const { getElementStudentData, saveElementStudentAnswer } = useTeacher();
  const { idEstudiante } = useAuth();
  const notify = useNotify();

  const [exam, setExam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [answers, setAnswers] = useState({});
  const [uploading, setUploading] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [page, setPage] = useState(0);
  const [selectedFiles, setSelectedFiles] = useState({});
  const [previewUrls, setPreviewUrls] = useState({});
  const previewUrlsRef = useRef({});

  useEffect(() => {
    return () => {
      Object.values(previewUrlsRef.current).forEach((u) => {
        if (u) URL.revokeObjectURL(u);
      });
      previewUrlsRef.current = {};
    };
  }, []);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(null);
    setPage(0);
    getElementStudentData({ id_element: Number(idElement) })
      .then((res) => {
        if (!mounted) return;
        const data = Array.isArray(res) ? res : (res?.data ?? []);
        setExam(buildExam(data));
      })
      .catch((err) => {
        if (!mounted) return;
        setError(err?.message || "Error al cargar el examen.");
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, [idElement, getElementStudentData]);

  const groupedQuestions = useMemo(() => {
    if (!exam) return [];
    return (exam.questions || []).map((q, index) => ({
      ...q,
      displayName: `Pregunta ${index + 1}`,
    }));
  }, [exam]);

  const totalPages = Math.max(
    1,
    Math.ceil(groupedQuestions.length / QUESTIONS_PER_PAGE),
  );
  const currentPageQuestions = groupedQuestions.slice(
    page * QUESTIONS_PER_PAGE,
    page * QUESTIONS_PER_PAGE + QUESTIONS_PER_PAGE,
  );
  const isLastPage = page === totalPages - 1;

  const isAnswered = (q) => {
    const a = answers[q.id_ask];
    const type = q.id_type_ask;
    if (type === "1" || type === "4")
      return Boolean(a && a.id_answer != null);
    if (type === "5")
      return Boolean(a && a.id_answers && a.id_answers.length > 0);
    if (type === "3")
      return Boolean(a && String(a.url_file || "").trim());
    if (type === "2")
      return Boolean(a && String(a.description_answer || "").trim());
    return false;
  };

  const answeredCount = groupedQuestions.filter(isAnswered).length;
  const allAnswered =
    groupedQuestions.length > 0 &&
    answeredCount === groupedQuestions.length;
  const progressPercent =
    groupedQuestions.length > 0
      ? Math.round((answeredCount / groupedQuestions.length) * 100)
      : 0;

  const handleRadio = (q) => (e) => {
    const idAnswer = Number(e.target.value);
    setAnswers((prev) => ({
      ...prev,
      [q.id_ask]: { type: "single", id_ask: q.id_ask, id_answer: idAnswer },
    }));
  };

  const handleCheck = (q, idAnswer) => (e) => {
    const checked = e.target.checked;
    const id = Number(idAnswer);
    setAnswers((prev) => {
      const current = prev[q.id_ask];
      const ids = current?.id_answers ? [...current.id_answers] : [];
      const idx = ids.indexOf(id);
      if (checked && idx === -1) ids.push(id);
      if (!checked && idx !== -1) ids.splice(idx, 1);
      return {
        ...prev,
        [q.id_ask]: { type: "multiple", id_ask: q.id_ask, id_answers: ids },
      };
    });
  };

  const handleText = (q) => (e) => {
    setAnswers((prev) => ({
      ...prev,
      [q.id_ask]: {
        type: "open",
        id_ask: q.id_ask,
        description_answer: e.target.value,
      },
    }));
  };

  const handleSelectFile = (q) => (file) => {
    if (!file) return;
    setPreviewUrls((prev) => {
      if (prev[q.id_ask]) URL.revokeObjectURL(prev[q.id_ask]);
      const url = URL.createObjectURL(file);
      previewUrlsRef.current[q.id_ask] = url;
      return { ...prev, [q.id_ask]: url };
    });
    setSelectedFiles((prev) => ({ ...prev, [q.id_ask]: file }));
    setAnswers((prev) => {
      const next = { ...prev };
      if (next[q.id_ask]) {
        next[q.id_ask] = { type: "file", id_ask: q.id_ask, url_file: "" };
      }
      return next;
    });
  };

  const handlePreview = (q) => () => {
    const url = previewUrls[q.id_ask];
    if (url) window.open(url, "_blank");
  };

  const handleUploadFile = (q) => async () => {
    const file = selectedFiles[q.id_ask];
    if (!file) {
      notify.warning("Selecciona primero un archivo.");
      return;
    }
    setUploading((prev) => ({ ...prev, [q.id_ask]: true }));
    try {
      const pad = (n) => String(n).padStart(2, "0");
      const now = new Date();
      const time = `${pad(now.getHours())}${pad(now.getMinutes())}${pad(
        now.getSeconds(),
      )}`;
      const dot = file.name.lastIndexOf(".");
      const ext = dot >= 0 ? file.name.slice(dot) : "";
      const newName = `${idElement}_${idEstudiante}_${time}${ext}`;
      const renamed = new File([file], newName, { type: file.type });

      const form = new FormData();
      form.append("file", renamed);
      const res = await upload(form, "upload/elementos");
      const url = extractUploadUrl(res);
      if (!url) {
        notify.warning(
          "El archivo se subió, pero no se pudo obtener la URL automáticamente.",
        );
        return;
      }
      setAnswers((prev) => ({
        ...prev,
        [q.id_ask]: { type: "file", id_ask: q.id_ask, url_file: url },
      }));
    } catch (err) {
      console.error("StudentEval - upload error:", err);
      notify.error(err?.message || "Error al subir el archivo.");
    } finally {
      setUploading((prev) => ({ ...prev, [q.id_ask]: false }));
    }
  };

  const handleSave = async () => {
    const missing = [];
    groupedQuestions.forEach((q) => {
      const type = q.id_type_ask;
      const a = answers[q.id_ask];
      if (type === "1" || type === "4") {
        if (!a || a.id_answer == null) missing.push(q.displayName);
      } else if (type === "5") {
        if (!a || !a.id_answers || a.id_answers.length === 0)
          missing.push(q.displayName);
      } else if (type === "3") {
        if (!a || !String(a.url_file || "").trim()) missing.push(q.displayName);
      } else if (type === "2") {
        if (!a || !String(a.description_answer || "").trim())
          missing.push(q.displayName);
      }
    });
    if (missing.length > 0) {
      notify.error(`Completa las respuestas de: ${missing.join(", ")}`);
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        id_element: Number(idElement),
        fk_estudiante: Number(idEstudiante),
        answers: Object.values(answers)
          .map((a) => {
            if (a.type === "single") return { id_ask: a.id_ask, id_answer: a.id_answer };
            if (a.type === "multiple")
              return { id_ask: a.id_ask, id_answers: a.id_answers };
            if (a.type === "open")
              return {
                id_ask: a.id_ask,
                description_answer: a.description_answer || "",
              };
            if (a.type === "file")
              return { id_ask: a.id_ask, url_file: a.url_file || "" };
            return null;
          })
          .filter(Boolean),
      };
      await saveElementStudentAnswer(payload);
      notify.success("Examen enviado exitosamente.");
      navigate("/dashboard/manageEval");
    } catch (err) {
      console.error("StudentEval - save error:", err);
      notify.error(err?.message || "Error al enviar el examen.");
    } finally {
      setSubmitting(false);
    }
  };

  const renderAnswers = (q) => {
    const type = q.id_type_ask;
    if (type === "2") {
      return (
        <textarea
          rows={3}
          value={answers[q.id_ask]?.description_answer || ""}
          onChange={handleText(q)}
          className="w-full p-2 border rounded bg-surface"
          placeholder="Escribe tu respuesta aquí."
        />
      );
    }
    if (type === "3") {
      const selected = selectedFiles[q.id_ask];
      const preview = previewUrls[q.id_ask];
      const uploadedUrl = answers[q.id_ask]?.url_file;
      return (
        <div className="flex flex-col gap-2">
          {q.url_file && (
            <a
              href={q.url_file}
              target="_blank"
              rel="noreferrer"
              className="text-primary underline break-all"
            >
              Archivo de referencia: {q.url_file}
            </a>
          )}
          <FileChooser
            value=""
            onChange={handleSelectFile(q)}
            disabled={!!uploading[q.id_ask]}
            label="Cargar archivo"
          />
          {selected && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm text-gray-700 truncate max-w-60">
                {selected.name}
              </span>
              {preview && (
                <div className="w-40">
                  <SimpleButton
                    type="button"
                    onClick={handlePreview(q)}
                    msj="Vista previa"
                    bg="bg-info"
                    text="text-surface"
                    noRounded={false}
                  />
                </div>
              )}
              <div className="w-40">
                <SimpleButton
                  type="button"
                  onClick={handleUploadFile(q)}
                  msj={uploading[q.id_ask] ? "Subiendo..." : "Subir archivo"}
                  bg="bg-secondary"
                  text="text-surface"
                  disabled={!!uploading[q.id_ask]}
                  noRounded={false}
                />
              </div>
            </div>
          )}
          {uploadedUrl && (
            <a
              href={uploadedUrl}
              target="_blank"
              rel="noreferrer"
              className="text-sm text-gray-500 break-all underline"
            >
              Archivo enviado: {uploadedUrl}
            </a>
          )}
        </div>
      );
    }
    const isMultiple = type === "5";
    return (
      <div className="grid grid-cols-2 gap-2">
        {q.answers.map((a, aIndex) => (
          <label
            key={a.id_answer ?? aIndex}
            className="flex items-center gap-2 rounded bg-surface p-2"
          >
            <input
              type={isMultiple ? "checkbox" : "radio"}
              name={`q-${q.id_ask ?? ""}`}
              value={a.id_answer ?? ""}
              checked={
                isMultiple
                  ? (answers[q.id_ask]?.id_answers || []).includes(
                      Number(a.id_answer),
                    )
                  : answers[q.id_ask]?.id_answer === Number(a.id_answer)
              }
              onChange={
                isMultiple
                  ? handleCheck(q, a.id_answer)
                  : handleRadio(q)
              }
              className="w-4 h-4"
            />
            <span className="text-sm">
              {a.description_answer || `Opción ${aIndex + 1}`}
            </span>
          </label>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="p-6">
        <Loader message="Cargando examen..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="w-full p-4 border rounded bg-error/10 text-error">
          {error}
        </div>
        <div className="mt-4">
          <SimpleButton
            type="button"
            onClick={() => navigate("/dashboard/manageEval")}
            msj="Volver"
            bg="bg-secondary"
            text="text-surface"
            noRounded={false}
          />
        </div>
      </div>
    );
  }

  if (!exam) return null;

  return (
    <div className="p-6 h-full flex flex-col gap-4">
      <div className="w-full bg-primary text-surface p-3 rounded-lg">
        <h2 className="text-2xl font-bold">{exam.name_element}</h2>
        {exam.name_type_element && (
          <div className="text-sm opacity-90">{exam.name_type_element}</div>
        )}
      </div>

      <div className="w-full">
        <div className="w-full h-3 bg-gray-200 rounded overflow-hidden">
          <div
            className="h-full bg-secondary transition-all"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <div className="text-xs text-gray-500 mt-1">
          {answeredCount} de {groupedQuestions.length} respondidas · Página{" "}
          {page + 1} de {totalPages}
        </div>
      </div>

      <div className="flex flex-col gap-4">
        {groupedQuestions.length === 0 ? (
          <div className="w-full p-4 border rounded bg-surface text-sm text-gray-500">
            Este examen no tiene preguntas.
          </div>
        ) : (
          currentPageQuestions.map((q) => (
            <div
              key={q.id_ask ?? q.displayName}
              className="w-full p-4 border rounded bg-surface flex flex-col gap-3"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-semibold">{q.displayName}</span>
                {q.name_type_ask && (
                  <span className="text-xs px-2 py-1 rounded bg-secondary text-surface">
                    {q.name_type_ask}
                  </span>
                )}
              </div>
              <div className="text-sm">{q.description_ask}</div>
              {renderAnswers(q)}
            </div>
          ))
        )}
      </div>

      <div className="flex items-center justify-between gap-2">
        <div className="w-40">
          <SimpleButton
            type="button"
            onClick={() => navigate("/dashboard/manageEval")}
            msj="Volver"
            bg="bg-error"
            text="text-surface"
            noRounded={false}
          />
        </div>
        <div className="flex gap-2">
          {page > 0 && (
            <div className="w-36">
              <SimpleButton
                type="button"
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                msj="Atrás"
                bg="bg-secondary"
                text="text-surface"
                noRounded={false}
              />
            </div>
          )}
          {!isLastPage && (
            <div className="w-36">
              <SimpleButton
                type="button"
                onClick={() =>
                  setPage((p) => Math.min(totalPages - 1, p + 1))
                }
                msj="Siguiente"
                bg="bg-secondary"
                text="text-surface"
                noRounded={false}
              />
            </div>
          )}
          {isLastPage && (
            <div className="w-40">
              <SimpleButton
                type="button"
                onClick={handleSave}
                msj={submitting ? "Enviando..." : "Guardar"}
                icon="Save"
                bg="bg-secondary"
                text="text-surface"
                disabled={!allAnswered || submitting}
                noRounded={false}
              />
            </div>
          )}
        </div>
      </div>

      {isLastPage && !allAnswered && groupedQuestions.length > 0 && (
        <div className="text-center text-sm text-gray-500 -mt-2">
          Completa todas las preguntas para guardar.
        </div>
      )}
    </div>
  );
};

export default StudentEval;