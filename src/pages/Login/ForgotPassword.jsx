import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useNotify } from "../../lib/hooks/useNotify";
import * as authService from "../../services/authService";
import { required, isEmail } from "../../utils/validationUtils";
import SimpleButton from "../../components/atoms/SimpleButton";
import { ChevronLeft } from "lucide-react";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const notify = useNotify();
  const navigate = useNavigate();

  const validate = () => {
    const r1 = required(email, "El correo es obligatorio");
    if (!r1.valid) return r1.msg;
    const r2 = isEmail(email, "Correo inválido");
    if (!r2.valid) return r2.msg;
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
      await authService.forgotPassword({ email });
      notify.success(
        "Si existe una cuenta asociada, recibirás un correo con instrucciones para restablecer la contraseña.",
      );
      // Volver al login después de un breve delay
      setTimeout(() => navigate("/login"), 1400);
    } catch (err) {
      notify.error(
        err?.message || "No fue posible enviar el enlace. Intenta nuevamente.",
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
        <p className="text-sm text-muted mb-4">
          Ingresa el correo asociado a tu cuenta y te enviaremos las
          instrucciones.
        </p>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <label className="text-primary font-bold">Correo electrónico</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="correo@ejemplo.com"
            className="bg-surface px-2 py-1 rounded-md"
          />
          {error && <div className="text-error text-sm">{error}</div>}
          <div className="flex items-center gap-3">
            <SimpleButton
              msj={loading ? "Enviando..." : "Enviar enlace"}
              onClick={handleSubmit}
              disabled={loading}
              bg={"bg-secondary"}
              text={"text-surface"}
              hover={"hover:bg-secondary/80"}
            />
          </div>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;
