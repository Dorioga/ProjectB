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

const tourProfileNote = () => {
  const allSteps = [
    {
      element: "#tour-pn-total",
      popover: {
        title: "Porcentaje total",
        description:
          "Muestra el porcentaje acumulado de todas las notas activas. El total debe sumar 100% para que el período esté completo.",
        side: "bottom",
        align: "start",
      },
    },
    {
      element: "#tour-pn-add-btn",
      popover: {
        title: "Agregar nota",
        description:
          "Haz clic para agregar una nueva nota o tipo de evaluación (parcial, taller, quizz, etc.) a la lista.",
        side: "bottom",
        align: "end",
      },
    },
    {
      element: "#tour-pn-notes-list",
      popover: {
        title: "Lista de notas",
        description:
          "Aquí aparecen todas las notas configuradas. Para cada una puedes: activarla/desactivarla, editar su descripción, ajustar el porcentual y marcar si está fija.",
        side: "top",
        align: "start",
      },
    },
    {
      element: "#tour-pn-save-btn",
      popover: {
        title: "Guardar cambios",
        description:
          "Una vez configuradas todas las notas, haz clic aquí para guardar los cambios. Asegúrate de que el total sume 100%.",
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

export default tourProfileNote;
