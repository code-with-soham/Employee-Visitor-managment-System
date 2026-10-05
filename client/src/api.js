import axios from "axios";

// Create an Axios instance with the base URL from .env
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

// Optional: Add an interceptor to automatically attach the JWT token
// to every request if it exists in localStorage.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
