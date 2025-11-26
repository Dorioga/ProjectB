import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";

/**
 * Espera a que las webfonts se carguen (si el navegador lo soporta).
 */
async function waitForFonts() {
  try {
    if (document.fonts && document.fonts.ready) {
      await document.fonts.ready;
      // pequeña pausa para evitar layout shift.
      await new Promise((r) => setTimeout(r, 50));
    }
  } catch {}
}

/**
 * Exporta un elemento a PNG y descarga el archivo.
 */
export async function exportElementToPNG(
  element,
  filename = "export.png",
  options = {}
) {
  if (!element) throw new Error("Elemento inválido para exportar a PNG.");
  const {
    scale = 2,
    backgroundColor = "#ffffff",
    useCORS = true,
    logging = false,
  } = options;

  await waitForFonts();

  const canvas = await html2canvas(element, {
    scale,
    backgroundColor,
    useCORS,
    logging,
  });
  const dataUrl = canvas.toDataURL("image/png");
  const link = document.createElement("a");
  link.download = filename;
  link.href = dataUrl;
  link.click();
  return dataUrl;
}

/**
 * Exporta frente y reverso del carné a un solo PDF.
 * twoPages=true → 2 páginas (cada cara en su página).
 * twoPages=false → 1 página con ambas caras lado a lado.
 */
export async function exportCardToPDF(frontEl, backEl, opts = {}) {
  if (!frontEl || !backEl)
    throw new Error(
      "Faltan los elementos frontal y/o reverso para exportar a PDF."
    );

  const {
    twoPages = true,
    mmWidth = 88, // ancho típico de tarjeta (mm)
    mmHeight = 54, // alto típico de tarjeta (mm)
    scale = 2,
    backgroundColor = "#ffffff",
    useCORS = true,
    fileName = "Carné.pdf",
    logging = false,
  } = opts;

  await waitForFonts();

  const [frontCanvas, backCanvas] = await Promise.all([
    html2canvas(frontEl, { scale, backgroundColor, useCORS, logging }),
    html2canvas(backEl, { scale, backgroundColor, useCORS, logging }),
  ]);

  const frontImg = frontCanvas.toDataURL("image/png");
  const backImg = backCanvas.toDataURL("image/png");

  if (twoPages) {
    const pdf = new jsPDF({
      orientation: "landscape",
      unit: "mm",
      format: [mmWidth, mmHeight],
    });
    pdf.addImage(frontImg, "PNG", 0, 0, mmWidth, mmHeight);
    pdf.addPage();
    pdf.addImage(backImg, "PNG", 0, 0, mmWidth, mmHeight);
    pdf.save(fileName);
  } else {
    const pdf = new jsPDF({
      orientation: "landscape",
      unit: "mm",
      format: [mmWidth * 2, mmHeight],
    });
    pdf.addImage(frontImg, "PNG", 0, 0, mmWidth, mmHeight);
    pdf.addImage(backImg, "PNG", mmWidth, 0, mmWidth, mmHeight);
    pdf.save(fileName);
  }
}
