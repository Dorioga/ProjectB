import { driver } from "driver.js";
import "driver.js/dist/driver.css";

const tourProfileTeacher = ({ isPageMode = false } = {}) => {
  // pasos candidatos (se filtrarán por visibilidad antes de mostrar el tour)
  let allSteps = [
    {
      element: "#tour-profile-firstname",
      popover: {
        title: "Primer nombre",
        description:
          "Muestra (y, si estás en modo edición, permite cambiar) el primer nombre del docente. Es un campo obligatorio.",
        side: "bottom",
        align: "start",
      },
    },
    {
      element: "#tour-profile-firstlastname",
      popover: {
        title: "Primer apellido",
        description:
          "Muestra (y, si estás en modo edición, permite cambiar) el primer apellido del docente. Es un campo obligatorio.",
        side: "bottom",
        align: "start",
      },
    },
    {
      element: "#tour-profile-identification",
      popover: {
        title: "Identificación",
        description: "Número de identificación del docente.",
        side: "bottom",
        align: "start",
      },
    },
    {
      element: "#tour-profile-email",
      popover: {
        title: "Correo electrónico",
        description:
          "Correo institucional o personal del docente (obligatorio).",
        side: "bottom",
        align: "start",
      },
    },
    {
      element: "#tour-profile-sede",
      popover: {
        title: "Sede / Jornada",
        description:
          "Aquí puedes ver la sede actual y, en modo edición, asignar una nueva sede y jornada para el docente.",
        side: "bottom",
        align: "start",
      },
    },
    // pasos adicionales (solo aparecerán si el elemento está visible en la UI)
    {
      element: "#tour-profile-add-sede",
      popover: {
        title: "Agregar nueva sede",
        description:
          "Pulsa aquí para agregar una nueva sede donde podrá trabajar el docente.",
        side: "bottom",
        align: "start",
      },
    },
    {
      element: "#tour-profile-register-sede",
      popover: {
        title: "Registrar sedes nuevas",
        description: "Guarda las sedes añadidas para asignarlas al docente.",
        side: "bottom",
        align: "center",
      },
    },
    {
      element: "#tour-profile-asignatures",
      popover: {
        title: "Asignaturas y grupos",
        description:
          "Activa o desactiva las asignaturas y los grupos asociados al docente.",
        side: "top",
        align: "start",
      },
    },
    {
      element: "#tour-profile-toggle-asignatures",
      popover: {
        title: "Agregar asignaturas",
        description:
          "Usa este botón para añadir nuevas asignaturas al docente.",
        side: "bottom",
        align: "start",
      },
    },
    {
      element: "#tour-profile-register-asignature",
      popover: {
        title: "Registrar asignaturas",
        description: "Confirma y guarda las asignaturas recién añadidas.",
        side: "bottom",
        align: "center",
      },
    },
    {
      element: ".tour-director-checkbox",
      popover: {
        title: "Director de grupo",
        description:
          "Indica si el docente es director de un grado/grupo específico. Este checkbox se activa solo cuando el campo 'Representante de curso' está marcado y estás en modo edición.",
        side: "left",
        align: "center",
      },
    },
    {
      element: "#tour-profile-assignments-table",
      popover: {
        title: "Tabla de asignaciones",
        description:
          "Lista los grados/grupos donde el docente está asignado. Marca o desmarca las filas para activar o desactivar cada asignación antes de guardar.",
        side: "top",
        align: "center",
      },
    },
    {
      element: "#tour-profile-save",
      popover: {
        title: "Editar / Cancelar edición",
        description:
          "Este botón alterna el modo de edición. Cuando dice 'Editar' (lápiz), activa los campos para modificar. Cuando dice 'Cancelar edición' (X), descarta los cambios y vuelve al modo solo lectura.",
        side: "bottom",
        align: "center",
      },
    },
    {
      element: "#tour-profile-guardar",
      popover: {
        title: "Guardar cambios",
        description:
          "Una vez que hayas terminado de editar, haz clic aquí para guardar todos los cambios del docente. El botón sólo aparece cuando estás en modo edición.",
        side: "top",
        align: "center",
      },
    },
  ];

  // si estamos en modo página es preferible eliminar de antemano
  // los pasos que sólo tienen sentido cuando existe el botón de
  // edición/guardado u otros controles de edición.
  if (isPageMode) {
    const editingSelectors = [
      "#tour-profile-add-sede",
      "#tour-profile-register-sede",
      "#tour-profile-asignatures",
      "#tour-profile-toggle-asignatures",
      "#tour-profile-register-asignature",
      ".tour-director-checkbox",
      "#tour-profile-assignments-table",
      "#tour-profile-save",
      "#tour-profile-guardar",
    ];

    allSteps = allSteps.filter((s) => !editingSelectors.includes(s.element));
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
    console.warn("tourProfileTeacher - no hay pasos visibles, tour omitido");
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

export default tourProfileTeacher;
