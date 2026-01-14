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

  const [statusBeca, setStatusBeca] = useState([]);
  const [loadingStatusBeca, setLoadingStatusBeca] = useState(false);
  const [errorStatusBeca, setErrorStatusBeca] = useState(null);

  const [roles, setRoles] = useState([]);
  const [loadingRoles, setLoadingRoles] = useState(false);
  const [errorRoles, setErrorRoles] = useState(null);

  const [departments, setDepartments] = useState([]);
  const [loadingDepartments, setLoadingDepartments] = useState(false);
  const [errorDepartments, setErrorDepartments] = useState(null);

  const [cities, setCities] = useState([]);
  const [loadingCities, setLoadingCities] = useState(false);
  const [errorCities, setErrorCities] = useState(null);
  const [selectedDepartment, setSelectedDepartment] = useState(null);

  const [loadingRegisterUser, setLoadingRegisterUser] = useState(false);
  const [errorRegisterUser, setErrorRegisterUser] = useState(null);

  const [institutionSedes, setInstitutionSedes] = useState([]);
  const [loadingInstitutionSedes, setLoadingInstitutionSedes] = useState(false);
  const [errorInstitutionSedes, setErrorInstitutionSedes] = useState(null);

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

  const loadStatusBeca = useCallback(async () => {
    setLoadingStatusBeca(true);
    setErrorStatusBeca(null);
    try {
      const res = await dataService.getStatusBeca();
      setStatusBeca(Array.isArray(res) ? res : res?.data ?? []);
      return res;
    } catch (err) {
      setErrorStatusBeca(err);
      throw err;
    } finally {
      setLoadingStatusBeca(false);
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

  const loadDepartments = useCallback(async () => {
    setLoadingDepartments(true);
    setErrorDepartments(null);
    try {
      const res = await dataService.getDepartments();
      setDepartments(Array.isArray(res) ? res : res?.data ?? []);
      return res;
    } catch (err) {
      setErrorDepartments(err);
      throw err;
    } finally {
      setLoadingDepartments(false);
    }
  }, []);

  const loadCities = useCallback(async (departmentId) => {
    if (!departmentId) {
      setCities([]);
      setSelectedDepartment(null);
      return [];
    }

    setLoadingCities(true);
    setErrorCities(null);
    try {
      const res = await dataService.getCities(departmentId);
      const citiesData = Array.isArray(res) ? res : res?.data ?? [];

      // Normalizar formato de municipios: id_municipio -> id, nombre -> name
      const normalizedCities = citiesData.map((city) => ({
        id: city.id_municipio || city.id,
        name: city.nombre || city.name,
      }));

      setCities(normalizedCities);
      setSelectedDepartment(departmentId);
      return normalizedCities;
    } catch (err) {
      setErrorCities(err);
      setCities([]);
      throw err;
    } finally {
      setLoadingCities(false);
    }
  }, []);

  // Eliminados los useEffect automáticos para cargar solo cuando se necesite
  // Los componentes selectores cargarán los datos con autoLoad cuando se monten
  // useEffect(() => {
  //   // Carga inicial de catálogos.
  //   loadTypeIdentification().catch(() => {});
  //   loadRoles().catch(() => {});
  //   loadDepartments().catch(() => {});
  // }, [loadTypeIdentification, loadRoles, loadDepartments]);

  const loadInstitutionSedes = useCallback(async (idInstitucion) => {
    if (!idInstitucion) {
      setInstitutionSedes([]);
      return [];
    }

    setLoadingInstitutionSedes(true);
    setErrorInstitutionSedes(null);
    try {
      const formData = new FormData();
      formData.append("idInstitution", String(idInstitucion));

      const res = await dataService.getInstitutionSede(formData);
      const sedesData = Array.isArray(res) ? res : res?.data ?? [];
      console.log("DataContext - loadInstitutionSedes raw:", sedesData);
      // Normalizar formato: id_sede -> id, nombre_sede -> nombre
      const normalizedSedes = sedesData.map((sede) => ({
        id: sede.id_sede || sede.id,
        nombre: sede.nombre_sede || sede.nombre,
        name_workday: sede.nombre_jornada,
        fk_institucion: sede.fk_institucion,
        fk_workday: sede.id_jornada,
      }));
      console.log("DataContext - loadInstitutionSedes:", normalizedSedes);

      setInstitutionSedes(normalizedSedes);
      return normalizedSedes;
    } catch (err) {
      setErrorInstitutionSedes(err);
      setInstitutionSedes([]);
      throw err;
    } finally {
      setLoadingInstitutionSedes(false);
    }
  }, []);

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

      statusBeca,
      loadingStatusBeca,
      errorStatusBeca,
      reloadStatusBeca: loadStatusBeca,

      roles,
      loadingRoles,
      errorRoles,
      reloadRoles: loadRoles,

      departments,
      loadingDepartments,
      errorDepartments,
      reloadDepartments: loadDepartments,

      cities,
      loadingCities,
      errorCities,
      loadCities,
      selectedDepartment,

      registerUser,
      loadingRegisterUser,
      errorRegisterUser,

      institutionSedes,
      loadingInstitutionSedes,
      errorInstitutionSedes,
      loadInstitutionSedes,
    }),
    [
      typeIdentification,
      loadingTypeIdentification,
      errorTypeIdentification,
      loadTypeIdentification,

      statusBeca,
      loadingStatusBeca,
      errorStatusBeca,
      loadStatusBeca,

      roles,
      loadingRoles,
      errorRoles,
      loadRoles,

      departments,
      loadingDepartments,
      errorDepartments,
      loadDepartments,

      cities,
      loadingCities,
      errorCities,
      loadCities,
      selectedDepartment,

      registerUser,
      loadingRegisterUser,
      errorRegisterUser,

      institutionSedes,
      loadingInstitutionSedes,
      errorInstitutionSedes,
      loadInstitutionSedes,
    ]
  );

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}
