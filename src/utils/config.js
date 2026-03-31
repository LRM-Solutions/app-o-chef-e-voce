// Configurações da aplicação
import { Platform } from "react-native";
import Constants from "expo-constants";

// Ordem de preferência para API_BASE_URL:
// 1) EXPO_PUBLIC_API_URL (definido no ambiente/expo)
// 2) Constants.manifest.extra.API_BASE_URL (expo config plugin / app.json extra)
// 3) Host padrão baseado na plataforma (Android emulator vs iOS simulator)

const envUrl = process.env.EXPO_PUBLIC_API_URL ||
  (Constants?.manifest?.extra && Constants.manifest.extra.API_BASE_URL);

let defaultHost = "http://192.168.0.99:3333";
if (Platform.OS === "android") {
  // Android emulator uses 10.0.2.2 to reach host machine
      defaultHost = "http://192.168.0.99:3333";
}

const apiBase = (envUrl || defaultHost).replace(/\/$/, "");

export const config = {
  API_BASE_URL: apiBase,
  APP_NAME: "SEU_NOME_DO_APP",
  PRIVACY_POLICY_URL: "https://SEU_SITE_AQUI.exemplo.com/privacidade",
  TERMS_OF_USE_URL: "https://SEU_SITE_AQUI.exemplo.com/termos",
  SUPPORT_URL: "https://SEU_SITE_AQUI.exemplo.com/suporte",
  // Adicione outras configurações aqui conforme necessário
};
