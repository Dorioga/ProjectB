import { driver } from "driver.js";
import "driver.js/dist/driver.css";

const tourControlNotas = () => {
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
        element: "#tour-cn-header",
        popover: {
          title: "Control de Notas",
          description:
            "Aquí puedes monitorear el estado de las notas creadas y asignadas en la institución. Selecciona la sede y el período para cargar la información.",
          side: "bottom",
          align: "start",
        },
      },
      {
        element: "#tour-cn-sede",
        popover: {
          title: "Filtro: Sede",
          description:
            "Selecciona la sede de la cual deseas ver el control de notas.",
          side: "bottom",
          align: "start",
        },
      },
      {
        element: "#tour-cn-periodo",
        popover: {
          title: "Filtro: Período",
          description:
            "Selecciona el período académico. Una vez que ambos filtros estén seleccionados, los datos se cargarán automáticamente.",
          side: "bottom",
          align: "start",
        },
      },
      {
        element: "#tour-cn-tab-create",
        popover: {
          title: "Pestaña: Registro Notas Creadas",
          description:
            "Muestra el listado de notas (evaluaciones) que han sido creadas por cada docente, agrupadas por docente.",
          side: "bottom",
          align: "start",
        },
      },
      {
        element: "#tour-cn-tab-assign",
        popover: {
          title: "Pestaña: Registro Notas Asignadas",
          description:
            "Muestra el resumen de notas asignadas a los estudiantes por docente, con el total de notas creadas y asignadas.",
          side: "bottom",
          align: "start",
        },
      },
      {
        element: "#tour-cn-table",
        popover: {
          title: "Tabla de resultados",
          description:
            "Los datos se muestran agrupados por docente. Haz clic en cada grupo para expandir o contraer el detalle.",
          side: "top",
          align: "start",
        },
      },
    ],
  });

  driverObj.drive();
};

export default tourControlNotas;
