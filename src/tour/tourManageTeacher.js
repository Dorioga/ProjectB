import { driver } from "driver.js";
import "driver.js/dist/driver.css";

const tourManageTeacher = () => {
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
        element: "#tour-mt-header",
        popover: {
          title: "Gestión de Docentes",
          description:
            "Aquí puedes administrar todos los docentes de la institución. Puedes ver sus perfiles, asignaciones y actualizar su información.",
          side: "bottom",
          align: "start",
        },
      },
      {
        element: "#tour-mt-add-btn",
        popover: {
          title: "Registrar docente",
          description:
            "Haz clic aquí para registrar un nuevo docente en la institución. Podrás asignarle sede, jornada, asignaturas y grados.",
          side: "bottom",
          align: "end",
        },
      },
      {
        element: "#tour-mt-table",
        popover: {
          title: "Tabla de docentes",
          description:
            "Aquí se listan todos los docentes registrados con su nombre, sede, estado, grados asignados y asignaturas. Usa el ícono de usuario para ver el perfil completo o el ícono de lápiz para editar sus datos.",
          side: "top",
          align: "start",
        },
      },
    ],
  });

  driverObj.drive();
};

export default tourManageTeacher;
