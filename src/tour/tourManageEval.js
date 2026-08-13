import { driver } from "driver.js";
import "driver.js/dist/driver.css";

const tourManageEval = () => {
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
        element: "#tour-me-header",
        popover: {
          title: "Gestión de Evaluaciones",
          description:
            "Desde aquí puedes administrar las evaluaciones de la institución: quizzes, evaluaciones y talleres.",
          side: "bottom",
          align: "start",
        },
      },
      {
        element: "#tour-me-add-btn",
        popover: {
          title: "Registrar evaluación",
          description:
            "Haz clic aquí para registrar una nueva evaluación. Podrás definir un título, el tipo (Quiz, Evaluación o Taller) y sus preguntas.",
          side: "bottom",
          align: "end",
        },
      },
      {
        element: "#tour-me-table",
        popover: {
          title: "Tabla de evaluaciones",
          description:
            "Aquí se listan todas las evaluaciones registradas. Usa el botón de lápiz en cada fila para editar la evaluación.",
          side: "top",
          align: "start",
        },
      },
    ],
  });

  driverObj.drive();
};

export default tourManageEval;