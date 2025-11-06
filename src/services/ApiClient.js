import axios from "axios";

const BASE = import.meta.env.VITE_API_URL || "http://localhost:4000/api";

let authToken = null;

/**
 * Instancia axios centralizada
 */
const instance = axios.create({
  baseURL: BASE,
  headers: {
    Accept: "application/json",
  },
  withCredentials: true, // útil si el backend usa cookies HttpOnly
});

/**
 * Request interceptor: añade Authorization si hay token en memoria
 */
instance.interceptors.request.use((config) => {
  if (authToken) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${authToken}`;
  }
  return config;
});

/**
 * Response interceptor: normaliza errores
 */
instance.interceptors.response.use(
  (res) => res.data,
  (error) => {
    const res = error.response;
    const err = new Error(res?.data?.message || error.message || "API error");
    err.status = res?.status;
    err.data = res?.data;
    return Promise.reject(err);
  }
);

/**
 * Establecer token en memoria (y en headers por si se quiere)
 */
export function setAuthToken(token) {
  authToken = token;
  if (token) {
    instance.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete instance.defaults.headers.common.Authorization;
  }
}

export const ApiClient = {
  instance,
  get: (path, params = {}, config = {}) =>
    instance.get(path, { params, ...config }),
  post: (path, data, config = {}) => instance.post(path, data, config),
  put: (path, data, config = {}) => instance.put(path, data, config),
  del: (path, config = {}) => instance.delete(path, config),
};
