import { ApiClient } from "./ApiClient";

/**
 * Obtiene los tipos de identificación desde el backend.
 *
 * Endpoint esperado: GET /type_identification
 */
export async function getTypeIdentification() {
  const res = await ApiClient.instance.get("/type_identification");

  // ApiClient tiene interceptor que normalmente devuelve res.data.
  // Pero aquí usamos instance.get directamente; res ya es data por interceptor.
  const data = res;
  console.log("DataService - getTypeIdentification:", data);
  // Validación suave del payload: aceptamos array o { data: array }.
  if (Array.isArray(data)) return data;
  if (data && typeof data === "object" && Array.isArray(data.data))
    return data.data;

  throw new Error("Respuesta inesperada de type_identification.");
}

/**
 * Registra un usuario enviando multipart/form-data.
 *
 * Endpoint esperado: POST /users
 */
export async function registerUser(formData) {
  if (!(formData instanceof FormData)) {
    throw new Error("formData debe ser una instancia de FormData.");
  }
  const res = await ApiClient.instance.post("/register_user", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  // ApiClient tiene interceptor que normalmente devuelve res.data.
  // Pero aquí usamos instance.post directamente; res ya es data por interceptor.
  const data = res;
  console.log("DataService - registerUser:", data);

  // Validación suave del payload: devolvemos data o data.data.
  if (data && typeof data === "object" && "data" in data) return data.data;
  if (data !== undefined && data !== null) return data;

  throw new Error("Respuesta inesperada de registerUser.");
}

/**
 * Obtiene los roles desde el backend.
 *
 * Endpoint esperado: GET /rol
 */
export async function getRol() {
  const res = await ApiClient.instance.get("/rol");

  // ApiClient tiene interceptor que normalmente devuelve res.data.
  // Pero aquí usamos instance.get directamente; res ya es data por interceptor.
  const data = res;
  console.log("DataService - getRol:", data);

  // Validación suave del payload.
  if (Array.isArray(data)) return data;
  if (data && typeof data === "object" && Array.isArray(data.data))
    return data.data;

  throw new Error("Respuesta inesperada de rol.");
}

/**
 * Obtiene el menú por rol desde el backend.
 *
 * Endpoint esperado: POST /menu_rol
 */
export async function getMenuRol(formData) {
  if (!(formData instanceof FormData)) {
    throw new Error("formData debe ser una instancia de FormData.");
  }

  const res = await ApiClient.instance.post("/menu_rol", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  // ApiClient tiene interceptor que normalmente devuelve res.data.
  // Pero aquí usamos instance.post directamente; res ya es data por interceptor.
  const data = res;
  console.log("DataService - getMenuRol:", data);

  // Validación suave del payload: devolvemos data o data.data.
  if (data && typeof data === "object" && "data" in data) return data.data;
  if (data !== undefined && data !== null) return data;

  throw new Error("Respuesta inesperada de menu_rol.");
}
