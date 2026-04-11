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
      // ─── Información personal ───
      {
        element: "#tour-sede",
        popover: {
          title: "Sede",
          description:
            "Selecciona la sede a la que pertenecerá el docente. Esto determina las jornadas disponibles.",
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
          title: "N.º de identificación",
          description:
            "Ingresa el número de documento del docente (obligatorio).",
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
          description: "Escribe el primer nombre del docente (obligatorio).",
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
          description: "Escribe el primer apellido del docente (obligatorio).",
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

      // ─── Información de contacto ───
      {
        element: "#tour-contact-info",
        popover: {
          title: "Información de contacto",
          description:
            "Completa aquí el teléfono, correo, contraseña y dirección del docente.",
          side: "top",
          align: "start",
        },
      },
      {
        element: "#tour-telephone",
        popover: {
          title: "Teléfono",
          description: "Número de contacto del docente (obligatorio).",
          side: "bottom",
          align: "start",
        },
      },
      {
        element: "#tour-email",
        popover: {
          title: "Correo electrónico",
          description:
            "Correo del docente (obligatorio). Se usará para iniciar sesión.",
          side: "bottom",
          align: "start",
        },
      },
      {
        element: "#tour-password",
        popover: {
          title: "Contraseña",
          description:
            "Opcional. Si la ingresas, debe tener al menos 8 caracteres y contener letras y números.",
          side: "bottom",
          align: "start",
        },
      },
      {
        element: "#tour-address",
        popover: {
          title: "Dirección",
          description: "Dirección de residencia del docente (opcional).",
          side: "bottom",
          align: "start",
        },
      },
      {
        element: "#tour-workday",
        popover: {
          title: "Jornada",
          description:
            "Selecciona la jornada en la que trabajará el docente. Se habilita una vez elegida la sede.",
          side: "bottom",
          align: "start",
        },
      },

      // ─── Asignaturas ───
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

      // ─── Director de curso ───
      {
        element: "#tour-director-section",
        popover: {
          title: "Director de curso",
          description:
            "Activa la casilla si el docente será director o representante de algún curso, y luego selecciona los grados correspondientes.",
          side: "top",
          align: "start",
        },
      },

      // ─── Envío ───
      {
        element: "#tour-submit",
        popover: {
          title: "Registrar docente",
          description:
            "Una vez completados todos los campos obligatorios, haz clic aquí para registrar al nuevo docente.",
          side: "top",
          align: "center",
        },
      },
    ],
  });

  driverObj.drive();
};

export default tourRegisterTeacher;
