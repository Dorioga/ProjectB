import { driver } from "driver.js";
import "driver.js/dist/driver.css";

const tourManageLogro = () => {
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
        element: "#tour-ml-header",
        popover: {
          title: "Gestión de Logros",
          description:
            "Aquí puedes administrar los logros académicos. Completa los filtros en cascada para ver y gestionar los logros de cada asignatura y período.",
          side: "bottom",
          align: "start",
        },
      },
      {
        element: "#tour-ml-add-btn",
        popover: {
          title: "Registrar logro",
          description:
            "Haz clic aquí para registrar un nuevo logro académico. Se abrirá el formulario con todos los campos necesarios.",
          side: "bottom",
          align: "end",
        },
      },
      {
        element: "#tour-ml-sede",
        popover: {
          title: "Filtro: Sede",
          description:
            "Selecciona la sede. Es el primer filtro de la cascada y determinará las opciones disponibles en los siguientes selectores.",
          side: "bottom",
          align: "start",
        },
      },
      {
        element: "#tour-ml-jornada",
        popover: {
          title: "Filtro: Jornada",
          description:
            "Selecciona la jornada académica. Si la sede tiene una sola jornada, se seleccionará automáticamente.",
          side: "bottom",
          align: "start",
        },
      },
      {
        element: "#tour-ml-asignature",
        popover: {
          title: "Filtro: Asignatura",
          description:
            "Selecciona la asignatura para la cual deseas ver los logros. La lista se actualiza según la sede y jornada seleccionadas.",
          side: "bottom",
          align: "start",
        },
      },
      {
        element: "#tour-ml-grade",
        popover: {
          title: "Filtro: Grado",
          description:
            "Selecciona el grado. Los docentes ven solo los grados donde tienen asignaciones.",
          side: "bottom",
          align: "start",
        },
      },
      {
        element: "#tour-ml-period",
        popover: {
          title: "Filtro: Período",
          description:
            "Selecciona el período académico para filtrar los logros.",
          side: "bottom",
          align: "start",
        },
      },
      {
        element: "#tour-ml-type",
        popover: {
          title: "Filtro: Tipo de logro",
          description:
            "Selecciona el tipo de logro (ser, hacer, conocer, etc.). Al completar todos los filtros, la tabla se cargará automáticamente.",
          side: "bottom",
          align: "start",
        },
      },
      {
        element: "#tour-ml-table",
        popover: {
          title: "Tabla de logros",
          description:
            "Aquí se listan los logros según los filtros aplicados. Puedes ver la descripción, asignatura, grado, período y tipo. Usa el botón de lápiz para editar un logro.",
          side: "top",
          align: "start",
        },
      },
    ],
  });

  driverObj.drive();
};

export default tourManageLogro;
