export const loginResponse = {
  token:
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c3VhcmlvIjp7Im5hbWUiOiJBRE1JTklTVFJBRE9SIn0sImlhdCI6MTc2MTk2NTcwNSwiZXhwIjoxNzY0NTU3NzA1fQ.3ldWvA4JNfhtbQGACCWJOVYmoEgbQ_qvBtT7h66TD2E",
  name: "ADMINISTRADOR",
  id_person: 8,
  id_school: 1,
  school_name: "CENTRO DE CAPACITACION ESPECIAL CENCAES",
  img_logo: "/logo-school.svg", // Ruta al SVG en la carpeta public
  menu: [
    { option: "Inicio", link: "/dashboard/Home", icon: "/Home" },
    {
      option: "Ver Estudiantes",
      link: "/dashboard/studentSchool",
      icon: "UserRoundSearch",
    },
    {
      option: "Perfil Estudiante",
      link: "/dashboard/singleStudent",
      icon: "SquareUser",
    },
    {
      option: "Registrar Estudiante",
      link: "/dashboard/registerStudent",
      icon: "UserRoundPlus",
    },
    {
      option: "Registrar Acudiente",
      link: "/dashboard/registerParents",
      icon: "UsersRound",
    },
    {
      option: "Registrar Institucion",
      link: "/dashboard/registerSchool",
      icon: "School",
    },
    {
      option: "Buscar Estudiantes",
      link: "/dashboard/searchStudents",
      icon: "UserRoundSearch",
    },
    {
      option: "Actualizar Institucion",
      link: "/dashboard/updateSchool",
      icon: "Pencil",
    },
    { option: "Reportes", link: "/dashboard/reports", icon: "ClipboardPlus" },
  ],
};
