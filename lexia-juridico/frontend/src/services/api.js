import axios from "axios";
export const API_URL = import.meta.env.VITE_API_URL;
const api = axios.create({
  baseURL: API_URL, // ajuste se for produção
});

// Adiciona o token automaticamente
api.interceptors.request.use(config => {
  const token = localStorage.getItem("lexia_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Intercepta erro 401 (token expirado) e redireciona
api.interceptors.response.use(
  response => response,
  error => {
    const detail = error.response?.data?.detail?.toLowerCase();
    if (
      error.response?.status === 401 &&
      (detail?.includes("token") || detail?.includes("not authenticated"))
    ) {
      console.log("➡️ Redirecionando para login (token expirado ou inválido)");
      localStorage.removeItem("lexia_token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;
