import React, { useState } from "react";

const ColorSelector = ({ color, setColor }) => {
  let [colorSelected, setColorSelected] = useState(color);
  const handleColorChange = (event) => {
    setColorSelected(event.target.value);
    setColor(event.target.value);
  };

  return (
    <div className="flex flex-row gap-4 col-span-4 items-center">
      {/* Label accesible para el selector de color */}
      <label htmlFor="color-input" className="sr-only">
        Selector de color
      </label>
      <input
        id="color-input"
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
