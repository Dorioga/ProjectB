import React, { useId } from "react";
import {
  Aperture, ArrowLeftCircle, BookOpen, CalendarCheck, Camera, Check,
  ClipboardList, CreditCard, Download, DownloadCloud, Edit, ExternalLink,
  Eye, FileDown, FileText, FileUp, HelpCircle, ListPlus, PanelLeftOpen,
  PanelRightOpen, Pencil, Plus, RefreshCw, RotateCcw, Save, Search, Send,
  Trash2, Upload, User, UserSearch, View, X,
} from "lucide-react";

const ICON_MAP = {
  Aperture, ArrowLeftCircle, BookOpen, CalendarCheck, Camera, Check,
  ClipboardList, CreditCard, Download, DownloadCloud, Edit, ExternalLink,
  Eye, FileDown, FileText, FileUp, HelpCircle, ListPlus, PanelLeftOpen,
  PanelRightOpen, Pencil, Plus, RefreshCw, RotateCcw, Save, Search, Send,
  Trash2, Upload, User, UserSearch, View, X,
};
const SimpleButton = ({
  msj = null,
  msjtooltip = null,
  // `textSize` permite pasar clases de Tailwind para el tamaño del texto (p. ej. "text-2xl", "text-8xl")
  textSize = "",
  onClick,
  icon,
  bg,
  text,
  hover,
  tooltip = false, // si es true fuerza tooltip; si es false y msj==null y msjtooltip existe, activamos tooltip automáticamente
  noRounded = false,
  disabled = false,
  type = "submit",
  className = "",
}) => {
  const id = useId();
  const tooltipId = `simplebutton-tooltip-${id}`;
  const IconComponent = ICON_MAP[icon] || User;

  // Determinar si el tooltip debe mostrarse
  const tooltipEnabled =
    Boolean(tooltip) || (msj == null && Boolean(msjtooltip));

  // Texto a mostrar en el tooltip: preferimos msjtooltip cuando está disponible
  const tooltipText = msjtooltip ?? msj;

  return (
    <button
      type={type}
      aria-describedby={tooltipEnabled ? tooltipId : undefined}
      className={`relative group flex flex-row w-full justify-center items-center cursor-pointer ${
        noRounded ? "p-3" : "rounded-lg p-2"
      } ${bg} ${text} ${hover}  focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-60 ${className}`}
      onClick={onClick}
      disabled={disabled}
    >
      {icon && <IconComponent />}

      {/* Si tooltipEnabled no renderizamos el texto dentro del botón y mostramos tooltip en hover */}
      {!tooltipEnabled && msj ? (
        <p className={`pl-2 ${textSize}`}>{msj}</p>
      ) : null}

      {tooltipEnabled && tooltipText ? (
        <div
          id={tooltipId}
          role="tooltip"
          className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 whitespace-nowrap rounded px-2 py-1 text-xs bg-black text-white shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-150 z-50"
        >
          {tooltipText}
        </div>
      ) : null}
    </button>
  );
};

export default SimpleButton;
