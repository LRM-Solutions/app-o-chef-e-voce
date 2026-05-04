// Configurações da aplicação
import { Platform } from "react-native";
import Constants from "expo-constants";

// Ordem de preferência para API_BASE_URL:
// 1) EXPO_PUBLIC_API_URL (definido no ambiente/expo)
// 2) Constants.manifest.extra.API_BASE_URL (expo config plugin / app.json extra)
// 3) Host padrão baseado na plataforma (Android emulator vs iOS simulator)

// Endereço da API de produção fixado (hardcoded)
// Importante: .env nem sempre é carregado corretamente em builds de produção da Apple
const API_PRODUCTION_URL = "https://api-barber-nine.vercel.app";

const apiBase = API_PRODUCTION_URL;

export const config = {
  API_BASE_URL: apiBase,
  APP_NAME: "SEU_NOME_DO_APP",
  PRIVACY_POLICY_URL: "https://sejasans.com.br/privacidade/",
  TERMS_OF_USE_URL: "https://sejasans.com.br/termos/",
  SUPPORT_URL: "https://sejasans.com.br/contato/",
  // Adicione outras configurações aqui conforme necessário
};
