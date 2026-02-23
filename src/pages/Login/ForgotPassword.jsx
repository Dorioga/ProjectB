import React, { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useNotify } from "../../lib/hooks/useNotify";
import { AuthContext } from "../../lib/context/AuthContext";
import * as authService from "../../services/authService";
import { setAuthToken } from "../../services/ApiClient";
import { required, isEmail } from "../../utils/validationUtils";
import SimpleButton from "../../components/atoms/SimpleButton";
import { ChevronLeft } from "lucide-react";

const ROLES = [
  { id: 2, label: "Rector" },
  { id: 3, label: "Administrador institucional" },
  { id: 4, label: "Coordinador" },
  { id: 5, label: "Acudiente" },
  { id: 6, label: "Estudiante" },
  { id: 7, label: "Docente" },
  { id: 9, label: "Auditor" },
];

/** Roles que usan formulario (número de identificación + primer apellido) */
const FORM_ROLES = [5, 6];

const ForgotPassword = () => {
  const [selectedRole, setSelectedRole] = useState("");
  const [email, setEmail] = useState("");
  const [usuario, setUsuario] = useState("");
  const [identificacion, setIdentificacion] = useState("");
  const [lastName, setLastName] = useState("");
  const [identificationNumber, setIdentificationNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Paso 2: nueva contraseña
  const [recoveredUserId, setRecoveredUserId] = useState(null);
  const [recoveredEmail, setRecoveredEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const { recoveryPassword } = useContext(AuthContext);
  const notify = useNotify();
  const navigate = useNavigate();

  const roleId = selectedRole ? Number(selectedRole) : null;
  const isFormRole = FORM_ROLES.includes(roleId);

  const validate = () => {
    if (!roleId) return "Debes seleccionar un rol";

    if (isFormRole) {
      const r1 = required(
        identificationNumber,
        "El número de identificación es obligatorio",
      );
      if (!r1.valid) return r1.msg;
      const r2 = required(lastName, "El primer apellido es obligatorio");
      if (!r2.valid) return r2.msg;
    } else {
      const r1 = required(email, "El correo es obligatorio");
      if (!r1.valid) return r1.msg;
      const r2 = isEmail(email, "Correo inválido");
      if (!r2.valid) return r2.msg;
      const r3 = required(usuario, "El usuario es obligatorio");
      if (!r3.valid) return r3.msg;
      const r4 = required(identificacion, "La identificación es obligatoria");
      if (!r4.valid) return r4.msg;
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    const v = validate();
    if (v) {
      setError(v);
      notify.error(v);
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const payload = { idRol: roleId };

      if (isFormRole) {
        payload.identificationNumber = identificationNumber;
        payload.lastName = lastName;
      } else {
        payload.email = email;
        payload.username = usuario;
        payload.identificationNumber = identificacion;
      }

      const res = await recoveryPassword(payload);
      const data = res?.data || res;

      if (data?.id_usuario) {
        // Guardar el accessToken temporal para poder llamar updatePassword
        if (data.accessToken) {
          setAuthToken(data.accessToken);
        }
        setRecoveredUserId(data.id_persona);
        setRecoveredEmail(data.correo || "");
        notify.success("Usuario verificado. Ingresa tu nueva contraseña.");
      } else {
        notify.error("No se encontró un usuario con los datos proporcionados.");
      }
    } catch (err) {
      notify.error(
        err?.message ||
          "No fue posible enviar la solicitud. Intenta nuevamente.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e?.preventDefault();
    const r1 = required(newPassword, "La nueva contraseña es obligatoria");
    if (!r1.valid) {
      setError(r1.msg);
      notify.error(r1.msg);
      return;
    }
    if (newPassword.length < 6) {
      const msg = "La contraseña debe tener al menos 6 caracteres";
      setError(msg);
      notify.error(msg);
      return;
    }
    if (newPassword !== confirmPassword) {
      const msg = "Las contraseñas no coinciden";
      setError(msg);
      notify.error(msg);
      return;
    }
    setError(null);
    setLoading(true);
    try {
      await authService.updatePassword(recoveredUserId, newPassword);
      // Limpiar el token temporal usado para el cambio de contraseña
      setAuthToken(null);
      notify.success("Contraseña actualizada correctamente.");
      setTimeout(() => navigate("/login"), 1400);
    } catch (err) {
      notify.error(
        err?.message ||
          "No fue posible actualizar la contraseña. Intenta nuevamente.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center w-full bg-primary">
      <div className="flex flex-col gap-2 border p-6 rounded-lg bg-surface w-1/5">
        <div>
          <Link
            to="/login"
            aria-label="Volver a iniciar sesión"
            className=" p-1 rounded-full hover:bg-surface/10 inline-flex items-center justify-center"
          >
            <ChevronLeft className="w-5 h-5 text-primary" />
          </Link>
          <h2 className="text-2xl font-bold text-primary mb-2">
            Recuperar contraseña
          </h2>
        </div>

        {/* ── Paso 2: Nueva contraseña ── */}
        {recoveredUserId ? (
          <>
            <p className="text-sm text-muted mb-2">
              Usuario encontrado{recoveredEmail ? ` (${recoveredEmail})` : ""}.
              Ingresa tu nueva contraseña.
            </p>
            <form
              onSubmit={handleChangePassword}
              className="flex flex-col gap-3"
            >
              <label className="text-primary font-bold">Nueva contraseña</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                className="bg-surface border px-2 py-1 rounded-md"
              />
              <label className="text-primary font-bold">
                Confirmar contraseña
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repite la contraseña"
                className="bg-surface border px-2 py-1 rounded-md"
              />
              {error && <div className="text-error text-sm">{error}</div>}
              <div className="flex items-center gap-3">
                <SimpleButton
                  msj={loading ? "Guardando..." : "Cambiar contraseña"}
                  onClick={handleChangePassword}
                  disabled={loading}
                  bg={"bg-secondary"}
                  text={"text-surface"}
                  hover={"hover:bg-secondary/80"}
                />
              </div>
            </form>
          </>
        ) : (
          <>
            {/* ── Paso 1: Verificar identidad ── */}
            <p className="text-sm text-muted mb-4">
              Selecciona tu rol e ingresa los datos solicitados para recuperar
              tu contraseña.
            </p>
            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              {/* Selector de rol */}
              <label className="text-primary font-bold">Rol</label>
              <select
                value={selectedRole}
                onChange={(e) => {
                  setSelectedRole(e.target.value);
                  setError(null);
                }}
                className="bg-surface border px-2 py-1 rounded-md text-primary"
              >
                <option value="">-- Selecciona un rol --</option>
                {ROLES.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.label}
                  </option>
                ))}
              </select>

              {/* Campos según el rol */}
              {roleId && !isFormRole && (
                <>
                  <label className="text-primary font-bold">
                    Correo electrónico
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="correo@ejemplo.com"
                    className="bg-surface border px-2 py-1 rounded-md"
                  />
                  <label className="text-primary font-bold">Usuario</label>
                  <input
                    type="text"
                    value={usuario}
                    onChange={(e) => setUsuario(e.target.value)}
                    placeholder="Usuario"
                    className="bg-surface border px-2 py-1 rounded-md"
                  />
                  <label className="text-primary font-bold">
                    Identificación
                  </label>
                  <input
                    type="text"
                    value={identificacion}
                    onChange={(e) => setIdentificacion(e.target.value)}
                    placeholder="Número de identificación"
                    className="bg-surface border px-2 py-1 rounded-md"
                  />
                </>
              )}

              {roleId && isFormRole && (
                <>
                  <label className="text-primary font-bold">
                    Número de identificación
                  </label>
                  <input
                    type="text"
                    value={identificationNumber}
                    onChange={(e) => setIdentificationNumber(e.target.value)}
                    placeholder="123456789"
                    className="bg-surface border px-2 py-1 rounded-md"
                  />
                  <label className="text-primary font-bold">
                    Primer apellido
                  </label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Apellido"
                    className="bg-surface border px-2 py-1 rounded-md"
                  />
                </>
              )}

              {error && <div className="text-error text-sm">{error}</div>}
              <div className="flex items-center gap-3">
                <SimpleButton
                  msj={loading ? "Enviando..." : "Recuperar contraseña"}
                  onClick={handleSubmit}
                  disabled={loading || !roleId}
                  bg={"bg-secondary"}
                  text={"text-surface"}
                  hover={"hover:bg-secondary/80"}
                />
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
