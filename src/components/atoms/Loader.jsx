import React from "react";

const Loader = ({ message = "Cargando…" }) => (
  <div
    className="flex flex-col items-center justify-center"
    role="status"
    aria-live="polite"
  >
    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mb-4" />
    <span className="text-blue-700 font-semibold text-lg">{message}</span>
  </div>
);

export default Loader;
