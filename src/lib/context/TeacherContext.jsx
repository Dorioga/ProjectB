import React, { createContext, useCallback, useMemo, useState } from "react";
import * as teacherService from "../../services/teacherService";
import { eventBus } from "../../services/ApiClient";

export const TeacherContext = createContext(null);

export function TeacherProvider({ children }) {
  const [teachers, setTeachers] = useState([]);
  const [loadingTeachers, setLoadingTeachers] = useState(false);
  const [errorTeachers, setErrorTeachers] = useState(null);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [loadingSelectedTeacher, setLoadingSelectedTeacher] = useState(false);

  const loadTeachers = useCallback(async (params = {}) => {
    setLoadingTeachers(true);
    setErrorTeachers(null);
    try {
      const res = await teacherService.getTeachers(params);
      setTeachers(Array.isArray(res) ? res : (res?.data ?? []));
      return res;
    } catch (err) {
      setErrorTeachers(err);
      setTeachers([]);
      throw err;
    } finally {
      setLoadingTeachers(false);
    }
  }, []);

  const getTeacher = useCallback(async (id) => {
    if (!id) return null;
    setLoadingSelectedTeacher(true);
    try {
      const res = await teacherService.getTeacherById(id);
      setSelectedTeacher(res);
      return res;
    } catch (err) {
      setSelectedTeacher(null);
      throw err;
    } finally {
      setLoadingSelectedTeacher(false);
    }
  }, []);

  const addTeacher = useCallback(async (payload) => {
    setLoadingTeachers(true);
    setErrorTeachers(null);
    try {
      const created = await teacherService.createTeacher(payload);
      setTeachers((t) => [created, ...t]);
      eventBus.emit("¡Docente registrado exitosamente!", "success");
      return created;
    } catch (err) {
      setErrorTeachers(err);
      throw err;
    } finally {
      setLoadingTeachers(false);
    }
  }, []);

  const editTeacher = useCallback(async (teacherId, personId, payload) => {
    setLoadingTeachers(true);
    setErrorTeachers(null);
    try {
      const updated = await teacherService.updateTeacher(
        teacherId,
        personId,
        payload,
      );

      setTeachers((t) =>
        (t || []).map((x) =>
          x.id === teacherId || x._id === teacherId ? updated : x,
        ),
      );

      eventBus.emit("¡Docente actualizado exitosamente!", "success");
      return updated;
    } catch (err) {
      setErrorTeachers(err);
      throw err;
    } finally {
      setLoadingTeachers(false);
    }
  }, []);

  // Alias antiguo `updateTeacher` para compatibilidad
  const updateTeacher = useCallback(
    async (teacherId, personId, payload) => {
      return editTeacher(teacherId, personId, payload);
    },
    [editTeacher],
  );

  const getSedes = useCallback(async (payload = {}) => {
    try {
      const res = await teacherService.getTeacherSedes(payload);
      return res;
    } catch (err) {
      throw err;
    }
  }, []);

  // Obtener datos del docente (antes en SchoolContext)
  const getDataTeacher = useCallback(async (payload = {}) => {
    try {
      const res = await teacherService.getDataTeacher(payload);
      return res;
    } catch (err) {
      throw err;
    }
  }, []);

  // Obtener todos los docentes (compatibilidad con fetchAllTeachers)
  const fetchAllTeachers = useCallback(async (payload) => {
    setLoadingTeachers(true);
    setErrorTeachers(null);
    try {
      const res = await teacherService.getTeachers(payload);
      return res;
    } catch (err) {
      setErrorTeachers(err);
      throw err;
    } finally {
      setLoadingTeachers(false);
    }
  }, []);

  // Compatibilidad: getTeacherSede (singular) usado en el código existente
  const getTeacherSede = useCallback(
    async (payload = {}) => {
      return getSedes(payload);
    },
    [getSedes],
  );

  // -------- Teacher related helper methods migrated here --------
  const getTeacherSubjects = useCallback(async (payload = {}) => {
    setLoadingTeachers(true);
    setErrorTeachers(null);
    try {
      const res = await teacherService.getTeacherSubjects(payload);
      return res;
    } catch (err) {
      setErrorTeachers(err);
      throw err;
    } finally {
      setLoadingTeachers(false);
    }
  }, []);

  const getTeacherGrades = useCallback(async (payload = {}) => {
    setLoadingTeachers(true);
    setErrorTeachers(null);
    try {
      const res = await teacherService.getTeacherGrades(payload);
      return res;
    } catch (err) {
      setErrorTeachers(err);
      throw err;
    } finally {
      setLoadingTeachers(false);
    }
  }, []);

  const getStudentNotes = useCallback(async (payload = {}) => {
    setLoadingTeachers(true);
    setErrorTeachers(null);
    try {
      const res = await teacherService.getStudentNotes(payload);
      return res;
    } catch (err) {
      setErrorTeachers(err);
      throw err;
    } finally {
      setLoadingTeachers(false);
    }
  }, []);

  // Registrar asistencia de estudiante(s)
  const registerAssistance = useCallback(async (payload = {}) => {
    setLoadingTeachers(true);
    setErrorTeachers(null);
    try {
      const res = await teacherService.registerAssistance(payload);
      eventBus.emit("¡Asistencia registrada exitosamente!", "success");
      return res;
    } catch (err) {
      setErrorTeachers(err);
      throw err;
    } finally {
      setLoadingTeachers(false);
    }
  }, []);

  // ----------------- Logros (nuevo) -----------------
  const getLogroType = useCallback(async () => {
    setLoadingTeachers(true);
    setErrorTeachers(null);
    try {
      const res = await teacherService.getLogroType();
      return res;
    } catch (err) {
      setErrorTeachers(err);
      throw err;
    } finally {
      setLoadingTeachers(false);
    }
  }, []);

  const getLogroInstitution = useCallback(async (payload = {}) => {
    setLoadingTeachers(true);
    setErrorTeachers(null);
    try {
      const res = await teacherService.getLogroInstitution(payload);
      return res;
    } catch (err) {
      setErrorTeachers(err);
      throw err;
    } finally {
      setLoadingTeachers(false);
    }
  }, []);

  const getAllLogros = useCallback(async (payload = {}) => {
    setLoadingTeachers(true);
    setErrorTeachers(null);
    try {
      const res = await teacherService.getAllLogros(payload);
      return res;
    } catch (err) {
      setErrorTeachers(err);
      throw err;
    } finally {
      setLoadingTeachers(false);
    }
  }, []);

  const saveAssignmentNotes = useCallback(async (payload = {}) => {
    setLoadingTeachers(true);
    setErrorTeachers(null);
    try {
      const res = await teacherService.saveAssignmentNotes(payload);
      eventBus.emit("¡Notas guardadas exitosamente!", "success");
      return res;
    } catch (err) {
      setErrorTeachers(err);
      throw err;
    } finally {
      setLoadingTeachers(false);
    }
  }, []);

  // Actualiza una nota de asignación (PATCH /assignment_note)
  const updateAssignmentNote = useCallback(async (payload = {}) => {
    setLoadingTeachers(true);
    setErrorTeachers(null);
    try {
      const res = await teacherService.updateAssignmentNote(payload);
      eventBus.emit("¡Nota actualizada exitosamente!", "success");
      return res;
    } catch (err) {
      setErrorTeachers(err);
      throw err;
    } finally {
      setLoadingTeachers(false);
    }
  }, []);

  const assignSede = useCallback(async (payload) => {
    try {
      const res = await teacherService.createTeacherSede(payload);
      eventBus.emit("¡Sede asignada al docente exitosamente!", "success");
      return res;
    } catch (err) {
      throw err;
    }
  }, []);

  // Compatibilidad: createTeacherSede
  const createTeacherSede = useCallback(
    async (payload) => {
      return assignSede(payload);
    },
    [assignSede],
  );

  const assignAsignature = useCallback(async (payload) => {
    try {
      const res = await teacherService.createTeacherAsignature(payload);
      eventBus.emit("¡Asignatura asignada al docente exitosamente!", "success");
      return res;
    } catch (err) {
      throw err;
    }
  }, []);

  // Compatibilidad: createTeacherAsignature
  const createTeacherAsignature = useCallback(
    async (payload) => {
      return assignAsignature(payload);
    },
    [assignAsignature],
  );

  const value = useMemo(
    () => ({
      teachers,
      loadingTeachers,
      errorTeachers,
      selectedTeacher,
      loadingSelectedTeacher,
      loadTeachers,
      getTeacher,
      addTeacher,
      editTeacher,
      getSedes,
      getTeacherSede,
      getTeacherSubjects,
      getTeacherGrades,
      getStudentNotes,
      saveAssignmentNotes,
      updateAssignmentNote,
      getDataTeacher,
      fetchAllTeachers,
      assignSede,
      assignAsignature,
      // Logros
      getLogroType,
      getLogroInstitution,
      getAllLogros,
      // Asistencia
      registerAssistance,
    }),
    [
      teachers,
      loadingTeachers,
      errorTeachers,
      selectedTeacher,
      loadingSelectedTeacher,
      loadTeachers,
      getTeacher,
      addTeacher,
      editTeacher,
      getSedes,
      getTeacherSede,
      getTeacherSubjects,
      getTeacherGrades,
      getStudentNotes,
      saveAssignmentNotes,
      updateAssignmentNote,
      getDataTeacher,
      fetchAllTeachers,
      assignSede,
      assignAsignature,
      getLogroType,
      getLogroInstitution,
      getAllLogros,
      registerAssistance,
    ],
  );

  return (
    <TeacherContext.Provider value={value}>{children}</TeacherContext.Provider>
  );
}

export default TeacherProvider;
