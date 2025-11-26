import { useEffect, useState } from "react";
import Modal from "../atoms/Modal";
import ColorSelector from "../atoms/ColorSelector";
import SimpleButton from "../atoms/SimpleButton";
import {
  getCurrentTheme,
  setTheme,
  resetTheme,
} from "../../utils/themeManager";

const ThemeModal = ({ isOpen, onClose }) => {
  const [color, setColor] = useState({
    primary: "#0b3d91",
    secondary: "#f59e0b",
    bg: "#f4f6f8",
  });

  // Cargar tema actual al abrir el modal
  useEffect(() => {
    if (isOpen) {
      const currentTheme = getCurrentTheme();
      setColor({
        primary: currentTheme["color-primary"] || "#0b3d91",
        secondary: currentTheme["color-secondary"] || "#f59e0b",
        bg: currentTheme["color-bg"] || "#f4f6f8",
      });
    }
  }, [isOpen]);

  const handleThemeChange = () => {
    // Convertir el formato del estado al formato esperado por themeManager
    const themeObj = {
      "color-primary": color.primary,
      "color-secondary": color.secondary,
      "color-bg": color.bg,
      // Mantener los otros colores del tema actual
      ...getCurrentTheme(),
    };

    // Aplicar solo los colores modificados
    themeObj["color-primary"] = color.primary;
    themeObj["color-secondary"] = color.secondary;
    themeObj["color-bg"] = color.bg;

    // Aplicar y guardar el tema
    setTheme(themeObj);

    // Cerrar el modal
    onClose();
  };

  const handleReset = () => {
    const defaultTheme = resetTheme();
    setColor({
      primary: defaultTheme["color-primary"],
      secondary: defaultTheme["color-secondary"],
      bg: defaultTheme["color-bg"],
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Modificar tema" size="xl">
      <h1 className="font-bold text-xl">Seleccionar colores</h1>
      <div className="flex flex-col gap-4 p-4">
        <div className="grid grid-cols-7 gap-6 items-center">
          <h2 className="text-lg font-semibold col-span-3">Color primario:</h2>
          <ColorSelector
            color={color.primary}
            setColor={(newColor) =>
              setColor((prev) => ({ ...prev, primary: newColor }))
            }
          />
        </div>
        <div className="grid grid-cols-7 gap-6 items-center">
          <h2 className="text-lg font-semibold col-span-3">
            Color secundario:
          </h2>
          <ColorSelector
            color={color.secondary}
            setColor={(newColor) =>
              setColor((prev) => ({ ...prev, secondary: newColor }))
            }
          />
        </div>
        <div className="grid grid-cols-7 gap-6 items-center">
          <h2 className="text-lg font-semibold col-span-3">Color de fondo:</h2>
          <ColorSelector
            color={color.bg}
            setColor={(newColor) =>
              setColor((prev) => ({ ...prev, bg: newColor }))
            }
          />
        </div>
      </div>

      <h3 className="font-bold text-xl">Vista previa</h3>
      <div className="w-full grid grid-cols-7 border rounded-lg bg-white h-80">
        <div
          className="col-span-2"
          style={{ backgroundColor: color.primary }}
        ></div>
        <div className="p-2 col-span-5">
          <div
            className="w-full h-full border rounded-lg p-4"
            style={{ backgroundColor: color.bg }}
          >
            <div
              className="w-1/3 h-10 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: color.secondary, color: "#fff" }}
            >
              Botón de prueba
            </div>
          </div>
        </div>
      </div>

      <div className="pt-2 flex gap-2">
        <SimpleButton
          msj="Restaurar por defecto"
          onClick={handleReset}
          bg="bg-gray-500"
          text="text-white"
          icon="RotateCcw"
        />
        <SimpleButton
          msj="Guardar cambios"
          onClick={handleThemeChange}
          bg="bg-accent"
          text="text-white"
          icon="Save"
        />
      </div>
    </Modal>
  );
};

export default ThemeModal;
