import { timelineSteps } from "../data";

const sidebarItems = [
  "Dashboard",
  "Estudiantes",
  "Docentes",
  "Asistencia",
  "Boletines",
  "Reportes",
];

const resumen = [
  { label: "Presentes", value: "1,187", pct: "95%" },
  { label: "Ausentes", value: "61", pct: "5%" },
  { label: "Excusas", value: "38", pct: "3%" },
];

function ComoFunciona() {
  return (
    <section id="flujo-de-trabajo" className="bg-bg py-12 sm:py-16 lg:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-8 sm:mb-12">
          <span className="text-secondary font-bold text-xs tracking-widest uppercase mb-3 block">
            Flujo de trabajo
          </span>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-primary">
            Así funciona Nexus durante todo el año escolar.
          </h2>
        </div>

        <div className="relative mb-8 sm:mb-12">
          <div className="landing-gradient-line sm:hidden absolute top-7 bottom-7 left-7 w-0.5 -translate-x-1/2 z-0" />
          <div className="landing-gradient-line hidden sm:block absolute top-10 left-[8.33%] right-[8.33%] h-0.5 z-0" />

          <div className="relative flex flex-col sm:flex-row items-start sm:items-center gap-6 sm:gap-4">
            {timelineSteps.map(({ icon, label, step }) => (
              <div
                key={step}
                className="relative z-10 flex items-center sm:flex-col gap-4 sm:gap-0 flex-1 w-full sm:w-auto"
              >
                <div className="shrink-0 w-14 h-14 bg-primary rounded-2xl flex items-center justify-center text-secondary shadow-lg sm:mb-3">
                  {icon}
                </div>
                <div className="text-left sm:text-center">
                  <div className="text-secondary font-bold text-xs mb-1">
                    {step}
                  </div>
                  <p className="text-primary font-semibold text-sm leading-tight">
                    {label}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-[24px] shadow-xl border border-slate-100 overflow-hidden">
          <div className="bg-primary px-5 py-3 flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-400" />
            <div className="w-3 h-3 rounded-full bg-yellow-400" />
            <div className="w-3 h-3 rounded-full bg-green-400" />
            <span className="text-slate-400 text-xs ml-3">
              Nexus — Gestión Escolar 2025
            </span>
          </div>
          <div className="flex">
            <div className="hidden md:block w-52 bg-primary p-4 min-h-48">
              <p className="text-secondary text-xs font-bold mb-4 tracking-wider">
                MENÚ
              </p>
              {sidebarItems.map((item) => (
                <div
                  key={item}
                  className={`flex items-center gap-2 py-2 px-3 rounded-lg mb-1 cursor-pointer ${
                    item === "Dashboard"
                      ? "bg-secondary text-white"
                      : "text-slate-400 hover:bg-slate-800 hover:text-white"
                  } transition-colors`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-current opacity-60" />
                  <span className="text-xs font-medium">{item}</span>
                </div>
              ))}
            </div>
            <div className="flex-1 p-6 bg-bg">
              <p className="text-primary font-bold mb-4">
                Resumen institucional
              </p>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {resumen.map(({ label, value, pct }) => (
                  <div
                    key={label}
                    className="bg-white rounded-xl p-3 border border-slate-100"
                  >
                    <p className="text-slate-500 text-xs">{label}</p>
                    <p className="text-xl font-bold text-primary">{value}</p>
                    <p className="text-secondary text-xs font-semibold">
                      {pct}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default ComoFunciona;
