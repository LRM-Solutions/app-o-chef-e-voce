import React from "react";
import { StatusBar } from "expo-status-bar";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AuthProvider } from "./src/components/AuthProvider";
import ErrorBoundary from "./src/components/ErrorBoundary";
import LoginScreen from "./src/screens/LoginScreen";
import SignUpScreen from "./src/screens/SignUpScreen";
import NewUserEmailCodeScreen from "./src/screens/NewUserEmailCodeScreen";
import RecuperarSenhaScreen from "./src/screens/RecuperarSenhaScreen";
import Navigator from "./src/screens/Navigator";

import Toast from "react-native-toast-message";

const Stack = createStackNavigator();

export default function App() {
  return (
    <ErrorBoundary>
      <SafeAreaProvider>
        <AuthProvider>
          <NavigationContainer>
            <Stack.Navigator
              screenOptions={{
                headerShown: false,
              }}
              initialRouteName="Navigator"
            >
              <Stack.Screen name="Navigator" component={Navigator} />
              <Stack.Screen name="Login" component={LoginScreen} />
              <Stack.Screen name="SignUp" component={SignUpScreen} />
              <Stack.Screen
                name="NewUserEmailCode"
                component={NewUserEmailCodeScreen}
              />
              <Stack.Screen
                name="RecuperarSenha"
                component={RecuperarSenhaScreen}
              />
            </Stack.Navigator>
          </NavigationContainer>
          <StatusBar style="auto" />
          <Toast />
        </AuthProvider>
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}
