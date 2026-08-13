import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Menu,
  X,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
} from "lucide-react";

export default function CoursePanel({
  title,
  backTo = "/dashboard/courses",
  children,
  width = 400,
  open: openProp,
  onOpenChange,
  desktopOpen: desktopOpenProp,
  onDesktopOpenChange,
}) {
  const [internalOpen, setInternalOpen] = useState(false);
  const [internalDesktopOpen, setInternalDesktopOpen] = useState(true);

  const open = openProp ?? internalOpen;
  const setOpen = onOpenChange ?? setInternalOpen;

  const desktopOpen = desktopOpenProp ?? internalDesktopOpen;
  const setDesktopOpen = onDesktopOpenChange ?? setInternalDesktopOpen;

  const header = (
    <div className="flex items-center gap-1 px-2 py-2 bg-[#1976d2] text-white">
      <Link
        to={backTo}
        className="p-1.5 rounded-full hover:bg-primary cursor-pointer"
        aria-label="Regresar a asignaturas"
      >
        <ArrowLeft size={20} />
      </Link>

      <h3 className="font-bold text-lg flex-1 leading-tight truncate">
        {title}
      </h3>

      <button
        onClick={() => setDesktopOpen(false)}
        className="hidden md:flex p-1.5 rounded-full hover:bg-primary cursor-pointer"
        aria-label="Encoger panel"
      >
        <ChevronUp size={20} />
      </button>

      <button
        onClick={() => setOpen(false)}
        className="md:hidden p-1.5 rounded-full hover:bg-primary cursor-pointer"
        aria-label="Cerrar"
      >
        <X size={20} />
      </button>
    </div>
  );

  return (
    <>
      {/* =========================
          PANEL DESKTOP
      ========================== */}
      {desktopOpen && (
        <div
          className="hidden md:flex flex-col absolute z-[1000] top-3 left-3 rounded-2xl bg-white shadow-2xl overflow-hidden max-h-[calc(100vh-24px)]"
          style={{ width }}
        >
          {header}
          <div className="p-3 overflow-y-auto">{children}</div>
        </div>
      )}

      {/* =========================
          BOTÓN EXPANDIR — DESKTOP
      ========================== */}
      {!desktopOpen && (
        <button
          onClick={() => setDesktopOpen(true)}
          className="hidden md:flex absolute z-[1000] top-3 left-3 w-10 h-10 rounded-2xl bg-white shadow-lg items-center justify-center cursor-pointer"
          aria-label="Abrir panel"
        >
          <ChevronRight size={20} className="text-[#334155]" />
        </button>
      )}

      {/* =========================
          BOTÓN HAMBURGUESA — MÓVIL
      ========================== */}
      <button
        onClick={() => setOpen(true)}
        className="md:hidden absolute z-[1000] top-3 left-3 w-10 h-10 rounded-2xl bg-white shadow-lg flex items-center justify-center cursor-pointer"
        aria-label="Abrir panel"
      >
        <Menu size={20} className="text-[#334155]" />
      </button>

      {/* =========================
          DRAWER MÓVIL
      ========================== */}
      {open && (
        <div
          className="md:hidden absolute inset-0 z-[1500] bg-black/40"
          onClick={() => setOpen(false)}
        >
          <div
            className="relative h-full bg-white overflow-y-auto shadow-2xl"
            style={{ width, maxWidth: "85vw" }}
            onClick={(e) => e.stopPropagation()}
          >
            {header}
            <div className="p-3">{children}</div>
          </div>
        </div>
      )}
    </>
  );
}
