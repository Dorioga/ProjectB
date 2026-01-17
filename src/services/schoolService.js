import { ApiClient } from "./ApiClient";

/**
 * Obtiene información de la institución.
 *
 * Endpoint esperado: GET /institution
 * @returns {Promise<Object>} Información de la institución
 */
export async function getInstitution() {
  try {
    const res = await ApiClient.get("/institution");
    const data = res?.data ?? res;
    console.log("SchoolService - getInstitution:", data);

    if (data && typeof data === "object" && "data" in data) return data.data;
    if (data !== undefined && data !== null) return data;

    throw new Error("Respuesta inesperada de /institution.");
  } catch (error) {
    console.error("Error en getInstitution:", error);
    throw error;
  }
}

export async function createSchool(payload) {
  if (!payload || typeof payload !== "object") {
    throw new Error("payload debe ser un objeto.");
  }

  const res = await ApiClient.instance.post("/institutions", payload);

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
    const res = await ApiClient.get("/workdays");
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
 * Obtiene los períodos académicos desde el backend.
 *
 * Endpoint esperado: GET /periods
 * @returns {Promise<Array>} Array de períodos académicos
 */
export async function getPeriods() {
  try {
    const res = await ApiClient.get("/periods");
    const data = Array.isArray(res) ? res : res?.data ?? [];

    console.log("SchoolService - getPeriods:", data);

    // Validación suave del payload: aceptamos array o { data: array }.
    if (Array.isArray(data)) return data;
    if (data && typeof data === "object" && Array.isArray(data.data))
      return data.data;

    throw new Error("Respuesta inesperada de periods.");
  } catch (error) {
    console.error("Error en getPeriods:", error);
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

  const res = await ApiClient.instance.post("/grades", gradeData);

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

  const res = await ApiClient.instance.post("/teachers", payload);

  // ApiClient tiene interceptor que normalmente devuelve res.data.
  // Pero aquí usamos instance.post directamente; res ya es data por interceptor.
  const data = res;
  console.log("SchoolService - registerTeacher:", data);

  // Validación suave del payload: devolvemos data o data.data.
  if (data && typeof data === "object" && "data" in data) return data.data;
  if (data !== undefined && data !== null) return data;

  throw new Error("Respuesta inesperada de register_teacher.");
}

/**
 * Obtiene los grados por sede.
 *
 * Endpoint esperado: POST /grade_sede
 * @param {Object} payload - Datos para filtrar los grados (ej: {id_sede: 1})
 * @returns {Promise<Object>} Respuesta del servidor con los grados
 */
export async function getGradeSede(payload) {
  if (!payload || typeof payload !== "object") {
    throw new Error("payload debe ser un objeto.");
  }
  console.log("SchoolService - getGradeSede payload:", payload);

  const res = await ApiClient.instance.post("/grade/:sedeId", payload);

  // ApiClient tiene interceptor que normalmente devuelve res.data.
  const data = res;
  console.log("SchoolService - getGradeSede:", data);

  // Validación suave del payload: devolvemos data o data.data.
  if (data && typeof data === "object" && "data" in data) return data.data;
  if (data !== undefined && data !== null) return data;

  throw new Error("Respuesta inesperada de grade_sede.");
}

/**
 * Registra una nueva asignatura.
 *
 * Endpoint esperado: POST /register_asignature
 * @param {Object} payload - Datos de la asignatura (ej: {name: "Matemáticas", grade_id: 1})
 * @returns {Promise<Object>} Respuesta del servidor
 */
export async function registerAsignature(payload) {
  if (!payload || typeof payload !== "object") {
    throw new Error("payload debe ser un objeto.");
  }

  const res = await ApiClient.instance.post("/asignatures", payload);

  const data = res;
  console.log("SchoolService - registerAsignature:", data);

  // Validación suave del payload: devolvemos data o data.data.
  if (data && typeof data === "object" && "data" in data) return data.data;
  if (data !== undefined && data !== null) return data;

  throw new Error("Respuesta inesperada de register_asignature.");
}

/**
 * Obtiene las asignaturas por sede.
 *
 * Endpoint esperado: POST /sedeasignature
 * @param {Object} payload - Datos para filtrar asignaturas (ej: {idSede: 32, idWorkDay: 1})
 * @returns {Promise<Object>} Respuesta del servidor con las asignaturas
 */
export async function getSedeAsignature(payload) {
  if (!payload || typeof payload !== "object") {
    throw new Error("payload debe ser un objeto.");
  }

  const res = await ApiClient.instance.post("/sedes/:id/subjects", payload);

  const data = res;
  console.log("SchoolService - getSedeAsignature respuesta completa:", data);

  // Validación suave del payload: devolvemos data o data.data.
  if (data && typeof data === "object" && "data" in data) {
    console.log(
      "SchoolService - getSedeAsignature retornando data.data:",
      data.data
    );
    return data.data;
  }
  if (data !== undefined && data !== null) {
    console.log("SchoolService - getSedeAsignature retornando data:", data);
    return data;
  }

  throw new Error("Respuesta inesperada de sedeasignature.");
}

/**
 * Obtiene las asignaturas por grado.
 *
 * Endpoint esperado: POST /grade_asignature
 * @param {Object} payload - Datos para filtrar asignaturas (ej: {id_grado: 17})
 * @returns {Promise<Object>} Respuesta del servidor con las asignaturas del grado
 */
export async function getGradeAsignature(payload) {
  if (!payload || typeof payload !== "object") {
    throw new Error("payload debe ser un objeto.");
  }
  console.log("SchoolService - getGradeAsignature payload:", payload);

  const res = await ApiClient.instance.post("/gradeS/:asignatureId", payload);

  const data = res;
  console.log("SchoolService - getGradeAsignature:", data);

  // Validar que la respuesta tenga code: "OK"
  if (data && data.code === "OK") {
    // Devolver los datos si existen
    if (data.data !== undefined) {
      return data.data;
    }
    return data;
  }

  // Si no tiene code OK, lanzar error
  throw new Error(data?.message || "Respuesta inesperada de grade_asignature.");
}

/**
 * Crea una nueva nota.
 *
 * Endpoint esperado: POST /notes
 * @param {Object} payload - Datos de la nota
 * @returns {Promise<Object>} Respuesta del servidor
 */
export async function createNote(payload) {
  if (!payload || typeof payload !== "object") {
    throw new Error("payload debe ser un objeto.");
  }

  const res = await ApiClient.instance.post("/notes", payload);

  const data = res;
  console.log("SchoolService - createNote:", data);

  // Validación suave del payload: devolvemos data o data.data.
  if (data && typeof data === "object" && "data" in data) return data.data;
  if (data !== undefined && data !== null) return data;

  throw new Error("Respuesta inesperada de createNote.");
}

/**
 * Obtiene las asignaturas de un profesor.
 *
 * Endpoint esperado: POST /teacher/subjects
 * @param {Object} payload - Datos para filtrar asignaturas del profesor
 * @returns {Promise<Object>} Respuesta del servidor con las asignaturas del profesor
 */
export async function getTeacherSubjects(payload) {
  if (!payload || typeof payload !== "object") {
    throw new Error("payload debe ser un objeto.");
  }

  const res = await ApiClient.instance.post("/teacher/subjects", payload);

  const data = res;
  console.log("SchoolService - getTeacherSubjects:", data);

  // Validación suave del payload: devolvemos data o data.data.
  if (data && typeof data === "object" && "data" in data) return data.data;
  if (data !== undefined && data !== null) return data;

  throw new Error("Respuesta inesperada de teacher/subjects.");
}

/**
 * Obtiene los grados de un profesor por sede y jornada.
 *
 * Endpoint esperado: POST /teacherS/grades
 * @param {Object} payload - Datos para filtrar grados del profesor (ej: {idSede: 1, idWorkDay: 1, idDocente: 123})
 * @returns {Promise<Object>} Respuesta del servidor con los grados del profesor
 */
export async function getTeacherGrades(payload) {
  if (!payload || typeof payload !== "object") {
    throw new Error("payload debe ser un objeto.");
  }

  console.log("SchoolService - getTeacherGrades payload:", payload);

  const res = await ApiClient.instance.post("/teacherS/grades", payload);

  const data = res;
  console.log("SchoolService - getTeacherGrades:", data);

  // Validación suave del payload: devolvemos data o data.data.
  if (data && typeof data === "object" && "data" in data) return data.data;
  if (data !== undefined && data !== null) return data;

  throw new Error("Respuesta inesperada de teacherS/grades.");
}

/**
 * Obtiene los grados de un estudiante.
 *
 * Endpoint esperado: POST /student/grades
 * @param {Object} payload - Datos para filtrar grados del estudiante (ej: {idStudent: 123})
 * @returns {Promise<Object>} Respuesta del servidor con los grados del estudiante
 */
export async function getStudentGrades(payload) {
  if (!payload || typeof payload !== "object") {
    throw new Error("payload debe ser un objeto.");
  }

  console.log("SchoolService - getStudentGrades payload:", payload);

  const res = await ApiClient.instance.post("/student/grades", payload);

  const data = res;
  console.log("SchoolService - getStudentGrades:", data);

  // Validación suave del payload: devolvemos data o data.data.
  if (data && typeof data === "object" && "data" in data) return data.data;
  if (data !== undefined && data !== null) return data;

  throw new Error("Respuesta inesperada de student/grades.");
}

/**
 * Obtiene las notas de un estudiante.
 *
 * Endpoint esperado: POST /studentS/notes
 * @param {Object} payload - Datos para filtrar notas del estudiante
 * @returns {Promise<Object>} Respuesta del servidor con las notas del estudiante
 */
export async function getStudentNotes(payload) {
  if (!payload || typeof payload !== "object") {
    throw new Error("payload debe ser un objeto.");
  }

  console.log("SchoolService - getStudentNotes payload:", payload);

  const res = await ApiClient.instance.post("/studentS/notes", payload);

  const data = res;
  console.log("SchoolService - getStudentNotes:", data);

  // Validación suave del payload: devolvemos data o data.data.
  if (data && typeof data === "object" && "data" in data) return data.data;
  if (data !== undefined && data !== null) return data;

  throw new Error("Respuesta inesperada de studentS/notes.");
}

/**
 * Guarda las notas de asignación de estudiantes.
 *
 * Endpoint esperado: POST /assignment/notes
 * @param {Object} payload - Datos con formato { note_student: [{ fk_student, fk_note, value_note, goal_student }] }
 * @returns {Promise<Object>} Respuesta del servidor
 */
export async function saveAssignmentNotes(payload) {
  if (!payload || typeof payload !== "object") {
    throw new Error("payload debe ser un objeto.");
  }

  console.log("SchoolService - saveAssignmentNotes payload:", payload);

  const res = await ApiClient.instance.post("/assignment/notes", payload);

  const data = res;
  console.log("SchoolService - saveAssignmentNotes:", data);

  // Validación suave del payload: devolvemos data o data.data.
  if (data && typeof data === "object" && "data" in data) return data.data;
  if (data !== undefined && data !== null) return data;

  throw new Error("Respuesta inesperada de assignment/notes.");
}

/**
 * Obtiene todos los estudiantes de la institución.
 *
 * Endpoint esperado: POST /institution/students
 * @param {Object} payload - Datos para filtrar estudiantes
 * @returns {Promise<Object>} Respuesta del servidor con los estudiantes
 */
export async function allstudent(payload) {
  if (!payload || typeof payload !== "object") {
    throw new Error("payload debe ser un objeto.");
  }

  console.log("SchoolService - allstudent payload:", payload);

  const res = await ApiClient.instance.post("/institution/students", payload);

  const data = res;
  console.log("SchoolService - allstudent:", data);

  // Validación suave del payload: devolvemos data o data.data.
  if (data && typeof data === "object" && "data" in data) return data.data;
  if (data !== undefined && data !== null) return data;

  throw new Error("Respuesta inesperada de /institution/students.");
}

/**
 * Obtiene todos los profesores de la institución.
 *
 * Endpoint esperado: POST /institution/teachers
 * @param {Object} payload - Datos para filtrar profesores
 * @returns {Promise<Object>} Respuesta del servidor con los profesores
 */
export async function allteacher(payload) {
  if (!payload || typeof payload !== "object") {
    throw new Error("payload debe ser un objeto.");
  }

  console.log("SchoolService - allteacher payload:", payload);

  const res = await ApiClient.instance.post("/institution/teachers", payload);

  const data = res;
  console.log("SchoolService - allteacher:", data);

  // Validación suave del payload: devolvemos data o data.data.
  if (data && typeof data === "object" && "data" in data) return data.data;
  if (data !== undefined && data !== null) return data;

  throw new Error("Respuesta inesperada de /institution/teachers.");
}
