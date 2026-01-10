import React, {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import * as authService from "../../services/authService";
import { setAuthToken } from "../../services/ApiClient";
import { useNavigate } from "react-router-dom";
import { getMenuRol } from "../../services/dataService";
import { applyCustomColors, resetTheme } from "../../utils/themeManager";

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
    loadFromStorage("userEmail")
  );
  const [nameSchool, setNameSchool] = useState(() =>
    loadFromStorage("nameSchool")
  );
  const [idInstitution, setIdInstitution] = useState(() =>
    loadFromStorage("idInstitution")
  );
  const [imgSchool, setImgSchool] = useState(() =>
    loadFromStorage("imgSchool")
  );
  const [nameRole, setNameRole] = useState(() => loadFromStorage("nameRole"));
  const [rol, setRol] = useState(() => loadFromStorage("rol"));
  const [nameSede, setNameSede] = useState(() => loadFromStorage("nameSede"));
  const [idSede, setIdSede] = useState(() => loadFromStorage("idSede"));
  const [colorPrincipal, setColorPrincipal] = useState(() =>
    loadFromStorage("colorPrincipal")
  );
  const [colorSecundario, setColorSecundario] = useState(() =>
    loadFromStorage("colorSecundario")
  );
  const [menu, setMenu] = useState(() => loadFromStorage("menu"));
  const [token, setToken] = useState(
    () => localStorage.getItem("token") || null
  );
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Maneja el estado de la barra lateral
  const [isOpen, setIsOpen] = useState(true);

  const loadProfile = useCallback(async () => {
    if (!token) {
      setLoading(false);
      setError(null);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      setAuthToken(token);
      const profile = await authService.getProfile();
      const data = profile.user || profile;

      // Guardar variables individuales
      setUserId(data?.id ?? null);
      setUserName(data?.name ?? null);
      setUserEmail(data?.email ?? null);
      setNameRole(data?.name_rol ?? null);
      setRol(data?.rol ?? null);
    } catch (err) {
      // Limpiar todo en caso de error
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
      setToken(null);
      sessionStorage.clear();
      setAuthToken(null);
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [token]);

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
    saveToStorage("colorPrincipal", colorPrincipal);
    saveToStorage("colorSecundario", colorSecundario);
    saveToStorage("menu", menu);

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
    colorPrincipal,
    colorSecundario,
    menu,
    token,
  ]);

  useEffect(() => {
    if (token && !userId) {
      loadProfile();
    }
  }, [token, userId, loadProfile]);

  // Aplicar colores personalizados al cargar la página si existen en localStorage
  useEffect(() => {
    if (colorPrincipal || colorSecundario) {
      applyCustomColors(colorPrincipal, colorSecundario);
    }
  }, [colorPrincipal, colorSecundario]);

  const login = async (credentials) => {
    setLoading(true);
    setError(null);
    try {
      const res = await authService.login(credentials);
      console.log("AuthContext - Login response:", res);

      // La respuesta viene en res.data
      const data = res?.data || res;
      const t = data?.token || null;
      console.log("AuthContext - Token extraído:", t);

      // Asegura que el token se use inmediatamente (antes de pedir menú).
      if (t) {
        setToken(t);
        setAuthToken(t);
        console.log("AuthContext - Token guardado en localStorage");
      }

      // Guardar todas las variables individuales
      setUserId(data?.id ?? null);
      setUserName(data?.name ?? null);
      setUserEmail(data?.email ?? null);
      setNameSchool(data?.nombre_institucion ?? null);
      setIdInstitution(data?.id_institucion ?? null);
      setImgSchool(data?.link_logo ?? null);
      setNameRole(data?.name_rol ?? null);
      setRol(data?.rol ?? null);
      setNameSede(data?.name_sede ?? null);
      setIdSede(data?.id_sede ?? null);
      setColorPrincipal(data?.color_principal ?? null);
      setColorSecundario(data?.color_secundario ?? null);

      // Aplicar colores personalizados al tema si existen (solo si no son null)
      if (data?.color_principal || data?.color_secundario) {
        applyCustomColors(data?.color_principal, data?.color_secundario);
      }

      // Cargar menú por rol al iniciar sesión.
      if (data?.rol) {
        const fd = new FormData();
        fd.append("id_rol", String(data.rol));
        fd.append("rol", String(data.rol));

        try {
          const menuRes = await getMenuRol(fd);
          setMenu(menuRes);
        } catch (menuErr) {
          // No bloquea el login, pero deja el error disponible.
          setMenu([]);
          setError(menuErr);
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
  };

  const logout = async () => {
    setLoading(true);
    try {
      await authService.logout().catch(() => {});
    } finally {
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
      setToken(null);
      localStorage.clear();
      setAuthToken(null);
      resetTheme(); // Restaurar tema por defecto
      setLoading(false);
      navigate("/login");
    }
  };

  const value = useMemo(
    () => ({
      userId,
      userName,
      userEmail,
      nameSchool,
      idInstitution,
      imgSchool,
      token,
      menu,
      nameRole,
      rol,
      nameSede,
      idSede,
      colorPrincipal,
      colorSecundario,
      loading,
      error,
      isOpen,
      toggleSidebar: () => setIsOpen(!isOpen),
      login,
      logout,
      reload: loadProfile,
    }),
    [
      userId,
      userName,
      userEmail,
      nameSchool,
      idInstitution,
      imgSchool,
      token,
      menu,
      nameRole,
      rol,
      nameSede,
      idSede,
      colorPrincipal,
      colorSecundario,
      loading,
      error,
      isOpen,
      login,
      logout,
      loadProfile,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
