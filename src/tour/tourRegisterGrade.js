import { driver } from "driver.js";
import "driver.js/dist/driver.css";

const tourRegisterGrade = () => {
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
        element: "#tour-grade-name",
        popover: {
          title: "Nombre del grado",
          description:
            "Escribe el nombre del grado que deseas registrar, por ejemplo: 6°, 7°, 10°.",
          side: "bottom",
          align: "start",
        },
      },
      {
        element: "#tour-grade-sede",
        popover: {
          title: "Seleccionar sede",
          description:
            "Elige la sede donde se creará este grado. Al cambiar la sede se actualizará la jornada disponible.",
          side: "bottom",
          align: "start",
        },
      },
      {
        element: "#tour-grade-workday",
        popover: {
          title: "Seleccionar jornada",
          description:
            "Selecciona la jornada (mañana, tarde) en la que estará disponible este grado.",
          side: "bottom",
          align: "start",
        },
      },
      {
        element: "#tour-grade-numgroups",
        popover: {
          title: "Cantidad de grupos",
          description:
            "Indica cuántos grupos tendrá este grado (máximo 26). Se generarán campos para nombrar cada grupo.",
          side: "bottom",
          align: "start",
        },
      },
      {
        element: "#tour-grade-groups",
        popover: {
          title: "Grupos a crear",
          description:
            "Asigna un nombre a cada grupo del grado, por ejemplo: A, B, C. Todos los grupos deben tener nombre.",
          side: "top",
          align: "start",
        },
      },
      {
        element: "#tour-grade-submit",
        popover: {
          title: "Registrar grado",
          description:
            "Una vez hayas completado todos los campos, haz clic aquí para guardar el nuevo grado.",
          side: "top",
          align: "center",
        },
      },
    ],
  });

  driverObj.drive();
};

export default tourRegisterGrade;
