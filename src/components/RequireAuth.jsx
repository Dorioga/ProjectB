import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import useAuth from "../lib/hooks/useAuth";
import Loader from "./atoms/Loader";

export default function RequireAuth({ children }) {
  const { token, loading } = useAuth();
  const location = useLocation();

  // Mostrar loader mientras AuthContext aún carga (evita parpadeos)
  if (loading) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  if (!token) {
    // Redirige a login y conserva la ruta solicitada en state
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children || null;
}
