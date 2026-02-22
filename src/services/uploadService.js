import { ApiClient } from "./ApiClient";

/**
 * uploadService: envía un payload (por ejemplo un archivo) junto a un nombre
 * al endpoint POST https://nexusplataforma.com/api/upload/ (ruta base tomada
 * de ApiClient).
 *
 * @param {Blob|File|any} payload  Datos que se desean subir. En caso de subir un
 *   archivo, puede ser un objeto File/Blob.
 * @param {string} name  Nombre asociado al payload. Para archivos se usará como
 *   filename en FormData.
 * @returns {Promise<any>} La respuesta del servidor normalizada por ApiClient.
 */
export async function upload(payload, name) {
  if (!payload) {
    throw new Error("El payload no puede estar vacío");
  }
  if (!name) {
    throw new Error("El nombre es obligatorio");
  }

  // el servicio ahora sólo acepta FormData. No se genera uno nuevo.
  if (!(payload instanceof FormData)) {
    throw new Error("El payload debe ser una instancia de FormData");
  }

  // validamos el contenido del FormData recibido (cada valor debe ser
  // string, File o Blob). No hacemos comprobación del número de entradas
  // porque en algunos casos se envía un campo adicional con el número de
  // identificación.
  const entries = Array.from(payload.entries());
  entries.forEach(([key, val]) => {
    if (
      !(typeof val === "string" || val instanceof File || val instanceof Blob)
    ) {
      throw new Error(
        `FormData field '${key}' debe ser string o archivo, recibí: ${typeof val}`,
      );
    }
  });

  const body = payload; // lo enviamos tal cual
  console.log("Iniciando upload con payload:", body, "y nombre:", name);
  // Usar URL completa para que el servicio siempre apunte al host fijo
  const endpoint = "https://nexusplataforma.com/api/" + name;

  const res = await ApiClient.instance.post(endpoint, body, {
    headers: {
      // Content-Type se fijará automáticamente. Si usamos axios directamente,
      // axios coloca el boundary correcto; dejamos que ApiClient elimine
      // Content-Type si detecta FormData en el interceptor.
    },
    // timeout: 0 si el archivo puede ser grande
  });

  return res;
}
