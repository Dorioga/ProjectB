import { ApiClient } from "./ApiClient";
import { studentsResponse as studentsMock } from "./DataExamples/studentsResponse";

/**
 * studentService: adaptarlo a tus endpoints reales
 */
export async function getStudents(params = {}) {
  // return Promise.resolve(studentsMock);
  if (import.meta.env.DEV) {
  } //ApiClient.get("/students", params)
  return studentsMock;
}

export async function getStudent(id) {
  console.log("getStudent ID:", id);
  const student = studentsMock.find(
    (s) => String(s.identification) === String(id)
  );
  if (import.meta.env.DEV) {
    // ✅ Comparar como strings (sin Number())

    if (!student) {
      throw new Error(`Estudiante con documento ${id} no encontrado`);
    }

    return Promise.resolve(student);
  }
  //ApiClient.get(`/students/${id}`)
  return student;
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

/* Opcional: subir foto (FormData) */
export async function uploadStudentPhoto(id, formData) {
  return ApiClient.post(`/students/${id}/photo`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
}

export async function getRandomStudents(count = 5) {
  // fuente de datos (usa el mock si está disponible)
  const source =
    Array.isArray(studentsMock) && studentsMock.length
      ? studentsMock
      : await getStudents();

  const n = Math.max(0, Math.min(count, source.length));
  // copia y baraja (Fisher-Yates)
  const arr = source.slice();
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr.slice(0, n);
}
