import { useEffect, useMemo, useState } from "react";
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
    mainColor: "#131a27",
    secondaryColor: "#ff9300",
  });

  // Snapshot del tema al abrir el modal (evita llamar getCurrentTheme en cada render)
  const [themeSnapshot, setThemeSnapshot] = useState(null);

  const isControlled = Boolean(colorProp) && typeof setColorProp === "function";

  const color = isControlled ? colorProp : internalColor;

  // Helper para aplicar un patch al color (compatible con controlado y no-controlado)
  const updateColor = (patch) => {
    const next = { ...color, ...patch };
    if (isControlled) {
      // El parent puede pasar un handler que espera el objeto completo
      // (ProfileSchool usa esa firma). Llamamos con el objeto completo —
      // esto funciona también si el parent pasó un setter de `useState`.
      setColorProp(next);
    } else {
      setInternalColor(next);
    }
  };

  // Cargar tema actual al abrir el modal
  useEffect(() => {
    if (isOpen) {
      const currentTheme = getCurrentTheme();
      setThemeSnapshot(currentTheme);
      const initial = {
        mainColor:
          color?.mainColor || currentTheme["color-primary"] || "#131a27",
        secondaryColor:
          color?.secondaryColor || currentTheme["color-secondary"] || "#ff9300",
      };

      if (isControlled) setColorProp(initial);
      else setInternalColor(initial);
    }
    // Nota: intencionalmente NO dependemos de `color` para evitar
    // re-sincronizaciones mientras el usuario está editando.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, setColorProp]);
  // Colores derivados del snapshot (para la vista previa)
  const previewBg = useMemo(
    () => themeSnapshot?.["color-bg"] || "#f4f6f8",
    [themeSnapshot],
  );
  const previewSurface = useMemo(
    () => themeSnapshot?.["color-surface"] || "#ffffff",
    [themeSnapshot],
  );

  const handleThemeChange = () => {
    const themeObj = {
      ...(themeSnapshot ?? getCurrentTheme()),
      "color-primary": color.mainColor,
      "color-secondary": color.secondaryColor,
    };

    setTheme(themeObj);
    onClose();
  };

  const handleReset = () => {
    const defaultTheme = resetTheme();
    updateColor({
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
            setColor={(newColor) => updateColor({ mainColor: newColor })}
          />
        </div>
        <div className="grid grid-cols-7 gap-6 items-center">
          <h2 className="text-lg font-semibold col-span-3">
            Color secundario:
          </h2>
          <ColorSelector
            color={color.secondaryColor}
            setColor={(newColor) => updateColor({ secondaryColor: newColor })}
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
            style={{ backgroundColor: previewBg }}
          >
            <div
              className="w-1/3 h-10 rounded-lg flex items-center justify-center"
              style={{
                backgroundColor: color.secondaryColor,
                color: previewSurface,
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
