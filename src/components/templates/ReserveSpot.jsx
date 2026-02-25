import React, {
  useState,
  useRef,
  useCallback,
  useEffect,
  useMemo,
} from "react";
import jsPDF from "jspdf";
import SignatureCanvas from "react-signature-canvas";
import SimpleButton from "../atoms/SimpleButton";
import tourReserveSpot from "../../tour/tourReserveSpot";

import TypeDocumentSelector from "../molecules/TypeDocumentSelector";
import Loader from "../atoms/Loader";
import useSchool from "../../lib/hooks/useSchool";
import { useNotify } from "../../lib/hooks/useNotify";

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
  departamento: "",
  municipio: "",
  sede: "",
  jornada: "",
  fecha_nacimiento: "",
  direccion: "",
  gender: "",
  nui: "",
  per_id: "",
  grade: "",
};

const INITIAL_MOTHER = {
  first_name: "",
  second_name: "",
  first_lastname: "",
  second_lastname: "",
  telephone: "",
  email: "",
  identification: "",
  identificationtype: "",
};

const INITIAL_FATHER = {
  first_name: "",
  second_name: "",
  first_lastname: "",
  second_lastname: "",
  telephone: "",
  email: "",
  identification: "",
  identificationtype: "",
};

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

const GuardianFormSection = ({
  title,
  prefix,
  data,
  onChange,
  errors,
  isPrimary,
  onPrimaryToggle,
}) => (
  <section
    id={`tour-rs-${prefix}-section`}
    className="border border-secondary/30 rounded-lg overflow-hidden"
  >
    <div className="bg-primary text-surface p-3 flex items-center justify-between">
      <h3 className="text-xl font-bold">{title}</h3>
      <label
        id={`tour-rs-${prefix}-primary`}
        className="flex items-center gap-2 cursor-pointer select-none"
      >
        <input
          type="checkbox"
          checked={isPrimary}
          onChange={onPrimaryToggle}
          className="w-4 h-4 accent-surface cursor-pointer"
        />
        <span className="text-sm font-medium">Acudiente principal</span>
      </label>
    </div>

    {isPrimary && (
      <p className="px-4 pt-2 text-xs font-semibold text-primary">
        ★ Este es el acudiente principal
      </p>
    )}

    <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
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

const ReserveSpot = ({ onSuccess }) => {
  const notify = useNotify();
  const {
    valuesReservations,
    loadingValuesReservations,
    loadValuesReservations,
  } = useSchool();

  // Cargar valores de reservación al montar
  useEffect(() => {
    loadValuesReservations();
  }, [loadValuesReservations]);

  const [student, setStudent] = useState(INITIAL_STUDENT);
  const [mother, setMother] = useState(INITIAL_MOTHER);
  const [father, setFather] = useState(INITIAL_FATHER);
  const [primaryGuardian, setPrimaryGuardian] = useState(""); // "mother" | "father"
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // ─── Firma ───
  const [signatureData, setSignatureData] = useState("");
  const [signatureSaved, setSignatureSaved] = useState(false);
  const [savingSig, setSavingSig] = useState(false);
  const sigCanvas = useRef(null);

  // ─── Logo institucional (precargado para el PDF) ───
  const [logoBase64, setLogoBase64] = useState("");
  useEffect(() => {
    fetch("/LogoGuadalupe.png")
      .then((r) => r.blob())
      .then(
        (blob) =>
          new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.readAsDataURL(blob);
          }),
      )
      .then((b64) => setLogoBase64(b64))
      .catch(() => {
        /* sin logo si falla la carga */
      });
  }, []);

  // ─── Handlers genéricos ───
  const handleStudentChange = (e) => {
    const { name, value, type, files } = e.target;
    setStudent((prev) => ({
      ...prev,
      [name]: type === "file" ? files[0] : value,
    }));
    setErrors((prev) => ({ ...prev, [`student_${name}`]: "" }));
  };

  // ─── Handler en cascada para selects de ubicación/grupo ───
  const handleCascadeChange = useCallback((field, value) => {
    setStudent((prev) => {
      const next = { ...prev, [field]: value };
      if (field === "departamento") {
        next.municipio = "";
        next.sede = "";
        next.jornada = "";
        next.grade = "";
      } else if (field === "municipio") {
        next.sede = "";
        next.jornada = "";
        next.grade = "";
      } else if (field === "sede") {
        next.jornada = "";
        next.grade = "";
      } else if (field === "jornada") {
        next.grade = "";
      }
      return next;
    });
    setErrors((prev) => ({ ...prev, [`student_${field}`]: "" }));
  }, []);

  // ─── Opciones derivadas (filtros en cascada) ───
  const deptoOptions = useMemo(() => {
    const unique = new Map();
    valuesReservations.forEach((item) => {
      if (!unique.has(item.id_departamento)) {
        unique.set(
          item.id_departamento,
          `Departamento ${item.id_departamento}`,
        );
      }
    });
    return [...unique.entries()].map(([value, label]) => ({ value, label }));
  }, [valuesReservations]);

  const municipioOptions = useMemo(() => {
    if (!student.departamento) return [];
    const unique = new Map();
    valuesReservations
      .filter((item) => item.id_departamento === student.departamento)
      .forEach((item) => {
        if (!unique.has(item.id_municipio))
          unique.set(item.id_municipio, item.nombre);
      });
    return [...unique.entries()].map(([value, label]) => ({ value, label }));
  }, [valuesReservations, student.departamento]);

  const sedeOptions = useMemo(() => {
    if (!student.municipio) return [];
    const unique = new Map();
    valuesReservations
      .filter(
        (item) =>
          item.id_departamento === student.departamento &&
          item.id_municipio === student.municipio,
      )
      .forEach((item) => {
        if (!unique.has(item.id_sede))
          unique.set(item.id_sede, item.nombre_sede);
      });
    return [...unique.entries()].map(([value, label]) => ({ value, label }));
  }, [valuesReservations, student.departamento, student.municipio]);

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

  const gradoOptions = useMemo(() => {
    if (!student.sede || !student.jornada) return [];
    const unique = new Map();

    // Detectar si la jornada seleccionada proviene de una expansión de "Ambas"
    const ambasEntry = valuesReservations.find(
      (item) =>
        item.id_sede === student.sede && item.nombre_jornada === "Ambas",
    );
    const isFromAmbas =
      ambasEntry && (student.jornada === "1" || student.jornada === "2");

    valuesReservations
      .filter((item) => {
        if (item.id_sede !== student.sede) return false;
        if (isFromAmbas) return item.fk_jornada === ambasEntry.fk_jornada;
        return item.fk_jornada === student.jornada;
      })
      .forEach((item) => {
        if (!unique.has(item.nombre_grado))
          unique.set(item.nombre_grado, item.id_grado);
      });
    return [...unique.entries()].map(([label, value]) => ({ value, label }));
  }, [valuesReservations, student.sede, student.jornada]);

  const handleMotherChange = (e) => {
    const { name, value } = e.target;
    setMother((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [`mother_${name}`]: "" }));
  };

  const handleFatherChange = (e) => {
    const { name, value } = e.target;
    setFather((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [`father_${name}`]: "" }));
  };

  // ─── Handlers de firma ───
  const handleSignatureEnd = useCallback(() => {
    const data = sigCanvas.current?.toDataURL("image/png") ?? "";
    setSignatureData(data);
  }, []);

  const handleClearSignature = useCallback(() => {
    sigCanvas.current?.clear();
    setSignatureData("");
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
      student.departamento &&
      student.municipio &&
      student.sede &&
      student.jornada &&
      student.grade;

    if (!studentOk || !primaryGuardian || !signatureSaved) return false;

    const guardianData = primaryGuardian === "mother" ? mother : father;
    return !!(
      guardianData.first_name.trim() &&
      guardianData.first_lastname.trim() &&
      guardianData.telephone.trim() &&
      guardianData.identification.trim() &&
      guardianData.identificationtype
    );
  }, [student, mother, father, primaryGuardian, signatureSaved]);

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
    const lh = 5;
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
      doc.rect(margin, y - 5, pageWidth - margin * 2, lh + 2, "F");
      doc.text(text, margin + 2, y + 1);
      doc.setTextColor(40, 40, 40);
      y += lh + 5;
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
          y += lh * lines.length;
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
          y += lh;
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
      doc.addImage(logoBase64, "PNG", margin, headerStartY - 4, logoW, logoH);
    }

    // Nombre del colegio
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(41, 98, 160);
    doc.text(getLabelWithId(sedeOptions, student.sede), cx, y, {
      align: "center",
    });
    y += lh;

    // Subtítulo institución
    doc.setFontSize(8.5);
    doc.setFont("helvetica", "italic");
    doc.setTextColor(60, 60, 60);
    doc.text('Institución Educativa Distrital Ejemplo "La Excelencia"', cx, y, {
      align: "center",
    });
    y += lh;

    // NIT
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.text("Nit. 123.456.789-0", cx, y, { align: "center" });
    y += lh;

    // Licencia
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(41, 98, 160);
    doc.text("LICENCIA DE FUNCIONAMIENTO", cx, y, { align: "center" });
    y += lh;

    doc.setFont("helvetica", "normal");
    doc.setTextColor(60, 60, 60);
    doc.text("Según Resolución No. 002058  Sep 15 de 2000", cx, y, {
      align: "center",
    });
    y += lh;

    // DANE / Sede / Núcleo
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.setTextColor(40, 40, 40);
    doc.text(
      "DANE: 308001001382     SEDE: UNICA     NÚCLEO EDUCATIVO: Nº 14 A",
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
      ["Tipo documento", student.identificationtype || "—"],
      ["N.º identificación", student.identification],
      ["NUI", student.nui],
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
      ["Departamento", getLabelWithId(deptoOptions, student.departamento)],
      ["Municipio", getLabelWithId(municipioOptions, student.municipio)],
      ["Sede", getLabelWithId(sedeOptions, student.sede), true],
      ["Jornada", getLabelWithId(jornadaOptions, student.jornada)],
      ["Grado", getLabelWithId(gradoOptions, student.grade)],
    ]);
    y += 4;

    // ── Acudientes ──
    const addGuardian = (gData, title, isPrimary) => {
      addSectionHeader(`${title}${isPrimary ? " — Acudiente principal" : ""}`);
      addTwoColumns([
        ["Tipo documento", gData.identificationtype || "—"],
        ["N.º identificación", gData.identification],
        ["Primer nombre", gData.first_name],
        ["Segundo nombre", gData.second_name],
        ["Primer apellido", gData.first_lastname],
        ["Segundo apellido", gData.second_lastname],
        ["Teléfono", gData.telephone],
        ["Email", gData.email],
      ]);
      y += 4;
    };

    addGuardian(mother, "Acudiente — Madre", primaryGuardian === "mother");
    addGuardian(father, "Acudiente — Padre", primaryGuardian === "father");

    // ── Firma ──
    if (y > 200) {
      doc.addPage();
      y = 20;
    }
    addSectionHeader("Firma del acudiente");
    if (signatureData) {
      doc.addImage(signatureData, "PNG", margin, y, 80, 35);
      y += 42;
    }

    doc.save("reserva_cupo.pdf");
  }, [
    student,
    mother,
    father,
    primaryGuardian,
    signatureData,
    deptoOptions,
    municipioOptions,
    sedeOptions,
    jornadaOptions,
    gradoOptions,
    getLabel,
    getLabelWithId,
    logoBase64,
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
    if (!student.departamento)
      e.student_departamento = "Selecciona un departamento.";
    if (!student.municipio) e.student_municipio = "Selecciona un municipio.";
    if (!student.sede) e.student_sede = "Selecciona una sede.";
    if (!student.jornada) e.student_jornada = "Selecciona una jornada.";
    if (!student.grade) e.student_grade = "Selecciona un grado.";

    // Acudiente principal obligatorio
    if (!primaryGuardian)
      e.primaryGuardian = "Debes marcar quién es el acudiente principal.";

    // Valida los campos requeridos del acudiente principal seleccionado
    const validatePerson = (person, prefix) => {
      if (!person.first_name.trim()) e[`${prefix}_first_name`] = "Obligatorio.";
      if (!person.first_lastname.trim())
        e[`${prefix}_first_lastname`] = "Obligatorio.";
      if (!person.telephone.trim()) e[`${prefix}_telephone`] = "Obligatorio.";
      if (!person.identification.trim())
        e[`${prefix}_identification`] = "Obligatorio.";
      if (!person.identificationtype)
        e[`${prefix}_identificationtype`] = "Selecciona tipo de documento.";
    };

    if (primaryGuardian === "mother") validatePerson(mother, "mother");
    if (primaryGuardian === "father") validatePerson(father, "father");

    // Firma
    if (!signatureSaved)
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
      // ── Construir un solo FormData con toda la información ──
      const fd = new FormData();

      // --- Datos del estudiante (prefijo student_) ---
      fd.append("student_first_name", student.first_name.trim());
      fd.append("student_second_name", student.second_name.trim());
      fd.append("student_first_lastname", student.first_lastname.trim());
      fd.append("student_second_lastname", student.second_lastname.trim());
      fd.append("student_telephone", student.telephone.trim());
      fd.append("student_email", student.email.trim());
      fd.append("student_identification", student.identification.trim());
      fd.append(
        "student_identificationtype",
        student.identificationtype ? Number(student.identificationtype) : "",
      );
      fd.append("student_sede", student.sede ? Number(student.sede) : "");
      // campos básicos del estudiante ya añadidos más arriba
      fd.append("student_fecha_nacimiento", student.fecha_nacimiento || "");
      fd.append("student_direccion", student.direccion.trim());
      fd.append("student_gender", student.gender || "");
      fd.append("student_nui", student.nui.trim());
      fd.append("student_per_id", student.per_id.trim());
      fd.append("student_cuenta_piar", student.cuenta_piar ? "1" : "0");

      // Archivos opcionales (se conservaron en estado pero no se muestran)
      if (student.link_identificacion) {
        fd.append("student_cedula", student.link_identificacion);
      }
      if (student.link_piar) {
        fd.append("student_piar", student.link_piar);
      }
      if (student.photo_link && student.photo_link instanceof File) {
        fd.append("student_photo", student.photo_link);
      }

      // --- Datos de la madre (prefijo mother_) ---
      fd.append("mother_first_name", mother.first_name.trim());
      fd.append("mother_second_name", mother.second_name.trim());
      fd.append("mother_first_lastname", mother.first_lastname.trim());
      fd.append("mother_second_lastname", mother.second_lastname.trim());
      fd.append("mother_telephone", mother.telephone.trim());
      fd.append("mother_email", mother.email.trim());
      fd.append("mother_identification", mother.identification.trim());
      fd.append(
        "mother_identificationtype",
        mother.identificationtype ? Number(mother.identificationtype) : "",
      );

      // --- Datos del padre (prefijo father_) ---
      fd.append("father_first_name", father.first_name.trim());
      fd.append("father_second_name", father.second_name.trim());
      fd.append("father_first_lastname", father.first_lastname.trim());
      fd.append("father_second_lastname", father.second_lastname.trim());
      fd.append("father_telephone", father.telephone.trim());
      fd.append("father_email", father.email.trim());
      fd.append("father_identification", father.identification.trim());
      fd.append(
        "father_identificationtype",
        father.identificationtype ? Number(father.identificationtype) : "",
      );

      // --- Acudiente principal ---
      fd.append("primary_guardian", primaryGuardian);

      // ── Log para depuración ──
      console.log("=== ReserveSpot FormData ===");
      for (const [key, val] of fd.entries()) {
        console.log(key, val instanceof File ? `[File] ${val.name}` : val);
      }
      console.log("============================");

      // ── Enviar al backend (ajusta la ruta según tu API) ──
      // Ejemplo: await ApiClient.instance.post("/reserve-spot", fd);
      // Por ahora emitimos el FormData mediante onSuccess para que el padre lo procese.
      // Firma del acudiente
      if (signatureData) {
        fd.append("guardian_signature", signatureData);
      }

      if (typeof onSuccess === "function") {
        await onSuccess(fd);
      }

      notify.success("Reserva de cupo enviada correctamente.");

      // Resetear formularios
      setStudent(INITIAL_STUDENT);
      setMother(INITIAL_MOTHER);
      setFather(INITIAL_FATHER);
      setPrimaryGuardian("");
      setErrors({});
      sigCanvas.current?.clear();
      setSignatureData("");
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
    <div className="p-6 h-full gap-4 flex flex-col">
      <div className="w-full grid grid-cols-5 justify-between items-center p-2 rounded-t-lg">
        <h2 className="col-span-4 text-2xl font-bold text-on-surface">
          Reservar cupo
        </h2>
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

      {loading && <Loader message="Enviando reserva de cupo…" />}

      <form onSubmit={handleSubmit} className="flex flex-col gap-8">
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

            <div id="tour-rs-student-nui">
              <Field label="NUI" error={errors.student_nui}>
                <input
                  type="text"
                  name="nui"
                  value={student.nui}
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
                  <option value="Masculino">Masculino</option>
                  <option value="Femenino">Femenino</option>
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
            ) : (
              <>
                {/* Departamento */}
                <div id="tour-rs-student-departamento">
                  <Field
                    label="Departamento"
                    error={errors.student_departamento}
                  >
                    <select
                      value={student.departamento}
                      onChange={(e) =>
                        handleCascadeChange("departamento", e.target.value)
                      }
                      className={inputClass}
                    >
                      <option value="">Selecciona departamento</option>
                      {deptoOptions.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </Field>
                </div>

                {/* Municipio */}
                <div id="tour-rs-student-municipio">
                  <Field label="Municipio" error={errors.student_municipio}>
                    <select
                      value={student.municipio}
                      onChange={(e) =>
                        handleCascadeChange("municipio", e.target.value)
                      }
                      disabled={!student.departamento}
                      className={inputClass}
                    >
                      <option value="">Selecciona municipio</option>
                      {municipioOptions.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </Field>
                </div>

                {/* Sede */}
                <div id="tour-rs-student-sede">
                  <Field label="Sede" error={errors.student_sede}>
                    <select
                      value={student.sede}
                      onChange={(e) =>
                        handleCascadeChange("sede", e.target.value)
                      }
                      disabled={!student.municipio}
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
                      onChange={(e) =>
                        handleCascadeChange("grade", e.target.value)
                      }
                      disabled={!student.jornada}
                      className={inputClass}
                    >
                      <option value="">Selecciona grado</option>
                      {gradoOptions.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </Field>
                </div>
              </>
            )}
          </div>
        </section>

        {/* ═══════════════ ZONA 2: ACUDIENTES ═══════════════ */}
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-lg font-bold text-on-surface">
              Datos de los acudientes
            </h3>
            <span className="text-sm text-on-surface/60">
              (Marca quién es el acudiente principal)
            </span>
          </div>

          {errors.primaryGuardian && (
            <p className="text-xs text-error">{errors.primaryGuardian}</p>
          )}

          <GuardianFormSection
            title="Madre"
            prefix="mother"
            data={mother}
            onChange={handleMotherChange}
            errors={errors}
            isPrimary={primaryGuardian === "mother"}
            onPrimaryToggle={() =>
              setPrimaryGuardian(primaryGuardian === "mother" ? "" : "mother")
            }
          />

          <GuardianFormSection
            title="Padre"
            prefix="father"
            data={father}
            onChange={handleFatherChange}
            errors={errors}
            isPrimary={primaryGuardian === "father"}
            onPrimaryToggle={() =>
              setPrimaryGuardian(primaryGuardian === "father" ? "" : "father")
            }
          />
        </div>

        {/* ═══════════════ ZONA 3: FIRMA DEL ACUDIENTE ═══════════════ */}
        <section
          id="tour-rs-signature-section"
          className="border border-secondary/30 rounded-lg overflow-hidden"
        >
          <div className="bg-primary text-surface p-3">
            <h3 className="text-xl font-bold">Firma del acudiente</h3>
          </div>

          <div className="p-4 space-y-3">
            <p className="text-sm text-on-surface/70">
              Por favor dibuje la firma del acudiente en el recuadro a
              continuación.
            </p>

            <SignatureCanvas
              ref={sigCanvas}
              penColor="black"
              canvasProps={{
                className: "signature-canvas border w-full h-36 rounded",
              }}
              onEnd={handleSignatureEnd}
            />

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
