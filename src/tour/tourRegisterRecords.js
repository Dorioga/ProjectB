import { driver } from "driver.js";
import "driver.js/dist/driver.css";

const tourRegisterRecords = () => {
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
        element: "#tour-filters",
        popover: {
          title: "Filtros de selección",
          description:
            "Primero selecciona la sede, el grado, la asignatura, la jornada y el período para habilitar el registro de notas.",
          side: "bottom",
          align: "start",
        },
      },
      {
        element: "#tour-num-records",
        popover: {
          title: "Cantidad de notas",
          description:
            "Indica cuántas notas deseas registrar. Se habilitará una vez selecciones sede, asignatura y período.",
          side: "bottom",
          align: "start",
        },
      },
      {
        element: "#tour-final-test",
        popover: {
          title: "Examen final",
          description:
            "Activa esta opción si deseas incluir un examen final con un peso del 20%. El porcentaje restante se distribuirá entre las demás notas.",
          side: "bottom",
          align: "start",
        },
      },
      {
        element: "#tour-records-list",
        popover: {
          title: "Listado de notas",
          description:
            "Aquí aparecerán las notas a registrar. Para cada una podrás asignar un nombre, porcentaje y logros. Puedes fijar el porcentaje de una nota para que no se redistribuya automáticamente.",
          side: "top",
          align: "start",
        },
      },
      {
        element: "#tour-submit",
        popover: {
          title: "Registrar notas",
          description:
            "Cuando hayas completado todas las notas, haz clic aquí para guardarlas.",
          side: "top",
          align: "center",
        },
      },
    ],
  });

  driverObj.drive();
};

export default tourRegisterRecords;
