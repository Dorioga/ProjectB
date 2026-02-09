import { driver } from "driver.js";
import "driver.js/dist/driver.css";

const tourRegisterTeacher = () => {
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
        element: "#tour-sede",
        popover: {
          title: "Seleccionar sede",
          description:
            "Elige la sede a la que pertenecerá el docente. Esto determinará las jornadas y asignaturas disponibles.",
          side: "bottom",
          align: "start",
        },
      },
      {
        element: "#tour-workday",
        popover: {
          title: "Seleccionar jornada",
          description:
            "Selecciona la jornada en la que trabajará el docente (mañana, tarde o ambas).",
          side: "bottom",
          align: "start",
        },
      },
      {
        element: "#tour-doctype",
        popover: {
          title: "Tipo de documento",
          description:
            "Selecciona el tipo de documento de identidad del docente (CC, TI, CE, etc.).",
          side: "bottom",
          align: "start",
        },
      },
      {
        element: "#tour-identification",
        popover: {
          title: "Número de identificación",
          description: "Ingresa el número de documento del docente.",
          side: "bottom",
          align: "start",
        },
      },
      {
        element: "#tour-birthdate",
        popover: {
          title: "Fecha de nacimiento",
          description: "Selecciona la fecha de nacimiento del docente.",
          side: "bottom",
          align: "start",
        },
      },
      {
        element: "#tour-firstname",
        popover: {
          title: "Primer nombre",
          description:
            "Escribe el primer nombre del docente. Este campo es obligatorio.",
          side: "bottom",
          align: "start",
        },
      },
      {
        element: "#tour-secondname",
        popover: {
          title: "Segundo nombre",
          description: "Escribe el segundo nombre del docente (opcional).",
          side: "bottom",
          align: "start",
        },
      },
      {
        element: "#tour-firstlastname",
        popover: {
          title: "Primer apellido",
          description:
            "Escribe el primer apellido del docente. Este campo es obligatorio.",
          side: "bottom",
          align: "start",
        },
      },
      {
        element: "#tour-secondlastname",
        popover: {
          title: "Segundo apellido",
          description: "Escribe el segundo apellido del docente (opcional).",
          side: "bottom",
          align: "start",
        },
      },
      {
        element: "#tour-contact-info",
        popover: {
          title: "Información de contacto",
          description:
            "Aquí puedes ingresar teléfono, correo, contraseña y dirección del docente.",
          side: "top",
          align: "start",
        },
      },
      {
        element: "#tour-asignatures",
        popover: {
          title: "Asignaturas y grados",
          description:
            "Asigna las materias y grados que impartirá el docente. Debes agregar al menos una asignatura.",
          side: "top",
          align: "start",
        },
      },
      {
        element: "#tour-submit",
        popover: {
          title: "Registrar docente",
          description:
            "Una vez completados todos los campos, haz clic aquí para guardar el nuevo docente.",
          side: "top",
          align: "center",
        },
      },
    ],
  });

  driverObj.drive();
};

export default tourRegisterTeacher;
