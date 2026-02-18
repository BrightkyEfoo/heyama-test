const API_URL = process.env.EXPO_PUBLIC_API_URL || "http://localhost:3000";
const MINIO_URL = process.env.EXPO_PUBLIC_MINIO_URL || "http://localhost:9000";

export function getImageUrl(path: string) {
  return `${MINIO_URL}${path}`;
}

export async function fetchObjects(page: number, limit: number = 12) {
  const res = await fetch(`${API_URL}/objects?page=${page}&limit=${limit}`);
  return res.json();
}

export async function fetchObjet(id: string) {
  const res = await fetch(`${API_URL}/objects/${id}`);
  return res.json();
}

export async function createObjet(formData: FormData) {
  const res = await fetch(`${API_URL}/objects`, {
    method: "POST",
    body: formData,
  });
  return res.json();
}

export async function deleteObjet(id: string) {
  const res = await fetch(`${API_URL}/objects/${id}`, { method: "DELETE" });
  return res.json();
}
