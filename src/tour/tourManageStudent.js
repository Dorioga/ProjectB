import { driver } from "driver.js";
import "driver.js/dist/driver.css";

const tourManageStudent = () => {
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
        element: "#tour-mst-header",
        popover: {
          title: "Gestión de Estudiantes",
          description:
            "Aquí puedes administrar todos los estudiantes de la institución. Tienes opciones para registrar individualmente, cargar masivamente desde Excel o subir PDFs.",
          side: "bottom",
          align: "start",
        },
      },
      {
        element: "#tour-mst-add-btn",
        popover: {
          title: "Registrar estudiante",
          description:
            "Haz clic aquí para registrar un nuevo estudiante de forma individual. Se abrirá el formulario completo de registro.",
          side: "bottom",
          align: "start",
        },
      },
      {
        element: "#tour-mst-bulk-excel",
        popover: {
          title: "Carga masiva (Excel)",
          description:
            "Usa este botón para registrar múltiples estudiantes a la vez subiendo un archivo Excel con los datos. Ideal para grandes grupos.",
          side: "bottom",
          align: "start",
        },
      },
      {
        element: "#tour-mst-bulk-pdf",
        popover: {
          title: "Subir PDF(s)",
          description:
            "Permite subir documentos PDF asociados a los estudiantes, como fichas de matrícula.",
          side: "bottom",
          align: "start",
        },
      },
      {
        element: "#tour-mst-table",
        popover: {
          title: "Tabla de estudiantes",
          description:
            "Aquí se listan todos los estudiantes registrados. Usa el ícono de usuario para ver el perfil completo o el ícono de lápiz para actualizar los datos del estudiante.",
          side: "top",
          align: "start",
        },
      },
    ],
  });

  driverObj.drive();
};

export default tourManageStudent;
