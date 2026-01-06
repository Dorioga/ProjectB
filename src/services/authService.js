import { ApiClient } from "./ApiClient";
import { loginResponse } from "./DataExamples/loginResponse";
import { sha256 } from "js-sha256";

/**
 * authService: funciones para inicio de sesión, cierre de sesión y perfil.
 * Ajusta las rutas según tu backend.
 */
export async function login(credentials) {
  console.log("AuthService - login called with:", credentials);

  const payload = {
    ...credentials,
    // En este proyecto el campo de contraseña del form se llama `infokey`.
    infokey: credentials.infokey ? sha256(String(credentials.infokey)) : "",
  };

  const res = await ApiClient.instance.post("/login", payload);

  // ApiClient tiene interceptor que normalmente devuelve res.data.
  // Pero aquí usamos instance.post directamente; res ya es data por interceptor.
  const data = res;
  console.log("AuthService - login:", data);

  if (data && typeof data === "object" && "data" in data) return data.data;
  if (data !== undefined && data !== null) return data;

  throw new Error("Respuesta inesperada de login.");
}

export async function logout() {
  if (import.meta.env.DEV) {
    return Promise.resolve({ ok: true });
  }
  return ApiClient.post("/auth/logout");
}

export async function getProfile() {
  if (import.meta.env.DEV) {
    // Devuelve la información pública de loginResponse como "perfil".
    const { token, name, id_person, school_name, img_logo } = loginResponse;
    return { token, name, id_person, school_name, img_logo };
  }
  return ApiClient.get("/auth/me");
}
