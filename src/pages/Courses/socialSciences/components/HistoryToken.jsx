import { X } from "lucide-react";

export default function HistoryToken({ event, onClose }) {
  if (!event) {
    return null;
  }

  return (
    <div className="absolute right-6 top-6 w-[360px] max-w-[85vw] max-h-[calc(100vh-48px)] overflow-y-auto bg-white rounded-2xl p-6 shadow-2xl z-[100]">
      <div className="flex justify-between items-start gap-3">
        <div>
          <div className="text-3xl">{event.icon}</div>

          <h2 className="mt-2 mb-1 text-gray-800 text-xl font-bold leading-tight">
            {event.title}
          </h2>

          {event.subtitle && (
            <p className="mt-1 text-gray-500 text-sm leading-relaxed">
              {event.subtitle}
            </p>
          )}
        </div>

        <button
          onClick={onClose}
          aria-label="Cerrar"
          className="w-[34px] h-[34px] min-w-[34px] rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 text-xl cursor-pointer flex items-center justify-center"
        >
          <X size={18} />
        </button>
      </div>

      {event.image && (
        <div className="mt-5 w-full rounded-xl overflow-hidden bg-gray-100">
          <img
            src={event.image}
            alt={event.title}
            className="block w-full h-[190px] object-cover"
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
          />
        </div>
      )}

      <div className="mt-4 space-y-2 text-sm text-gray-500">
        {event.date && <div>📅 {event.date}</div>}
        {event.location && <div>📍 {event.location}</div>}
        {event.country && <div>🌍 {event.country}</div>}
        {event.period && <div>🕰️ {event.period}</div>}
        {event.category && <div>📚 {event.category}</div>}
      </div>

      <hr className="my-5 border-gray-200" />

      {event.description && (
        <>
          <h3 className="mb-2 text-gray-800 text-lg font-bold">
            ¿Qué ocurrió?
          </h3>
          <p className="mb-5 text-gray-600 text-sm leading-relaxed">
            {event.description}
          </p>
        </>
      )}

      {event.historicalImportance && (
        <>
          <h3 className="mb-2 text-gray-800 text-lg font-bold">
            Importancia histórica
          </h3>
          <p className="mb-5 text-gray-600 text-sm leading-relaxed">
            {event.historicalImportance}
          </p>
        </>
      )}

      {event.educationalSummary && (
        <>
          <h3 className="mb-2 text-gray-800 text-lg font-bold">
            Resumen educativo
          </h3>
          <p className="mb-5 text-gray-600 text-sm leading-relaxed">
            {event.educationalSummary}
          </p>
        </>
      )}

      {event.interestingFacts?.length > 0 && (
        <>
          <h3 className="mb-2 text-gray-800 text-lg font-bold">
            Datos interesantes
          </h3>

          <div className="flex flex-col gap-2 mb-5">
            {event.interestingFacts.map((fact, index) => (
              <div
                key={`${fact}-${index}`}
                className="flex gap-2 items-start px-2.5 py-2 rounded-lg bg-gray-50 text-gray-600 text-sm leading-relaxed"
              >
                <span>💡</span>
                <span>{fact}</span>
              </div>
            ))}
          </div>
        </>
      )}

      {event.wikipedia?.url && (
        <a
          href={event.wikipedia.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-[#1976d2] text-white font-semibold text-sm hover:opacity-90 cursor-pointer mt-2"
        >
          <span className="text-lg font-bold">W</span>
          <span>Ver en Wikipedia</span>
        </a>
      )}
    </div>
  );
}
