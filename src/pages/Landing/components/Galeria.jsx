import { galleryItems } from "../data";

function Galeria() {
  return (
    <section id="galeria" className="bg-white py-24">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-14">
          <span className="text-secondary font-bold text-xs tracking-widest uppercase mb-3 block">
            Galería
          </span>
          <h2 className="text-4xl font-extrabold text-primary">
            Conoce Nexus desde adentro.
          </h2>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {galleryItems.map(({ title, subtitle, bg }) => (
            <div
              key={title}
              className={`dark-card bg-gradient-to-br ${bg} rounded-[20px] p-6 aspect-[3/4] flex flex-col justify-between border border-[rgba(255,255,255,0.05)] cursor-pointer group`}
            >
              <div>
                <div className="h-2 w-16 bg-[rgba(255,255,255,0.2)] rounded mb-2" />
                <div className="h-2 w-10 bg-[rgba(255,255,255,0.1)] rounded mb-4" />
                <div className="grid grid-cols-2 gap-2">
                  {[...Array(4)].map((_, i) => (
                    <div
                      key={i}
                      className="bg-[rgba(255,255,255,0.1)] rounded-lg h-10"
                    />
                  ))}
                </div>
                <div className="mt-3 bg-[rgba(255,255,255,0.1)] rounded-lg h-20" />
              </div>
              <div>
                <p className="text-secondary text-xs font-bold mb-0.5 transition-colors">
                  {title}
                </p>
                <p className="text-[rgba(255,255,255,0.6)] text-xs">
                  {subtitle}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Galeria;
