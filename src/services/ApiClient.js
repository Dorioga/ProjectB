import axios from "axios";

//const BASE = import.meta.env.VITE_API_URL || "https://nexusplataforma.com/api";
const BASE =
  import.meta.env.VITE_API_URL || "https://backend-barranquilla.onrender.com";
//https://nexusplataforma.com/api/
//"https://backend-barranquilla.onrender.com"

const apiClient = axios.create({
  baseURL: BASE,
  timeout: 0,
});

let apiDisabled = false; // <<< bandera global

export function setApiDisabled(value = true) {
  apiDisabled = value;
}

export function isApiDisabled() {
  return apiDisabled;
}

apiClient.interceptors.request.use((config) => {
  // si las peticiones están desactivadas devolvemos un resultado
  // “fake” en lugar de seguir al servidor
  if (apiDisabled) {
    // puedes devolver una promesa resuelta con {data:…} o
    // cancelar para que el caller lo maneje como un error
    return Promise.resolve({
      ...config,
      data: { code: "OK", mock: true, result: null }, // lo que necesites
    });
  }

  config.headers = config.headers || {};
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  if (config.data instanceof FormData) {
    delete config.headers["Content-Type"];
  } else {
    config.headers["Content-Type"] = "application/json";
    config.headers["Accept"] = "application/json";
  }
  return config;
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

apiClient.interceptors.response.use(
  (res) => {
    const data = res.data;
    const config = res?.config || {};

    // ✅ Validar que el código de respuesta sea "OK"
    if (data && typeof data === "object" && "code" in data) {
      if (data.code !== "OK") {
        // Si el código no es OK, rechazar la promesa
        const errorMessage =
          data.mensaje ||
          data.message ||
          data.msg ||
          `Error: Código de respuesta ${data.code}`;

        // Emitir evento para notificación global (omitido si request marca `silent`)
        if (!config.silent) {
          eventBus.emit(errorMessage, "error");
        }

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
    const config = error?.config || {};

    // Manejar errores de autenticación (token inválido/expirado)
    if (res?.status === 401 || res?.data?.code === "UN001") {
      console.warn("Token inválido o expirado:", res?.data);
      // Limpiar token inválido del localStorage
      try {
        localStorage.removeItem("token");
      } catch (e) {
        console.warn("No se pudo limpiar el localStorage:", e);
      }
      // además avisar a cualquier escucha que la sesión caducó
      // notificar a quienes quieran manejar la expiración y mostrar mensaje
      eventBus.emit("sessionExpired", "auth");
      eventBus.emit(
        "Tu sesión ha expirado. Por favor inicia sesión de nuevo.",
        "error",
      );
    }

    const errorMessage =
      res?.data?.mensaje ||
      res?.data?.message ||
      res?.data?.msg ||
      error.message ||
      "Error de la API";

    // Emitir evento para notificación global (omitido si request marca `silent`)
    if (!config.silent) {
      eventBus.emit(errorMessage, "error");
    }

    const err = new Error(errorMessage);
    err.status = res?.status;
    err.data = res?.data;
    err.code = res?.data?.code;
    return Promise.reject(err);
  },
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
  patch: (path, data, config = {}) => apiClient.patch(path, data, config),
  del: (path, config = {}) => apiClient.delete(path, config),
};

export default apiClient;
/*try {
   await axios.post("/refresh-token", {
      refreshToken: storedRefreshToken (esto es el localstorage donde debe poner el refreshtoken)
   });
} catch (err) {
   ejecutar metodo que le voy a crear para cerrar sesion como tal
}*/
