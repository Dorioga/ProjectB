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

  const [roles, setRoles] = useState([]);
  const [loadingRoles, setLoadingRoles] = useState(false);
  const [errorRoles, setErrorRoles] = useState(null);

  const [loadingRegisterUser, setLoadingRegisterUser] = useState(false);
  const [errorRegisterUser, setErrorRegisterUser] = useState(null);

  const loadTypeIdentification = useCallback(async () => {
    setLoadingTypeIdentification(true);
    setErrorTypeIdentification(null);
    try {
      const res = await dataService.getTypeIdentification();
      setTypeIdentification(Array.isArray(res) ? res : res?.data ?? []);
      return res;
    } catch (err) {
      setErrorTypeIdentification(err);
      throw err;
    } finally {
      setLoadingTypeIdentification(false);
    }
  }, []);

  const loadRoles = useCallback(async () => {
    setLoadingRoles(true);
    setErrorRoles(null);
    try {
      const res = await dataService.getRol();
      setRoles(Array.isArray(res) ? res : res?.data ?? []);
      return res;
    } catch (err) {
      setErrorRoles(err);
      throw err;
    } finally {
      setLoadingRoles(false);
    }
  }, []);

  useEffect(() => {
    // Carga inicial de catálogos.
    loadTypeIdentification().catch(() => {});
    loadRoles().catch(() => {});
  }, [loadTypeIdentification, loadRoles]);

  const registerUser = useCallback(async (formData) => {
    setLoadingRegisterUser(true);
    setErrorRegisterUser(null);
    try {
      const res = await dataService.registerUser(formData);
      return res;
    } catch (err) {
      setErrorRegisterUser(err);
      throw err;
    } finally {
      setLoadingRegisterUser(false);
    }
  }, []);

  const value = useMemo(
    () => ({
      typeIdentification,
      loadingTypeIdentification,
      errorTypeIdentification,
      reloadTypeIdentification: loadTypeIdentification,

      roles,
      loadingRoles,
      errorRoles,
      reloadRoles: loadRoles,

      registerUser,
      loadingRegisterUser,
      errorRegisterUser,
    }),
    [
      typeIdentification,
      loadingTypeIdentification,
      errorTypeIdentification,
      loadTypeIdentification,

      roles,
      loadingRoles,
      errorRoles,
      loadRoles,

      registerUser,
      loadingRegisterUser,
      errorRegisterUser,
    ]
  );

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}
