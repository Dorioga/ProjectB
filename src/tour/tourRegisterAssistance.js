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
          "Completa todos los filtros (sede, curso, asignatura, jornada, período y fecha) para habilitar la lista de estudiantes.",
        side: "bottom",
        align: "start",
      },
    },
    {
      element: "#tour-sede-assistance",
      popover: {
        title: "Sede",
        description:
          "Selecciona la sede a la que pertenece el grupo. Si eres docente, la sede se asigna automáticamente.",
        side: "bottom",
        align: "start",
      },
    },
    {
      element: "#tour-grade-assistance",
      popover: {
        title: "Curso",
        description:
          "Elige el grado/curso para filtrar los estudiantes que aparecerán en la tabla de asistencia.",
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
        description:
          "Elige la jornada (mañana/tarde). Para docentes se detecta automáticamente según la asignatura seleccionada.",
        side: "bottom",
        align: "start",
      },
    },
    {
      element: "#tour-period-assistance",
      popover: {
        title: "Período",
        description:
          "Selecciona el período escolar vigente para el que deseas registrar la asistencia.",
        side: "bottom",
        align: "start",
      },
    },
    {
      element: "#tour-date-assistance",
      popover: {
        title: "Fecha de asistencia",
        description:
          "Indica la fecha en que se toma la asistencia. Si la dejas vacía, se usará la fecha de hoy.",
        side: "bottom",
        align: "start",
      },
    },
    {
      element: "#tour-assistance-count",
      popover: {
        title: "Resumen de asistencia",
        description:
          "Muestra el total de estudiantes del grupo y cuántos están marcados como presentes.",
        side: "bottom",
        align: "start",
      },
    },
    {
      element: "#tour-assistance-table",
      popover: {
        title: "Lista de estudiantes",
        description:
          "Tabla con todos los estudiantes del grupo. Aquí puedes marcar la asistencia de cada uno y guardar los registros.",
        side: "top",
        align: "start",
      },
    },
    {
      element: ".tour-edit-toggle",
      popover: {
        title: "Activar / cerrar asistencia",
        description:
          "Haz clic en este botón para habilitar la edición de las casillas de asistencia. Al activarlo también aparece el botón de guardar en bloque.",
        side: "left",
        align: "center",
      },
    },
    {
      element: ".tour-present-checkbox",
      popover: {
        title: "Marcar presente",
        description:
          "Marca o desmarca la casilla para indicar si el estudiante está presente. Debes activar el modo edición primero.",
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
