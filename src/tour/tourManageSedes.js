import { driver } from "driver.js";
import "driver.js/dist/driver.css";

const tourManageSedes = () => {
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
        element: "#tour-ms-header",
        popover: {
          title: "Gestión de Sedes",
          description:
            "Aquí puedes administrar todas las sedes de la institución. Puedes ver, registrar y editar cada sede.",
          side: "bottom",
          align: "start",
        },
      },
      {
        element: "#tour-ms-add-btn",
        popover: {
          title: "Registrar sede",
          description:
            "Haz clic aquí para registrar una o varias sedes nuevas. Podrás configurar el nombre, dirección, teléfono y jornada de cada una.",
          side: "bottom",
          align: "end",
        },
      },
      {
        element: "#tour-ms-table",
        popover: {
          title: "Tabla de sedes",
          description:
            "Aquí se listan todas las sedes registradas. Usa el ícono de ojo para ver los detalles de una sede o el ícono de lápiz para editarla.",
          side: "top",
          align: "start",
        },
      },
    ],
  });

  driverObj.drive();
};

export default tourManageSedes;
