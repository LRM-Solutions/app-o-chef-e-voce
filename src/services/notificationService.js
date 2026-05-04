import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import Constants from "expo-constants";
import { Platform } from "react-native";
import api from "../api/apiConfig";

// Configurar como as notificações são exibidas quando o app está em foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

/**
 * Registra o dispositivo para push notifications e retorna o ExpoPushToken.
 */
export async function registerForPushNotificationsAsync() {
  let token = null;

  // Push notifications só funcionam em dispositivos físicos
  if (!Device.isDevice) {
    return null;
  }

  // Configurar canal de notificação no Android
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("appointment-reminders", {
      name: "Lembretes de Agendamento",
      description: "Notificações de lembrete antes dos seus agendamentos",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#6200EA",
      sound: "default",
      enableVibrate: true,
      showBadge: true,
    });

    await Notifications.setNotificationChannelAsync("default", {
      name: "Notificações Gerais",
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#6200EA",
      sound: "default",
    });
  }

  // Verificar/solicitar permissões
  const { status: existingStatus } =
    await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== "granted") {
    return null;
  }

  // Obter token
  try {
    const projectId =
      Constants?.expoConfig?.extra?.eas?.projectId ??
      Constants?.easConfig?.projectId;

    if (!projectId) {
      return null;
    }

    const tokenData = await Notifications.getExpoPushTokenAsync({
      projectId,
    });
    token = tokenData.data;
  } catch (error) {
    console.error("❌ Erro ao obter ExpoPushToken:", error);
    return null;
  }

  return token;
}

/**
 * Envia o push token para o backend para ser associado ao usuário.
 */
export async function sendPushTokenToServer(pushToken) {
  if (!pushToken) return;

  try {
    await api.post("/user/push-token", {
      push_token: pushToken,
    });
  } catch (error) {
    console.error(
      "❌ Erro ao enviar push token para o servidor:",
      error?.response?.data || error.message
    );
  }
}

/**
 * Inicializa o sistema de notificações completo.
 * Deve ser chamado após o login bem-sucedido.
 */
export async function initializeNotifications() {
  const token = await registerForPushNotificationsAsync();
  if (token) {
    await sendPushTokenToServer(token);
  }
  return token;
}
