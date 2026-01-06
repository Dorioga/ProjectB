/**
 * Ejemplo de "boletín de notas" para 1 solo estudiante.
 * - Toma como base 1 registro típico de `studentsResponse`.
 * - Usa la misma estructura de `recordResponse` como plantilla de evaluaciones.
 *
 * Ajusta/renombra keys para que coincidan 1:1 con tu modelo real.
 */

export const reportCardResponse = {
  report: {
    year: 2025,
    period: 4,
    generatedAt: "2025-12-26T00:00:00.000Z",
    school: {
      name: "CENTRO DE CAPACITACION ESPECIAL CENCAES",
      headerLines: [
        "RESOLUCION Nº 1641 de 19 de octubre de 2000 expedida por el MEN",
        "NUCLEO EDUCATIVO Nº 22 REGISTRO DANE Nº 308758004087. NIT. 900163488-4",
        "Formando en valores para la excelencia, forjaremos al hombre del mañana.",
      ],
    },
    group: {
      journey: "MAÑANA",
      grade_scholar: "0",
      group_grade: "A",
    },
  },

  student: {
    id_student: 1,
    nui: "ALEKAB1368511966",
    per_id: "83866062",
    identificationType: "RC:REGISTRO CIVIL DE NACIMIENTO",
    identification: "1043482950",
    first_lastname: "CABALLERO",
    second_lastname: "VILLARREAL",
    first_name: "ALEXANDRA",
    second_name: "",
    genre: "FEMENINO",
    birthday: "2017-11-24",

    guardian: {
      tipo_documento_acudiente: "CC:CEDULA DE CIUDADANIA",
      numero_identificacion_acudiente: "123456789",
      nombre_acudiente: "Juan Perez",
      telefono_acudiente: "1234567890",
    },
  },

  subjects: [
    {
      codigo: "MAT01",
      nombre: "Matemáticas",
      ihs: 4,
      inas: 1,
      periodGrades: {
        p1: 3.5,
        p2: 3.6,
        p3: 3.5,
        p4: 3.8,
      },
      periodLevelings: {
        p1: 3.8,
        p2: null,
        p3: 3.9,
        p4: null,
      },
      finalGrade: 3.6,
      teacherComment: "Buen progreso. Reforzar ejercicios de razonamiento.",
    },
    {
      codigo: "LEN01",
      nombre: "Lengua Castellana",
      ihs: 4,
      inas: 0,
      periodGrades: {
        p1: 3.7,
        p2: 4.2,
        p3: 4.0,
        p4: 4.4,
      },
      periodLevelings: {
        p1: null,
        p2: 4.4,
        p3: null,
        p4: null,
      },
      finalGrade: 4.08,
      teacherComment: "Excelente comprensión lectora y participación.",
    },
    {
      codigo: "ING01",
      nombre: "Inglés",
      ihs: 2,
      inas: 2,
      periodGrades: {
        p1: 3.0,
        p2: 3.5,
        p3: 3.2,
        p4: 3.8,
      },
      periodLevelings: {
        p1: 3.4,
        p2: null,
        p3: 3.6,
        p4: null,
      },
      finalGrade: 3.38,
      teacherComment: "Mejorar vocabulario y práctica oral.",
    },
    {
      codigo: "CIE01",
      nombre: "Ciencias Naturales",
      ihs: 3,
      inas: 0,
      periodGrades: {
        p1: 4.0,
        p2: 4.1,
        p3: 4.3,
        p4: 4.2,
      },
      periodLevelings: {
        p1: null,
        p2: null,
        p3: null,
        p4: null,
      },
      finalGrade: 4.15,
      teacherComment: "Buen desempeño; fortalecer lectura de gráficos.",
    },
    {
      codigo: "SOC01",
      nombre: "Ciencias Sociales",
      ihs: 3,
      inas: 1,
      periodGrades: {
        p1: 4.1,
        p2: 4.3,
        p3: 4.0,
        p4: 4.5,
      },
      periodLevelings: {
        p1: null,
        p2: null,
        p3: 4.2,
        p4: null,
      },
      finalGrade: 4.23,
      teacherComment: "Participa activamente; mejorar citación de fuentes.",
    },
    {
      codigo: "EDF01",
      nombre: "Educación Física",
      ihs: 2,
      inas: 0,
      periodGrades: {
        p1: 4.7,
        p2: 4.6,
        p3: 4.8,
        p4: 4.7,
      },
      periodLevelings: {
        p1: null,
        p2: null,
        p3: null,
        p4: null,
      },
      finalGrade: 4.7,
      teacherComment: "Excelente actitud y constancia.",
    },
    {
      codigo: "ART01",
      nombre: "Educación Artística",
      ihs: 2,
      inas: 0,
      periodGrades: {
        p1: 4.5,
        p2: 4.8,
        p3: 4.7,
        p4: 4.9,
      },
      periodLevelings: {
        p1: null,
        p2: null,
        p3: null,
        p4: null,
      },
      finalGrade: 4.73,
      teacherComment: "Muy creativo(a); excelente presentación.",
    },
    {
      codigo: "TEC01",
      nombre: "Tecnología e Informática",
      ihs: 2,
      inas: 1,
      periodGrades: {
        p1: 4.0,
        p2: 4.2,
        p3: 4.1,
        p4: 4.4,
      },
      periodLevelings: {
        p1: null,
        p2: null,
        p3: null,
        p4: 4.6,
      },
      finalGrade: 4.18,
      teacherComment: "Buen manejo; practicar atajos y organización.",
    },
  ],

  summary: {
    finalAverage: 4.13,
    generalObservation: "Estudiante con desempeño general sobresaliente.",
  },
};

export default reportCardResponse;
