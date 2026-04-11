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

const tourProfileSchool = () => {
  const allSteps = [
    {
      element: "#tour-psc-header",
      popover: {
        title: "Perfil de la institución",
        description:
          "Esta sección muestra y permite editar la información general de tu institución educativa. Aquí encontrarás todos los datos configurables de tu colegio.",
        side: "bottom",
        align: "start",
      },
    },
    {
      element: "#tour-psc-edit-btn",
      popover: {
        title: "Editar información",
        description:
          "Haz clic en este botón para habilitar la edición de los campos. Cuando hayas terminado los cambios, podrás guardarlos.",
        side: "bottom",
        align: "end",
      },
    },
    {
      element: "#tour-psc-name",
      popover: {
        title: "Nombre de la institución",
        description:
          "Nombre oficial del colegio o institución educativa. Aparece en reportes, boletines y encabezados de documentos.",
        side: "bottom",
        align: "start",
      },
    },
    {
      element: "#tour-psc-nit",
      popover: {
        title: "NIT / Código DANE",
        description:
          "Número de identificación tributaria o código DANE de la institución. Se usa en documentos oficiales.",
        side: "bottom",
        align: "start",
      },
    },
    {
      element: "#tour-psc-slogan",
      popover: {
        title: "Eslogan",
        description:
          "Frase o lema institucional. Se muestra en algunos documentos y en la pantalla de inicio de sesión.",
        side: "bottom",
        align: "start",
      },
    },
    {
      element: "#tour-psc-address",
      popover: {
        title: "Dirección",
        description:
          "Dirección física principal de la institución. Aparece en cartas, informes y documentación oficial.",
        side: "bottom",
        align: "start",
      },
    },
    {
      element: "#tour-psc-department-city",
      popover: {
        title: "Departamento y ciudad",
        description:
          "Departamento y municipio donde está ubicada la institución. Usado para localización y reportes del MEN.",
        side: "bottom",
        align: "start",
      },
    },
    {
      element: "#tour-psc-contact",
      popover: {
        title: "Datos de contacto",
        description:
          "Teléfono y correo electrónico institucional de contacto. Los acudientes y usuarios pueden usarlos para comunicarse.",
        side: "bottom",
        align: "start",
      },
    },
    {
      element: "#tour-psc-logo",
      popover: {
        title: "Logo institucional",
        description:
          "Logo que aparece en reportes y boletines. Haz clic en la imagen para cargar un nuevo logo (formatos JPG/PNG recomendados).",
        side: "right",
        align: "start",
      },
    },
    {
      element: "#tour-psc-theme-btn",
      popover: {
        title: "Cambiar tema de colores",
        description:
          "Aquí puedes personalizar la paleta de colores de la plataforma para que coincida con los colores institucionales.",
        side: "bottom",
        align: "start",
      },
    },
    {
      element: "#tour-psc-evaluation",
      popover: {
        title: "Configuración de evaluación",
        description:
          "Define la escala de evaluación: valor mínimo, máximo, mínima nota aprobatoria y decimales a mostrar en reportes.",
        side: "top",
        align: "start",
      },
    },
    {
      element: "#tour-psc-promotion",
      popover: {
        title: "Criterios de promoción",
        description:
          "Configura las reglas de promoción: número máximo de materias reprobadas, porcentaje de asistencia mínimo y otros criterios para aprobar el año.",
        side: "top",
        align: "start",
      },
    },
    {
      element: "#tour-psc-save",
      popover: {
        title: "Guardar cambios",
        description:
          "Una vez que hayas terminado de editar, haz clic aquí para guardar toda la configuración de la institución.",
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

export default tourProfileSchool;
