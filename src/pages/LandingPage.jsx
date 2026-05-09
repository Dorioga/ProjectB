import React, { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import logoColor from "../assets/img/LogoColor.png";
import DepartmentSelector from "../components/molecules/DepartmentSelector";
import CitySelector from "../components/molecules/CitySelector";

/* ── Iconos SVG inline ────────────────────────────────────────── */
const IconChart = () => (
  <svg
    className="w-7 h-7"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
  </svg>
);
const IconFolder = () => (
  <svg
    className="w-7 h-7"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
  </svg>
);
const IconUsers = () => (
  <svg
    className="w-7 h-7"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);
const IconShield = () => (
  <svg
    className="w-7 h-7"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);
const IconCalendar = () => (
  <svg
    className="w-6 h-6"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);
const IconLock = () => (
  <svg
    className="w-4 h-4"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);
const IconGraduate = () => (
  <svg
    className="w-8 h-8 text-white"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
    <path d="M6 12v5c3 3 9 3 12 0v-5" />
  </svg>
);
const IconBuilding = () => (
  <svg
    className="w-8 h-8 text-[#f97316]"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <rect x="3" y="3" width="18" height="18" rx="1" />
    <path d="M9 22V12h6v10" />
    <path d="M9 7h.01M15 7h.01M9 12h.01M15 12h.01" />
  </svg>
);
const IconShieldSmall = () => (
  <svg
    className="w-8 h-8 text-[#f97316]"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);
const IconCloud = () => (
  <svg
    className="w-8 h-8 text-[#f97316]"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z" />
  </svg>
);

/* ── Datos estáticos ──────────────────────────────────────────── */
const FEATURES = [
  {
    icon: <IconChart />,
    title: "Gestión académica integral",
    desc: "Notas, asistencia, evaluaciones y más en un solo lugar.",
  },
  {
    icon: <IconFolder />,
    title: "Reportes en tiempo real",
    desc: "Toma decisiones informadas con datos precisos y actualizados.",
  },
  {
    icon: <IconUsers />,
    title: "Comunicación efectiva",
    desc: "Conecta a docentes, estudiantes y acudientes de forma sencilla.",
  },
  {
    icon: <IconShield />,
    title: "Seguridad y confianza",
    desc: "Tu información protegida con los más altos estándares.",
  },
];

const STATS = [
  {
    icon: <IconGraduate />,
    value: "+40.000",
    label: "Estudiantes gestionados",
    bg: "bg-[#1a2236]",
  },
  {
    icon: <IconBuilding />,
    value: "",
    label: "Instituciones que confían",
    bg: "bg-white",
  },
  {
    icon: <IconShieldSmall />,
    value: "",
    label: "Información segura y respaldada",
    bg: "bg-white",
  },
  {
    icon: <IconCloud />,
    value: "100%",
    label: "en la nube · Accede desde cualquier lugar",
    bg: "bg-white",
  },
];

const INTERESTS = [
  "Gestión de notas y calificaciones",
  "Control de asistencia",
  "Comunicación con acudientes",
  "Reportes académicos",
  "Gestión administrativa",
  "Todo lo anterior",
];

/* ── Componente principal ─────────────────────────────────────── */
export default function LandingPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    municipality: "",
    name: "",
    address: "",
    email: "",
    phone: "",
    principalName: "",
    coordinadorName: "",
    department_id: "",
    interes: "",
    mensaje: "",
    privacidad: false,
  });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => {
      const updated = {
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      };
      if (name === "department_id") updated.municipality = "";
      return updated;
    });
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  /* ── Nav links (solo UI, sin scroll real) ── */
  const navLinks = [
    "Beneficios",
    "Cómo funciona",
    "Módulos",
    "Precios",
    "Recursos",
  ];

  return (
    <div className="w-full bg-white font-sans text-gray-900">
      {/* ══ NAVBAR ══════════════════════════════════════════════ */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
        <nav className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <img
              src={logoColor}
              alt="Nexus Academmi"
              className="h-10 object-contain"
            />
          </div>

          {/* Links (hidden on mobile) */}
          <ul className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600">
            {navLinks.map((link) => (
              <li key={link}>
                <a href="#" className="hover:text-[#f97316] transition-colors">
                  {link}
                </a>
              </li>
            ))}
          </ul>

          {/* CTA */}
          <button
            onClick={() => navigate("/login")}
            className="flex items-center gap-2 border border-gray-300 rounded-lg px-5 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:border-[#f97316] hover:text-[#f97316] transition-all"
          >
            <IconLock />
            Iniciar sesión
          </button>
        </nav>
      </header>

      {/* ══ HERO ════════════════════════════════════════════════ */}
      <main className="max-w-7xl mx-auto px-6 py-12 lg:py-16">
        <div className="flex flex-col lg:flex-row gap-12 items-start">
          {/* ── Columna izquierda ── */}
          <div className="flex-1 space-y-7">
            {/* Badge */}
            <span className="inline-flex items-center gap-2 bg-orange-50 text-[#f97316] border border-orange-200 text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-full">
              <IconCalendar />
              Demo gratuito sin compromiso
            </span>

            {/* Headline */}
            <h1 className="text-4xl lg:text-5xl font-extrabold leading-tight text-gray-900">
              Conoce cómo Nexus puede transformar{" "}
              <span className="text-[#f97316]">tu colegio</span>
            </h1>

            {/* Subtítulo */}
            <p className="text-gray-500 text-lg leading-relaxed max-w-lg">
              Agenda una demo personalizada y descubre cómo simplificamos la
              gestión académica y administrativa de tu institución.
            </p>

            {/* Features */}
            <ul className="space-y-5">
              {FEATURES.map(({ icon, title, desc }) => (
                <li key={title} className="flex items-start gap-4">
                  <span className="shrink-0 w-12 h-12 rounded-xl bg-orange-50 text-[#f97316] flex items-center justify-center">
                    {icon}
                  </span>
                  <div>
                    <p className="font-semibold text-gray-800">{title}</p>
                    <p className="text-sm text-gray-500">{desc}</p>
                  </div>
                </li>
              ))}
            </ul>

            {/* Stats bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4">
              {/* Stat 1 – fondo oscuro */}
              <div className="bg-[#1a2236] rounded-2xl p-4 flex flex-col items-center text-center gap-1">
                <IconGraduate />
                <span className="text-white text-xl font-extrabold">
                  +40.000
                </span>
                <span className="text-gray-400 text-xs leading-tight">
                  Estudiantes gestionados
                </span>
              </div>
              {/* Stat 2 */}
              <div className="border border-gray-100 rounded-2xl p-4 flex flex-col items-center text-center gap-1">
                <IconBuilding />
                <span className="text-gray-800 text-sm font-bold leading-tight">
                  Instituciones que confían
                </span>
              </div>
              {/* Stat 3 */}
              <div className="border border-gray-100 rounded-2xl p-4 flex flex-col items-center text-center gap-1">
                <IconShieldSmall />
                <span className="text-gray-800 text-sm font-bold leading-tight">
                  Información segura y respaldada
                </span>
              </div>
              {/* Stat 4 */}
              <div className="border border-gray-100 rounded-2xl p-4 flex flex-col items-center text-center gap-1">
                <IconCloud />
                <span className="text-[#f97316] text-xl font-extrabold">
                  100%
                </span>
                <span className="text-gray-600 text-xs leading-tight">
                  en la nube · Accede desde cualquier lugar
                </span>
              </div>
            </div>
          </div>

          {/* ── Columna derecha: Formulario ── */}
          <div className="w-full lg:w-[480px] shrink-0">
            <div className="bg-white border border-gray-200 rounded-2xl shadow-xl p-8">
              {submitted ? (
                <div className="text-center py-10 space-y-4">
                  <div className="w-16 h-16 rounded-full bg-green-100 text-green-600 flex items-center justify-center mx-auto text-3xl">
                    ✓
                  </div>
                  <h2 className="text-xl font-bold text-gray-800">
                    ¡Solicitud enviada!
                  </h2>
                  <p className="text-gray-500 text-sm">
                    Uno de nuestros asesores te contactará pronto para agendar
                    tu demo personalizada.
                  </p>
                  <button
                    onClick={() => setSubmitted(false)}
                    className="text-[#f97316] text-sm underline"
                  >
                    Enviar otra solicitud
                  </button>
                </div>
              ) : (
                <>
                  {/* Form header */}
                  <div className="flex items-start gap-3 mb-6">
                    <span className="w-10 h-10 rounded-xl bg-orange-100 text-[#f97316] flex items-center justify-center shrink-0">
                      <IconCalendar />
                    </span>
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">
                        Solicita tu demo gratuita
                      </h2>
                      <p className="text-xs text-gray-500 mt-0.5">
                        Completa el formulario y uno de nuestros asesores te
                        contactará para agendar tu demo personalizada.
                      </p>
                    </div>
                  </div>

                  <form
                    onSubmit={handleSubmit}
                    className="space-y-4"
                    noValidate
                  >
                    {/* Nombre institución */}
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        Nombre de la institución{" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <input
                        required
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Ej: Colegio San José"
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#f97316] focus:border-transparent placeholder-gray-300"
                      />
                    </div>

                    {/* Dirección */}
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        Dirección <span className="text-red-500">*</span>
                      </label>
                      <input
                        required
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        placeholder="Ej: Calle 10 # 20-30"
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#f97316] focus:border-transparent placeholder-gray-300"
                      />
                    </div>

                    {/* Departamento y Ciudad */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <DepartmentSelector
                          name="department_id"
                          label="Departamento"
                          value={formData.department_id}
                          onChange={handleChange}
                          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#f97316] focus:border-transparent"
                          labelClassName="block text-xs font-semibold text-gray-700 mb-1"
                        />
                      </div>
                      <div>
                        <CitySelector
                          name="municipality"
                          label="Ciudad/Municipio"
                          value={formData.municipality}
                          onChange={handleChange}
                          departmentId={formData.department_id}
                          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#f97316] focus:border-transparent"
                          labelClassName="block text-xs font-semibold text-gray-700 mb-1"
                          required
                        />
                      </div>
                    </div>

                    {/* Teléfono y Correo */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">
                          Teléfono <span className="text-red-500">*</span>
                        </label>
                        <input
                          required
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          placeholder="Ej: 300 123 4567"
                          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#f97316] focus:border-transparent placeholder-gray-300"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">
                          Correo electrónico{" "}
                          <span className="text-red-500">*</span>
                        </label>
                        <input
                          required
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          placeholder="Ej: rector@colegio.edu.co"
                          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#f97316] focus:border-transparent placeholder-gray-300"
                        />
                      </div>
                    </div>

                    {/* Director y Coordinador */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">
                          Nombre del director{" "}
                          <span className="text-red-500">*</span>
                        </label>
                        <input
                          required
                          name="principalName"
                          value={formData.principalName}
                          onChange={handleChange}
                          placeholder="Ej: Juan Pérez"
                          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#f97316] focus:border-transparent placeholder-gray-300"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">
                          Nombre del coordinador{" "}
                          <span className="text-red-500">*</span>
                        </label>
                        <input
                          required
                          name="coordinadorName"
                          value={formData.coordinadorName}
                          onChange={handleChange}
                          placeholder="Ej: María López"
                          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#f97316] focus:border-transparent placeholder-gray-300"
                        />
                      </div>
                    </div>

                    {/* Interés */}
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        ¿Cuál es tu principal interés en Nexus?{" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <select
                        required
                        name="interes"
                        value={formData.interes}
                        onChange={handleChange}
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#f97316] focus:border-transparent text-gray-500"
                      >
                        <option value="">Selecciona una opción</option>
                        {INTERESTS.map((i) => (
                          <option key={i} value={i}>
                            {i}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Mensaje */}
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        Mensaje adicional{" "}
                        <span className="text-gray-400">(opcional)</span>
                      </label>
                      <textarea
                        name="mensaje"
                        value={formData.mensaje}
                        onChange={handleChange}
                        rows={3}
                        placeholder="Cuéntanos brevemente sobre tu institución o necesidades específicas…"
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#f97316] focus:border-transparent placeholder-gray-300 resize-none"
                      />
                    </div>

                    {/* Privacidad */}
                    <label className="flex items-start gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        name="privacidad"
                        checked={formData.privacidad}
                        onChange={handleChange}
                        required
                        className="mt-0.5 accent-[#f97316]"
                      />
                      <span className="text-xs text-gray-500">
                        Acepto la{" "}
                        <a href="#" className="text-[#f97316] underline">
                          Política de privacidad
                        </a>{" "}
                        y el tratamiento de mis datos personales.
                      </span>
                    </label>

                    {/* Submit */}
                    <button
                      type="submit"
                      className="w-full flex items-center justify-center gap-2 bg-[#f97316] hover:bg-orange-600 text-white font-bold py-3 rounded-xl transition-colors text-sm shadow-md shadow-orange-200"
                    >
                      <IconCalendar />
                      Reservar demo gratuito
                    </button>

                    {/* Nota */}
                    <p className="text-center text-xs text-gray-400 flex items-center justify-center gap-1">
                      <IconLock />
                      Tu información está protegida. No compartimos tus datos
                      con terceros.
                    </p>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* ══ FOOTER ══════════════════════════════════════════════ */}
      <footer className="border-t border-gray-100 py-6">
        <p className="text-center text-sm text-gray-500">
          Tecnología desarrollada en Colombia para{" "}
          <strong>instituciones educativas</strong> como la tuya.
        </p>
      </footer>
    </div>
  );
}
