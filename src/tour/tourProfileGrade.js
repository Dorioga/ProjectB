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

const tourProfileGrade = () => {
  const allSteps = [
    {
      element: "#tour-pg-edit",
      popover: {
        title: "Editar / Guardar grado",
        description:
          "Haz clic para habilitar la edición. Cuando termines, presiona 'Guardar' para confirmar los cambios en el grado.",
        side: "bottom",
        align: "start",
      },
    },
    {
      element: "#tour-pg-name",
      popover: {
        title: "Nombre del grado",
        description:
          "Nombre oficial del grado (p. ej. Primero, Segundo, Décimo). Este nombre aparece en reportes y listas.",
        side: "bottom",
        align: "start",
      },
    },
    {
      element: "#tour-pg-group",
      popover: {
        title: "Grupo",
        description:
          "Letra o identificador del grupo (A, B, C...) que distingue los diferentes salones de un mismo grado.",
        side: "bottom",
        align: "start",
      },
    },
    {
      element: "#tour-pg-journey",
      popover: {
        title: "Jornada",
        description:
          "Jornada a la cual pertenece este grado (mañana, tarde, noche). En modo edición puedes cambiarla.",
        side: "bottom",
        align: "start",
      },
    },
    {
      element: "#tour-pg-status",
      popover: {
        title: "Estado del grado",
        description:
          "Indica si el grado está activo o inactivo. Los grados inactivos no aparecen en los formularios de registro de estudiantes.",
        side: "bottom",
        align: "start",
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

export default tourProfileGrade;
