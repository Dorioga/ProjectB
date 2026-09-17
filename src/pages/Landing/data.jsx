import { Icon } from "./components/Icons";

export const conectadoSteps = [
  { icon: <Icon.QR />, label: "Ingreso QR" },
  { icon: <Icon.Check />, label: "Asistencia" },
  { icon: <Icon.ClipboardList />, label: "Evaluaciones" },
  { icon: <Icon.FileText />, label: "Boletín" },
  { icon: <Icon.Eye />, label: "Seguimiento" },
  { icon: <Icon.BarChart />, label: "Estadísticas" },
];

export const profilesData = [
  {
    icon: <Icon.Building />,
    title: "Administrador Institucional",
    features: [
      "Gestiona sedes",
      "Configura usuarios",
      "Controla toda la institución",
    ],
  },
  {
    icon: <Icon.Eye />,
    title: "Rector",
    features: ["Indicadores", "Reportes", "Seguimiento institucional"],
  },
  {
    icon: <Icon.Users />,
    title: "Coordinador",
    features: ["Control académico", "Fechas de corte", "Supervisión docente"],
  },
  {
    icon: <Icon.BookOpen />,
    title: "Docente",
    features: ["Notas", "Asistencia", "Evaluaciones automáticas"],
  },
  {
    icon: <Icon.ClipboardList />,
    title: "Observador",
    features: [
      "Registro de novedades",
      "Seguimiento disciplinario",
      "Historial",
    ],
  },
  {
    icon: <Icon.HeartPulse />,
    title: "Auditor",
    features: ["Casos", "Seguimiento", "Historial"],
  },
  {
    icon: <Icon.GraduationCap />,
    title: "Estudiante",
    features: ["Notas", "Boletines", "Recursos educativos"],
  },
  {
    icon: <Icon.UserCheck />,
    title: "Acudiente",
    features: ["Información de varios hijos", "Asistencia", "Evaluaciones"],
  },
];

export const modulesData = [
  {
    icon: <Icon.Building />,
    title: "Gestión Institucional",
    desc: "Sedes, usuarios, roles y configuración académica.",
  },
  {
    icon: <Icon.ClipboardList />,
    title: "Evaluación",
    desc: "Notas, logros, DBA, boletines y estadísticas.",
  },
  {
    icon: <Icon.QR />,
    title: "Control de Acceso",
    desc: "Carnet QR e ingreso automatizado.",
  },
  {
    icon: <Icon.Calendar />,
    title: "Asistencia",
    desc: "Registro diario, excusas y alertas.",
  },
  {
    icon: <Icon.FileText />,
    title: "Documentación",
    desc: "Habeas Data, fichas académicas y documentos.",
  },
  {
    icon: <Icon.MessageCircle />,
    title: "Comunicación",
    desc: "Información centralizada para docentes y acudientes.",
  },
  {
    icon: <Icon.MessageCircle />,
    title: "Énfasis",
    desc: "Acceso para los grados 10° y 11° a los énfasis.",
  },
  {
    icon: <Icon.MessageCircle />,
    title: "Logros y DBA",
    desc: "Gestión de logros y DBA por parte de la institución",
  },
  {
    icon: <Icon.MessageCircle />,
    title: "Observador",
    desc: "Registro, histórico y acceso al observador.",
  },
];

export const timelineSteps = [
  { icon: <Icon.Building />, label: "Configuración institucional", step: "01" },
  { icon: <Icon.Users />, label: "Matrícula", step: "02" },
  { icon: <Icon.Calendar />, label: "Asistencia", step: "03" },
  { icon: <Icon.ClipboardList />, label: "Notas", step: "04" },
  { icon: <Icon.ClipboardList />, label: "Evaluaciones", step: "05" },
  { icon: <Icon.FileText />, label: "Boletines", step: "06" },
  { icon: <Icon.BarChart />, label: "Seguimiento", step: "07" },
];

export const galleryItems = [
  {
    title: "Dashboard",
    subtitle: "Vista general institucional",
    bg: "from-blue-900 to-slate-900",
  },
  {
    title: "Boletín académico",
    subtitle: "Generación automática por período",
    bg: "from-emerald-900 to-slate-900",
  },
  {
    title: "Carnet con QR",
    subtitle: "Identificación y control de acceso",
    bg: "from-purple-900 to-slate-900",
  },
  {
    title: "Estadísticas",
    subtitle: "Análisis en tiempo real",
    bg: "from-orange-900 to-slate-900",
  },
];

export const tutorialesData = [
  { title: "Primeros pasos", duration: "4:32" },
  { title: "Registrar estudiantes", duration: "6:18" },
  { title: "Registrar docentes", duration: "5:45" },
  { title: "Crear grados", duration: "3:20" },
  { title: "Subir notas", duration: "7:10" },
  { title: "Tomar asistencia", duration: "4:55" },
  { title: "Crear evaluaciones", duration: "8:30" },
  { title: "Generar boletines", duration: "6:00" },
  { title: "Descargar carnet QR", duration: "2:45" },
];

export const tutorialColors = [
  "from-blue-800 to-blue-950",
  "from-emerald-800 to-emerald-950",
  "from-purple-800 to-purple-950",
  "from-orange-800 to-orange-950",
  "from-rose-800 to-rose-950",
  "from-teal-800 to-teal-950",
  "from-indigo-800 to-indigo-950",
  "from-amber-800 to-amber-950",
  "from-cyan-800 to-cyan-950",
];

export const recursosData = [
  {
    icon: <Icon.Book />,
    title: "Guías de implementación",
    desc: "Documentos paso a paso para configurar Nexus en tu institución desde el primer día.",
  },
  {
    icon: <Icon.FileText />,
    title: "Documentación para instituciones",
    desc: "Manuales técnicos, políticas de uso y requerimientos del sistema.",
  },
  {
    icon: <Icon.ClipboardList />,
    title: "Formatos de boletines",
    desc: "Plantillas prediseñadas listas para personalizar y usar con tu institución.",
  },
  {
    icon: <Icon.HelpCircle />,
    title: "Centro de ayuda",
    desc: "Respuestas a las dudas más comunes y soporte técnico especializado.",
  },
];

export const faqData = [
  {
    q: "¿Qué información necesito para empezar?",
    a: "Solo necesitas los datos básicos de tu institución: nombre, NIT, sedes, grados y los correos de los administradores. El proceso de configuración inicial toma menos de una hora.",
  },
  {
    q: "¿Debo instalar algún programa?",
    a: "No. Nexus es 100% en la nube. Solo necesitas un navegador web actualizado como Chrome, Firefox o Edge. No se requieren instalaciones adicionales.",
  },
  {
    q: "¿Funciona desde celular?",
    a: "Sí. Nexus tiene diseño completamente responsive y funciona desde cualquier dispositivo móvil. También contamos con aplicación disponible próximamente.",
  },
  {
    q: "¿Puedo administrar varias sedes?",
    a: "Absolutamente. Nexus permite gestionar múltiples sedes desde un único panel de administración, con reportes consolidados o por sede.",
  },
  {
    q: "¿Cómo funcionan los carnets QR?",
    a: "Cada estudiante recibe un carnet digital con código QR único. Al escanearlo en la entrada, el sistema registra automáticamente el ingreso y genera alertas a los acudientes.",
  },
  {
    q: "¿El acudiente puede consultar varios hijos?",
    a: "Sí. Un acudiente puede vincular varios hijos en una sola cuenta y ver la información de cada uno desde el mismo acceso.",
  },
  {
    q: "¿Quién puede modificar notas?",
    a: "Solo los docentes asignados a cada asignatura pueden ingresar y modificar notas. Los coordinadores tienen acceso de revisión y el rector puede consultar reportes.",
  },
  {
    q: "¿Cómo se generan los boletines?",
    a: "Al cierre de cada período, el sistema calcula automáticamente los promedios y genera los boletines en PDF listos para entregar o compartir digitalmente.",
  },
];

export const securityCards = [
  {
    icon: <Icon.Lock />,
    title: "Control por roles",
    desc: "Cada usuario ve únicamente la información autorizada para su perfil.",
  },
  {
    icon: <Icon.Activity />,
    title: "Historial",
    desc: "Registro de acciones académicas realizadas en el sistema.",
  },
  {
    icon: <Icon.Shield />,
    title: "Legal",
    desc: "Cumplimiento de la ley de protección de datos colombiana.",
  },
  {
    icon: <Icon.Key />,
    title: "Acceso seguro",
    desc: "Autenticación robusta y sesiones protegidas.",
  },
];

export const contactInfo = [
  {
    icon: <Icon.Whatsapp />,
    title: "WhatsApp",
    value: "+57 300 000 0000",
    sub: "Respuesta en minutos",
  },
  {
    icon: <Icon.Mail />,
    title: "Correo electrónico",
    value: "hola@nexus.edu.co",
    sub: "Respuesta en 24 horas",
  },
  {
    icon: <Icon.Clock />,
    title: "Horario de atención",
    value: "Lun – Vie, 8:00 – 18:00",
    sub: "Hora Colombia (COT)",
  },
  {
    icon: <Icon.Zap />,
    title: "Tiempo de respuesta",
    value: "< 24 horas",
    sub: "Para demos y consultas",
  },
];
