import { useState, useEffect } from "react";
import SimpleButton from "../atoms/SimpleButton";

const EMPTY_OPTION = { texto: "", correcta: false };

const emptyQuestion = () => ({
  descripcion: "",
  tipoRespuesta: "",
  respuestaLibre: "",
  opciones: [0, 1, 2, 3].map(() => ({ ...EMPTY_OPTION })),
});

const normalizeQuestion = (q = {}) => {
  const tipoRespuesta =
    q.tipoRespuesta === "libre" || q.tipoRespuesta === "multiple"
      ? q.tipoRespuesta
      : "";
  const opciones = Array.isArray(q.opciones)
    ? q.opciones
    : [0, 1, 2, 3].map(() => ({ ...EMPTY_OPTION }));
  const resized = [0, 1, 2, 3].map((_, i) => ({
    texto: String(opciones[i]?.texto ?? ""),
    correcta: Boolean(opciones[i]?.correcta),
  }));
  return {
    descripcion: String(q.descripcion ?? ""),
    tipoRespuesta,
    respuestaLibre: String(q.respuestaLibre ?? ""),
    opciones: resized,
  };
};

const ProfileEval = ({ initialValues, onSave, onClose }) => {
  const hasInitialValues = Boolean(
    initialValues &&
    (initialValues.id != null || initialValues.id_evaluacion != null),
  );

  const [isEditing, setIsEditing] = useState(hasInitialValues);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState({});

  const [form, setForm] = useState(() => ({
    titulo: String(initialValues?.titulo ?? initialValues?.title ?? ""),
    tipo: String(
      initialValues?.tipo ??
        initialValues?.tipo_evaluacion ??
        initialValues?.type ??
        "",
    ),
    preguntas: Array.isArray(initialValues?.preguntas)
      ? initialValues.preguntas.map(normalizeQuestion)
      : [],
  }));

  useEffect(() => {
    if (!initialValues) return;
    setForm({
      titulo: String(initialValues?.titulo ?? initialValues?.title ?? ""),
      tipo: String(
        initialValues?.tipo ??
          initialValues?.tipo_evaluacion ??
          initialValues?.type ??
          "",
      ),
      preguntas: Array.isArray(initialValues?.preguntas)
        ? initialValues.preguntas.map(normalizeQuestion)
        : [],
    });
    setErrors({});
    setIsEditing(Boolean(hasInitialValues));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialValues]);

  const handleTituloChange = (e) => {
    const value = e.target.value;
    setForm((prev) => ({ ...prev, titulo: value }));
    setErrors((prev) => ({ ...prev, titulo: "" }));
  };

  const handleTipoChange = (e) => {
    const value = e.target.value;
    setForm((prev) => ({ ...prev, tipo: value }));
    setErrors((prev) => ({ ...prev, tipo: "" }));
  };

  const addQuestion = () => {
    setForm((prev) => ({
      ...prev,
      preguntas: [...prev.preguntas, emptyQuestion()],
    }));
    setErrors((prev) => ({ ...prev, preguntas: "" }));
  };

  const removeQuestion = (index) => {
    setForm((prev) => ({
      ...prev,
      preguntas: prev.preguntas.filter((_, i) => i !== index),
    }));
    setErrors((prev) => ({ ...prev, preguntas: "" }));
  };

  const updateQuestion = (index, patch) => {
    setForm((prev) => {
      const next = prev.preguntas.map((q, i) =>
        i === index ? { ...q, ...patch } : q,
      );
      return { ...prev, preguntas: next };
    });
    setErrors((prev) => {
      const next = { ...prev };
      delete next[`pregunta-${index}`];
      delete next.preguntas;
      return next;
    });
  };

  const handleQuestionDescripcion = (index) => (e) => {
    updateQuestion(index, { descripcion: e.target.value });
  };

  const handleTipoRespuesta = (index) => (e) => {
    const tipoRespuesta = e.target.value;
    updateQuestion(index, {
      tipoRespuesta,
      respuestaLibre: "",
    });
  };

  const handleRespuestaLibre = (index) => (e) => {
    updateQuestion(index, { respuestaLibre: e.target.value });
  };

  const handleOpcionTexto = (index, optIndex) => (e) => {
    updateQuestion(index, {
      opciones: form.preguntas[index].opciones.map((op, i) =>
        i === optIndex ? { ...op, texto: e.target.value } : op,
      ),
    });
  };

  // Solo una correcta: marcar una opción desmarca las demás
  const handleOpcionCorrecta = (index, optIndex) => (e) => {
    const checked = e.target.checked;
    updateQuestion(index, {
      opciones: form.preguntas[index].opciones.map((op, i) => ({
        ...op,
        correcta: i === optIndex ? checked : false,
      })),
    });
  };

  const validateForm = () => {
    const next = {};
    if (!form.titulo || !String(form.titulo).trim())
      next.titulo = "El título de la evaluación es obligatorio.";
    if (!form.tipo) next.tipo = "Selecciona el tipo de evaluación.";
    if (form.preguntas.length === 0)
      next.preguntas = "Debes agregar al menos una pregunta.";

    form.preguntas.forEach((q, index) => {
      const qErrors = [];
      if (!q.descripcion || !String(q.descripcion).trim())
        qErrors.push("La descripción de la pregunta es obligatoria.");
      if (!q.tipoRespuesta) qErrors.push("Selecciona el tipo de respuesta.");
      if (q.tipoRespuesta === "multiple") {
        const hasEmpty = q.opciones.some((op) => !String(op.texto).trim());
        if (hasEmpty) qErrors.push("Completa las 4 opciones de respuesta.");
        const correctas = q.opciones.filter((op) => op.correcta).length;
        if (correctas !== 1)
          qErrors.push("Marca exactamente una opción como verdadera.");
      }
      if (qErrors.length > 0) next[`pregunta-${index}`] = qErrors.join(" · ");
    });

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const buildPayload = () => ({
    titulo: String(form.titulo || "").trim(),
    tipo: form.tipo,
    preguntas: form.preguntas.map((q) => {
      const base = {
        descripcion: String(q.descripcion || "").trim(),
        tipoRespuesta: q.tipoRespuesta,
      };
      if (q.tipoRespuesta === "libre") {
        return {
          ...base,
          respuestaLibre: String(q.respuestaLibre || "").trim(),
          opciones: [],
        };
      }
      return {
        ...base,
        respuestaLibre: "",
        opciones: q.opciones.map((op) => ({
          texto: String(op.texto || "").trim(),
          correcta: Boolean(op.correcta),
        })),
      };
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
      if (hasInitialValues) setIsEditing(false);
    } catch (err) {
      console.error("ProfileEval - save error:", err);
      throw err;
    } finally {
      setIsSaving(false);
    }
  };

  const canEdit = hasInitialValues ? isEditing : true;

  return (
    <div className="w-full flex flex-col gap-4">
      {hasInitialValues && (
        <div className="flex justify-end gap-2">
          <div className="w-40">
            <SimpleButton
              type="button"
              onClick={() => {
                if (isEditing) {
                  handleSubmit();
                } else {
                  setIsEditing(true);
                }
              }}
              msj={isSaving ? "Guardando..." : isEditing ? "Guardar" : "Editar"}
              icon={isEditing ? "Save" : "Pencil"}
              bg={isEditing ? "bg-accent" : "bg-secondary"}
              text="text-surface"
              disabled={isSaving}
            />
          </div>
        </div>
      )}

      <div id="tour-pe-titulo">
        <label className="">
          Título de la evaluación <span className="text-error">*</span>
        </label>
        <input
          name="titulo"
          value={form.titulo}
          onChange={handleTituloChange}
          disabled={!canEdit || isSaving}
          className="w-full p-2 border rounded bg-surface"
          placeholder="Ej: Evaluación de sistemas de ecuaciones"
        />
        {errors.titulo && (
          <div className="text-sm text-red-600 mt-1">{errors.titulo}</div>
        )}
      </div>

      <div id="tour-pe-tipo">
        <label className="">
          Tipo de evaluación <span className="text-error">*</span>
        </label>
        <select
          name="tipo"
          value={form.tipo}
          onChange={handleTipoChange}
          disabled={!canEdit || isSaving}
          className="w-full p-2 border rounded bg-surface"
        >
          <option value="">Selecciona el tipo</option>
          <option value="Quiz">Quiz</option>
          <option value="Evaluacion">Evaluación</option>
          <option value="Taller">Taller</option>
        </select>
        {errors.tipo && (
          <div className="text-sm text-red-600 mt-1">{errors.tipo}</div>
        )}
      </div>

      <div id="tour-pe-questions">
        <div className="flex items-center justify-between">
          <label className="font-bold">Preguntas</label>
          {canEdit && (
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
        {errors.preguntas && (
          <div className="text-sm text-red-600 mt-1">{errors.preguntas}</div>
        )}

        {form.preguntas.length === 0 ? (
          <div className="w-full p-4 border rounded bg-surface text-sm text-gray-500">
            Aún no hay preguntas. Haz clic en "Agregar pregunta" para crear la
            primera.
          </div>
        ) : (
          form.preguntas.map((q, index) => (
            <div
              key={index}
              className="w-full p-4 border rounded bg-surface flex flex-col gap-3 mt-2"
            >
              <div className="grid grid-cols-12 items-center justify-between">
                <span className="font-semibold col-span-11">
                  Pregunta {index + 1}
                </span>
                {canEdit && (
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
                <label className="">Descripción</label>
                <input
                  name="descripcion"
                  value={q.descripcion}
                  onChange={handleQuestionDescripcion(index)}
                  disabled={!canEdit || isSaving}
                  className="w-full p-2 border rounded bg-surface"
                  placeholder=""
                />
              </div>

              <div>
                <label className="">Tipo de respuesta</label>
                <select
                  name="tipoRespuesta"
                  value={q.tipoRespuesta}
                  onChange={handleTipoRespuesta(index)}
                  disabled={!canEdit || isSaving}
                  className="w-full p-2 border rounded bg-surface"
                >
                  <option value="">Selecciona el tipo</option>
                  <option value="multiple">Respuesta múltiple</option>
                  <option value="libre">Respuesta libre</option>
                </select>
              </div>

              {q.tipoRespuesta === "libre" ? (
                <div>
                  <label className="">Respuesta</label>
                  <textarea
                    name="respuestaLibre"
                    value={q.respuestaLibre}
                    onChange={handleRespuestaLibre(index)}
                    disabled={!canEdit || isSaving}
                    rows={3}
                    className="w-full p-2 border rounded bg-surface"
                    placeholder="Escribe aquí la respuesta esperada"
                  />
                </div>
              ) : q.tipoRespuesta === "multiple" ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {q.opciones.map((op, optIndex) => (
                    <div key={optIndex} className="flex items-center gap-2">
                      <label className="flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={op.correcta}
                          onChange={handleOpcionCorrecta(index, optIndex)}
                          disabled={!canEdit || isSaving}
                          className="w-4 h-4"
                        />
                        Verdadera
                      </label>
                      <input
                        name={`opcion-${index}-${optIndex}`}
                        value={op.texto}
                        onChange={handleOpcionTexto(index, optIndex)}
                        disabled={!canEdit || isSaving}
                        className="w-full p-2 border rounded bg-surface"
                        placeholder={`Opción ${optIndex + 1}`}
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="w-full p-3 border rounded bg-surface text-sm text-gray-500">
                  Selecciona el tipo de respuesta para configurar la pregunta.
                </div>
              )}

              {errors[`pregunta-${index}`] && (
                <div className="text-sm text-red-600">
                  {errors[`pregunta-${index}`]}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {typeof onClose === "function" && !hasInitialValues && (
        <div className="flex justify-center items-center gap-2">
          <div className="w-40">
            <SimpleButton
              type="button"
              onClick={handleSubmit}
              msj={isSaving ? "Registrando..." : "Registrar"}
              icon="Save"
              bg="bg-secondary"
              text="text-surface"
              disabled={isSaving}
            />
          </div>
          <div className="w-40">
            <SimpleButton
              type="button"
              onClick={onClose}
              msj="Cancelar"
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
