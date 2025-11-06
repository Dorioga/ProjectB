import { ApiClient } from "./ApiClient";

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
