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

// -----------------------------------------------------------------------------
// Nuevos endpoints según solicitud del usuario
// -----------------------------------------------------------------------------

/**
 * Envía un payload al endpoint /values_access_data
 * @param {Object} payload - Cualquier información que deba enviarse.
 * @returns {Promise} Respuesta del servidor.
 */
export async function valuesAccessData(payload) {
  if (!payload || typeof payload !== "object") {
    throw new Error("Payload inválido para valuesAccessData");
  }
  // El interceptor de ApiClient ya devuelve res.data en la mayoría de los casos.
  return ApiClient.instance.post("/values_access_data", payload);
}

/**
 * Envía un payload al endpoint /access_data
 * @param {Object} payload - Cualquier información que deba enviarse.
 * @returns {Promise} Respuesta del servidor.
 */
export async function accessData(payload) {
  if (!payload || typeof payload !== "object") {
    throw new Error("Payload inválido para accessData");
  }
  return ApiClient.instance.post("/access_data", payload);
}

/**
 * Registra la firma del usuario en el backend.
 * Se usa en TermsModal cuando el rol es 5.
 * @param {Object} payload - Debe incluir al menos idPersona y signature (base64).
 * @returns {Promise} Respuesta del servidor.
 */
export async function registerSignature(payload) {
  if (!payload || typeof payload !== "object") {
    throw new Error("Payload inválido para registerSignature");
  }
  return ApiClient.instance.post("/uploadfirma/acudientes", payload);
}

/**
 * Registra la reserva de cupo de un estudiante.
 * POST /slots
 * @param {Object} payload - Datos del estudiante y acudiente.
 * @returns {Promise} Respuesta del servidor.
 */
export async function registerSlot(payload) {
  if (!payload || typeof payload !== "object") {
    throw new Error("Payload inválido para registerSlot");
  }
  return ApiClient.instance.post("/slots", payload);
}

/**
 * Registra una reserva de cupo desde el dashboard (flujo interno).
 * POST /slots-internal
 * @param {Object} payload - { fk_estudiante, fk_acudiente, fk_sede, fk_grado, fk_jornada, parentesco }
 * @returns {Promise} Respuesta del servidor.
 */
export async function registerSlotsInternal(payload) {
  if (!payload || typeof payload !== "object") {
    throw new Error("Payload inválido para registerSlotsInternal");
  }
  return ApiClient.instance.post("/slots-internal", payload);
}

/**
 * Solicita la recuperación de contraseña según el rol del usuario.
 * POST /recoverypassword
 * @param {Object} payload - { email?, lastName?, identificationNumber?, idRol }
 * @returns {Promise} Respuesta del servidor.
 */
export async function recoveryPassword(payload) {
  if (!payload || typeof payload !== "object") {
    throw new Error("Payload inválido para recoveryPassword");
  }
  return ApiClient.instance.post("/recoverypassword", payload);
}

/**
 * Obtiene la institución asignada para un docente, a partir de la sede.
 * POST /institucion/teacher
 * @param {{ idSede: number }} payload
 * @returns {Promise<Object>} Respuesta del servidor con id_institucion
 */
export async function getTeacherInstitution(payload) {
  if (!payload || typeof payload !== "object") {
    throw new Error("Payload inválido para getTeacherInstitution");
  }
  return ApiClient.instance.post("/institucion/teacher", payload);
}

/**
 * Actualiza la contraseña del usuario autenticado.
 * PATCH /user/:userId
 * @param {string|number} personaId - ID de la persona.
 * @param {string} nuevaContrasena - Nueva contraseña en texto plano (se hashea con sha256).
 * @returns {Promise} Respuesta del servidor.
 */
export async function updatePassword(userId, nuevaContrasena) {
  if (!userId) throw new Error("userId es requerido");
  if (!nuevaContrasena) throw new Error("La nueva contraseña es requerida");
  const payload = { contrasena: sha256(String(nuevaContrasena)) };
  return ApiClient.patch(`/user/${userId}`, payload);
}
