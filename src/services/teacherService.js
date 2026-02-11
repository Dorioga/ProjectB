import { ApiClient } from "./ApiClient";

/**
 * Obtiene la lista de docentes
 * Endpoint esperado: GET /teachers
 */
export async function getTeachers(params = {}) {
  try {
    const res = await ApiClient.get("/teachers", params);
    const data = Array.isArray(res) ? res : (res?.data ?? []);
    return data;
  } catch (error) {
    console.error("teacherService - getTeachers error:", error);
    throw error;
  }
}

/**
 * Obtiene un docente por id
 * Endpoint esperado: GET /teachers/:id
 */
export async function getTeacherById(id) {
  if (!id) throw new Error("getTeacherById requiere id");
  try {
    const res = await ApiClient.get(`/teachers/${id}`);
    const data = res?.data ?? res;
    return data;
  } catch (error) {
    console.error("teacherService - getTeacherById error:", error);
    throw error;
  }
}

/**
 * Registra un nuevo docente
 * Endpoint esperado: POST /teachers
 */
export async function createTeacher(payload) {
  if (!payload || typeof payload !== "object") {
    throw new Error("payload debe ser un objeto.");
  }
  try {
    const res = await ApiClient.instance.post("/teachers", payload);
    const data = res;
    return data;
  } catch (error) {
    console.error("teacherService - createTeacher error:", error);
    throw error;
  }
}

/**
 * Actualiza docente (mismo endpoint que en schoolService)
 * Endpoint esperado: PATCH /teacher/:teacherId/person/:personId
 */
export async function updateTeacher(teacherId, personId, payload) {
  if (!teacherId) throw new Error("teacherId es requerido para updateTeacher");
  if (!personId) throw new Error("personId es requerido para updateTeacher");
  if (!payload || typeof payload !== "object") {
    throw new Error("payload debe ser un objeto.");
  }

  try {
    const res = await ApiClient.instance.patch(
      `/teacher/${teacherId}/person/${personId}`,
      payload,
    );
    const data = res;
    return data;
  } catch (error) {
    console.error("teacherService - updateTeacher error:", error);
    throw error;
  }
}

/**
 * Obtiene sedes asignadas al docente
 * Endpoint esperado: POST /teacher/sedes
 */
export async function getTeacherSedes(payload) {
  if (!payload || typeof payload !== "object") {
    throw new Error("payload debe ser un objeto.");
  }
  try {
    const res = await ApiClient.instance.post("/teacher/sedes", payload);
    const data = res;
    return data;
  } catch (error) {
    console.error("teacherService - getTeacherSedes error:", error);
    throw error;
  }
}

export async function createTeacherSede(payload) {
  if (!payload || typeof payload !== "object") {
    throw new Error("payload debe ser un objeto.");
  }
  try {
    const res = await ApiClient.instance.post("/teacher/sede/new", payload);
    const data = res;
    return data;
  } catch (error) {
    console.error("teacherService - createTeacherSede error:", error);
    throw error;
  }
}

export async function createTeacherAsignature(payload) {
  if (!payload || typeof payload !== "object") {
    throw new Error("payload debe ser un objeto.");
  }
  try {
    const res = await ApiClient.instance.post(
      "/teacher/new/asignature",
      payload,
    );
    const data = res;
    return data;
  } catch (error) {
    console.error("teacherService - createTeacherAsignature error:", error);
    throw error;
  }
}

/**
 * Obtiene datos del docente.
 * Endpoint esperado: POST /teacher/data
 */
export async function getDataTeacher(payload) {
  if (!payload || typeof payload !== "object") {
    throw new Error("payload debe ser un objeto.");
  }
  try {
    const res = await ApiClient.instance.post("/teacher/data", payload);
    const data = res;
    return data;
  } catch (error) {
    console.error("teacherService - getDataTeacher error:", error);
    throw error;
  }
}

/**
 * Obtiene las asignaturas del docente
 * Endpoint esperado: POST /teacher/subjects
 */
export async function getTeacherSubjects(payload) {
  if (!payload || typeof payload !== "object") {
    throw new Error("payload debe ser un objeto.");
  }
  try {
    const res = await ApiClient.instance.post("/teacher/subjects", payload);
    const data = res;
    console.log("teacherService - getTeacherSubjects:", data);
    if (data && typeof data === "object" && "data" in data) return data.data;
    if (data !== undefined && data !== null) return data;
    throw new Error("Respuesta inesperada de teacher/subjects.");
  } catch (error) {
    console.error("teacherService - getTeacherSubjects error:", error);
    throw error;
  }
}

/**
 * Obtiene los grados del docente por sede/jornada
 * Endpoint esperado: POST /teacherS/grades
 */
export async function getTeacherGrades(payload) {
  if (!payload || typeof payload !== "object") {
    throw new Error("payload debe ser un objeto.");
  }
  try {
    const res = await ApiClient.instance.post("/teacherS/grades", payload);
    const data = res;
    console.log("teacherService - getTeacherGrades payload:", payload);
    if (data && typeof data === "object" && "data" in data) return data.data;
    if (data !== undefined && data !== null) return data;
    throw new Error("Respuesta inesperada de teacherS/grades.");
  } catch (error) {
    console.error("teacherService - getTeacherGrades error:", error);
    throw error;
  }
}

/**
 * Obtiene notas de un estudiante
 * Endpoint esperado: POST /studentS/notes
 */
export async function getStudentNotes(payload) {
  if (!payload || typeof payload !== "object") {
    throw new Error("payload debe ser un objeto.");
  }
  try {
    const res = await ApiClient.instance.post("/studentS/notes", payload);
    const data = res;
    console.log("teacherService - getStudentNotes payload:", payload);
    if (data && typeof data === "object" && "data" in data) return data.data;
    if (data !== undefined && data !== null) return data;
    throw new Error("Respuesta inesperada de studentS/notes.");
  } catch (error) {
    console.error("teacherService - getStudentNotes error:", error);
    throw error;
  }
}

/**
 * Guarda notas de asignación
 * Endpoint esperado: POST /assignment/notes
 */
export async function saveAssignmentNotes(payload) {
  if (!payload || typeof payload !== "object") {
    throw new Error("payload debe ser un objeto.");
  }
  try {
    const res = await ApiClient.instance.post("/assignment/notes", payload);
    const data = res;
    console.log("teacherService - saveAssignmentNotes payload:", payload);
    if (data && typeof data === "object" && "data" in data) return data.data;
    if (data !== undefined && data !== null) return data;
    throw new Error("Respuesta inesperada de assignment/notes.");
  } catch (error) {
    console.error("teacherService - saveAssignmentNotes error:", error);
    throw error;
  }
}

/**
 * Actualiza una nota de asignación
 * Endpoint esperado: PATCH /assignment_note
 */
export async function updateAssignmentNote(payload) {
  if (!payload || typeof payload !== "object") {
    throw new Error("payload debe ser un objeto.");
  }

  try {
    const res = await ApiClient.instance.patch("/assignment_note", payload);
    const data = res;
    console.log("teacherService - updateAssignmentNote payload:", payload);
    if (data && typeof data === "object" && "data" in data) return data.data;
    if (data !== undefined && data !== null) return data;
    throw new Error("Respuesta inesperada de assignment_note.");
  } catch (error) {
    console.error("teacherService - updateAssignmentNote error:", error);
    throw error;
  }
}

/**
 * Obtiene la lista de docentes (alias de getTeachers) para compatibilidad
 */
export async function allteacher(payload) {
  return getTeachers(payload);
}
