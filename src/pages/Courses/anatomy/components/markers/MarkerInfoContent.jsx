import { X } from "lucide-react";

export default function MarkerInfoContent({ marker, onClose }) {
  return (
    <div className="w-full max-w-full relative">
      <div className="p-3 md:p-5">
        {/* Botón cerrar */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-1.5 rounded-full hover:bg-black/5 cursor-pointer"
          aria-label="Cerrar"
        >
          <X size={20} />
        </button>

        <div className="flex items-center justify-between gap-3 mb-4 pr-8">
          <div className="flex-1">
            <h2 className="font-semibold leading-tight text-xl md:text-[1.8rem]">
              {marker.title}
            </h2>

            {marker.subtitle && (
              <p className="mt-1 italic text-[#7c4dff]">{marker.subtitle}</p>
            )}
          </div>

          {marker.image && (
            <img
              src={marker.image}
              alt={marker.title}
              className="w-[70px] md:w-[100px] h-[70px] md:h-[100px] rounded-xl object-cover shrink-0"
            />
          )}
        </div>

        {/* Descripción */}
        {marker.description && (
          <div className="mt-2 p-2 rounded-2xl bg-[#efe7ff]">
            <p className="text-sm text-gray-600 text-justify">
              {marker.description}
            </p>
          </div>
        )}

        {/* Datos */}
        {marker.facts?.length > 0 && (
          <div className="mt-2 p-2 rounded-2xl bg-[#fff4dd] flex flex-col gap-1">
            {marker.facts.map((fact) => (
              <div
                key={fact.label}
                className="flex items-baseline justify-between gap-2"
              >
                <span className="font-semibold leading-tight">
                  {fact.label}:
                </span>

                <span className="text-right text-gray-600">{fact.value}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}