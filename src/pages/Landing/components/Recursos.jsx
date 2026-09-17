import { recursosData } from "../data";
import { DarkCard } from "./ui";

function Recursos() {
  return (
    <section id="recursos" className="bg-white py-12 sm:py-16 lg:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-8 sm:mb-10">
          <span className="text-secondary font-bold text-xs tracking-widest uppercase mb-3 block">
            Recursos
          </span>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-primary">
            Todo lo que necesitas para empezar.
          </h2>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {recursosData.map(({ icon, title, desc }) => (
            <DarkCard key={title} icon={icon} title={title}>
              {desc}
            </DarkCard>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Recursos;
