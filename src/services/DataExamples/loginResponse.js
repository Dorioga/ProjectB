export const loginResponse = {
  token:
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c3VhcmlvIjp7Im5hbWUiOiJBRE1JTklTVFJBRE9SIn0sImlhdCI6MTc2MTk2NTcwNSwiZXhwIjoxNzY0NTU3NzA1fQ.3ldWvA4JNfhtbQGACCWJOVYmoEgbQ_qvBtT7h66TD2E",
  name: "Administrador",
  id_person: 8,
  id_school: 1,
  school_name: "Centro de Capacitación Especial CENCAES",
  img_logo: "/logo-school.svg", // Ruta al SVG en la carpeta public
  menu: [
    { option: "Inicio", link: "/dashboard/Home", icon: "/Home" },
    {
      option: "Ver estudiantes",
      link: "/dashboard/studentSchool",
      icon: "UserRoundSearch",
    },
    {
      option: "Perfil del estudiante",
      link: "/dashboard/singleStudent",
      icon: "SquareUser",
    },
    {
      option: "Registrar estudiante",
      link: "/dashboard/registerStudent",
      icon: "UserRoundPlus",
    },
    {
      option: "Registrar acudiente",
      link: "/dashboard/registerParents",
      icon: "UsersRound",
    },
    {
      option: "Registrar institución",
      link: "/dashboard/registerSchool",
      icon: "School",
    },
    {
      option: "Actualizar institución",
      link: "/dashboard/updateSchool",
      icon: "Pencil",
    },
    {
      option: "Buscar estudiantes",
      link: "/dashboard/searchStudents",
      icon: "UserRoundSearch",
    },
    { option: "Reportes", link: "/dashboard/reports", icon: "ClipboardPlus" },
    { option: "Auditoría", link: "/dashboard/auditory", icon: "BookOpenCheck" },
  ],
};
