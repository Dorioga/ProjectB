import { driver } from "driver.js";
import "driver.js/dist/driver.css";

const tourObservadorEstudiante = () => {
  const allSteps = [
    {
      element: "#tour-oe-search",
      popover: {
        title: "Buscar estudiante",
        description:
          "Ingresa el documento de identidad del estudiante y haz clic en 'Buscar' (o presiona Enter) para cargar su información y observaciones.",
        side: "bottom",
        align: "start",
      },
    },
    {
      element: "#tour-oe-student-info",
      popover: {
        title: "Información del estudiante",
        description:
          "Aquí se muestran los datos básicos del estudiante encontrado: nombre, identificación, grado, jornada y datos del acudiente.",
        side: "bottom",
        align: "start",
      },
    },
    {
      element: "#tour-oe-acudiente",
      popover: {
        title: "Datos del acudiente",
        description:
          "Puedes editar la dirección, lugar de nacimiento, ocupación y teléfono del acudiente antes de guardar la observación.",
        side: "bottom",
        align: "start",
      },
    },
    {
      element: "#tour-oe-form",
      popover: {
        title: "Formulario de observación",
        description:
          "Completa este formulario para registrar una nueva observación. Incluye el texto de la observación y los nombres del docente, estudiante y acudiente.",
        side: "top",
        align: "start",
      },
    },
    {
      element: "#tour-oe-observacion",
      popover: {
        title: "Texto de la observación",
        description:
          "Describe detalladamente la observación del estudiante. Este campo es obligatorio para poder guardar.",
        side: "top",
        align: "start",
      },
    },
    {
      element: "#tour-oe-submit",
      popover: {
        title: "Guardar observación",
        description:
          "Haz clic en 'Guardar' para registrar la observación. Una vez guardada, quedará asociada al historial del estudiante.",
        side: "top",
        align: "end",
      },
    },
  ];

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
        ) {
          return true;
        }
      }
      return false;
    } catch (err) {
      return false;
    }
  };

  const steps = allSteps.filter((s) => hasVisibleTarget(s.element));

  if (!steps.length) {
    console.warn(
      "tourObservadorEstudiante - no hay pasos visibles, tour omitido",
    );
    return;
  }

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

export default tourObservadorEstudiante;
