import React, { useState, useEffect, useRef } from "react";

const CustomSelect = ({
  value,
  options,
  onChange,
  disabled = false,
  loading = false,
  placeholder = "Seleccionar",
  placeholderLoading = "Cargando...",
  emptyMessage = "Sin opciones disponibles",
  getOptionValue = (opt) => opt.id_type_logro ?? opt.id,
  getOptionLabel = (opt) => opt.nombre_tipo_logro || opt.nombre || opt.name,
  className = "",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [isOpen]);

  const selectedOption = Array.isArray(options)
    ? options.find((o) => String(getOptionValue(o)) === String(value))
    : null;

  const displayText = selectedOption
    ? getOptionLabel(selectedOption)
    : value
      ? String(value)
      : placeholder;

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      <button
        type="button"
        onClick={() => !disabled && setIsOpen((prev) => !prev)}
        className="w-full p-2 border rounded bg-surface text-sm text-left tour-tipo-logro flex items-center justify-between gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
        disabled={disabled}
      >
        <span className={value ? "" : "text-gray-400"}>{displayText}</span>
        <span className={`ml-1 text-[10px] transition-transform ${isOpen ? "rotate-180" : ""}`}>
          ▼
        </span>
      </button>
      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute z-50 mt-1 w-full border rounded bg-surface shadow-lg max-h-60 overflow-y-auto">
            <div
              className="p-2 hover:bg-gray-100 cursor-pointer text-sm border-b"
              onClick={() => {
                onChange("");
                setIsOpen(false);
              }}
            >
              {loading ? placeholderLoading : placeholder}
            </div>
            {!loading &&
              (!Array.isArray(options) || options.length === 0) && (
                <div className="p-2 text-sm text-gray-400 cursor-default">
                  {emptyMessage}
                </div>
              )}
            {Array.isArray(options) &&
              options.map((opt) => (
                <div
                  key={getOptionValue(opt)}
                  className={`p-2 hover:bg-gray-100 cursor-pointer text-sm text-left ${
                    String(getOptionValue(opt)) === String(value)
                      ? "bg-primary/10 font-medium"
                      : ""
                  }`}
                  onClick={() => {
                    onChange(getOptionValue(opt));
                    setIsOpen(false);
                  }}
                >
                  {getOptionLabel(opt)}
                </div>
              ))}
          </div>
        </>
      )}
    </div>
  );
};

export default CustomSelect;
