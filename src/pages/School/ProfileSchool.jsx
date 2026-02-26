import React, { useMemo, useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import FileChooser from "../../components/atoms/FileChooser";
import SimpleButton from "../../components/atoms/SimpleButton";
import ThemeModal from "../../components/molecules/ThemeModal";
import JourneySelect from "../../components/atoms/JourneySelect";
import DepartmentSelector from "../../components/molecules/DepartmentSelector";
import CitySelector from "../../components/molecules/CitySelector";
import { getInputClassName, getLabelClassName } from "../../utils/cssUtils";
import {
  required,
  isEmail,
  isText,
  compose,
} from "../../utils/validationUtils";
import useSchool from "../../lib/hooks/useSchool";
import { useNotify } from "../../lib/hooks/useNotify";

// Constantes
const DEFAULT_PERFORMANCE_SCALE = [
  { label: "Bajo", start: 1, end: "" },
  { label: "Básico", start: "", end: "" },
  { label: "Alto", start: "", end: "" },
  { label: "Superior", start: "", end: 5 },
];

const BLOCKED_KEYS = ["e", "E", "+", "-"];
const MIN_VALUE = 1;
const MAX_VALUE = 5;
const MIN_STEP = 0.01;
const EPS = 1e-3;

// Funciones utilitarias
const normalizeNumericValue = (value) => {
  if (value === "" || value === null) return "";
  const num = parseFloat(String(value).replace(",", "."));
  if (Number.isNaN(num)) return value;
  const clamped = Math.max(MIN_VALUE, Math.min(MAX_VALUE, num));
  return Number.isInteger(clamped)
    ? String(clamped)
    : String(parseFloat(clamped.toFixed(2)));
};

const blockInvalidKeys = (e) => {
  if (BLOCKED_KEYS.includes(e.key)) e.preventDefault();
};

// Parsear escala de desempeño desde datos iniciales
const parsePerformanceScale = (rawScale) => {
  if (!rawScale) return [];

  const normalizeRow = (r) => ({
    label: r?.label ?? r?.name ?? `Estado`,
    start: normalizeNumericValue(r?.start ?? r?.s ?? ""),
    end: normalizeNumericValue(r?.end ?? r?.e ?? ""),
  });

  try {
    if (typeof rawScale === "string") {
      // Intentar parsear JSON
      try {
        const parsed = JSON.parse(rawScale);
        if (Array.isArray(parsed)) return parsed.map(normalizeRow);
      } catch (err) {
        // Si no es JSON, puede ser texto separado por comas (labels)
        if (rawScale.includes(",")) {
          const labels = rawScale.split(",").map((s) => s.trim());
          return labels.map((l) => ({ label: l, start: "", end: "" }));
        }
      }

      // Si es un número o texto simple, no lo consideramos válido para la escala
      return [];
    } else if (Array.isArray(rawScale)) {
      return rawScale.map(normalizeRow);
    }
  } catch (e) {
    // Ignorar errores de parseo
  }

  return [];
};

// Parsear umbral de promoción desde datos iniciales
const parsePromotionThreshold = (rawPromotion) => {
  if (!rawPromotion) return "";

  try {
    if (typeof rawPromotion === "string") {
      const parsed = JSON.parse(rawPromotion);
      return normalizeNumericValue(parsed?.threshold ?? String(rawPromotion));
    } else if (typeof rawPromotion === "object") {
      return normalizeNumericValue(rawPromotion.threshold ?? "");
    }
  } catch (e) {
    return normalizeNumericValue(String(rawPromotion));
  }

  return "";
};

// Validar la escala: sin duplicados, sin solapamientos, inicio <= fin y valores numéricos
const validatePerformanceScale = (scaleArray) => {
  const errors = [];
  const rowErrors = {};

  const intervals = [];

  (scaleArray || []).forEach((r, idx) => {
    const label = r.label || `Estado ${idx + 1}`;
    const sRaw =
      r.start === undefined || r.start === null ? "" : String(r.start).trim();
    const eRaw =
      r.end === undefined || r.end === null ? "" : String(r.end).trim();

    const currentRowErrors = [];

    if (sRaw === "" || eRaw === "") {
      currentRowErrors.push("inicio y fin deben estar completos");
    } else {
      const s = parseFloat(sRaw.replace(",", "."));
      const e = parseFloat(eRaw.replace(",", "."));

      if (Number.isNaN(s) || Number.isNaN(e)) {
        currentRowErrors.push("inicio y fin deben ser números");
      } else {
        if (!(s < e)) {
          currentRowErrors.push("inicio debe ser menor que fin");
        } else {
          intervals.push({ s, e, label, idx });
        }
      }
    }

    if (currentRowErrors.length > 0) rowErrors[idx] = currentRowErrors;
  });

  // Comprobación entre filas adyacentes: exigir fin < inicio siguiente (estricto)
  for (let i = 0; i < (scaleArray || []).length - 1; i += 1) {
    const a = intervals.find((it) => it.idx === i);
    const b = intervals.find((it) => it.idx === i + 1);
    if (a && b) {
      if (!(a.e + EPS < b.s)) {
        errors.push(
          `'${a.label}' debe tener fin menor que el inicio de '${b.label}'`,
        );
        rowErrors[a.idx] = rowErrors[a.idx] || [];
        rowErrors[b.idx] = rowErrors[b.idx] || [];
        rowErrors[a.idx].push("fin debe ser menor que inicio siguiente");
        rowErrors[b.idx].push("inicio debe ser mayor que fin anterior");
      }
    }
  }

  // Detectar duplicados globales en todos los valores (starts/ends)
  const valueMap = {};
  intervals.forEach((it) => {
    const sKey = Number(it.s).toFixed(6);
    const eKey = Number(it.e).toFixed(6);
    valueMap[sKey] = valueMap[sKey] || [];
    valueMap[sKey].push({ idx: it.idx, label: it.label, pos: "start" });
    valueMap[eKey] = valueMap[eKey] || [];
    valueMap[eKey].push({ idx: it.idx, label: it.label, pos: "end" });
  });

  Object.entries(valueMap).forEach(([val, occurrences]) => {
    if (occurrences.length > 1) {
      const rows = [...new Set(occurrences.map((o) => o.idx))].map(
        (r) => r + 1,
      );
      errors.push(`Valor repetido ${Number(val)} en filas: ${rows.join(", ")}`);
      occurrences.forEach((o) => {
        rowErrors[o.idx] = rowErrors[o.idx] || [];
        rowErrors[o.idx].push("valor repetido");
      });
    }
  });

  // chequear duplicados y solapamientos entre los intervalos válidos (no adyacentes también)
  for (let i = 0; i < intervals.length; i += 1) {
    for (let j = i + 1; j < intervals.length; j += 1) {
      const a = intervals[i];
      const b = intervals[j];

      if (a.s === b.s && a.e === b.e) {
        errors.push(`'${a.label}' y '${b.label}': intervalos duplicados`);
        rowErrors[a.idx] = rowErrors[a.idx] || [];
        rowErrors[b.idx] = rowErrors[b.idx] || [];
        rowErrors[a.idx].push("intervalo duplicado");
        rowErrors[b.idx].push("intervalo duplicado");
      } else if (
        Math.max(a.s, b.s) <
        Math.min(a.e, b.e) - (MIN_STEP / 2 + EPS)
      ) {
        errors.push(`'${a.label}' y '${b.label}': intervalos se solapan`);
        rowErrors[a.idx] = rowErrors[a.idx] || [];
        rowErrors[b.idx] = rowErrors[b.idx] || [];
        rowErrors[a.idx].push("intervalo solapado con otra fila");
        rowErrors[b.idx].push("intervalo solapado con otra fila");
      }
    }
  }

  // Validar límites 0..5 para cada intervalo
  (intervals || []).forEach((it) => {
    if (it.s < MIN_VALUE || it.e > MAX_VALUE) {
      errors.push(`'${it.label}': valores deben estar entre 0 y 5`);
      rowErrors[it.idx] = rowErrors[it.idx] || [];
      rowErrors[it.idx].push("valores fuera de rango (0..5)");
    }
  });

  // Validar etiquetas: deben ser una de las opciones permitidas y no repetirse
  const allowedLabels = ["Superior", "Alto", "Básico", "Bajo"];
  const labels = (scaleArray || []).map((r) =>
    (r?.label || "").toString().trim(),
  );

  labels.forEach((lab, idx) => {
    if (!lab || !allowedLabels.includes(lab)) {
      errors.push(
        `Fila ${idx + 1}: etiqueta inválida — usar Superior/Alto/Básico/Bajo`,
      );
      rowErrors[idx] = rowErrors[idx] || [];
      rowErrors[idx].push("etiqueta inválida");
    }
  });

  // Duplicados de etiquetas
  const labelCounts = labels.reduce((acc, l, i) => {
    if (!l) return acc;
    acc[l] = acc[l] || [];
    acc[l].push(i);
    return acc;
  }, {});

  Object.entries(labelCounts).forEach(([lab, idxs]) => {
    if (idxs.length > 1) {
      errors.push(
        `Etiqueta '${lab}' repetida en filas: ${idxs.map((i) => i + 1).join(", ")}`,
      );
      idxs.forEach((i) => {
        rowErrors[i] = rowErrors[i] || [];
        rowErrors[i].push("etiqueta repetida");
      });
    }
  });

  // Requerir exactamente las 4 etiquetas únicas
  const uniqueLabels = [...new Set(labels.filter(Boolean))];
  const missing = allowedLabels.filter((a) => !uniqueLabels.includes(a));
  if (uniqueLabels.length !== allowedLabels.length || missing.length > 0) {
    errors.push(
      `La escala debe contener exactamente: ${allowedLabels.join(", ")}`,
    );
  }

  return {
    valid: errors.length === 0 && Object.keys(rowErrors).length === 0,
    errors: [...new Set(errors)],
    rowErrors,
  };
};

// Construye el objeto `sistema_evaluacion` que será enviado en el payload
const buildSistemaEvaluacion = (evaluationState) => {
  const parseNum = (v) => {
    if (v === undefined || v === null || v === "") return null;
    const n = parseFloat(String(v).replace(",", "."));
    return Number.isNaN(n) ? null : n;
  };

  const escala_desempeno = (
    Array.isArray(evaluationState?.performanceScale)
      ? evaluationState.performanceScale
      : []
  ).map((r) => ({
    ...(r?.id_sistema_evaluacion != null
      ? { id_sistema_evaluacion: r.id_sistema_evaluacion }
      : {}),
    escala: (r?.label ?? "").toString(),
    desde: parseNum(r?.start ?? ""),
    hasta: parseNum(r?.end ?? ""),
  }));

  const politica_promocion =
    evaluationState?.promotionThreshold === undefined ||
    evaluationState?.promotionThreshold === null ||
    evaluationState?.promotionThreshold === ""
      ? null
      : parseNum(evaluationState.promotionThreshold);

  return { escala_desempeno, politica_promocion };
};

const ProfileSchool = ({
  mode: modeProp,
  schoolId,
  initialData = null,
  onSuccess = null,
  initialEditing = undefined,
}) => {
  const params = useParams();
  const modeFromParams = params?.mode;
  const mode = (modeProp ?? modeFromParams ?? "register").toLowerCase();
  const isUpdate = mode === "update";

  const { addSchool, updateSchool, updateInstitution, loading, journeys } =
    useSchool();

  const notify = useNotify();

  const [formData, setFormData] = useState({
    municipality: "1",
    name: "",
    nit: "",
    slogan: "",
    address: "",
    email: "",
    phone: "",
    principalName: "",
    coordinadorName: "",
    logo: "",
    mainColor: "#131a27",
    secondaryColor: "#ff9300",
    workday: "",
    codDane: "",
    signaturePrincipal: "",
    sede: [],
    department_id: "",
  });

  // Si se pasa initialData, sincronizar el form
  useEffect(() => {
    if (!initialData) return;

    // Soporte para formato plano: array de filas donde cada una repite los campos
    // de la institución y agrega escala/desde/hasta
    const isArrayFormat = Array.isArray(initialData) && initialData.length > 0;
    const baseData = isArrayFormat ? initialData[0] : initialData;

    // Mapear campos de la institución recibida a nuestro formData
    const map = {
      municipality: baseData.municipality ?? baseData.municipio ?? "1",
      name: baseData.nombre_institucion || "",
      nit: baseData.nit ?? "",
      slogan: baseData.eslogan ?? "",
      address: baseData.address ?? baseData.direccion ?? "",
      email: baseData.email ?? baseData.correo ?? "",
      phone: baseData.phone ?? baseData.telefono ?? "",
      principalName: baseData.director ?? "",
      coordinadorName: baseData.coordinador ?? "",
      logo: baseData.link_logo ?? "",
      mainColor: baseData.color_principal ?? "#131a27",
      secondaryColor: baseData.color_secundario ?? "#ff9300",
      workday: baseData.fk_jornada ? String(baseData.fk_jornada) : "",
      codDane: baseData.cod_dane ?? "",
      signaturePrincipal: baseData.link_firma ?? "",
      sede: Array.isArray(baseData.sede) ? baseData.sede : [],
      department_id: baseData.department_id ?? "",
    };

    setFormData((prev) => ({ ...prev, ...map }));

    // Construir escala de desempeño
    let parsedScale;
    if (isArrayFormat) {
      // Cada elemento del array tiene: escala (label), desde (start), hasta (end), id_sistema_evaluacion
      parsedScale = initialData
        .filter((row) => row.escala || row.desde != null || row.hasta != null)
        .map((row) => ({
          id_sistema_evaluacion: row.id_sistema_evaluacion ?? null,
          label: row.escala ?? "",
          start: normalizeNumericValue(row.desde ?? ""),
          end: normalizeNumericValue(row.hasta ?? ""),
        }));
    } else {
      const rawScale =
        baseData?.sistema_evaluacion?.escala_desempeno ??
        baseData?.escala_desempeno ??
        "";
      parsedScale = parsePerformanceScale(rawScale);
    }

    // umbral: en formato array viene en cada fila; tomarlo del primero
    const rawPromotion = isArrayFormat
      ? (baseData?.umbral ?? "")
      : (baseData?.sistema_evaluacion?.politica_promocion ??
        baseData?.politica_promocion ??
        "");

    setEvaluation({
      performanceScale: parsedScale,
      promotionThreshold: parsePromotionThreshold(rawPromotion),
    });

    // validar inmediatamente al cargar
    const { errors: initErrors } = validatePerformanceScale(parsedScale);
    setScaleErrors(initErrors);
  }, [initialData]);
  const [isThemeModalOpen, setIsThemeModalOpen] = useState(false);

  // Estado para el sistema de evaluación (datos propios)
  const [evaluation, setEvaluation] = useState({
    performanceScale: [],
    promotionThreshold: "",
  });

  // Errores de validación para la escala
  const [scaleErrors, setScaleErrors] = useState([]);
  // Errores por fila (índice -> array de mensajes) - eliminado (se usan sólo errores globales en `scaleErrors`)

  // Errores de validación del formulario
  const [formErrors, setFormErrors] = useState({});

  // Modo de edición (por defecto: editable en modo registro, vista en modo update)
  const [isEditing, setIsEditing] = useState(
    typeof initialEditing === "boolean" ? initialEditing : !isUpdate,
  );

  useEffect(() => {
    if (typeof initialEditing === "boolean") {
      setIsEditing(initialEditing);
    } else {
      setIsEditing(!isUpdate);
    }
  }, [initialEditing, isUpdate]);

  // Función para validar todo el formulario
  const validateForm = useCallback(() => {
    const errors = {};

    // Validar nombre de la institución
    const nameValidation = compose(required, isText)(formData.name);
    if (!nameValidation.valid) errors.name = nameValidation.msg;

    // Validar municipio
    const municipalityValidation = required(formData.municipality);
    if (!municipalityValidation.valid)
      errors.municipality = municipalityValidation.msg;

    // Validar email
    const emailValidation = compose(required, isEmail)(formData.email);
    if (!emailValidation.valid) errors.email = emailValidation.msg;

    // Validar teléfono
    const phoneValidation = required(
      formData.phone,
      "El teléfono es obligatorio",
    );
    if (!phoneValidation.valid) errors.phone = phoneValidation.msg;

    // Validar dirección
    const addressValidation = required(
      formData.address,
      "La dirección es obligatoria",
    );
    if (!addressValidation.valid) errors.address = addressValidation.msg;

    // Validar nombre del director
    const principalValidation = compose(
      required,
      isText,
    )(formData.principalName);
    if (!principalValidation.valid)
      errors.principalName = principalValidation.msg;

    // Validar nombre del coordinador
    const coordinadorValidation = compose(
      required,
      isText,
    )(formData.coordinadorName);
    if (!coordinadorValidation.valid)
      errors.coordinadorName = coordinadorValidation.msg;

    // Validar jornada
    const workdayValidation = required(
      formData.workday,
      "La jornada es obligatoria",
    );
    if (!workdayValidation.valid) errors.workday = workdayValidation.msg;

    // Validar código DANE solo en modo creación
    if (!isUpdate) {
      const codDaneValidation = required(
        formData.codDane,
        "El código DANE es obligatorio",
      );
      if (!codDaneValidation.valid) errors.codDane = codDaneValidation.msg;
    }

    // Validar colores
    const mainColorValidation = required(
      formData.mainColor,
      "El color principal es obligatorio",
    );
    if (!mainColorValidation.valid) errors.mainColor = mainColorValidation.msg;

    const secondaryColorValidation = required(
      formData.secondaryColor,
      "El color secundario es obligatorio",
    );
    if (!secondaryColorValidation.valid)
      errors.secondaryColor = secondaryColorValidation.msg;

    // Validar sedes en modo creación
    if (!isUpdate) {
      const sedeErrors = {};
      if (Array.isArray(formData.sede) && formData.sede.length > 0) {
        formData.sede.forEach((sede, index) => {
          const sedeFieldErrors = {};

          const nameSedeValidation = required(
            sede.name_sede,
            "El nombre de la sede es obligatorio",
          );
          if (!nameSedeValidation.valid)
            sedeFieldErrors.name_sede = nameSedeValidation.msg;

          const adressValidation = required(
            sede.adress,
            "La dirección de la sede es obligatoria",
          );
          if (!adressValidation.valid)
            sedeFieldErrors.adress = adressValidation.msg;

          const phoneSedeValidation = required(
            sede.phone,
            "El teléfono de la sede es obligatorio",
          );
          if (!phoneSedeValidation.valid)
            sedeFieldErrors.phone = phoneSedeValidation.msg;

          const jornadaValidation = required(
            sede.jornada,
            "La jornada de la sede es obligatoria",
          );
          if (!jornadaValidation.valid)
            sedeFieldErrors.jornada = jornadaValidation.msg;

          if (Object.keys(sedeFieldErrors).length > 0) {
            sedeErrors[index] = sedeFieldErrors;
          }
        });
      }

      if (Object.keys(sedeErrors).length > 0) {
        errors.sede = sedeErrors;
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }, [formData, isUpdate]);

  const handleSubmit = useCallback(
    async (e) => {
      if (e && e.preventDefault) e.preventDefault();

      // Validar formulario principal
      if (!validateForm()) {
        notify.error(
          "Por favor completa todos los campos obligatorios correctamente.",
        );
        return;
      }

      // validar escala antes de enviar
      const { valid, errors, rowErrors } = validatePerformanceScale(
        evaluation.performanceScale || [],
      );
      if (!valid) {
        setScaleErrors(errors);
        notify.error("Corrige los errores en la escala antes de guardar.");
        return;
      }
      setScaleErrors([]);
      const pRaw =
        evaluation.promotionThreshold === undefined ||
        evaluation.promotionThreshold === null
          ? ""
          : String(evaluation.promotionThreshold).trim();
      if (pRaw !== "") {
        const pVal = parseFloat(pRaw.replace(",", "."));
        if (Number.isNaN(pVal) || pVal < 0 || pVal > 5) {
          notify.error(
            "El umbral de promoción debe ser un número entre 0 y 5.",
          );
          return;
        }
      }

      try {
        const payload = { ...formData };
        let result;

        if (isUpdate && schoolId) {
          // Para actualización, enviar sólo los campos permitidos
          const parseNum = (v) => {
            if (v === undefined || v === null || v === "") return null;
            const n = parseFloat(String(v).replace(",", "."));
            return Number.isNaN(n) ? null : n;
          };

          const updatePayload = {
            address: payload.address ?? "",
            codDane: payload.codDane ?? "",
            coordinadorName: payload.coordinadorName ?? "",
            email: payload.email ?? "",
            logo: payload.logo ?? "",
            mainColor: payload.mainColor ?? "",
            municipality: payload.municipality ?? "",
            name: payload.name ?? "",
            nit: payload.nit ?? "",
            phone: payload.phone ?? "",
            principalName: payload.principalName ?? "",
            secondaryColor: payload.secondaryColor ?? "",
            signaturePrincipal: payload.signaturePrincipal ?? "",
            slogan: payload.slogan ?? "",
            workday: payload.workday ? parseInt(payload.workday) : null,
            // Escala de evaluación: usa id_evaluacion del registro original
            escala_evaluacion: (Array.isArray(evaluation.performanceScale)
              ? evaluation.performanceScale
              : []
            ).map((r) => ({
              id_evaluacion:
                r.id_sistema_evaluacion != null
                  ? parseInt(r.id_sistema_evaluacion)
                  : undefined,
              desde: parseNum(r.start),
              hasta: parseNum(r.end),
            })),
          };

          console.log("Datos a enviar (update):", updatePayload);

          // Usar updateInstitution si existe, si no usar updateSchool como fallback
          if (typeof updateInstitution === "function") {
            result = await updateInstitution(schoolId, updatePayload);
            console.log("Institución actualizada (updateInstitution):", result);
          } else {
            result = await updateSchool(schoolId, updatePayload);
            console.log(
              "Institución actualizada (updateSchool fallback):",
              result,
            );
          }
        } else {
          // Modo creación: procesar sedes y enviar payload completo
          // Procesar sedes
          let sedeData = payload.sede ?? [];

          // Si no hay sedes, crear una sede principal automáticamente
          if (sedeData.length === 0) {
            sedeData = [
              {
                name_sede: "principal",
                adress: "",
                phone: "",
                jornada: parseInt(payload.workday),
              },
            ];
          } else {
            // Convertir jornada a número para cada sede existente
            sedeData = sedeData.map((sede) => ({
              ...sede,
              jornada: parseInt(sede.jornada),
            }));
          }

          payload.sede = sedeData;

          // Agregar sistema de evaluación desde el estado local
          payload.sistema_evaluacion = buildSistemaEvaluacion(evaluation);

          // Excluir campos auxiliares que no se envían al backend
          delete payload.department_id;

          console.log("Datos a enviar (create):", payload);

          result = await addSchool(payload);
          console.log("Institución creada:", result);
        }

        // Llamar al callback onSuccess si fue provisto (para cerrar modal y refrescar listados)
        if (typeof onSuccess === "function") {
          try {
            onSuccess(result);
          } catch (e) {
            console.warn("ManageSchool: onSuccess callback falló:", e);
          }
        }

        // Opcional: resetear formulario en modo create
        if (!isUpdate) {
          // Podrías resetear el form o redirigir
        }
      } catch (error) {
        console.error("Error al enviar formulario:", error);
      }
    },
    [
      evaluation,
      formData,
      isUpdate,
      schoolId,
      updateInstitution,
      updateSchool,
      addSchool,
      onSuccess,
      notify,
      validateForm,
    ],
  );

  const toggleEditing = useCallback(() => {
    setIsEditing((v) => !v);
  }, []);

  const title = useMemo(() => {
    return isUpdate ? "Actualizar institución" : "Registrar nueva institución";
  }, [isUpdate]);

  const primaryButtonLabel = useMemo(() => {
    return isUpdate ? "Actualizar institución" : "Registrar institución";
  }, [isUpdate]);

  const handleChange = useCallback((e) => {
    const { name, value, type, files } = e.target;
    setFormData((prev) => {
      const newData = {
        ...prev,
        [name]: type === "file" ? files?.[0] : value,
      };

      // Si cambió el departamento, limpiar municipality
      if (name === "department_id") {
        newData.municipality = "";
      }

      return newData;
    });
  }, []);

  const addSede = useCallback(() => {
    setFormData((prev) => {
      const currentWorkday =
        prev && prev.workday !== undefined && prev.workday !== null
          ? String(prev.workday)
          : "";

      return {
        ...prev,
        sede: [
          ...(Array.isArray(prev.sede) ? prev.sede : []),
          {
            name_sede: "",
            adress: "",
            phone: "",
            jornada: currentWorkday,
          },
        ],
      };
    });
  }, []);

  const handleCloseThemeModal = useCallback(() => {
    setIsThemeModalOpen(false);
  }, []);

  const handleOpenThemeModal = useCallback(() => {
    setIsThemeModalOpen(true);
  }, []);

  const handleSetColor = useCallback((colorData) => {
    setFormData((prev) => ({
      ...prev,
      mainColor: colorData.mainColor,
      secondaryColor: colorData.secondaryColor,
    }));
  }, []);

  const themeModalColor = useMemo(
    () => ({
      mainColor: formData.mainColor,
      secondaryColor: formData.secondaryColor,
    }),
    [formData.mainColor, formData.secondaryColor],
  );

  // Si la institución cambia de jornada, aplicamos reglas a las sedes:
  // - Si es '3' (Ambas): limpiamos jornadas inválidas para forzar al usuario a elegir 1 o 2
  // - Si es '1' o '2': forzamos todas las sedes a usar ese valor (y notificamos)
  useEffect(() => {
    const w = String(formData.workday);

    if (w === "3") {
      const seats = Array.isArray(formData.sede) ? formData.sede : [];
      let changed = false;
      const newSedes = seats.map((s) => {
        const j =
          s && s.jornada !== undefined && s.jornada !== null
            ? String(s.jornada)
            : "";
        // mantener si ya es 1 o 2; si es vacío mantener vacío; para '3' u otros limpiar
        if (j === "1" || j === "2" || j === "") return s;
        changed = true;
        return { ...s, jornada: "" };
      });

      if (changed) {
        setFormData((prev) => ({ ...prev, sede: newSedes }));
        notify.info(
          "Se limpiaron jornadas no válidas en las sedes. Por favor selecciona 'Mañana' o 'Tarde' para cada sede.",
        );
      }

      return;
    }

    // Si es diferente de '3' y no está vacío, actualizar todas las sedes para que usen ese workday
    if (w !== "3" && w !== "") {
      const seats = Array.isArray(formData.sede) ? formData.sede : [];
      let changed = false;
      const newSedes = seats.map((s) => {
        const j =
          s && s.jornada !== undefined && s.jornada !== null
            ? String(s.jornada)
            : "";
        if (j === w) return s;
        changed = true;
        return { ...s, jornada: w };
      });

      if (changed) {
        setFormData((prev) => ({ ...prev, sede: newSedes }));
        const opt = (Array.isArray(journeys) ? journeys : []).find(
          (o) => String(o.value) === w,
        );
        const label = opt ? opt.label : `Jornada ${w}`;
        notify.success(
          `Se actualizaron automáticamente las jornadas de las sedes a "${label}"`,
        );
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.workday, journeys]);

  const updateSedeField = useCallback((index, field, value) => {
    setFormData((prev) => ({
      ...prev,
      sede: (Array.isArray(prev.sede) ? prev.sede : []).map((sede, i) =>
        i === index
          ? {
              ...sede,
              [field]: value,
            }
          : sede,
      ),
    }));
  }, []);

  const removeSede = useCallback((index) => {
    setFormData((prev) => ({
      ...prev,
      sede: (Array.isArray(prev.sede) ? prev.sede : []).filter(
        (_, i) => i !== index,
      ),
    }));
  }, []);

  // Actualizar un valor de la escala de desempeño (inicio/fin)
  const updateScaleValue = useCallback((index, field, value) => {
    setEvaluation((prev) => {
      const next = Array.isArray(prev.performanceScale)
        ? prev.performanceScale.map((r, i) =>
            i === index ? { ...r, [field]: normalizeNumericValue(value) } : r,
          )
        : prev.performanceScale;

      // validar inmediatamente
      const { errors } = validatePerformanceScale(next);
      setScaleErrors(errors);

      return { ...prev, performanceScale: next };
    });
  }, []);

  const updateScaleLabel = useCallback((index, value) => {
    setEvaluation((prev) => {
      const next = Array.isArray(prev.performanceScale)
        ? prev.performanceScale.map((r, i) =>
            i === index ? { ...r, label: value } : r,
          )
        : prev.performanceScale;

      // la etiqueta no afecta validación numérica, pero la reevaluamos por si acaso
      const { errors } = validatePerformanceScale(next);
      setScaleErrors(errors);

      return { ...prev, performanceScale: next };
    });
  }, []);

  const addScaleRow = useCallback(() => {
    setEvaluation((prev) => {
      const arr = Array.isArray(prev.performanceScale)
        ? [...prev.performanceScale]
        : [];
      const idx = arr.length + 1;
      const newRow = { label: `Estado ${idx}`, start: "", end: "" };
      const newArr = [...arr, newRow];
      const { errors } = validatePerformanceScale(newArr);
      setScaleErrors(errors);
      return { ...prev, performanceScale: newArr };
    });
  }, []);

  const removeScaleRow = useCallback((index) => {
    setEvaluation((prev) => {
      const arr = Array.isArray(prev.performanceScale)
        ? prev.performanceScale.filter((_, i) => i !== index)
        : [];
      const { errors } = validatePerformanceScale(arr);
      setScaleErrors(errors);
      return { ...prev, performanceScale: arr };
    });
  }, []);

  const updatePromotionThreshold = useCallback((value) => {
    setEvaluation((prev) => ({
      ...prev,
      promotionThreshold: normalizeNumericValue(value),
    }));
  }, []);

  // Indica si hay problemas en la escala que AutoFix puede intentar resolver
  const hasFixableScaleProblems = useMemo(() => {
    const scale = Array.isArray(evaluation.performanceScale)
      ? evaluation.performanceScale
      : [];

    // Requiere que todas las filas tengan valores numéricos para intentar arreglar
    const parsed = scale.map((r) => {
      const sRaw =
        r.start === undefined || r.start === null ? "" : String(r.start).trim();
      const eRaw =
        r.end === undefined || r.end === null ? "" : String(r.end).trim();
      const s = sRaw === "" ? NaN : parseFloat(sRaw.replace(",", "."));
      const e = eRaw === "" ? NaN : parseFloat(eRaw.replace(",", "."));
      return { s, e };
    });

    if (parsed.some((p) => Number.isNaN(p.s) || Number.isNaN(p.e)))
      return false;

    // Si alguna fila no cumple s < e -> arreglable
    for (const p of parsed) {
      if (!(p.s < p.e)) return true;
    }

    // Si hay solapamientos adyacentes (cur.e >= nxt.s) -> arreglable
    for (let i = 0; i < parsed.length - 1; i += 1) {
      const cur = parsed[i];
      const nxt = parsed[i + 1];
      if (cur.e >= nxt.s - EPS) return true;
    }

    // Duplicados exactos también pueden ser arreglados
    for (let i = 0; i < parsed.length; i += 1) {
      for (let j = i + 1; j < parsed.length; j += 1) {
        if (
          Math.abs(parsed[i].s - parsed[j].s) < EPS &&
          Math.abs(parsed[i].e - parsed[j].e) < EPS
        )
          return true;
      }
    }

    return false;
  }, [evaluation.performanceScale]);

  // Intentar arreglar automáticamente la escala: mantener el orden de filas (Bajo->Básico->Alto->Superior), asegurar inicio < fin y eliminar solapamientos mínimos
  const autoFixScale = useCallback(() => {
    const minStep = MIN_STEP;
    const arr = (evaluation.performanceScale || []).map((r, idx) => {
      const sRaw =
        r.start === undefined || r.start === null ? "" : String(r.start).trim();
      const eRaw =
        r.end === undefined || r.end === null ? "" : String(r.end).trim();
      const s = sRaw === "" ? null : parseFloat(sRaw.replace(",", "."));
      const e = eRaw === "" ? null : parseFloat(eRaw.replace(",", "."));
      return { idx, label: r.label || `Estado ${idx + 1}`, s, e };
    });

    // No podemos arreglar filas con valores vacíos o no numéricos
    if (
      arr.some(
        (a) =>
          a.s === null ||
          a.e === null ||
          Number.isNaN(a.s) ||
          Number.isNaN(a.e),
      )
    ) {
      notify.error(
        "No se puede auto-arreglar filas con valores vacíos o no numéricos.",
      );
      return;
    }

    // Asegurar s < e por fila
    arr.forEach((a) => {
      if (!(a.s < a.e)) a.e = Number(Math.min(a.s + minStep, 5).toFixed(6));
    });

    // Mantener orden original de filas (no ordenar por inicio) y resolver solapamientos desplazando la siguiente fila, respetando el límite superior 5
    for (let i = 0; i < arr.length - 1; i += 1) {
      const cur = arr[i];
      const nxt = arr[i + 1];
      if (cur.e >= nxt.s) {
        nxt.s = Number((cur.e + minStep).toFixed(6));
        if (!(nxt.s < nxt.e))
          nxt.e = Number(Math.min(nxt.s + minStep, 5).toFixed(6));
      }
    }

    // Asegurar que ningún valor supere los límites MIN_VALUE..MAX_VALUE
    arr.forEach((a) => {
      if (a.e > MAX_VALUE) a.e = MAX_VALUE;
      if (a.s < MIN_VALUE) a.s = MIN_VALUE;
    });

    // Resolver solapamientos entre filas desplazando la siguiente fila para mantener fin < inicio siguiente
    if (arr.length > 0) {
      for (let i = 0; i < arr.length - 1; i += 1) {
        const cur = arr[i];
        const nxt = arr[i + 1];
        if (cur.e >= nxt.s) {
          nxt.s = Number((cur.e + minStep).toFixed(6));
          if (!(nxt.s < nxt.e))
            nxt.e = Number(Math.min(nxt.s + minStep, MAX_VALUE).toFixed(6));
        }
      }
    }

    // Reconstruir la escala manteniendo el orden original de filas
    const newScale = (evaluation.performanceScale || []).map((r, idx) => {
      const m = arr.find((a) => a.idx === idx);
      if (m) return { ...r, start: String(m.s), end: String(m.e) };
      return r;
    });

    setEvaluation((prev) => ({ ...prev, performanceScale: newScale }));
    const { valid, errors } = validatePerformanceScale(newScale);
    setScaleErrors(errors);

    if (valid) notify.success("Escala arreglada correctamente");
    else
      notify.info(
        "Se intentó arreglar pero quedaron problemas. Revisa los mensajes.",
      );
  }, [evaluation.performanceScale, notify]);

  const usedScaleLabels = Array.isArray(evaluation.performanceScale)
    ? evaluation.performanceScale.map((r) => (r?.label || "").toString())
    : [];

  return (
    <div
      className={` p-6   h-full gap-4 flex flex-col ${isEditing ? "ring-2 ring-accent" : "opacity-95"}`}
    >
      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 md:grid-cols-2 gap-4"
      >
        <div className=" grid grid-cols-5 md:col-span-2  justify-between items-center mb-2">
          <h2 className="text-xl font-semibold flex items-center col-span-4">
            {title}
            <span
              className={`ml-3 inline-flex items-center px-2 py-1 rounded text-xs font-medium ${isEditing ? "bg-green-100 text-green-800" : "bg-gray-200 text-gray-700"}`}
            >
              {isEditing ? "Modo edición" : "Solo lectura"}
            </span>
          </h2>
          <SimpleButton
            type="button"
            onClick={toggleEditing}
            msj={isEditing ? "Cancelar" : "Editar"}
            icon={isEditing ? "X" : "Pencil"}
            bg={isEditing ? "bg-red-500" : "bg-warning"}
            text={"text-surface"}
          />
        </div>

        <div className="md:col-span-2">
          <label className={getLabelClassName("", !isEditing)}>
            Nombre de la institución <span className="text-red-600">*</span>
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            disabled={!isEditing}
            className={getInputClassName(
              `w-full p-2 border rounded bg-surface ${formErrors.name ? "border-red-500" : ""}`,
              !isEditing,
            )}
            required
          />
          {formErrors.name && (
            <p className="text-red-600 text-sm mt-1">{formErrors.name}</p>
          )}
        </div>

        <div className="md:col-span-2">
          <label className={getLabelClassName("", !isEditing)}>NIT</label>
          <input
            type="text"
            name="nit"
            value={formData.nit}
            onChange={handleChange}
            disabled={!isEditing}
            className={getInputClassName(
              "w-full p-2 border rounded bg-surface",
              !isEditing,
            )}
            placeholder="Ej: 900123456-7"
          />
        </div>

        <div className="md:col-span-2">
          <label className={getLabelClassName("", !isEditing)}>Slogan</label>
          <input
            type="text"
            name="slogan"
            value={formData.slogan}
            onChange={handleChange}
            disabled={!isEditing}
            className={getInputClassName(
              "w-full p-2 border rounded bg-surface",
              !isEditing,
            )}
          />
        </div>

        <div className="md:col-span-2">
          <label className={getLabelClassName("", !isEditing)}>
            Dirección <span className="text-red-600">*</span>
          </label>
          <input
            type="text"
            name="address"
            value={formData.address}
            onChange={handleChange}
            disabled={!isEditing}
            className={getInputClassName(
              `w-full p-2 border rounded bg-surface ${formErrors.address ? "border-red-500" : ""}`,
              !isEditing,
            )}
          />
          {formErrors.address && (
            <p className="text-red-600 text-sm mt-1">{formErrors.address}</p>
          )}
        </div>

        <div>
          <DepartmentSelector
            name="department_id"
            label="Departamento"
            value={formData.department_id}
            onChange={handleChange}
            className={getInputClassName(
              "w-full p-2 border rounded bg-surface",
              !isEditing,
            )}
            disabled={!isEditing}
          />
        </div>

        <div>
          <CitySelector
            name="municipality"
            label="Ciudad/Municipio"
            value={formData.municipality}
            onChange={handleChange}
            departmentId={formData.department_id}
            className={getInputClassName(
              `w-full p-2 border rounded bg-surface ${formErrors.municipality ? "border-red-500" : ""}`,
              !isEditing,
            )}
            disabled={!isEditing}
            required
          />
          {formErrors.municipality && (
            <p className="text-red-600 text-sm mt-1">
              {formErrors.municipality}
            </p>
          )}
        </div>

        <div>
          <label className={getLabelClassName("", !isEditing)}>
            Teléfono <span className="text-red-600">*</span>
          </label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            disabled={!isEditing}
            className={getInputClassName(
              `w-full p-2 border rounded bg-surface ${formErrors.phone ? "border-red-500" : ""}`,
              !isEditing,
            )}
          />
          {formErrors.phone && (
            <p className="text-red-600 text-sm mt-1">{formErrors.phone}</p>
          )}
        </div>

        <div>
          <label className={getLabelClassName("", !isEditing)}>
            Correo electrónico <span className="text-red-600">*</span>
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            disabled={!isEditing}
            className={getInputClassName(
              `w-full p-2 border rounded bg-surface ${formErrors.email ? "border-red-500" : ""}`,
              !isEditing,
            )}
          />
          {formErrors.email && (
            <p className="text-red-600 text-sm mt-1">{formErrors.email}</p>
          )}
        </div>

        <div>
          <label className={getLabelClassName("", !isEditing)}>
            Nombre del director <span className="text-red-600">*</span>
          </label>
          <input
            type="text"
            name="principalName"
            value={formData.principalName}
            onChange={handleChange}
            disabled={!isEditing}
            className={getInputClassName(
              `w-full p-2 border rounded bg-surface ${formErrors.principalName ? "border-red-500" : ""}`,
              !isEditing,
            )}
          />
          {formErrors.principalName && (
            <p className="text-red-600 text-sm mt-1">
              {formErrors.principalName}
            </p>
          )}
        </div>

        <div>
          <label>Firma del director</label>
          {isEditing ? (
            <FileChooser
              name="signaturePrincipal"
              onChange={handleChange}
              className="w-full p-2 border rounded"
            />
          ) : (
            <p className="p-2">
              {formData.signaturePrincipal ? "Archivo cargado" : "No cargado"}
            </p>
          )}
        </div>

        <div className="md:col-span-2">
          <label className={getLabelClassName("", !isEditing)}>
            Nombre del coordinador <span className="text-red-600">*</span>
          </label>
          <input
            type="text"
            name="coordinadorName"
            value={formData.coordinadorName}
            onChange={handleChange}
            disabled={!isEditing}
            className={getInputClassName(
              `w-full p-2 border rounded bg-surface ${formErrors.coordinadorName ? "border-red-500" : ""}`,
              !isEditing,
            )}
          />
          {formErrors.coordinadorName && (
            <p className="text-red-600 text-sm mt-1">
              {formErrors.coordinadorName}
            </p>
          )}
        </div>

        <div>
          <label>Logo de la institución</label>
          {isEditing ? (
            <FileChooser
              name="logo"
              onChange={handleChange}
              className="w-full p-2 border rounded"
            />
          ) : (
            <p className="p-2">
              {formData.logo ? "Archivo cargado" : "No cargado"}
            </p>
          )}
        </div>

        <div>
          <label>Tema</label>
          <SimpleButton
            type="button"
            onClick={handleOpenThemeModal}
            className="mt-2"
            msj={"Modificar tema"}
            icon={"Pencil"}
            text={"text-surface"}
            bg={"bg-secondary"}
            disabled={!isEditing}
          />
        </div>

        <div>
          <label className={getLabelClassName("", !isEditing || isUpdate)}>
            Código DANE {!isUpdate && <span className="text-red-600">*</span>}
          </label>
          <input
            type="text"
            name="codDane"
            value={formData.codDane}
            onChange={handleChange}
            disabled={!isEditing || isUpdate}
            className={getInputClassName(
              `w-full p-2 border rounded bg-surface ${formErrors.codDane ? "border-red-500" : ""}`,
              !isEditing || isUpdate,
            )}
            placeholder={
              isUpdate
                ? "No se puede modificar en modo actualización"
                : "Ingrese código DANE"
            }
          />
          {formErrors.codDane && (
            <p className="text-red-600 text-sm mt-1">{formErrors.codDane}</p>
          )}
        </div>

        <div>
          <JourneySelect
            label="Jornada"
            name="workday"
            value={formData.workday}
            onChange={handleChange}
            className={getInputClassName(
              `w-full p-2 border rounded bg-surface ${formErrors.workday ? "border-red-500" : ""}`,
              !isEditing,
            )}
            disabled={!isEditing}
            required
          />
          {formErrors.workday && (
            <p className="text-red-600 text-sm mt-1">{formErrors.workday}</p>
          )}
        </div>

        <div className="md:col-span-2 mt-2 border-t pt-4">
          <h3 className="text-lg font-semibold mb-2">Sistema de evaluación</h3>

          {isEditing ? (
            <div className="grid grid-cols-1 gap-3">
              <div>
                {Array.isArray(evaluation.performanceScale) &&
                evaluation.performanceScale.length === 0 ? (
                  isEditing ? (
                    <div className="flex justify-center items-center py-6">
                      <div className="w-40 py-4">
                        <SimpleButton
                          type="button"
                          onClick={addScaleRow}
                          msj={"Agregar estado"}
                          icon={"Plus"}
                          text={"text-surface"}
                          bg={"bg-secondary"}
                        />
                      </div>
                    </div>
                  ) : (
                    <p className="p-2">-</p>
                  )
                ) : (
                  <div className="overflow-x-auto py-2 rounded-t-2xl">
                    <table className="w-full table-auto rounded-t-2xl">
                      <thead className="bg-primary text-surface rounded-t-2xl">
                        <tr className=" border rounded-tl-2xl">
                          <th
                            rowSpan={2}
                            className="p-2 text-center border rounded-tl-2xl"
                          >
                            Escala de desempeño
                          </th>
                          <th colSpan={2} className="p-2 text-center">
                            Rango nota
                          </th>

                          <th
                            rowSpan={2}
                            className="p-2 text-center border rounded-tr-2xl"
                          >
                            Acciones
                          </th>
                        </tr>
                        <tr className=" rounded-t-2xl">
                          <th className="p-2 text-center border">Desde</th>
                          <th className="p-2 text-center border">Hasta</th>
                        </tr>
                      </thead>
                      <tbody className="bg-surface rounded-b-2xl">
                        {(Array.isArray(evaluation.performanceScale)
                          ? evaluation.performanceScale
                          : []
                        ).map((row, idx) => (
                          <tr key={`${row?.label || idx}-${idx}`} className="">
                            <td className="p-2 border">
                              {isEditing ? (
                                <select
                                  value={
                                    [
                                      "Superior",
                                      "Alto",
                                      "Básico",
                                      "Bajo",
                                    ].includes(row.label)
                                      ? row.label
                                      : ""
                                  }
                                  onChange={(e) =>
                                    updateScaleLabel(idx, e.target.value)
                                  }
                                  className="w-full p-1 border rounded bg-white"
                                >
                                  <option value="">Seleccione</option>
                                  <option
                                    value="Bajo"
                                    disabled={
                                      usedScaleLabels.includes("Bajo") &&
                                      row.label !== "Bajo"
                                    }
                                  >
                                    Bajo
                                  </option>
                                  <option
                                    value="Básico"
                                    disabled={
                                      usedScaleLabels.includes("Básico") &&
                                      row.label !== "Básico"
                                    }
                                  >
                                    Básico
                                  </option>
                                  <option
                                    value="Alto"
                                    disabled={
                                      usedScaleLabels.includes("Alto") &&
                                      row.label !== "Alto"
                                    }
                                  >
                                    Alto
                                  </option>
                                  <option
                                    value="Superior"
                                    disabled={
                                      usedScaleLabels.includes("Superior") &&
                                      row.label !== "Superior"
                                    }
                                  >
                                    Superior
                                  </option>
                                </select>
                              ) : (
                                row.label || `Estado ${idx + 1}`
                              )}
                            </td>
                            <td className="p-2 text-center border">
                              <input
                                type="number"
                                step="0.01"
                                min={0}
                                max={5}
                                value={row.start ?? ""}
                                onChange={(e) =>
                                  updateScaleValue(idx, "start", e.target.value)
                                }
                                onKeyDown={(e) => {
                                  const blocked = ["e", "E", "+", "-"];
                                  if (blocked.includes(e.key))
                                    e.preventDefault();
                                }}
                                disabled={!isEditing}
                                className={`w-full p-1 border rounded text-center`}
                                placeholder="Inicio"
                              />
                            </td>
                            <td className="p-2 text-center border">
                              <input
                                type="number"
                                step="0.01"
                                min={0}
                                max={5}
                                value={row.end ?? ""}
                                onChange={(e) =>
                                  updateScaleValue(idx, "end", e.target.value)
                                }
                                onKeyDown={(e) => {
                                  const blocked = ["e", "E", "+", "-"];
                                  if (blocked.includes(e.key))
                                    e.preventDefault();
                                }}
                                disabled={!isEditing}
                                className={`w-full p-1 border rounded text-center`}
                                placeholder="Fin"
                              />
                            </td>
                            <td className="p-2 text-center border">
                              {isEditing ? (
                                <SimpleButton
                                  type="button"
                                  onClick={() => removeScaleRow(idx)}
                                  msj={"Borrar"}
                                  icon={"Trash2"}
                                  text={"text-surface"}
                                  bg={"bg-red-600"}
                                  className="w-auto px-2"
                                />
                              ) : null}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {scaleErrors && scaleErrors.length > 0 ? (
                  <div className="mt-2 text-sm text-red-600">
                    <ul>
                      {scaleErrors.map((err, i) => (
                        <li key={i}>⚠️ {err}</li>
                      ))}
                    </ul>
                  </div>
                ) : null}

                {isEditing &&
                  Array.isArray(evaluation.performanceScale) &&
                  evaluation.performanceScale.length > 0 && (
                    <div className="flex justify-end mb-2">
                      <div className="flex gap-2 items-center">
                        <div className="w-40">
                          <SimpleButton
                            type="button"
                            onClick={addScaleRow}
                            msj={"Agregar estado"}
                            icon={"Plus"}
                            text={"text-surface"}
                            bg={"bg-secondary"}
                          />
                        </div>

                        {hasFixableScaleProblems ? (
                          <div className="w-40">
                            <SimpleButton
                              type="button"
                              onClick={() => autoFixScale()}
                              msj={"Auto arreglar"}
                              icon={"RefreshCw"}
                              text={"text-surface"}
                              bg={"bg-secondary"}
                            />
                          </div>
                        ) : (
                          <div className="w-40">
                            <SimpleButton
                              type="button"
                              onClick={() => autoFixScale()}
                              msj={"Auto arreglar"}
                              icon={"RefreshCw"}
                              text={"text-surface"}
                              bg={"bg-secondary"}
                              disabled
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                {/* Botón para intentar arreglar automáticamente */}
                <div className="flex items-center gap-3 mt-3">
                  <div className="flex-1">
                    <label className={getLabelClassName("", !isEditing)}>
                      Umbral de promoción (valor mínimo)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min={0}
                      max={5}
                      name="promotionThreshold"
                      value={evaluation.promotionThreshold}
                      onChange={(e) => updatePromotionThreshold(e.target.value)}
                      onKeyDown={(e) => {
                        const blocked = ["e", "E", "+", "-"];
                        if (blocked.includes(e.key)) e.preventDefault();
                      }}
                      disabled={!isEditing}
                      className="w-full p-2 border rounded bg-surface"
                      placeholder="Ej: 3.0"
                    />
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              <div>
                <label>Escala de desempeño</label>
                <div className="p-2 bg-surface rounded">
                  {Array.isArray(evaluation.performanceScale) &&
                  evaluation.performanceScale.length > 0 ? (
                    <table className="w-full table-auto border rounded bg-surface">
                      <thead>
                        <tr className="bg-primary text-surface">
                          <th className="p-2 text-left">Estado</th>
                          <th className="p-2 text-center">Inicio</th>
                          <th className="p-2 text-center">Fin</th>
                        </tr>
                      </thead>
                      <tbody>
                        {evaluation.performanceScale.map((row, idx) => (
                          <tr key={row?.label || idx} className="border-t">
                            <td className="p-2">{row.label}</td>
                            <td className="p-2 text-center">
                              {row.start ?? "-"}
                            </td>
                            <td className="p-2 text-center">
                              {row.end ?? "-"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <p className="p-2">-</p>
                  )}
                </div>

                <div className="mt-2">
                  <label>Umbral de promoción (valor mínimo)</label>
                  <p className="p-2">{evaluation.promotionThreshold || "-"}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {!isUpdate ? (
          <>
            <div className="md:col-span-2 mt-2 border-t pt-4">
              <h3 className="text-lg font-semibold mb-2">Sedes</h3>

              {isEditing && (
                <div className="flex justify-center ">
                  <div className="w-2/5">
                    <SimpleButton
                      type="button"
                      onClick={addSede}
                      msj={"Agregar sede"}
                      icon={"Plus"}
                      text={"text-surface"}
                      bg={"bg-secondary"}
                    />
                  </div>
                </div>
              )}

              {Array.isArray(formData.sede) && formData.sede.length > 0 ? (
                <div className="mt-4 grid grid-cols-1 gap-3">
                  {formData.sede.map((sede, index) => (
                    <div
                      key={`${sede?.name || "sede"}-${index}`}
                      className="border rounded p-4 bg-surface"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <p className="font-semibold">Sede #{index + 1}</p>
                        <div>
                          {isEditing && (
                            <SimpleButton
                              type="button"
                              onClick={() => removeSede(index)}
                              msj={"Borrar"}
                              icon={"Trash2"}
                              text={"text-surface"}
                              bg={"bg-red-600"}
                              className="w-auto px-3"
                            />
                          )}
                        </div>
                      </div>

                      {isEditing ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label>
                              Nombre <span className="text-red-600">*</span>
                            </label>
                            <input
                              type="text"
                              value={sede?.name_sede ?? ""}
                              onChange={(e) =>
                                updateSedeField(
                                  index,
                                  "name_sede",
                                  e.target.value,
                                )
                              }
                              className={`w-full p-2 border rounded bg-surface ${
                                formErrors.sede?.[index]?.name_sede
                                  ? "border-red-500"
                                  : ""
                              }`}
                            />
                            {formErrors.sede?.[index]?.name_sede && (
                              <p className="text-red-600 text-sm mt-1">
                                {formErrors.sede[index].name_sede}
                              </p>
                            )}
                          </div>

                          <div>
                            <label>
                              Teléfono <span className="text-red-600">*</span>
                            </label>
                            <input
                              type="text"
                              value={sede?.phone ?? ""}
                              onChange={(e) =>
                                updateSedeField(index, "phone", e.target.value)
                              }
                              className={`w-full p-2 border rounded bg-surface ${
                                formErrors.sede?.[index]?.phone
                                  ? "border-red-500"
                                  : ""
                              }`}
                            />
                            {formErrors.sede?.[index]?.phone && (
                              <p className="text-red-600 text-sm mt-1">
                                {formErrors.sede[index].phone}
                              </p>
                            )}
                          </div>

                          <div className="md:col-span-2">
                            <label>
                              Dirección <span className="text-red-600">*</span>
                            </label>
                            <input
                              type="text"
                              value={sede?.adress ?? ""}
                              onChange={(e) =>
                                updateSedeField(index, "adress", e.target.value)
                              }
                              className={`w-full p-2 border rounded bg-surface ${
                                formErrors.sede?.[index]?.adress
                                  ? "border-red-500"
                                  : ""
                              }`}
                            />
                            {formErrors.sede?.[index]?.adress && (
                              <p className="text-red-600 text-sm mt-1">
                                {formErrors.sede[index].adress}
                              </p>
                            )}
                          </div>

                          <div>
                            <JourneySelect
                              label="Jornada"
                              name="jornada"
                              value={sede?.jornada ?? ""}
                              filterValue={
                                String(formData.workday) !== "3"
                                  ? String(formData.workday)
                                  : "3"
                              }
                              onChange={(e) =>
                                updateSedeField(
                                  index,
                                  "jornada",
                                  e.target.value,
                                )
                              }
                              className={`w-full p-2 border rounded bg-surface ${
                                formErrors.sede?.[index]?.jornada
                                  ? "border-red-500"
                                  : ""
                              }`}
                              required
                            />
                            {formErrors.sede?.[index]?.jornada && (
                              <p className="text-red-600 text-sm mt-1">
                                {formErrors.sede[index].jornada}
                              </p>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label>Nombre</label>
                            <p className="p-2">{sede?.name_sede ?? "-"}</p>
                          </div>

                          <div>
                            <label>Teléfono</label>
                            <p className="p-2">{sede?.phone ?? "-"}</p>
                          </div>

                          <div className="md:col-span-2">
                            <label>Dirección</label>
                            <p className="p-2">{sede?.adress ?? "-"}</p>
                          </div>

                          <div>
                            <label>Jornada</label>
                            <p className="p-2">{sede?.jornada ?? "-"}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          </>
        ) : null}

        {isEditing && (
          <div className="md:col-span-2 mt-4">
            <SimpleButton
              type="submit"
              msj={loading ? "Procesando..." : primaryButtonLabel}
              icon={loading ? "Loader" : "Save"}
              text={"text-surface"}
              bg={loading ? "bg-gray-400" : "bg-secondary"}
              disabled={loading || (scaleErrors && scaleErrors.length > 0)}
            />
          </div>
        )}
      </form>

      {!isUpdate ? <div className="mt-4 border-t pt-4"></div> : null}

      <ThemeModal
        isOpen={isThemeModalOpen}
        onClose={handleCloseThemeModal}
        color={themeModalColor}
        setColor={handleSetColor}
      />
    </div>
  );
};

export default ProfileSchool;
