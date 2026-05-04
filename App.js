import React, { useEffect, useRef } from "react";
import { StatusBar } from "expo-status-bar";
import { NavigationContainer } from "@react-navigation/native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { createStackNavigator } from "@react-navigation/stack";
import * as Notifications from "expo-notifications";

import Navigator from "./src/screens/Navigator";
import LoginScreen from "./src/screens/LoginScreen";
import SignUpScreen from "./src/screens/SignUpScreen";
import RecuperarSenhaScreen from "./src/screens/RecuperarSenhaScreen";
import NewUserEmailCodeScreen from "./src/screens/NewUserEmailCodeScreen";
import ConfirmarExclusaoCodeScreen from "./src/screens/ConfirmarExclusaoCodeScreen";
import { AuthProvider, useAuth } from "./src/components/AuthProvider";
import LoadingScreen from "./src/components/LoadingScreen";
import { initializeNotifications } from "./src/services/notificationService";
import { ThemeProvider, useTheme } from "./src/utils/ThemeContext";

import Toast from "react-native-toast-message";

const Stack = createStackNavigator();

const RootNavigator = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const { theme } = useTheme();
  const { isDarkMode } = theme;
  const notificationListener = useRef();
  const responseListener = useRef();

  // Inicializar push notifications quando o usuário estiver autenticado
  useEffect(() => {
    if (isAuthenticated) {
      initializeNotifications().catch((err) =>
        console.error("Erro ao inicializar notificações:", err)
      );

      // Listener para notificações recebidas em foreground
      notificationListener.current =
        Notifications.addNotificationReceivedListener((notification) => {
          const { title, body } = notification.request.content;
          console.log("🔔 Notificação recebida em foreground:", title);

          // Mostrar toast quando a notificação chegar com o app aberto
          Toast.show({
            type: "info",
            text1: title || "Sans Company",
            text2: body || "",
            visibilityTime: 5000,
            topOffset: 60,
          });
        });

      // Listener para quando o usuário toca na notificação
      responseListener.current =
        Notifications.addNotificationResponseReceivedListener((response) => {
          const data = response.notification.request.content.data;
          console.log("📱 Usuário tocou na notificação:", data);

          // Aqui pode-se navegar para uma tela específica baseado no tipo
          if (data?.type === "appointment_reminder") {
            // Navegar para tela de agendamentos (tratado pelo navigation ref se necessário)
            console.log(
              "📅 Notificação de agendamento:",
              data.appointment_id
            );
          }
        });
    }

    return () => {
      if (notificationListener.current) {
        notificationListener.current.remove();
      }
      if (responseListener.current) {
        responseListener.current.remove();
      }
    };
  }, [isAuthenticated]);

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <>
    <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName="Navigator">
      <Stack.Screen name="Navigator" component={Navigator} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="SignUp" component={SignUpScreen} />
      <Stack.Screen name="RecuperarSenha" component={RecuperarSenhaScreen} />
      <Stack.Screen name="NewUserEmailCode" component={NewUserEmailCodeScreen} />
      <Stack.Screen name="ConfirmarExclusaoCode" component={ConfirmarExclusaoCodeScreen} />
    </Stack.Navigator>
    <StatusBar style={isDarkMode ? "light" : "dark"} backgroundColor="transparent" translucent={true} />
    </>
  );
};

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ThemeProvider>
          <AuthProvider>
            <NavigationContainer>
              <RootNavigator />
            </NavigationContainer>

            <Toast />
          </AuthProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
