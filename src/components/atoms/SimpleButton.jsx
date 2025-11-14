import React from "react";
import * as LucideIcons from "lucide-react";
const SimpleButton = ({ msj = null, onClick, icon, bg, text, hover }) => {
  const IconComponent = LucideIcons[icon] || LucideIcons.User;
  return (
    <button
      type="submit"
      className={` flex flex-row w-full justify-center items-center px-4 py-2 rounded-md ${bg} ${text} ${hover}  focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-60 `}
      onClick={onClick}
    >
      {icon && <IconComponent />}
      {msj ? <p className="pl-2">{msj}</p> : null}
    </button>
  );
};

export default SimpleButton;
