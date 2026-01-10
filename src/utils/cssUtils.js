/**
 * Utilitarias CSS para estilos de componentes
 */

/**
 * Aplica estilos disabled a inputs y selects usando Tailwind CSS
 * @param {string} baseClassName - Clases CSS base del elemento
 * @param {boolean} isDisabled - Si el elemento está deshabilitado
 * @returns {string} Clases CSS con estilos disabled aplicados
 */
export const getInputClassName = (baseClassName, isDisabled = false) => {
  if (isDisabled) {
    return `${baseClassName} bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200 opacity-60`;
  }
  return baseClassName;
};

/**
 * Aplica estilos disabled a labels usando Tailwind CSS
 * @param {string} baseClassName - Clases CSS base del label
 * @param {boolean} isDisabled - Si el campo relacionado está deshabilitado
 * @returns {string} Clases CSS con estilos disabled aplicados
 */
export const getLabelClassName = (baseClassName = "", isDisabled = false) => {
  if (isDisabled) {
    return `${baseClassName} text-gray-400`.trim();
  }
  return baseClassName;
};

/**
 * Aplica estilos disabled automáticamente basado en la prop disabled del elemento
 * @param {string} baseClassName - Clases CSS base
 * @param {object} props - Props del elemento que puede contener disabled
 * @returns {string} Clases CSS con estilos disabled si aplica
 */
export const getDisabledInputClassName = (baseClassName, props = {}) => {
  return getInputClassName(baseClassName, props.disabled);
};

/**
 * Aplica estilos disabled automáticamente a labels basado en props
 * @param {string} baseClassName - Clases CSS base del label
 * @param {object} props - Props que puede contener disabled
 * @returns {string} Clases CSS con estilos disabled si aplica
 */
export const getDisabledLabelClassName = (baseClassName = "", props = {}) => {
  return getLabelClassName(baseClassName, props.disabled);
};

/**
 * Crea props completas para un input con estilos disabled aplicados
 * @param {object} inputProps - Props originales del input
 * @param {string} baseClassName - Clases CSS base
 * @returns {object} Props con className actualizada según disabled
 */
export const createInputProps = (inputProps, baseClassName) => {
  return {
    ...inputProps,
    className: getInputClassName(baseClassName, inputProps.disabled),
  };
};

/**
 * Hook personalizado para aplicar estilos disabled automáticamente
 * @param {string} baseClassName - Clases CSS base
 * @param {boolean} disabled - Estado disabled
 * @returns {object} Objeto con className y propiedades de estilo
 */
export const useDisabledStyles = (baseClassName, disabled = false) => {
  return {
    className: getInputClassName(baseClassName, disabled),
    labelClassName: getLabelClassName("", disabled),
    disabled,
  };
};
