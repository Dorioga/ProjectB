/**
 * Sistema centralizado de gestión de temas.
 * Manipula directamente variables CSS en :root — no necesita Contexto de React.
 *
 * Mantiene una caché en memoria para evitar lecturas repetidas de
 * getComputedStyle (que fuerza reflow) y de localStorage.
 */

const STORAGE_KEY = "app-theme";

/** Claves válidas del tema (usadas para filtrar propiedades desconocidas). */
const THEME_KEYS = Object.freeze([
  "color-primary",
  "color-secondary",
  "color-accent",
  "color-bg",
  "color-surface",
  "color-text",
  "color-muted",
  "color-error",
  "color-warning",
  "color-info",
]);

// Tema por defecto — sincronizado con globals.css :root
export const DEFAULT_THEME = Object.freeze({
  "color-primary": "#131a27",
  "color-secondary": "#ff9300",
  "color-accent": "#10b981",
  "color-bg": "#f4f6f8",
  "color-surface": "#ffffff",
  "color-text": "#111827",
  "color-muted": "#6b7280",
  "color-error": "#dc2626",
  "color-warning": "#ffb300",
  "color-info": "#0ea5e9",
});

/** Caché en memoria del tema activo (evita getComputedStyle / localStorage). */
let _cache = null;

/* ------------------------------------------------------------------ */
/*  Helpers internos                                                   */
/* ------------------------------------------------------------------ */

const HEX_RE = /^#(?:[0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$/i;

/**
 * Valida que un valor sea un color CSS hexadecimal válido.
 */
function isValidHex(value) {
  return typeof value === "string" && HEX_RE.test(value);
}

/**
 * Filtra y valida las entradas del tema, conservando solo claves conocidas
 * con valores hexadecimales válidos.
 */
function sanitize(themeObj) {
  const clean = {};
  for (const key of THEME_KEYS) {
    const val = themeObj[key];
    if (isValidHex(val)) {
      clean[key] = val;
    }
  }
  return clean;
}

/* ------------------------------------------------------------------ */
/*  API pública                                                        */
/* ------------------------------------------------------------------ */

/**
 * Aplica un tema al DOM (variables CSS en :root).
 * Solo aplica claves reconocidas para evitar inyección de CSS arbitrario.
 */
export function applyTheme(themeObj) {
  if (!themeObj || typeof themeObj !== "object") {
    console.warn("themeManager: tema inválido, se ignora.");
    return;
  }

  const root = document.documentElement;
  for (const key of THEME_KEYS) {
    if (key in themeObj) {
      root.style.setProperty(`--${key}`, themeObj[key]);
    }
  }
}

/**
 * Guarda el tema en localStorage.
 */
export function saveTheme(themeObj) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(themeObj));
  } catch (error) {
    console.error("themeManager: error al guardar →", error);
  }
}

/**
 * Carga el tema desde localStorage.
 * Fusiona las claves guardadas con DEFAULT_THEME para que claves nuevas
 * añadidas en futuras versiones nunca se pierdan.
 */
export function loadTheme() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = sanitize(JSON.parse(saved));
      // Fusionar con defaults para cubrir claves nuevas o eliminadas
      if (Object.keys(parsed).length > 0) {
        return { ...DEFAULT_THEME, ...parsed };
      }
    }
  } catch (error) {
    console.error("themeManager: error al cargar →", error);
  }
  return { ...DEFAULT_THEME };
}

/**
 * Aplica y guarda un tema (operación atómica). Actualiza la caché.
 */
export function setTheme(themeObj) {
  const merged = { ...DEFAULT_THEME, ...sanitize(themeObj) };
  applyTheme(merged);
  saveTheme(merged);
  _cache = merged;
}

/**
 * Inicializa el tema al iniciar la app.
 */
export function initTheme() {
  const theme = loadTheme();
  applyTheme(theme);
  _cache = theme;
  return theme;
}

/**
 * Restaura el tema por defecto.
 */
export function resetTheme() {
  setTheme(DEFAULT_THEME);
  return { ...DEFAULT_THEME };
}

/**
 * Obtiene el tema actual.
 * Devuelve la caché en memoria si existe; de lo contrario lee de localStorage
 * (mucho más barato que getComputedStyle que fuerza un reflow).
 */
export function getCurrentTheme() {
  if (_cache) return { ..._cache };

  // Fallback: reconstruir desde localStorage
  const theme = loadTheme();
  _cache = theme;
  return { ...theme };
}

/**
 * Aplica colores personalizados del backend al tema actual.
 * @param {string|null|undefined} colorPrincipal  - Color principal de la institución
 * @param {string|null|undefined} colorSecundario - Color secundario de la institución
 */
export function applyCustomColors(colorPrincipal, colorSecundario) {
  const base = loadTheme();
  const customTheme = {
    ...base,
    "color-primary": isValidHex(colorPrincipal)
      ? colorPrincipal
      : DEFAULT_THEME["color-primary"],
    "color-secondary": isValidHex(colorSecundario)
      ? colorSecundario
      : DEFAULT_THEME["color-secondary"],
  };

  setTheme(customTheme);
  return customTheme;
}
