import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator } from "@react-navigation/stack";
import { View, StyleSheet, Platform, Text } from "react-native";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { theme } from "../utils/theme";
import {
  useSafeAreaInsets,
  SafeAreaView,
} from "react-native-safe-area-context";
import { useTheme } from "../utils/ThemeContext";

// Sans Company Screens
import BarberScreen from "./BarberScreen";
import PerfilScreen from "./PerfilScreen";
import AppointmentSuccessScreen from "./AppointmentSuccessScreen";
import HistoricoAgendamentosScreen from "./HistoricoAgendamentosScreen";
import AlterarSenhaScreen from "./AlterarSenhaScreen";
import MeusPedidosStack from "./MeusPedidosStack";
import PrizeScannerScreen from "./PrizeScannerScreen";
import RedemptionSuccessScreen from "./RedemptionSuccessScreen";

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Custom Tab Bar Icon
const TabIcon = ({ name, focused, theme, styles }) => {
  const getIcon = () => {
    const color = focused ? "#FFFFFF" : theme.colors.textMuted;
    const size = focused ? 24 : 22;

    switch (name) {
      case "Barber":
        return <MaterialCommunityIcons name="content-cut" size={size} color={color} />;
      case "Perfil":
        return <MaterialIcons name="person" size={size} color={color} />;
      default:
        return <MaterialIcons name="help" size={size} color={color} />;
    }
  };

  return (
    <View style={[styles.tabIconContainer, focused && styles.tabIconFocused]}>
      {getIcon()}
    </View>
  );
};

// Bottom Tabs Navigator
const MainTabs = () => {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const styles = getStyles(theme);

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused }) => (
          <TabIcon name={route.name} focused={focused} theme={theme} styles={styles} />
        ),
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textMuted,
        tabBarStyle: [
          styles.tabBar,
          {
            paddingBottom: Platform.OS === "ios" ? insets.bottom : 10,
            height: Platform.OS === "ios" ? 60 + insets.bottom : 70,
          },
        ],
        tabBarLabelStyle: styles.tabBarLabel,
        headerShown: false,
        tabBarHideOnKeyboard: true,
      })}
    >
      <Tab.Screen
        name="Barber"
        component={BarberScreen}
        options={{ tabBarLabel: "Barber" }}
      />
      <Tab.Screen
        name="Perfil"
        component={PerfilScreen}
        options={{ tabBarLabel: "Perfil" }}
      />
    </Tab.Navigator>
  );
};

// Main Navigator with Stack for modals/success screens
const Navigator = () => {
  const { theme } = useTheme();
  const styles = getStyles(theme);

  return (
    <View style={styles.wrapper}>
      <SafeAreaView style={styles.container} edges={["left", "right"]}>
        <Stack.Navigator
          screenOptions={{
            headerShown: false,
            cardStyle: { backgroundColor: theme.colors.background },
          }}
        >
          <Stack.Screen name="MainTabs" component={MainTabs} />
          <Stack.Screen
            name="AppointmentSuccess"
            component={AppointmentSuccessScreen}
            options={{
              presentation: "modal",
              gestureEnabled: true,
            }}
          />
          <Stack.Screen
            name="HistoricoAgendamentos"
            component={HistoricoAgendamentosScreen}
          />
          <Stack.Screen
            name="AlterarSenha"
            component={AlterarSenhaScreen}
          />
          <Stack.Screen
            name="MeusPedidos"
            component={MeusPedidosStack}
          />
          <Stack.Screen
            name="PrizeScanner"
            component={PrizeScannerScreen}
            options={{ presentation: "modal" }}
          />
          <Stack.Screen
            name="RedemptionSuccess"
            component={RedemptionSuccessScreen}
            options={{ gestureEnabled: false }}
          />
        </Stack.Navigator>
      </SafeAreaView>
    </View>
  );
};

const getStyles = (theme) => StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: theme.colors.backgroundSecondary,
  },
  container: {
    flex: 1,
  },
  tabBar: {
    backgroundColor: theme.colors.background,
    borderTopWidth: 0,
    paddingTop: 12,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
  },
  tabBarLabel: {
    fontSize: 11,
    fontWeight: "600",
    marginTop: 6,
  },
  tabIconContainer: {
    alignItems: "center",
    justifyContent: "center",
    width: 56,
    height: 40,
    borderRadius: 16,
    marginTop: -4,
  },
  tabIconFocused: {
    backgroundColor: theme.colors.primary,
    ...theme.shadows.button,
  },
});

export default Navigator;
