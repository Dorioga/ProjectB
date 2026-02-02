import React, {
  createContext,
  useCallback,
  useEffect,
  useState,
  useRef,
} from "react";
import * as schoolService from "../../services/schoolService";
import { eventBus } from "../../services/ApiClient";

export const SchoolContext = createContext(null);

export function SchoolProvider({ children }) {
  const [schools, setSchools] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [sedes, setSedes] = useState([]);
  const [loadingSedes, setLoadingSedes] = useState(false);
  const [errorSedes, setErrorSedes] = useState(null);
  const [journeys, setJourneys] = useState([]);
  const [loadingJourneys, setLoadingJourneys] = useState(false);
  const [errorJourneys, setErrorJourneys] = useState(null);
  const [records, setRecords] = useState([]);
  const [loadingRecords, setLoadingRecords] = useState(false);
  const [errorRecords, setErrorRecords] = useState(null);
  const [periods, setPeriods] = useState([]);
  const [loadingPeriods, setLoadingPeriods] = useState(false);
  const [errorPeriods, setErrorPeriods] = useState(null);
  const [pathSignature, setPathSignature] = useState(
    "https://a.storyblok.com/f/191576/1200x800/b7ad4902a2/signature_maker_after_.webp",
  );

  const journeysLoadedRef = useRef(false);
  const periodsLoadedRef = useRef(false);

  const loadSedes = useCallback(async (params = {}) => {
    setLoadingSedes(true);
    setErrorSedes(null);
    try {
      const res = await schoolService.getSedes(params);
      setSedes(Array.isArray(res) ? res : (res?.data ?? []));
    } catch (err) {
      setErrorSedes(err);
    } finally {
      setLoadingSedes(false);
    }
  }, []);

  const loadJourneys = useCallback(async () => {
    // Evitar múltiples cargas (ya se cargó o está cargando)
    if (journeysLoadedRef.current || loadingJourneys) return;

    journeysLoadedRef.current = true;
    setLoadingJourneys(true);
    setErrorJourneys(null);
    try {
      const journeysData = await schoolService.getJourneys();

      // getJourneys ya devuelve el array mapeado directamente
      if (Array.isArray(journeysData)) {
        setJourneys(journeysData);
        console.log(
          `SchoolContext: ${journeysData.length} jornadas cargadas en el contexto`,
        );
      } else {
        console.warn(
          "SchoolContext: respuesta de getJourneys no es un array",
          journeysData,
        );
        setJourneys([]);
      }
    } catch (err) {
      console.error("Error al cargar jornadas:", err);
      setErrorJourneys(err);
      setJourneys([]);
      journeysLoadedRef.current = false; // Permitir reintento en caso de error
    } finally {
      setLoadingJourneys(false);
    }
  }, [loadingJourneys]);

  const loadPeriods = useCallback(async () => {
    // Evitar múltiples cargas (ya se cargó o está cargando)
    if (periodsLoadedRef.current || loadingPeriods) return;

    periodsLoadedRef.current = true;
    setLoadingPeriods(true);
    setErrorPeriods(null);
    try {
      const periodsData = await schoolService.getPeriods();
      const periodsArray = Array.isArray(periodsData)
        ? periodsData
        : (periodsData?.data ?? []);

      setPeriods(periodsArray);
      console.log(
        `SchoolContext: ${periodsArray.length} períodos cargados en el contexto`,
      );
    } catch (err) {
      console.error("Error al cargar períodos:", err);
      setErrorPeriods(err);
      setPeriods([]);
      periodsLoadedRef.current = false; // Permitir reintento en caso de error
    } finally {
      setLoadingPeriods(false);
    }
  }, [loadingPeriods]);

  const loadRecords = useCallback(async (params = {}) => {
    setLoadingRecords(true);
    setErrorRecords(null);
    try {
      const res = await schoolService.loadRecords(params);
      setRecords(Array.isArray(res) ? res : (res?.data ?? []));
    } catch (err) {
      setErrorRecords(err);
    } finally {
      setLoadingRecords(false);
    }
  }, []);

  const loadSchools = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await schoolService.getSchools();
      // Ajusta según la forma en que tu API devuelve los datos
      setSchools(Array.isArray(res) ? res : (res?.data ?? []));
    } catch (err) {
      setError(err);
      // No volver a lanzar aquí para no interrumpir el montaje
    } finally {
      setLoading(false);
    }
  }, []);

  const addSchool = async (payload) => {
    setLoading(true);
    setError(null);
    try {
      const created = await schoolService.createSchool(payload);
      setSchools((s) => [created, ...s]);

      // Emitir notificación de éxito
      eventBus.emit("¡Institución registrada exitosamente!", "success");

      return created;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateSchool = async (id, payload) => {
    setLoading(true);
    setError(null);
    try {
      const updated = await schoolService.updateSchool(id, payload);
      setSchools((s) =>
        s.map((x) => (x.id === id || x._id === id ? updated : x)),
      );

      // Emitir notificación de éxito
      eventBus.emit("¡Institución actualizada exitosamente!", "success");

      return updated;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const registerGrade = async (gradeData) => {
    setLoading(true);
    setError(null);
    try {
      const result = await schoolService.registerGrade(gradeData);

      // Emitir notificación de éxito
      eventBus.emit("¡Grado registrado exitosamente!", "success");

      return result;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const registerTeacher = async (formData) => {
    setLoading(true);
    setError(null);
    try {
      const result = await schoolService.registerTeacher(formData);

      // Emitir notificación de éxito
      eventBus.emit("¡Profesor registrado exitosamente!", "success");

      return result;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateTeacher = async (id, payload) => {
    setLoading(true);
    setError(null);
    try {
      const updated = await schoolService.updateTeacher(id, payload);

      // Emitir notificación de éxito
      eventBus.emit("¡Profesor actualizado exitosamente!", "success");

      return updated;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateSede = async (institutionId, sedeId, payload) => {
    setLoading(true);
    setError(null);
    try {
      const updated = await schoolService.updateSede(
        institutionId,
        sedeId,
        payload,
      );

      // Actualizar cache local de sedes si existe
      setSedes((s) =>
        (s || []).map((x) =>
          x.id === sedeId || x.id_sede === sedeId
            ? { ...x, ...(typeof updated === "object" ? updated : {}) }
            : x,
        ),
      );

      // Emitir notificación de éxito
      eventBus.emit("¡Sede actualizada exitosamente!", "success");

      return updated;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const removeSchool = async (id) => {
    setLoading(true);
    setError(null);
    try {
      await schoolService.deleteSchool(id);
      setSchools((s) => s.filter((x) => x.id !== id && x._id !== id));
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getGradeSede = async (payload) => {
    setLoading(true);
    setError(null);
    try {
      const result = await schoolService.getGradeSede(payload);
      return result;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const registerAsignature = async (payload) => {
    setLoading(true);
    setError(null);
    try {
      const result = await schoolService.registerAsignature(payload);

      // Emitir notificación de éxito
      eventBus.emit("¡Asignatura registrada exitosamente!", "success");

      return result;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getSedeAsignature = async (payload) => {
    setLoading(true);
    setError(null);
    try {
      console.log("SchoolContext - getSedeAsignature payload:", payload);
      const result = await schoolService.getSedeAsignature(payload);

      return result;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getDataSede = async (payload) => {
    setLoading(true);
    setError(null);
    try {
      console.log("SchoolContext - getDataSede payload:", payload);
      const result = await schoolService.getDataSede(payload);
      return result;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getDataSchool = async (payload) => {
    setLoading(true);
    setError(null);
    try {
      console.log("SchoolContext - getDataSchool payload:", payload);
      const result = await schoolService.getDataSchool(payload);
      return result;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getDataTeacher = async (payload) => {
    setLoading(true);
    setError(null);
    try {
      console.log("SchoolContext - getDataTeacher payload:", payload);
      const result = await schoolService.getDataTeacher(payload);

      // Normalizar respuesta y construir objeto procesado:
      // {
      //   id_docente,
      //   basic: { first_name, second_name, first_lastname, second_lastname, telephone, identification, email, fecha_nacimiento, direccion, nombre_sede },
      //   subjects: [{ id_asignatura, asignatura, grades: [{ nombre_grado, grupo }] }],
      //   estado
      // }

      const raw = Array.isArray(result) ? result : (result?.data ?? result);
      const rows = Array.isArray(raw) ? raw : [];
      const processed = {
        id_docente: null,
        basic: {},
        subjects: [],
        estado: "",
      };

      if (rows.length > 0) {
        const base = rows[0];
        processed.id_docente = base.id_docente ?? null;
        processed.basic = {
          first_name: base.primero_nombre || "",
          second_name: base.segundo_nombre || "",
          first_lastname: base.primer_apellido || "",
          second_lastname: base.segundo_apellido || "",
          telephone: base.telefono || "",
          identification: base.numero_identificacion || "",
          email: base.correo || "",
          fecha_nacimiento: base.fecha_nacimiento || "",
          direccion: base.direccion || "",
          nombre_sede: base.nombre_sede || "",
        };

        // Agrupar asignaturas por id_asignatura y también por grupo (para mostrar grupos primero)
        const map = new Map();
        const groupMap = new Map();

        rows.forEach((r) => {
          const ids = String(r.ids_asignaturas ?? "")
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean);
          const names = String(r.asignaturas ?? "")
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean);

          for (let i = 0; i < ids.length; i++) {
            const idAsig = parseInt(ids[i], 10);
            const nameAsig = names[i] || ids[i];
            const grupo = r.grupo;
            const nombre_grado = r.nombre_grado;

            // por asignatura (mantener subjects con groups)
            const key = `${idAsig}`;
            if (!map.has(key)) {
              map.set(key, {
                id_asignatura: idAsig,
                asignatura: nameAsig,
                groupsMap: new Map(),
              });
            }
            const subj = map.get(key);
            if (!subj.groupsMap.has(grupo))
              subj.groupsMap.set(grupo, new Set());
            subj.groupsMap.get(grupo).add(nombre_grado);

            // por grupo (nuevo formato para mostrar grupos primero)
            if (!groupMap.has(grupo)) groupMap.set(grupo, new Map());
            const assignmentsForGroup = groupMap.get(grupo);
            const assignKey = `${idAsig}-${nombre_grado}`;
            if (!assignmentsForGroup.has(assignKey)) {
              assignmentsForGroup.set(assignKey, {
                id_asignatura: idAsig,
                asignatura: nameAsig,
                nombre_grado,
                grupo,
              });
            }
          }
        });

        // Convertir map a subjects con groups
        processed.subjects = Array.from(map.values()).map((s) => {
          const groups = Array.from(s.groupsMap.entries()).map(
            ([grupo, set]) => ({
              grupo,
              grados: Array.from(set),
            }),
          );
          delete s.groupsMap;
          return { ...s, groups };
        });

        // Convertir groupMap a array { grupo, assignments: [...] }
        processed.groups = Array.from(groupMap.entries()).map(
          ([grupo, assignmentsMap]) => ({
            grupo,
            assignments: Array.from(assignmentsMap.values()),
          }),
        );

        processed.estado = rows[0].estado ?? "";
      }

      return processed;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getGradeAsignature = async (payload) => {
    setLoading(true);
    setError(null);
    try {
      const result = await schoolService.getGradeAsignature(payload);
      return result;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const createNote = async (payload) => {
    setLoading(true);
    setError(null);
    try {
      const result = await schoolService.createNote(payload);

      // Emitir notificación de éxito
      eventBus.emit("¡Nota registrada exitosamente!", "success");

      return result;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getTeacherSubjects = useCallback(
    async (payload) => {
      setLoading(true);
      setError(null);
      try {
        const result = await schoolService.getTeacherSubjects(payload);
        return result;
      } catch (err) {
        setError(err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [setLoading, setError],
  );

  const getInstitution = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await schoolService.getInstitution();
      return result;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getTeacherGrades = useCallback(
    async (payload) => {
      setLoading(true);
      setError(null);
      try {
        const result = await schoolService.getTeacherGrades(payload);
        return result;
      } catch (err) {
        setError(err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [setLoading, setError],
  );

  const getStudentGrades = useCallback(
    async (payload) => {
      setLoading(true);
      setError(null);
      try {
        const result = await schoolService.getStudentGrades(payload);
        return result;
      } catch (err) {
        setError(err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [setLoading, setError],
  );

  const getStudentNotes = useCallback(
    async (payload) => {
      setLoading(true);
      setError(null);
      try {
        const result = await schoolService.getStudentNotes(payload);
        return result;
      } catch (err) {
        setError(err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [setLoading, setError],
  );

  const saveAssignmentNotes = async (payload) => {
    setLoading(true);
    setError(null);
    try {
      const result = await schoolService.saveAssignmentNotes(payload);

      // Emitir notificación de éxito
      eventBus.emit("¡Notas guardadas exitosamente!", "success");

      return result;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const fetchAllStudents = useCallback(async (payload) => {
    setLoading(true);
    setError(null);
    try {
      const students = await schoolService.allstudent(payload);
      return students;
    } catch (error) {
      console.error("Error al obtener todos los estudiantes:", error);
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchAllTeachers = useCallback(async (payload) => {
    setLoading(true);
    setError(null);
    try {
      const teachers = await schoolService.allteacher(payload);
      return teachers;
    } catch (error) {
      console.error("Error al obtener todos los profesores:", error);
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <SchoolContext.Provider
      value={{
        schools,
        loading,
        error,
        sedes,
        loadingSedes,
        errorSedes,
        journeys,
        loadingJourneys,
        errorJourneys,
        records,
        loadingRecords,
        errorRecords,
        periods,
        loadingPeriods,
        errorPeriods,
        reload: loadSchools,
        reloadSedes: loadSedes,
        reloadJourneys: loadJourneys,
        reloadRecords: loadRecords,
        loadPeriods,
        addSchool,
        updateSchool,
        removeSchool,
        registerGrade,
        registerTeacher,
        getGradeSede,
        registerAsignature,
        getSedeAsignature,
        getDataSede,
        getDataSchool,
        getDataTeacher,
        updateSede,
        getGradeAsignature,
        createNote,
        getTeacherSubjects,
        getTeacherGrades,
        getInstitution,
        getStudentGrades,
        getStudentNotes,
        saveAssignmentNotes,
        pathSignature,
        setPathSignature,
        fetchAllStudents,
        fetchAllTeachers,
      }}
    >
      {children}
    </SchoolContext.Provider>
  );
}
