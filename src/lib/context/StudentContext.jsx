import React, { createContext, useCallback, useEffect, useState } from "react";
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
    setLoading(true);
    setError(null);
    try {
      // Aceptar tanto identificación simple como objeto payload
      const arg =
        payload === null || payload === undefined
          ? {}
          : typeof payload === "string" || typeof payload === "number"
            ? { identification: String(payload) }
            : payload;

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
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  });

  const addStudent = async (payload) => {
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
  };

  const registerStudent = async (formData) => {
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
  };

  const removeStudent = async (identification) => {
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
  };

  // Actualizar estudiante (studentId: id student, personId: id persona)
  const updateStudent = async (studentId, personId, updatedData) => {
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
  };

  // Sube un Excel para carga masiva de estudiantes.
  const uploadStudentsExcel = useCallback(async (file, options = {}) => {
    setLoading(true);
    setError(null);
    try {
      const res = await studentService.uploadStudentsExcel(file, options);
      return res;
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

  return (
    <StudentContext.Provider
      value={{
        students,
        loading,
        error,
        selected,
        reload: loadStudents,
        getStudent,
        updateStudent,
        getRandomStudents,
        addStudent,
        registerStudent,
        removeStudent,
        uploadStudentsExcel,
      }}
    >
      {children}
    </StudentContext.Provider>
  );
}
