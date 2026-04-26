import { ApiClient } from "./ApiClient";
import { studentsResponse as studentsMock } from "./DataExamples/studentsResponse";

export async function registerStudent(payload) {
  if (!payload || typeof payload !== "object") {
    throw new Error("payload debe ser un objeto.");
  }

  const res = await ApiClient.instance.post("/students", payload);

  // ApiClient tiene interceptor que normalmente devuelve res.data.
  const data = res;
  console.log("StudentService - registerStudent:", data);

  // Validación suave del payload: devolvemos data o data.data.
  if (data && typeof data === "object" && "data" in data) return data.data;
  if (data !== undefined && data !== null) return data;

  throw new Error("Respuesta inesperada de register_student.");
}

/**
 * Sube un archivo Excel para carga masiva de estudiantes.
 *
 * Espera que el backend reciba un multipart/form-data con un campo de archivo.
 * Ajusta `endpoint` y `fieldName` según tu API.
 */
/**
 * Sube un archivo Excel para carga masiva de estudiantes.
 *
 * Endpoint: POST /upload/students/file
 * @param {File} file - Archivo Excel a subir
 * @param {Object} options - Opciones adicionales
 * @returns {Promise<Object>} Respuesta del servidor
 */
export async function uploadStudentsExcel(file) {
  if (!file) {
    throw new Error("Debes enviar un archivo Excel.");
  }

  const formData = new FormData();
  const fileName = file?.name || "students.xlsx";
  formData.append("archivo", file, fileName);

  const res = await ApiClient.instance.post("/upload/students/file", formData);
  console.log("StudentService - uploadStudentsExcel llamado con file:", res);
  const responseData = res;

  console.log("StudentService - uploadStudentsExcel:", responseData);

  // Validación suave del payload: devolvemos data o data.data.
  if (
    responseData &&
    typeof responseData === "object" &&
    "data" in responseData
  )
    return responseData.data;
  if (responseData !== undefined && responseData !== null) return responseData;

  throw new Error("Respuesta inesperada de upload/students/file.");
}

//////////////////////////////////////////////////
/**
 * studentService: adáptalo a tus endpoints reales.
 */
export async function getStudents(params = {}) {
  // return Promise.resolve(studentsMock);
  if (import.meta.env.DEV) {
  } // ApiClient.get("/students", params)
  return studentsMock;
}

/**
 * Busca un estudiante por número de identificación y fk_institucion.
 * Endpoint: POST /values/student/guardian
 * @param {{ numero_identificacion_estu: string, fk_institucion: number }} payload
 * @returns {Promise<{ id_estudiante: string, nombre: string }>}
 */
export async function getStudentByIdentification(payload) {
  if (!payload?.numero_identificacion_estu || !payload?.fk_institucion) {
    throw new Error(
      "numero_identificacion_estu y fk_institucion son requeridos.",
    );
  }
  const res = await ApiClient.instance.post(
    "/values/student/guardian",
    payload,
  );
  const data = res?.data[0] ?? res;
  console.log("StudentService - getStudentByIdentification:", res);
  if (!data?.id_estudiante) throw new Error("Estudiante no encontrado.");
  return data;
}

export async function getStudent(payload) {
  // Aceptar tanto string/id como objeto payload
  const body =
    payload === null || payload === undefined
      ? {}
      : typeof payload === "string" || typeof payload === "number"
        ? { identification: String(payload) }
        : typeof payload === "object"
          ? payload
          : {};

  try {
    // Intentar la llamada POST al endpoint /student/data
    const res = await ApiClient.instance.post("/student/data", body);
    const data = Array.isArray(res) ? res : (res?.data ?? res);

    const rows = Array.isArray(data) ? data : data?.data ? data.data : data;

    if (Array.isArray(rows) && rows.length > 0) return rows[0];
    if (rows && typeof rows === "object" && Object.keys(rows).length)
      return rows;

    // Si no hay resultado, intentar fallback a mock en desarrollo
    if (import.meta.env.DEV) {
      const key = (body.identification ?? "").toString().trim();
      if (!key) throw new Error("Identificación vacía.");

      const source = Array.isArray(studentsMock) ? studentsMock : [];
      const found = source.find((s) => {
        const candidates = [
          s.identification,
          s.numero_identificacion,
          s.documento,
          s.id,
          s.numeroDocumento,
          s.numero_identificacion_acudiente,
        ];
        return candidates.some((c) => String(c ?? "").trim() === key);
      });

      if (!found) throw new Error("Estudiante no encontrado.");
      return found;
    }

    throw new Error("Estudiante no encontrado.");
  } catch (err) {
    // En desarrollo, intentar buscar en mock si la petición falla
    if (import.meta.env.DEV) {
      const key = (body.identification ?? "").toString().trim();
      if (!key) throw err;
      const source = Array.isArray(studentsMock) ? studentsMock : [];
      const found = source.find((s) => {
        const candidates = [
          s.identification,
          s.numero_identificacion,
          s.documento,
          s.id,
          s.numeroDocumento,
          s.numero_identificacion_acudiente,
        ];
        return candidates.some((c) => String(c ?? "").trim() === key);
      });

      if (found) return found;
    }
    throw err;
  }
}

export async function createStudent(payload) {
  return ApiClient.post("/students", payload);
}

/**
 * Registra un nuevo estudiante.
 *
 * Endpoint esperado: POST /register_student
 * @param {FormData} formData - Datos del estudiante en formato FormData
 * @returns {Promise<Object>} Respuesta del servidor
 */

export async function updateStudent(studentId, personId, payload) {
  if (!studentId) throw new Error("studentId es requerido para updateStudent");
  if (!personId) throw new Error("personId es requerido para updateStudent");
  if (!payload || typeof payload !== "object") {
    throw new Error("payload debe ser un objeto.");
  }

  const res = await ApiClient.instance.patch(
    `/student/${studentId}/person/${personId}`,
    payload,
  );

  const data = res;
  console.log("StudentService - updateStudent:", data);

  if (data && typeof data === "object" && "data" in data) return data.data;
  if (data !== undefined && data !== null) return data;

  throw new Error("Respuesta inesperada de update_student.");
}

export async function deleteStudent(id) {
  return ApiClient.del(`/students/${id}`);
}

/**
 * Registra una observación de estudiante.
 *
 * Endpoint: POST /observation/add
 * @param {Object} payload
 * @param {number} payload.fk_estudiante
 * @param {number} payload.fk_grado
 * @param {string} payload.lugar_nacimiento
 * @param {number} payload.fk_acudiente
 * @param {string} payload.ocupacion
 * @param {string} payload.observacion
 * @param {string} payload.telefono
 * @param {number} [payload.fk_docente] - Solo cuando el rol es docente
 * @returns {Promise<Object>} Respuesta del servidor
 */
export async function registerObservation(payload) {
  if (!payload || typeof payload !== "object") {
    throw new Error("payload debe ser un objeto.");
  }

  const res = await ApiClient.instance.post("/observation/add", payload);
  console.log("StudentService - registerObservation:", res);

  if (res && typeof res === "object" && "data" in res) return res;
  if (res !== undefined && res !== null) return res;

  throw new Error("Respuesta inesperada de registerObservation.");
}

/**
 * Consulta observaciones de un estudiante por número de identificación.
 *
 * Endpoint: POST /data/observation
 * @param {{ numberId: string }} payload
 * @returns {Promise<Array>} Lista de observaciones
 */
export async function getObservationData(payload) {
  if (!payload?.numberId) {
    throw new Error("numberId es requerido.");
  }

  const res = await ApiClient.instance.post("/data/observation", payload);
  console.log("StudentService - getObservationData:", res);

  const data = Array.isArray(res) ? res : (res?.data ?? []);
  return data;
}

/**
 * Actualiza la observación de un registro del observador.
 *
 * Endpoint: POST /observer/
 * @param {{ id_observador: number, observacion: string }} payload
 * @returns {Promise<Object>} Respuesta del servidor
 */
export async function updateObservation(payload) {
  if (!payload?.id_observador) {
    throw new Error("id_observador es requerido.");
  }

  const res = await ApiClient.instance.patch("/observer/:value", payload);
  console.log("StudentService - updateObservation:", res);

  if (res && typeof res === "object" && "data" in res) return res;
  if (res !== undefined && res !== null) return res;

  throw new Error("Respuesta inesperada de updateObservation.");
}

/* Opcional: subir foto (FormData). */
export async function uploadStudentPhoto(id, formData) {
  return ApiClient.post(`/students/${id}/photo`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
}

export async function getRandomStudents(count = 5) {
  // Fuente de datos (usa el mock si está disponible)
  const source =
    Array.isArray(studentsMock) && studentsMock.length
      ? studentsMock
      : await getStudents();

  const n = Math.max(0, Math.min(count, source.length));
  // Copia y baraja (Fisher–Yates)
  const arr = source.slice();
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr.slice(0, n);
}

/**
 * Registra un acudiente/guardian de un estudiante.
 *
 * Endpoint: POST /guardian
 * @param {Object} payload - Datos del acudiente.
 * @returns {Promise<Object>} Respuesta del servidor.
 */
export async function registerGuardian(payload) {
  if (!payload || typeof payload !== "object") {
    throw new Error("payload debe ser un objeto.");
  }
  const res = await ApiClient.post("/guardian", payload);
  const data = res;
  if (data && typeof data === "object" && "data" in data) return data.data;
  if (data !== undefined && data !== null) return data;
  throw new Error("Respuesta inesperada de registerGuardian.");
}

/**
 * Obtiene las notas de un estudiante por su id.
 * Endpoint: POST /note/student/:studentId
 * @param {string|number} studentId - ID del estudiante
 * @returns {Promise<Array>} Lista de notas del estudiante
 */

/**
 * Obtiene el observador de un estudiante por número de identificación.
 *
 * Endpoint: POST /student/observer
 * @param {{ numberId: string }} payload
 * @returns {Promise<Object>} Datos del estudiante y acudiente.
 */
export async function getStudentObserver(payload) {
  if (!payload?.numberId) {
    throw new Error("numberId es requerido para getStudentObserver.");
  }
  const res = await ApiClient.instance.post("/data/student/observer", payload);
  const data = res?.data ?? res;
  console.log("StudentService - getStudentObserver:", data);
  if (!data[0]?.id_estudiante) throw new Error("Estudiante no encontrado.");
  return data;
}

/**
 * Obtiene los estudiantes asociados a un acudiente.
 *
 * Endpoint: POST /guardian-student
 * @param {{ idPersonaGuardian: number }} payload
 * @returns {Promise<Array<{ id_estudiante: string, concat_ws: string }>>}
 */
export async function getStudentGuardian(payload) {
  if (!payload?.idPersonaGuardian) {
    throw new Error("idPersonaGuardian es requerido.");
  }
  const res = await ApiClient.instance.post("/guardian-student", payload);
  const data = Array.isArray(res) ? res : (res?.data ?? []);
  console.log("StudentService - getStudentGuardian:", data);
  return data;
}

/**
 * Obtiene los datos completos del acudiente y estudiante para pre-llenar la reserva.
 *
 * Endpoint: POST /guardian-reservations
 * @param {{ idPersonaGuardian: number, idEstudiante: number }} payload
 * @returns {Promise<Object>} Datos del estudiante y del acudiente.
 */
export async function getDataStudentGuardian(payload) {
  if (!payload?.idPersonaGuardian || !payload?.idEstudiante) {
    throw new Error("idPersonaGuardian e idEstudiante son requeridos.");
  }
  const res = await ApiClient.instance.post("/guardian-reservations", payload);
  const raw = Array.isArray(res) ? res : (res?.data ?? []);
  const data = Array.isArray(raw) ? raw[0] : raw;
  console.log("StudentService - getGuardianReservations:", data);
  return data;
}

export async function getStudentNotesById(studentId) {
  console.log(
    "StudentService - getStudentNotesById llamado con studentId:",
    studentId,
  );
  if (!studentId)
    throw new Error("studentId es requerido para getStudentNotesById");
  const res = await ApiClient.post(`/note/student/${studentId}`);
  const data = res;
  if (data && typeof data === "object" && "data" in data) return data.data;
  if (data !== undefined && data !== null) return data;
  throw new Error("Respuesta inesperada de /note/student.");
}

/**
 * Obtiene el boletín de notas de un estudiante filtrado por período y año.
 *
 * Endpoint: POST /students/boletin
 * @param {{ studentId: number|string, periodId: number, year: string }} payload
 * @returns {Promise<Array>} Listado de registros del boletín.
 */
export async function getBoletin(payload) {
  if (!payload || typeof payload !== "object") {
    throw new Error("payload debe ser un objeto.");
  }
  const res = await ApiClient.instance.post("/students/boletin", payload);
  const data = res;
  console.log("StudentService - getBoletin:", data);
  if (data && typeof data === "object" && "data" in data) return data.data;
  if (data !== undefined && data !== null) return data;
  throw new Error("Respuesta inesperada de /students/boletin.");
}

/**
 * Obtiene el boletín de un estudiante de grado transición (vía docente).
 *
 * Endpoint: POST /docente/boletin
 * @param {{ studentId: number|string, periodId: number, year: string, fk_rol: string }} payload
 * @returns {Promise<Array>} Listado de registros del boletín.
 */
export async function getBoletinDocente(payload) {
  if (!payload || typeof payload !== "object") {
    throw new Error("payload debe ser un objeto.");
  }
  const res = await ApiClient.instance.post("/docente/boletin", payload);
  const data = res;
  console.log("StudentService - getBoletinDocente:", data);
  if (data && typeof data === "object" && "data" in data) return data.data;
  if (data !== undefined && data !== null) return data;
  throw new Error("Respuesta inesperada de /docente/boletin.");
}

/**
 * Obtiene la asistencia de un estudiante.
 *
 * Endpoint: POST /students/assistence
 * @param {{ studentId: number, sedeId: number }} payload
 * @returns {Promise<Array>} Listado de registros de asistencia.
 */
export async function getStudentAssistence(payload) {
  if (!payload?.studentId || !payload?.sedeId) {
    throw new Error("studentId y sedeId son requeridos.");
  }
  const res = await ApiClient.instance.post("/students/assistence", payload);
  const data = res;
  console.log("StudentService - getStudentAssistence:", data);
  if (data && typeof data === "object" && "data" in data) return data.data;
  if (Array.isArray(data)) return data;
  if (data !== undefined && data !== null) return data;
  throw new Error("Respuesta inesperada de /students/assistence.");
}
