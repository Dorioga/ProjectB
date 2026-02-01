import { useNotification } from "../../lib/context/NotificationContext";

const toastStyles = {
  error: "bg-red-600 text-surface",
  success: "bg-green-600 text-surface",
  warning: "bg-amber-600 text-surface",
  info: "bg-blue-600 text-surface",
};

export const Toast = () => {
  const { notifications, removeNotification } = useNotification();

  if (!notifications || notifications.length === 0) return null;

  return (
    <div className="fixed top-5 right-5 z-[9999] flex flex-col gap-2.5 max-w-[400px] pointer-events-none max-sm:top-2.5 max-sm:right-2.5 max-sm:left-2.5 max-sm:max-w-none">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`flex items-center justify-between gap-3 px-5 py-4 rounded-lg shadow-lg ${
            toastStyles[notification.type]
          } animate-[slideIn_0.3s_ease-out] pointer-events-auto min-w-[300px] max-sm:min-w-0`}
        >
          <div className="flex items-center gap-3 flex-1">
            <span className="text-xl flex-shrink-0">
              {notification.type === "error" && "❌"}
              {notification.type === "success" && "✅"}
              {notification.type === "warning" && "⚠️"}
              {notification.type === "info" && "ℹ️"}
            </span>
            <p className="m-0 text-sm leading-relaxed break-words font-medium">
              {notification.message}
            </p>
          </div>
          <button
            className="bg-transparent border-none text-lg cursor-pointer text-surface/90 p-0 w-6 h-6 flex items-center justify-center rounded flex-shrink-0 transition-all hover:bg-surface/20"
            onClick={() => removeNotification(notification.id)}
            aria-label="Cerrar notificación"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
};
