import { driver } from "driver.js";
import "driver.js/dist/driver.css";

const tourReserveSpot = () => {
  const steps = [
    // ─── Sección: Estudiante ───
    {
      element: "#tour-rs-student-section",
      popover: {
        title: "Datos del estudiante",
        description:
          "Completa aquí los datos personales del estudiante que desea reservar el cupo.",
        side: "top",
        align: "start",
      },
    },
    {
      element: "#tour-rs-student-doctype",
      popover: {
        title: "Tipo de documento",
        description:
          "Selecciona el tipo de documento de identidad del estudiante.",
        side: "bottom",
        align: "start",
      },
    },
    {
      element: "#tour-rs-student-identification",
      popover: {
        title: "N.º de identificación",
        description:
          "Ingresa el número de documento del estudiante (obligatorio).",
        side: "bottom",
        align: "start",
      },
    },
    {
      element: "#tour-rs-student-nui",
      popover: {
        title: "NUI",
        description:
          "Número Único de Identificación del estudiante (si aplica).",
        side: "bottom",
        align: "start",
      },
    },
    {
      element: "#tour-rs-student-firstname",
      popover: {
        title: "Primer nombre",
        description: "Escribe el primer nombre del estudiante (obligatorio).",
        side: "bottom",
        align: "start",
      },
    },
    {
      element: "#tour-rs-student-secondname",
      popover: {
        title: "Segundo nombre",
        description: "Escribe el segundo nombre del estudiante (opcional).",
        side: "bottom",
        align: "start",
      },
    },
    {
      element: "#tour-rs-student-firstlastname",
      popover: {
        title: "Primer apellido",
        description: "Escribe el primer apellido del estudiante (obligatorio).",
        side: "bottom",
        align: "start",
      },
    },
    {
      element: "#tour-rs-student-secondlastname",
      popover: {
        title: "Segundo apellido",
        description: "Escribe el segundo apellido del estudiante (opcional).",
        side: "bottom",
        align: "start",
      },
    },
    {
      element: "#tour-rs-student-gender",
      popover: {
        title: "Género",
        description: "Selecciona el género del estudiante.",
        side: "bottom",
        align: "start",
      },
    },
    {
      element: "#tour-rs-student-birthdate",
      popover: {
        title: "Fecha de nacimiento",
        description: "Selecciona la fecha de nacimiento del estudiante.",
        side: "bottom",
        align: "start",
      },
    },
    {
      element: "#tour-rs-student-telephone",
      popover: {
        title: "Teléfono",
        description: "Número de contacto del estudiante (opcional).",
        side: "bottom",
        align: "start",
      },
    },
    {
      element: "#tour-rs-student-email",
      popover: {
        title: "Email",
        description: "Correo electrónico del estudiante (opcional).",
        side: "bottom",
        align: "start",
      },
    },
    {
      element: "#tour-rs-student-address",
      popover: {
        title: "Dirección",
        description: "Dirección de residencia del estudiante.",
        side: "bottom",
        align: "start",
      },
    },

    // ─── Sección: Madre ───
    {
      element: "#tour-rs-mother-section",
      popover: {
        title: "Datos de la madre",
        description:
          "Completa los datos de la madre del estudiante. Marca el checkbox si es el acudiente principal.",
        side: "top",
        align: "start",
      },
    },
    {
      element: "#tour-rs-mother-primary",
      popover: {
        title: "Acudiente principal",
        description:
          "Activa esta casilla si la madre es el acudiente principal responsable del estudiante.",
        side: "left",
        align: "center",
      },
    },
    {
      element: "#tour-rs-mother-doctype",
      popover: {
        title: "Tipo de documento (madre)",
        description:
          "Selecciona el tipo de documento de identidad de la madre.",
        side: "bottom",
        align: "start",
      },
    },
    {
      element: "#tour-rs-mother-identification",
      popover: {
        title: "N.º de identificación (madre)",
        description: "Ingresa el número de documento de la madre.",
        side: "bottom",
        align: "start",
      },
    },
    {
      element: "#tour-rs-mother-firstname",
      popover: {
        title: "Primer nombre (madre)",
        description: "Primer nombre de la madre.",
        side: "bottom",
        align: "start",
      },
    },
    {
      element: "#tour-rs-mother-firstlastname",
      popover: {
        title: "Primer apellido (madre)",
        description: "Primer apellido de la madre.",
        side: "bottom",
        align: "start",
      },
    },
    {
      element: "#tour-rs-mother-telephone",
      popover: {
        title: "Teléfono (madre)",
        description: "Número de contacto de la madre.",
        side: "bottom",
        align: "start",
      },
    },

    // ─── Sección: Padre ───
    {
      element: "#tour-rs-father-section",
      popover: {
        title: "Datos del padre",
        description:
          "Completa los datos del padre del estudiante. Marca el checkbox si es el acudiente principal.",
        side: "top",
        align: "start",
      },
    },
    {
      element: "#tour-rs-father-primary",
      popover: {
        title: "Acudiente principal",
        description:
          "Activa esta casilla si el padre es el acudiente principal responsable del estudiante.",
        side: "left",
        align: "center",
      },
    },
    {
      element: "#tour-rs-father-doctype",
      popover: {
        title: "Tipo de documento (padre)",
        description: "Selecciona el tipo de documento de identidad del padre.",
        side: "bottom",
        align: "start",
      },
    },
    {
      element: "#tour-rs-father-identification",
      popover: {
        title: "N.º de identificación (padre)",
        description: "Ingresa el número de documento del padre.",
        side: "bottom",
        align: "start",
      },
    },
    {
      element: "#tour-rs-father-firstname",
      popover: {
        title: "Primer nombre (padre)",
        description: "Primer nombre del padre.",
        side: "bottom",
        align: "start",
      },
    },
    {
      element: "#tour-rs-father-firstlastname",
      popover: {
        title: "Primer apellido (padre)",
        description: "Primer apellido del padre.",
        side: "bottom",
        align: "start",
      },
    },
    {
      element: "#tour-rs-father-telephone",
      popover: {
        title: "Teléfono (padre)",
        description: "Número de contacto del padre.",
        side: "bottom",
        align: "start",
      },
    },

    // ─── Sección: Firma ───
    {
      element: "#tour-rs-signature-section",
      popover: {
        title: "Firma del acudiente",
        description:
          "Dibuja la firma del acudiente principal en este recuadro antes de enviar la reserva.",
        side: "top",
        align: "start",
      },
    },

    // ─── Envío ───
    {
      element: "#tour-rs-submit",
      popover: {
        title: "Reservar cupo",
        description:
          "Haz clic aquí para enviar la solicitud de reserva una vez completado el formulario y guardada la firma.",
        side: "top",
        align: "center",
      },
    },
  ];

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

export default tourReserveSpot;
