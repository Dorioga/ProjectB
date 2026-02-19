import { driver } from "driver.js";
import "driver.js/dist/driver.css";

const tourRegisterStudentRecords = () => {
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
        element: "#tour-filters-students",
        popover: {
          title: "Filtros de selección",
          description:
            "Selecciona la sede, el grado, la asignatura, la jornada y el período para ver y editar las notas de los estudiantes.",
          side: "bottom",
          align: "start",
        },
      },
      {
        element: "#tour-students-count",
        popover: {
          title: "Resumen de estudiantes",
          description:
            "Aquí verás cuántos estudiantes se muestran y cuántos registros están completos.",
          side: "bottom",
          align: "start",
        },
      },
      {
        element: "#tour-students-table",
        popover: {
          title: "Listado de estudiantes",
          description:
            "En esta tabla puedes editar las notas, agregar comentarios y asignar logros por estudiante.",
          side: "top",
          align: "start",
        },
      },
      {
        element: ".tour-grade-input",
        popover: {
          title: "Editar nota",
          description:
            "Introduce o modifica la nota del estudiante (formato 0.00 - 5.00).",
          side: "top",
          align: "center",
        },
      },
      {
        element: ".tour-tipo-logro",
        popover: {
          title: "Tipo de logro",
          description:
            "Selecciona el tipo de logro para filtrar los logros disponibles.",
          side: "left",
          align: "start",
        },
      },
      {
        element: ".tour-select-logro",
        popover: {
          title: "Seleccionar logro",
          description:
            "Elige un logro para adjuntar como comentario a la nota del estudiante.",
          side: "left",
          align: "start",
        },
      },
      {
        element: ".tour-edit-row",
        popover: {
          title: "Editar fila",
          description:
            "Activa la edición de la fila para cambiar varias notas o comentarios antes de guardar.",
          side: "left",
          align: "center",
        },
      },
      {
        element: ".tour-save-row",
        popover: {
          title: "Guardar por fila",
          description:
            "Usa este botón para guardar las notas del estudiante seleccionado. El botón cambia a un icono de verificación cuando la fila se ha guardado.",
          side: "left",
          align: "center",
        },
      },
    ],
  });

  driverObj.drive();
};

export default tourRegisterStudentRecords;
