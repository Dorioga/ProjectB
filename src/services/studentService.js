import { ApiClient } from "./ApiClient";
import { studentsResponse as studentsMock } from "./DataExamples/studentsResponse";

/**
 * studentService: adáptalo a tus endpoints reales.
 */
export async function getStudents(params = {}) {
  // return Promise.resolve(studentsMock);
  if (import.meta.env.DEV) {
  } // ApiClient.get("/students", params)
  return studentsMock;
}

export async function getStudent(id) {
  // Intenta obtener desde la API si existe (omitido aquí) y usa el mock como fallback.
  const key = (id ?? "").toString().trim();
  if (!key) throw new Error("Identificación vacía.");

  const source = Array.isArray(studentsMock) ? studentsMock : [];

  const found = source.find((s) => {
    // Lista de posibles campos que pueden contener la identificación
    const candidates = [
      s.identification,
      s.numero_identificacion,
      s.documento,
      s.id,
      s.numeroDocumento,
      s.numero_identificacion_acudiente, // por si acaso
    ];
    return candidates.some((c) => String(c ?? "").trim() === key);
  });

  if (!found) {
    // Opcional: intentar llamada a la API real aquí
    throw new Error("Estudiante no encontrado.");
  }

  return found;
}

export async function createStudent(payload) {
  return ApiClient.post("/students", payload);
}

export async function updateStudent(id, payload) {
  return ApiClient.put(`/students/${id}`, payload);
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
