import React, { useState, useCallback } from "react";
import Modal from "../atoms/Modal";
import { KeyRound, Eye, EyeOff, ShieldCheck } from "lucide-react";
import { updatePassword } from "../../services/authService";
import { useNotification } from "../../lib/context/NotificationContext";
import useAuth from "../../lib/hooks/useAuth";

const INITIAL_FORM = {
  nuevaContrasena: "",
  confirmarContrasena: "",
};

const InputPassword = ({
  label,
  value,
  onChange,
  name,
  error,
  placeholder,
}) => {
  const [show, setShow] = useState(false);

  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-semibold text-on-surface">{label}</label>
      <div className="relative">
        <input
          type={show ? "text" : "password"}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          autoComplete="new-password"
          className={`w-full rounded-md border px-3 py-2 pr-10 text-sm bg-surface text-on-surface outline-none transition-colors focus:ring-2 focus:ring-primary/40 ${
            error ? "border-error" : "border-secondary/40"
          }`}
        />
        <button
          type="button"
          tabIndex={-1}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-secondary hover:text-primary transition-colors"
          onClick={() => setShow((prev) => !prev)}
          aria-label={show ? "Ocultar contraseña" : "Mostrar contraseña"}
        >
          {show ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
      {error && <p className="text-xs text-error font-medium">{error}</p>}
    </div>
  );
};

/**
 * ChangePasswordModal
 * Modal para cambiar la contraseña del usuario autenticado.
 * Se conecta con PATCH /user/:personaId
 */
const ChangePasswordModal = ({ isOpen, onClose }) => {
  const { idPersona, userName, nameRole } = useAuth();
  const { addNotification } = useNotification();
  console.log("ChangePasswordModal renderizado con idPersona:", idPersona);
  const [form, setForm] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  }, []);

  const validate = () => {
    const newErrors = {};
    if (!form.nuevaContrasena) {
      newErrors.nuevaContrasena = "La nueva contraseña es obligatoria.";
    } else if (form.nuevaContrasena.length < 6) {
      newErrors.nuevaContrasena =
        "La contraseña debe tener al menos 6 caracteres.";
    }
    if (!form.confirmarContrasena) {
      newErrors.confirmarContrasena = "Confirma la nueva contraseña.";
    } else if (form.nuevaContrasena !== form.confirmarContrasena) {
      newErrors.confirmarContrasena = "Las contraseñas no coinciden.";
    }
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    if (!idPersona) {
      addNotification(
        "No se pudo identificar al usuario. Inicia sesión nuevamente.",
        "error",
      );
      return;
    }

    setLoading(true);
    try {
      const res = await updatePassword(idPersona, form.nuevaContrasena);
      const message =
        res?.data?.message ||
        res?.message ||
        "Contraseña actualizada correctamente";
      addNotification(message, "success");
      setForm(INITIAL_FORM);
      onClose();
    } catch (err) {
      const message =
        err?.message || "Error al actualizar la contraseña. Intenta de nuevo.";
      addNotification(message, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setForm(INITIAL_FORM);
    setErrors({});
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Cambiar contraseña"
      size="sm"
    >
      <div className="p-6 flex flex-col gap-6">
        {/* Información del usuario */}
        <div className="flex items-center gap-3 bg-primary/10 rounded-lg px-4 py-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary text-surface font-bold text-lg shrink-0">
            {String(userName ?? "U")
              .trim()
              .charAt(0)
              .toUpperCase()}
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-sm font-semibold text-on-surface truncate">
              {userName || "Usuario"}
            </span>
            <span className="text-xs text-secondary truncate">
              {nameRole || "Sin rol"}
            </span>
          </div>
          <ShieldCheck size={20} className="ml-auto text-primary shrink-0" />
        </div>

        {/* Formulario */}
        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-4"
          noValidate
        >
          <InputPassword
            label="Nueva contraseña"
            name="nuevaContrasena"
            value={form.nuevaContrasena}
            onChange={handleChange}
            placeholder="Ingresa la nueva contraseña"
            error={errors.nuevaContrasena}
          />
          <InputPassword
            label="Confirmar contraseña"
            name="confirmarContrasena"
            value={form.confirmarContrasena}
            onChange={handleChange}
            placeholder="Repite la nueva contraseña"
            error={errors.confirmarContrasena}
          />

          {/* Acciones */}
          <div className="flex flex-col gap-2 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="flex items-center justify-center gap-2 w-full rounded-md bg-primary text-surface font-semibold py-2.5 px-4 transition-opacity hover:opacity-90 disabled:opacity-60 cursor-pointer disabled:cursor-not-allowed"
            >
              <KeyRound size={18} />
              {loading ? "Guardando..." : "Actualizar contraseña"}
            </button>
            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              className="w-full rounded-md border border-secondary/40 text-on-surface font-medium py-2 px-4 transition-colors hover:bg-secondary/10 cursor-pointer disabled:opacity-60"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default ChangePasswordModal;
