import React, {
  useState,
  useRef,
  useCallback,
  useContext,
  useEffect,
  useMemo,
} from "react";
import { useNavigate } from "react-router-dom";
import jsPDF from "jspdf";
import SignatureCanvas from "react-signature-canvas";

/** Comprime cualquier imagen (URL, blob:// o base64) a JPEG con canvas. */
const compressToJpeg = (src, quality = 0.75, maxWidth = 400) =>
  new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const scale = img.width > maxWidth ? maxWidth / img.width : 1;
      const w = Math.round(img.width * scale);
      const h = Math.round(img.height * scale);
      const cv = document.createElement("canvas");
      cv.width = w;
      cv.height = h;
      const ctx = cv.getContext("2d");
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, w, h);
      ctx.drawImage(img, 0, 0, w, h);
      resolve(cv.toDataURL("image/jpeg", quality));
    };
    img.onerror = reject;
    img.src = src;
  });
import SimpleButton from "../atoms/SimpleButton";
import tourReserveSpot from "../../tour/tourReserveSpot";

import TypeDocumentSelector from "../molecules/TypeDocumentSelector";
import DepartmentSelector from "../molecules/DepartmentSelector";
import CitySelector from "../molecules/CitySelector";
import Loader from "../atoms/Loader";
import * as schoolService from "../../services/schoolService";
import { upload } from "../../services/uploadService";
import {
  getStudentGuardian,
  getDataStudentGuardian,
} from "../../services/studentService";
import useSchool from "../../lib/hooks/useSchool";
import { useNotify } from "../../lib/hooks/useNotify";
import useData from "../../lib/hooks/useData";
import { AuthContext } from "../../lib/context/AuthContext";

// ───────────────────── Constantes ─────────────────────

const INITIAL_STUDENT = {
  first_name: "",
  second_name: "",
  first_lastname: "",
  second_lastname: "",
  telephone: "",
  email: "",
  identification: "",
  identificationtype: "",
  sede: "",
  jornada: "",
  grade: "",
  fecha_nacimiento: "",
  direccion: "",
  gender: "",
  per_id: "",
};

const INITIAL_GUARDIAN = {
  parentesco: "",
  first_name: "",
  second_name: "",
  first_lastname: "",
  second_lastname: "",
  telephone: "",
  email: "",
  identification: "",
  identificationtype: "",
};

const PARENTESCO_OPTIONS = [
  "Madre",
  "Padre",
  "Abuelo(a)",
  "Tío(a)",
  "Hermano(a)",
  "Tutor legal",
  "Otro",
];

const inputClass =
  "w-full p-2 border rounded bg-surface text-sm text-on-surface outline-none focus:ring-2 focus:ring-primary/40 border-secondary/40";

const Field = ({ label, error, children }) => (
  <div className="flex flex-col gap-1">
    <label className="text-sm font-medium text-on-surface">{label}</label>
    {children}
    {error && <p className="text-xs text-error">{error}</p>}
  </div>
);

// ───────────────────── Sección reutilizable de acudiente ─────────────────────

const GuardianFormSection = ({ prefix, data, onChange, errors }) => (
  <section
    id={`tour-rs-${prefix}-section`}
    className="border border-secondary/30 rounded-lg overflow-hidden"
  >
    <div className="bg-primary text-surface p-3">
      <h3 className="text-xl font-bold">Datos del acudiente</h3>
    </div>

    <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
      <div id={`tour-rs-${prefix}-parentesco`} className="md:col-span-2">
        <Field label="Parentesco" error={errors[`${prefix}_parentesco`]}>
          <select
            name="parentesco"
            value={data.parentesco}
            onChange={onChange}
            className={inputClass}
          >
            <option value="">Selecciona parentesco</option>
            {PARENTESCO_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </Field>
      </div>
      <div id={`tour-rs-${prefix}-doctype`}>
        <Field error={errors[`${prefix}_identificationtype`]}>
          <TypeDocumentSelector
            name="identificationtype"
            value={data.identificationtype}
            onChange={onChange}
            placeholder="Selecciona un tipo"
            className={inputClass}
          />
        </Field>
      </div>

      <div id={`tour-rs-${prefix}-identification`}>
        <Field
          label="N.º de identificación"
          error={errors[`${prefix}_identification`]}
        >
          <input
            type="text"
            name="identification"
            value={data.identification}
            onChange={onChange}
            className={inputClass}
          />
        </Field>
      </div>

      <div id={`tour-rs-${prefix}-firstname`}>
        <Field label="Primer nombre" error={errors[`${prefix}_first_name`]}>
          <input
            type="text"
            name="first_name"
            value={data.first_name}
            onChange={onChange}
            className={inputClass}
          />
        </Field>
      </div>

      <Field label="Segundo nombre" error={errors[`${prefix}_second_name`]}>
        <input
          type="text"
          name="second_name"
          value={data.second_name}
          onChange={onChange}
          className={inputClass}
        />
      </Field>

      <div id={`tour-rs-${prefix}-firstlastname`}>
        <Field
          label="Primer apellido"
          error={errors[`${prefix}_first_lastname`]}
        >
          <input
            type="text"
            name="first_lastname"
            value={data.first_lastname}
            onChange={onChange}
            className={inputClass}
          />
        </Field>
      </div>

      <Field
        label="Segundo apellido"
        error={errors[`${prefix}_second_lastname`]}
      >
        <input
          type="text"
          name="second_lastname"
          value={data.second_lastname}
          onChange={onChange}
          className={inputClass}
        />
      </Field>

      <div id={`tour-rs-${prefix}-telephone`}>
        <Field label="Teléfono" error={errors[`${prefix}_telephone`]}>
          <input
            type="tel"
            name="telephone"
            value={data.telephone}
            onChange={onChange}
            className={inputClass}
          />
        </Field>
      </div>

      <Field label="Correo electrónico" error={errors[`${prefix}_email`]}>
        <input
          type="email"
          name="email"
          value={data.email}
          onChange={onChange}
          className={inputClass}
        />
      </Field>
    </div>
  </section>
);

// ───────────────────── Componente principal ─────────────────────

const ReserveSpot = ({ mode = "Externo", onSuccess }) => {
  const notify = useNotify();
  const navigate = useNavigate();
  const {
    valuesReservations,
    loadingValuesReservations,
    loadValuesReservations,
    registerSlot,
    registerSlotsInternal,
  } = useSchool();

  // ─── Auth (opcional: solo disponible en rutas autenticadas) ───
  const authCtx = useContext(AuthContext);
  const rol = authCtx?.rol;
  const idPersona = authCtx?.idPersona;
  const isGuardian = rol === 5 || rol === "5";

  // ─── Origen de la reserva ───
  // Si el usuario tiene rol asignado proviene del dashboard (Interna);
  // si no existe rol (acceso por link externo) es Externa.
  const esInterno = !!rol;

  const [student, setStudent] = useState(INITIAL_STUDENT);
  const [guardian, setGuardian] = useState(INITIAL_GUARDIAN);

  // ─── Estudiantes del acudiente (rol 5) ───
  const [guardianStudents, setGuardianStudents] = useState([]);
  const [loadingGuardianStudents, setLoadingGuardianStudents] = useState(false);
  const [selectedGuardianStudentId, setSelectedGuardianStudentId] =
    useState("");
  const [loadingReservationData, setLoadingReservationData] = useState(false);
  const [guardianLinkFirma, setGuardianLinkFirma] = useState("");
  const [guardianId, setGuardianId] = useState(null);

  useEffect(() => {
    if (!isGuardian || !idPersona) return;
    let cancelled = false;
    const load = async () => {
      setLoadingGuardianStudents(true);
      try {
        const data = await getStudentGuardian({
          idPersonaGuardian: Number(idPersona),
        });
        if (!cancelled) setGuardianStudents(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error(
          "ReserveSpot - error al cargar estudiantes del acudiente:",
          err,
        );
        if (!cancelled) setGuardianStudents([]);
      } finally {
        if (!cancelled) setLoadingGuardianStudents(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [isGuardian, idPersona]);

  const handleGuardianStudentSelect = useCallback(
    async (e) => {
      const id = e.target.value;
      setSelectedGuardianStudentId(id);
      if (!id || !idPersona) {
        setGuardianLinkFirma("");
        setGuardianId(null);
        setSignatureSaved(false);
        return;
      }

      setLoadingReservationData(true);
      try {
        const data = await getDataStudentGuardian({
          idPersonaGuardian: Number(idPersona),
          idEstudiante: Number(id),
        });

        if (!data) return;

        // ── Pre-llenar datos del estudiante ──
        setStudent((prev) => ({
          ...prev,
          first_name: data.pnombre_estudiante ?? "",
          second_name: data.snombre_estudiante ?? "",
          first_lastname: data.papellido_estudiante ?? "",
          second_lastname: data.sapellido_estudiante ?? "",
          identification: data.identificacion_estudiante ?? "",
          identificationtype: data.t_identificacion_estudiante
            ? String(data.t_identificacion_estudiante)
            : "",
          gender: data.genero ?? "",
          fecha_nacimiento: data.fecha_nacimiento
            ? data.fecha_nacimiento.split("T")[0]
            : "",
          telephone: data.telefono ?? "",
          email: data.correo ?? "",
          sede: data.fk_sede ? String(data.fk_sede) : "",
          jornada: data.fk_jornada ? String(data.fk_jornada) : "",
          grade: data.id_grado ? String(data.id_grado) : "",
        }));

        // ── Pre-llenar datos del acudiente ──
        setGuardian((prev) => ({
          ...prev,
          first_name: data.primero_nombre ?? "",
          second_name: data.segundo_nombre ?? "",
          first_lastname: data.primer_apellido ?? "",
          second_lastname: data.segundo_apellido ?? "",
          identification: data.numero_identificacion ?? "",
          identificationtype: data.fk_tipo_identificacion
            ? String(data.fk_tipo_identificacion)
            : "",
          telephone: data.telefono_acudiente ?? "",
          email: data.correo_acudiente ?? "",
        }));

        // ── Guardar link_firma e id del acudiente (uso en reservas internas) ──
        const firmaUrl = data.link_firma ?? "";
        setGuardianLinkFirma(firmaUrl);
        setGuardianId(data.id_acudiente ?? null);
        // Si hay firma registrada, considerarla guardada automáticamente
        if (firmaUrl) setSignatureSaved(true);
      } catch (err) {
        console.error("ReserveSpot - error al cargar datos de reserva:", err);
      } finally {
        setLoadingReservationData(false);
      }
    },
    [idPersona],
  );

  // ─── Filtros previos al formulario (dept + municipio) ───
  const [filterDept, setFilterDept] = useState("");
  const [filterCity, setFilterCity] = useState("");

  // Cuando el usuario elige municipio, lanzar POST /values/reservations con {municipioId}
  useEffect(() => {
    if (filterCity) {
      loadValuesReservations(filterCity);
    }
  }, [filterCity, loadValuesReservations]);

  // ─── Grados: carga directa sin depender del token ───
  const [grades, setGrades] = useState([]);
  const [loadingGrades, setLoadingGrades] = useState(false);

  useEffect(() => {
    if (!student.sede || !student.jornada) {
      setGrades([]);
      return;
    }
    let cancelled = false;
    const fetchGrades = async () => {
      setLoadingGrades(true);
      try {
        const result = await schoolService.getGradeSede({
          idSede: Number(student.sede),
          idWorkDay: Number(student.jornada),
        });
        if (!cancelled) {
          const list = Array.isArray(result) ? result : (result?.data ?? []);
          setGrades(list);
        }
      } catch (err) {
        if (!cancelled) setGrades([]);
        console.error("ReserveSpot - error al cargar grados:", err);
      } finally {
        if (!cancelled) setLoadingGrades(false);
      }
    };
    fetchGrades();
    return () => {
      cancelled = true;
    };
  }, [student.sede, student.jornada]);

  const gradeOptions = useMemo(
    () =>
      (Array.isArray(grades) ? grades : [])
        .filter(Boolean)
        .map((g) => ({
          value: String(g.id_grade ?? g.id ?? g.id_grado ?? ""),
          label: g.grado ?? g.nombre ?? g.nombre_grado ?? g.name ?? "",
          grupo: g.grupo ?? "",
        }))
        .filter((g) => g.value && g.label),
    [grades],
  );

  // Carga inicial sin payload (opcional, para pre‑poblar si el API lo permite)
  // useEffect(() => { loadValuesReservations(); }, [loadValuesReservations]);

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // tipos de documento para PDF (traídos del contexto con useData)
  const { typeIdentification } = useData();
  const typeDocumentOptions = useMemo(() => {
    if (!Array.isArray(typeIdentification)) return [];
    return typeIdentification
      .filter(Boolean)
      .map((x) => ({
        value: String(x.id ?? ""),
        label: String(x.name ?? ""),
      }))
      .filter((o) => o.value && o.label);
  }, [typeIdentification]);

  // ─── Firma ───
  const [signatureData, setSignatureData] = useState(""); // JPEG → PDF
  const [signatureDataPng, setSignatureDataPng] = useState(""); // PNG → servicio
  const [signatureSaved, setSignatureSaved] = useState(false);
  const [savingSig, setSavingSig] = useState(false);
  const sigCanvas = useRef(null);

  // ─── Handlers genéricos ───
  const handleStudentChange = (e) => {
    const { name, value, type, files } = e.target;
    setStudent((prev) => ({
      ...prev,
      [name]: type === "file" ? files[0] : value,
    }));
    setErrors((prev) => ({ ...prev, [`student_${name}`]: "" }));
  };

  // ─── Handler en cascada para selects de matrícula ───
  const handleCascadeChange = useCallback((field, value) => {
    setStudent((prev) => {
      const next = { ...prev, [field]: value };
      if (field === "sede") {
        next.jornada = "";
        next.grade = "";
      } else if (field === "jornada") {
        next.grade = "";
      }
      return next;
    });
    setErrors((prev) => ({ ...prev, [`student_${field}`]: "" }));
  }, []);

  // ─── Opciones derivadas del nuevo response ───
  // { id_sede, nombre_sede, fk_jornada, nombre_jornada }
  const sedeOptions = useMemo(() => {
    const unique = new Map();
    valuesReservations.forEach((item) => {
      if (!unique.has(item.id_sede)) unique.set(item.id_sede, item.nombre_sede);
    });
    return [...unique.entries()].map(([value, label]) => ({ value, label }));
  }, [valuesReservations]);

  const jornadaOptions = useMemo(() => {
    if (!student.sede) return [];
    const unique = new Map();
    valuesReservations
      .filter((item) => item.id_sede === student.sede)
      .forEach((item) => {
        if (!unique.has(item.fk_jornada))
          unique.set(item.fk_jornada, item.nombre_jornada);
      });
    const options = [];
    unique.forEach((label, value) => {
      if (label === "Ambas") {
        options.push({ value: "1", label: "Mañana" });
        options.push({ value: "2", label: "Tarde" });
      } else {
        options.push({ value, label });
      }
    });
    return options;
  }, [valuesReservations, student.sede]);

  // ─── Datos completos de la sede seleccionada (nit, cod_dane, link_logo, etc.) ───
  const sedeInfo = useMemo(
    () =>
      valuesReservations.find(
        (item) => String(item.id_sede) === String(student.sede),
      ) ?? null,
    [valuesReservations, student.sede],
  );
  console.debug(
    "Buscando info de sede para ID:",
    student.sede,
    valuesReservations,
  );
  // ─── Logo institucional (precargado para el PDF) ───
  const [logoBase64, setLogoBase64] = useState("");
  useEffect(() => {
    const url = sedeInfo?.link_logo;
    if (!url) {
      setLogoBase64("");
      return;
    }

    // Cargar imagen desde URL externa y convertir a base64
    fetch(url)
      .then((response) => {
        if (!response.ok) throw new Error("Error cargando logo");
        return response.blob();
      })
      .then((blob) => {
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result);
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });
      })
      .then((base64) => compressToJpeg(base64, 0.75, 300))
      .then((compressed) => {
        setLogoBase64(compressed);
      })
      .catch((error) => {
        console.error("❌ Error al cargar logo:", error, url);
        setLogoBase64("");
      });
  }, [sedeInfo]);

  const handleGuardianChange = (e) => {
    const { name, value } = e.target;
    setGuardian((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [`guardian_${name}`]: "" }));
  };

  // ─── Handlers de firma ───
  const handleSignatureEnd = useCallback(() => {
    const raw = sigCanvas.current?.toDataURL("image/png") ?? "";
    if (!raw) {
      setSignatureData("");
      setSignatureDataPng("");
      return;
    }
    setSignatureDataPng(raw);
    compressToJpeg(raw, 0.8, 600)
      .then(setSignatureData)
      .catch(() => setSignatureData(raw));
  }, []);

  const handleClearSignature = useCallback(() => {
    sigCanvas.current?.clear();
    setSignatureData("");
    setSignatureDataPng("");
    setSignatureSaved(false);
  }, []);

  const handleSaveSignature = useCallback(() => {
    if (!signatureData) return;
    setSavingSig(true);
    setTimeout(() => {
      setSignatureSaved(true);
      setSavingSig(false);
    }, 300);
  }, [signatureData]);

  // ─── Formulario completo (activa el botón de PDF) ───
  const isFormComplete = useMemo(() => {
    const studentOk =
      student.first_name.trim() &&
      student.first_lastname.trim() &&
      student.identification.trim() &&
      student.identificationtype &&
      student.sede &&
      student.jornada &&
      student.grade;

    if (!studentOk || !(signatureSaved || (esInterno && guardianLinkFirma)))
      return false;

    return !!(
      guardian.parentesco &&
      guardian.first_name.trim() &&
      guardian.first_lastname.trim() &&
      guardian.telephone.trim() &&
      guardian.identification.trim() &&
      guardian.identificationtype
    );
  }, [student, guardian, signatureSaved, esInterno, guardianLinkFirma]);

  // ─── Helpers para etiquetas de opciones ───
  const getLabel = useCallback((options, value) => {
    const opt = options.find((o) => String(o.value) === String(value));
    return opt ? opt.label : value || "—";
  }, []);

  // Devuelve "ID - Nombre" para los selects de matrícula
  const getLabelWithId = useCallback((options, value) => {
    if (!value) return "—";
    const opt = options.find((o) => String(o.value) === String(value));
    return opt ? `${opt.label}` : String(value);
  }, []);

  // ─── Generar PDF ───
  const handleGeneratePDF = useCallback(() => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 14;
    const lh = 7;
    let y = 20;

    const addSectionHeader = (text) => {
      if (y > 250) {
        doc.addPage();
        y = 20;
      }
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.setFillColor(41, 98, 160);
      doc.setTextColor(255, 255, 255);
      doc.rect(margin, y - 5, pageWidth - margin * 2, lh + 1, "F");
      doc.text(text, margin + 2, y + 1);
      doc.setTextColor(40, 40, 40);
      y += lh + 3;
    };

    const addRow = (label, value, xOffset = 0) => {
      if (y > 270) {
        doc.addPage();
        y = 20;
      }
      doc.setFontSize(9);
      doc.setFont("helvetica", "bold");
      doc.text(`${label}:`, margin + xOffset, y);
      doc.setFont("helvetica", "normal");
      const maxW = (pageWidth - margin * 2) / 2 - 44;
      const lines = doc.splitTextToSize(value || "—", maxW);
      doc.text(lines, margin + xOffset + 44, y);
      y += lh * lines.length;
    };

    const addTwoColumns = (pairs) => {
      const colW = (pageWidth - margin * 2) / 2;
      let i = 0;
      while (i < pairs.length) {
        if (y > 270) {
          doc.addPage();
          y = 20;
        }
        const rowY = y;
        const isFullRow = pairs[i][2] === true;

        doc.setFontSize(9);
        doc.setFont("helvetica", "bold");
        doc.text(`${pairs[i][0]}:`, margin, rowY);
        doc.setFont("helvetica", "normal");

        if (isFullRow) {
          // Ocupa todo el ancho disponible
          const maxW = pageWidth - margin * 2 - 38;
          const lines = doc.splitTextToSize(pairs[i][1] || "—", maxW);
          doc.text(lines, margin + 38, rowY);
          y += lh * lines.length - 2;
          i += 1;
        } else {
          doc.text(pairs[i][1] || "—", margin + 38, rowY);
          // columna derecha (si existe y no es full-row)
          if (pairs[i + 1] && pairs[i + 1][2] !== true) {
            doc.setFont("helvetica", "bold");
            doc.text(`${pairs[i + 1][0]}:`, margin + colW, rowY);
            doc.setFont("helvetica", "normal");
            doc.text(pairs[i + 1][1] || "—", margin + colW + 38, rowY);
            i += 2;
          } else {
            i += 1;
          }
          y += lh - 2;
        }
      }
    };

    // ── Encabezado institucional ──
    const logoW = 28;
    const logoH = 28;
    const textX = margin + logoW + 5; // texto empieza después del logo
    const textW = pageWidth - textX - margin;
    const cx = textX + textW / 2; // centro del área de texto
    const headerStartY = y;

    // Logo a la izquierda
    if (logoBase64) {
      console.log("Agregando logo al PDF:", sedeInfo?.link_logo);
      doc.addImage(logoBase64, "JPEG", margin, headerStartY - 4, logoW, logoH);
    }

    // Nombre del colegio
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(41, 98, 160);
    doc.text(
      sedeInfo?.nombre_sede ?? getLabelWithId(sedeOptions, student.sede),
      cx,
      y,
      {
        align: "center",
      },
    );
    y += lh;

    // Eslogan / subtítulo institución
    if (sedeInfo?.eslogan) {
      doc.setFontSize(8.5);
      doc.setFont("helvetica", "italic");
      doc.setTextColor(60, 60, 60);
      doc.text(sedeInfo.eslogan, cx, y, { align: "center" });
      y += lh;
    }

    // NIT
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(60, 60, 60);
    doc.text(`Nit. ${sedeInfo?.nit ?? "—"}`, cx, y, { align: "center" });
    y += lh;

    // Dirección y teléfono
    if (sedeInfo?.direccion) {
      doc.text(`Dirección: ${sedeInfo.direccion}`, cx, y, { align: "center" });
      y += lh;
    }
    if (sedeInfo?.telefono) {
      doc.text(`Tel: ${sedeInfo.telefono}`, cx, y, { align: "center" });
      y += lh;
    }

    // DANE
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.setTextColor(40, 40, 40);
    doc.text(
      `Cód. DANE: ${sedeInfo?.cod_dane ?? "—"}${sedeInfo?.sede_tip ? `     Tipo: ${sedeInfo.sede_tip}` : ""}`,
      cx,
      y,
      { align: "center" },
    );
    y += lh + 4;

    // Garantiza que y esté debajo del logo antes del título
    const logoBottom = headerStartY - 4 + logoH + 4;
    if (y < logoBottom) y = logoBottom;

    // Título del documento (centrado en página completa)
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(41, 98, 160);
    doc.text("Reserva de cupo", pageWidth / 2, y, { align: "center" });
    y += lh + 2;

    // Fecha de generación (centrado en página completa)
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 100, 100);
    doc.text(
      `Generado el ${new Date().toLocaleDateString("es-CO", { dateStyle: "long" })}`,
      pageWidth / 2,
      y,
      { align: "center" },
    );
    doc.setTextColor(40, 40, 40);
    y += lh + 8;

    // ── Estudiante — Información personal ──
    addSectionHeader("Datos del estudiante — Información personal");
    addTwoColumns([
      [
        "Tipo documento",
        getLabelWithId(typeDocumentOptions, student.identificationtype) || "—",
      ],
      ["N.º identificación", student.identification],
      ["Primer nombre", student.first_name],
      ["Segundo nombre", student.second_name],
      ["Primer apellido", student.first_lastname],
      ["Segundo apellido", student.second_lastname],
      ["Género", student.gender],
      ["Fecha nacimiento", student.fecha_nacimiento],
      ["Teléfono", student.telephone],
      ["Email", student.email],
      ["Dirección", student.direccion],
    ]);
    y += 4;

    // ── Estudiante — Información de matrícula ──
    addSectionHeader("Datos del estudiante — Información de matrícula");
    addTwoColumns([
      ["Sede", getLabelWithId(sedeOptions, student.sede), true],
      ["Jornada", getLabelWithId(jornadaOptions, student.jornada)],
      ["Grado", getLabelWithId(gradeOptions, student.grade) || "—"],
    ]);
    y += 4;

    // ── Acudiente ──
    addSectionHeader("Datos del acudiente");
    addTwoColumns([
      ["Parentesco", guardian.parentesco || "—"],
      [
        "Tipo documento",
        getLabelWithId(typeDocumentOptions, guardian.identificationtype) || "—",
      ],
      ["N.º identificación", guardian.identification],
      ["Primer nombre", guardian.first_name],
      ["Segundo nombre", guardian.second_name],
      ["Primer apellido", guardian.first_lastname],
      ["Segundo apellido", guardian.second_lastname],
      ["Teléfono", guardian.telephone],
      ["Email", guardian.email],
    ]);
    y += 4;

    // ── Firma ──
    if (y > 200) {
      doc.addPage();
      y = 10;
    }
    addSectionHeader("Firma del acudiente");
    if (signatureData) {
      // usar un ancho aún más reducido para la firma en el PDF
      // primero tomamos la mitad del área disponible
      const fullW = (pageWidth - margin * 2) / 2;
      // después usamos un cuarto de esa mitad (≈1/8 de la página)
      const sigW = Math.min(fullW * 0.75, 100);
      const sigH = sigW * (9 / 20); // mantener relación 20:9
      if (y + sigH > 270) {
        doc.addPage();
        y = 30;
      }
      // centrar la firma reducida en el área disponible (basada en fullW original)
      const sigX = margin;
      doc.addImage(signatureData, "JPEG", sigX, y, sigW, sigH);
      y += sigH + 3;
    }

    doc.save("reserva_cupo.pdf");
  }, [
    student,
    guardian,
    signatureData,
    sedeOptions,
    jornadaOptions,
    getLabelWithId,
    logoBase64,
    sedeInfo,
  ]);

  // ─── Validación ───
  const validate = () => {
    const e = {};

    // Estudiante
    if (!student.first_name.trim()) e.student_first_name = "Obligatorio.";
    if (!student.first_lastname.trim())
      e.student_first_lastname = "Obligatorio.";
    if (!student.identification.trim())
      e.student_identification = "Obligatorio.";
    if (!student.identificationtype)
      e.student_identificationtype = "Selecciona tipo de documento.";
    if (!student.sede) e.student_sede = "Selecciona una sede.";
    if (!student.jornada) e.student_jornada = "Selecciona una jornada.";
    if (!student.grade) e.student_grade = "Selecciona un grado.";

    // Acudiente
    if (!guardian.parentesco)
      e.guardian_parentesco = "Selecciona el parentesco.";
    if (!guardian.first_name.trim()) e.guardian_first_name = "Obligatorio.";
    if (!guardian.first_lastname.trim())
      e.guardian_first_lastname = "Obligatorio.";
    if (!guardian.telephone.trim()) e.guardian_telephone = "Obligatorio.";
    if (!guardian.identification.trim())
      e.guardian_identification = "Obligatorio.";
    if (!guardian.identificationtype)
      e.guardian_identificationtype = "Selecciona tipo de documento.";

    // Firma
    if (!signatureSaved && !(esInterno && guardianLinkFirma))
      e.signature = "Debe dibujar y guardar la firma del acudiente.";

    return e;
  };

  // ─── Submit ───
  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      notify.error("Revisa los campos obligatorios.");
      return;
    }

    setLoading(true);

    try {
      // ── Resolver link de firma según el origen de la reserva ──
      let linkFirma = "";
      if (!esInterno) {
        // Externa: subir la firma dibujada y obtener la URL resultante
        if (signatureDataPng) {
          console.log(
            "Subiendo firma del acudiente (PNG)...",
            signatureDataPng,
          );
          const fd = new FormData();
          fd.append("imageBase64", signatureDataPng);
          fd.append("folder", "acudientes");
          fd.append("identificacion", guardian.identification.trim());
          const uploadRes = await upload(fd, "uploadfirma/acudientes");
          const rawData = uploadRes?.data ?? uploadRes;
          if (Array.isArray(rawData)) {
            const entry =
              rawData.find((e) => e?.field === "imageBase64") ?? rawData[0];
            linkFirma =
              entry?.files?.[0]?.folder ??
              entry?.files?.[0]?.url ??
              entry?.files?.[0]?.path ??
              entry?.folder ??
              entry?.url ??
              entry?.link ??
              entry?.path ??
              "";
          } else if (typeof rawData === "string" && rawData) {
            linkFirma = rawData;
          } else if (rawData && typeof rawData === "object") {
            linkFirma =
              rawData.url ??
              rawData.link ??
              rawData.path ??
              rawData.folder ??
              "";
          }
        }
      } else {
        // Interna: usar el link_firma devuelto por getDataStudentGuardian
        linkFirma = guardianLinkFirma;
      }

      // ── Construir objeto de datos plano (no FormData) ──
      const payload = {
        primer_nombre_estu: student.first_name.trim(),
        segundo_nombre_estu: student.second_name.trim(),
        primer_apellido_estu: student.first_lastname.trim(),
        segundo_apellido_estu: student.second_lastname.trim(),
        correo_estu: student.email.trim(),
        telefono_estu: student.telephone.trim(),
        fk_tipo_identificacion_estu: student.identificationtype
          ? Number(student.identificationtype)
          : null,
        numero_identificacion_estu: student.identification.trim(),
        fecha_nacimiento_estu: student.fecha_nacimiento || null,
        fk_sede: student.sede ? Number(student.sede) : null,
        fk_jornada: student.jornada ? Number(student.jornada) : null,
        fk_grado: student.grade ? Number(student.grade) : null,
        genero: student.gender,
        direccion: student.direccion.trim(),

        parentesco: guardian.parentesco,
        primer_nombre_acu: guardian.first_name.trim(),
        segundo_nombre_acu: guardian.second_name.trim(),
        primer_apellido_acu: guardian.first_lastname.trim(),
        segundo_apellido_acu: guardian.second_lastname.trim(),
        correo_acu: guardian.email.trim(),
        telefono_acu: guardian.telephone.trim(),
        fk_tipo_identificacion_acu: guardian.identificationtype
          ? Number(guardian.identificationtype)
          : null,
        numero_identificacion_acu: guardian.identification.trim(),
        ...(linkFirma ? { link_firma: linkFirma } : {}),
      };

      // ── Registrar reserva de cupo ──
      if (esInterno) {
        const internalPayload = {
          fk_estudiante: Number(selectedGuardianStudentId),
          fk_acudiente:
            guardianId != null ? Number(guardianId) : Number(idPersona),
          fk_sede: student.sede ? Number(student.sede) : null,
          fk_grado: student.grade ? Number(student.grade) : null,
          fk_jornada: student.jornada ? Number(student.jornada) : null,
          parentesco: guardian.parentesco,
        };
        console.log(
          "=== ReserveSpot payload enviado a /slots-internal ===",
          internalPayload,
        );
        await registerSlotsInternal(internalPayload);
      } else {
        await registerSlot(payload);
        console.log("=== ReserveSpot payload enviado a /slots ===", payload);
      }

      notify.success("Reserva de cupo enviada correctamente.");

      // Resetear formularios
      setStudent(INITIAL_STUDENT);
      setGuardian(INITIAL_GUARDIAN);
      setErrors({});
      sigCanvas.current?.clear();
      setSignatureData("");
      setSignatureDataPng("");
      setSignatureSaved(false);
    } catch (err) {
      console.error("Error en ReserveSpot:", err);
      notify.error(
        err?.message || "Error al enviar la reserva. Intenta nuevamente.",
      );
    } finally {
      setLoading(false);
    }
  };

  // ═══════════════════════ RENDER ═══════════════════════

  return (
    <div className="p-6 h-full gap-4 flex flex-col items-center justify-center w-full">
      <div className="w-full xl:w-9/12 grid grid-cols-5 justify-between items-center bg-primary text-surface p-3 rounded-lg">
        <h2 className="col-span-3 text-2xl font-bold text-on-surface">
          Reservar cupo
        </h2>
        <div className="col-span-2 flex justify-end items-center gap-2">
          <SimpleButton
            type="button"
            onClick={() => navigate("/login")}
            icon="ArrowLeftCircle"
            msjtooltip="Volver al inicio de sesión"
            noRounded={false}
            bg="bg-surface"
            text="text-primary"
            className="w-auto px-3 py-1.5"
          />
          <SimpleButton
            type="button"
            onClick={tourReserveSpot}
            icon="HelpCircle"
            msjtooltip="Iniciar tutorial"
            noRounded={false}
            bg="bg-info"
            text="text-surface"
            className="w-auto px-3 py-1.5"
          />
        </div>
      </div>

      {loading && <Loader message="Enviando reserva de cupo…" />}

      {/* ─── Selector de estudiante (solo rol 5 - acudiente) ─── */}
      {isGuardian && (
        <section className="w-full xl:w-9/12 border border-secondary/30 rounded-lg overflow-hidden">
          <div className="bg-primary text-surface p-3">
            <h3 className="text-xl font-bold">Selecciona un estudiante</h3>
          </div>
          <div className="p-4">
            {loadingGuardianStudents ? (
              <Loader message="Cargando estudiantes…" />
            ) : (
              <Field
                label="Estudiante"
                error={errors.selectedGuardianStudentId}
              >
                <select
                  value={selectedGuardianStudentId}
                  onChange={handleGuardianStudentSelect}
                  className={inputClass}
                >
                  <option value="">Selecciona un estudiante</option>
                  {guardianStudents.map((s) => (
                    <option key={s.id_estudiante} value={s.id_estudiante}>
                      {s.concat_ws}
                    </option>
                  ))}
                </select>
              </Field>
            )}
          </div>
        </section>
      )}

      {/* ─── Filtros previos: departamento y municipio ─── */}
      <section
        id="tour-rs-filter-section"
        className="w-full xl:w-9/12 border border-secondary/30 rounded-lg overflow-hidden"
      >
        <div className="bg-primary text-surface p-3">
          <h3 className="text-xl font-bold">Selecciona tu municipio</h3>
        </div>
        <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <DepartmentSelector
            label="Departamento"
            value={filterDept}
            onChange={(e) => {
              setFilterDept(e.target.value);
              setFilterCity("");
            }}
            className={inputClass}
          />
          <CitySelector
            label="Municipio"
            departmentId={filterDept}
            value={filterCity}
            onChange={(e) => setFilterCity(e.target.value)}
            className={inputClass}
          />
        </div>
      </section>

      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-8 w-full xl:w-9/12"
      >
        {/* ═══════════════ ZONA 1: ESTUDIANTE ═══════════════ */}
        <section
          id="tour-rs-student-section"
          className="border border-secondary/30 rounded-lg overflow-hidden"
        >
          <div className="bg-primary text-surface p-3">
            <h3 className="text-xl font-bold">Datos del estudiante</h3>
          </div>

          <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* ── Información personal ── */}
            <div className="md:col-span-3 font-bold text-on-surface">
              Información personal
            </div>

            <div id="tour-rs-student-doctype">
              <Field error={errors.student_identificationtype}>
                <TypeDocumentSelector
                  name="identificationtype"
                  value={student.identificationtype}
                  onChange={handleStudentChange}
                  placeholder="Selecciona un tipo"
                  className={inputClass}
                />
              </Field>
            </div>

            <div id="tour-rs-student-identification">
              <Field
                label="N.º de identificación"
                error={errors.student_identification}
              >
                <input
                  type="text"
                  name="identification"
                  value={student.identification}
                  onChange={handleStudentChange}
                  className={inputClass}
                />
              </Field>
            </div>

            <div id="tour-rs-student-firstname">
              <Field label="Primer nombre" error={errors.student_first_name}>
                <input
                  type="text"
                  name="first_name"
                  value={student.first_name}
                  onChange={handleStudentChange}
                  className={inputClass}
                />
              </Field>
            </div>

            <div id="tour-rs-student-secondname">
              <Field label="Segundo nombre" error={errors.student_second_name}>
                <input
                  type="text"
                  name="second_name"
                  value={student.second_name}
                  onChange={handleStudentChange}
                  className={inputClass}
                />
              </Field>
            </div>

            <div id="tour-rs-student-firstlastname">
              <Field
                label="Primer apellido"
                error={errors.student_first_lastname}
              >
                <input
                  type="text"
                  name="first_lastname"
                  value={student.first_lastname}
                  onChange={handleStudentChange}
                  className={inputClass}
                />
              </Field>
            </div>

            <div id="tour-rs-student-secondlastname">
              <Field
                label="Segundo apellido"
                error={errors.student_second_lastname}
              >
                <input
                  type="text"
                  name="second_lastname"
                  value={student.second_lastname}
                  onChange={handleStudentChange}
                  className={inputClass}
                />
              </Field>
            </div>

            <div id="tour-rs-student-gender">
              <Field label="Género" error={errors.student_gender}>
                <select
                  name="gender"
                  value={student.gender}
                  onChange={handleStudentChange}
                  className={inputClass}
                >
                  <option value="">Selecciona</option>
                  <option value="MASCULINO">MASCULINO</option>
                  <option value="FEMENINO">FEMENINO</option>
                </select>
              </Field>
            </div>

            <div id="tour-rs-student-birthdate">
              <Field
                label="Fecha de nacimiento"
                error={errors.student_fecha_nacimiento}
              >
                <input
                  type="date"
                  name="fecha_nacimiento"
                  value={student.fecha_nacimiento}
                  onChange={handleStudentChange}
                  className={inputClass}
                />
              </Field>
            </div>

            <div id="tour-rs-student-telephone">
              <Field label="Teléfono" error={errors.student_telephone}>
                <input
                  type="tel"
                  name="telephone"
                  value={student.telephone}
                  onChange={handleStudentChange}
                  className={inputClass}
                />
              </Field>
            </div>

            <div id="tour-rs-student-email">
              <Field label="Email" error={errors.student_email}>
                <input
                  type="email"
                  name="email"
                  value={student.email}
                  onChange={handleStudentChange}
                  className={inputClass}
                />
              </Field>
            </div>

            <div id="tour-rs-student-address">
              <Field label="Dirección" error={errors.student_direccion}>
                <input
                  type="text"
                  name="direccion"
                  value={student.direccion}
                  onChange={handleStudentChange}
                  className={inputClass}
                />
              </Field>
            </div>

            {/* ── Información de matrícula ── */}
            <div className="md:col-span-3 font-bold text-on-surface mt-2">
              Información de matrícula
            </div>

            {loadingValuesReservations ? (
              <div className="md:col-span-3">
                <Loader message="Cargando opciones…" />
              </div>
            ) : !filterCity ? (
              <div className="md:col-span-3 text-sm text-on-surface/60 italic">
                Selecciona un departamento y municipio para ver las sedes
                disponibles.
              </div>
            ) : (
              <>
                {/* Sede */}
                <div id="tour-rs-student-sede">
                  <Field label="Sede" error={errors.student_sede}>
                    <select
                      value={student.sede}
                      onChange={(e) =>
                        handleCascadeChange("sede", e.target.value)
                      }
                      className={inputClass}
                    >
                      <option value="">Selecciona sede</option>
                      {sedeOptions.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </Field>
                </div>

                {/* Jornada */}
                <div id="tour-rs-student-jornada">
                  <Field label="Jornada" error={errors.student_jornada}>
                    <select
                      value={student.jornada}
                      onChange={(e) =>
                        handleCascadeChange("jornada", e.target.value)
                      }
                      disabled={!student.sede}
                      className={inputClass}
                    >
                      <option value="">Selecciona jornada</option>
                      {jornadaOptions.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </Field>
                </div>

                {/* Grado */}
                <div id="tour-rs-student-grado">
                  <Field label="Grado" error={errors.student_grade}>
                    <select
                      value={student.grade}
                      onChange={(e) => {
                        setStudent((prev) => ({
                          ...prev,
                          grade: e.target.value,
                        }));
                        setErrors((prev) => ({ ...prev, student_grade: "" }));
                      }}
                      disabled={
                        !student.sede || !student.jornada || loadingGrades
                      }
                      className={inputClass}
                    >
                      <option value="">
                        {loadingGrades
                          ? "Cargando grados..."
                          : !student.sede || !student.jornada
                            ? "Selecciona sede y jornada primero"
                            : "Selecciona grado"}
                      </option>
                      {gradeOptions.map((g) => (
                        <option key={g.value} value={g.value}>
                          {g.grupo ? `${g.label} - ${g.grupo}` : g.label}
                        </option>
                      ))}
                    </select>
                  </Field>
                </div>
              </>
            )}
          </div>
        </section>

        {/* ═══════════════ ZONA 2: ACUDIENTE ═══════════════ */}
        <GuardianFormSection
          prefix="guardian"
          data={guardian}
          onChange={handleGuardianChange}
          errors={errors}
        />

        {/* ═══════════════ ZONA 3: FIRMA DEL ACUDIENTE ═══════════════ */}
        <section
          id="tour-rs-signature-section"
          className="border border-secondary/30 rounded-lg overflow-hidden"
        >
          <div className="bg-primary text-surface p-3">
            <h3 className="text-xl font-bold">Firma del acudiente</h3>
          </div>

          <div className="p-4 space-y-3">
            {esInterno ? (
              // ── Interno: mostrar la imagen de firma registrada ──
              <div className="space-y-2">
                <p className="text-sm text-on-surface/70">
                  Firma registrada del acudiente.
                </p>
                {guardianLinkFirma ? (
                  <img
                    src={guardianLinkFirma}
                    alt="Firma del acudiente"
                    className="border rounded max-h-24 max-w-sm object-contain bg-white"
                  />
                ) : (
                  <p className="text-xs text-warning">
                    No hay firma registrada para este acudiente.
                  </p>
                )}
              </div>
            ) : (
              // ── Externo: canvas de firma ──
              <>
                <p className="text-sm text-on-surface/70">
                  Por favor dibuje la firma del acudiente en el recuadro a
                  continuación.
                </p>

                <div className="w-full max-w-sm">
                  <SignatureCanvas
                    ref={sigCanvas}
                    penColor="black"
                    canvasProps={{
                      className: "signature-canvas border w-full rounded h-24",
                      style: { width: "100%" },
                    }}
                    onEnd={handleSignatureEnd}
                  />
                </div>

                <div className="grid grid-cols-2 gap-2 flex-wrap">
                  <div>
                    <SimpleButton
                      msj="Limpiar"
                      onClick={handleClearSignature}
                      bg="bg-gray-300"
                      text="text-black"
                      hover="hover:bg-gray-400"
                    />
                  </div>
                  <div className="relative inline-block">
                    <SimpleButton
                      msj="Guardar firma"
                      onClick={handleSaveSignature}
                      disabled={!signatureData || savingSig}
                      bg="bg-secondary"
                      text="text-surface"
                      hover="hover:bg-secondary/80"
                    />
                    {savingSig && (
                      <span className="absolute right-0 top-0">
                        <Loader />
                      </span>
                    )}
                  </div>
                </div>

                {!signatureData && (
                  <p className="text-xs text-error">
                    Debe dibujar la firma para poder enviar la reserva.
                  </p>
                )}
                {signatureData && !signatureSaved && (
                  <p className="text-xs text-warning">
                    Después de dibujar la firma, pulse{" "}
                    <strong>Guardar firma</strong> para confirmarla.
                  </p>
                )}
                {signatureSaved && (
                  <p className="text-xs text-green-600 font-medium">
                    Firma guardada correctamente.
                  </p>
                )}
              </>
            )}
            {errors.signature && (
              <p className="text-xs text-error">{errors.signature}</p>
            )}
          </div>
        </section>

        {/* ═══════════════ BOTONES DE ACCIÓN ═══════════════ */}
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          {!loading && (
            <>
              <div id="tour-rs-submit" className="w-full sm:w-1/2">
                <SimpleButton
                  msj="Reservar cupo"
                  text="text-surface"
                  bg="bg-secondary"
                  icon="Save"
                  disabled={!signatureSaved}
                />
              </div>

              <div id="tour-rs-pdf" className="w-full sm:w-1/2">
                <SimpleButton
                  type="button"
                  msj="Descargar PDF"
                  text="text-surface"
                  bg={isFormComplete ? "bg-green-600" : "bg-gray-400"}
                  hover={isFormComplete ? "hover:bg-green-700" : ""}
                  icon="FileText"
                  disabled={!isFormComplete}
                  onClick={handleGeneratePDF}
                />
              </div>
            </>
          )}
        </div>
      </form>
    </div>
  );
};

export default ReserveSpot;
