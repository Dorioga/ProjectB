import { contactInfo } from "../data";
import { OrangeButton } from "./ui";

function Contacto() {
  return (
    <section id="contactanos" className="bg-white py-24">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-14">
          <span className="text-secondary font-bold text-xs tracking-widest uppercase block">
            Contacto
          </span>
        </div>

        <div className="grid lg:grid-cols-5 gap-10">
          <div className="lg:col-span-3 bg-bg rounded-[24px] p-8 border border-slate-100">
            <h3 className="text-xl font-bold text-primary mb-6">
              Envíanos un mensaje
            </h3>
            <div className="grid sm:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="text-slate-600 text-xs font-semibold mb-1.5 block">
                  Nombre
                </label>
                <input
                  type="text"
                  placeholder="Tu nombre"
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm bg-white outline-none focus:border-[var(--color-secondary)] transition-all"
                />
              </div>
              <div>
                <label className="text-slate-600 text-xs font-semibold mb-1.5 block">
                  Institución
                </label>
                <input
                  type="text"
                  placeholder="Nombre del colegio"
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm bg-white outline-none focus:border-[var(--color-secondary)] transition-all"
                />
              </div>
            </div>
            <div className="mb-4">
              <label className="text-slate-600 text-xs font-semibold mb-1.5 block">
                Correo electrónico
              </label>
              <input
                type="email"
                placeholder="correo@colegio.edu.co"
                className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm bg-white outline-none focus:border-[var(--color-secondary)] transition-all"
              />
            </div>
            <div className="mb-6">
              <label className="text-slate-600 text-xs font-semibold mb-1.5 block">
                Mensaje
              </label>
              <textarea
                rows={4}
                placeholder="¿En qué podemos ayudarte?"
                className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm bg-white outline-none focus:border-[var(--color-secondary)] transition-all resize-none"
              />
            </div>
            <OrangeButton className="w-full">Enviar mensaje →</OrangeButton>
          </div>

          <div className="lg:col-span-2 flex flex-col gap-4">
            {contactInfo.map(({ icon, title, value, sub }) => (
              <div
                key={title}
                className="dark-card bg-primary rounded-[18px] p-5 flex items-start gap-4 border border-slate-800"
              >
                <div className="w-10 h-10 icon-chip rounded-xl flex items-center justify-center text-secondary shrink-0">
                  {icon}
                </div>
                <div>
                  <p className="text-slate-400 text-xs mb-0.5">{title}</p>
                  <p className="text-white font-semibold text-sm">{value}</p>
                  <p className="text-slate-500 text-xs mt-0.5">{sub}</p>
                </div>
              </div>
            ))}

            <div className="bg-secondary rounded-[18px] p-6 mt-2">
              <p className="text-white font-extrabold text-lg leading-snug mb-2">
                Agenda una demostración personalizada.
              </p>
              <p className="text-orange-100 text-sm mb-4">
                Sin costos, sin compromisos. Solo resultados.
              </p>
              <a
                href="#inicio"
                className="inline-block bg-white text-secondary font-bold px-5 py-2.5 rounded-xl hover:bg-orange-50 transition-colors text-sm cursor-pointer"
              >
                Agendar ahora →
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Contacto;
