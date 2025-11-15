/**
 * Sistema centralizado de gestión de temas
 * No necesita Context porque manipula directamente CSS variables
 */

const STORAGE_KEY = "app-theme";

// Tema por defecto (sincronizado con DataExamples/theme.js)
export const DEFAULT_THEME = {
  "color-primary": "#0b3d91",
  "color-secondary": "#f59e0b",
  "color-accent": "#10b981",
  "color-bg": "#f4f6f8",
  "color-surface": "#ffffff",
  "color-text": "#111827",
  "color-muted": "#6b7280",
  "color-error": "#dc2626",
  "color-warning": "#d97706",
  "color-info": "#0ea5e9",
};

/**
 * Aplica un tema al DOM (CSS variables en :root)
 */
export function applyTheme(themeObj) {
  if (!themeObj || typeof themeObj !== "object") {
    console.warn("Tema inválido");
    return;
  }

  const root = document.documentElement;
  Object.entries(themeObj).forEach(([key, value]) => {
    root.style.setProperty(`--${key}`, value);
  });
}

/**
 * Guarda el tema en localStorage
 */
export function saveTheme(themeObj) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(themeObj));
  } catch (error) {
    console.error("Error guardando tema:", error);
  }
}

/**
 * Carga el tema desde localStorage (o default si no existe)
 */
export function loadTheme() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      // Validar que tenga las keys esperadas
      if (Object.keys(DEFAULT_THEME).every((k) => k in parsed)) {
        return parsed;
      }
    }
  } catch (error) {
    console.error("Error cargando tema:", error);
  }
  return DEFAULT_THEME;
}

/**
 * Aplica y guarda un tema (operación atómica)
 */
export function setTheme(themeObj) {
  applyTheme(themeObj);
  saveTheme(themeObj);
}

/**
 * Inicializa el tema al arrancar la app
 */
export function initTheme() {
  const theme = loadTheme();
  applyTheme(theme);
  return theme;
}

/**
 * Restaura el tema por defecto
 */
export function resetTheme() {
  setTheme(DEFAULT_THEME);
  return DEFAULT_THEME;
}

/**
 * Obtiene el tema actual desde el DOM
 */
export function getCurrentTheme() {
  const root = document.documentElement;
  const computed = getComputedStyle(root);
  const theme = {};

  Object.keys(DEFAULT_THEME).forEach((key) => {
    const value = computed.getPropertyValue(`--${key}`).trim();
    if (value) theme[key] = value;
  });

  return theme;
}
