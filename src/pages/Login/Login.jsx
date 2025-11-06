import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Loader from "../../components/atoms/Loader";
import useAuth from "../../lib/hooks/useAuth";
import SimpleButton from "../../components/atoms/SimpleButton";
const Login = () => {
  const [formData, setFormData] = useState({
    user: "",
    password: "",
  });
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    login(formData);
    navigate("/dashboard/home");
    setLoading(false);

    // Peticion de Iniciar Sesion
  };
  return (
    <div className="w-full flex items-center justify-center h-full">
      <div className="w-1/4 bg-primary flex items-center justify-center p-4 rounded-2xl py-14">
        <div className="flex flex-col gap-4 w-3/4">
          <div className="text-center">
            <h2 className="text-surface font-bold text-4xl">Bienvenido</h2>
            <h3 className="text-surface font-bold text-3xl">Inicie sesión</h3>
          </div>
          <div className="flex flex-col  justify-between gap-1">
            <label htmlFor="user" className="text-surface text-xl font-bold">
              Usuario
            </label>
            <input
              type="text"
              name="user"
              value={formData.user}
              onChange={handleChange}
              placeholder="Username"
              className="bg-surface px-2 py-1 rounded-md"
            />
          </div>
          <div className="flex flex-col justify-between gap-1">
            <label htmlFor="user" className="text-surface text-xl font-bold">
              Contraseña
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Password"
              className="bg-surface px-2 py-1 rounded-md"
            />
          </div>
          <div className="flex flex-col justify-between pt-2">
            <SimpleButton
              msj={"Iniciar Sesión"}
              onClick={handleSubmit}
              bg={"bg-secondary"}
              text={"text-white"}
              hover={"hover:bg-secondary/80"}
            />
            {loading && <Loader />}
          </div>
        </div>
      </div>
    </div>
  );
};
export default Login;
