import { useEffect } from "react";
import { CircleX } from "lucide-react";

const DownloadErrorModal = ({
  isOpen = false,
  onClose = () => {},
  errors = [],
}) => {
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  if (!isOpen || !errors || errors.length === 0) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="bg-surface rounded shadow-lg w-full max-w-2xl max-h-[80vh] flex flex-col"
        onMouseDown={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="w-full flex flex-row justify-between items-center font-bold bg-red-600 text-surface p-4 rounded-t shrink-0">
          <span className="text-xl">Resumen de errores</span>
          <div className="bg-white/20 rounded-full">
            <CircleX
              className="cursor-pointer text-surface h-8 w-8"
              onClick={onClose}
              role="button"
              aria-label="Cerrar"
            />
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto flex-1 p-5">
          <p className="text-sm text-gray-600 mb-3">
            Se encontraron{" "}
            <span className="font-semibold text-red-600">{errors.length}</span>{" "}
            documento(s) con error:
          </p>

          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="bg-red-50 text-left text-red-700">
                <th className="p-2 border border-red-200">#</th>
                <th className="p-2 border border-red-200">Estudiante</th>
                <th className="p-2 border border-red-200">Tipo</th>
                <th className="p-2 border border-red-200">Error</th>
              </tr>
            </thead>
            <tbody>
              {errors.map((err, idx) => (
                <tr
                  key={idx}
                  className="border-b border-red-100 hover:bg-red-50 transition-colors"
                >
                  <td className="p-2 border border-red-200 text-gray-500">
                    {idx + 1}
                  </td>
                  <td className="p-2 border border-red-200 font-medium text-gray-800">
                    {err.estudiante}
                  </td>
                  <td className="p-2 border border-red-200 text-gray-600">
                    {err.tipo}
                  </td>
                  <td className="p-2 border border-red-200 text-red-600">
                    {err.error}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="p-4 border-t shrink-0 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded text-sm font-semibold bg-primary text-surface hover:opacity-90 cursor-pointer transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default DownloadErrorModal;
