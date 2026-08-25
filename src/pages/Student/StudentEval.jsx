import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Loader from "../../components/atoms/Loader";
import SimpleButton from "../../components/atoms/SimpleButton";
import useTeacher from "../../lib/hooks/useTeacher";

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

const StudentEval = () => {
  const { idElement } = useParams();
  const navigate = useNavigate();
  const { getElementStudentData } = useTeacher();

  const [exam, setExam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(null);
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
      displayName: q.name_ask || `Pregunta ${index + 1}`,
    }));
  }, [exam]);

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

  const renderAnswers = (q) => {
    const type = q.id_type_ask;
    if (type === "2") {
      return (
        <textarea
          rows={3}
          disabled
          className="w-full p-2 border rounded bg-surface"
          placeholder="El estudiante responderá de forma abierta."
        />
      );
    }
    if (type === "3") {
      return q.url_file ? (
        <a
          href={q.url_file}
          target="_blank"
          rel="noreferrer"
          className="text-primary underline break-all"
        >
          {q.url_file}
        </a>
      ) : (
        <div className="text-sm text-gray-500">Sin archivo.</div>
      );
    }
    const isMultiple = type === "5";
    return (
      <div
        className={
          isMultiple
            ? "grid grid-cols-1 md:grid-cols-2 gap-2"
            : "flex flex-col gap-2"
        }
      >
        {q.answers.map((a, aIndex) => (
          <label
            key={a.id_answer ?? aIndex}
            className="flex items-center gap-2 border rounded bg-surface p-2"
          >
            <input
              type={isMultiple ? "checkbox" : "radio"}
              name={`q-${q.id_ask ?? ""}-${a.id_answer ?? aIndex}`}
              disabled
              className="w-4 h-4"
            />
            <span className="text-sm">{a.description_answer || `Opción ${aIndex + 1}`}</span>
          </label>
        ))}
      </div>
    );
  };

  return (
    <div className="p-6 h-full flex flex-col gap-4">
      <div className="w-full bg-primary text-surface p-3 rounded-lg">
        <h2 className="text-2xl font-bold">{exam.name_element}</h2>
        {exam.name_type_element && (
          <div className="text-sm opacity-90">{exam.name_type_element}</div>
        )}
      </div>

      <div className="flex flex-col gap-4">
        {groupedQuestions.length === 0 ? (
          <div className="w-full p-4 border rounded bg-surface text-sm text-gray-500">
            Este examen no tiene preguntas.
          </div>
        ) : (
          groupedQuestions.map((q) => (
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

      <div className="flex justify-center">
        <div className="w-40">
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
    </div>
  );
};

export default StudentEval;