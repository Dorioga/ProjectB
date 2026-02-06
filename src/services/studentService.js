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
export async function uploadStudentsExcel(file, options = {}) {
  const { fieldName = "file", params, data, onUploadProgress } = options;

  if (!file) {
    throw new Error("Debes enviar un archivo Excel.");
  }

  const formData = new FormData();
  const fileName = file?.name || "students.xlsx";
  formData.append("archivo", file, fileName);

  if (data && typeof data === "object") {
    for (const [key, value] of Object.entries(data)) {
      if (value === undefined || value === null) continue;
      formData.append(key, String(value));
    }
  }

  const res = await ApiClient.instance.post("/upload/students/file", formData, {
    params,
    onUploadProgress,
    headers: { "Content-Type": "multipart/form-data" },
  });

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
