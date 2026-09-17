import { tutorialColors, tutorialesData } from "../data";
import { Icon } from "./Icons";

function Tutoriales() {
  return (
    <section id="tutoriales" className="bg-bg py-12 sm:py-16 lg:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-8 sm:mb-10">
          <span className="text-secondary font-bold text-xs tracking-widest uppercase mb-3 block">
            Aprende
          </span>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-primary">
            Aprende Nexus paso a paso.
          </h2>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 mb-10">
          {tutorialesData.map(({ title, duration }, i) => (
            <div
              key={title}
              className="dark-card bg-primary rounded-[18px] overflow-hidden border border-slate-800 group cursor-pointer"
            >
              <div
                className={`bg-gradient-to-br ${tutorialColors[i]} h-28 sm:h-36 flex items-center justify-center relative`}
              >
                <div className="text-[rgba(255,255,255,0.8)] group-hover:text-secondary group-hover:scale-110 transition-all duration-200">
                  <Icon.PlayCircle />
                </div>
                <div className="absolute bottom-2 right-3 bg-black/50 text-white text-xs px-2 py-0.5 rounded-md font-mono">
                  {duration}
                </div>
              </div>
              <div className="p-4">
                <p className="text-white font-semibold text-sm">{title}</p>
                <p className="text-slate-500 text-xs mt-1">Tutorial en video</p>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center">
          <button
            type="button"
            className="inline-flex items-center gap-2 border-2 border-primary text-primary hover:bg-primary hover:text-white font-semibold px-6 py-3 rounded-xl transition-all duration-200 cursor-pointer"
          >
            Ver todos los tutoriales <Icon.ArrowRight />
          </button>
        </div>
      </div>
    </section>
  );
}

export default Tutoriales;
