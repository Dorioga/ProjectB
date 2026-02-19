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
        element: "#tour-grade",
        popover: {
          title: "Selector de grado",
          description:
            "Selecciona el grado para filtrar las asignaturas disponibles.",
          side: "bottom",
          align: "start",
        },
      },
      {
        element: "#tour-asignature",
        popover: {
          title: "Selector de asignatura",
          description:
            "Selecciona la asignatura para la cual crearás las notas.",
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
        element: ".tour-note-name",
        popover: {
          title: "Nombre de la nota",
          description:
            "Asigna un nombre descriptivo (ej. Parcial 1) para identificar la nota.",
          side: "right",
          align: "center",
        },
      },
      {
        element: ".tour-note-porcentual",
        popover: {
          title: "Porcentual",
          description:
            "Define qué porcentaje del período representa esta nota.",
          side: "right",
          align: "center",
        },
      },
      {
        element: ".tour-note-lock",
        popover: {
          title: "Fijar porcentaje",
          description:
            "Marca 'Fijar' para evitar que el porcentaje se redistribuya automáticamente.",
          side: "right",
          align: "center",
        },
      },
      {
        element: ".tour-note-goal",
        popover: {
          title: "Logros",
          description:
            "Agrega los logros asociados a esta nota para que aparezcan en los reportes.",
          side: "right",
          align: "center",
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
