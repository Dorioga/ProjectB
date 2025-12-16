import React from "react";
import * as LucideIcons from "lucide-react";
const SimpleButton = ({
  msj = null,
  onClick,
  icon,
  bg,
  text,
  hover,
  noRounded = false,
  disabled = false,
  type = "submit",
  className = "",
}) => {
  const IconComponent = LucideIcons[icon] || LucideIcons.User;
  return (
    <button
      type={type}
      className={` flex flex-row w-full justify-center items-center cursor-pointer ${
        noRounded ? "p-3" : "rounded-md p-2"
      } ${bg} ${text} ${hover}  focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-60 ${className}`}
      onClick={onClick}
      disabled={disabled}
    >
      {icon && <IconComponent />}
      {msj ? <p className="pl-2">{msj}</p> : null}
    </button>
  );
};

export default SimpleButton;
