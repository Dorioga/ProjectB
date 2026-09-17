import { conectadoSteps as steps } from "../data";

const metricas = [
  { label: "Estudiantes activos", value: "1,248", color: "text-blue-600" },
  { label: "Asistencia hoy", value: "94.2%", color: "text-green-600" },
  { label: "Boletines emitidos", value: "856", color: "text-secondary" },
  { label: "Docentes", value: "64", color: "text-purple-600" },
];

function TodoConectado() {
  return (
    <section id="plataforma" className="bg-bg py-12 sm:py-16 lg:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          <div>
            <span className="text-secondary font-bold text-xs tracking-widest uppercase mb-3 block">
              Plataforma unificada
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-primary leading-tight mb-5">
              Todo conectado en una sola plataforma
            </h2>
            <p className="text-muted text-base sm:text-lg leading-relaxed mb-8">
              Desde el ingreso del estudiante hasta la entrega del boletín,
              Nexus conecta todos los procesos académicos y administrativos en
              un único sistema.
            </p>

            <div className="relative">
              <div className="landing-gradient-line hidden sm:block absolute top-6 left-[8.33%] right-[8.33%] h-0.5 z-0" />
              <div className="grid grid-cols-3 gap-y-6 sm:flex sm:items-start sm:justify-between sm:gap-0">
                {steps.map((step) => (
                  <div
                    key={step.label}
                    className="relative z-10 flex flex-col items-center sm:flex-1"
                  >
                    <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center text-secondary shadow-lg mb-3">
                      {step.icon}
                    </div>
                    <span className="text-slate-600 text-xs font-medium text-center leading-tight">
                      {step.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-[24px] shadow-2xl shadow-slate-200 border border-slate-100 overflow-hidden">
            <div className="bg-primary px-5 py-3 flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-400" />
              <div className="w-3 h-3 rounded-full bg-yellow-400" />
              <div className="w-3 h-3 rounded-full bg-green-400" />
              <span className="text-slate-400 text-xs ml-3">
                Dashboard — Nexus
              </span>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-2 gap-3 mb-4">
                {metricas.map(({ label, value, color }) => (
                  <div
                    key={label}
                    className="bg-bg rounded-xl p-3 border border-slate-100"
                  >
                    <p className="text-slate-500 text-xs mb-1">{label}</p>
                    <p className={`text-xl font-bold ${color}`}>{value}</p>
                  </div>
                ))}
              </div>
              <div className="bg-bg rounded-xl p-4 border border-slate-100">
                <p className="text-slate-500 text-xs mb-3 font-semibold">
                  Asistencia semanal
                </p>
                <div className="flex items-end gap-2 h-16">
                  {[88, 92, 95, 91, 94, 96, 89].map((h, i) => (
                    <div
                      key={i}
                      className="flex-1 bg-secondary rounded-t-md opacity-80"
                      style={{ height: `${h}%` }}
                    />
                  ))}
                </div>
                <div className="flex justify-between mt-1">
                  {["L", "M", "X", "J", "V", "S", "D"].map((d) => (
                    <span
                      key={d}
                      className="text-slate-400 text-xs flex-1 text-center"
                    >
                      {d}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default TodoConectado;
