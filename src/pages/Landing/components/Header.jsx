import { useState } from "react";
import { useNavigate } from "react-router-dom";
import logoColor from "@assets/img/LogoColor.png";
import { Icon } from "./Icons";
import { OrangeButton } from "./ui";

const navLinks = [
  { label: "Inicio", href: "#inicio" },
  { label: "Quiénes somos", href: "#quienes-somos" },
  { label: "Perfiles", href: "#perfiles" },
  { label: "Galería", href: "#galeria" },
  { label: "Tutoriales", href: "#tutoriales" },
  { label: "Recursos", href: "#recursos" },
  { label: "Preguntas frecuentes", href: "#preguntas-frecuentes" },
  { label: "Contáctanos", href: "#contactanos" },
];

function Header() {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white backdrop-blur-md border-b border-slate-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between gap-4">
        <a href="#inicio" className="flex items-center gap-2 shrink-0">
          <img
            src={logoColor}
            alt="Nexus"
            className="h-10 w-auto object-contain"
          />
        </a>

        <nav className="hidden lg:flex items-center gap-1">
          {navLinks.map(({ label, href }) => (
            <a
              key={label}
              href={href}
              className="text-slate-600 hover:text-[var(--color-primary)] px-3 py-2 rounded-lg hover:bg-slate-50 text-sm font-medium transition-colors whitespace-nowrap"
            >
              {label}
            </a>
          ))}
        </nav>

        <div className="hidden lg:block">
          <OrangeButton onClick={() => navigate("/login")}>
            Iniciar sesión
          </OrangeButton>
        </div>

        <button
          type="button"
          aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}
          className="lg:hidden text-slate-700"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <Icon.X /> : <Icon.Menu />}
        </button>
      </div>

      {menuOpen && (
        <div className="lg:hidden bg-white border-t border-slate-100 px-6 py-4 flex flex-col gap-2">
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
