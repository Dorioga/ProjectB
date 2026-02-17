import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";
import { eventBus } from "../../services/ApiClient";

const NotificationContext = createContext(undefined);

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  const addNotification = useCallback(
    (message, type = "error", duration = 5000) => {
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
    [],
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
      // Añadir notificación directamente para evitar dependencia en `addNotification`
      const id = Date.now() + Math.random();
      const notification = { id, message, type };

      setNotifications((prev) => [...prev, notification]);

      // auto-clear después del timeout por defecto (5s)
      const t = setTimeout(() => {
        setNotifications((prev) => prev.filter((n) => n.id !== id));
      }, 5000);

      // No necesitamos limpiar `t` aquí (se limpia al remover la notificación),
      // pero guardarlo sería necesario si quisiéramos cancelar timeouts al unmount.
      void t;
    });

    return unsubscribe;
  }, []);

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
