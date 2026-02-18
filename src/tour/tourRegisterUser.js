import { driver } from "driver.js";
import "driver.js/dist/driver.css";

const tourRegisterUser = () => {
  const steps = [
    {
      element: "#tour-doctype",
      popover: {
        title: "Tipo de documento",
        description:
          "Selecciona el tipo de documento de identidad del usuario.",
        side: "bottom",
        align: "start",
      },
    },
    {
      element: "#tour-identification",
      popover: {
        title: "Número de identificación",
        description: "Ingresa el número de documento del usuario.",
        side: "bottom",
        align: "start",
      },
    },
    {
      element: "#tour-email",
      popover: {
        title: "Correo",
        description:
          "Correo electrónico del usuario (se usará para el acceso).",
        side: "bottom",
        align: "start",
      },
    },
    {
      element: "#tour-firstname",
      popover: {
        title: "Primer nombre",
        description: "Escribe el primer nombre del usuario (obligatorio).",
        side: "bottom",
        align: "start",
      },
    },
    {
      element: "#tour-firstlastname",
      popover: {
        title: "Primer apellido",
        description: "Escribe el primer apellido del usuario (obligatorio).",
        side: "bottom",
        align: "start",
      },
    },
    {
      element: "#tour-telephone",
      popover: {
        title: "Teléfono",
        description: "Número telefónico de contacto (opcional).",
        side: "bottom",
        align: "start",
      },
    },
    {
      element: "#tour-password",
      popover: {
        title: "Contraseña",
        description: "Establece una contraseña segura (mínimo 6 caracteres).",
        side: "bottom",
        align: "start",
      },
    },
    {
      element: "#tour-role",
      popover: {
        title: "Rol",
        description:
          "Selecciona el rol (estudiante, docente, administrador, etc.).",
        side: "bottom",
        align: "start",
      },
    },
  ];

  // La select de institución puede no estar visible según el rol; añadir el paso solo si existe
  if (document.getElementById("tour-institution")) {
    steps.push({
      element: "#tour-institution",
      popover: {
        title: "Institución",
        description:
          "Selecciona la institución a la que pertenecerá el usuario.",
        side: "bottom",
        align: "start",
      },
    });
  }

  // Paso final (submit)
  steps.push({
    element: "#tour-submit",
    popover: {
      title: "Registrar usuario",
      description:
        "Haz clic aquí para crear el usuario una vez completado el formulario.",
      side: "top",
      align: "center",
    },
  });

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
    steps,
  });

  driverObj.drive();
};

export default tourRegisterUser;
