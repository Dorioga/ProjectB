import React, { useId } from "react";
import * as LucideIcons from "lucide-react";
const SimpleButton = ({
  msj = null,
  msjtooltip = null,
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
  const IconComponent = LucideIcons[icon] || LucideIcons.User;

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
        noRounded ? "p-3" : "rounded-md p-2"
      } ${bg} ${text} ${hover}  focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-60 ${className}`}
      onClick={onClick}
      disabled={disabled}
    >
      {icon && <IconComponent />}

      {/* Si tooltipEnabled no renderizamos el texto dentro del botón y mostramos tooltip en hover */}
      {!tooltipEnabled && msj ? <p className="pl-2">{msj}</p> : null}

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
