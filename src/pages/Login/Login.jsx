import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Loader from "../../components/atoms/Loader";
import useAuth from "../../lib/hooks/useAuth";
import { institutionAbbreviation } from "../../utils/formatUtils";
import SimpleButton from "../../components/atoms/SimpleButton";
import logoColor from "../../assets/img/LogoColor.png";
import TermsModal from "../../components/molecules/TermsModal";
const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    infokey: "",
  });
  const {
    login,
    loading,
    error,
    token,
    nameSchool,
    showTermsModal,
    closeTermsModal,
    dismissTermsModal,
  } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Solo redirige si el usuario ya está autenticado al montar el componente
    if (token) {
      navigate("/dashboard/home");
    } else {
      localStorage.clear();
    }
  }, [token, navigate]);

  // Forzar título en la pestaña cuando estamos en la pantalla de login
  useEffect(() => {
    try {
      const abbr = nameSchool
        ? institutionAbbreviation(String(nameSchool))
        : "";
      document.title = abbr ? `Nexus — ${abbr}` : "Nexus";
    } catch (err) {
      console.warn("Login: error setting document.title", err);
      document.title = "Nexus";
    }
  }, [nameSchool]);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleAcceptTerms = useCallback(() => {
    closeTermsModal();
    navigate("/dashboard/home");
  }, [closeTermsModal, navigate]);

  const isFormValid =
    formData.email.trim() !== "" && formData.infokey.trim() !== "";

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const loginData = await login(formData);
      // Si hay términos pendientes el modal se muestra; la navegación
      // ocurre únicamente al pulsar "Continuar" en el modal (closeTermsModal).
      if (!loginData?.pendingTerms) {
        navigate("/dashboard/home");
      }
    } catch {
      // El error ya queda en el AuthContext.
    }
  };
  return (
    <>
      <TermsModal
        isOpen={showTermsModal}
        onClose={dismissTermsModal}
        onAccept={handleAcceptTerms}
      />
      <div className="w-full grid grid-cols-1 lg:grid-cols-2">
        <div className="hidden lg:flex lg:flex-col lg:items-center lg:justify-center">
          <img
            src={logoColor}
            alt="Logo Nexus"
            className="mx-auto w-3/5 h-auto row-span-3"
          />
          <div className="text-center row-span-2">
            <p className="text-xl px-4">
              <span className="block text-xl font-semibold text-primary">
                te conecta con el aprendizaje y facilita la gestión educativa en
                un solo lugar
              </span>
            </p>
          </div>
        </div>
        <div className="w-full flex items-center justify-center p-4 bg-primary">
          <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-4 w-3/4 p-6 rounded-xl"
            noValidate
          >
            <div className="flex flex-col text-center gap-6">
              <h2 className="text-secondary font-bold text-6xl">Bienvenido</h2>
              <h3 className="text-surface font-semibold text-4xl">
                Iniciar sesión
              </h3>
            </div>
            <div className="flex flex-col justify-between gap-1">
              <label
                htmlFor="email"
                className="text-surface text-2xl font-bold"
              >
                Usuario
              </label>
              <input
                id="email"
                type="text"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Usuario"
                autoComplete="username"
                aria-required="true"
                className="bg-surface px-2 py-1 rounded-md text-2xl"
              />
            </div>
            <div className="flex flex-col justify-between gap-1">
              <label
                htmlFor="infokey"
                className="text-surface text-2xl font-bold"
              >
                Contraseña
              </label>
              <input
                id="infokey"
                type="password"
                name="infokey"
                value={formData.infokey}
                onChange={handleChange}
                placeholder="Contraseña"
                autoComplete="current-password"
                aria-required="true"
                className="bg-surface px-2 py-1 rounded-md text-2xl"
              />
            </div>

            <div className="flex flex-col justify-between pt-2 gap-2">
              <SimpleButton
                msj={"Iniciar sesión"}
                type="submit"
                disabled={loading || !isFormValid}
                bg={"bg-secondary"}
                text={"text-surface"}
                hover={"hover:bg-secondary/80"}
                textSize="text-3xl"
              />
              <button
                type="button"
                className="text-2xl text-surface hover:underline mt-3"
                onClick={() => navigate("/forgot-password")}
              >
                ¿Olvidaste tu contraseña?
              </button>
              <p className="text-surface text-center text-sm">
                <a
                  href="https://nexusplataforma.com/storage/otros/POL%C3%8DTICA%20DE%20TRATAMIENTO%20DE%20DATOS%20PERSONALES.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="pointer hover:underline text-secondary font-semibold"
                >
                  Política de tratamiento de datos personales
                </a>
              </p>
              {loading && <Loader />}
              {!loading && error && (
                <div
                  className="mt-3 p-4 rounded-lg border-l-4 border-error bg-gray-50 text-error shadow-md"
                  role="alert"
                  aria-live="assertive"
                >
                  <div className="flex items-start gap-3">
                    <svg
                      className="w-6 h-6 shrink-0 mt-0.5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                      aria-hidden="true"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <div className="flex-1">
                      <h4 className="font-bold text-base mb-1">
                        Error de autenticación
                      </h4>
                      <p className="text-sm leading-relaxed">
                        {error?.message ||
                          "No fue posible iniciar sesión. Por favor, verifica tus credenciales e intenta nuevamente."}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </form>
        </div>
      </div>
    </>
  );
};
export default Login;
