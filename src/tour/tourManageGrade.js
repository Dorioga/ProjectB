import { driver } from "driver.js";
import "driver.js/dist/driver.css";

const tourManageGrade = () => {
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
        element: "#tour-mg-header",
        popover: {
          title: "Gestión de Grados",
          description:
            "Aquí puedes administrar todos los grados de la institución. Filtra por sede y jornada para ver los grados disponibles.",
          side: "bottom",
          align: "start",
        },
      },
      {
        element: "#tour-mg-add-btn",
        popover: {
          title: "Registrar grado",
          description:
            "Haz clic aquí para registrar un nuevo grado. Podrás definir el nombre, grupo y jornada.",
          side: "bottom",
          align: "end",
        },
      },
      {
        element: "#tour-mg-sede",
        popover: {
          title: "Filtro: Sede",
          description:
            "Selecciona la sede para filtrar los grados. La sede determina qué jornadas están disponibles.",
          side: "bottom",
          align: "start",
        },
      },
      {
        element: "#tour-mg-jornada",
        popover: {
          title: "Filtro: Jornada",
          description:
            "Selecciona la jornada. Si la sede tiene una sola jornada, se seleccionará automáticamente.",
          side: "bottom",
          align: "start",
        },
      },
      {
        element: "#tour-mg-table",
        popover: {
          title: "Tabla de grados",
          description:
            "Aquí se listan todos los grados de la sede y jornada seleccionadas. Puedes ver el nombre, grupo, estado y jornada. Usa el botón de lápiz en cada fila para editar el grado.",
          side: "top",
          align: "start",
        },
      },
    ],
  });

  driverObj.drive();
};

export default tourManageGrade;
