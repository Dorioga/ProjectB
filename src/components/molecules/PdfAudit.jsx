import { jsPDF } from "jspdf";
// import Chart from "chart.js/auto";
// import ChartDataLabels from "chartjs-plugin-datalabels";
import logo from "../../assets/2399.jpg";
import estadisticas from "../../assets/Infographics_004.jpg";
import logo2 from "../../assets/2399.jpg";

// Chart.register(ChartDataLabels);

const exportPDF = async (data) => {
  //encabezado en cada página
  const drawHeader = async (pdf) => {
    pdf.rect(10, 10, 181, 20, "D");

    const img = new Image();
    img.src = logo;
    await new Promise((resolve) => {
      img.onload = () => {
        pdf.addImage(img, "PNG", 12, 14, 36, 12);
        resolve();
      };
    });

    pdf.setFontSize(9);
    pdf.setFont("helvetica", "bold");
    pdf.text(
      "INFORME DE VERIFICACIÓN DE LA \nINSTITUCIÓN EDUCATIVA",
      100,
      20,
      { align: "center" }
    );

    const img2 = new Image();
    img2.src = logo2;
    await new Promise((resolve) => {
      img2.onload = () => {
        pdf.addImage(img2, "PNG", 154, 14, 36, 12);
        resolve();
      };
    });
  };

  //salto de página
  const checkPageBreak = async (pdf, y, space = 20) => {
    if (y + space > 270) {
      pdf.addPage();
      await drawHeader(pdf);
      // 🔹 Forzar volver a normal
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(11);
      return 40;
    }
    return y;
  };
  const pdf = new jsPDF("p", "mm", "a4");
  let y = 40;

  await drawHeader(pdf);

  const lineHeight = 8;

  // ================== TABLA DE DATOS ==================
  pdf.setFontSize(11);
  const startX = 10;
  const colLabelWidth = 70;
  const colValueWidth = 110;

  const drawRow = (label, value, posY) => {
    const padding = 2; // margen interno
    const valueText = value || "-";

    // Dividir texto largo dentro de la celda
    const splitValue = pdf.splitTextToSize(valueText, colValueWidth - 4);
    const valueHeight = splitValue.length * 5; // 5 px aprox. por línea

    const splitLabel = pdf.splitTextToSize(label, colLabelWidth - 4);
    const labelHeight = splitLabel.length * 5;

    // Altura de la fila = la mayor entre label y value
    const rowHeight = Math.max(valueHeight, labelHeight, lineHeight);

    // Dibujar celdas
    pdf.rect(startX, posY, colLabelWidth, rowHeight);
    pdf.text(splitLabel, startX + padding, posY + 5);

    pdf.rect(startX + colLabelWidth, posY, colValueWidth, rowHeight);
    pdf.text(splitValue, startX + colLabelWidth + padding, posY + 5);

    // Retornar nueva posición Y
    return posY + rowHeight;
  };

  y = drawRow("INSTITUCIÓN EDUCATIVA:", "NOMBRE DE LA INSTITUCIÓN", y);

  // drawRow("SEDES:", formData.sede, y);
  // y += lineHeight;
  y = drawRow("CÓDIGO DANE:", "CÓDIGO DANE DE LA INSTITUCIÓN", y);

  y = drawRow("RECTOR(A):", "NOMBRE DEL RECTOR(A)", y);

  y = drawRow("DESIGNADO(A):", "NOMBRE DEL DESIGNADO(A)", y);

  y = drawRow("FECHA ACTA APERTURA AUDITORÍA:", "FECHA DE APERTURA", y);

  y = drawRow("FECHA ACTA DE CIERRE AUDITORÍA:", "FECHA DE CIERRE", y);

  y = drawRow("DIRECTOR OPERATIVO:", "NOMBRE DIRECTOR DE OPERATIVO", y);
  y += lineHeight;

  const tableX = 10;
  const col1Width = 140;
  const col4Width = 156;
  const col2Width = 24;
  const col3Width = 17; // nueva columna
  const rowHeight = 8;

  const centerText = (text, x, y, cellWidth) => {
    const textWidth = pdf.getTextWidth(text);
    const textX = x + (cellWidth - textWidth) / 2; // centro horizontal
    pdf.text(text, textX, y);
  };

  // ================== OBJETIVO ==================
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(12);
  pdf.text("OBJETIVO", 10, y);
  y += 8;

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(11);
  const objetivoTexto = `Presentar de manera clara y organizada el estado actual del proceso de auditoría interna de la institución, incluyendo la fecha de inicio, las observaciones registradas, los responsables involucrados y los avances documentados. El informe también mostrará datos actualizados en tiempo real sobre los estudiantes ausentes, registrados, validados y demás estados gestionados en la plataforma, con el fin de ofrecer una visión completa y precisa del desarrollo de la auditoría`;
  const splitText = pdf.splitTextToSize(objetivoTexto, 180);
  pdf.text(splitText, 10, y, { align: "justify", maxWidth: 180 });
  y += lineHeight + 18;

  y = await checkPageBreak(pdf, y);

  // ================== INFORMACIÓN GENERAL SUMINISTRADA POR SECRETARÍA ==================
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(12);
  pdf.text("COMPONENTE 1: VERIFICACIÓN FÍSICA", 10, y);
  y += 7;

  // TABLA 1
  const drawTableRow = (label, value, extra) => {
    // Columna 1
    pdf.rect(tableX, y, col1Width, rowHeight);
    pdf.text(label, tableX + 2, y + 6, { align: "justify", maxWidth: 180 });

    // Columna 2
    pdf.rect(tableX + col1Width, y, col2Width, rowHeight);
    pdf.text(String(value || 0), tableX + col1Width + 2, y + 6);

    // Columna 3
    pdf.rect(tableX + col1Width + col2Width, y, col3Width, rowHeight);
    pdf.text(String(extra || 0), tableX + col1Width + col2Width + 2, y + 6);

    y += rowHeight;
  };

  function drawTableRow1(text, cantidad) {
    // Columna 1 (texto)
    pdf.rect(tableX, y, col4Width, rowHeight);
    pdf.text(text, tableX + 2, y + rowHeight - 3);

    // Columna 2 (cantidad)
    pdf.rect(tableX + col4Width, y, col2Width, rowHeight);
    centerText(
      String(cantidad),
      tableX + col4Width,
      y + rowHeight - 3,
      col2Width
    );

    // Avanzar a la siguiente fila
    y += rowHeight;
  }

  y = await checkPageBreak(pdf, y);

  // ================== RESULTADOS GENERALES 2 ==================
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(11);
  const segunda = `A continuación, se presenta la clasificación detallada del estado de los estudiantes beneficiarios de la matrícula contratada, según los resultados obtenidos en las dos jornadas de verificación biométrica. `;
  const splitTextsegunda = pdf.splitTextToSize(segunda, 180);
  pdf.text(splitTextsegunda, 10, y, { align: "justify", maxWidth: 180 });
  y += lineHeight + 6;

  y = await checkPageBreak(pdf, y);

  pdf.setFont("helvetica", "bold");
  pdf.rect(tableX, y, col1Width, rowHeight);
  centerText("Clasificación estado del estudiante", tableX, y + 6, col1Width);
  pdf.rect(tableX + col1Width, y, col2Width, rowHeight);
  centerText("Cantidad", tableX + col1Width + 2, y + 6, col2Width);
  pdf.rect(tableX + col1Width + col2Width, y, col3Width, rowHeight);
  centerText("%", tableX + col1Width + col2Width, y + 6, col3Width);
  y += rowHeight;

  pdf.setFont("helvetica", "normal");
  drawTableRow("Número de estudiantes contratados", "Valor", "100%");
  drawTableRow("Estudiantes retirados", "Valor", `%`);
  drawTableRow("Estudiantes verificados por biometría", "Valor", `%`);
  drawTableRow(
    "Estudiantes ausentes 2da auditoría con algún tipo de excusa por inasistencia",
    "Valor",
    `%`
  );
  drawTableRow(
    "Estudiantes ausentes 2da auditoría sin excusa por inasistencia",
    "Valor",
    `%`
  );

  y += 10;
  y = await checkPageBreak(pdf, y);

  // ================== ANALISIS DE PERMANENCIA ==================
  pdf.setFont("helvetica", "bold");
  pdf.text("Descripción técnica", 10, y);
  y += 8;

  const bloques2 = [
    {
      titulo: "Gestión integral del proceso de auditoría:",
      descripcion:
        "La plataforma permite registrar y administrar información clave del proceso de auditoría, incluyendo fecha de inicio, responsables internos y externos, observaciones y estado general del procedimiento.",
    },
    {
      titulo: "Captura estructurada de información del auditor:",
      descripcion:
        "El sistema almacena los datos suministrados por los auditores en formularios dinámicos, garantizando uniformidad en la documentación y facilitando la trazabilidad de cada auditoría.",
    },
    {
      titulo: "Consulta en tiempo real de indicadores operativos:",
      descripcion:
        "La plataforma integra consultas directas a la base de datos para obtener valores actualizados sobre estudiantes ausentes, registrados, validados y otros estados, asegurando precisión en los reportes.",
    },
    {
      titulo: "Generación automática de informes:",
      descripcion:
        "El sistema compila la información registrada y los datos consultados en tiempo real para generar informes completos, estructurados y listos para su uso administrativo.",
    },
    {
      titulo: "Arquitectura escalable y orientada a servicios:",
      descripcion:
        "El diseño modular permite ampliar funcionalidades, mejorar el rendimiento e integrar servicios externos según las necesidades de la institución.",
    },
  ];

  pdf.setFontSize(11);
  for (let bloque of bloques2) {
    // Título en bold
    pdf.setFont("helvetica", "bold");
    const tituloLines = pdf.splitTextToSize(bloque.titulo, 180);
    pdf.text(tituloLines, 10, y, { maxWidth: 180 });
    y += tituloLines.length * 4;

    // Descripción en normal
    pdf.setFont("helvetica", "normal");
    const descLines = pdf.splitTextToSize(bloque.descripcion, 180);
    pdf.text(descLines, 10, y, { align: "justify", maxWidth: 180 });
    y += descLines.length * 4 + 4;

    // Revisar salto de página
    y = await checkPageBreak(pdf, y);
  }

  y = await checkPageBreak(pdf, y);

  // ================== TABLA 3 ==================
  pdf.setFont("helvetica", "bold");
  pdf.rect(tableX, y, col4Width, rowHeight);
  centerText(
    "Estudiantes ausentes en ambas auditorías",
    tableX,
    y + 6,
    col4Width
  );

  pdf.rect(tableX + col4Width, y, col2Width, rowHeight);
  centerText("Cantidad", tableX + col4Width, y + 6, col2Width);
  y += rowHeight;

  pdf.setFont("helvetica", "normal");
  drawTableRow1("Estudiantes ausentes en ambas auditorías", "valor");

  y += 10;
  y = await checkPageBreak(pdf, y);

  pdf.setFont("helvetica", "bold");
  pdf.text("Descripción técnica", 10, y);
  y += 8;

  pdf.setFontSize(11);

  const bloques = [
    {
      titulo: "Estudiantes ausentes en ambas auditorías:",
      descripcion:
        "Estudiante ausente que no se presentó en ninguna de las dos jornadas de verificación realizadas, por lo cual no cuenta con registro, ni evidencia fotográfica en la plataforma NEXUS.",
    },
  ];
  pdf.setFontSize(11);
  for (let bloque of bloques) {
    // Título en bold
    pdf.setFont("helvetica", "bold");
    const tituloLines = pdf.splitTextToSize(bloque.titulo, 180);
    pdf.text(tituloLines, 10, y, { maxWidth: 180 });
    y += tituloLines.length * 4;

    // Descripción en normal
    pdf.setFont("helvetica", "normal");
    const descLines = pdf.splitTextToSize(bloque.descripcion, 180);
    pdf.text(descLines, 10, y, { align: "justify", maxWidth: 180 });
    y += descLines.length * 4 + 4;

    // Revisar salto de página
    y = await checkPageBreak(pdf, y);
  }

  pdf.setFont("helvetica", "bold");
  pdf.text("REASIGNACIÓN DE CUPOS CONTRATADOS", 10, y);
  y += 8;

  // ================== TABLA 4 ==================
  pdf.setFont("helvetica", "bold");
  pdf.rect(tableX, y, col4Width, rowHeight);
  centerText("Estudiantes reasignados", tableX, y + 6, col4Width);
  pdf.rect(tableX + col4Width, y, col2Width, rowHeight);
  centerText("Cantidad", tableX + col4Width + 2, y + 6, col2Width);
  y += rowHeight;

  pdf.setFont("helvetica", "normal");
  drawTableRow1("Estudiantes reasignados", "valor");
  drawTableRow1("Estudiantes reasignados registrados presencialmente", "valor");
  drawTableRow1("Estudiantes reasignados ausentes", "valor");

  y += 10;
  y = await checkPageBreak(pdf, y);
  pdf.setFontSize(11);
  pdf.setFont("helvetica", "bold");
  pdf.text("Descripción técnica", 10, y);
  y += 8;

  pdf.setFontSize(11);

  const bloques1 = [
    {
      titulo: "Estudiantes Reasignados",
      descripcion: `Estudiante que por necesidad del servicio son asignados a la institución educativa que ha ofertado cupos disponibles, ocasionados por retiros o deserción de estudiantes que eran beneficiados.`,
    },
  ];

  pdf.setFontSize(11);

  for (let bloque of bloques1) {
    // Título en bold
    pdf.setFont("helvetica", "bold");
    const tituloLines = pdf.splitTextToSize(bloque.titulo, 180);
    pdf.text(tituloLines, 10, y, { maxWidth: 180 });
    y += tituloLines.length * 4;

    // Descripción en normal
    pdf.setFont("helvetica", "normal");
    const descLines = pdf.splitTextToSize(bloque.descripcion, 180);
    pdf.text(descLines, 10, y, { align: "justify", maxWidth: 180 });
    y += descLines.length * 4 + 4;

    // Revisar salto de página
    y = await checkPageBreak(pdf, y);
  }

  // ================== CONSOLIDACIÓN DIGITAL ==================
  pdf.setFont("helvetica", "bold");
  pdf.text("COMPONENTE 2: ESTADSÍSTICAS Y CONSOLIDACIÓN DIGITAL", 10, y);
  y += 8;

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(11);
  const objetivoTexto3 = `Los valores estadísticos presentados permiten evidenciar el estado real del proceso de auditoría y verificación, consolidando información sobre estudiantes registrados, validados, ausentes y con novedades. Estos indicadores reflejan el avance institucional dentro de las etapas programadas.`;

  const objetivoTexto4 = `Las cifras obtenidas permiten identificar con precisión el nivel de participación estudiantil en cada jornada, diferenciando entre estudiantes que asistieron, quienes presentaron excusas formales y aquellos que no registraron soporte de ausencia. Este análisis favorece la toma de decisiones informadas por parte de la institución educativa.`;

  const objetivoTexto66 = `Los indicadores estadísticos facilitan la verificación de la consistencia entre la información biométrica capturada y los documentos cargados en plataforma, permitiendo detectar registros incompletos, inconsistencias o duplicidades, y fortaleciendo el control y la integridad del proceso.`;

  const objetivoTexto67 = `Los datos consolidados aportan insumos clave para evaluar el nivel de cumplimiento frente a los requerimientos normativos y contractuales, especialmente en relación con la actualización de estados, la entrega de soportes y la correcta identificación de los beneficiarios dentro del proceso de auditoría.`;

  for (let txt of [
    objetivoTexto3,
    objetivoTexto4,
    objetivoTexto66,
    objetivoTexto67,
  ]) {
    const lines = pdf.splitTextToSize(txt, 180);
    pdf.text(lines, 10, y, { align: "justify", maxWidth: 180 });
    y += lines.length * 4 + 6;
    y = await checkPageBreak(pdf, y);
  }

  // ================== REPORTES POR INSTITUCIÓN ==================

  const imgReporte = new Image();
  imgReporte.src = estadisticas;

  await new Promise((resolve) => {
    imgReporte.onload = () => {
      const maxWidth = 180;
      const ratio = imgReporte.height / imgReporte.width;
      const imgWidth = maxWidth;
      const imgHeight = maxWidth * ratio;

      pdf.addImage(imgReporte, "JPG", 15, y, imgWidth, imgHeight);
      resolve();
    };
  });

  // mover Y debajo de la imagen
  y += 280;
  y = await checkPageBreak(pdf, y);

  // for (let index = 0; index < dataSchool.length; index++) {
  //   const item = dataSchool[index];

  //   const renderChart = async (config) => {
  //     const canvas = document.createElement("canvas");
  //     const ctx = canvas.getContext("2d");

  //     return new Promise((resolve) => {
  //       const chart = new Chart(ctx, {
  //         ...config,
  //         options: {
  //           ...config.options,
  //           responsive: false,
  //           animation: false,
  //           plugins: {
  //             datalabels: {
  //               color: "#000",
  //               font: { weight: "bold", size: 10 },
  //               formatter: (value) => value,
  //             },
  //           },
  //         },
  //         plugins: [ChartDataLabels],
  //       });

  //       setTimeout(() => {
  //         const imgData = canvas.toDataURL("image/png");
  //         chart.destroy();
  //         resolve(imgData);
  //       }, 100);
  //     });
  //   };

  //   const addImageWithCheck = async (img, x, w, h) => {
  //     if (y + h > 270) {
  //       pdf.addPage();
  //       await drawHeader(pdf);
  //       y = 45;
  //     }
  //     pdf.addImage(img, "PNG", x, y, w, h);
  //   };

  //   const img1 = await renderChart({
  //     type: "bar",
  //     data: {
  //       labels: ["Registrados", "Ausentes", "Pendientes"],
  //       datasets: [
  //         {
  //           label: "Etapa 1",
  //           data: [
  //             item.total_registrados,
  //             item.total_ausentes,
  //             item.total_pendientes,
  //           ],
  //           backgroundColor: ["#4CAF50", "#F44336", "#FFC107"],
  //         },
  //       ],
  //     },
  //   });
  //   await addImageWithCheck(img1, 10, 80, 60);

  //   const img2 = await renderChart({
  //     type: "pie",
  //     data: {
  //       labels: ["SIMAT", "Registrados+Ausentes+Pendientes"],
  //       datasets: [
  //         {
  //           data: [
  //             item.total_simat,
  //             item.total_registrados +
  //               item.total_ausentes +
  //               item.total_pendientes,
  //           ],
  //           backgroundColor: ["#2196F3", "#9E9E9E"],
  //         },
  //       ],
  //     },
  //   });
  //   await addImageWithCheck(img2, 110, 80, 60);

  //   y += 75;

  //   const img3 = await renderChart({
  //     type: "pie",
  //     data: {
  //       labels: ["Validados", "Pendientes Validación"],
  //       datasets: [
  //         {
  //           data: [item.total_validados, item.total_pendientes_validacion],
  //           backgroundColor: ["#4CAF50", "#FF9800"],
  //         },
  //       ],
  //     },
  //   });
  //   await addImageWithCheck(img3, 10, 80, 60);

  //   const img4 = await renderChart({
  //     type: "bar",
  //     data: {
  //       labels: ["Pendientes", "Validados"],
  //       datasets: [
  //         {
  //           label: "Etapa 2",
  //           data: [item.total_pendientes_validacion, item.total_validados],
  //           backgroundColor: ["#FF5722", "#4CAF50"],
  //         },
  //       ],
  //     },
  //   });
  //   await addImageWithCheck(img4, 110, 80, 60);

  //   y += 80;
  //   y = await checkPageBreak(pdf, y);
  // }
  // ================== CIERRE Y ESTADO DE LA AUDITORÍA ==================
  pdf.setFont("helvetica", "bold");
  pdf.text("COMPONENTE 3: CIERRE Y ESTADO DE LA AUDITORÍA", 10, y);
  y += 8;

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(11);
  //const objetivoTexto6 = `La segunda verificación biométrica en la institución educativa ${dataSchool[0].school_name} ha culminado en su totalidad, sin requerirse jornadas adicionales. La fecha de cierre institucional corresponde al ${formData.fechaCierre}, y el estado del proceso ha sido registrado como Cierre Verificado.`;
  const objetivoTexto7 = "ANEXOS";
  const objetivoTexto8 = "ANEXO 1: ";
  const objetivoTexto9 = "ANEXO 2: ";
  const objetivoTexto10 = "ANEXO 3: ";
  //  const objetivoTexto20 = formData.anexo4
  // ? "ANEXO 4: SOPORTE DE AUSENCIAS"
  // : "";
  // const objetivoTexto21 =
  //   "ANEXO 5: CARTA DE OFERTA EDUCATIVA DE INSTITUCIÓN EDUCATIVA";

  // const objetivoTexto12 = `Link de evidencias de la visita presencial segunda verificación biométrica: ${
  //   dataSchool[0].link_evidencia || "No proporcionado"
  // }`
  for (let txt of [
    //objetivoTexto6,
    objetivoTexto7,
    objetivoTexto8,
    objetivoTexto9,
    objetivoTexto10,
    //objetivoTexto20,
    // objetivoTexto21,
    //objetivoTexto12,
  ]) {
    const lines = pdf.splitTextToSize(txt, 180);
    pdf.text(lines, 10, y, { align: "justify", maxWidth: 180 });
    y += lines.length * 4 + 4;
    y = await checkPageBreak(pdf, y);
  }

  //formData.anexo4 ? y += 12: y += 6;

  //const pageWidth = pdf.internal.pageSize.getWidth();
  // Texto del título
  // pdf.setFont("helvetica", "bold");
  // const titulo =
  //   "Link de evidencias de la visita presencial segunda verificación biométrica:";
  // pdf.text(titulo, pageWidth / 2, y, { align: "center" });
  // y += 6;

  // // Texto del link
  // pdf.setFont("helvetica", "normal");
  // pdf.setTextColor(0, 0, 255); // azul

  // const link = dataSchool[0].link_evidencia || "No proporcionado";
  // pdf.text(link, pageWidth / 2, y, { align: "center" });

  // Subrayar el texto
  // const textWidth = pdf.getTextWidth(link);
  // const x = (pageWidth - textWidth) / 2;
  // pdf.setLineWidth(0.5);
  // pdf.setDrawColor(0, 0, 255); // línea azul
  // pdf.line(x, y + 1, x + textWidth, y + 1);

  // pdf.setTextColor(0, 0, 0); // volver a negro
  // pdf.setDrawColor(0, 0, 0); // restaurar color de línea
  // y += 12;

  // ================== Firma ==================

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(11);
  const analisisTexto13 = "Este informe ha sido elaborado por:";
  const splitText22 = pdf.splitTextToSize(analisisTexto13, 180);
  pdf.text(splitText22, 10, y);
  y += rowHeight;

  // const firmaImg = new Image();
  // firmaImg.src = firma;

  // await new Promise((resolve) => {
  //   firmaImg.onload = () => {
  //     pdf.addImage(firmaImg, "PNG", 20, y, 50, 25); // x=20, y=posición actual, ancho=50mm, alto=25mm
  //     resolve();
  //   };
  // });

  y += 35; // espacio después de la firma
  pdf.text("Encargado", 20, y);
  pdf.text("Director Operativo", 20, y + 5);
  pdf.text("Convenio", 20, y + 10);
  pdf.save(`Informe_.pdf`);
};

const PdfSchool = async (data) => {
  await exportPDF(data);
};

export default PdfSchool;
