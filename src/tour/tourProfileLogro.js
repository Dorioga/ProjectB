import { driver } from "driver.js";
import "driver.js/dist/driver.css";

const tourProfileLogro = () => {
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
        element: "#tour-pl-sede",
        popover: {
          title: "Selecciona la sede",
          description:
            "Elige la sede que corresponde al logro. Esto influye en las opciones de grados y asignaturas.",
          side: "bottom",
          align: "start",
        },
      },
      {
        element: "#tour-pl-grade",
        popover: {
          title: "Selecciona el grado",
          description:
            "Selecciona el grado al que pertenece el logro. En modo docente, puede autoajustarse según la escuela seleccionada.",
          side: "bottom",
          align: "start",
        },
      },
      {
        element: "#tour-pl-asignature",
        popover: {
          title: "Selecciona la asignatura",
          description:
            "Elige la asignatura asociada al logro. Este campo ayuda a clasificar el logro por materia.",
          side: "bottom",
          align: "start",
        },
      },
      {
        element: "#tour-pl-workday",
        popover: {
          title: "Selecciona la jornada",
          description:
            "Indica la jornada escolar relacionada con el logro. Algunos combos pueden venir prefiltrados según la sede.",
          side: "bottom",
          align: "start",
        },
      },
      {
        element: "#tour-pl-period",
        popover: {
          title: "Selecciona el periodo",
          description:
            "Elige el periodo académico al que se refiere el logro (opcional).",
          side: "bottom",
          align: "start",
        },
      },
      {
        element: "#tour-pl-type",
        popover: {
          title: "Tipo de logro",
          description:
            "Selecciona el tipo de logro que describe mejor el resultado alcanzado.",
          side: "bottom",
          align: "start",
        },
      },
      {
        element: "#tour-pl-description",
        popover: {
          title: "Descripción del logro",
          description:
            "Escribe una descripción clara para el logro. Este campo es obligatorio.",
          side: "bottom",
          align: "start",
        },
      },
      {
        element: "#tour-pl-submit",
        popover: {
          title: "Guardar logro",
          description:
            "Cuando el formulario esté completo, haz clic aquí para agregar o actualizar el logro.",
          side: "top",
          align: "center",
        },
      },
    ],
  });

  driverObj.drive();
};

export default tourProfileLogro;
