// Utilidades de validación reutilizables para formularios
// Exporta funciones puras que devuelven { valid: boolean, msg?: string }

/** Comprueba que un valor no sea vacío (null/undefined/""/[]). */
export const required = (value, msg = "Este campo es obligatorio") => {
  const empty =
    value === undefined ||
    value === null ||
    (typeof value === "string" && value.trim() === "") ||
    (Array.isArray(value) && value.length === 0);
  return { valid: !empty, msg: empty ? msg : undefined };
};

/** Comprueba longitud mínima de una cadena/array */
export const minLength = (value, min, msg) => {
  const len = value == null ? 0 : (value.length ?? 0);
  return {
    valid: len >= min,
    msg: len >= min ? undefined : msg || `Mínimo ${min} caracteres`,
  };
};

/** Comprueba longitud máxima de una cadena/array */
export const maxLength = (value, max, msg) => {
  const len = value == null ? 0 : (value.length ?? 0);
  return {
    valid: len <= max,
    msg: len <= max ? undefined : msg || `Máximo ${max} caracteres`,
  };
};

/** Valida formato de email simple */
export const isEmail = (value, msg = "Dirección de correo inválida") => {
  if (value == null || String(value).trim() === "") return { valid: true };
  // RFC-complete not required here; usar expresión razonable
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return {
    valid: re.test(String(value)),
    msg: !re.test(String(value)) ? msg : undefined,
  };
};

/** Comprueba que el valor sea numérico */
export const isNumber = (value, msg = "Debe ser un número") => {
  if (value === "" || value === null || value === undefined)
    return { valid: false, msg };
  const n = Number(String(value).replace(",", "."));
  return { valid: !Number.isNaN(n), msg: Number.isNaN(n) ? msg : undefined };
};

/** Comprueba rango numérico (incluye límites) */
export const numberRange = (value, min, max, msg) => {
  const res = isNumber(value);
  if (!res.valid) return res;
  const n = Number(String(value).replace(",", "."));
  const ok = (min == null || n >= min) && (max == null || n <= max);
  return {
    valid: ok,
    msg: ok ? undefined : msg || `Valor entre ${min} y ${max}`,
  };
};

/** Comprueba con regex */
export const matchesPattern = (value, pattern, msg = "Formato inválido") => {
  if (value == null || String(value).trim() === "") return { valid: true };
  const re = pattern instanceof RegExp ? pattern : new RegExp(pattern);
  return {
    valid: re.test(String(value)),
    msg: re.test(String(value)) ? undefined : msg,
  };
};

/** Valida que el valor contenga solo texto (letras, espacios y caracteres comunes en español) */
export const isText = (value, msg = "Sólo se permiten letras y espacios") => {
  if (value == null || String(value).trim() === "") return { valid: true };
  // Permitir letras (incluye acentos), espacios, guiones y apóstrofes
  const re = /^[A-Za-zÁÉÍÓÚáéíóúÑñÜü\s\-']+$/u;
  return {
    valid: re.test(String(value)),
    msg: re.test(String(value)) ? undefined : msg,
  };
};

/** Combina múltiples validadores en uno solo (devuelve el primer error) */
export const compose =
  (...validators) =>
  (value) => {
    for (const v of validators) {
      const res = typeof v === "function" ? v(value) : { valid: true };
      if (!res.valid) return res;
    }
    return { valid: true };
  };

/** Validadores rápidos listos para usar en formularios */
export const validators = {
  required,
  minLength,
  maxLength,
  isEmail,
  isNumber,
  numberRange,
  matchesPattern,
  isText,
  compose,
};

export default validators;
