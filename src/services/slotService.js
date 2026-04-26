import { ApiClient } from "./ApiClient";

/**
 * Obtiene los valores de cupos (slots) para una institución y año.
 *
 * Endpoint: POST /slots-values
 * @param {{ idInstitution: number, year: number }} payload
 * @returns {Promise<Array>} Lista de reservas de cupos
 */
export async function getSlotValues(payload) {
  if (!payload || typeof payload !== "object") {
    throw new Error("payload debe ser un objeto.");
  }

  const res = await ApiClient.instance.post("/slots-values", payload);
  const data = res;
  console.log("SlotService - getSlotValues:", data);

  if (data && typeof data === "object" && "data" in data) return data.data;
  if (data !== undefined && data !== null) return data;

  throw new Error("Respuesta inesperada de /slots-values.");
}
