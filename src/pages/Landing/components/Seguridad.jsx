import { securityCards } from "../data";

const orbitDots = [0, 72, 144, 216, 288];

function Seguridad() {
  return (
    <section id="seguridad" className="bg-primary py-24">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <span className="text-secondary font-bold text-xs tracking-widest uppercase mb-3 block">
              Confianza
            </span>
            <h2 className="text-4xl font-extrabold text-white leading-tight mb-5">
              Tu información siempre protegida.
            </h2>
            <p className="text-slate-400 text-lg leading-relaxed mb-10">
              Implementamos los más altos estándares de seguridad para
              garantizar la privacidad y protección de los datos de toda la
              comunidad educativa.
            </p>

            <div className="grid grid-cols-2 gap-4">
              {securityCards.map(({ icon, title, desc }) => (
                <div
                  key={title}
                  className="bg-slate-800 rounded-2xl p-5 border border-slate-700"
                >
                  <div className="text-secondary mb-3">{icon}</div>
                  <p className="text-white font-semibold text-sm mb-1">
                    {title}
                  </p>
                  <p className="text-slate-400 text-xs leading-relaxed">
                    {desc}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-center">
            <div className="relative w-72 h-72">
              <div className="absolute inset-0 rounded-full border-2 border-[rgba(255,147,0,0.2)] animate-pulse" />
              <div className="absolute inset-4 rounded-full border-2 border-[rgba(255,147,0,0.3)]" />
              <div className="absolute inset-8 rounded-full border-2 border-[rgba(255,147,0,0.4)] bg-slate-800" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-24 h-24 bg-secondary rounded-3xl flex items-center justify-center shadow-2xl shadow-[rgba(255,147,0,0.3)]">
                  <svg
                    width="44"
                    height="44"
                    fill="none"
                    stroke="white"
                    strokeWidth="1.5"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    <polyline points="9 12 11 14 15 10" />
                  </svg>
                </div>
              </div>
              {orbitDots.map((deg) => (
                <div
                  key={deg}
                  className="absolute w-3 h-3 bg-secondary rounded-full"
                  style={{
                    top: `calc(50% + ${Math.sin((deg * Math.PI) / 180) * 108}px - 6px)`,
                    left: `calc(50% + ${Math.cos((deg * Math.PI) / 180) * 108}px - 6px)`,
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Seguridad;
