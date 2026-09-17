import teamImg from "@assets/personas-analizando-y-revisando-graficos-financieros-en-la-oficina.webp";
import { Icon } from "./Icons";
import { DarkCard } from "./ui";

function QuienesSomos() {
  return (
    <section id="quienes-somos" className="bg-white py-24">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div className="relative">
            <div className="bg-slate-100 rounded-[24px] overflow-hidden aspect-[4/3]">
              <img
                src={teamImg}
                alt="Equipo de tecnología educativa colaborando"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute -bottom-5 -right-5 bg-secondary text-white rounded-2xl px-5 py-4 shadow-xl">
              <p className="text-2xl font-extrabold">100%</p>
              <p className="text-xs font-medium opacity-90">
                Hecho en Colombia
              </p>
            </div>
          </div>

          <div>
            <span className="text-secondary font-bold text-xs tracking-widest uppercase mb-3 block">
              Nuestra empresa
            </span>
            <h2 className="text-4xl font-extrabold text-primary leading-tight mb-5">
              ¿Quiénes somos?
            </h2>
            <p className="text-muted text-lg leading-relaxed mb-8">
              Somos una plataforma de gestión educativa desarrollada en
              Colombia que integra en un solo lugar los procesos académicos,
              administrativos y de seguimiento institucional. Nuestro propósito
              es facilitar el trabajo de rectores, coordinadores, docentes,
              estudiantes y acudientes mediante herramientas que organizan la
              información y permiten tomar decisiones con mayor claridad.
            </p>

            <div className="grid grid-cols-1 gap-4">
              <DarkCard icon={<Icon.Target />} title="Misión">
                Desarrollar soluciones tecnológicas que simplifiquen la gestión
                educativa mediante una plataforma integral, segura e intuitiva
                que fortalezca los procesos académicos, administrativos y de
                seguimiento institucional.
              </DarkCard>
              <DarkCard icon={<Icon.Globe />} title="Visión">
                Ser una de las plataformas líderes de gestión educativa en
                Colombia y Latinoamérica, impulsando la transformación digital
                de las instituciones mediante innovación constante y
                herramientas que faciliten el aprendizaje y la administración
                escolar.
              </DarkCard>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default QuienesSomos;
