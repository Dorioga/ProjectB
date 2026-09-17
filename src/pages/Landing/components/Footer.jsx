import logoColor from "@assets/img/LogoColor.png";
import { Icon } from "./Icons";

const cols = [
  {
    title: "Nexus",
    links: ["Quiénes somos", "Recursos", "Tutoriales"],
  },
  {
    title: "Soporte",
    links: ["Centro de ayuda", "Contacto"],
  },
  {
    title: "Legal",
    links: ["Política de privacidad", "Términos y condiciones"],
  },
];

function Footer() {
  return (
    <footer className="bg-primary pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="bg-white rounded-lg p-1.5 inline-flex">
                <img
                  src={logoColor}
                  alt="Nexus"
                  className="h-8 w-auto object-contain"
                />
              </span>
              <span className="text-white font-bold text-xl">Nexus</span>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed mb-5">
              Plataforma de gestión educativa desarrollada en Colombia para
              instituciones que buscan innovar.
            </p>
            <div className="flex items-center gap-3">
              {[<Icon.Twitter key="tw" />, <Icon.Linkedin key="li" />, <Icon.Instagram key="ig" />].map(
                (icon, i) => (
                  <button
                    type="button"
                    aria-label="Red social"
                    key={i}
                    className="w-9 h-9 bg-slate-800 hover:bg-secondary text-slate-400 hover:text-white rounded-lg flex items-center justify-center transition-colors cursor-pointer"
                  >
                    {icon}
                  </button>
                ),
              )}
            </div>
          </div>

          {cols.map(({ title, links }) => (
            <div key={title}>
              <p className="text-white font-bold text-sm mb-4">{title}</p>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="text-slate-400 hover:text-[var(--color-secondary)] text-sm transition-colors"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-slate-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-slate-500 text-xs">
            © 2026 Nexus. Todos los derechos reservados. Hecho en Colombia.
          </p>
          <p className="text-slate-600 text-xs">
            Plataforma educativa líder en Colombia
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
