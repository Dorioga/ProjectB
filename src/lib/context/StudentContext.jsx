import React, { createContext, useCallback, useEffect, useState } from "react";
import * as studentService from "../../services/studentService";

export const StudentContext = createContext();

export function StudentProvider({ children }) {
  const [students, setStudents] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);
  const [estError, setError] = useState(null);

  const loadStudents = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const res = await studentService.getStudents(params);
      const list = Array.isArray(res) ? res : res?.data ?? [];
      setStudents(list);
      return res;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchStudent = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const s = await studentService.getStudent(id);
      setSelected(s);
      return s;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const addStudent = async (payload) => {
    setLoading(true);
    setError(null);
    try {
      const created = await studentService.createStudent(payload);
      setStudents((prev) => [created, ...prev]);
      return created;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateStudent = async (id, payload) => {
    setLoading(true);
    setError(null);
    try {
      const updated = await studentService.updateStudent(id, payload);
      setStudents((prev) =>
        prev.map((p) => (p.id === id || p._id === id ? updated : p))
      );
      if (selected && (selected.id === id || selected._id === id)) {
        setSelected(updated);
      }
      return updated;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const removeStudent = async (id) => {
    setLoading(true);
    setError(null);
    try {
      await studentService.deleteStudent(id);
      setStudents((prev) => prev.filter((p) => p.id !== id && p._id !== id));
      if (selected && (selected.id === id || selected._id === id)) {
        setSelected(null);
      }
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // carga inicial opcional; descomenta si quieres autoload
    // void loadStudents();
  }, [loadStudents]);

  return (
    <StudentContext.Provider
      value={{
        students,
        selected,
        loading,
        estError,
        loadStudents,
        fetchStudent,
        addStudent,
        updateStudent,
        removeStudent,
        setSelected,
      }}
    >
      {children}
    </StudentContext.Provider>
  );
}
