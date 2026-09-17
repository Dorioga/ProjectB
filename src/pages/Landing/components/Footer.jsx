import logoColor from "@assets/img/LogoColor.png";
import { Icon } from "./Icons";

const cols = [
  {
    title: "Nexus",
    links: [
      { label: "Quiénes somos", href: "#quienes-somos" },
      { label: "Recursos", href: "#recursos" },
    ],
  },
  {
    title: "Soporte",
    links: [
      { label: "Centro de ayuda", href: "#preguntas-frecuentes" },
      { label: "Contacto", href: "#contactanos" },
    ],
  },
  {
    title: "Legal",
    links: [
      {
        label: "Términos y condiciones",
        href: "https://nexusplataforma.com/storage/otros/POL%C3%8DTICA%20DE%20TRATAMIENTO%20DE%20DATOS%20PERSONALES.pdf",
      },
    ],
  },
];

function Footer() {
  return (
    <footer className="bg-primary pt-12 sm:pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="bg-white rounded-lg p-1.5 inline-flex">
                <img
                  src={logoColor}
                  alt="Nexus"
                  className="h-10 w-auto object-contain"
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
                    className="w-11 h-11 bg-slate-800 hover:bg-secondary text-slate-400 hover:text-white rounded-lg flex items-center justify-center transition-colors cursor-pointer"
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
                {links.map(({ label, href }) => (
                  <li key={label}>
                    <a
                      href={href}
                      target={href.startsWith("http") ? "_blank" : undefined}
                      rel={
                        href.startsWith("http")
                          ? "noopener noreferrer"
                          : undefined
                      }
                      className="text-slate-400 hover:text-[var(--color-secondary)] text-sm transition-colors"
                    >
                      {label}
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
