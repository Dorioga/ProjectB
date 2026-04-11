import { driver } from "driver.js";
import "driver.js/dist/driver.css";

const tourManageObserver = () => {
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
    steps: [
      {
        element: "#tour-mo-header",
        popover: {
          title: "Gestión de Observador",
          description:
            "Aquí puedes gestionar las observaciones de los estudiantes. Busca por documento de identidad para ver el historial de un estudiante específico.",
          side: "bottom",
          align: "start",
        },
      },
      {
        element: "#tour-mo-add-btn",
        popover: {
          title: "Registrar observación",
          description:
            "Haz clic aquí para registrar una nueva observación de un estudiante. Se abrirá el formulario de observador.",
          side: "bottom",
          align: "end",
        },
      },
      {
        element: "#tour-mo-search-input",
        popover: {
          title: "Documento de identidad",
          description:
            "Ingresa el número de documento de identidad del estudiante cuyas observaciones deseas consultar. También puedes presionar Enter para buscar.",
          side: "bottom",
          align: "start",
        },
      },
      {
        element: "#tour-mo-search-btn",
        popover: {
          title: "Buscar observaciones",
          description:
            "Haz clic aquí para buscar las observaciones del estudiante con el documento ingresado.",
          side: "bottom",
          align: "start",
        },
      },
      {
        element: "#tour-mo-table",
        popover: {
          title: "Tabla de observaciones",
          description:
            "Aquí se muestran las observaciones del estudiante buscado. Puedes ver la fecha, el resumen de la observación y usar el botón de lápiz para editarla.",
          side: "top",
          align: "start",
        },
      },
    ],
  });

  driverObj.drive();
};

export default tourManageObserver;
