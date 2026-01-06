import React, {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import * as dataService from "../../services/dataService";

export const DataContext = createContext(null);

export function DataProvider({ children }) {
  const [typeIdentification, setTypeIdentification] = useState([]);
  const [loadingTypeIdentification, setLoadingTypeIdentification] =
    useState(false);
  const [errorTypeIdentification, setErrorTypeIdentification] = useState(null);

  const loadTypeIdentification = useCallback(
    async (params = {}, options = {}) => {
      setLoadingTypeIdentification(true);
      setErrorTypeIdentification(null);
      try {
        const res = await dataService.getTypeIdentification(params, options);
        setTypeIdentification(Array.isArray(res) ? res : res?.data ?? []);
        return res;
      } catch (err) {
        setErrorTypeIdentification(err);
        throw err;
      } finally {
        setLoadingTypeIdentification(false);
      }
    },
    []
  );

  useEffect(() => {
    // Carga inicial de catálogos.
    loadTypeIdentification().catch(() => {});
  }, [loadTypeIdentification]);

  const value = useMemo(
    () => ({
      typeIdentification,
      loadingTypeIdentification,
      errorTypeIdentification,
      reloadTypeIdentification: loadTypeIdentification,
    }),
    [
      typeIdentification,
      loadingTypeIdentification,
      errorTypeIdentification,
      loadTypeIdentification,
    ]
  );

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}
