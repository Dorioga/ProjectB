import React, { useEffect, useRef } from "react";
import SimpleButton from "./SimpleButton";
import { CircleX } from "lucide-react";

const Modal = ({
  isOpen = false,
  onClose = () => {},
  children,
  title,
  size = "lg", // 1. Añade la prop 'size' con un valor por defecto
}) => {
  const containerRef = useRef(null);

  // 2. Mapea los tamaños a las clases de Tailwind CSS
  const sizeClasses = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg", // El que tenías por defecto
    xl: "max-w-xl",
    "2xl": "max-w-2xl",
    "3xl": "max-w-3xl",
    "4xl": "max-w-4xl",
    full: "max-w-full",
  };

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const onBackdropMouseDown = (e) => {
    // close when clicking outside the modal content
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
        // 3. Aplica la clase de tamaño dinámicamente
        className={`bg-white rounded shadow-lg w-full max-h-[90vh] flex flex-col ${
          sizeClasses[size] || sizeClasses.lg
        }`}
        onMouseDown={(e) => e.stopPropagation()}
      >
        {title && (
          <div className="w-full text-xl flex flex-row justify-between items-center font-semibold bg-primary text-white p-6 rounded-t shrink-0">
            {title}
            <div className="bg-error rounded-full">
              <CircleX
                className="cursor-pointer text-white h-10 w-10"
                onClick={onClose}
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
