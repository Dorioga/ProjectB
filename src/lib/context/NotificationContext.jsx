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
    []
  );

  const removeNotification = useCallback((id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  // Suscribirse a eventos del ApiClient
  useEffect(() => {
    const unsubscribe = eventBus.on((message, type) => {
      addNotification(message, type);
    });

    return unsubscribe;
  }, [addNotification]);

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
      "useNotification debe usarse dentro de un NotificationProvider"
    );
  }
  return context;
};
