import { useCallback, useState } from "react";
import DepartmentSelector from "../../../components/molecules/DepartmentSelector";
import CitySelector from "../../../components/molecules/CitySelector";
import { Icon } from "./Icons";
import { OrangeButton } from "./ui";

const INTERESTS = [
  "Gestión de notas y calificaciones",
  "Control de asistencia",
  "Comunicación con acudientes",
  "Reportes académicos",
  "Gestión administrativa",
  "Todo lo anterior",
];

const inputClass =
  "w-full border border-slate-200 rounded-xl px-3 py-2 text-sm bg-white outline-none focus:ring-2 focus:ring-[var(--color-secondary)] focus:border-transparent placeholder-slate-300";

const labelClass = "block text-xs font-semibold text-slate-700 mb-1";

function DemoForm() {
  const [formData, setFormData] = useState({
    municipality: "",
    name: "",
    email: "",
    phone: "",
    principalName: "",
    department_id: "",
    interes: "",
    mensaje: "",
    privacidad: false,
  });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => {
      const updated = {
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      };
      if (name === "department_id") updated.municipality = "";
      return updated;
    });
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="bg-white border border-slate-100 rounded-[24px] shadow-xl p-8">
        <div className="text-center py-10 space-y-4">
          <div className="w-16 h-16 rounded-full bg-green-100 text-green-600 flex items-center justify-center mx-auto">
            <Icon.Check />
          </div>
          <h2 className="text-xl font-bold text-primary">
            ¡Solicitud enviada!
          </h2>
          <p className="text-muted text-sm">
            Uno de nuestros asesores te contactará pronto para agendar tu demo
            personalizada.
          </p>
          <button
            type="button"
            onClick={() => setSubmitted(false)}
            className="text-secondary text-sm underline"
          >
            Enviar otra solicitud
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-100 rounded-[24px] shadow-xl p-8">
      <div className="flex items-start gap-3 mb-6">
        <span className="w-10 h-10 icon-chip rounded-xl flex items-center justify-center text-secondary shrink-0">
          <Icon.Calendar />
        </span>
        <div>
          <h2 className="text-xl font-bold text-primary">
            Solicita tu demo gratuita
          </h2>
          <p className="text-xs text-muted mt-0.5">
            Completa el formulario y uno de nuestros asesores te contactará
            para agendar tu demo personalizada.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <div>
          <label className={labelClass}>
            Nombre de la institución <span className="text-red-500">*</span>
          </label>
          <input
            required
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Ej: Colegio San José"
            className={inputClass}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <DepartmentSelector
            name="department_id"
            label="Departamento"
            value={formData.department_id}
            onChange={handleChange}
            className={inputClass}
            labelClassName={labelClass}
          />
          <CitySelector
            name="municipality"
            label="Ciudad/Municipio"
            value={formData.municipality}
            onChange={handleChange}
            departmentId={formData.department_id}
            className={inputClass}
            labelClassName={labelClass}
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass}>
              Teléfono <span className="text-red-500">*</span>
            </label>
            <input
              required
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="Ej: 300 123 4567"
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>
              Correo electrónico <span className="text-red-500">*</span>
            </label>
            <input
              required
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Ej: rector@colegio.edu.co"
              className={inputClass}
            />
          </div>
        </div>

        <div>
          <label className={labelClass}>
            Nombre de contacto <span className="text-red-500">*</span>
          </label>
          <input
            required
            name="principalName"
            value={formData.principalName}
            onChange={handleChange}
            placeholder="Ej: Juan Pérez"
            className={inputClass}
          />
        </div>

        <div>
          <label className={labelClass}>
            ¿Cuál es tu principal interés en Nexus?{" "}
            <span className="text-red-500">*</span>
          </label>
          <select
            required
            name="interes"
            value={formData.interes}
            onChange={handleChange}
            className={`${inputClass} text-slate-500`}
          >
            <option value="">Selecciona una opción</option>
            {INTERESTS.map((i) => (
              <option key={i} value={i}>
                {i}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className={labelClass}>
            Mensaje adicional <span className="text-slate-400">(opcional)</span>
          </label>
          <textarea
            name="mensaje"
            value={formData.mensaje}
            onChange={handleChange}
            rows={3}
            placeholder="Cuéntanos brevemente sobre tu institución o necesidades específicas…"
            className={`${inputClass} resize-none`}
          />
        </div>

        <label className="flex items-start gap-2 cursor-pointer">
          <input
            type="checkbox"
            name="privacidad"
            checked={formData.privacidad}
            onChange={handleChange}
            required
            className="mt-0.5 accent-[var(--color-secondary)]"
          />
          <span className="text-xs text-slate-500">
            Acepto la{" "}
            <a href="#" className="text-secondary underline">
              Política de privacidad
            </a>{" "}
            y el tratamiento de mis datos personales.
          </span>
        </label>

        <OrangeButton type="submit" className="w-full">
          Reservar demo gratuito
        </OrangeButton>

        <p className="text-center text-xs text-slate-400 flex items-center justify-center gap-1">
          <Icon.Lock />
          Tu información está protegida. No compartimos tus datos con terceros.
        </p>
      </form>
    </div>
  );
}

export default DemoForm;
