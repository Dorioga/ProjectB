import React from "react";
import logoColor from "../../assets/img/LogoColor.png";

/**
 * Loader modal
 * - Muestra un backdrop que bloquea la UI y un panel centrado con el logo (animación de pulso)
 * - Props: message (texto), size (px)
 */
const Loader = ({ message = "Cargando…", size = 96 }) => (
  <div
    role="status"
    aria-live="polite"
    className="fixed inset-0 z-50 flex items-center justify-center"
  >
    {/* Backdrop */}
    <div className="absolute inset-0 bg-black/50" aria-hidden="true" />

    {/* Panel centrado */}
    <div className="relative z-10 flex flex-col items-center gap-4 p-6 bg-white/90 rounded-lg shadow-lg min-w-[220px]">
      <img
        src={logoColor}
        alt="Nexus"
        width={size}
        height={size}
        className="animate-pulse"
        style={{ width: size, height: size }}
      />
      <span className="text-gray-700 font-semibold text-base text-center">
        {message}
      </span>
    </div>
  </div>
);

export default Loader;
