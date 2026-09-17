import { Icon } from "./Icons";
import DemoForm from "./DemoForm";

const features = [
  {
    icon: <Icon.ClipboardList />,
    title: "Gestión académica integral",
    desc: "Notas, asistencia, evaluaciones y más en un solo lugar.",
  },
  {
    icon: <Icon.BarChart />,
    title: "Reportes en tiempo real",
    desc: "Toma decisiones informadas con datos precisos y actualizados.",
  },
  {
    icon: <Icon.Users />,
    title: "Comunicación efectiva",
    desc: "Conecta a docentes, estudiantes y acudientes de forma sencilla.",
  },
  {
    icon: <Icon.Shield />,
    title: "Seguridad y confianza",
    desc: "Tu información protegida con los más altos estándares.",
  },
];

function Hero() {
  return (
    <section id="inicio" className="bg-white py-12 sm:py-16 lg:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-start">
          <div className="space-y-6">
            <span className="badge-secondary inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-full">
              <Icon.Calendar />
              Demo gratuito sin compromiso
            </span>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold leading-tight text-primary">
              Conoce cómo Nexus puede transformar{" "}
              <span className="text-secondary">tu colegio</span>
            </h1>

            <p className="text-muted text-base sm:text-lg leading-relaxed max-w-lg">
              Agenda una demo personalizada y descubre cómo simplificamos la
              gestión académica y administrativa de tu institución.
            </p>

            <ul className="space-y-5">
              {features.map(({ icon, title, desc }) => (
                <li key={title} className="flex items-start gap-4">
                  <span className="shrink-0 w-12 h-12 rounded-xl icon-chip text-secondary flex items-center justify-center">
                    {icon}
                  </span>
                  <div>
                    <p className="font-semibold text-primary">{title}</p>
                    <p className="text-sm text-muted">{desc}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <DemoForm />
        </div>
      </div>
    </section>
  );
}

export default Hero;
