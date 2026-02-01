import { useEffect, useState } from "react";
import Modal from "../atoms/Modal";
import ColorSelector from "../atoms/ColorSelector";
import SimpleButton from "../atoms/SimpleButton";
import {
  getCurrentTheme,
  setTheme,
  resetTheme,
} from "../../utils/themeManager";

const ThemeModal = ({
  isOpen,
  onClose,
  color: colorProp,
  setColor: setColorProp,
}) => {
  const [internalColor, setInternalColor] = useState({
    mainColor: "#0141a3",
    secondaryColor: "#ff9300",
  });

  const isControlled = colorProp && typeof setColorProp === "function";

  const color = isControlled ? colorProp : internalColor;
  const setColor = isControlled ? setColorProp : setInternalColor;

  // Cargar tema actual al abrir el modal
  useEffect(() => {
    if (isOpen) {
      const currentTheme = getCurrentTheme();
      setColor({
        mainColor:
          color?.mainColor || currentTheme["color-primary"] || "#0141a3",
        secondaryColor:
          color?.secondaryColor || currentTheme["color-secondary"] || "#ff9300",
      });
    }
    // Nota: intencionalmente NO dependemos de `color` para evitar
    // re-sincronizaciones mientras el usuario está editando.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, setColor]);

  const handleThemeChange = () => {
    // Convertir el formato del estado al formato esperado por themeManager
    const themeObj = {
      // Mantener los otros colores del tema actual
      ...getCurrentTheme(),
    };

    // Aplicar solo los colores modificados
    themeObj["color-primary"] = color.mainColor;
    themeObj["color-secondary"] = color.secondaryColor;

    // Aplicar y guardar el tema
    setTheme(themeObj);

    // Cerrar el modal
    onClose();
  };

  const handleReset = () => {
    const defaultTheme = resetTheme();
    setColor({
      mainColor: defaultTheme["color-primary"],
      secondaryColor: defaultTheme["color-secondary"],
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Modificar tema" size="xl">
      <h1 className="font-bold text-xl">Seleccionar colores</h1>
      <div className="flex flex-col gap-4 p-4">
        <div className="grid grid-cols-7 gap-6 items-center">
          <h2 className="text-lg font-semibold col-span-3">Color primario:</h2>
          <ColorSelector
            color={color.mainColor}
            setColor={(newColor) =>
              setColor((prev) => ({ ...prev, mainColor: newColor }))
            }
          />
        </div>
        <div className="grid grid-cols-7 gap-6 items-center">
          <h2 className="text-lg font-semibold col-span-3">
            Color secundario:
          </h2>
          <ColorSelector
            color={color.secondaryColor}
            setColor={(newColor) =>
              setColor((prev) => ({ ...prev, secondaryColor: newColor }))
            }
          />
        </div>
      </div>

      <h3 className="font-bold text-xl">Vista previa</h3>
      <div className="w-full grid grid-cols-7 border rounded-lg bg-surface h-80">
        <div
          className="col-span-2"
          style={{ backgroundColor: color.mainColor }}
        ></div>
        <div className="p-2 col-span-5">
          <div
            className="w-full h-full border rounded-lg p-4"
            style={{
              backgroundColor: getCurrentTheme()["color-bg"] || "#f4f6f8",
            }}
          >
            <div
              className="w-1/3 h-10 rounded-lg flex items-center justify-center"
              style={{
                backgroundColor: color.secondaryColor,
                color: getCurrentTheme()["color-surface"] || "#ffffff",
              }}
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
          text="text-surface"
          icon="RotateCcw"
        />
        <SimpleButton
          msj="Guardar cambios"
          onClick={handleThemeChange}
          bg="bg-accent"
          text="text-surface"
          icon="Save"
        />
      </div>
    </Modal>
  );
};

export default ThemeModal;
