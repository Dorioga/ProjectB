import { ApiClient } from "./ApiClient";
import { sedesResponses } from "./DataExamples/sedesResponse";
import { journeysResponse } from "./DataExamples/journeysResponse";

export async function getSchools(params = {}) {
  return ApiClient.get("/schools", params);
}

export async function getSchool(id) {
  return ApiClient.get(`/schools/${id}`);
}

export async function createSchool(payload) {
  return ApiClient.post("/schools", payload);
}

export async function updateSchool(id, payload) {
  return ApiClient.put(`/schools/${id}`, payload);
}

export async function deleteSchool(id) {
  return ApiClient.del(`/schools/${id}`);
}

// Mock / DataExample: sedes
export async function getSedes(params = {}) {
  const schoolId = params?.schoolId;
  if (schoolId) {
    return sedesResponses.filter((sede) => sede.schoolId === schoolId);
  }
  return sedesResponses;
}

// Mock / DataExample: journeys
export async function getJourneys(params = {}) {
  return journeysResponse;
}
