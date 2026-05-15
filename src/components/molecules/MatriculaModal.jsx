import { useState, useEffect, useCallback } from "react";
import jsPDF from "jspdf";
import Modal from "../atoms/Modal";
import Loader from "../atoms/Loader";
import SimpleButton from "../atoms/SimpleButton";
import { getDataStudentGuardian } from "../../services/studentService";

/** Comprime una imagen (URL/base64/blob:) a JPEG usando canvas */
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

const EMPTY_ROW = {
  dia: "",
  mes: "",
  anio: "",
  grado: "",
  edad: "",
  promovido: false,
  firma_alumno: "",
  firma_padre: "",
};

const EMPTY_FORM = {
  apellido_nombre: "",
  tipo_id: "TI",
  numero_id: "",
  ciudad_id: "",
  lugar_nacimiento: "",
  fecha_nacimiento: "",
  edad: "",
  residencia: "",
  telefono_estudiante: "",
  eps: "",
  rh: "",
  nombre_padre: "",
  cc_padre: "",
  trabajo_padre: "",
  tel_padre: "",
  nombre_madre: "",
  cc_madre: "",
  trabajo_madre: "",
  tel_madre: "",
  nombre_acudiente: "",
  direccion_acudiente: "",
  tel_acudiente: "",
  col_procedencia: "",
  motivo_retiro: "",
  codigo_matricula: "",
};

/** Calcula la edad en años a partir de una fecha ISO o string */
function calcularEdad(fechaStr) {
  if (!fechaStr) return "";
  const birth = new Date(fechaStr);
  if (isNaN(birth.getTime())) return "";
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return String(age);
}

/** Campo de texto con borde inferior al estilo formulario */
const Field = ({
  value,
  onChange,
  placeholder = "",
  className = "",
  type = "text",
}) => (
  <input
    type={type}
    value={value ?? ""}
    onChange={(e) => onChange(e.target.value)}
    placeholder={placeholder}
    className={`border-b border-gray-500 bg-transparent focus:outline-none focus:border-primary px-1 min-w-0 ${className}`}
  />
);

const MatriculaModal = ({ isOpen, onClose, data }) => {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [historial, setHistorial] = useState([{ ...EMPTY_ROW }]);
  const [logoBase64, setLogoBase64] = useState("");

  /* ── Rellena el formulario desde el objeto de datos ── */
  const prefillFromData = (d) => {
    if (!d) return;
    const apellidoNombre = [
      d.papellido_estudiante || d.primer_apellido || d.first_lastname,
      d.sapellido_estudiante || d.segundo_apellido || d.second_lastname,
      d.pnombre_estudiante || d.primero_nombre || d.first_name,
      d.snombre_estudiante || d.segundo_nombre || d.second_name,
    ]
      .filter(Boolean)
      .join(" ");

    const nombreAcudiente =
      d.nombre_acudiente ||
      [
        d.primer_apellido_acudiente,
        d.segundo_apellido_acudiente,
        d.primero_nombre_acudiente,
        d.segundo_nombre_acudiente,
      ]
        .filter(Boolean)
        .join(" ") ||
      // Fallback con campos del acudiente del response (orden: apellido primero)
      [
        d.primer_apellido,
        d.segundo_apellido,
        d.primero_nombre,
        d.segundo_nombre,
      ]
        .filter(Boolean)
        .join(" ");

    const fechaNac = d.fecha_nacimiento
      ? d.fecha_nacimiento.split("T")[0]
      : d.birthday
        ? d.birthday.split("T")[0]
        : "";

    // Tipo de identificación del estudiante
    let tipoId = "TI";
    const rawTipo =
      d.t_identificacion_estudiante ||
      d.fk_tipo_identificacion ||
      d.identificationType ||
      "";
    const nombreTipo = String(d.nombre_identi_estudiante || "").toUpperCase();
    if (
      String(rawTipo).toUpperCase().includes("CC") ||
      rawTipo === "2" ||
      nombreTipo.includes("CC")
    ) {
      tipoId = "CC";
    } else if (
      String(rawTipo).toUpperCase().includes("RC") ||
      nombreTipo.includes("RC")
    ) {
      tipoId = "RC";
    } else if (
      rawTipo === "4" ||
      rawTipo === "5" ||
      String(rawTipo).toUpperCase().includes("TI") ||
      nombreTipo.includes("TI")
    ) {
      tipoId = "TI";
    }

    setForm((prev) => ({
      ...prev,
      apellido_nombre: apellidoNombre || prev.apellido_nombre,
      tipo_id: tipoId,
      numero_id:
        d.identificacion_estudiante || d.identification || prev.numero_id,
      fecha_nacimiento: fechaNac || prev.fecha_nacimiento,
      edad: calcularEdad(fechaNac) || prev.edad,
      telefono_estudiante:
        d.telefono || d.telephone || prev.telefono_estudiante,
      nombre_acudiente: nombreAcudiente || prev.nombre_acudiente,
      tel_acudiente: d.telefono_acudiente || prev.tel_acudiente,
      direccion_acudiente: d.direccion || d.address || prev.direccion_acudiente,
    }));
  };

  /* ── Al abrir el modal, carga datos ── */
  useEffect(() => {
    if (!isOpen || !data) return;

    setForm(EMPTY_FORM);
    setHistorial([{ ...EMPTY_ROW }]);

    const loadData = async () => {
      setLoading(true);
      try {
        const idEstudiante = data?.id_estudiante;
        const idPersonaGuardian =
          data?.id_persona_acudiente ||
          data?.fk_persona_acudiente ||
          data?.id_acudiente;

        if (idPersonaGuardian && idEstudiante) {
          const res = await getDataStudentGuardian({
            idPersonaGuardian: Number(idPersonaGuardian),
            idEstudiante: Number(idEstudiante),
          });
          if (res) {
            prefillFromData({ ...data, ...res });
            return;
          }
        }
        // Fallback con los datos ya disponibles
        prefillFromData(data);
      } catch (err) {
        console.warn(
          "MatriculaModal: no se pudo cargar getDataStudentGuardian",
          err,
        );
        prefillFromData(data);
      } finally {
        setLoading(false);
      }
    };

    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, data]);

  /* ── Carga el logo institucional cuando abre el modal ── */
  useEffect(() => {
    if (!isOpen) {
      setLogoBase64("");
      return;
    }
    const url = data?.link_logo;
    if (!url) {
      setLogoBase64("");
      return;
    }
    fetch(url)
      .then((r) => {
        if (!r.ok) throw new Error("Error cargando logo");
        return r.blob();
      })
      .then(
        (blob) =>
          new Promise((res, rej) => {
            const reader = new FileReader();
            reader.onloadend = () => res(reader.result);
            reader.onerror = rej;
            reader.readAsDataURL(blob);
          }),
      )
      .then((b64) => compressToJpeg(b64, 0.8, 300))
      .then(setLogoBase64)
      .catch(() => setLogoBase64(""));
  }, [isOpen, data]);

  /* ── Generación PDF ── */
  const handleGeneratePDF = useCallback(() => {
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "letter",
    });
    const pw = doc.internal.pageSize.getWidth();
    const ph = doc.internal.pageSize.getHeight();
    const ml = 15,
      mr = 15;
    const uw = pw - ml - mr;
    let y = 15;
    const lh = 6.5;
    const fs = 8.5;

    const checkPage = (needed = lh) => {
      if (y + needed > ph - 12) {
        doc.addPage();
        y = 15;
      }
    };

    // Dibuja etiqueta (negrita) + valor + subrayado dentro de [x, x+width]
    const fld = (label, value, x, width, yRef) => {
      doc.setFontSize(fs);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(40, 40, 40);
      const lb = `${label}: `;
      const lw = doc.getTextWidth(lb);
      doc.text(lb, x, yRef);
      doc.setFont("helvetica", "normal");
      doc.text(
        doc.splitTextToSize(
          String(value || "—"),
          Math.max(width - lw - 1, 8),
        )[0],
        x + lw,
        yRef,
      );
      doc.setDrawColor(180, 180, 180);
      doc.setLineWidth(0.2);
      doc.line(x + lw, yRef + 0.7, x + width, yRef + 0.7);
    };

    // ── Encabezado institucional ────────────────────────────
    const logoW = 28,
      logoH = 28;
    const hasLogo = !!logoBase64;
    const hdTextX = hasLogo ? ml + logoW + 5 : ml;
    const hdTextW = pw - hdTextX - mr;
    const cx = hdTextX + hdTextW / 2;
    const headerStartY = y;

    if (hasLogo) {
      doc.addImage(logoBase64, "JPEG", ml, headerStartY, logoW, logoH);
    }

    const nombreInst =
      data?.nombre_sede ||
      data?.nombre_institucion ||
      data?.name_school ||
      "INSTITUCIÓN EDUCATIVA";

    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(30, 60, 130);
    doc.text(nombreInst, cx, y + 4, { align: "center" });
    y += lh;

    if (data?.eslogan) {
      doc.setFont("helvetica", "italic");
      doc.setFontSize(8);
      doc.setTextColor(70, 70, 70);
      doc.text(data.eslogan, cx, y + 3, { align: "center" });
      y += lh;
    }

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(70, 70, 70);

    if (data?.nit) {
      doc.text(`NIT: ${data.nit}`, cx, y + 3, { align: "center" });
      y += lh;
    }
    if (data?.cod_dane) {
      doc.setFont("helvetica", "bold");
      doc.text(`Código DANE: ${data.cod_dane}`, cx, y + 3, { align: "center" });
      doc.setFont("helvetica", "normal");
      y += lh;
    }
    const contactParts = [];
    if (data?.direccion_sede) contactParts.push(`Dir: ${data.direccion_sede}`);
    if (data?.telefono_sede) contactParts.push(`Tel: ${data.telefono_sede}`);
    if (contactParts.length) {
      doc.text(contactParts.join("   "), cx, y + 3, { align: "center" });
      y += lh;
    }

    // Asegurar que y esté debajo del logo
    const logoBottom = headerStartY + logoH + 2;
    if (y + 3 < logoBottom) y = logoBottom - 3;

    // Línea decorativa azul
    doc.setDrawColor(30, 60, 130);
    doc.setLineWidth(0.7);
    doc.line(ml, y + 3, pw - mr, y + 3);
    y += lh + 1;
    doc.setTextColor(40, 40, 40);

    // ── Título ───────────────────────────────────────────────
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(30, 60, 130);
    doc.text("TARJETA ACUMULATIVA DE MATRÍCULA", pw / 2, y, {
      align: "center",
    });
    y += lh;
    doc.setTextColor(40, 40, 40);
    doc.setFontSize(8);

    if (form.codigo_matricula) {
      doc.setFont("helvetica", "bold");
      doc.text("Código: ", pw - mr - 42, y);
      doc.setFont("helvetica", "normal");
      doc.text(
        form.codigo_matricula,
        pw - mr - 42 + doc.getTextWidth("Código: "),
        y,
      );
      y += lh - 1;
    }
    // EPS / RH
    doc.setFont("helvetica", "bold");
    doc.text("EPS: ", pw - mr - 50, y);
    doc.setFont("helvetica", "normal");
    doc.text(form.eps || "—", pw - mr - 50 + doc.getTextWidth("EPS: "), y);
    doc.setFont("helvetica", "bold");
    doc.text("  RH: ", pw - mr - 22, y);
    doc.setFont("helvetica", "normal");
    doc.text(form.rh || "—", pw - mr - 22 + doc.getTextWidth("  RH: "), y);
    y += lh + 1;

    // ── Campos del formulario ─────────────────────────────────
    checkPage();
    fld("Apellido y Nombre", form.apellido_nombre, ml, uw, y);
    y += lh;

    checkPage();
    fld(
      "Identificación",
      `${form.tipo_id}   No. ${form.numero_id || "—"}   de: ${form.ciudad_id || "—"}`,
      ml,
      uw,
      y,
    );
    y += lh;

    checkPage();
    {
      const nacW = uw * 0.4,
        fecW = uw * 0.32,
        edW = uw * 0.2;
      const fecX = ml + nacW + 3,
        edX = ml + nacW + 3 + fecW + 3;
      fld("Lug. Nacimiento", form.lugar_nacimiento, ml, nacW, y);
      fld("Fecha", form.fecha_nacimiento, fecX, fecW, y);
      fld("Edad", form.edad ? `${form.edad} años` : "", edX, edW, y);
    }
    y += lh;

    checkPage();
    {
      const resW = uw * 0.6,
        telX = ml + uw * 0.6 + 3,
        telW = uw * 0.35;
      fld("Residencia", form.residencia, ml, resW, y);
      fld("Teléfono", form.telefono_estudiante, telX, telW, y);
    }
    y += lh;

    checkPage();
    {
      const c1 = uw * 0.32,
        c2 = uw * 0.18,
        c3 = uw * 0.28,
        c4 = uw * 0.16;
      fld("Nombre del Padre", form.nombre_padre, ml, c1, y);
      fld("C.C. No", form.cc_padre, ml + c1 + 2, c2, y);
      fld("Lug. Trabajo", form.trabajo_padre, ml + c1 + c2 + 4, c3, y);
      fld("Tel", form.tel_padre, ml + c1 + c2 + c3 + 6, c4, y);
    }
    y += lh;

    checkPage();
    {
      const c1 = uw * 0.32,
        c2 = uw * 0.18,
        c3 = uw * 0.28,
        c4 = uw * 0.16;
      fld("Nombre de la Madre", form.nombre_madre, ml, c1, y);
      fld("C.C. No", form.cc_madre, ml + c1 + 2, c2, y);
      fld("Lug. Trabajo", form.trabajo_madre, ml + c1 + c2 + 4, c3, y);
      fld("Tel", form.tel_madre, ml + c1 + c2 + c3 + 6, c4, y);
    }
    y += lh;

    checkPage();
    {
      const c1 = uw * 0.38,
        c2 = uw * 0.36,
        c3 = uw * 0.18;
      fld("Acudiente", form.nombre_acudiente, ml, c1, y);
      fld("Dirección", form.direccion_acudiente, ml + c1 + 3, c2, y);
      fld("Tel", form.tel_acudiente, ml + c1 + c2 + 6, c3, y);
    }
    y += lh;

    checkPage();
    {
      const half = uw / 2 - 2;
      fld("Col. de Procedencia", form.col_procedencia, ml, half, y);
      fld("Motivo de Retiro", form.motivo_retiro, ml + half + 4, half, y);
    }
    y += lh + 2;

    // ── Texto legal ─────────────────────────────────────────
    checkPage(10);
    doc.setFontSize(7.5);
    doc.setFont("helvetica", "italic");
    doc.setTextColor(80, 80, 80);
    const legalTxt = doc.splitTextToSize(
      "Al firmar el presente documento nos comprometemos a cumplir totalmente el manual de convivencia del colegio, el cual conocemos.",
      uw - 4,
    );
    doc.setDrawColor(180, 180, 180);
    doc.setLineWidth(0.2);
    doc.rect(ml, y - 3.5, uw, legalTxt.length * 4.5 + 4);
    doc.text(legalTxt, ml + 2, y);
    y += legalTxt.length * 4.5 + 6;

    // ── Historial de matrícula ────────────────────────────────
    checkPage(22);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(30, 60, 130);
    doc.text("HISTORIAL DE MATRÍCULA", ml, y);
    y += lh;

    // Columnas: DIA | MES | AÑO | GRADO | EDAD | PROMOVIDO | FIRMA ALUMNO | FIRMA PADRE
    const cols = [8, 8, 10, 20, 11, 17, 48, 64]; // suma ≈ 186 ≈ uw
    const colXs = [];
    let cxTbl = ml;
    cols.forEach((w) => {
      colXs.push(cxTbl);
      cxTbl += w;
    });
    const tableW = cols.reduce((a, b) => a + b, 0);
    const headH1 = 5,
      headH2 = 5,
      rowH = 7;

    // Helper: dibuja celda con relleno y borde, luego texto centrado
    const hdrCell = (x, cellY, w, h, text, isSubRow = false) => {
      // Fila 1 del encabezado: azul sólido. Fila 2 (sub-encabezado): azul más claro
      if (isSubRow) {
        doc.setFillColor(70, 130, 180);
      } else {
        doc.setFillColor(41, 98, 160);
      }
      doc.setDrawColor(200, 200, 200);
      doc.setLineWidth(0.3);
      doc.rect(x, cellY, w, h, "FD");
      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(6.5);
      const lines = text.split("\n");
      const totalTextH = lines.length * 3.2;
      const startTextY = cellY + h / 2 - totalTextH / 2 + 2.5;
      lines.forEach((ln, li) =>
        doc.text(ln, x + w / 2, startTextY + li * 3.2, { align: "center" }),
      );
    };

    // Fila 1: "FECHA" (span DIA+MES+AÑO) + columnas que abarcan ambas filas
    hdrCell(colXs[0], y, 26, headH1, "FECHA");

    const spanHdrs = [
      [3, "GRADO"],
      [4, "EDAD"],
      [5, "PROMO-\nVIDO"],
      [6, "FIRMA DEL\nALUMNO"],
      [7, "FIRMA DEL PADRE\nO ACUDIENTE"],
    ];
    for (const [ci, label] of spanHdrs) {
      hdrCell(colXs[ci], y, cols[ci], headH1 + headH2, label);
    }
    y += headH1;

    // Fila 2: sub-encabezado DIA / MES / AÑO
    ["DIA", "MES", "AÑO"].forEach((lbl, i) => {
      hdrCell(colXs[i], y, cols[i], headH2, lbl, true);
    });
    y += headH2;

    // Filas de datos con separadores verticales de columna
    doc.setFont("helvetica", "normal");
    doc.setTextColor(40, 40, 40);
    doc.setFontSize(7);
    for (const row of historial) {
      checkPage(rowH);
      // Fondo alterno blanco / gris muy claro
      doc.setFillColor(255, 255, 255);
      doc.setDrawColor(160, 160, 160);
      doc.setLineWidth(0.2);
      // Borde exterior de la fila
      doc.rect(colXs[0], y, tableW, rowH, "FD");
      // Separadores verticales internos
      for (let ci = 1; ci < cols.length; ci++) {
        doc.setDrawColor(200, 200, 200);
        doc.line(colXs[ci], y, colXs[ci], y + rowH);
      }
      // Texto de cada celda
      const textY = y + rowH / 2 + 1.5;
      [
        row.dia,
        row.mes,
        row.anio,
        row.grado,
        row.edad,
        row.promovido ? "SÍ" : "",
        row.firma_alumno,
        row.firma_padre,
      ].forEach((v, i) => {
        if (v)
          doc.text(String(v), colXs[i] + cols[i] / 2, textY, {
            align: "center",
          });
      });
      y += rowH;
    }

    doc.save("tarjeta_matricula.pdf");
  }, [form, historial, logoBase64, data]);

  /* ── Handlers ── */
  const set = (field) => (val) =>
    setForm((prev) => ({ ...prev, [field]: val }));

  const addRow = () => setHistorial((prev) => [...prev, { ...EMPTY_ROW }]);
  const removeRow = (i) =>
    setHistorial((prev) => prev.filter((_, idx) => idx !== i));
  const updateRow = (i, field, value) =>
    setHistorial((prev) =>
      prev.map((row, idx) => (idx === i ? { ...row, [field]: value } : row)),
    );

  /* ── Estilos reutilizables ── */
  const labelCls = "font-semibold text-xs whitespace-nowrap";
  const cellCls = "border border-gray-400 px-1 py-0.5 text-center";

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Tarjeta Acumulativa de Matrícula"
      size="5xl"
    >
      {loading ? (
        <div className="flex justify-center p-10">
          <Loader />
        </div>
      ) : (
        <div className="flex flex-col gap-3 text-sm text-gray-800">
          {/* ── Fila EPS / RH ── */}
          <div className="flex justify-end gap-6">
            <div className="flex items-center gap-2">
              <span className={labelCls}>EPS:</span>
              <Field
                value={form.eps}
                onChange={set("eps")}
                placeholder="Ej: Sura"
                className="w-32"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className={labelCls}>RH:</span>
              <Field
                value={form.rh}
                onChange={set("rh")}
                placeholder="Ej: O+"
                className="w-16"
              />
            </div>
          </div>

          {/* ── CÓDIGO DE MATRÍCULA ── */}
          <div className="flex items-center gap-2 justify-end">
            <span className={`${labelCls} text-xs`}>
              TARJETA ACUMULATIVA DE MATRÍCULA CÓDIGO:
            </span>
            <Field
              value={form.codigo_matricula}
              onChange={set("codigo_matricula")}
              placeholder="Código"
              className="w-28"
            />
          </div>

          {/* ── Apellido y Nombre ── */}
          <div className="flex items-center gap-2 border-b border-gray-300 pb-1">
            <span className={labelCls}>Apellido y Nombre:</span>
            <Field
              value={form.apellido_nombre}
              onChange={set("apellido_nombre")}
              placeholder="Apellidos y nombres"
              className="flex-1"
            />
          </div>

          {/* ── Identificación ── */}
          <div className="flex flex-wrap items-center gap-3 border-b border-gray-300 pb-1">
            <span className={labelCls}>Identificación:</span>
            <select
              value={form.tipo_id}
              onChange={(e) => set("tipo_id")(e.target.value)}
              className="border border-gray-400 rounded px-1 py-0.5 bg-surface text-xs"
            >
              <option value="TI">TI</option>
              <option value="CC">CC</option>
              <option value="RC">RC</option>
              <option value="CE">CE</option>
            </select>
            <span className={labelCls}>No.</span>
            <Field
              value={form.numero_id}
              onChange={set("numero_id")}
              placeholder="Número"
              className="w-36"
            />
            <span className={labelCls}>de:</span>
            <Field
              value={form.ciudad_id}
              onChange={set("ciudad_id")}
              placeholder="Ciudad expedición"
              className="w-40"
            />
          </div>

          {/* ── Lugar de Nacimiento / Fecha / Edad ── */}
          <div className="flex flex-wrap items-center gap-3 border-b border-gray-300 pb-1">
            <span className={labelCls}>Lugar de Nacimiento:</span>
            <Field
              value={form.lugar_nacimiento}
              onChange={set("lugar_nacimiento")}
              placeholder="Ciudad"
              className="w-36"
            />
            <span className={labelCls}>Fecha:</span>
            <Field
              value={form.fecha_nacimiento}
              onChange={set("fecha_nacimiento")}
              placeholder="AAAA-MM-DD"
              type="date"
              className="w-36"
            />
            <span className={labelCls}>Edad:</span>
            <Field
              value={form.edad}
              onChange={set("edad")}
              placeholder="Años"
              className="w-12"
            />
          </div>

          {/* ── Residencia / Teléfono ── */}
          <div className="flex flex-wrap items-center gap-3 border-b border-gray-300 pb-1">
            <span className={labelCls}>Residencia:</span>
            <Field
              value={form.residencia}
              onChange={set("residencia")}
              placeholder="Dirección"
              className="flex-1 min-w-[200px]"
            />
            <span className={labelCls}>Teléfono:</span>
            <Field
              value={form.telefono_estudiante}
              onChange={set("telefono_estudiante")}
              placeholder="Teléfono"
              className="w-36"
            />
          </div>

          {/* ── Padre ── */}
          <div className="flex flex-wrap items-center gap-3 border-b border-gray-300 pb-1">
            <span className={labelCls}>Nombre del Padre:</span>
            <Field
              value={form.nombre_padre}
              onChange={set("nombre_padre")}
              placeholder="Nombre completo"
              className="flex-1 min-w-40"
            />
            <span className={labelCls}>C.C. No.</span>
            <Field
              value={form.cc_padre}
              onChange={set("cc_padre")}
              placeholder="Cédula"
              className="w-28"
            />
            <span className={labelCls}>Lugar de Trabajo:</span>
            <Field
              value={form.trabajo_padre}
              onChange={set("trabajo_padre")}
              placeholder="Empresa"
              className="w-28"
            />
            <span className={labelCls}>Tel.:</span>
            <Field
              value={form.tel_padre}
              onChange={set("tel_padre")}
              placeholder="Teléfono"
              className="w-28"
            />
          </div>

          {/* ── Madre ── */}
          <div className="flex flex-wrap items-center gap-3 border-b border-gray-300 pb-1">
            <span className={labelCls}>Nombre de la Madre:</span>
            <Field
              value={form.nombre_madre}
              onChange={set("nombre_madre")}
              placeholder="Nombre completo"
              className="flex-1 min-w-40"
            />
            <span className={labelCls}>C.C. No.</span>
            <Field
              value={form.cc_madre}
              onChange={set("cc_madre")}
              placeholder="Cédula"
              className="w-28"
            />
            <span className={labelCls}>Lugar de Trabajo:</span>
            <Field
              value={form.trabajo_madre}
              onChange={set("trabajo_madre")}
              placeholder="Empresa"
              className="w-28"
            />
            <span className={labelCls}>Tel.:</span>
            <Field
              value={form.tel_madre}
              onChange={set("tel_madre")}
              placeholder="Teléfono"
              className="w-28"
            />
          </div>

          {/* ── Acudiente ── */}
          <div className="flex flex-wrap items-center gap-3 border-b border-gray-300 pb-1">
            <span className={labelCls}>Acudiente:</span>
            <Field
              value={form.nombre_acudiente}
              onChange={set("nombre_acudiente")}
              placeholder="Nombre del acudiente"
              className="flex-1 min-w-40"
            />
            <span className={labelCls}>Dirección:</span>
            <Field
              value={form.direccion_acudiente}
              onChange={set("direccion_acudiente")}
              placeholder="Dirección"
              className="w-40"
            />
            <span className={labelCls}>Tel.:</span>
            <Field
              value={form.tel_acudiente}
              onChange={set("tel_acudiente")}
              placeholder="Teléfono"
              className="w-28"
            />
          </div>

          {/* ── Col. de Procedencia / Motivo de Retiro ── */}
          <div className="flex flex-wrap items-center gap-3 border-b border-gray-300 pb-1">
            <span className={labelCls}>Col. de Procedencia:</span>
            <Field
              value={form.col_procedencia}
              onChange={set("col_procedencia")}
              placeholder="Colegio anterior"
              className="flex-1 min-w-40"
            />
            <span className={labelCls}>Motivo de Retiro:</span>
            <Field
              value={form.motivo_retiro}
              onChange={set("motivo_retiro")}
              placeholder="Motivo"
              className="flex-1 min-w-40"
            />
          </div>

          {/* ── Texto legal ── */}
          <p className="text-xs text-gray-500 italic border border-gray-200 rounded p-2">
            Al firmar el presente documento nos comprometemos a cumplir
            totalmente el manual de convivencia del colegio, el cual conocemos.
          </p>

          {/* ── Tabla historial ── */}
          <div className="mt-2">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-sm">Historial de matrícula</h3>
              <SimpleButton
                onClick={addRow}
                msj="Agregar fila"
                icon="Plus"
                bg="bg-primary"
                text="text-surface"
                className="text-xs px-2 py-1"
              />
            </div>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-400 text-xs">
                <thead>
                  <tr className="bg-gray-100">
                    <th className={`${cellCls} font-semibold`} colSpan={3}>
                      FECHA
                    </th>
                    <th className={`${cellCls} font-semibold`} rowSpan={2}>
                      GRADO
                    </th>
                    <th className={`${cellCls} font-semibold`} rowSpan={2}>
                      EDAD
                    </th>
                    <th className={`${cellCls} font-semibold`} rowSpan={2}>
                      PROMO-
                      <br />
                      VIDO
                    </th>
                    <th className={`${cellCls} font-semibold`} rowSpan={2}>
                      FIRMA DEL ALUMNO
                    </th>
                    <th className={`${cellCls} font-semibold`} rowSpan={2}>
                      FIRMA DEL PADRE O ACUDIENTE
                    </th>
                    <th className={`${cellCls} font-semibold`} rowSpan={2}>
                      &nbsp;
                    </th>
                  </tr>
                  <tr className="bg-gray-100">
                    <th className={`${cellCls} font-semibold`}>DIA</th>
                    <th className={`${cellCls} font-semibold`}>MES</th>
                    <th className={`${cellCls} font-semibold`}>AÑO</th>
                  </tr>
                </thead>
                <tbody>
                  {historial.map((row, i) => (
                    <tr key={i}>
                      <td className={cellCls}>
                        <input
                          type="text"
                          value={row.dia}
                          onChange={(e) => updateRow(i, "dia", e.target.value)}
                          placeholder="DD"
                          maxLength={2}
                          className="w-8 text-center bg-transparent focus:outline-none"
                        />
                      </td>
                      <td className={cellCls}>
                        <input
                          type="text"
                          value={row.mes}
                          onChange={(e) => updateRow(i, "mes", e.target.value)}
                          placeholder="MM"
                          maxLength={2}
                          className="w-8 text-center bg-transparent focus:outline-none"
                        />
                      </td>
                      <td className={cellCls}>
                        <input
                          type="text"
                          value={row.anio}
                          onChange={(e) => updateRow(i, "anio", e.target.value)}
                          placeholder="AAAA"
                          maxLength={4}
                          className="w-12 text-center bg-transparent focus:outline-none"
                        />
                      </td>
                      <td className={cellCls}>
                        <input
                          type="text"
                          value={row.grado}
                          onChange={(e) =>
                            updateRow(i, "grado", e.target.value)
                          }
                          placeholder="Grado"
                          className="w-14 text-center bg-transparent focus:outline-none"
                        />
                      </td>
                      <td className={cellCls}>
                        <input
                          type="text"
                          value={row.edad}
                          onChange={(e) => updateRow(i, "edad", e.target.value)}
                          placeholder="Edad"
                          maxLength={3}
                          className="w-10 text-center bg-transparent focus:outline-none"
                        />
                      </td>
                      <td className={`${cellCls} text-center`}>
                        <input
                          type="checkbox"
                          checked={row.promovido}
                          onChange={(e) =>
                            updateRow(i, "promovido", e.target.checked)
                          }
                          className="w-4 h-4"
                        />
                      </td>
                      <td className={cellCls}>
                        <input
                          type="text"
                          value={row.firma_alumno}
                          onChange={(e) =>
                            updateRow(i, "firma_alumno", e.target.value)
                          }
                          placeholder="Firma alumno"
                          className="w-28 bg-transparent focus:outline-none"
                        />
                      </td>
                      <td className={cellCls}>
                        <input
                          type="text"
                          value={row.firma_padre}
                          onChange={(e) =>
                            updateRow(i, "firma_padre", e.target.value)
                          }
                          placeholder="Firma padre/acudiente"
                          className="w-36 bg-transparent focus:outline-none"
                        />
                      </td>
                      <td className={cellCls}>
                        <button
                          type="button"
                          onClick={() => removeRow(i)}
                          className="text-red-500 hover:text-red-700 font-bold px-1"
                          title="Eliminar fila"
                          disabled={historial.length === 1}
                        >
                          ✕
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* ── Botón Descargar PDF ── */}
          <div className="flex justify-end pt-3 border-t border-gray-200 mt-2">
            <SimpleButton
              type="button"
              msj="Descargar PDF"
              icon="FileText"
              bg="bg-blue-700"
              text="text-white"
              hover="hover:bg-blue-800"
              onClick={handleGeneratePDF}
            />
          </div>
        </div>
      )}
    </Modal>
  );
};

export default MatriculaModal;
