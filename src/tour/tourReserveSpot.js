import { driver } from "driver.js";
import "driver.js/dist/driver.css";

const tourReserveSpot = () => {
  const steps = [
    // â”€â”€â”€ SecciÃ³n: Filtro municipio â”€â”€â”€
    {
      element: "#tour-rs-filter-section",
      popover: {
        title: "Selecciona tu municipio",
        description:
          "Primero elige el departamento y el municipio donde se encuentra la institución. Esto cargará la lista de sedes disponibles.",
        side: "bottom",
        align: "start",
      },
    },

    // â”€â”€â”€ SecciÃ³n: Estudiante â”€â”€â”€
    {
      element: "#tour-rs-student-section",
      popover: {
        title: "Datos del estudiante",
        description:
          "Completa aquí los datos personales y de matrícula del estudiante que desea reservar el cupo.",
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

    // ───────────────────── Información de matrícula ─────────────────────
    {
      element: "#tour-rs-student-sede",
      popover: {
        title: "Sede",
        description:
          "Selecciona la sede a la que deseas inscribir al estudiante. Las opciones se cargan segú    n el municipio elegido.",
        side: "bottom",
        align: "start",
      },
    },
    {
      element: "#tour-rs-student-jornada",
      popover: {
        title: "Jornada",
        description:
          "Selecciona la jornada escolar (mañana o tarde). Disponible una vez elegida la sede.",
        side: "bottom",
        align: "start",
      },
    },
    {
      element: "#tour-rs-student-grado",
      popover: {
        title: "Grado",
        description:
          "Selecciona el grado al que aspira ingresar el estudiante. Disponible una vez elegidas la sede y la jornada.",
        side: "bottom",
        align: "start",
      },
    },

    // â”€â”€â”€ SecciÃ³n: Acudiente â”€â”€â”€
    {
      element: "#tour-rs-guardian-section",
      popover: {
        title: "Datos del acudiente",
        description:
          "Completa los datos del acudiente o responsable del estudiante.",
        side: "top",
        align: "start",
      },
    },
    {
      element: "#tour-rs-guardian-parentesco",
      popover: {
        title: "Parentesco",
        description:
          "Indica la relaciÃ³n del acudiente con el estudiante (madre, padre, abuelo, tutor, etc.).",
        side: "bottom",
        align: "start",
      },
    },
    {
      element: "#tour-rs-guardian-doctype",
      popover: {
        title: "Tipo de documento (acudiente)",
        description:
          "Selecciona el tipo de documento de identidad del acudiente.",
        side: "bottom",
        align: "start",
      },
    },
    {
      element: "#tour-rs-guardian-identification",
      popover: {
        title: "N.Âº de identificaciÃ³n (acudiente)",
        description: "Ingresa el nÃºmero de documento del acudiente.",
        side: "bottom",
        align: "start",
      },
    },
    {
      element: "#tour-rs-guardian-firstname",
      popover: {
        title: "Primer nombre (acudiente)",
        description: "Primer nombre del acudiente.",
        side: "bottom",
        align: "start",
      },
    },
    {
      element: "#tour-rs-guardian-firstlastname",
      popover: {
        title: "Primer apellido (acudiente)",
        description: "Primer apellido del acudiente.",
        side: "bottom",
        align: "start",
      },
    },
    {
      element: "#tour-rs-guardian-telephone",
      popover: {
        title: "TelÃ©fono (acudiente)",
        description: "NÃºmero de contacto del acudiente (obligatorio).",
        side: "bottom",
        align: "start",
      },
    },

    // â”€â”€â”€ SecciÃ³n: Firma â”€â”€â”€
    {
      element: "#tour-rs-signature-section",
      popover: {
        title: "Firma del acudiente",
        description:
          "Dibuja la firma del acudiente en el recuadro. Luego pulsa 'Guardar firma' para confirmarla antes de enviar la reserva.",
        side: "top",
        align: "start",
      },
    },

    // â”€â”€â”€ EnvÃ­o y PDF â”€â”€â”€
    {
      element: "#tour-rs-submit",
      popover: {
        title: "Reservar cupo",
        description:
          "Haz clic aquÃ­ para enviar la solicitud de reserva. El botÃ³n se activa una vez guardada la firma.",
        side: "top",
        align: "center",
      },
    },
    {
      element: "#tour-rs-pdf",
      popover: {
        title: "Descargar PDF",
        description:
          "Genera y descarga un comprobante en PDF con todos los datos de la reserva. Disponible cuando el formulario estÃ¡ completo y la firma guardada.",
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
