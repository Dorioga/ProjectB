import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import { getCurrentTheme } from "./themeManager";

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
 * Resuelve colores modernos (oklch, lab, etc.) a rgb usando el Canvas 2D,
 * que sí soporta todos los espacios de color CSS Level 4.
 * html2canvas sólo entiende rgb/rgba/#hex, por eso es necesario este paso.
 */
function buildOnClone() {
  const colorProps = [
    "color",
    "backgroundColor",
    "borderTopColor",
    "borderRightColor",
    "borderBottomColor",
    "borderLeftColor",
    "outlineColor",
    "caretColor",
  ];
  // Canvas 2D normaliza cualquier formato CSS de color a #rrggbb / rgba(...)
  const offscreen = document.createElement("canvas");
  offscreen.width = 1;
  offscreen.height = 1;
  const ctx2d = offscreen.getContext("2d");
  const resolveColor = (raw) => {
    if (!raw || raw === "transparent" || raw === "initial" || raw === "inherit")
      return raw;
    try {
      ctx2d.clearRect(0, 0, 1, 1);
      ctx2d.fillStyle = raw;
      const normalized = ctx2d.fillStyle;
      // Chrome moderno acepta oklch/lab/etc. en Canvas pero NO los normaliza
      // al leer fillStyle — hay que dibujar un píxel y leer los datos RGBA.
      if (/oklch|oklab|lab\(|lch\(|color\(/i.test(normalized)) {
        ctx2d.fillRect(0, 0, 1, 1);
        const [r, g, b, a] = ctx2d.getImageData(0, 0, 1, 1).data;
        return a < 255
          ? `rgba(${r},${g},${b},${(a / 255).toFixed(3)})`
          : `rgb(${r},${g},${b})`;
      }
      return normalized; // ya es #rrggbb o rgba(...)
    } catch {
      return raw;
    }
  };
  return (clonedDoc, clonedElement) => {
    const win = clonedDoc.defaultView ?? window;
    const els = [clonedElement, ...clonedElement.querySelectorAll("*")];
    els.forEach((el) => {
      const computed = win.getComputedStyle(el);
      colorProps.forEach((prop) => {
        const val = computed[prop];
        if (val) el.style[prop] = resolveColor(val);
      });
    });
  };
}

export async function exportElementToPNG(
  element,
  filename = "export.png",
  options = {},
) {
  if (!element) throw new Error("Elemento inválido para exportar a PNG.");
  const {
    scale = 2,
    backgroundColor = undefined,
    useCORS = true,
    logging = false,
  } = options;

  await waitForFonts();
  const bg = backgroundColor ?? getCurrentTheme()["color-surface"] ?? "#ffffff";

  const canvas = await html2canvas(element, {
    scale,
    backgroundColor: bg,
    useCORS,
    logging,
    onclone: buildOnClone(),
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
      "Faltan los elementos frontal y/o reverso para exportar a PDF.",
    );

  const {
    twoPages = true,
    mmWidth = 88, // ancho típico de tarjeta (mm)
    mmHeight = 54, // alto típico de tarjeta (mm)
    scale = 2,
    backgroundColor = undefined,
    useCORS = true,
    fileName = "Carné.pdf",
    logging = false,
  } = opts;

  await waitForFonts();
  const bg = backgroundColor ?? getCurrentTheme()["color-surface"] ?? "#ffffff";

  const onclone = buildOnClone();
  const [frontCanvas, backCanvas] = await Promise.all([
    html2canvas(frontEl, {
      scale,
      backgroundColor: bg,
      useCORS,
      logging,
      onclone,
    }),
    html2canvas(backEl, {
      scale,
      backgroundColor: bg,
      useCORS,
      logging,
      onclone,
    }),
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
