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

export const AuthContext = createContext(null);

// Helpers para sessionStorage
const loadFromSession = (key, fallback = null) => {
  try {
    const item = sessionStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch {
    return fallback;
  }
};

const saveToSession = (key, value) => {
  try {
    if (value === null || value === undefined) {
      sessionStorage.removeItem(key);
    } else {
      sessionStorage.setItem(key, JSON.stringify(value));
    }
  } catch (err) {
    console.error(`Error saving ${key}:`, err);
  }
};

export function AuthProvider({ children }) {
  // Cargar datos iniciales desde sessionStorage
  const [user, setUser] = useState(() => loadFromSession("user"));
  const [nameSchool, setNameSchool] = useState(() =>
    loadFromSession("nameSchool")
  );
  const [id_School, setIdSchool] = useState(() => loadFromSession("id_School"));
  const [imgSchool, setImgSchool] = useState(() =>
    loadFromSession("imgSchool")
  );
  const [nameRole, setNameRole] = useState(() => loadFromSession("nameRole"));
  const [menu, setMenu] = useState(() => loadFromSession("menu"));
  const [token, setToken] = useState(
    () => sessionStorage.getItem("token") || null
  );
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  //Mneja el estado del
  const [isOpen, setIsOpen] = useState(false);

  const loadProfile = useCallback(async () => {
    if (!token) {
      setLoading(false);
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
      sessionStorage.clear();
      setAuthToken(null);
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  // ✅ Un solo useEffect que guarda todo en sessionStorage
  useEffect(() => {
    saveToSession("user", user);
    saveToSession("nameSchool", nameSchool);
    saveToSession("id_School", id_School);
    saveToSession("imgSchool", imgSchool);
    saveToSession("nameRole", nameRole);
    saveToSession("menu", menu);

    if (token) {
      sessionStorage.setItem("token", token);
      setAuthToken(token);
    } else {
      sessionStorage.removeItem("token");
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
      const u = res?.id_person || res;

      if (t) setToken(t);
      setUser(u);

      // Actualizar todos los estados del login
      if (res.school_name) setNameSchool(res.school_name);
      if (res.id_school) setIdSchool(res.id_school);
      if (res.img_logo) setImgSchool(res.img_logo);
      if (res.menu) setMenu(res.menu);
      if (res.name) setNameRole(res.name);

      return {
        user: u,
        token: t,
        nameSchool: res.school_name,
        id_School: res.id_school,
        imgSchool: res.img_logo,
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
      setUser(null);
      setNameSchool(null);
      setIdSchool(null);
      setImgSchool(null);
      setNameRole(null);
      setMenu(null);
      setToken(null);
      sessionStorage.clear();
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
