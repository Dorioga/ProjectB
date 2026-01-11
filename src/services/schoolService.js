import { ApiClient } from "./ApiClient";
import { sedesResponses } from "./DataExamples/sedesResponse";
import { journeysResponse } from "./DataExamples/journeysResponse";
import { recordResponse } from "./DataExamples/recordResponse";

export async function createSchool(formData) {
  if (!(formData instanceof FormData)) {
    throw new Error("formData debe ser una instancia de FormData.");
  }

  const res = await ApiClient.instance.post("/register_institution", formData);

  // ApiClient tiene interceptor que normalmente devuelve res.data.
  // Pero aquí usamos instance.post directamente; res ya es data por interceptor.
  const data = res;
  console.log("SchoolService - createSchool:", data);

  // Validación suave del payload: devolvemos data o data.data.
  if (data && typeof data === "object" && "data" in data) return data.data;
  if (data !== undefined && data !== null) return data;

  throw new Error("Respuesta inesperada de register_institution.");
}
/**
 * Obtiene las jornadas laborales desde el backend
 * @returns {Promise<Array<{value: string, label: string}>>} Array de jornadas mapeadas
 */
export async function getJourneys() {
  try {
    const res = await ApiClient.get("/workday");
    const data = Array.isArray(res) ? res : res?.data ?? [];

    if (!Array.isArray(data)) {
      console.warn("getJourneys: respuesta no es un array", res);
      return [];
    }

    // Mapear {id, name, description} a {value, label}
    const journeys = data
      .filter((item) => item?.id && item?.name) // Solo items válidos
      .map((item) => ({
        value: String(item.id),
        label: String(item.name),
      }));

    console.log(`getJourneys: ${journeys.length} jornadas cargadas`);
    return journeys;
  } catch (error) {
    console.error("Error en getJourneys:", error);
    throw error;
  }
}
/**
 * Registra un nuevo grado escolar.
 *
 * Endpoint esperado: POST /register_grade
 */
export async function registerGrade(gradeData) {
  if (!gradeData || typeof gradeData !== "object") {
    throw new Error("gradeData debe ser un objeto.");
  }

  const res = await ApiClient.instance.post("/register_grade", gradeData);

  // ApiClient tiene interceptor que normalmente devuelve res.data.
  // Pero aquí usamos instance.post directamente; res ya es data por interceptor.
  const data = res;
  console.log("SchoolService - registerGrade:", data);

  // Validación suave del payload: devolvemos data o data.data.
  if (data && typeof data === "object" && "data" in data) return data.data;
  if (data !== undefined && data !== null) return data;

  throw new Error("Respuesta inesperada de register_grade.");
}

/**
 * Registra un nuevo profesor.
 *
 * Endpoint esperado: POST /register_teacher
 * @param {Object} payload - Datos del profesor en formato JSON
 * @returns {Promise<Object>} Respuesta del servidor
 */
export async function registerTeacher(payload) {
  if (!payload || typeof payload !== "object") {
    throw new Error("payload debe ser un objeto.");
  }

  const res = await ApiClient.instance.post("/register_teacher", payload);

  // ApiClient tiene interceptor que normalmente devuelve res.data.
  // Pero aquí usamos instance.post directamente; res ya es data por interceptor.
  const data = res;
  console.log("SchoolService - registerTeacher:", data);

  // Validación suave del payload: devolvemos data o data.data.
  if (data && typeof data === "object" && "data" in data) return data.data;
  if (data !== undefined && data !== null) return data;

  throw new Error("Respuesta inesperada de register_teacher.");
}

/////////////////////////////////
export async function getSchools(params = {}) {
  return ApiClient.get("/schools", params);
}

export async function getSchool(id) {
  return ApiClient.get(`/schools/${id}`);
}

export async function updateSchool(id, payload) {
  return ApiClient.put(`/schools/${id}`, payload);
}

export async function deleteSchool(id) {
  return ApiClient.del(`/schools/${id}`);
}

// Mock / DataExample: sedes
export async function getSedes(params = {}) {
  const schoolId = params?.schoolId;
  if (schoolId) {
    return sedesResponses.filter((sede) => sede.schoolId === schoolId);
  }
  return sedesResponses;
}

// Mock / DataExample: records (notas)
export async function loadRecords(params = {}) {
  return recordResponse;
}
