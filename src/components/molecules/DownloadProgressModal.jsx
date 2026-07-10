import { useEffect, useRef } from "react";
import { CircleX } from "lucide-react";
import logoColor from "../../assets/img/LogoColor.png";

const DownloadProgressModal = ({
  isOpen = false,
  onClose = () => {},
  progress = null,
  downloadLog = [],
  isDownloading = false,
}) => {
  const logEndRef = useRef(null);

  useEffect(() => {
    if (logEndRef.current) {
      logEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [downloadLog]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e) => {
      if (e.key === "Escape" && !isDownloading) onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isOpen, onClose, isDownloading]);

  if (!isOpen) return null;

  const percent = progress?.total
    ? Math.round((progress.current / progress.total) * 100)
    : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div
        className="bg-surface rounded shadow-lg w-full max-w-lg max-h-[90vh] flex flex-col"
        onMouseDown={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="w-full flex flex-row justify-between items-center font-bold bg-primary text-surface p-4 rounded-t shrink-0">
          <span className="text-xl">Descargando documentos</span>
          {!isDownloading && (
            <div className="bg-error rounded-full">
              <CircleX
                className="cursor-pointer text-surface h-8 w-8"
                onClick={onClose}
                role="button"
                aria-label="Cerrar"
              />
            </div>
          )}
        </div>

        {/* Content */}
        <div className="overflow-y-auto flex-1 p-5 flex flex-col gap-4">
          {/* Logo animado */}
          {isDownloading && (
            <div className="flex justify-center">
              <img
                src={logoColor}
                alt="Procesando"
                width={64}
                height={64}
                className="animate-pulse"
              />
            </div>
          )}

          {/* Estudiante actual y acción */}
          {progress && (
            <div className="text-sm text-gray-700">
              <p>
                <span className="font-semibold">Estudiante:</span>{" "}
                {progress.studentName || "—"}
              </p>
              <p>
                <span className="font-semibold">Acción:</span>{" "}
                {progress.status || "—"}
              </p>
            </div>
          )}

          {/* Barra de progreso */}
          {progress && (
            <div>
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>
                  {progress.current} / {progress.total}
                </span>
                <span>{percent}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-primary h-3 rounded-full transition-all duration-300"
                  style={{ width: `${percent}%` }}
                />
              </div>
            </div>
          )}

          {/* Log de actividad */}
          {downloadLog.length > 0 && (
            <div className="border rounded-lg p-3 max-h-48 overflow-y-auto bg-gray-50">
              <p className="text-xs font-semibold text-gray-500 mb-2">
                Log de actividad
              </p>
              <ul className="text-xs space-y-1">
                {downloadLog.map((entry, idx) => (
                  <li key={idx} className="flex gap-2">
                    <span className="text-green-600 shrink-0">✓</span>
                    <span className="text-gray-700">
                      {idx + 1}. {entry.name} — {entry.status}
                    </span>
                  </li>
                ))}
              </ul>
              <div ref={logEndRef} />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t shrink-0 flex justify-end">
          <button
            onClick={onClose}
            disabled={isDownloading}
            className={`px-4 py-2 rounded text-sm font-semibold transition-colors ${
              isDownloading
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-primary text-surface hover:opacity-90 cursor-pointer"
            }`}
          >
            {isDownloading ? "Descargando..." : "Cerrar"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DownloadProgressModal;
