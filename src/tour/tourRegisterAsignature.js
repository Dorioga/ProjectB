import { driver } from "driver.js";
import "driver.js/dist/driver.css";

const tourRegisterAsignature = () => {
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
        element: "#tour-name",
        popover: {
          title: "Nombre de la asignatura",
          description:
            "Escribe el nombre de la asignatura que deseas registrar, por ejemplo: Matemáticas, Español, Ciencias.",
          side: "bottom",
          align: "start",
        },
      },
      {
        element: "#tour-code",
        popover: {
          title: "Código de la asignatura",
          description:
            "Ingresa un código único para identificar la asignatura, por ejemplo: MAT-01, ESP-02.",
          side: "bottom",
          align: "start",
        },
      },
      {
        element: "#tour-description",
        popover: {
          title: "Descripción",
          description:
            "Agrega una breve descripción sobre el contenido o enfoque de la asignatura.",
          side: "bottom",
          align: "start",
        },
      },
      {
        element: "#tour-sede",
        popover: {
          title: "Seleccionar sede",
          description:
            "Elige la sede donde se impartirá esta asignatura. Al cambiar la sede se actualizarán las jornadas y grados disponibles.",
          side: "bottom",
          align: "start",
        },
      },
      {
        element: "#tour-jornada",
        popover: {
          title: "Seleccionar jornada",
          description:
            "Selecciona la jornada (mañana, tarde o ambas) en la que estará disponible la asignatura.",
          side: "bottom",
          align: "start",
        },
      },
      {
        element: "#tour-grades",
        popover: {
          title: "Grados donde se dictará",
          description:
            "Marca los grados en los que esta asignatura será impartida. Puedes seleccionar todos los grupos de un grado o elegir individualmente.",
          side: "top",
          align: "start",
        },
      },
      {
        element: "#tour-submit",
        popover: {
          title: "Registrar asignatura",
          description:
            "Una vez hayas completado todos los campos, haz clic en este botón para guardar la nueva asignatura.",
          side: "top",
          align: "center",
        },
      },
    ],
  });

  driverObj.drive();
};

export default tourRegisterAsignature;
