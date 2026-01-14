import { ApiClient } from "./ApiClient";

/**
 * Obtiene los tipos de identificación desde el backend.
 *
 * Endpoint esperado: GET /type_identification
 */
export async function getTypeIdentification() {
  const res = await ApiClient.instance.get("/identification-types");

  // ApiClient tiene interceptor que normalmente devuelve res.data.
  // Pero aquí usamos instance.get directamente; res ya es data por interceptor.
  const data = res;
  console.log("DataService - getTypeIdentification:", data);
  // Validación suave del payload: aceptamos array o { data: array }.
  if (Array.isArray(data)) return data;
  if (data && typeof data === "object" && Array.isArray(data.data))
    return data.data;

  throw new Error("Respuesta inesperada de type_identification.");
}

/**
 * Obtiene los estados de beca desde el backend.
 *
 * Endpoint esperado: GET /status_beca
 */
export async function getStatusBeca() {
  const res = await ApiClient.instance.get("/scholarships/status");

  // ApiClient tiene interceptor que normalmente devuelve res.data.
  const data = res;
  console.log("DataService - getStatusBeca:", data);

  // Validación suave del payload: aceptamos array o { data: array }.
  if (Array.isArray(data)) return data;
  if (data && typeof data === "object" && Array.isArray(data.data))
    return data.data;

  throw new Error("Respuesta inesperada de status_beca.");
}

/**
 * Registra un usuario enviando multipart/form-data.
 *
 * Endpoint esperado: POST /users
 */
export async function registerUser(formData) {
  if (!(formData instanceof FormData)) {
    throw new Error("formData debe ser una instancia de FormData.");
  }
  const res = await ApiClient.instance.post("/students", formData);

  // ApiClient tiene interceptor que normalmente devuelve res.data.
  // Pero aquí usamos instance.post directamente; res ya es data por interceptor.
  const data = res;
  console.log("DataService - registerUser:", data);

  // Validación suave del payload: devolvemos data o data.data.
  if (data && typeof data === "object" && "data" in data) return data.data;
  if (data !== undefined && data !== null) return data;

  throw new Error("Respuesta inesperada de registerUser.");
}

/**
 * Obtiene los roles desde el backend.
 *
 * Endpoint esperado: GET /rol
 */
export async function getRol() {
  const res = await ApiClient.instance.get("/roles");

  // ApiClient tiene interceptor que normalmente devuelve res.data.
  // Pero aquí usamos instance.get directamente; res ya es data por interceptor.
  const data = res;
  console.log("DataService - getRol:", data);

  // Validación suave del payload.
  if (Array.isArray(data)) return data;
  if (data && typeof data === "object" && Array.isArray(data.data))
    return data.data;

  throw new Error("Respuesta inesperada de rol.");
}

/**
 * Obtiene el menú por rol desde el backend.
 *
 * Endpoint esperado: POST /menu_rol
 */
export async function getMenuRol(formData) {
  if (!(formData instanceof FormData)) {
    throw new Error("formData debe ser una instancia de FormData.");
  }

  const res = await ApiClient.instance.post("/menus/:roleId", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  // ApiClient tiene interceptor que normalmente devuelve res.data.
  // Pero aquí usamos instance.post directamente; res ya es data por interceptor.
  const data = res;
  console.log("DataService - getMenuRol:", data);

  // Validación suave del payload: devolvemos data o data.data.
  if (data && typeof data === "object" && "data" in data) return data.data;
  if (data !== undefined && data !== null) return data;

  throw new Error("Respuesta inesperada de menu_rol.");
}

/**
 * Obtiene los departamentos desde el backend.
 *
 * Endpoint esperado: GET /departments
 */
export async function getDepartments() {
  const res = await ApiClient.instance.get("/departaments");

  // ApiClient tiene interceptor que normalmente devuelve res.data.
  // Pero aquí usamos instance.get directamente; res ya es data por interceptor.
  const data = res;
  console.log("DataService - getDepartments:", data);

  // Validación suave del payload: aceptamos array o { data: array }.
  if (Array.isArray(data)) return data;
  if (data && typeof data === "object" && Array.isArray(data.data))
    return data.data;

  throw new Error("Respuesta inesperada de departments.");
}

/**
 * Obtiene los municipios por departamento desde el backend.
 *
 * Endpoint esperado: GET /cities/{departmentId}
 */
export async function getCities(departmentId) {
  if (!departmentId) {
    throw new Error("El ID del departamento es requerido.");
  }

  const payload = {
    idDepartament: parseInt(departmentId),
  };

  const res = await ApiClient.instance.post(
    "/municipalities/:departamentId",
    payload
  );

  // ApiClient tiene interceptor que normalmente devuelve res.data.
  // Pero aquí usamos instance.get directamente; res ya es data por interceptor.
  const data = res;
  console.log("DataService - getCities:", data);

  // Validación suave del payload: aceptamos array o { data: array }.
  if (Array.isArray(data)) return data;
  if (data && typeof data === "object" && Array.isArray(data.data))
    return data.data;

  throw new Error("Respuesta inesperada de cities.");
}

/**
 * Obtiene las instituciones con sede desde el backend.
 *
 * Endpoint esperado: POST /institution_sede
 */
export async function getInstitutionSede(formData) {
  if (!(formData instanceof FormData)) {
    throw new Error("formData debe ser una instancia de FormData.");
  }

  const res = await ApiClient.instance.post("/institutionS/:sedeId", formData);

  const data = res;
  console.log("DataService - getInstitutionSede:", data);

  // Validación suave del payload: devolvemos data o data.data.
  if (Array.isArray(data)) return data;
  if (data && typeof data === "object" && Array.isArray(data.data))
    return data.data;
  if (data && typeof data === "object" && "data" in data) return data.data;
  if (data !== undefined && data !== null) return data;

  throw new Error("Respuesta inesperada de institution_sede.");
}

/**
 * Obtiene las sedes desde el backend.
 *
 * Endpoint esperado: POST /sede
 */
export async function getSede(formData) {
  if (!(formData instanceof FormData)) {
    throw new Error("formData debe ser una instancia de FormData.");
  }

  const res = await ApiClient.instance.post("/sede", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  const data = res;
  console.log("DataService - getSede:", data);

  // Validación suave del payload: devolvemos data o data.data.
  if (Array.isArray(data)) return data;
  if (data && typeof data === "object" && Array.isArray(data.data))
    return data.data;
  if (data && typeof data === "object" && "data" in data) return data.data;
  if (data !== undefined && data !== null) return data;

  throw new Error("Respuesta inesperada de sede.");
}
