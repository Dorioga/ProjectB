import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
} from "react";
import { eventBus } from "../../services/ApiClient";

const NotificationContext = createContext(undefined);

// Ventana de deduplicación en ms: mensajes idénticos dentro de este lapso se ignoran
const DEDUP_WINDOW_MS = 600;

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  // Registro de mensajes recientes para evitar duplicados
  const recentRef = useRef(new Map());

  /** Devuelve true si el mensaje ya fue mostrado recientemente */
  const isDuplicate = useCallback((message, type) => {
    const key = `${type}::${message}`;
    const now = Date.now();
    const last = recentRef.current.get(key);
    if (last && now - last < DEDUP_WINDOW_MS) return true;
    recentRef.current.set(key, now);
    return false;
  }, []);

  const addNotification = useCallback(
    (message, type = "error", duration = 5000) => {
      if (isDuplicate(message, type)) return null;

      const id = Date.now() + Math.random();
      const notification = { id, message, type };

      setNotifications((prev) => [...prev, notification]);

      if (duration > 0) {
        setTimeout(() => {
          removeNotification(id);
        }, duration);
      }

      return id;
    },
    [isDuplicate],
  );

  const removeNotification = useCallback((id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  // Suscribirse a eventos del ApiClient — suscripción estable en mount (evita re-suscribir)
  useEffect(() => {
    const unsubscribe = eventBus.on((message, type) => {
      if (isDuplicate(message, type)) return;

      const id = Date.now() + Math.random();
      const notification = { id, message, type };

      setNotifications((prev) => [...prev, notification]);

      // auto-clear después del timeout por defecto (5s)
      setTimeout(() => {
        setNotifications((prev) => prev.filter((n) => n.id !== id));
      }, 5000);
    });

    return unsubscribe;
  }, [isDuplicate]);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        addNotification,
        removeNotification,
        clearAll,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error(
      "useNotification debe usarse dentro de un NotificationProvider",
    );
  }
  return context;
};
