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

export async function updateTeacherAsignature(payload) {
  if (!payload?.teacher || !payload?.asignatura) {
    throw new Error("teacher y asignatura son requeridos.");
  }
  try {
    return await ApiClient.patch("/teacher/asignature/update", {
      asignatura: Number(payload.asignatura),
      state: String(payload.state ?? ""),
      teacher: Number(payload.teacher),
      ...(payload.id != null ? { id: Number(payload.id) } : {}),
    });
  } catch (error) {
    console.error("Error en updateTeacherAsignature:", error);
    throw error;
  }
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

export async function createEnfasisNote(payload) {
  if (!payload?.teacher || !payload?.asignatura || !payload?.periodo) {
    throw new Error("teacher, asignatura y periodo son requeridos.");
  }
  try {
    return await ApiClient.post("/note/emphasis", payload);
  } catch (error) {
    console.error("Error en createEnfasisNote:", error);
    throw error;
  }
}

export async function getAsignatureEnfasis(id) {
  if (!id) throw new Error("id es requerido.");
  try {
    const res = await ApiClient.get(`/asignature/emphasis/${Number(id)}`);
    const data = Array.isArray(res) ? res : (res?.data ?? []);
    return Array.isArray(data) ? data[0] : null;
  } catch (error) {
    console.error("Error en getAsignatureEnfasis:", error);
    throw error;
  }
}

export async function updateEnfasisAsignatura(payload) {
  if (!payload?.id) throw new Error("id es requerido.");
  try {
    return await ApiClient.patch("/enfasis/asignature/update", {
      name: String(payload.name ?? ""),
      state: String(payload.state ?? ""),
      area: Number(payload.area),
      intensidad: payload.intensidad != null ? Number(payload.intensidad) : null,
      workday: Number(payload.workday),
      id: Number(payload.id),
    });
  } catch (error) {
    console.error("Error en updateEnfasisAsignatura:", error);
    throw error;
  }
}