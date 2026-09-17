import { recursosData } from "../data";
import { DarkCard } from "./ui";

function Recursos() {
  return (
    <section id="recursos" className="bg-white py-24">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-14">
          <span className="text-secondary font-bold text-xs tracking-widest uppercase mb-3 block">
            Recursos
          </span>
          <h2 className="text-4xl font-extrabold text-primary">
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
