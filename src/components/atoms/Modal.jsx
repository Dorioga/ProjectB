import React, { useEffect, useRef } from "react";
import SimpleButton from "./SimpleButton";
import { CircleX } from "lucide-react";

const Modal = ({
  isOpen = false,
  onClose = () => {},
  children,
  title,
  size = "lg", // tamaño por defecto
}) => {
  const containerRef = useRef(null);

  // Mapear tamaños a clases Tailwind
  const sizeClasses = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
    "2xl": "max-w-2xl",
    "3xl": "max-w-3xl",
    "4xl": "max-w-4xl",
    full: "max-w-full",
  };

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e) => {
      if (e.key === "Escape") onClose(); // tecla Escape cierra el modal
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const onBackdropMouseDown = (e) => {
    // cerrar al hacer click fuera del contenido del modal
    if (containerRef.current && !containerRef.current.contains(e.target)) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onMouseDown={onBackdropMouseDown}
      aria-modal="true"
      role="dialog"
    >
      <div
        ref={containerRef}
        className={`bg-surface rounded shadow-lg w-full max-h-[90vh] flex flex-col ${
          sizeClasses[size] || sizeClasses.lg
        }`}
        onMouseDown={(e) => e.stopPropagation()}
      >
        {title && (
          <div className="w-full text-xl flex flex-row justify-between items-center font-semibold bg-primary text-surface p-6 rounded-t shrink-0">
            {title}
            <div className="bg-error rounded-full">
              <CircleX
                className="cursor-pointer text-surface h-10 w-10"
                onClick={onClose}
                role="button"
                aria-label="Cerrar"
              />
            </div>
          </div>
        )}
        <div className="overflow-y-auto flex-1 p-4">{children}</div>
      </div>
    </div>
  );
};

export default Modal;
