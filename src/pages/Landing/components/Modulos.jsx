import { modulesData } from "../data";
import { Icon } from "./Icons";
import { DarkCard } from "./ui";

function Modulos() {
  return (
    <section className="bg-white py-24">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-14">
          <span className="text-secondary font-bold text-xs tracking-widest uppercase mb-3 block">
            Funcionalidades
          </span>
          <h2 className="text-4xl font-extrabold text-primary mb-4">
            Todo lo que tu institución necesita.
          </h2>
          <p className="text-muted text-lg max-w-xl mx-auto">
            Nexus reúne los procesos educativos y administrativos en una sola
            plataforma.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-10">
          {modulesData.map(({ icon, title, desc }) => (
            <DarkCard key={title} icon={icon} title={title}>
              {desc}
            </DarkCard>
          ))}
        </div>

        <div className="text-center">
          <button
            type="button"
            className="inline-flex items-center gap-2 border-2 border-primary text-primary hover:bg-primary hover:text-white font-semibold px-6 py-3 rounded-xl transition-all duration-200"
          >
            Conocer todos los módulos <Icon.ArrowRight />
          </button>
        </div>
      </div>
    </section>
  );
}

export default Modulos;
