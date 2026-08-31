import { ApiClient } from "./ApiClient";

export async function getModes() {
  try {
    const res = await ApiClient.get("/mode");
    const data = Array.isArray(res) ? res : (res?.data ?? []);
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error("Error en getModes:", error);
    throw error;
  }
}

export async function getAreasByMode(mode) {
  if (!mode) throw new Error("mode es requerido.");
  try {
    const res = await ApiClient.post("/enfasis/area", { mode: Number(mode) });
    const data = Array.isArray(res) ? res : (res?.data ?? []);
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error("Error en getAreasByMode:", error);
    throw error;
  }
}

export async function createEnfasisAsignatura(payload) {
  if (!payload?.name_asignatura_enfasis) {
    throw new Error("name_asignatura_enfasis es requerido.");
  }
  return await ApiClient.post("/enfasis", payload);
}