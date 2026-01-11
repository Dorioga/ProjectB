import React, { createContext, useCallback, useEffect, useState } from "react";
import * as studentService from "../../services/studentService";

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
      setStudents(Array.isArray(res) ? res : res?.data ?? []);
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

  const getStudent = useCallback(async (identification) => {
    setLoading(true);
    setError(null);
    try {
      const student = await studentService.getStudent(identification);
      // Guardar en el contexto para que los componentes que lean 'selected' se actualicen
      setSelected(student);
      return student;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateStudent = (identification, updatedData) => {
    setStudents((prevStudents) =>
      prevStudents.map((student) =>
        student.identification === identification
          ? { ...student, ...updatedData }
          : student
      )
    );
  };

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
