import jsPDF from "jspdf";
import { getIdentificationLabel } from "./formatUtils";

// ── Helpers ──

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

export const compressToJpeg = (src, quality = 0.75, maxWidth = 400) =>
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

export const loadImageAsBase64 = (url) =>
  fetch(url)
    .then((r) => {
      if (!r.ok) throw new Error("Failed to fetch image");
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
    .catch(() => "");

// ── Habeas Data PDF ──

const buildFullName = (data) => {
  const parts = [
    data.primero_nombre || data.first_name || "",
    data.segundo_nombre || data.second_name || "",
    data.primer_apellido || data.first_lastname || "",
    data.segundo_apellido || data.second_lastname || "",
  ];
  return parts.filter(Boolean).join(" ");
};

export function generateHabeasDataPDF(data, nameSchool = "") {
  const nombreEstudiante = buildFullName(data);
  const tipoDocEstudiante = getIdentificationLabel(
    Number(data?.fk_tipo_identificacion),
  );
  const numDocEstudiante =
    data?.numero_identificacion || data?.identification || "";
  const gradoGrupo = [data?.nombre_grado, data?.grupo]
    .filter(Boolean)
    .join(" - ");
  const nombreInstitucion =
    nameSchool || data?.nombre_institucion || data?.nombre_sede || "";

  const pdf = new jsPDF({ orientation: "p", unit: "mm", format: "letter" });
  const pageW = pdf.internal.pageSize.getWidth();
  const margin = 15;
  const contentW = pageW - margin * 2;
  let y = 20;

  pdf.setFontSize(14);
  pdf.setFont("helvetica", "bold");
  const titleLines = pdf.splitTextToSize(
    "AUTORIZACIÓN PARA LA TOMA Y TRATAMIENTO DE DATOS BIOMÉTRICOS Y REGISTROS FOTOGRÁFICOS",
    contentW,
  );
  pdf.text(titleLines, pageW / 2, y, { align: "center" });
  y += titleLines.length * 6;

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(11);
  pdf.text(`Fecha: ${new Date().toLocaleDateString()}`, margin, (y += 6));

  y += 6;
  const legalText =
    "En cumplimiento de lo dispuesto en el artículo 288 del Código Civil Colombiano, el artículo 24 del Decreto 2820 de 1974, la Ley 1098 de 2006 (Código de la Infancia y la Adolescencia) y la Ley 1581 de 2012 sobre Protección de Datos Personales, la Secretaría de Educación Municipal de Soledad solicita la presente autorización para la toma y tratamiento de datos biométricos y registros fotográficos de los estudiantes beneficiarios de la matrícula contratada.";
  const legalLines = pdf.splitTextToSize(legalText, contentW);
  pdf.text(legalLines, margin, y, { align: "justify", maxWidth: contentW });
  y += legalLines.length * 5;

  pdf.setFont("helvetica", "bold");
  pdf.text("DATOS DEL ESTUDIANTE", margin, y);
  y += 2;
  pdf.setFont("helvetica", "normal");
  pdf.text(`Nombre completo: ${nombreEstudiante}`, margin, (y += 5));
  pdf.text(
    `Tipo y número de documento: ${tipoDocEstudiante} ${numDocEstudiante}`,
    margin,
    (y += 5),
  );
  pdf.text(`Institución educativa: ${nombreInstitucion}`, margin, (y += 5));
  pdf.text(`Grado: ${gradoGrupo || "_______________"}`, margin, (y += 5));

  y += 6;
  pdf.setFont("helvetica", "bold");
  pdf.text(
    "DATOS DEL PADRE, MADRE, ACUDIENTE O REPRESENTANTE LEGAL",
    margin,
    y,
  );
  pdf.setFont("helvetica", "normal");
  pdf.text("Nombre completo: ", margin, (y += 8));
  const nameW = pdf.getTextWidth("Nombre completo: ");
  const barEnd0 = margin + contentW * 0.9;
  pdf.line(margin + nameW, y + 0.5, barEnd0, y + 0.5);
  pdf.text("Tipo y número de documento:", margin, (y += 8));
  const ParentW = pdf.getTextWidth("Tipo y número de documento: ");
  const barEnd1 = margin + contentW * 0.9;
  pdf.line(margin + ParentW, y + 0.5, barEnd1, y + 0.5);
  pdf.text("Parentesco o calidad en que actúa:", margin, (y += 8));
  const ParentW2 = pdf.getTextWidth("Parentesco o calidad en que actúa: ");
  const barEnd2 = margin + contentW * 0.9;
  pdf.line(margin + ParentW2, y + 0.5, barEnd2, y + 0.5);
  pdf.text("Teléfono de contacto:", margin, (y += 8));
  const contactW = pdf.getTextWidth("Teléfono de contacto: ");
  const barEnd3 = margin + contentW * 0.9;
  pdf.line(margin + contactW, y + 0.5, barEnd3, y + 0.5);
  y += 6;

  pdf.setFont("helvetica", "bold");
  pdf.text("AUTORIZACIÓN", margin, y);
  y += 6;
  pdf.setFont("helvetica", "normal");
  pdf.text("Yo", margin, y);
  const yoW = pdf.getTextWidth("Yo ");
  const barEnd = margin + contentW * 0.9;
  pdf.line(margin + yoW, y + 0.5, barEnd, y + 0.5);
  y += 6;
  const authText = `identificado(a) como aparece al pie de mi correspondiente firma, actuando en calidad de padre, madre, acudiente o representante legal del estudiante anteriormente identificado, autorizo de manera libre, previa expresa e informada a la Secretaría de Educación Municipal de Soledad para realizar la toma de datos biométricos (huellas dactilares) y registros fotográficos del estudiante.\n\nDeclaro que he sido informado(a) de que dichos datos serán recolectados y tratados exclusivamente para las actividades de inspección, vigilancia, seguimiento y control de los recursos del Sistema General de Participaciones (SGP) asignados a la matrícula contratada, de la cual mi hijo es beneficiario, así como para la verificación de la información relacionada con la prestación del servicio educativo.\n\nIgualmente, manifiesto conocer que la información será tratada conforme a la Ley 1581 de 2012 y demás normas aplicables sobre protección de datos personales, garantizando la confidencialidad, seguridad y uso exclusivo para las finalidades aquí descritas.\n\nLa presente autorización se otorga de manera voluntaria y permanecerá vigente durante el tiempo requerido para el cumplimiento de las finalidades señaladas y las obligaciones legales correspondientes.`;
  const authLines = pdf.splitTextToSize(authText, contentW);
  pdf.text(authLines, margin, y, { align: "justify", maxWidth: contentW });
  y += authLines.length * 5 + 2;

  pdf.setFont("helvetica", "bold");
  pdf.text("Firma del padre, madre o acudiente:", margin, y);
  const f = pdf.getTextWidth("Firma del padre, madre o acudiente: ");
  const barf = margin + contentW * 1;
  pdf.line(margin + f, y + 0.5, barf, y + 0.5);
  y += 1;
  pdf.setFont("helvetica", "bold");
  pdf.text("Nombre completo: ", margin, (y += 8));
  const nameW1 = pdf.getTextWidth("Nombre completo: ");
  const barEnd01 = margin + contentW * 1;
  pdf.line(margin + nameW1, y + 0.5, barEnd01, y + 0.5);
  pdf.text("Documento de identidad: ", margin, (y += 8));
  const idW1 = pdf.getTextWidth("Documento de identidad: ");
  const barEnd02 = margin + contentW * 1;
  pdf.line(margin + idW1, y + 0.5, barEnd02, y + 0.5);

  return pdf;
}

// ── Matrícula PDF ──

const EMPTY_FORM = {
  jornada_manana: false,
  jornada_tarde: false,
  grado_cursar: "",
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
  direccion_residencia: "",
  barrio: "",
  municipio: "",
  telefono_fijo: "",
  telefono_celular: "",
  estrato: "",
  nivel_sisben: "",
  en_desplazamiento: false,
  desvinculado: false,
  depto_expulsor: "",
  municipio_expulsor: "",
  grupo_etnico: "",
  limitacion_sindrome_down: false,
  limitacion_baja_vision: false,
  limitacion_paralisis_cerebral: false,
  limitacion_retraso_mental: false,
  limitacion_ceguera: false,
  limitacion_lesion_neuromuscular: false,
  limitacion_sordera: false,
  limitacion_autismo: false,
  limitacion_multi_impedido: false,
  capacidad_superdotado: false,
  capacidad_tecnologico: false,
  capacidad_cientifico: false,
  capacidad_artistico_deportivo: false,
  puntaje_coeficiente: "",
  nombre_padre: "",
  cc_padre: "",
  tel_padre: "",
  nombre_madre: "",
  cc_madre: "",
  tel_madre: "",
  nombre_acudiente: "",
  cc_acudiente: "",
  tel_acudiente: "",
  problematicas_salud: "",
  eps: "",
  grupo_sanguineo: "",
  ips: "",
  rh: "",
  motivo_retiro: "",
  fecha_retiro: "",
};

const GRADOS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];

function prefillFromData(data) {
  const form = { ...EMPTY_FORM };
  if (!data) return form;

  const fechaNac = data.fecha_nacimiento
    ? data.fecha_nacimiento.split("T")[0]
    : data.birthday
      ? data.birthday.split("T")[0]
      : "";

  const rawTipo =
    data.t_identificacion_estudiante ||
    data.fk_tipo_identificacion ||
    data.identificationType ||
    "";
  const nombreTipo = String(data.nombre_identi_estudiante || "").toUpperCase();
  if (
    String(rawTipo).toUpperCase().includes("CC") ||
    rawTipo === "2" ||
    nombreTipo.includes("CC")
  ) {
    form.tipo_id = "CC";
  } else if (
    String(rawTipo).toUpperCase().includes("RC") ||
    nombreTipo.includes("RC")
  ) {
    form.tipo_id = "RC";
  } else if (
    rawTipo === "4" ||
    rawTipo === "5" ||
    String(rawTipo).toUpperCase().includes("TI") ||
    nombreTipo.includes("TI")
  ) {
    form.tipo_id = "TI";
  }

  form.primer_apellido =
    data.papellido_estudiante ||
    data.primer_apellido ||
    data.first_lastname ||
    "";
  form.segundo_apellido =
    data.sapellido_estudiante ||
    data.segundo_apellido ||
    data.second_lastname ||
    "";
  form.primero_nombre =
    data.pnombre_estudiante ||
    data.primero_nombre ||
    data.first_name ||
    "";
  form.segundo_nombre =
    data.snombre_estudiante ||
    data.segundo_nombre ||
    data.second_name ||
    "";
  form.tipo_id = data.nombre_identi_estudiante || form.tipo_id;
  form.numero_id =
    data.identificacion_estudiante || data.identification || "";
  form.fecha_nacimiento = fechaNac;
  form.edad = calcularEdad(fechaNac);
  form.genero_texto = data.genero || data.genre || "";
  form.direccion_residencia = data.direccion || data.address || "";
  form.municipio = data.nombre_municipio || "";
  form.telefono_celular = data.telefono || data.telephone || "";
  form.nombre_padre = data.nombre_padre || "";
  form.cc_padre = data.cc_padre || "";
  form.tel_padre = data.tel_padre || "";
  form.nombre_madre = data.nombre_madre || "";
  form.cc_madre = data.cc_madre || "";
  form.tel_madre = data.tel_madre || "";
  form.nombre_acudiente =
    data.nombre_acudiente ||
    [
      data.primer_apellido_acudiente,
      data.segundo_apellido_acudiente,
      data.primero_nombre_acudiente,
      data.segundo_nombre_acudiente,
    ]
      .filter(Boolean)
      .join(" ") ||
    "";
  form.cc_acudiente =
    data.numero_identificacion_acudiente || data.cc_acudiente || "";
  form.tel_acudiente = data.telefono_acudiente || "";
  form.eps = data.eps || "";
  form.rh = data.rh || "";

  return form;
}

export function generateMatriculaPDF(data, guardianData, fotoBase64, imgSchool) {
  const merged = guardianData ? { ...data, ...guardianData } : data;
  const form = prefillFromData(merged);
  const historia = GRADOS.map(() => ({ anio: "", institucion: "" }));

  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "legal",
  });
  const pw = doc.internal.pageSize.getWidth();
  const ph = doc.internal.pageSize.getHeight();
  const ml = 8, mr = 8;
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

  const bold = () => { doc.setFont("helvetica", "bold"); };
  const normal = () => { doc.setFont("helvetica", "normal"); };
  const setFs = (s) => { doc.setFontSize(s); };
  const text = (t, x, yPos, opts) => { doc.text(t, x, yPos, opts); };

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
  const fotoW = 22, fotoH = 28;
  const imgschoolW = 22, imgschoolH = 22;
  const headerInitialY = y;
  let hdrX = ml;

  if (hasFoto) {
    doc.addImage(fotoBase64, "JPEG", hdrX, headerInitialY, fotoW, fotoH);
  }
  hdrX += fotoW + 3;

  if (imgSchool) {
    doc.addImage(imgSchool, "JPEG", pw - mr - imgschoolW, headerInitialY, imgschoolW, imgschoolH);
  }
  const rightBound = imgSchool ? pw - mr - imgschoolW - 2 : pw - mr;
  const centerW = rightBound - hdrX;

  bold();
  setFs(10);
  doc.setTextColor(30, 60, 130);
  text("HOJA DE MATRICULA AÑO LECTIVO 2026", hdrX + centerW / 2, y + 4, { align: "center" });
  y += lh;

  const instName = data?.nombre_sede || data?.nombre_institucion || data?.name_school || "INSTITUCIÓN EDUCATIVA";
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
  text(String(data?.nombre_jornada_estudiante || ""), doc.getTextWidth("JORNADA: ") + hdrX, y);
  y += lh;

  bold();
  setFs(7);
  text("GRADO A CURSAR AÑO:", hdrX, y);
  normal();
  setFs(7);
  const gradoText = [data?.nombre_grado, data?.grupo].filter(Boolean).join(" - ");
  text(gradoText || "_______________", doc.getTextWidth("GRADO A CURSAR AÑO: ") + hdrX, y);
  y += lh + 2;

  // ── Información Del Alumno ──
  sectionTitle("Información Del Alumno");

  drawRow([
    { w: uw * 0.5, label: "TIPO DE IDENTIFICACIÓN:", val: form.tipo_id },
    { w: uw * 0.5, label: "NÚMERO DE IDENTIFICACIÓN:", val: form.numero_id },
  ]);

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

  checkPage(rowH * 2);
  const f1 = uw * 0.14, f2a = uw * 0.12, f2b = uw * 0.12, f2c = uw * 0.12;
  const f3 = uw * 0.25, f4 = uw * 0.25;
  let xF = ml;

  doc.setDrawColor(180, 180, 180);
  doc.setLineWidth(0.3);
  doc.rect(xF, y, f1, rowH * 2);
  bold();
  setFs(6.5);
  doc.setTextColor(40, 40, 40);
  text("FECHA NACIMIENTO", xF + f1 / 2, y + rowH, { align: "center" });
  xF += f1;

  doc.rect(xF, y, f2a, rowH);
  bold();
  setFs(6);
  text("DIA", xF + f2a / 2, y + rowH / 2 + 1.5, { align: "center" });
  xF += f2a;

  doc.rect(xF, y, f2b, rowH);
  text("MES", xF + f2b / 2, y + rowH / 2 + 1.5, { align: "center" });
  xF += f2b;

  doc.rect(xF, y, f2c, rowH);
  text("AÑO", xF + f2c / 2, y + rowH / 2 + 1.5, { align: "center" });
  xF += f2c;

  doc.rect(xF, y, f3, rowH);
  text("EDAD", xF + f3 / 2, y + rowH / 2 + 1.5, { align: "center" });
  xF += f3;

  doc.rect(xF, y, f4, rowH);
  text("GENERO", xF + f4 / 2, y + rowH / 2 + 1.5, { align: "center" });
  y += rowH;

  xF = ml + f1;
  const diaVal = form.fecha_nacimiento ? form.fecha_nacimiento.split("-")[2] || "" : "";
  const mesVal = form.fecha_nacimiento ? form.fecha_nacimiento.split("-")[1] || "" : "";
  const anioVal = form.fecha_nacimiento ? form.fecha_nacimiento.split("-")[0] || "" : "";

  doc.rect(xF, y, f2a, rowH);
  normal();
  setFs(6.5);
  doc.setTextColor(40, 40, 40);
  text(diaVal || "", xF + f2a / 2, y + rowH / 2 + 1.5, { align: "center" });
  xF += f2a;

  doc.rect(xF, y, f2b, rowH);
  text(mesVal || "", xF + f2b / 2, y + rowH / 2 + 1.5, { align: "center" });
  xF += f2b;

  doc.rect(xF, y, f2c, rowH);
  text(anioVal || "", xF + f2c / 2, y + rowH / 2 + 1.5, { align: "center" });
  xF += f2c;

  doc.rect(xF, y, f3, rowH);
  text(form.edad || "", xF + f3 / 2, y + rowH / 2 + 1.5, { align: "center" });
  xF += f3;

  doc.rect(xF, y, f4, rowH);
  text(form.genero_texto || "—", xF + f4 / 2, y + rowH / 2 + 1.5, { align: "center" });
  y += rowH;

  drawRow([
    { w: uw * 0.5, label: "MUNICIPIO DE NACIMIENTO", val: form.municipio_nacimiento },
    { w: uw * 0.5, label: "DEPARTAMENTO DE NACIMIENTO", val: form.departamento_nacimiento },
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
  const histHeaders = ["Grado", "Año", "Institución", "Grado", "Año", "Institución"];
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
    [i, left.anio, left.institucion, i + 6, right.anio, right.institucion].forEach((val) => {
      doc.setDrawColor(180, 180, 180);
      doc.setLineWidth(0.3);
      doc.rect(xH, y, colW, rowH);
      normal();
      setFs(6.5);
      doc.setTextColor(40, 40, 40);
      if (val !== undefined && val !== "")
        text(String(val), xH + colW / 2, y + rowH / 2 + 1.5, { align: "center" });
      xH += colW;
    });
    y += rowH;
  }

  // ── Víctimas de Conflicto ──
  sectionTitle("Víctimas de Conflicto");
  checkPage(rowH);
  let xV = ml;
  cell(xV, y, uw * 0.5, rowH, "DESPLAZAMIENTO", "", true);
  checkboxPdf(xV + doc.getTextWidth("DESPLAZAMIENTO: ") + 1, y + rowH / 2 + 1.5, form.en_desplazamiento);
  xV += uw * 0.5;
  cell(xV, y, uw * 0.5, rowH, "DESVINCULADO", "", true);
  checkboxPdf(xV + doc.getTextWidth("DESVINCULADO: ") + 1, y + rowH / 2 + 1.5, form.desvinculado);
  y += rowH;

  drawRow([
    { w: uw * 0.5, label: "DPTO EXPULSOR", val: form.depto_expulsor },
    { w: uw * 0.5, label: "MUNICIPIO EXPULSOR", val: form.municipio_expulsor },
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
  text("GRUPO ÉTNICO", xE + (uw * 0.2) / 2, y + rowH / 2 + 1.5, { align: "center" });
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
  sectionTitle("Limitaciones o Capacidades Excepcionales (Anexar Soporte Médico – Especialista)");

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

  checkPage(rowH * 3);
  doc.setDrawColor(180, 180, 180);
  doc.setLineWidth(0.3);
  doc.rect(ml, y, col25, rowH * 3);
  bold();
  setFs(6.5);
  doc.setTextColor(40, 40, 40);
  text("LIMITACIONES", ml + col25 / 2, y + rowH * 1.5, { align: "center" });

  drawLimCheckCell(ml + col25, y, col25, "limitacion_sindrome_down", "Síndrome Down");
  drawLimCheckCell(ml + col25 * 2, y, col25, "limitacion_baja_vision", "Baja Visión");
  drawLimCheckCell(ml + col25 * 3, y, col25, "limitacion_paralisis_cerebral", "Parálisis Cerebral");
  y += rowH;

  drawLimCheckCell(ml + col25, y, col25, "limitacion_retraso_mental", "Retraso Mental Leve");
  drawLimCheckCell(ml + col25 * 2, y, col25, "limitacion_ceguera", "Ceguera");
  drawLimCheckCell(ml + col25 * 3, y, col25, "limitacion_lesion_neuromuscular", "Lesión Neuromuscular");
  y += rowH;

  drawLimCheckCell(ml + col25, y, col25, "limitacion_sordera", "Sordera");
  drawLimCheckCell(ml + col25 * 2, y, col25, "limitacion_autismo", "Autismo");
  drawLimCheckCell(ml + col25 * 3, y, col25, "limitacion_multi_impedido", "Multi-Impedido");
  y += rowH;

  checkPage(rowH * 2);
  doc.setDrawColor(180, 180, 180);
  doc.setLineWidth(0.3);
  doc.rect(ml, y, col25, rowH * 2);
  bold();
  setFs(6);
  doc.setTextColor(40, 40, 40);
  text("CAPACIDADES", ml + col25 / 2, y + rowH * 0.6, { align: "center" });
  text("EXCEPCIONALES", ml + col25 / 2, y + rowH * 1.4, { align: "center" });

  drawLimCheckCell(ml + col25, y, col25, "capacidad_superdotado", "Superdotado");
  drawLimCheckCell(ml + col25 * 2, y, col25, "capacidad_tecnologico", "Tecnológico");
  drawLimCheckCell(ml + col25 * 3, y, col25, "capacidad_cientifico", "Científico");
  y += rowH;

  drawLimCheckCell(ml + col25, y, col25, "capacidad_artistico_deportivo", "Artístico/Deportivo");
  drawLimCheckCell(ml + col25 * 2, y, col25, null, "");
  doc.setDrawColor(180, 180, 180);
  doc.setLineWidth(0.3);
  doc.rect(ml + col25 * 2, y, col25 * 2, rowH);
  bold();
  setFs(6);
  doc.setTextColor(40, 40, 40);
  text("PUNTAJE COEFICIENTE INTELECTUAL:", ml + col25 * 2 + 2, y + rowH / 2 + 1.5);
  normal();
  setFs(6);
  doc.setTextColor(60, 60, 60);
  text(form.puntaje_coeficiente || "", ml + col25 * 2 + doc.getTextWidth("PUNTAJE COEFICIENTE INTELECTUAL: ") + 3, y + rowH / 2 + 1.5);
  y += rowH;

  // ── Padres y Acudientes ──
  sectionTitle("Información de los Padres y Acudientes");

  const drawParentRow = (label, nameVal, ccVal, telVal) => {
    checkPage(rowH);
    const c1 = uw * 0.18, c2 = uw * 0.28, c3 = uw * 0.26, c4 = uw * 0.28;
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
    text(nameVal || "", xP + 1, y + rowH / 2 + 1.5);
    xP += c2;
    doc.rect(xP, y, c3, rowH);
    doc.setTextColor(40, 40, 40);
    bold();
    setFs(6);
    text("N° CEDULA:", xP + 1, y + rowH / 2 + 1.5);
    normal();
    setFs(6);
    text(String(ccVal || ""), xP + doc.getTextWidth("N° CEDULA: ") + 1, y + rowH / 2 + 1.5);
    xP += c3;
    doc.rect(xP, y, c4, rowH);
    bold();
    setFs(6);
    text("TEL. CELULAR:", xP + 1, y + rowH / 2 + 1.5);
    normal();
    setFs(6);
    text(String(telVal || ""), xP + doc.getTextWidth("TEL. CELULAR: ") + 1, y + rowH / 2 + 1.5);
    y += rowH;
  };

  drawParentRow("PADRE", form.nombre_padre, form.cc_padre, form.tel_padre);
  drawParentRow("MADRE", form.nombre_madre, form.cc_madre, form.tel_madre);
  drawParentRow("ACUDIENTE", form.nombre_acudiente, form.cc_acudiente, form.tel_acudiente);

  // ── Salud ──
  sectionTitle("Información de Salud");
  checkPage(rowH * 2);
  doc.setDrawColor(180, 180, 180);
  doc.setLineWidth(0.3);
  doc.rect(ml, y, uw, rowH * 2);
  bold();
  setFs(6.5);
  doc.setTextColor(40, 40, 40);
  text("Problemáticas de Salud presentadas por el estudiante (Anexar soporte médico):", ml + 1, y + rowH / 2 + 1.5);
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
  text("ACEPTAMOS CUMPLIR CON EL PROYECTO EDUCATIVO INSTITUCIONAL (PEI) Y EL MANUAL DE CONVIVENCIA Y DEMAS DISPOSICIONES", ml + uw / 2, y + lh / 2 + 2, { align: "center" });
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
  text("Firma del Padre o Acudiente", ml + sigW + 10 + sigW / 2, y + 4, { align: "center" });
  y += lh + 4;
  doc.line(ml, y, ml + sigW, y);
  doc.line(ml + sigW + 10, y, ml + sigW * 2 + 10, y);
  text("Firma del Rector(a)", ml + sigW / 2, y + 4, { align: "center" });
  text("Firma de la Secretaria", ml + sigW + 10 + sigW / 2, y + 4, { align: "center" });

  return doc;
}
