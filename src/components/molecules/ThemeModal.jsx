import { use, useState } from "react";
import Modal from "../atoms/Modal";
import ColorSelector from "../atoms/ColorSelector";

const ThemeModal = ({ isOpen, onClose }) => {
  const [color, setColor] = useState({
    primary: "#0b3d91",
    secondary: "#f59e0b",
    bg: "#F4F6F8",
  });

  const handleThemeChange = (theme) => {
    setCurrentTheme(theme);
    // Aquí puedes integrar con ThemeManager
    // ThemeManager.setTheme(theme);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Modificar Tema " size="xl">
      <h1 className="font-bold text-xl">Seleccionar Colores</h1>
      <div className="flex flex-col gap-4 p-4">
        <div className="grid grid-cols-7 gap-6 items-center">
          <h2 className="text-lg font-semibold  col-span-3">Color Primario:</h2>
          <ColorSelector
            color={color.primary}
            setColor={(newColor) =>
              setColor((prev) => ({ ...prev, primary: newColor }))
            }
          />
        </div>
        <div className="grid grid-cols-7 gap-6 items-center">
          <h2 className="text-lg font-semibold  col-span-3">
            Color Secundario:
          </h2>
          <ColorSelector
            color={color.secondary}
            setColor={(newColor) =>
              setColor((prev) => ({ ...prev, secondary: newColor }))
            }
          />
        </div>
        <div className="grid grid-cols-7 gap-6 items-center">
          <h2 className="text-lg font-semibold  col-span-3">Color Fondo:</h2>
          <ColorSelector
            color={color.bg}
            setColor={(newColor) =>
              setColor((prev) => ({ ...prev, bg: newColor }))
            }
          />
        </div>
      </div>
      <h3 className="font-bold text-xl">Vista Previa</h3>
      <div className="w-full grid grid-cols-7  border rounded-lg bg-white h-80">
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
              className="w-1/3 h-10 rounded-lg flex items-center justify-center "
              style={{ backgroundColor: color.secondary, color: "#fff" }}
            >
              Boton Prueba
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default ThemeModal;
