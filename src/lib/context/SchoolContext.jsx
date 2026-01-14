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
    "https://a.storyblok.com/f/191576/1200x800/b7ad4902a2/signature_maker_after_.webp"
  );

  const journeysLoadedRef = useRef(false);
  const periodsLoadedRef = useRef(false);

  const loadSedes = useCallback(async (params = {}) => {
    setLoadingSedes(true);
    setErrorSedes(null);
    try {
      const res = await schoolService.getSedes(params);
      setSedes(Array.isArray(res) ? res : res?.data ?? []);
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
          `SchoolContext: ${journeysData.length} jornadas cargadas en el contexto`
        );
      } else {
        console.warn(
          "SchoolContext: respuesta de getJourneys no es un array",
          journeysData
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
        : periodsData?.data ?? [];

      setPeriods(periodsArray);
      console.log(
        `SchoolContext: ${periodsArray.length} períodos cargados en el contexto`
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
      setRecords(Array.isArray(res) ? res : res?.data ?? []);
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
      setSchools(Array.isArray(res) ? res : res?.data ?? []);
    } catch (err) {
      setError(err);
      // No volver a lanzar aquí para no interrumpir el montaje
    } finally {
      setLoading(false);
    }
  }, []);

  // Eliminados los useEffect automáticos para cargar solo cuando se necesite
  // useEffect(() => {
  //   loadSchools();
  // }, [loadSchools]);

  // useEffect(() => {
  //   loadSedes();
  // }, [loadSedes]);

  // useEffect(() => {
  //   loadJourneys();
  // }, [loadJourneys]);

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
        s.map((x) => (x.id === id || x._id === id ? updated : x))
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

  const getTeacherSubjects = async (payload) => {
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
  };

  const getInstitution = async () => {
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
  };

  const getTeacherGrades = async (payload) => {
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
  };

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
        getGradeAsignature,
        createNote,
        getTeacherSubjects,
        getTeacherGrades,
        getInstitution,
        pathSignature,
        setPathSignature,
      }}
    >
      {children}
    </SchoolContext.Provider>
  );
}
