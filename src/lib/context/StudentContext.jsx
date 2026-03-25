import React, {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import * as studentService from "../../services/studentService";
import { eventBus } from "../../services/ApiClient";

export const StudentContext = createContext(null);

export function StudentProvider({ children }) {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selected, setSelected] = useState(null);

  const loadStudents = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await studentService.getStudents();
      const studentsArr = Array.isArray(res)
        ? res
        : res && res.data
          ? res.data
          : [];
      setStudents(studentsArr);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Eliminado el useEffect automático para cargar solo cuando se necesite en cada página
  // useEffect(() => {
  //   loadStudents();
  // }, [loadStudents]);

  const getStudent = useCallback(async (payload) => {
    console.log("StudentContext: getStudent llamado con payload:", payload);

    // Aceptar tanto identificación simple como objeto payload
    const arg =
      payload === null || payload === undefined
        ? {}
        : typeof payload === "string" || typeof payload === "number"
          ? { identification: String(payload) }
          : payload;

    // Evitar llamadas vacías que generan errores en el inicio; si no hay parámetros de búsqueda válidos, retornar null sin setear `error`.
    const hasQuery = Boolean(
      (arg &&
        typeof arg === "object" &&
        Object.keys(arg).length > 0 &&
        (arg.identification ||
          arg.id_estudiante ||
          arg.id ||
          arg.per_id ||
          arg.numero_identificacion)) ||
      false,
    );

    if (!hasQuery) {
      // No cambiar estados globales para llamadas vacías
      return null;
    }

    setLoading(true);
    setError(null);
    try {
      const studentRaw = await studentService.getStudent(arg);
      console.log(
        "StudentContext: Detalles del estudiante obtenidos (raw):sss",
        studentRaw,
      );

      // Normalizar los campos para la UI (ProfileStudent espera claves en inglés/normalizadas)
      const s = studentRaw || {};

      // Guardar en el contexto para que los componentes que lean 'selected' se actualicen
      setSelected(s);
      return s;
    } catch (err) {
      // Solo registrar el error en el contexto cuando fue una búsqueda explícita
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const addStudent = useCallback(async (payload) => {
    setLoading(true);
    setError(null);
    try {
      const created = await studentService.createStudent(payload);
      setStudents((s) => [created, ...s]);
      return created;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const registerStudent = useCallback(async (formData) => {
    setLoading(true);
    setError(null);
    try {
      const result = await studentService.registerStudent(formData);
      // Opcionalmente actualizar la lista de estudiantes
      setStudents((s) => [result, ...s]);

      // Emitir notificación de éxito
      eventBus.emit("¡Estudiante registrado exitosamente!", "success");

      return result;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const removeStudent = useCallback(async (identification) => {
    setLoading(true);
    setError(null);
    try {
      await studentService.deleteStudent(identification);
      setStudents((s) => s.filter((x) => x.identification !== identification));
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateStudent = useCallback(
    async (studentId, personId, updatedData) => {
      setLoading(true);
      setError(null);
      try {
        const result = await studentService.updateStudent(
          studentId,
          personId,
          updatedData,
        );

        setStudents((prevStudents) =>
          prevStudents.map((student) => {
            const matchesId =
              student.id_student === studentId ||
              String(student.identification) === String(studentId) ||
              String(student.per_id) === String(personId);
            if (matchesId) {
              return { ...student, ...updatedData, ...(result || {}) };
            }
            return student;
          }),
        );

        // Emitir notificación de éxito
        eventBus.emit("¡Estudiante actualizado exitosamente!", "success");

        return result;
      } catch (err) {
        setError(err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  // Sube un Excel para carga masiva de estudiantes.
  const uploadStudentsExcel = useCallback(async (file) => {
    console.log("StudentContext: uploadStudentsExcel llamado con file:", file);
    setLoading(true);
    setError(null);
    try {
      const res = await studentService.uploadStudentsExcel(file);
      return res;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getStudentNotesById = useCallback(async (studentId) => {
    setLoading(true);
    setError(null);

    try {
      const res = await studentService.getStudentNotesById(studentId);
      console.log("StudentContext: Notas del estudiante obtenidas:", res);
      return Array.isArray(res) ? res : (res?.data ?? []);
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // obtiene N estudiantes aleatorios (usa studentService.getRandomStudents)
  const getRandomStudents = useCallback(async (count = 5) => {
    setLoading(true);
    setError(null);
    try {
      const items = await studentService.getRandomStudents(count);
      return items;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // wrapper que normaliza el resultado de getStudentObserver
  const getStudentObserver = useCallback(async (payload) => {
    const res = await studentService.getStudentObserver(payload);
    if (Array.isArray(res)) return res[0] || null;
    return res;
  }, []);

  const registerObservation = useCallback(async (payload) => {
    setLoading(true);
    setError(null);
    try {
      const result = await studentService.registerObservation(payload);
      eventBus.emit("¡Observación registrada correctamente!", "success");
      return result;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getObservationData = useCallback(async (payload) => {
    setLoading(true);
    setError(null);
    try {
      const result = await studentService.getObservationData(payload);
      return result;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateObservation = useCallback(async (payload) => {
    setLoading(true);
    setError(null);
    try {
      const result = await studentService.updateObservation(payload);
      eventBus.emit("¡Observación actualizada correctamente!", "success");
      return result;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const value = useMemo(
    () => ({
      students,
      loading,
      error,
      selected,
      reload: loadStudents,
      getStudent,
      getStudentByIdentification: studentService.getStudentByIdentification,
      getStudentObserver,
      registerObservation,
      getObservationData,
      updateObservation,
      updateStudent,
      getRandomStudents,
      getStudentNotesById,
      addStudent,
      registerStudent,
      removeStudent,
      uploadStudentsExcel,
    }),
    [
      students,
      loading,
      error,
      selected,
      loadStudents,
      getStudent,
      updateStudent,
      getRandomStudents,
      getStudentNotesById,
      addStudent,
      registerStudent,
      registerObservation,
      getObservationData,
      updateObservation,
      removeStudent,
      uploadStudentsExcel,
    ],
  );

  return (
    <StudentContext.Provider value={value}>{children}</StudentContext.Provider>
  );
}
