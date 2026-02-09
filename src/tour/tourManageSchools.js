import { driver } from "driver.js";
import "driver.js/dist/driver.css";

const tourManageSchools = () => {
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
        element: "#tour-header",
        popover: {
          title: "Panel de instituciones",
          description:
            "Aquí se muestra el listado de todas las instituciones registradas en el sistema.",
          side: "bottom",
          align: "start",
        },
      },
      {
        element: "#tour-add-btn",
        popover: {
          title: "Agregar institución",
          description:
            "Haz clic en este botón para registrar una nueva institución. Se abrirá un formulario donde podrás ingresar todos los datos.",
          side: "bottom",
          align: "end",
        },
      },
      {
        element: "#tour-table",
        popover: {
          title: "Tabla de instituciones",
          description:
            "En esta tabla puedes ver todas las instituciones registradas. Usa las columnas para identificar cada una por su ID y nombre.",
          side: "top",
          align: "start",
        },
      },
      {
        element: "#tour-records-count",
        popover: {
          title: "Total de registros",
          description:
            "Aquí se muestra el número total de instituciones registradas en el sistema.",
          side: "top",
          align: "start",
        },
      },
    ],
  });

  driverObj.drive();
};

export default tourManageSchools;
