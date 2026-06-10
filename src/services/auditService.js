import { ApiClient } from "./ApiClient";

/**
 * Servicio de auditoría para registrar datos de estudiantes.
 * POST /audit
 */
export async function setStudentDataAudit(payload) {
  if (!payload || typeof payload !== "object") {
    throw new Error("Payload inválido para setStudentDataAudit");
  }

  return ApiClient.instance.post("/audit", payload);
}
