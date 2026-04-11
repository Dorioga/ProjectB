import { driver } from "driver.js";
import "driver.js/dist/driver.css";

const tourManageAsignature = () => {
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
        element: "#tour-ma-header",
        popover: {
          title: "Gestión de Asignaturas",
          description:
            "Aquí puedes administrar todas las asignaturas de la institución. Filtra por sede y jornada para ver las asignaturas disponibles.",
          side: "bottom",
          align: "start",
        },
      },
      {
        element: "#tour-ma-add-btn",
        popover: {
          title: "Registrar asignatura",
          description:
            "Haz clic aquí para registrar una nueva asignatura. Se abrirá un formulario donde podrás ingresar el nombre, código, descripción y los grados asociados.",
          side: "bottom",
          align: "end",
        },
      },
      {
        element: "#tour-ma-sede",
        popover: {
          title: "Filtro: Sede",
          description:
            "Selecciona la sede para filtrar las asignaturas. La sede determina qué jornadas están disponibles.",
          side: "bottom",
          align: "start",
        },
      },
      {
        element: "#tour-ma-jornada",
        popover: {
          title: "Filtro: Jornada",
          description:
            "Selecciona la jornada (mañana, tarde o ambas). Si la sede tiene una sola jornada, se seleccionará automáticamente.",
          side: "bottom",
          align: "start",
        },
      },
      {
        element: "#tour-ma-table",
        popover: {
          title: "Tabla de asignaturas",
          description:
            "Aquí se listan todas las asignaturas de la sede y jornada seleccionadas. Puedes ver el nombre, código, descripción, estado y grados. Usa el botón de lápiz en cada fila para editar.",
          side: "top",
          align: "start",
        },
      },
    ],
  });

  driverObj.drive();
};

export default tourManageAsignature;
