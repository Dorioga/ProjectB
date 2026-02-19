import { ApiClient } from "./ApiClient";
import { loginResponse } from "./DataExamples/loginResponse";
import { sha256 } from "js-sha256";

/**
 * authService: funciones para inicio de sesión, cierre de sesión y perfil.
 * Ajusta las rutas según tu backend.
 */
export async function login(credentials) {
  const payload = {
    ...credentials,
    // En este proyecto el campo de contraseña del form se llama `infokey`.
    infokey: credentials.infokey ? sha256(String(credentials.infokey)) : "",
  };

  const res = await ApiClient.instance.post("/auth/login", payload);
  // ApiClient tiene interceptor que normalmente devuelve res.data.
  // Pero aquí usamos instance.post directamente; res ya es data por interceptor.
  const data = res;

  // ✅ Validar si hay datos válidos
  if (!data || typeof data !== "object") {
    throw new Error("Credenciales inválidas o respuesta vacía del servidor.");
  }

  // Validar si viene con estructura data.data
  if ("data" in data && data.data) {
    const loginData = data.data;
    // Verificar que tenga al menos token o datos de usuario
    if (!loginData.token && !loginData.id && !loginData.name) {
      throw new Error(
        "Credenciales incorrectas. Por favor, verifica tu usuario y contraseña.",
      );
    }
    return loginData;
  }

  // Si viene directo sin data.data, validar también
  if (!data.token && !data.id && !data.name) {
    throw new Error(
      "Credenciales incorrectas. Por favor, verifica tu usuario y contraseña.",
    );
  }

  return data;
}

export async function logout() {
  // Logout handled client-side only (no network call). Backend should
  // invalidate tokens if necessary — implement server-side endpoint if
  // you want a server-side logout.
  return Promise.resolve({ ok: true });
}

/**
 * Solicita al backend el envío de un enlace para restablecer la contraseña.
 * En modo DEV simula la respuesta para poder probar la UI.
 */
export async function forgotPassword(payload) {
  const email = payload?.email || payload;
  if (!email) {
    throw new Error("El correo es obligatorio");
  }
  if (import.meta.env.DEV) {
    return Promise.resolve({
      ok: true,
      message: "Enlace de restablecimiento simulado (DEV)",
    });
  }
  const res = await ApiClient.instance.post("/auth/forgot-password", { email });
  return res;
}

export async function getProfile() {
  if (import.meta.env.DEV) {
    // Devuelve la información pública de loginResponse como "perfil".
    const { token, name, id_person, school_name, img_logo } = loginResponse;
    return { token, name, id_person, school_name, img_logo };
  }
  return ApiClient.get("/auth/me");
}
