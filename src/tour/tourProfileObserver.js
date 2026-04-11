import { driver } from "driver.js";
import "driver.js/dist/driver.css";

const hasVisibleTarget = (selector) => {
  try {
    const nodes = document.querySelectorAll(selector);
    if (!nodes || nodes.length === 0) return false;
    for (const n of nodes) {
      const style = window.getComputedStyle(n);
      const rect = n.getBoundingClientRect();
      if (
        style &&
        style.display !== "none" &&
        style.visibility !== "hidden" &&
        rect.width > 0 &&
        rect.height > 0
      )
        return true;
    }
    return false;
  } catch {
    return false;
  }
};

const tourProfileObserver = () => {
  const allSteps = [
    {
      element: "#tour-po-student-info",
      popover: {
        title: "Información del estudiante",
        description:
          "Aquí se muestra la información básica del estudiante al que pertenece este registro de observador: nombre, documento, grado y sede.",
        side: "bottom",
        align: "start",
      },
    },
    {
      element: "#tour-po-guardian-info",
      popover: {
        title: "Información del acudiente",
        description:
          "Datos del acudiente o tutor del estudiante, incluyendo nombre, parentesco y datos de contacto.",
        side: "bottom",
        align: "start",
      },
    },
    {
      element: "#tour-po-history",
      popover: {
        title: "Historial de observaciones",
        description:
          "Lista de todas las observaciones anteriores registradas sobre este estudiante. Puedes ver la fecha, tipo y descripción de cada una.",
        side: "top",
        align: "start",
      },
    },
    {
      element: "#tour-po-new-observation",
      popover: {
        title: "Nueva observación",
        description:
          "Escribe aquí el texto de la nueva observación. Selecciona también el tipo (académico, convivencial, etc.) antes de guardar.",
        side: "top",
        align: "start",
      },
    },
    {
      element: "#tour-po-download",
      popover: {
        title: "Descargar PDF",
        description:
          "Genera y descarga un informe en PDF con todas las observaciones de este estudiante.",
        side: "top",
        align: "start",
      },
    },
    {
      element: "#tour-po-save",
      popover: {
        title: "Guardar observación",
        description:
          "Haz clic para guardar la nueva observación ingresada. El registro quedará en el historial del estudiante.",
        side: "top",
        align: "end",
      },
    },
  ];

  const steps = allSteps.filter((s) => hasVisibleTarget(s.element));
  if (steps.length === 0) return;

  const driverObj = driver({
    showProgress: true,
    animate: true,
    overlayOpacity: 0.75,
    stagePadding: 10,
    allowClose: true,
    doneBtnText: "Finalizar",
    closeBtnText: "Cerrar",
    nextBtnText: "Siguiente",
    prevBtnText: "Anterior",
    steps,
  });

  driverObj.drive();
};

export default tourProfileObserver;
