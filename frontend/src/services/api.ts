import axios from "axios";

function normalizeApiBaseUrl(value?: string) {
  const configured = (value || "/api").replace(/\/$/, "");
  if (configured === "/api" || configured.endsWith("/api")) {
    return configured;
  }
  return `${configured}/api`;
}

const apiBaseUrl = normalizeApiBaseUrl(import.meta.env.VITE_API_BASE_URL);

export const api = axios.create({
  baseURL: apiBaseUrl,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.error || error.response?.data?.message || error.message;
    return Promise.reject(new Error(message));
  },
);
