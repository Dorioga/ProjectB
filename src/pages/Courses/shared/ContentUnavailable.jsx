import { Info } from "lucide-react";

export default function ContentUnavailable({ message }) {
  return (
    <div className="h-full w-full flex items-center justify-center p-6">
      <div className="w-[360px] max-w-full rounded-2xl p-6 text-center bg-white/95 shadow-xl">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#eef2ff] flex items-center justify-center">
          <Info size={32} className="text-[#1976d2]" />
        </div>

        <h3 className="text-lg font-bold text-gray-800 mb-1">
          Contenido no disponible
        </h3>

        <p className="text-sm text-gray-500">
          {message ??
            "El contenido de esta asignatura todavía no está disponible."}
        </p>

        <p className="mt-1 text-sm font-medium text-[#1976d2]">
          Estamos trabajando para incorporarlo próximamente.
        </p>
      </div>
    </div>
  );
}