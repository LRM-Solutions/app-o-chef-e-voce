import React, { useEffect, useRef } from "react";
import { StatusBar } from "expo-status-bar";
import { NavigationContainer } from "@react-navigation/native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { createStackNavigator } from "@react-navigation/stack";
import * as Notifications from "expo-notifications";

import { Platform } from "react-native";
import IntroScreen from "./src/screens/IntroScreen";
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

  // Disable zoom and scroll bounce on web, and fix root background color
  useEffect(() => {
    if (Platform.OS === 'web') {
      const style = document.createElement('style');
      style.textContent = `
        body, html, #root {
          background-color: #111111;
          overscroll-behavior: none;
          touch-action: pan-y;
        }
        input, textarea, select {
          font-size: 16px !important;
        }
      `;
      document.head.appendChild(style);

      let meta = document.querySelector('meta[name="viewport"]');
      if (meta) {
        meta.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, shrink-to-fit=no');
      } else {
        meta = document.createElement('meta');
        meta.name = 'viewport';
        meta.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, shrink-to-fit=no';
        document.head.appendChild(meta);
      }
    }
  }, []);

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <>
    <Stack.Navigator 
      screenOptions={{ 
        headerShown: false,
        animationEnabled: true,
        ...(Platform.OS === 'web' && {
          cardStyleInterpolator: ({ current: { progress } }) => ({
            cardStyle: {
              opacity: progress.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 1],
              }),
            },
          }),
        }),
      }} 
      initialRouteName={Platform.OS === "web" && !isAuthenticated ? "Intro" : "Navigator"}
    >
      {Platform.OS === "web" && <Stack.Screen name="Intro" component={IntroScreen} />}
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
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: '#111111' }}>
      <SafeAreaProvider style={{ backgroundColor: '#111111' }}>
        <ThemeProvider>
          <AuthProvider>
            <NavigationContainer
              documentTitle={{
                formatter: (options, route) => `Sans Company`,
              }}
            >
              <RootNavigator />
            </NavigationContainer>

            <Toast />
          </AuthProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
