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

const tourProfileStudent = () => {
  const allSteps = [
    {
      element: "#tour-ps-edit",
      popover: {
        title: "Editar perfil",
        description:
          "Haz clic en el botón de edición para habilitar los campos y modificar la información del estudiante. Cuando termines, haz clic en 'Guardar'.",
        side: "bottom",
        align: "start",
      },
    },
    {
      element: "#tour-ps-basic-info",
      popover: {
        title: "Datos básicos",
        description:
          "Nombre completo, tipo y número de documento, fecha de nacimiento y género del estudiante.",
        side: "bottom",
        align: "start",
      },
    },
    {
      element: "#tour-ps-school-info",
      popover: {
        title: "Información escolar",
        description:
          "Sede, jornada y grado al que pertenece el estudiante. Estos datos determinan dónde aparece asignado en el sistema.",
        side: "bottom",
        align: "start",
      },
    },
    {
      element: "#tour-ps-family-info",
      popover: {
        title: "Información familiar / acudiente",
        description:
          "Datos del acudiente o tutor responsable: nombre, parentesco, teléfono y correo electrónico de contacto.",
        side: "bottom",
        align: "start",
      },
    },
    {
      element: "#tour-ps-states",
      popover: {
        title: "Estado del estudiante",
        description:
          "Indica si el estudiante está activo, inactivo, retirado, o en algún otro estado especial. Un estudiante inactivo no aparece en listas de clases.",
        side: "top",
        align: "start",
      },
    },
    {
      element: "#tour-ps-documents",
      popover: {
        title: "Documentos adjuntos",
        description:
          "Documentos cargados del estudiante (foto, certificados, autorizaciones, datos de salud). Puedes ver y actualizar cada uno desde aquí.",
        side: "top",
        align: "start",
      },
    },
    {
      element: "#tour-ps-history",
      popover: {
        title: "Historial académico",
        description:
          "Consulta el historial de años académicos, boletines y comportamiento del estudiante en períodos anteriores.",
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

export default tourProfileStudent;
