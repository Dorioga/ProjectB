import { driver } from "driver.js";
import "driver.js/dist/driver.css";

const tourRegisterAssistance = () => {
  // pasos candidatos (se filtrarán por visibilidad antes de mostrar el tour)
  const allSteps = [
    {
      element: "#tour-filters-assistance",
      popover: {
        title: "Filtros de asistencia",
        description:
          "Selecciona sede, curso, asignatura, jornada y período para ver la lista de estudiantes.",
        side: "bottom",
        align: "start",
      },
    },
    {
      element: "#tour-grade-assistance",
      popover: {
        title: "Curso",
        description:
          "Filtra por curso/grado para mostrar los estudiantes correspondientes.",
        side: "bottom",
        align: "start",
      },
    },
    {
      element: "#tour-asignature-assistance",
      popover: {
        title: "Asignatura",
        description:
          "Selecciona la asignatura para la que registrarás la asistencia.",
        side: "bottom",
        align: "start",
      },
    },
    {
      element: "#tour-journey-assistance",
      popover: {
        title: "Jornada",
        description: "Elige la jornada (mañana/tarde) si aplica.",
        side: "bottom",
        align: "start",
      },
    },
    {
      element: "#tour-period-assistance",
      popover: {
        title: "Período",
        description:
          "Selecciona el período escolar vigente para registrar la asistencia.",
        side: "bottom",
        align: "start",
      },
    },
    {
      element: "#tour-assistance-count",
      popover: {
        title: "Resumen",
        description:
          "Verás el total de estudiantes y cuántos ya están marcados como presentes.",
        side: "bottom",
        align: "start",
      },
    },
    {
      element: "#tour-assistance-table",
      popover: {
        title: "Lista de estudiantes",
        description:
          "En esta tabla marcas la asistencia y guardas por fila o en bloque.",
        side: "top",
        align: "start",
      },
    },
    {
      element: ".tour-edit-toggle",
      popover: {
        title: "Modo edición",
        description:
          "Activa el modo edición para modificar las casillas de asistencia.",
        side: "left",
        align: "center",
      },
    },
    {
      element: ".tour-present-checkbox",
      popover: {
        title: "Marcar presente",
        description:
          "Marca/desmarca la casilla para indicar si el estudiante está presente.",
        side: "left",
        align: "center",
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
      "tourRegisterAssistance - no hay pasos visibles, tour omitido",
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

export default tourRegisterAssistance;
