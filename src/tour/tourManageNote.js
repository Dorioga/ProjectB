import { driver } from "driver.js";
import "driver.js/dist/driver.css";

const tourManageNote = () => {
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
        element: "#tour-mn-header",
        popover: {
          title: "Gestión de Notas",
          description:
            "Aquí puedes administrar las notas y calificaciones. Completa los filtros en cascada para ver las notas de cada asignatura y período.",
          side: "bottom",
          align: "start",
        },
      },
      {
        element: "#tour-mn-add-btn",
        popover: {
          title: "Registrar nota",
          description:
            "Haz clic para registrar una nueva nota o tipo de evaluación (por ejemplo: parcial, taller, quizz).",
          side: "bottom",
          align: "end",
        },
      },
      {
        element: "#tour-mn-assign-btn",
        popover: {
          title: "Asignar notas",
          description:
            "Usa este botón para asignar calificaciones a los estudiantes en las notas ya registradas.",
          side: "bottom",
          align: "end",
        },
      },
      {
        element: "#tour-mn-sede",
        popover: {
          title: "Filtro: Sede",
          description: "Selecciona la sede. Es el primer filtro de la cascada.",
          side: "bottom",
          align: "start",
        },
      },
      {
        element: "#tour-mn-grade",
        popover: {
          title: "Filtro: Grado",
          description:
            "Selecciona el grado. La lista se actualiza según la sede seleccionada.",
          side: "bottom",
          align: "start",
        },
      },
      {
        element: "#tour-mn-asignature",
        popover: {
          title: "Filtro: Asignatura",
          description:
            "Selecciona la asignatura para la cual deseas ver o gestionar las notas.",
          side: "bottom",
          align: "start",
        },
      },
      {
        element: "#tour-mn-jornada",
        popover: {
          title: "Filtro: Jornada",
          description:
            "La jornada se detecta automáticamente al seleccionar la asignatura. Puedes ajustarla manualmente si es necesario.",
          side: "bottom",
          align: "start",
        },
      },
      {
        element: "#tour-mn-period",
        popover: {
          title: "Filtro: Período",
          description:
            "Selecciona el período académico. Al completar todos los filtros, la tabla se cargará automáticamente.",
          side: "bottom",
          align: "start",
        },
      },
      {
        element: "#tour-mn-table",
        popover: {
          title: "Tabla de notas",
          description:
            "Aquí se listan las notas registradas para la asignatura y período seleccionados. Muestra el nombre, porcentaje, logro asociado y estado.",
          side: "top",
          align: "start",
        },
      },
    ],
  });

  driverObj.drive();
};

export default tourManageNote;
