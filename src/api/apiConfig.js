import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { config } from "../utils/config";

// Criar instância do axios
const api = axios.create({
  baseURL: config.API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor para adicionar o token automaticamente nas requisições
api.interceptors.request.use(
  async (config) => {
    try {
      // Log da requisição que está sendo feita
      console.log(
        `🚀 [DEBUG] ${config.method.toUpperCase()} ${config.baseURL}${
          config.url
        }`
      );
      console.log("📤 [DEBUG] Request Headers:", config.headers);

      if (config.data) {
        console.log("📤 [DEBUG] Request Body:", config.data);
      }

      if (config.params) {
        console.log("📤 [DEBUG] Request Params:", config.params);
      }

      const token = await AsyncStorage.getItem("auth_token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        console.log("🔐 [DEBUG] Token adicionado ao header");
      } else {
        console.log("⚠️ [DEBUG] Nenhum token encontrado");
      }
    } catch (error) {
      console.error("❌ [DEBUG] Erro ao recuperar token:", error);
    }
    return config;
  },
  (error) => {
    console.error("❌ [DEBUG] Erro no interceptor de request:", error);
    return Promise.reject(error);
  }
);

// Interceptor para lidar com respostas e erros
api.interceptors.response.use(
  (response) => {
    // Log da resposta bem-sucedida
    console.log(
      `✅ [DEBUG] ${response.config.method.toUpperCase()} ${
        response.config.url
      } - Status: ${response.status}`
    );
    console.log("📥 [DEBUG] Response Data:", response.data);
    return response;
  },
  async (error) => {
    // Log detalhado do erro
    console.error(
      `❌ [DEBUG] ${error.config?.method?.toUpperCase() || "REQUEST"} ${
        error.config?.url || "UNKNOWN"
      } - Erro:`,
      {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message,
      }
    );

    if (error.response?.status === 401) {
      // Token expirado ou inválido
      console.log("🔓 [DEBUG] Token inválido/expirado - Removendo do storage");
      await AsyncStorage.removeItem("auth_token");
      // Aqui você pode redirecionar para a tela de login
    }
    return Promise.reject(error);
  }
);

export default api;
