import React, { useEffect, useRef } from "react";

const Modal = ({ isOpen = false, onClose = () => {}, children, title }) => {
  const containerRef = useRef(null);

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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onMouseDown={onBackdropMouseDown}
      aria-modal="true"
      role="dialog"
    >
      <div
        ref={containerRef}
        className="bg-white rounded shadow-lg max-w-lg w-full p-4 m-4"
        onMouseDown={(e) => e.stopPropagation()}
      >
        {title && <div className="text-lg font-semibold mb-2">{title}</div>}
        <div>{children}</div>
        <div className="mt-4 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default Modal;
