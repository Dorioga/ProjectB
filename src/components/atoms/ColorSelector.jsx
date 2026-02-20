import React, { useEffect, useId, useState } from "react";

const ColorSelector = ({ color, setColor }) => {
  const id = useId();
  const [colorSelected, setColorSelected] = useState(color || "#000000");

  // Sincronizar estado interno cuando el prop cambie (componente controlado)
  useEffect(() => {
    if (typeof color === "string" && color !== colorSelected) {
      setColorSelected(color);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [color]);

  const handleColorChange = (event) => {
    setColorSelected(event.target.value);
    setColor(event.target.value);
  };

  return (
    <div className="flex flex-row gap-4 col-span-4 items-center">
      {/* Label accesible para el selector de color */}
      <label htmlFor={`color-input-${id}`} className="sr-only">
        Selector de color
      </label>
      <input
        id={`color-input-${id}`}
        type="color"
        value={colorSelected}
        onChange={handleColorChange}
        aria-label="Selector de color"
      />
      <p>Color seleccionado: {colorSelected}</p>
    </div>
  );
};

export default ColorSelector;
