import React, { createContext, useCallback, useEffect, useState } from "react";
import * as schoolService from "../../services/schoolService";

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
  const [pathSignature, setPathSignature] = useState(
    "https://a.storyblok.com/f/191576/1200x800/b7ad4902a2/signature_maker_after_.webp"
  );

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

  const loadJourneys = useCallback(async (params = {}) => {
    setLoadingJourneys(true);
    setErrorJourneys(null);
    try {
      const res = await schoolService.getJourneys(params);
      setJourneys(Array.isArray(res) ? res : res?.data ?? []);
    } catch (err) {
      setErrorJourneys(err);
    } finally {
      setLoadingJourneys(false);
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

  useEffect(() => {
    loadSchools();
  }, [loadSchools]);

  useEffect(() => {
    loadSedes();
  }, [loadSedes]);

  const addSchool = async (payload) => {
    setLoading(true);
    setError(null);
    try {
      const created = await schoolService.createSchool(payload);
      setSchools((s) => [created, ...s]);
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
        reload: loadSchools,
        reloadSedes: loadSedes,
        reloadJourneys: loadJourneys,
        addSchool,
        updateSchool,
        removeSchool,
        pathSignature,
        setPathSignature,
      }}
    >
      {children}
    </SchoolContext.Provider>
  );
}
