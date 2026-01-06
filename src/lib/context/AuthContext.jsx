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

export const AuthContext = createContext(null);

// Funciones auxiliares para localStorage
const loadFromStorage = (key, fallback = null) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch {
    return fallback;
  }
};

const saveToStorage = (key, value) => {
  try {
    if (value === null || value === undefined) {
      localStorage.removeItem(key);
    } else {
      localStorage.setItem(key, JSON.stringify(value));
    }
  } catch (err) {
    console.error(`Error saving ${key}:`, err);
  }
};

export function AuthProvider({ children }) {
  // Cargar datos iniciales desde localStorage
  const [user, setUser] = useState(() => loadFromStorage("user"));
  const [nameSchool, setNameSchool] = useState(() =>
    loadFromStorage("nameSchool")
  );
  const [id_School, setIdSchool] = useState(() => loadFromStorage("id_School"));
  const [imgSchool, setImgSchool] = useState(() =>
    loadFromStorage("imgSchool")
  );
  const [nameRole, setNameRole] = useState(() => loadFromStorage("nameRole"));
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
      setUser(profile.user || profile);
    } catch (err) {
      // Limpiar todo en caso de error
      setUser(null);
      setNameSchool(null);
      setIdSchool(null);
      setImgSchool(null);
      setNameRole(null);
      setMenu(null);
      setToken(null);
      localStorage.clear();
      setAuthToken(null);
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  // ✅ Un solo useEffect que guarda todo en localStorage.
  useEffect(() => {
    saveToStorage("user", user);
    saveToStorage("nameSchool", nameSchool);
    saveToStorage("id_School", id_School);
    saveToStorage("imgSchool", imgSchool);
    saveToStorage("nameRole", nameRole);
    saveToStorage("menu", menu);

    if (token) {
      localStorage.setItem("token", token);
      setAuthToken(token);
    } else {
      localStorage.removeItem("token");
      setAuthToken(null);
    }
  }, [user, nameSchool, id_School, imgSchool, nameRole, menu, token]);

  useEffect(() => {
    if (token && !user) {
      loadProfile();
    }
  }, [token, user, loadProfile]);
  const login = async (credentials) => {
    setLoading(true);
    setError(null);
    try {
      const res = await authService.login(credentials);
      const t = res?.token || res?.accessToken || null;

      // Asegura que el token se use inmediatamente (antes de pedir menú).
      if (t) {
        setToken(t);
        setAuthToken(t);
      }

      // Adaptación a la respuesta real:
      // { token, id, name, email, rol, name_rol }
      const u = {
        id: res?.id ?? res?.id_person ?? null,
        name: res?.name ?? "",
        email: res?.email ?? "",
        rol: res?.rol ?? null,
        name_rol: res?.name_rol ?? "",
        raw: res,
      };

      setUser(u);

      // Actualizar estados opcionales si el backend los provee.
      if (res?.school_name) setNameSchool(res.school_name);
      if (res?.id_school) setIdSchool(res.id_school);
      if (res?.img_logo) setImgSchool(res.img_logo);

      // En sidebar se muestra el rol, no el nombre del usuario.
      if (res?.name_rol) setNameRole(res.name_rol);

      // Cargar menú por rol al iniciar sesión.
      if (res?.rol) {
        const fd = new FormData();
        // En tu API de roles el campo es id_rol.
        fd.append("id_rol", String(res.rol));
        // Compatibilidad por si el backend espera 'rol'.
        fd.append("rol", String(res.rol));

        try {
          const menuRes = await getMenuRol(fd);
          setMenu(menuRes);
        } catch (menuErr) {
          // No bloquea el login, pero deja el error disponible.
          setMenu([]);
          setError(menuErr);
        }
      }

      return { user: u, token: t };
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
      setUser(null);
      setNameSchool(null);
      setIdSchool(null);
      setImgSchool(null);
      setNameRole(null);
      setMenu(null);
      setToken(null);
      localStorage.clear();
      setAuthToken(null);
      setLoading(false);
      navigate("/login");
    }
  };

  const value = useMemo(
    () => ({
      user,
      nameSchool,
      id_School,
      imgSchool,
      token,
      menu,
      nameRole,
      loading,
      error,
      isOpen,
      toggleSidebar: () => setIsOpen(!isOpen),
      login,
      logout,
      reload: loadProfile,
    }),
    [
      user,
      nameSchool,
      id_School,
      imgSchool,
      token,
      menu,
      nameRole,
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
