import { driver } from "driver.js";
import "driver.js/dist/driver.css";

const tourRegisterStudent = () => {
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
        element: "#tour-rst-personal-section",
        popover: {
          title: "Información personal",
          description:
            "Completa aquí los datos de identidad y contacto del estudiante.",
          side: "bottom",
          align: "start",
        },
      },
      {
        element: "#tour-rst-doctype",
        popover: {
          title: "Tipo de documento",
          description:
            "Selecciona el tipo de documento de identidad del estudiante (CC, TI, CE, etc.).",
          side: "bottom",
          align: "start",
        },
      },
      {
        element: "#tour-rst-identification",
        popover: {
          title: "N.º de identificación",
          description:
            "Ingresa el número de documento del estudiante (obligatorio).",
          side: "bottom",
          align: "start",
        },
      },
      {
        element: "#tour-rst-nui",
        popover: {
          title: "NUI",
          description:
            "Número Único de Identificación del estudiante (opcional).",
          side: "bottom",
          align: "start",
        },
      },
      {
        element: "#tour-rst-firstname",
        popover: {
          title: "Primer nombre",
          description: "Escribe el primer nombre del estudiante (obligatorio).",
          side: "bottom",
          align: "start",
        },
      },
      {
        element: "#tour-rst-secondname",
        popover: {
          title: "Segundo nombre",
          description: "Escribe el segundo nombre del estudiante (opcional).",
          side: "bottom",
          align: "start",
        },
      },
      {
        element: "#tour-rst-firstlastname",
        popover: {
          title: "Primer apellido",
          description:
            "Escribe el primer apellido del estudiante (obligatorio).",
          side: "bottom",
          align: "start",
        },
      },
      {
        element: "#tour-rst-secondlastname",
        popover: {
          title: "Segundo apellido",
          description: "Escribe el segundo apellido del estudiante (opcional).",
          side: "bottom",
          align: "start",
        },
      },
      {
        element: "#tour-rst-gender",
        popover: {
          title: "Género",
          description: "Selecciona el género del estudiante (obligatorio).",
          side: "bottom",
          align: "start",
        },
      },
      {
        element: "#tour-rst-birthdate",
        popover: {
          title: "Fecha de nacimiento",
          description:
            "Selecciona la fecha de nacimiento del estudiante (obligatorio).",
          side: "bottom",
          align: "start",
        },
      },
      {
        element: "#tour-rst-telephone",
        popover: {
          title: "Teléfono",
          description: "Número de contacto del estudiante (obligatorio).",
          side: "bottom",
          align: "start",
        },
      },
      {
        element: "#tour-rst-email",
        popover: {
          title: "Correo electrónico",
          description: "Correo electrónico del estudiante (opcional).",
          side: "bottom",
          align: "start",
        },
      },
      {
        element: "#tour-rst-address",
        popover: {
          title: "Dirección",
          description: "Dirección de residencia del estudiante (opcional).",
          side: "bottom",
          align: "start",
        },
      },
      {
        element: "#tour-rst-password",
        popover: {
          title: "Contraseña",
          description:
            "Contraseña de acceso al sistema para el estudiante (obligatorio).",
          side: "bottom",
          align: "start",
        },
      },

      // ─── Información académica ───
      {
        element: "#tour-rst-academic-section",
        popover: {
          title: "Información académica",
          description: "Completa aquí los datos de matrícula del estudiante.",
          side: "bottom",
          align: "start",
        },
      },
      {
        element: "#tour-rst-sede",
        popover: {
          title: "Sede",
          description:
            "Selecciona la sede a la que pertenecerá el estudiante (obligatorio).",
          side: "bottom",
          align: "start",
        },
      },
      {
        element: "#tour-rst-workday",
        popover: {
          title: "Jornada",
          description:
            "Selecciona la jornada escolar del estudiante. Se habilita una vez elegida la sede (obligatorio).",
          side: "bottom",
          align: "start",
        },
      },
      {
        element: "#tour-rst-grade",
        popover: {
          title: "Grado",
          description:
            "Selecciona el grado al que ingresará el estudiante (obligatorio).",
          side: "bottom",
          align: "start",
        },
      },
      {
        element: "#tour-rst-beca",
        popover: {
          title: "Beca",
          description:
            "Selecciona el tipo de beca del estudiante si aplica (opcional).",
          side: "bottom",
          align: "start",
        },
      },
      {
        element: "#tour-rst-period",
        popover: {
          title: "Periodo de ingreso",
          description:
            "Selecciona el periodo académico en el que ingresa el estudiante (opcional).",
          side: "bottom",
          align: "start",
        },
      },
      {
        element: "#tour-rst-per-id",
        popover: {
          title: "PER ID",
          description: "Identificador interno del período (opcional).",
          side: "bottom",
          align: "start",
        },
      },

      // ─── Documentos y archivos ───
      {
        element: "#tour-rst-documents-section",
        popover: {
          title: "Documentos y archivos",
          description:
            "Adjunta aquí los documentos requeridos para el registro del estudiante.",
          side: "bottom",
          align: "start",
        },
      },
      {
        element: "#tour-rst-id-doc",
        popover: {
          title: "Documento de identificación",
          description:
            "Sube el documento de identificación del estudiante en formato PDF (obligatorio).",
          side: "top",
          align: "start",
        },
      },
      {
        element: "#tour-rst-piar",
        popover: {
          title: "PIAR",
          description:
            "Indica si el estudiante cuenta con Plan Individual de Ajustes Razonables. Si activas la casilla, adjunta el archivo en formato Excel (.xlsx).",
          side: "top",
          align: "start",
        },
      },

      // ─── Envío ───
      {
        element: "#tour-rst-submit",
        popover: {
          title: "Registrar estudiante",
          description:
            "Una vez completados todos los campos obligatorios, haz clic aquí para registrar al nuevo estudiante.",
          side: "top",
          align: "center",
        },
      },
    ],
  });

  driverObj.drive();
};

export default tourRegisterStudent;
