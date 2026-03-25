import { driver } from "driver.js";
import "driver.js/dist/driver.css";

const tourRegisterParents = ({ searchStatus } = {}) => {
  // la primera etapa siempre debe mostrarse, el resto solo aparece
  // cuando el formulario completo está visible (searchStatus === 'found')
  const steps = [
    {
      element: "#tour-search-student",
      popover: {
        title: "Buscar estudiante",
        description:
          "Ingresa el número de identificación del estudiante y presiona 'Buscar' o la tecla Enter para vincularlo al acudiente.",
        side: "bottom",
        align: "start",
      },
    },
  ];

  if (searchStatus === "found") {
    steps.push(
      {
        element: "#tour-doctype",
        popover: {
          title: "Tipo de documento",
          description:
            "Selecciona el tipo de documento de identidad del acudiente (CC, TI, CE, etc.).",
          side: "bottom",
          align: "start",
        },
      },
      {
        element: "#tour-identification",
        popover: {
          title: "Número de identificación",
          description:
            "Ingresa el número de documento del acudiente. Debe tener al menos 5 caracteres.",
          side: "bottom",
          align: "start",
        },
      },
      {
        element: "#tour-firstname",
        popover: {
          title: "Primer nombre",
          description:
            "Escribe el primer nombre del acudiente. Este campo es obligatorio.",
          side: "bottom",
          align: "start",
        },
      },
      {
        element: "#tour-secondname",
        popover: {
          title: "Segundo nombre",
          description: "Escribe el segundo nombre del acudiente (opcional).",
          side: "bottom",
          align: "start",
        },
      },
      {
        element: "#tour-firstlastname",
        popover: {
          title: "Primer apellido",
          description:
            "Escribe el primer apellido del acudiente. Este campo es obligatorio.",
          side: "bottom",
          align: "start",
        },
      },
      {
        element: "#tour-secondlastname",
        popover: {
          title: "Segundo apellido",
          description: "Escribe el segundo apellido del acudiente (opcional).",
          side: "bottom",
          align: "start",
        },
      },
      {
        element: "#tour-telephone",
        popover: {
          title: "Teléfono",
          description:
            "Número telefónico de contacto del acudiente (entre 7 y 15 dígitos).",
          side: "bottom",
          align: "start",
        },
      },
      {
        element: "#tour-email",
        popover: {
          title: "Correo electrónico",
          description:
            "Correo electrónico del acudiente (opcional). Si se ingresa, debe tener un formato válido.",
          side: "bottom",
          align: "start",
        },
      },
      {
        element: "#tour-password",
        popover: {
          title: "Contraseña",
          description:
            "Establece una contraseña segura: mínimo 6 caracteres, al menos una mayúscula y un número.",
          side: "top",
          align: "start",
        },
      },
      {
        element: "#tour-submit",
        popover: {
          title: "Registrar acudiente",
          description:
            "Una vez completados todos los campos obligatorios, haz clic aquí para guardar el acudiente.",
          side: "top",
          align: "center",
        },
      },
    );
  }

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

export default tourRegisterParents;
