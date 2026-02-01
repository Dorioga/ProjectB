import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Loader from "../../components/atoms/Loader";
import useAuth from "../../lib/hooks/useAuth";
import SimpleButton from "../../components/atoms/SimpleButton";
import { School } from "lucide-react";
const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    infokey: "",
  });
  const { login, loading, error } = useAuth();
  const navigate = useNavigate();

  // Limpiar localStorage al entrar a la página de login
  useEffect(() => {
    localStorage.clear();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("entra login");
    try {
      await login(formData);
      navigate("/dashboard/home");
    } catch {
      // El error ya queda en el AuthContext.
    }
  };
  return (
    <div className="w-full grid grid-cols-1 lg:grid-cols-2 h-full">
      <div className="bg-surface hidden lg:flex lg:items-center lg:justify-center">
        <div className="w-96 h-96   bg-amber-400 flex flex-col items-center justify-center rounded-full">
          <School size={150} color="white" />
          <h1 className="text-surface font-bold text-5xl mt-4">Nexus</h1>
        </div>
      </div>
      <div className="w-full bg-primary flex items-center justify-center p-4 ">
        <div className="flex flex-col gap-4 w-3/4">
          <div className="text-center">
            <h2 className="text-surface font-bold text-4xl">Bienvenido</h2>
            <h3 className="text-surface font-bold text-3xl">Inicie sesión</h3>
          </div>
          <div className="flex flex-col  justify-between gap-1">
            <label htmlFor="email" className="text-surface text-xl font-bold">
              Usuario
            </label>
            <input
              type="text"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Usuario"
              className="bg-surface px-2 py-1 rounded-md"
            />
          </div>
          <div className="flex flex-col justify-between gap-1">
            <label htmlFor="infokey" className="text-surface text-xl font-bold">
              Contraseña
            </label>
            <input
              type="password"
              name="infokey"
              value={formData.infokey}
              onChange={handleChange}
              placeholder="Contraseña"
              className="bg-surface px-2 py-1 rounded-md"
            />
          </div>
          <div className="flex flex-col justify-between pt-2">
            <SimpleButton
              msj={"Iniciar sesión"}
              onClick={handleSubmit}
              disabled={loading}
              bg={"bg-secondary"}
              text={"text-surface"}
              hover={"hover:bg-secondary/80"}
            />
            {loading && <Loader />}
            {!loading && error && (
              <div className="mt-3 p-4 rounded-lg border-l-4 border-error bg-gray-50 text-error shadow-md">
                <div className="flex items-start gap-3">
                  <svg
                    className="w-6 h-6 flex-shrink-0 mt-0.5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
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
        </div>
      </div>
    </div>
  );
};
export default Login;
