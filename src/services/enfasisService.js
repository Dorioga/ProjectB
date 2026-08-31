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

export async function getInstitutionEmphasisArea(payload) {
  if (!payload?.institution) throw new Error("institution es requerido.");
  try {
    const res = await ApiClient.post("/institution/emphasis/area", {
      institution: Number(payload.institution),
    });
    const data = Array.isArray(res) ? res : (res?.data ?? []);
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error("Error en getInstitutionEmphasisArea:", error);
    throw error;
  }
}

export async function getTeachersBySedeEmphasis(payload) {
  if (!payload?.fk_sede) throw new Error("fk_sede es requerido.");
  try {
    const res = await ApiClient.post("/sede/teacher/emphasis", {
      fk_sede: Number(payload.fk_sede),
    });
    const data = Array.isArray(res) ? res : (res?.data ?? []);
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error("Error en getTeachersBySedeEmphasis:", error);
    throw error;
  }
}

export async function getSedeEmphasisAsignatures(payload) {
  const { fk_sede, fk_area_enfasis, fk_workday } = payload || {};
  if (!fk_sede || !fk_area_enfasis || !fk_workday) {
    throw new Error("fk_sede, fk_area_enfasis y fk_workday son requeridos.");
  }
  try {
    const res = await ApiClient.post("/sede/emphasis/asignature", {
      fk_sede: Number(fk_sede),
      fk_area_enfasis: Number(fk_area_enfasis),
      fk_workday: Number(fk_workday),
    });
    const data = Array.isArray(res) ? res : (res?.data ?? []);
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error("Error en getSedeEmphasisAsignatures:", error);
    throw error;
  }
}

export async function saveTeacherEnfasis(payload) {
  if (!payload?.fk_asignatura_enfasis || !payload?.fk_teacher) {
    throw new Error("fk_asignatura_enfasis y fk_teacher son requeridos.");
  }
  return await ApiClient.post("/teacher/enfasis", {
    fk_asignatura_enfasis: Number(payload.fk_asignatura_enfasis),
    fk_teacher: Number(payload.fk_teacher),
  });
}

export async function getInstitutionTeacherAsignatures(payload) {
  if (!payload?.institution) throw new Error("institution es requerido.");
  try {
    const res = await ApiClient.post("/sede/teacher/asignature", {
      institution: Number(payload.institution),
    });
    const data = Array.isArray(res) ? res : (res?.data ?? []);
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error("Error en getInstitutionTeacherAsignatures:", error);
    throw error;
  }
}