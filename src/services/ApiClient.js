import axios from "axios";

const BASE =
  import.meta.env.VITE_API_URL || "https://backend-barranquilla.onrender.com";

const apiClient = axios.create({
  baseURL: BASE,
  timeout: 0, // sin timeout para uploads grandes
});

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
  (res) => res.data,
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

    const err = new Error(
      res?.data?.mensaje ||
        res?.data?.message ||
        error.message ||
        "Error de la API"
    );
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
