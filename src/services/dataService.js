import { ApiClient } from "./ApiClient";

/**
 * Obtiene los tipos de identificación desde el backend.
 *
 * Endpoint esperado: GET /type_identification
 */
export async function getTypeIdentification(params = {}, options = {}) {
  if (params === null || typeof params !== "object" || Array.isArray(params)) {
    throw new Error("params debe ser un objeto.");
  }

  if (
    options === null ||
    typeof options !== "object" ||
    Array.isArray(options)
  ) {
    throw new Error("options debe ser un objeto.");
  }

  const { signal, timeout = 15000, headers } = options;

  const res = await ApiClient.instance.get("/type_identification", {
    params,
    signal,
    timeout,
    headers,
  });

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
