import React, {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import * as authService from "../../services/authService";
import { setAuthToken, eventBus } from "../../services/ApiClient";
import { useNavigate } from "react-router-dom";
import { getMenuRol } from "../../services/dataService";
import { applyCustomColors, resetTheme } from "../../utils/themeManager";
import { institutionAbbreviation } from "../../utils/formatUtils";

export const AuthContext = createContext(null);

// Funciones auxiliares para localStorage
const loadFromStorage = (key, fallback = null) => {
  try {
    const item = localStorage.getItem(key);
    if (!item) return fallback;
    // Para nameRole, devolver el valor directo sin parsear
    if (key === "nameRole") return item;
    return JSON.parse(item);
  } catch {
    return fallback;
  }
};

const saveToStorage = (key, value) => {
  try {
    if (value === null || value === undefined) {
      localStorage.removeItem(key);
    } else if (key === "nameRole") {
      // Para nameRole, guardar sin JSON.stringify
      localStorage.setItem(key, value);
    } else {
      localStorage.setItem(key, JSON.stringify(value));
    }
  } catch (err) {
    console.error(`Error saving ${key}:`, err);
  }
};

export function AuthProvider({ children }) {
  // Cargar datos iniciales desde localStorage
  const [userId, setUserId] = useState(() => loadFromStorage("userId"));
  const [userName, setUserName] = useState(() => loadFromStorage("userName"));
  const [userEmail, setUserEmail] = useState(() =>
    loadFromStorage("userEmail"),
  );
  const [nameSchool, setNameSchool] = useState(() =>
    loadFromStorage("nameSchool"),
  );
  const [idInstitution, setIdInstitution] = useState(() =>
    loadFromStorage("idInstitution"),
  );
  const [imgSchool, setImgSchool] = useState(() =>
    loadFromStorage("imgSchool"),
  );
  const [nameRole, setNameRole] = useState(() => loadFromStorage("nameRole"));
  const [rol, setRol] = useState(() => loadFromStorage("rol"));
  const [nameSede, setNameSede] = useState(() => loadFromStorage("nameSede"));
  const [idSede, setIdSede] = useState(() => loadFromStorage("idSede"));
  const [colorPrincipal, setColorPrincipal] = useState(() =>
    loadFromStorage("colorPrincipal"),
  );
  const [colorSecundario, setColorSecundario] = useState(() =>
    loadFromStorage("colorSecundario"),
  );
  const [menu, setMenu] = useState(() => loadFromStorage("menu"));
  const [idDocente, setIdDocente] = useState(() =>
    loadFromStorage("idDocente"),
  );
  const [idEstudiante, setIdEstudiante] = useState(() =>
    loadFromStorage("idEstudiante"),
  );
  const [idPersona, setIdPersona] = useState(() =>
    loadFromStorage("idPersona"),
  );
  const [fkInstitucion, setFkInstitucion] = useState(() =>
    loadFromStorage("fk_institucion"),
  );
  const [director, setDirector] = useState(() => loadFromStorage("director"));
  const [gradoAcargo, setGradoAcargo] = useState(() =>
    loadFromStorage("gradoAcargo"),
  );

  // número de identificación (cedula, etc.) del usuario
  // no se persiste en localStorage, solo se mantiene en memoria
  const [numero_identificacion, setNumeroIdentificacion] = useState(null);

  const [token, setToken] = useState(
    () => localStorage.getItem("token") || null,
  );

  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Estado del modal de términos y condiciones
  const [showTermsModal, setShowTermsModal] = useState(false);
  // Almacena el rol pendiente para cargar el menú después de aceptar términos
  const pendingRolRef = useRef(null);
  // Almacena datos de login pendientes cuando se requiere aceptación de términos
  const pendingLoginDataRef = useRef(null);

  // Maneja el estado de la barra lateral
  const [isOpen, setIsOpen] = useState(true);

  // Ref para evitar doble llamada a loadProfile (StrictMode)
  const profileLoadedRef = useRef(false);

  // ── Helper: limpiar todo el estado de sesión ──
  const clearSession = useCallback(() => {
    setUserId(null);
    setUserName(null);
    setUserEmail(null);
    setNameSchool(null);
    setIdInstitution(null);
    setImgSchool(null);
    setNameRole(null);
    setRol(null);
    setNameSede(null);
    setIdSede(null);
    setColorPrincipal(null);
    setColorSecundario(null);
    setMenu(null);
    setIdDocente(null);
    setIdEstudiante(null);
    setIdPersona(null);
    setDirector(null);
    setGradoAcargo(null);
    setNumeroIdentificacion(null);
    setToken(null);
    sessionStorage.clear();
    localStorage.clear();
    setAuthToken(null);
  }, []);

  const loadProfile = useCallback(async () => {
    if (!token) {
      setLoading(false);
      setError(null);
      return;
    }
    // Evitar llamadas duplicadas (StrictMode, re-renders)
    if (profileLoadedRef.current) return;
    profileLoadedRef.current = true;

    setLoading(true);
    setError(null);
    try {
      setAuthToken(token);
      const profile = await authService.getProfile();
      const data = profile.user || profile;

      setUserId(data?.id ?? null);
      setUserName(data?.name ?? null);
      setUserEmail(data?.email ?? null);
      setNameRole(data?.name_rol ?? null);
      setRol(data?.rol ?? null);
      setNumeroIdentificacion(data?.numero_identificacion ?? null);
    } catch (err) {
      clearSession();
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [token, clearSession]);

  // ✅ Un solo useEffect que guarda todo en localStorage.
  useEffect(() => {
    saveToStorage("userId", userId);
    saveToStorage("userName", userName);
    saveToStorage("userEmail", userEmail);
    saveToStorage("nameSchool", nameSchool);
    saveToStorage("idInstitution", idInstitution);
    saveToStorage("imgSchool", imgSchool);
    saveToStorage("nameRole", nameRole);
    saveToStorage("rol", rol);
    saveToStorage("nameSede", nameSede);
    saveToStorage("idSede", idSede);
    saveToStorage("fk_institucion", fkInstitucion);
    saveToStorage("colorPrincipal", colorPrincipal);
    saveToStorage("colorSecundario", colorSecundario);
    saveToStorage("menu", menu);
    saveToStorage("idDocente", idDocente);
    saveToStorage("idEstudiante", idEstudiante);
    saveToStorage("idPersona", idPersona);
    saveToStorage("director", director);
    saveToStorage("gradoAcargo", gradoAcargo);
    // numero_identificacion intentionally not stored
    if (token) {
      localStorage.setItem("token", token);
      setAuthToken(token);
    } else {
      localStorage.removeItem("token");
      setAuthToken(null);
    }
  }, [
    userId,
    userName,
    userEmail,
    nameSchool,
    idInstitution,
    imgSchool,
    nameRole,
    rol,
    nameSede,
    idSede,
    fkInstitucion,
    colorPrincipal,
    colorSecundario,
    menu,
    idDocente,
    idEstudiante,
    idPersona,
    director,
    gradoAcargo,
    token,
  ]);

  useEffect(() => {
    if (token && !userId) {
      loadProfile();
    }
  }, [token, userId, loadProfile]);

  // Resetear flag cuando cambia el token (nuevo login / logout)
  useEffect(() => {
    profileLoadedRef.current = false;
  }, [token]);

  // Aplicar colores personalizados al cargar la página si existen en localStorage
  useEffect(() => {
    if (colorPrincipal || colorSecundario) {
      applyCustomColors(colorPrincipal, colorSecundario);
    }
  }, [colorPrincipal, colorSecundario]);

  // redirigir a login si la sesión expira (evento global desde ApiClient)
  useEffect(() => {
    const unsubscribe = eventBus.on((message, type) => {
      if (type === "auth" && message === "sessionExpired") {
        clearSession();
        navigate("/login");
      }
    });
    return unsubscribe;
  }, [navigate, clearSession]);

  // Mantener el título del sitio como "Nexus — ABBR" (fallback a "Nexus")
  useEffect(() => {
    try {
      const abbr = nameSchool
        ? institutionAbbreviation(String(nameSchool))
        : "";
      document.title = abbr ? `Nexus — ${abbr}` : "Nexus";
    } catch (err) {
      // No bloquear por errores de DOM
      console.warn("AuthContext: error setting document.title", err);
    }
  }, [nameSchool]);

  // ── Helper: cargar menú por rol ──
  const loadMenuByRol = useCallback(async (rolValue) => {
    if (!rolValue) return;
    const fd = new FormData();
    fd.append("id_rol", String(rolValue));
    fd.append("rol", String(rolValue));
    try {
      const menuRes = await getMenuRol(fd);
      setMenu(menuRes);
    } catch {
      setMenu([]);
    }
  }, []);

  // Helper: guardar datos de login en el estado (dispara persistencia en localStorage)
  const commitLoginData = useCallback((data) => {
    const t = data.accessToken;
    if (t) {
      setToken(t);
      setAuthToken(t);
    }
    setUserId(data?.id ?? null);
    setUserName(data?.name ?? null);
    setUserEmail(data?.email ?? null);
    setNameSchool(data?.nombre_institucion ?? null);
    setIdInstitution(data?.id_institucion ?? null);
    setImgSchool(
      data?.link_logo
        ? data.link_logo.replace(/^https?:\/\/nexusplataforma\.com/, "")
        : null,
    );
    setNameRole(data?.name_rol ?? null);
    setRol(data?.rol ?? null);
    setNameSede(data?.name_sede ?? null);
    setIdSede(data?.id_sede ?? null);
    setColorPrincipal(data?.color_principal ?? null);
    setColorSecundario(data?.color_secundario ?? null);
    setIdDocente(data?.id_docente ?? null);
    setIdEstudiante(data?.id_estudiante ?? null);
    setIdPersona(data?.id_persona ?? null);
    setFkInstitucion(data?.fk_institucion ?? null);
    setDirector(data?.director ?? null);
    setGradoAcargo(data?.grado_acargo ?? null);
    setNumeroIdentificacion(data?.numero_identificacion ?? null);
    if (data?.color_principal || data?.color_secundario) {
      applyCustomColors(data?.color_principal, data?.color_secundario);
    }
  }, []);

  const login = useCallback(
    async (credentials) => {
      setLoading(true);
      setError(null);
      try {
        const res = await authService.login(credentials);
        console.log("AuthContext - Login response:", res);

        // La respuesta viene en res.data
        const data = res?.data || res;
        console.log("AuthContext - Datos del usuario extraídos:", data);
        // Validación adicional: Verificar datos mínimos requeridos
        if (!data || !data.accessToken) {
          throw new Error(
            "No se pudo iniciar sesión. Respuesta del servidor inválida.",
          );
        }

        const t = data.accessToken;

        // Para roles 5 y 6: verificar aceptación de términos ANTES de guardar datos
        const rolValue = data?.rol;
        const needsTermsCheck =
          String(rolValue) === "5" || String(rolValue) === "6";

        if (needsTermsCheck) {
          // Token temporal solo para llamadas API (no se guarda en estado/localStorage)
          setAuthToken(t);
          try {
            console.log(
              "AuthContext - Verificando aceptación de términos para rol",
              data.id_persona,
            );
            const termsRes = await authService.valuesAccessData({
              idPersona: data?.id_persona,
            });
            console.log("AuthContext - Respuesta de términos:", termsRes);
            if (termsRes?.code === "ERROR") {
              // Guardar datos completos en ref SIN persistir en localStorage
              pendingLoginDataRef.current = { ...data, accessToken: t };
              pendingRolRef.current = rolValue;
              // numero_identificacion no se persiste en localStorage, es seguro setear
              setNumeroIdentificacion(data?.numero_identificacion ?? null);
              setShowTermsModal(true);
              return {
                token: t,
                idPersona: data?.id_persona ?? null,
                numero_identificacion: data?.numero_identificacion ?? null,
                name: data?.name ?? null,
                email: data?.email ?? null,
                rol: rolValue ?? null,
                name_rol: data?.name_rol ?? null,
                pendingTerms: true,
              };
            }
          } catch {
            // Error de red → mostrar modal por seguridad
            pendingLoginDataRef.current = { ...data, accessToken: t };
            pendingRolRef.current = rolValue;
            setNumeroIdentificacion(data?.numero_identificacion ?? null);
            setShowTermsModal(true);
            return {
              token: t,
              idPersona: data?.id_persona ?? null,
              numero_identificacion: data?.numero_identificacion ?? null,
              name: data?.name ?? null,
              email: data?.email ?? null,
              rol: rolValue ?? null,
              name_rol: data?.name_rol ?? null,
              pendingTerms: true,
            };
          }
        }

        // Flujo normal: guardar todo en estado → localStorage
        commitLoginData(data);

        // Cargar menú por rol al iniciar sesión.
        await loadMenuByRol(data?.rol);

        // Para usuarios tipo docente, obtener fk_institucion según la sede
        const isDocente =
          String(data?.name_rol ?? "")
            .toLowerCase()
            .includes("docente") || String(data?.rol) === "7";

        const idSedeValue = data?.id_sede ?? data?.idSede;

        if (isDocente && idSedeValue) {
          try {
            const instRes = await authService.getTeacherInstitution({
              idSede: Number(idSedeValue),
            });
            console.log(
              "AuthContext - getTeacherInstitution response:",
              instRes,
            );

            // El endpoint devuelve { code, data: [{ id_institucion }] }
            // O puede retornar el arreglo directamente.
            const maybeArray =
              Array.isArray(instRes) && instRes.length > 0
                ? instRes
                : Array.isArray(instRes?.data)
                  ? instRes.data
                  : null;

            const maybeObject =
              maybeArray?.[0] ??
              (!maybeArray && typeof instRes === "object" ? instRes : null);

            const fk =
              maybeObject?.id_institucion ??
              maybeObject?.fk_institucion ??
              null;
            console.log("AuthContext - fkInstitucion resuelto:", fk);
            setFkInstitucion(fk);
          } catch (err) {
            console.warn(
              "AuthContext - no se pudo obtener fk_institucion:",
              err,
            );
          }
        }

        return {
          token: t,
          id: data?.id ?? null,
          name: data?.name ?? null,
          email: data?.email ?? null,
          rol: data?.rol ?? null,
          name_rol: data?.name_rol ?? null,
        };
      } catch (err) {
        setError(err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [loadMenuByRol, commitLoginData],
  );

  const logout = useCallback(async () => {
    setLoading(true);
    try {
      // await authService.logout().catch(() => {});
    } finally {
      clearSession();
      resetTheme();
      setLoading(false);
      navigate("/login");
    }
  }, [clearSession, navigate]);

  // --- Nuevos métodos del servicio que se exponen en el contexto ------------

  /**
   * Se invoca cuando el usuario cierra el modal de términos tras aceptarlos.
   * Persiste los datos de login en estado/localStorage, carga el menú y navega al dashboard.
   */
  const closeTermsModal = useCallback(async () => {
    const data = pendingLoginDataRef.current;
    const rolValue = pendingRolRef.current;

    // Ahora sí: persistir datos de login en estado → localStorage
    if (data) {
      commitLoginData(data);
      pendingLoginDataRef.current = null;
    }

    if (rolValue) {
      await loadMenuByRol(rolValue);
      pendingRolRef.current = null;
    }
    setShowTermsModal(false);
    navigate("/dashboard/home");
  }, [commitLoginData, loadMenuByRol, navigate]);

  const dismissTermsModal = useCallback(() => {
    // Limpiar datos pendientes sin persistir
    pendingLoginDataRef.current = null;
    pendingRolRef.current = null;
    setNumeroIdentificacion(null);
    setAuthToken(null);
    setShowTermsModal(false);
  }, []);

  // ── Métodos de servicio (no usan loading global) ──
  const valuesAccessData = useCallback(async (payload) => {
    return authService.valuesAccessData(payload);
  }, []);

  const accessData = useCallback(async (payload) => {
    return authService.accessData(payload);
  }, []);

  const registerSignature = useCallback(async (payload) => {
    return authService.registerSignature(payload);
  }, []);

  const recoveryPassword = useCallback(async (payload) => {
    return authService.recoveryPassword(payload);
  }, []);

  // ── Sidebar toggles estables ──
  const toggleSidebar = useCallback(() => setIsOpen((prev) => !prev), []);
  const closeSidebar = useCallback(() => setIsOpen(false), []);

  const value = useMemo(
    () => ({
      userId,
      userName,
      userEmail,
      nameSchool,
      idInstitution,
      fkInstitucion,
      imgSchool,
      token,
      menu,
      nameRole,
      rol,
      nameSede,
      idSede,
      colorPrincipal,
      colorSecundario,
      idDocente,
      idEstudiante,
      idPersona,
      director,
      gradoAcargo,
      numero_identificacion,
      setNumeroIdentificacion,
      loading,
      error,
      isOpen,
      showTermsModal,
      closeTermsModal,
      dismissTermsModal,
      toggleSidebar,
      closeSidebar,
      login,
      logout,
      valuesAccessData,
      accessData,
      registerSignature,
      recoveryPassword,
      reload: loadProfile,
    }),
    [
      userId,
      userName,
      userEmail,
      nameSchool,
      idInstitution,
      fkInstitucion,
      imgSchool,
      token,
      menu,
      nameRole,
      rol,
      nameSede,
      idSede,
      colorPrincipal,
      colorSecundario,
      idDocente,
      idEstudiante,
      idPersona,
      director,
      gradoAcargo,
      numero_identificacion,
      loading,
      error,
      isOpen,
      showTermsModal,
      closeTermsModal,
      dismissTermsModal,
      toggleSidebar,
      closeSidebar,
      login,
      logout,
      valuesAccessData,
      accessData,
      registerSignature,
      recoveryPassword,
      loadProfile,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
