import { useState, useEffect, useCallback, useContext } from "react";
import jsPDF from "jspdf";
import Modal from "../atoms/Modal";
import Loader from "../atoms/Loader";
import SimpleButton from "../atoms/SimpleButton";
import { getDataStudentGuardian } from "../../services/studentService";
import { AuthContext } from "../../lib/context/AuthContext";

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

const GRADOS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];

const EMPTY_HISTORIA_ROW = { anio: "", institucion: "" };

const EMPTY_FORM = {
  // Header - Jornada / Grado
  jornada_manana: false,
  jornada_tarde: false,
  grado_cursar: "",
  // Información del Alumno
  tipo_id: "TI",
  numero_id: "",
  primer_apellido: "",
  segundo_apellido: "",
  primero_nombre: "",
  segundo_nombre: "",
  fecha_nacimiento: "",
  edad: "",

  genero_texto: "",
  municipio_nacimiento: "",
  departamento_nacimiento: "",
  // Ubicación del Alumno
  direccion_residencia: "",
  barrio: "",
  municipio: "",
  telefono_fijo: "",
  telefono_celular: "",
  estrato: "",
  nivel_sisben: "",
  // Víctimas de Conflicto
  en_desplazamiento: false,
  desvinculado: false,
  depto_expulsor: "",
  municipio_expulsor: "",
  grupo_etnico: "",
  // Limitaciones
  limitacion_sindrome_down: false,
  limitacion_baja_vision: false,
  limitacion_paralisis_cerebral: false,
  limitacion_retraso_mental: false,
  limitacion_ceguera: false,
  limitacion_lesion_neuromuscular: false,
  limitacion_sordera: false,
  limitacion_autismo: false,
  limitacion_multi_impedido: false,
  // Capacidades Excepcionales
  capacidad_superdotado: false,
  capacidad_tecnologico: false,
  capacidad_cientifico: false,
  capacidad_artistico_deportivo: false,
  puntaje_coeficiente: "",
  // Padres y Acudientes
  nombre_padre: "",
  cc_padre: "",
  tel_padre: "",
  nombre_madre: "",
  cc_madre: "",
  tel_madre: "",
  nombre_acudiente: "",
  cc_acudiente: "",
  tel_acudiente: "",
  // Salud
  problematicas_salud: "",
  eps: "",
  grupo_sanguineo: "",
  ips: "",
  rh: "",
  // Retiro
  motivo_retiro: "",
  fecha_retiro: "",
};

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
    className={` bg-transparent focus:outline-none focus:border-primary px-1 min-w-0 ${className}`}
  />
);

const TdField = ({
  value,
  onChange,
  placeholder,
  className = "",
  type = "text",
  colSpan,
}) => (
  <td className="border border-gray-400 px-1 py-0.5" colSpan={colSpan}>
    <input
      type={type}
      value={value ?? ""}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={`w-full bg-transparent focus:outline-none text-center text-xs ${className}`}
    />
  </td>
);

const TdLabel = ({ children, className = "", colSpan }) => (
  <td
    className={`border border-gray-400 px-1 py-0.5 font-semibold text-xs whitespace-nowrap ${className}`}
    colSpan={colSpan}
  >
    {children}
  </td>
);

const TdCheck = ({ checked, onChange, label }) => (
  <td className="border border-gray-400 px-1 py-0.5 text-left text-xs">
    <label className="inline-flex items-start gap-1 cursor-pointer">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="w-3.5 h-3.5 mt-0.5"
      />
      {label && <span>{label}</span>}
    </label>
  </td>
);

const MatriculaModal = ({ isOpen, onClose, data }) => {
  console.log("MatriculaModal data:", data);
  const { imgSchool } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [historia, setHistoria] = useState(
    GRADOS.map(() => ({ ...EMPTY_HISTORIA_ROW })),
  );
  const [logoBase64, setLogoBase64] = useState("");
  const [fotoBase64, setFotoBase64] = useState("");

  const prefillFromData = (d) => {
    console.log("Prefill data:", d);
    if (!d) return;

    const fechaNac = d.fecha_nacimiento
      ? d.fecha_nacimiento.split("T")[0]
      : d.birthday
        ? d.birthday.split("T")[0]
        : "";

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
      primer_apellido:
        d.papellido_estudiante ||
        d.primer_apellido ||
        d.first_lastname ||
        prev.primer_apellido,
      segundo_apellido:
        d.sapellido_estudiante ||
        d.segundo_apellido ||
        d.second_lastname ||
        prev.segundo_apellido,
      primero_nombre:
        d.pnombre_estudiante ||
        d.primero_nombre ||
        d.first_name ||
        prev.primero_nombre,
      segundo_nombre:
        d.snombre_estudiante ||
        d.segundo_nombre ||
        d.second_name ||
        prev.segundo_nombre,
      tipo_id: d.nombre_identi_estudiante,
      numero_id:
        d.identificacion_estudiante || d.identification || prev.numero_id,
      fecha_nacimiento: fechaNac || prev.fecha_nacimiento,
      edad: calcularEdad(fechaNac) || prev.edad,
      genero_texto: d.genero || d.genre || "",
      direccion_residencia:
        d.direccion || d.address || prev.direccion_residencia,
      telefono_celular: d.telefono || d.telephone || prev.telefono_celular,
      nombre_padre: d.nombre_padre || "",
      cc_padre: d.cc_padre || "",
      tel_padre: d.tel_padre || "",
      nombre_madre: d.nombre_madre || "",
      cc_madre: d.cc_madre || "",
      tel_madre: d.tel_madre || "",
      nombre_acudiente:
        d.nombre_acudiente ||
        [
          d.primer_apellido_acudiente,
          d.segundo_apellido_acudiente,
          d.primero_nombre_acudiente,
          d.segundo_nombre_acudiente,
        ]
          .filter(Boolean)
          .join(" ") ||
        [
          d.primer_apellido,
          d.segundo_apellido,
          d.primero_nombre,
          d.segundo_nombre,
        ]
          .filter(Boolean)
          .join(" ") ||
        prev.nombre_acudiente,
      cc_acudiente:
        d.numero_identificacion_acudiente ||
        d.cc_acudiente ||
        prev.cc_acudiente,
      tel_acudiente: d.telefono_acudiente || prev.tel_acudiente,
      eps: d.eps || prev.eps,
      rh: d.rh || prev.rh,
    }));
  };

  useEffect(() => {
    if (!isOpen || !data) return;
    setForm(EMPTY_FORM);
    setHistoria(GRADOS.map(() => ({ ...EMPTY_HISTORIA_ROW })));
    setFotoBase64("");
    setLogoBase64("");

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
  }, [isOpen, data]);

  useEffect(() => {
    if (!isOpen) return;
    const loadImage = (url, setter) => {
      if (!url) {
        setter("");
        return;
      }
      fetch(url)
        .then((r) => {
          if (!r.ok) throw new Error();
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
        .then(setter)
        .catch(() => setter(""));
    };
    loadImage(data?.link_logo, setLogoBase64);
    loadImage(data?.link_foto || data?.url_photo, setFotoBase64);
  }, [isOpen, data]);

  const handleGeneratePDF = useCallback(() => {
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "legal",
    });
    const pw = doc.internal.pageSize.getWidth();
    const ph = doc.internal.pageSize.getHeight();
    const ml = 8,
      mr = 8;
    const uw = pw - ml - mr;
    let y = 10;
    const lh = 6;
    const rowH = 7;

    const checkPage = (needed = rowH) => {
      if (y + needed > ph - 10) {
        doc.addPage();
        y = 10;
      }
    };

    const bold = () => {
      doc.setFont("helvetica", "bold");
    };
    const normal = () => {
      doc.setFont("helvetica", "normal");
    };
    const setFs = (s) => {
      doc.setFontSize(s);
    };
    const text = (t, x, yPos, opts) => {
      doc.text(t, x, yPos, opts);
    };
    const cell = (x, yPos, w, h, label, val = "", isLabel = true) => {
      doc.setDrawColor(180, 180, 180);
      doc.setLineWidth(0.3);
      doc.rect(x, yPos, w, h);
      if (isLabel) {
        bold();
        setFs(6.5);
        doc.setTextColor(40, 40, 40);
        text(label, x + 1, yPos + h / 2 + 1.5);
        if (val) {
          normal();
          setFs(6.5);
          const lw = doc.getTextWidth(label + " ");
          text(String(val), x + 1 + lw, yPos + h / 2 + 1.5);
        }
      } else {
        normal();
        setFs(6.5);
        doc.setTextColor(40, 40, 40);
        text(String(val || ""), x + 1, yPos + h / 2 + 1.5);
      }
    };

    const sectionTitle = (title) => {
      checkPage(lh + 2);
      doc.setFillColor(41, 98, 160);
      doc.setDrawColor(41, 98, 160);
      doc.rect(ml, y, uw, lh - 1, "FD");
      doc.setTextColor(255, 255, 255);
      bold();
      setFs(8);
      text(title, ml + 2, y + lh / 2 + 1.5);
      doc.setTextColor(40, 40, 40);
      y += lh + 0.5;
    };

    const drawRow = (cols) => {
      checkPage(rowH);
      let x = ml;
      cols.forEach(({ w, label, val, isLabel = true }) => {
        cell(x, y, w, rowH, label, val, isLabel);
        x += w;
      });
      y += rowH;
    };

    const checkboxPdf = (x, yPos, checked) => {
      doc.setDrawColor(80, 80, 80);
      doc.setLineWidth(0.4);
      doc.rect(x, yPos - 3, 3.5, 3.5);
      if (checked) {
        doc.setDrawColor(0, 0, 0);
        doc.setLineWidth(0.6);
        doc.line(x + 0.5, yPos - 1.5, x + 3, yPos - 1.5);
        doc.line(x + 1.8, yPos - 2.5, x + 1.8, yPos - 0.5);
      }
    };

    // ── Header ──
    const hasFoto = !!fotoBase64;
    const fotoW = 22,
      fotoH = 28;
    const imgschoolW = 22,
      imgschoolH = 22;
    const headerInitialY = y;
    let hdrX = ml;

    if (hasFoto) {
      doc.addImage(fotoBase64, "JPEG", hdrX, headerInitialY, fotoW, fotoH);
      hdrX += fotoW + 3;
    }

    if (imgSchool) {
      doc.addImage(
        imgSchool,
        "JPEG",
        pw - mr - imgschoolW,
        headerInitialY,
        imgschoolW,
        imgschoolH,
      );
    }
    const rightBound = imgSchool ? pw - mr - imgschoolW - 2 : pw - mr;
    const centerW = rightBound - hdrX;

    bold();
    setFs(10);
    doc.setTextColor(30, 60, 130);
    text("HOJA DE MATRICULA AÑO LECTIVO 2026", hdrX + centerW / 2, y + 4, {
      align: "center",
    });
    y += lh;

    const instName =
      data?.nombre_sede ||
      data?.nombre_institucion ||
      data?.name_school ||
      "INSTITUCIÓN EDUCATIVA";
    bold();
    setFs(8);
    doc.setTextColor(30, 60, 130);
    text(instName, hdrX + centerW / 2, y + 2, { align: "center" });

    y += lh;

    doc.setTextColor(40, 40, 40);
    if (data?.cod_dane) {
      bold();
      setFs(7);
      text(`DANE: ${data.cod_dane}`, hdrX, y);
    }
    y += lh - 1;

    bold();
    setFs(7);
    text("JORNADA:", hdrX, y);
    normal();
    setFs(7);
    text(
      String(data?.nombre_jornada_estudiante || ""),
      doc.getTextWidth("JORNADA: ") + hdrX,
      y,
    );
    y += lh;

    bold();
    setFs(7);
    text("GRADO A CURSAR AÑO:", hdrX, y);
    normal();
    setFs(7);
    const gradoText = [data?.nombre_grado, data?.grupo]
      .filter(Boolean)
      .join(" - ");
    text(
      gradoText || "_______________",
      doc.getTextWidth("GRADO A CURSAR AÑO: ") + hdrX,
      y,
    );
    y += lh + 2;

    // ── Información Del Alumno ──
    sectionTitle("Información Del Alumno");

    drawRow([
      { w: uw * 0.5, label: "TIPO DE IDENTIFICACIÓN:", val: form.tipo_id },
      { w: uw * 0.5, label: "NÚMERO DE IDENTIFICACIÓN:", val: form.numero_id },
    ]);

    // Apellidos / Nombres (label arriba, valor abajo)
    checkPage(rowH);
    const nameCols = [
      { label: "1er APELLIDO", val: form.primer_apellido },
      { label: "2do APELLIDO", val: form.segundo_apellido },
      { label: "1er NOMBRE", val: form.primero_nombre },
      { label: "2do NOMBRE", val: form.segundo_nombre },
    ];
    let xNm = ml;
    nameCols.forEach(({ label, val }) => {
      const cw = uw / nameCols.length;
      doc.setDrawColor(180, 180, 180);
      doc.setLineWidth(0.3);
      doc.rect(xNm, y, cw, rowH);
      bold();
      setFs(6);
      doc.setTextColor(40, 40, 40);
      text(label, xNm + cw / 2, y + rowH * 0.35, { align: "center" });
      normal();
      setFs(6.5);
      text(val || "", xNm + cw / 2, y + rowH * 0.75, { align: "center" });
      xNm += cw;
    });
    y += rowH;

    // Fecha Nacimiento (2 filas: header + valores)
    checkPage(rowH * 2);
    const f1 = uw * 0.14,
      f2a = uw * 0.12,
      f2b = uw * 0.12,
      f2c = uw * 0.12;
    const f3 = uw * 0.25,
      f4 = uw * 0.25;
    let xF = ml;

    doc.setDrawColor(180, 180, 180);
    doc.setLineWidth(0.3);
    // FECHA NACIMIENTO (rowSpan=2)
    doc.rect(xF, y, f1, rowH * 2);
    bold();
    setFs(6.5);
    doc.setTextColor(40, 40, 40);
    text("FECHA NACIMIENTO", xF + f1 / 2, y + rowH, { align: "center" });
    xF += f1;

    // DIA header
    doc.rect(xF, y, f2a, rowH);
    bold();
    setFs(6);
    text("DIA", xF + f2a / 2, y + rowH / 2 + 1.5, { align: "center" });
    xF += f2a;

    // MES header
    doc.rect(xF, y, f2b, rowH);
    text("MES", xF + f2b / 2, y + rowH / 2 + 1.5, { align: "center" });
    xF += f2b;

    // AÑO header
    doc.rect(xF, y, f2c, rowH);
    text("AÑO", xF + f2c / 2, y + rowH / 2 + 1.5, { align: "center" });
    xF += f2c;

    // EDAD header
    doc.rect(xF, y, f3, rowH);
    text("EDAD", xF + f3 / 2, y + rowH / 2 + 1.5, { align: "center" });
    xF += f3;

    // GENERO header
    doc.rect(xF, y, f4, rowH);
    text("GENERO", xF + f4 / 2, y + rowH / 2 + 1.5, { align: "center" });

    y += rowH;

    // Row 2 - values
    xF = ml + f1;
    const diaVal = form.fecha_nacimiento
      ? form.fecha_nacimiento.split("-")[2] || ""
      : "";
    const mesVal = form.fecha_nacimiento
      ? form.fecha_nacimiento.split("-")[1] || ""
      : "";
    const anioVal = form.fecha_nacimiento
      ? form.fecha_nacimiento.split("-")[0] || ""
      : "";

    // DIA value
    doc.rect(xF, y, f2a, rowH);
    normal();
    setFs(6.5);
    doc.setTextColor(40, 40, 40);
    text(diaVal || "", xF + f2a / 2, y + rowH / 2 + 1.5, { align: "center" });
    xF += f2a;

    // MES value
    doc.rect(xF, y, f2b, rowH);
    text(mesVal || "", xF + f2b / 2, y + rowH / 2 + 1.5, { align: "center" });
    xF += f2b;

    // AÑO value
    doc.rect(xF, y, f2c, rowH);
    text(anioVal || "", xF + f2c / 2, y + rowH / 2 + 1.5, { align: "center" });
    xF += f2c;

    doc.rect(xF, y, f3, rowH);
    text(form.edad || "", xF + f3 / 2, y + rowH / 2 + 1.5, { align: "center" });
    xF += f3;

    doc.rect(xF, y, f4, rowH);
    text(form.genero_texto || "—", xF + f4 / 2, y + rowH / 2 + 1.5, {
      align: "center",
    });
    y += rowH;

    // Municipio / Departamento
    drawRow([
      {
        w: uw * 0.5,
        label: "MUNICIPIO DE NACIMIENTO",
        val: form.municipio_nacimiento,
      },
      {
        w: uw * 0.5,
        label: "DEPARTAMENTO DE NACIMIENTO",
        val: form.departamento_nacimiento,
      },
    ]);

    // ── Ubicación Del Alumno ──
    sectionTitle("Ubicación Del Alumno");
    checkPage(rowH);
    const ubicCols = [
      { w: uw * 0.22, label: "DIRECCIÓN", val: form.direccion_residencia },
      { w: uw * 0.14, label: "BARRIO", val: form.barrio },
      { w: uw * 0.14, label: "MUNICIPIO", val: form.municipio },
      { w: uw * 0.13, label: "TEL. FIJO", val: form.telefono_fijo },
      { w: uw * 0.14, label: "TEL. CELULAR", val: form.telefono_celular },
      { w: uw * 0.115, label: "ESTRATO", val: form.estrato },
      { w: uw * 0.115, label: "SISBEN", val: form.nivel_sisben },
    ];
    let xUb = ml;
    ubicCols.forEach(({ w, label, val }) => {
      doc.setDrawColor(180, 180, 180);
      doc.setLineWidth(0.3);
      doc.rect(xUb, y, w, rowH);
      bold();
      setFs(6);
      doc.setTextColor(40, 40, 40);
      text(label, xUb + w / 2, y + rowH * 0.35, { align: "center" });
      normal();
      setFs(6.5);
      text(val || "", xUb + w / 2, y + rowH * 0.75, { align: "center" });
      xUb += w;
    });
    y += rowH;

    // ── Historia Académica ──
    sectionTitle("Historia Académica");
    const colW = uw / 6;
    const histHeaders = [
      "Grado",
      "Año",
      "Institución",
      "Grado",
      "Año",
      "Institución",
    ];
    checkPage(rowH);
    let xH = ml;
    histHeaders.forEach((h) => {
      doc.setFillColor(41, 98, 160);
      doc.setDrawColor(180, 180, 180);
      doc.rect(xH, y, colW, rowH, "FD");
      doc.setTextColor(255, 255, 255);
      bold();
      setFs(6.5);
      text(h, xH + colW / 2, y + rowH / 2 + 1.5, { align: "center" });
      xH += colW;
    });
    y += rowH;

    for (let i = 0; i < 6; i++) {
      const left = historia[i] || { anio: "", institucion: "" };
      const right = historia[i + 6] || { anio: "", institucion: "" };
      checkPage(rowH);
      xH = ml;
      [
        i,
        left.anio,
        left.institucion,
        i + 6,
        right.anio,
        right.institucion,
      ].forEach((val) => {
        doc.setDrawColor(180, 180, 180);
        doc.setLineWidth(0.3);
        doc.rect(xH, y, colW, rowH);
        normal();
        setFs(6.5);
        doc.setTextColor(40, 40, 40);
        if (val !== undefined && val !== "")
          text(String(val), xH + colW / 2, y + rowH / 2 + 1.5, {
            align: "center",
          });
        xH += colW;
      });
      y += rowH;
    }

    // ── Víctimas de Conflicto ──
    sectionTitle("Víctimas de Conflicto");
    checkPage(rowH);
    let xV = ml;
    cell(xV, y, uw * 0.5, rowH, "DESPLAZAMIENTO", "", true);
    checkboxPdf(
      xV + doc.getTextWidth("DESPLAZAMIENTO: ") + 1,
      y + rowH / 2 + 1.5,
      form.en_desplazamiento,
    );
    xV += uw * 0.5;
    cell(xV, y, uw * 0.5, rowH, "DESVINCULADO", "", true);
    checkboxPdf(
      xV + doc.getTextWidth("DESVINCULADO: ") + 1,
      y + rowH / 2 + 1.5,
      form.desvinculado,
    );
    y += rowH;

    drawRow([
      { w: uw * 0.5, label: "DPTO EXPULSOR", val: form.depto_expulsor },
      {
        w: uw * 0.5,
        label: "MUNICIPIO EXPULSOR",
        val: form.municipio_expulsor,
      },
    ]);

    checkPage(rowH);
    const etnias = ["RAIZALES", "AFROCOLOMBIANO", "INDIGENAS", "ROM"];
    let xE = ml;
    doc.setDrawColor(180, 180, 180);
    doc.setLineWidth(0.3);
    doc.rect(xE, y, uw * 0.2, rowH);
    bold();
    setFs(6.5);
    doc.setTextColor(40, 40, 40);
    text("GRUPO ÉTNICO", xE + (uw * 0.2) / 2, y + rowH / 2 + 1.5, {
      align: "center",
    });
    xE += uw * 0.2;
    const etW = (uw * 0.8) / etnias.length;
    etnias.forEach((g) => {
      doc.rect(xE, y, etW, rowH);
      normal();
      setFs(6.5);
      if (form.grupo_etnico === g) {
        doc.setDrawColor(0, 0, 0);
        doc.setLineWidth(0.6);
        doc.circle(xE + 3, y + rowH / 2, 1.5, "S");
        doc.circle(xE + 3, y + rowH / 2, 0.8, "F");
        doc.setDrawColor(180, 180, 180);
        doc.setLineWidth(0.3);
      } else {
        doc.setDrawColor(80, 80, 80);
        doc.setLineWidth(0.4);
        doc.circle(xE + 3, y + rowH / 2, 1.5, "S");
      }
      doc.setTextColor(40, 40, 40);
      text(g, xE + 7, y + rowH / 2 + 1.5);
      xE += etW;
    });
    y += rowH;

    // ── Limitaciones / Capacidades ──
    sectionTitle(
      "Limitaciones o Capacidades Excepcionales (Anexar Soporte Médico – Especialista)",
    );

    const drawLimCheckCell = (x, yPos, w, limKey, txt) => {
      doc.setDrawColor(180, 180, 180);
      doc.setLineWidth(0.3);
      doc.rect(x, yPos, w, rowH);
      if (txt) {
        normal();
        setFs(6);
        doc.setTextColor(40, 40, 40);
        if (limKey) checkboxPdf(x + 2, yPos + rowH / 2 + 1.5, form[limKey]);
        doc.text(txt, x + 8, yPos + rowH / 2 + 1.5);
      }
    };

    const col25 = uw * 0.25;

    // LIMITACIONES — 3 rows with label spanning
    checkPage(rowH * 3);
    doc.setDrawColor(180, 180, 180);
    doc.setLineWidth(0.3);
    doc.rect(ml, y, col25, rowH * 3);
    bold();
    setFs(6.5);
    doc.setTextColor(40, 40, 40);
    text("LIMITACIONES", ml + col25 / 2, y + rowH * 1.5, { align: "center" });

    drawLimCheckCell(
      ml + col25,
      y,
      col25,
      "limitacion_sindrome_down",
      "Síndrome Down",
    );
    drawLimCheckCell(
      ml + col25 * 2,
      y,
      col25,
      "limitacion_baja_vision",
      "Baja Visión",
    );
    drawLimCheckCell(
      ml + col25 * 3,
      y,
      col25,
      "limitacion_paralisis_cerebral",
      "Parálisis Cerebral",
    );
    y += rowH;

    drawLimCheckCell(
      ml + col25,
      y,
      col25,
      "limitacion_retraso_mental",
      "Retraso Mental Leve",
    );
    drawLimCheckCell(ml + col25 * 2, y, col25, "limitacion_ceguera", "Ceguera");
    drawLimCheckCell(
      ml + col25 * 3,
      y,
      col25,
      "limitacion_lesion_neuromuscular",
      "Lesión Neuromuscular",
    );
    y += rowH;

    drawLimCheckCell(ml + col25, y, col25, "limitacion_sordera", "Sordera");
    drawLimCheckCell(ml + col25 * 2, y, col25, "limitacion_autismo", "Autismo");
    drawLimCheckCell(
      ml + col25 * 3,
      y,
      col25,
      "limitacion_multi_impedido",
      "Multi-Impedido",
    );
    y += rowH;

    // CAPACIDADES EXCEPCIONALES — 2 rows with label spanning
    checkPage(rowH * 2);
    doc.setDrawColor(180, 180, 180);
    doc.setLineWidth(0.3);
    doc.rect(ml, y, col25, rowH * 2);
    bold();
    setFs(6);
    doc.setTextColor(40, 40, 40);
    text("CAPACIDADES", ml + col25 / 2, y + rowH * 0.6, { align: "center" });
    text("EXCEPCIONALES", ml + col25 / 2, y + rowH * 1.4, { align: "center" });

    drawLimCheckCell(
      ml + col25,
      y,
      col25,
      "capacidad_superdotado",
      "Superdotado",
    );
    drawLimCheckCell(
      ml + col25 * 2,
      y,
      col25,
      "capacidad_tecnologico",
      "Tecnológico",
    );
    drawLimCheckCell(
      ml + col25 * 3,
      y,
      col25,
      "capacidad_cientifico",
      "Científico",
    );
    y += rowH;

    drawLimCheckCell(
      ml + col25,
      y,
      col25,
      "capacidad_artistico_deportivo",
      "Artístico/Deportivo",
    );
    drawLimCheckCell(ml + col25 * 2, y, col25, null, "");
    // merged cell for PUNTAJE (col 3 + 4)
    doc.setDrawColor(180, 180, 180);
    doc.setLineWidth(0.3);
    doc.rect(ml + col25 * 2, y, col25 * 2, rowH);
    bold();
    setFs(6);
    doc.setTextColor(40, 40, 40);
    text(
      "PUNTAJE COEFICIENTE INTELECTUAL:",
      ml + col25 * 2 + 2,
      y + rowH / 2 + 1.5,
    );
    normal();
    setFs(6);
    doc.setTextColor(60, 60, 60);
    text(
      form.puntaje_coeficiente || "",
      ml +
        col25 * 2 +
        doc.getTextWidth("PUNTAJE COEFICIENTE INTELECTUAL: ") +
        3,
      y + rowH / 2 + 1.5,
    );
    y += rowH;

    // ── Padres y Acudientes ──
    sectionTitle("Información de los Padres y Acudientes");

    const drawParentRow = (label, nameVal, ccVal, telVal) => {
      checkPage(rowH);
      const c1 = uw * 0.18,
        c2 = uw * 0.28,
        c3 = uw * 0.26,
        c4 = uw * 0.28;
      let xP = ml;
      doc.setDrawColor(180, 180, 180);
      doc.setLineWidth(0.3);
      doc.rect(xP, y, c1, rowH);
      bold();
      setFs(6.5);
      doc.setTextColor(40, 40, 40);
      text(label, xP + c1 / 2, y + rowH / 2 + 1.5, { align: "center" });
      xP += c1;
      doc.rect(xP, y, c2, rowH);
      normal();
      setFs(6);
      doc.setTextColor(40, 40, 40);
      text("NOMBRE:", xP + 1, y + rowH / 2 + 1.5);
      setFs(6);
      text(
        nameVal || "",
        xP + doc.getTextWidth("NOMBRE: ") + 2,
        y + rowH / 2 + 1.5,
      );
      xP += c2;
      doc.rect(xP, y, c3, rowH);
      doc.setTextColor(40, 40, 40);
      bold();
      setFs(6);
      text("N° CEDULA:", xP + 1, y + rowH / 2 + 1.5);
      normal();
      setFs(6);
      text(
        String(ccVal || ""),
        xP + doc.getTextWidth("N° CEDULA: ") + 1,
        y + rowH / 2 + 1.5,
      );
      xP += c3;
      doc.rect(xP, y, c4, rowH);
      bold();
      setFs(6);
      text("TEL. CELULAR:", xP + 1, y + rowH / 2 + 1.5);
      normal();
      setFs(6);
      text(
        String(telVal || ""),
        xP + doc.getTextWidth("TEL. CELULAR: ") + 1,
        y + rowH / 2 + 1.5,
      );
      y += rowH;
    };

    drawParentRow("PADRE", form.nombre_padre, form.cc_padre, form.tel_padre);
    drawParentRow("MADRE", form.nombre_madre, form.cc_madre, form.tel_madre);
    drawParentRow(
      "ACUDIENTE",
      form.nombre_acudiente,
      form.cc_acudiente,
      form.tel_acudiente,
    );

    // ── Salud ──
    sectionTitle("Información de Salud");
    checkPage(rowH * 2);
    doc.setDrawColor(180, 180, 180);
    doc.setLineWidth(0.3);
    doc.rect(ml, y, uw, rowH * 2);
    bold();
    setFs(6.5);
    doc.setTextColor(40, 40, 40);
    text(
      "Problemáticas de Salud presentadas por el estudiante (Anexar soporte médico):",
      ml + 1,
      y + rowH / 2 + 1.5,
    );
    normal();
    doc.setTextColor(100, 100, 100);
    text(form.problematicas_salud || "", ml + 1, y + rowH + 3);
    y += rowH * 2;

    drawRow([
      { w: uw * 0.5, label: "EPS", val: form.eps },
      { w: uw * 0.5, label: "GRUPO SANGUÍNEO", val: form.grupo_sanguineo },
    ]);
    drawRow([
      { w: uw * 0.5, label: "IPS", val: form.ips },
      { w: uw * 0.5, label: "RH", val: form.rh },
    ]);

    // ── Retiro ──
    sectionTitle("Retiro del estudiante");
    checkPage(rowH * 2);
    doc.setDrawColor(180, 180, 180);
    doc.setLineWidth(0.3);
    doc.rect(ml, y, uw, rowH * 2);
    bold();
    setFs(6.5);
    doc.setTextColor(40, 40, 40);
    text("Motivo o Causa del retiro:", ml + 1, y + rowH / 2 + 1.5);
    normal();
    doc.setTextColor(100, 100, 100);
    text(form.motivo_retiro || "", ml + 1, y + rowH + 3);
    y += rowH * 2;

    drawRow([{ w: uw, label: "FECHA DEL RETIRO", val: form.fecha_retiro }]);

    // ── Aceptación ──
    checkPage(lh * 3 + 10);
    y += 2;
    doc.setDrawColor(41, 98, 160);
    doc.setLineWidth(0.5);
    doc.rect(ml, y, uw, lh * 2 + 4);
    bold();
    setFs(7);
    doc.setTextColor(30, 60, 130);
    text(
      "ACEPTAMOS CUMPLIR CON EL PROYECTO EDUCATIVO INSTITUCIONAL (PEI) Y EL MANUAL DE CONVIVENCIA Y DEMAS DISPOSICIONES",
      ml + uw / 2,
      y + lh / 2 + 2,
      { align: "center" },
    );
    y += lh * 2 + 6;

    // ── Firmas ──
    checkPage(lh * 3 + 10);
    const sigW = uw / 2 - 5;
    doc.setDrawColor(180, 180, 180);
    doc.setLineWidth(0.3);
    doc.line(ml, y, ml + sigW, y);
    doc.line(ml + sigW + 10, y, ml + sigW * 2 + 10, y);
    bold();
    setFs(6);
    doc.setTextColor(80, 80, 80);
    text("Firma del Alumno", ml + sigW / 2, y + 4, { align: "center" });
    text("Firma del Padre o Acudiente", ml + sigW + 10 + sigW / 2, y + 4, {
      align: "center",
    });
    y += lh + 4;
    doc.line(ml, y, ml + sigW, y);
    doc.line(ml + sigW + 10, y, ml + sigW * 2 + 10, y);
    text("Firma del Rector(a)", ml + sigW / 2, y + 4, { align: "center" });
    text("Firma de la Secretaria", ml + sigW + 10 + sigW / 2, y + 4, {
      align: "center",
    });

    doc.save("hoja_matricula_2026.pdf");
  }, [form, historia, logoBase64, fotoBase64, data]);

  const set = (field) => (val) =>
    setForm((prev) => ({ ...prev, [field]: val }));
  const setHistRow = (i, field, val) =>
    setHistoria((prev) =>
      prev.map((r, idx) => (idx === i ? { ...r, [field]: val } : r)),
    );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="HOJA DE MATRICULA - AÑO LECTIVO 2026"
      size="6xl"
    >
      {loading ? (
        <div className="flex justify-center p-10">
          <Loader />
        </div>
      ) : (
        <div className="flex flex-col gap-2 text-xs text-gray-800 overflow-x-auto">
          {/* ============= HEADER ============= */}
          <table className="w-full border-collapse border border-gray-400">
            <tbody>
              <tr>
                <td
                  className="border border-gray-400 w-24 h-28 text-center align-middle"
                  rowSpan={4}
                >
                  {fotoBase64 ? (
                    <img
                      src={fotoBase64}
                      alt="Foto"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-[9px] text-gray-400">Foto 3x4</span>
                  )}
                </td>
                <td
                  className="border border-gray-400 px-2 py-1 text-center font-bold text-sm text-blue-900"
                  colSpan={3}
                >
                  HOJA DE MATRICULA AÑO LECTIVO 2026
                </td>
                <td
                  className="border border-gray-400 w-24 h-24 text-center align-middle"
                  rowSpan={4}
                >
                  {imgSchool ? (
                    <img
                      src={imgSchool}
                      alt="School"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-[9px] text-gray-400">School</span>
                  )}
                </td>
              </tr>
              <tr>
                <td
                  className="border border-gray-400 px-2 py-1 text-center font-bold text-blue-900 text-xs"
                  colSpan={3}
                >
                  {data?.nombre_sede ||
                    data?.nombre_institucion ||
                    data?.name_school ||
                    "INSTITUCIÓN EDUCATIVA"}
                </td>
              </tr>
              <tr>
                <td
                  className="border border-gray-400 px-2 py-1 text-xs"
                  colSpan={2}
                >
                  <span className="font-bold">DANE:</span>{" "}
                  {data?.cod_dane || "_______________"}
                </td>
                <td className="border border-gray-400 px-2 py-1 text-xs">
                  <span className="font-bold">JORNADA:</span>
                  <span className="ml-2 text-xs">
                    {data?.nombre_jornada_estudiante || ""}
                  </span>
                </td>
              </tr>
              <tr>
                <td
                  className="border border-gray-400 px-2 py-1 text-xs"
                  colSpan={3}
                >
                  <span className="font-bold">GRADO A CURSAR AÑO:</span>
                  <span className="ml-2 text-xs">
                    {[data?.nombre_grado, data?.grupo]
                      .filter(Boolean)
                      .join(" - ")}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>

          {/* ============= INFORMACIÓN DEL ALUMNO ============= */}
          <table className="w-full border-collapse border border-gray-400">
            <tbody>
              <tr>
                <td
                  className="bg-blue-800 text-white font-bold px-2 py-0.5 text-xs"
                  colSpan={100}
                >
                  Información Del Alumno
                </td>
              </tr>
              <tr>
                <td
                  className="border border-gray-400 px-1 py-0.5 text-xs"
                  colSpan={2}
                >
                  <span className="font-bold">TIPO DE IDENTIFICACIÓN:</span>
                  <span className="ml-1 text-xs">{form.tipo_id}</span>
                </td>
                <td
                  className="border border-gray-400 px-1 py-0.5 text-xs"
                  colSpan={2}
                >
                  <span className="font-bold">NÚMERO DE IDENTIFICACIÓN:</span>
                  <span className="ml-1 text-xs">{form.numero_id}</span>
                </td>
              </tr>
              <tr>
                <td className="border border-gray-400 px-1 py-0.5 text-xs text-center w-1/4">
                  <div className="font-bold">1er APELLIDO</div>
                  <div className="mt-0.5 text-xs">{form.primer_apellido}</div>
                </td>
                <td className="border border-gray-400 px-1 py-0.5 text-xs text-center w-1/4">
                  <div className="font-bold">2do APELLIDO</div>
                  <div className="mt-0.5 text-xs">{form.segundo_apellido}</div>
                </td>
                <td className="border border-gray-400 px-1 py-0.5 text-xs text-center w-1/4">
                  <div className="font-bold">1er NOMBRE</div>
                  <div className="mt-0.5 text-xs">{form.primero_nombre}</div>
                </td>
                <td className="border border-gray-400 px-1 py-0.5 text-xs text-center w-1/4">
                  <div className="font-bold">2do NOMBRE</div>
                  <div className="mt-0.5 text-xs">{form.segundo_nombre}</div>
                </td>
              </tr>
              <tr>
                <td
                  className="border border-gray-400 px-1 py-0.5 text-center text-xs font-bold align-middle"
                  rowSpan={2}
                >
                  FECHA NACIMIENTO
                </td>
                <td className="border border-gray-400 px-0 py-0.5 text-center text-xs">
                  <div className="flex items-stretch">
                    <div className="flex-1 py-0.5 border-r border-gray-300">
                      <span className="font-semibold text-[9px]">DIA</span>
                    </div>
                    <div className="flex-1 py-0.5 border-r border-gray-300">
                      <span className="font-semibold text-[9px]">MES</span>
                    </div>
                    <div className="flex-1 py-0.5">
                      <span className="font-semibold text-[9px]">AÑO</span>
                    </div>
                  </div>
                </td>
                <td className="border border-gray-400 px-1 py-0.5 text-center text-xs">
                  <div className="font-semibold text-[9px]">EDAD</div>
                </td>
                <td className="border border-gray-400 px-1 py-0.5 text-center text-xs">
                  <div className="font-semibold text-[9px]">GENERO</div>
                </td>
              </tr>
              <tr>
                <td className="border border-gray-400 px-0 py-0.5 text-center text-xs">
                  <div className="flex items-stretch">
                    <div className="flex-1 border-r border-gray-300 py-0.5">
                      {form.fecha_nacimiento
                        ? form.fecha_nacimiento.split("-")[2] || ""
                        : ""}
                    </div>
                    <div className="flex-1 border-r border-gray-300 py-0.5">
                      {form.fecha_nacimiento
                        ? form.fecha_nacimiento.split("-")[1] || ""
                        : ""}
                    </div>
                    <div className="flex-1 py-0.5">
                      {form.fecha_nacimiento
                        ? form.fecha_nacimiento.split("-")[0] || ""
                        : ""}
                    </div>
                  </div>
                </td>
                <td className="border border-gray-400 px-1 py-0.5 text-center text-xs">
                  {form.edad}
                </td>
                <td className="border border-gray-400 px-1 py-0.5 text-center text-xs">
                  <div className="text-xs">{form.genero_texto || "—"}</div>
                </td>
              </tr>
              <tr>
                <td
                  className="border border-gray-400 px-1 py-0.5 text-xs"
                  colSpan={2}
                >
                  <div className="font-semibold">MUNICIPIO DE NACIMIENTO</div>
                  <input
                    type="text"
                    value={form.municipio_nacimiento}
                    onChange={(e) =>
                      set("municipio_nacimiento")(e.target.value)
                    }
                    placeholder="Municipio"
                    className="w-full bg-transparent focus:outline-none border-b border-gray-400 text-xs"
                  />
                </td>
                <td
                  className="border border-gray-400 px-1 py-0.5 text-xs"
                  colSpan={2}
                >
                  <div className="font-semibold">
                    DEPARTAMENTO DE NACIMIENTO
                  </div>
                  <input
                    type="text"
                    value={form.departamento_nacimiento}
                    onChange={(e) =>
                      set("departamento_nacimiento")(e.target.value)
                    }
                    placeholder="Departamento"
                    className="w-full bg-transparent focus:outline-none border-b border-gray-400 text-xs"
                  />
                </td>
              </tr>
            </tbody>
          </table>

          {/* ============= UBICACIÓN DEL ALUMNO ============= */}
          <table className="w-full border-collapse border border-gray-400">
            <tbody>
              <tr>
                <td
                  className="bg-blue-800 text-white font-bold px-2 py-0.5 text-xs"
                  colSpan={100}
                >
                  Ubicación Del Alumno
                </td>
              </tr>
              <tr>
                <td className="border border-gray-400 px-1 py-0.5 text-xs">
                  <span className="font-bold">DIRECCIÓN:</span>
                  <Field
                    value={form.direccion_residencia}
                    onChange={set("direccion_residencia")}
                    placeholder="Dirección"
                    className="w-full"
                  />
                </td>
                <td className="border border-gray-400 px-1 py-0.5 text-xs">
                  <span className="font-bold">BARRIO:</span>
                  <Field
                    value={form.barrio}
                    onChange={set("barrio")}
                    placeholder="Barrio"
                    className="w-full"
                  />
                </td>
                <td className="border border-gray-400 px-1 py-0.5 text-xs">
                  <span className="font-bold">MUNICIPIO:</span>
                  <Field
                    value={form.municipio}
                    onChange={set("municipio")}
                    placeholder="Municipio"
                    className="w-full"
                  />
                </td>
                <td className="border border-gray-400 px-1 py-0.5 text-xs">
                  <span className="font-bold">TEL. FIJO:</span>
                  <Field
                    value={form.telefono_fijo}
                    onChange={set("telefono_fijo")}
                    placeholder="Fijo"
                    className="w-full"
                  />
                </td>
                <td className="border border-gray-400 px-1 py-0.5 text-xs">
                  <span className="font-bold">TEL. CELULAR:</span>
                  <Field
                    value={form.telefono_celular}
                    onChange={set("telefono_celular")}
                    placeholder="Celular"
                    className="w-full"
                  />
                </td>
                <td className="border border-gray-400 px-1 py-0.5 text-xs">
                  <span className="font-bold">ESTRATO:</span>
                  <Field
                    value={form.estrato}
                    onChange={set("estrato")}
                    placeholder="Estrato"
                    className="w-full"
                  />
                </td>
                <td className="border border-gray-400 px-1 py-0.5 text-xs">
                  <span className="font-bold">SISBEN:</span>
                  <Field
                    value={form.nivel_sisben}
                    onChange={set("nivel_sisben")}
                    placeholder="Nivel"
                    className="w-full"
                  />
                </td>
              </tr>
            </tbody>
          </table>

          {/* ============= HISTORIA ACADÉMICA ============= */}
          <table className="w-full border-collapse border border-gray-400">
            <tbody>
              <tr>
                <td
                  className="bg-blue-800 text-white font-bold px-2 py-0.5 text-xs"
                  colSpan={100}
                >
                  Historia Académica
                </td>
              </tr>
              <tr className="bg-blue-700 text-white text-[9px]">
                <th className="border border-gray-400 px-1 py-0.5 font-bold">
                  Grado
                </th>
                <th className="border border-gray-400 px-1 py-0.5 font-bold">
                  Año
                </th>
                <th className="border border-gray-400 px-1 py-0.5 font-bold">
                  Institución
                </th>
                <th className="border border-gray-400 px-1 py-0.5 font-bold">
                  Grado
                </th>
                <th className="border border-gray-400 px-1 py-0.5 font-bold">
                  Año
                </th>
                <th className="border border-gray-400 px-1 py-0.5 font-bold">
                  Institución
                </th>
              </tr>
              {[0, 1, 2, 3, 4, 5].map((i) => {
                const left = historia[i] || { anio: "", institucion: "" };
                const right = historia[i + 6] || { anio: "", institucion: "" };
                return (
                  <tr key={i}>
                    <td className="border border-gray-400 px-1 py-0.5 text-center font-bold text-xs bg-gray-50">
                      {i}
                    </td>
                    <TdField
                      value={left.anio}
                      onChange={(v) => setHistRow(i, "anio", v)}
                      placeholder="Año"
                    />
                    <TdField
                      value={left.institucion}
                      onChange={(v) => setHistRow(i, "institucion", v)}
                      placeholder="Institución"
                    />
                    <td className="border border-gray-400 px-1 py-0.5 text-center font-bold text-xs bg-gray-50">
                      {i + 6}
                    </td>
                    <TdField
                      value={right.anio}
                      onChange={(v) => setHistRow(i + 6, "anio", v)}
                      placeholder="Año"
                    />
                    <TdField
                      value={right.institucion}
                      onChange={(v) => setHistRow(i + 6, "institucion", v)}
                      placeholder="Institución"
                    />
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* ============= VÍCTIMAS DE CONFLICTO ============= */}
          <table className="w-full border-collapse border border-gray-400">
            <tbody>
              <tr>
                <td
                  className="bg-blue-800 text-white font-bold px-2 py-0.5 text-xs"
                  colSpan={100}
                >
                  Víctimas de Conflicto
                </td>
              </tr>
              <tr>
                <TdLabel>DESPLAZAMIENTO</TdLabel>
                <TdCheck
                  checked={form.en_desplazamiento}
                  onChange={set("en_desplazamiento")}
                />
                <TdLabel>DESVINCULADO</TdLabel>
                <TdCheck
                  checked={form.desvinculado}
                  onChange={set("desvinculado")}
                />
              </tr>
              <tr>
                <TdLabel>DPTO EXPULSOR</TdLabel>
                <TdField
                  value={form.depto_expulsor}
                  onChange={set("depto_expulsor")}
                  placeholder="Departamento"
                />
                <TdLabel>MUNICIPIO EXPULSOR</TdLabel>
                <TdField
                  value={form.municipio_expulsor}
                  onChange={set("municipio_expulsor")}
                  placeholder="Municipio"
                />
              </tr>
              <tr>
                <TdLabel>GRUPO ÉTNICO</TdLabel>
                <td className="border border-gray-400 px-1 py-0.5" colSpan={3}>
                  <div className="flex gap-3 text-xs">
                    {["RAIZALES", "AFROCOLOMBIANO", "INDIGENAS", "ROM"].map(
                      (g) => (
                        <label
                          key={g}
                          className="inline-flex items-center gap-1 cursor-pointer"
                        >
                          <input
                            type="radio"
                            name="grupo_etnico"
                            value={g}
                            checked={form.grupo_etnico === g}
                            onChange={() => set("grupo_etnico")(g)}
                            className="w-3 h-3"
                          />
                          {g}
                        </label>
                      ),
                    )}
                  </div>
                </td>
              </tr>
            </tbody>
          </table>

          {/* ============= LIMITACIONES / CAPACIDADES ============= */}
          <table className="w-full border-collapse border border-gray-400">
            <tbody>
              <tr>
                <td
                  className="bg-blue-800 text-white font-bold px-2 py-0.5 text-xs"
                  colSpan={100}
                >
                  Limitaciones o Capacidades Excepcionales (Anexar Soporte
                  Médico – Especialista)
                </td>
              </tr>
              <tr>
                <td
                  className="border border-gray-400 px-1 py-0.5 font-bold text-xs bg-gray-50"
                  rowSpan={3}
                >
                  LIMITACIONES
                </td>
                <TdCheck
                  checked={form.limitacion_sindrome_down}
                  onChange={set("limitacion_sindrome_down")}
                  label="Síndrome Down"
                />
                <TdCheck
                  checked={form.limitacion_baja_vision}
                  onChange={set("limitacion_baja_vision")}
                  label="Baja Visión"
                />
                <TdCheck
                  checked={form.limitacion_paralisis_cerebral}
                  onChange={set("limitacion_paralisis_cerebral")}
                  label="Parálisis Cerebral"
                />
              </tr>
              <tr>
                <TdCheck
                  checked={form.limitacion_retraso_mental}
                  onChange={set("limitacion_retraso_mental")}
                  label="Retraso Mental Leve"
                />
                <TdCheck
                  checked={form.limitacion_ceguera}
                  onChange={set("limitacion_ceguera")}
                  label="Ceguera"
                />
                <TdCheck
                  checked={form.limitacion_lesion_neuromuscular}
                  onChange={set("limitacion_lesion_neuromuscular")}
                  label="Lesión Neuromuscular"
                />
              </tr>
              <tr>
                <TdCheck
                  checked={form.limitacion_sordera}
                  onChange={set("limitacion_sordera")}
                  label="Sordera"
                />
                <TdCheck
                  checked={form.limitacion_autismo}
                  onChange={set("limitacion_autismo")}
                  label="Autismo"
                />
                <TdCheck
                  checked={form.limitacion_multi_impedido}
                  onChange={set("limitacion_multi_impedido")}
                  label="Multi-Impedido"
                />
              </tr>
              <tr>
                <td
                  className="border border-gray-400 px-1 py-0.5 font-bold text-xs bg-gray-50"
                  rowSpan={2}
                >
                  CAPACIDADES EXCEPCIONALES
                </td>
                <TdCheck
                  checked={form.capacidad_superdotado}
                  onChange={set("capacidad_superdotado")}
                  label="Superdotado"
                />
                <TdCheck
                  checked={form.capacidad_tecnologico}
                  onChange={set("capacidad_tecnologico")}
                  label="Tecnológico"
                />
                <TdCheck
                  checked={form.capacidad_cientifico}
                  onChange={set("capacidad_cientifico")}
                  label="Científico"
                />
              </tr>
              <tr>
                <TdCheck
                  checked={form.capacidad_artistico_deportivo}
                  onChange={set("capacidad_artistico_deportivo")}
                  label="Artístico/Deportivo"
                />
                <td className="border border-gray-400 px-1 py-0.5" colSpan={2}>
                  <span className="font-bold text-xs">
                    PUNTAJE COEFICIENTE INTELECTUAL:
                  </span>
                  <Field
                    value={form.puntaje_coeficiente}
                    onChange={set("puntaje_coeficiente")}
                    placeholder="Puntaje"
                    className="w-16 ml-1"
                  />
                </td>
              </tr>
            </tbody>
          </table>

          {/* ============= PADRES Y ACUDIENTES ============= */}
          <table className="w-full border-collapse border border-gray-400">
            <tbody>
              <tr>
                <td
                  className="bg-blue-800 text-white font-bold px-2 py-0.5 text-xs"
                  colSpan={100}
                >
                  Información de los Padres y Acudientes
                </td>
              </tr>
              <tr>
                <TdLabel>PADRE</TdLabel>
                <TdField
                  value={form.nombre_padre}
                  onChange={set("nombre_padre")}
                  placeholder="Nombre"
                />
                <td
                  className="border border-gray-400 px-1 py-0.5 text-xs"
                  colSpan={2}
                >
                  <span className="font-bold">N° CEDULA:</span>
                  <Field
                    value={form.cc_padre}
                    onChange={set("cc_padre")}
                    placeholder="Cédula"
                    className="w-20 ml-1"
                  />
                  <span className="font-bold ml-2">TEL. CELULAR:</span>
                  <Field
                    value={form.tel_padre}
                    onChange={set("tel_padre")}
                    placeholder="Teléfono"
                    className="w-20 ml-1"
                  />
                </td>
              </tr>
              <tr>
                <TdLabel>MADRE</TdLabel>
                <TdField
                  value={form.nombre_madre}
                  onChange={set("nombre_madre")}
                  placeholder="Nombre"
                />
                <td
                  className="border border-gray-400 px-1 py-0.5 text-xs"
                  colSpan={2}
                >
                  <span className="font-bold">N° CEDULA:</span>
                  <Field
                    value={form.cc_madre}
                    onChange={set("cc_madre")}
                    placeholder="Cédula"
                    className="w-20 ml-1"
                  />
                  <span className="font-bold ml-2">TEL. CELULAR:</span>
                  <Field
                    value={form.tel_madre}
                    onChange={set("tel_madre")}
                    placeholder="Teléfono"
                    className="w-20 ml-1"
                  />
                </td>
              </tr>
              <tr>
                <TdLabel>ACUDIENTE</TdLabel>
                <TdField
                  value={form.nombre_acudiente}
                  onChange={set("nombre_acudiente")}
                  placeholder="Nombre"
                />
                <td
                  className="border border-gray-400 px-1 py-0.5 text-xs"
                  colSpan={2}
                >
                  <span className="font-bold">N° CEDULA:</span>
                  <Field
                    value={form.cc_acudiente}
                    onChange={set("cc_acudiente")}
                    placeholder="Cédula"
                    className="w-20 ml-1"
                  />
                  <span className="font-bold ml-2">TEL. CELULAR:</span>
                  <Field
                    value={form.tel_acudiente}
                    onChange={set("tel_acudiente")}
                    placeholder="Teléfono"
                    className="w-20 ml-1"
                  />
                </td>
              </tr>
            </tbody>
          </table>

          {/* ============= SALUD ============= */}
          <table className="w-full border-collapse border border-gray-400">
            <tbody>
              <tr>
                <td
                  className="bg-blue-800 text-white font-bold px-2 py-0.5 text-xs"
                  colSpan={100}
                >
                  Información de Salud
                </td>
              </tr>
              <tr>
                <td
                  className="border border-gray-400 px-2 py-1 text-xs"
                  colSpan={4}
                >
                  <span className="font-bold">
                    Problemáticas de Salud presentadas por el estudiante (Anexar
                    soporte médico):
                  </span>
                  <textarea
                    value={form.problematicas_salud}
                    onChange={(e) => set("problematicas_salud")(e.target.value)}
                    placeholder="Describa las problemáticas de salud..."
                    className="w-full mt-1 border border-gray-300 rounded p-1 text-xs bg-transparent focus:outline-none focus:border-primary"
                    rows={2}
                  />
                </td>
              </tr>
              <tr>
                <TdLabel>EPS</TdLabel>
                <TdField
                  value={form.eps}
                  onChange={set("eps")}
                  placeholder="EPS"
                />
                <TdLabel>GRUPO SANGUÍNEO</TdLabel>
                <TdField
                  value={form.grupo_sanguineo}
                  onChange={set("grupo_sanguineo")}
                  placeholder="Grupo"
                />
              </tr>
              <tr>
                <TdLabel>IPS</TdLabel>
                <TdField
                  value={form.ips}
                  onChange={set("ips")}
                  placeholder="IPS"
                />
                <TdLabel>RH</TdLabel>
                <TdField
                  value={form.rh}
                  onChange={set("rh")}
                  placeholder="RH"
                />
              </tr>
            </tbody>
          </table>

          {/* ============= RETIRO ============= */}
          <table className="w-full border-collapse border border-gray-400">
            <tbody>
              <tr>
                <td
                  className="bg-blue-800 text-white font-bold px-2 py-0.5 text-xs"
                  colSpan={100}
                >
                  Retiro del estudiante
                </td>
              </tr>
              <tr>
                <td
                  className="border border-gray-400 px-2 py-1 text-xs"
                  colSpan={2}
                >
                  <span className="font-bold">
                    Motivo o Causa del retiro del estudiante:
                  </span>
                  <textarea
                    value={form.motivo_retiro}
                    onChange={(e) => set("motivo_retiro")(e.target.value)}
                    placeholder="Describa el motivo del retiro..."
                    className="w-full mt-1 border border-gray-300 rounded p-1 text-xs bg-transparent focus:outline-none focus:border-primary"
                    rows={2}
                  />
                </td>
              </tr>
              <tr>
                <TdLabel>FECHA DEL RETIRO</TdLabel>
                <TdField
                  value={form.fecha_retiro}
                  onChange={set("fecha_retiro")}
                  placeholder="AAAA-MM-DD"
                  type="date"
                />
              </tr>
            </tbody>
          </table>

          {/* ============= ACEPTACIÓN ============= */}
          <table className="w-full border-collapse border border-gray-400">
            <tbody>
              <tr>
                <td className="border border-gray-400 px-2 py-2 text-center font-bold text-xs text-blue-900">
                  ACEPTAMOS CUMPLIR CON EL PROYECTO EDUCATIVO INSTITUCIONAL
                  (PEI) Y EL MANUAL DE CONVIVENCIA Y DEMAS DISPOSICIONES
                </td>
              </tr>
            </tbody>
          </table>

          {/* ============= FIRMAS ============= */}
          <table className="w-full border-collapse">
            <tbody>
              <tr>
                <td className="w-1/2 px-2 py-3 text-center border-b border-gray-500">
                  <span className="text-[10px] text-gray-500">
                    Firma del Alumno
                  </span>
                </td>
                <td className="w-1/2 px-2 py-3 text-center border-b border-gray-500">
                  <span className="text-[10px] text-gray-500">
                    Firma del Padre o Acudiente
                  </span>
                </td>
              </tr>
              <tr>
                <td className="w-1/2 px-2 py-3 text-center border-b border-gray-500">
                  <span className="text-[10px] text-gray-500">
                    Firma del Rector(a)
                  </span>
                </td>
                <td className="w-1/2 px-2 py-3 text-center border-b border-gray-500">
                  <span className="text-[10px] text-gray-500">
                    Firma de la Secretaria
                  </span>
                </td>
              </tr>
            </tbody>
          </table>

          {/* ============= BOTÓN PDF ============= */}
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
