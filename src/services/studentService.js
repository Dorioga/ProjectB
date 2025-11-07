import { ApiClient } from "./ApiClient";
import { studentsResponse as studentsMock } from "./DataExamples/studentsResponse";

/**
 * studentService: adaptarlo a tus endpoints reales
 */
export async function getStudents(params = {}) {
  if (import.meta.env.DEV) {
    return Promise.resolve(studentsMock);
  } //ApiClient.get("/students", params)
  return studentsMock;
}

export async function getStudent(id) {
  if (import.meta.env.DEV) {
    // ✅ Comparar como strings (sin Number())
    const student = studentsMock.find(
      (s) => String(s.identification) === String(id)
    );

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
