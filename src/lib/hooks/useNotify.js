import { useNotification } from "../context/NotificationContext";

/**
 * Hook personalizado para facilitar el uso de notificaciones
 *
 * @example
 * const notify = useNotify();
 *
 * // Mostrar notificación de error
 * notify.error("Ha ocurrido un error");
 *
 * // Mostrar notificación de éxito
 * notify.success("Operación completada");
 *
 * // Mostrar notificación de advertencia
 * notify.warning("Ten cuidado");
 *
 * // Mostrar notificación informativa
 * notify.info("Información importante");
 */
export const useNotify = () => {
  const { addNotification } = useNotification();

  return {
    error: (message, duration = 5000) =>
      addNotification(message, "error", duration),
    success: (message, duration = 3000) =>
      addNotification(message, "success", duration),
    warning: (message, duration = 4000) =>
      addNotification(message, "warning", duration),
    info: (message, duration = 3000) =>
      addNotification(message, "info", duration),
  };
};
