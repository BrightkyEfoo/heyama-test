import axios from "axios";

export const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
const MINIO_URL = process.env.NEXT_PUBLIC_MINIO_URL || "http://localhost:9000";

export function getImageUrl(path: string) {
  return `${MINIO_URL}${path}`;
}

export const api = axios.create({
  baseURL: API_URL,
});

export async function fetchObjects(page: number, limit: number = 12) {
  const { data } = await api.get("/objects", { params: { page, limit } });
  return data;
}

export async function fetchObjet(id: string) {
  const { data } = await api.get(`/objects/${id}`);
  return data;
}

export async function createObjet(formData: FormData) {
  const { data } = await api.post("/objects", formData);
  return data;
}

export async function deleteObjet(id: string) {
  const { data } = await api.delete(`/objects/${id}`);
  return data;
}
