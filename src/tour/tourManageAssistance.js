import { driver } from "driver.js";
import "driver.js/dist/driver.css";

const tourManageAssistance = () => {
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
        element: "#tour-masst-header",
        popover: {
          title: "Gestión de Asistencias",
          description:
            "Aquí puedes consultar y registrar las asistencias de los estudiantes. Completa los filtros para ver las asistencias del período deseado.",
          side: "bottom",
          align: "start",
        },
      },
      {
        element: "#tour-masst-add-btn",
        popover: {
          title: "Registrar asistencia",
          description:
            "Haz clic aquí para registrar nuevas asistencias de un grupo de estudiantes.",
          side: "bottom",
          align: "end",
        },
      },
      {
        element: "#tour-masst-date-start",
        popover: {
          title: "Fecha inicio",
          description:
            "Selecciona la fecha de inicio del rango de consulta. Por defecto se usa el primer día del mes actual.",
          side: "bottom",
          align: "start",
        },
      },
      {
        element: "#tour-masst-date-end",
        popover: {
          title: "Fecha fin",
          description:
            "Selecciona la fecha de fin del rango de consulta. Por defecto se usa el último día del mes actual.",
          side: "bottom",
          align: "start",
        },
      },
      {
        element: "#tour-masst-sede",
        popover: {
          title: "Filtro: Sede",
          description:
            "Selecciona la sede para filtrar las asistencias. Los docentes ven solo sus sedes asignadas.",
          side: "bottom",
          align: "start",
        },
      },
      {
        element: "#tour-masst-grade",
        popover: {
          title: "Filtro: Grado",
          description:
            "Selecciona el grado para filtrar las asistencias. La lista se actualiza según la sede seleccionada.",
          side: "bottom",
          align: "start",
        },
      },
      {
        element: "#tour-masst-period",
        popover: {
          title: "Filtro: Período",
          description:
            "Selecciona el período académico para el cual deseas consultar las asistencias.",
          side: "bottom",
          align: "start",
        },
      },
      {
        element: "#tour-masst-table",
        popover: {
          title: "Tabla de asistencias",
          description:
            "Aquí se muestran las asistencias registradas. Puedes ver el estudiante, asignatura, grado, fecha y si estuvo presente (verde = Sí, rojo = No).",
          side: "top",
          align: "start",
        },
      },
    ],
  });

  driverObj.drive();
};

export default tourManageAssistance;
