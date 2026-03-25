import { driver } from "driver.js";
import "driver.js/dist/driver.css";

const tourProfileSede = ({ isPageMode = false } = {}) => {
  let allSteps = [
    {
      element: "#tour-sede-save",
      popover: {
        title: "Editar / Guardar",
        description:
          "Usa este botón para alternar entre modo lectura y edición. En modo edición el texto cambia a 'Guardar' para persistir los cambios.",
        side: "bottom",
        align: "center",
      },
    },
    {
      element: "#tour-sede-nombre",
      popover: {
        title: "Nombre de la sede",
        description: "Nombre oficial de la sede. Es un campo obligatorio.",
        side: "bottom",
        align: "start",
      },
    },
    {
      element: "#tour-sede-direccion",
      popover: {
        title: "Dirección",
        description: "La dirección física de la sede.",
        side: "bottom",
        align: "start",
      },
    },
    {
      element: "#tour-sede-telefono",
      popover: {
        title: "Teléfono",
        description: "Número de contacto de la sede.",
        side: "bottom",
        align: "start",
      },
    },
    {
      element: "#tour-sede-estado",
      popover: {
        title: "Estado",
        description: "Selecciona si la sede está activa o desactivada.",
        side: "bottom",
        align: "start",
      },
    },
    {
      element: "#tour-sede-jornada",
      popover: {
        title: "Jornada",
        description:
          "Asigna la jornada (matutina, vespertina, etc.) mediante este selector.",
        side: "bottom",
        align: "start",
      },
    },
  ];

  if (isPageMode) {
    // en modo página solo muestra campos, no edición/guardado
    allSteps = allSteps.filter((s) => s.element !== "#tour-sede-save");
  }

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
    console.warn("tourProfileSede - no hay pasos visibles, tour omitido");
    return;
  }

  console.debug(`tourProfileSede - iniciando tour con ${steps.length} pasos`);

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

export default tourProfileSede;
