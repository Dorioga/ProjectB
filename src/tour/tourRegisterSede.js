import { driver } from "driver.js";
import "driver.js/dist/driver.css";

const tourRegisterSede = () => {
  const allSteps = [
    {
      element: "#tour-rsede-container",
      popover: {
        title: "Registrar sede",
        description:
          "En este formulario puedes registrar una o varias sedes nuevas para la institución. Completa los campos de cada tarjeta y guarda al final.",
        side: "bottom",
        align: "start",
      },
    },
    {
      element: "#tour-rsede-card",
      popover: {
        title: "Tarjeta de sede",
        description:
          "Cada tarjeta representa una sede. Puedes agregar más tarjetas con el botón 'Agregar otra sede' y eliminar las que no necesites.",
        side: "bottom",
        align: "start",
      },
    },
    {
      element: "#tour-rsede-name",
      popover: {
        title: "Nombre de la sede",
        description:
          "Escribe el nombre oficial de la sede (p. ej. Sede Central o Sede Norte). Este campo es obligatorio.",
        side: "bottom",
        align: "start",
      },
    },
    {
      element: "#tour-rsede-direccion",
      popover: {
        title: "Dirección",
        description:
          "Ingresa la dirección física donde se ubica la sede. Es un campo obligatorio.",
        side: "bottom",
        align: "start",
      },
    },
    {
      element: "#tour-rsede-telefono",
      popover: {
        title: "Teléfono",
        description:
          "Número de contacto de la sede. Solo se aceptan dígitos. Es un campo obligatorio.",
        side: "bottom",
        align: "start",
      },
    },
    {
      element: "#tour-rsede-jornada",
      popover: {
        title: "Jornada",
        description:
          "Selecciona la jornada que opera en esta sede (mañana, tarde, noche u otra). Es obligatorio.",
        side: "bottom",
        align: "start",
      },
    },
    {
      element: "#tour-rsede-actions",
      popover: {
        title: "Acciones del formulario",
        description:
          "Usa 'Agregar otra sede' para incluir más sedes en el mismo envío, o 'Guardar sedes' para registrar todas las sedes completadas.",
        side: "top",
        align: "start",
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
    console.warn("tourRegisterSede - no hay pasos visibles, tour omitido");
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

export default tourRegisterSede;
