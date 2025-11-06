import { ApiClient } from "./ApiClient";
import { loginResponse } from "./DataExamples/ExamplesResponse";
/**
 * authService: funciones para login/logout/perfil
 * Ajusta rutas según tu backend.
 */
export async function login(credentials) {
  // espera { token, user } o similar
  if (import.meta.env.DEV) {
    await new Promise((r) => setTimeout(r, 300));

    return loginResponse;
  }
  return loginResponse;
  // return ApiClient.post("/auth/login", credentials);
}

export async function logout() {
  if (import.meta.env.DEV) {
    return Promise.resolve({ ok: true });
  }
  return ApiClient.post("/auth/logout");
}

export async function getProfile() {
  if (import.meta.env.DEV) {
    // devuelve la info pública del loginResponse como "perfil"
    const { token, name, id_person, school_name, img_logo } = loginResponse;
    return { token, name, id_person, school_name, img_logo };
  }
  return ApiClient.get("/auth/me");
}
