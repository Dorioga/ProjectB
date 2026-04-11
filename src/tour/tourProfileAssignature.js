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

const tourProfileAssignature = () => {
  const allSteps = [
    {
      element: "#tour-pa-edit",
      popover: {
        title: "Editar / Guardar asignatura",
        description:
          "Haz clic en este botón para habilitar la edición de los campos de la asignatura. Una vez realizados los cambios, haz clic en 'Guardar' para confirmarlos.",
        side: "bottom",
        align: "start",
      },
    },
    {
      element: "#tour-pa-name",
      popover: {
        title: "Nombre de la asignatura",
        description:
          "Aquí puedes ver y editar el nombre oficial de la asignatura, tal como aparecerá en reportes y boletines.",
        side: "bottom",
        align: "start",
      },
    },
    {
      element: "#tour-pa-status",
      popover: {
        title: "Estado de la asignatura",
        description:
          "Indica si la asignatura está activa o inactiva. Las asignaturas inactivas no aparecen en los formularios de registro.",
        side: "bottom",
        align: "start",
      },
    },
    {
      element: "#tour-pa-code",
      popover: {
        title: "Código de la asignatura",
        description:
          "Código único interno que identifica la asignatura en el sistema. Puede usarse para referencias externas.",
        side: "bottom",
        align: "start",
      },
    },
    {
      element: "#tour-pa-description",
      popover: {
        title: "Descripción",
        description:
          "Descripción detallada de la asignatura con su objetivo académico y contenido general.",
        side: "bottom",
        align: "start",
      },
    },
    {
      element: "#tour-pa-grades",
      popover: {
        title: "Grados asociados",
        description:
          "En modo edición puedes marcar o desmarcar los grados a los que aplica esta asignatura. Los grados seleccionados verán esta asignatura en sus listas.",
        side: "top",
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

export default tourProfileAssignature;
