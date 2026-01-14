import axios from "axios";

const BASE =
  import.meta.env.VITE_API_URL || "https://backend-barranquilla.onrender.com";

const apiClient = axios.create({
  baseURL: BASE,
  timeout: 0, // sin timeout para uploads grandes
});

// Sistema de eventos para notificaciones
const eventBus = {
  listeners: [],
  on(callback) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter((cb) => cb !== callback);
    };
  },
  emit(message, type = "error") {
    this.listeners.forEach((callback) => callback(message, type));
  },
};

// Exportar para que el NotificationContext se suscriba
export { eventBus };

apiClient.interceptors.request.use((config) => {
  // Asegurar que headers esté inicializado
  config.headers = config.headers || {};

  const token = localStorage.getItem("token");
  if (token) {
    config.headers.token = token;
  }
  // Si envías FormData, NO fijes Content-Type
  if (config.data instanceof FormData) {
    delete config.headers["Content-Type"];
  } else {
    config.headers["Content-Type"] = "application/json";
    config.headers["Accept"] = "application/json";
  }
  return config;
});

// Interceptor de respuestas: normaliza errores y maneja problemas de autenticación
apiClient.interceptors.response.use(
  (res) => {
    const data = res.data;

    // ✅ Validar que el código de respuesta sea "OK"
    if (data && typeof data === "object" && "code" in data) {
      if (data.code !== "OK") {
        // Si el código no es OK, rechazar la promesa
        const errorMessage =
          data.mensaje ||
          data.message ||
          data.msg ||
          `Error: Código de respuesta ${data.code}`;

        // Emitir evento para notificación global
        eventBus.emit(errorMessage, "error");

        const error = new Error(errorMessage);
        error.status = res.status;
        error.data = data;
        error.code = data.code;
        return Promise.reject(error);
      }
    }

    return data;
  },
  (error) => {
    const res = error.response;

    // Manejar errores de autenticación (token inválido/expirado)
    if (res?.status === 401 || res?.data?.code === "UN001") {
      console.warn("Token inválido o expirado:", res?.data);
      // Limpiar token inválido del localStorage
      try {
        localStorage.removeItem("token");
      } catch (e) {
        console.warn("No se pudo limpiar el localStorage:", e);
      }
    }

    const errorMessage =
      res?.data?.mensaje ||
      res?.data?.message ||
      res?.data?.msg ||
      error.message ||
      "Error de la API";

    // Emitir evento para notificación global
    eventBus.emit(errorMessage, "error");

    const err = new Error(errorMessage);
    err.status = res?.status;
    err.data = res?.data;
    err.code = res?.data?.code;
    return Promise.reject(err);
  }
);

// Función auxiliar para compatibilidad
export function setAuthToken(token) {
  if (token) {
    localStorage.setItem("token", token);
  } else {
    localStorage.removeItem("token");
  }
}

// Mantener compatibilidad con el formato anterior
export const ApiClient = {
  instance: apiClient,
  get: (path, params = {}, config = {}) =>
    apiClient.get(path, { params, ...config }),
  post: (path, data, config = {}) => apiClient.post(path, data, config),
  put: (path, data, config = {}) => apiClient.put(path, data, config),
  del: (path, config = {}) => apiClient.delete(path, config),
};

export default apiClient;
