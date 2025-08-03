import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8000", // ajuste se for produção
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
