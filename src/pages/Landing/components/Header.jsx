import { useState } from "react";
import { useNavigate } from "react-router-dom";
import logoColor from "@assets/img/LogoColor.png";
import { Icon } from "./Icons";
import { OrangeButton } from "./ui";

const navLinks = [
  { label: "Inicio", href: "#inicio" },
  { label: "Quiénes somos", href: "#quienes-somos" },
  { label: "Plataforma", href: "#plataforma" },
  { label: "Roles", href: "#perfiles" },
  { label: "Funcionalidades", href: "#funcionalidades" },
  { label: "Flujo de trabajo", href: "#flujo-de-trabajo" },
  { label: "Galería", href: "#galeria" },
  { label: "Tutoriales", href: "#tutoriales" },
  { label: "Recursos", href: "#recursos" },
  { label: "Preguntas frecuentes", href: "#preguntas-frecuentes" },
  { label: "Seguridad", href: "#seguridad" },
  { label: "Contáctanos", href: "#contactanos" },
];

function Header() {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white backdrop-blur-md border-b border-slate-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        <a href="#inicio" className="flex items-center gap-2 shrink-0">
          <img
            src={logoColor}
            alt="Nexus"
            className="h-10 w-auto object-contain"
          />
        </a>

        <nav aria-label="Menú principal" className="hidden xl:flex items-center gap-1">
          {navLinks.map(({ label, href }) => (
            <a
              key={label}
              href={href}
              className="text-slate-600 hover:text-[var(--color-primary)] px-2.5 py-2 rounded-lg hover:bg-slate-50 text-[13px] font-medium transition-colors whitespace-nowrap"
            >
              {label}
            </a>
          ))}
        </nav>

        <div className="hidden xl:block shrink-0">
          <OrangeButton
            className="w-max whitespace-nowrap"
            onClick={() => navigate("/login")}
          >
            Iniciar sesión
          </OrangeButton>
        </div>

        <button
          type="button"
          aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}
          aria-expanded={menuOpen}
          aria-controls="menu-movil"
          className="xl:hidden -mr-2 w-11 h-11 flex items-center justify-center text-slate-700 cursor-pointer"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <Icon.X /> : <Icon.Menu />}
        </button>
      </div>

      {menuOpen && (
        <div
          id="menu-movil"
          className="xl:hidden bg-white border-t border-slate-100 px-4 py-4 flex flex-col gap-1 max-h-[calc(100vh-4rem)] overflow-y-auto shadow-lg"
        >
          {navLinks.map(({ label, href }) => (
            <a
              key={label}
              href={href}
              className="text-slate-700 py-2 font-medium hover:text-[var(--color-secondary)]"
              onClick={() => setMenuOpen(false)}
            >
              {label}
            </a>
          ))}
          <OrangeButton
            className="mt-2 w-full"
            onClick={() => {
              setMenuOpen(false);
              navigate("/login");
            }}
          >
            Iniciar sesión
          </OrangeButton>
        </div>
      )}
    </header>
  );
}

export default Header;
