import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

import PerfilScreen from "./PerfilScreen";
import EpisodiosScreen from "./EpisodiosScreen";
import ProductsStack from "./ProductsStack";
import { View, StyleSheet, Platform } from "react-native";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import Ionicons from "react-native-vector-icons/Ionicons";
import AntDesign from "react-native-vector-icons/AntDesign";
import { theme } from "../utils/theme";
import {
  useSafeAreaInsets,
  SafeAreaView,
} from "react-native-safe-area-context";
import CustomHeader from "../components/CustomHeader";

const Tab = createBottomTabNavigator();

// Ícones usando @expo/vector-icons
const TabIcon = ({ name, focused }) => {
  const getIcon = () => {
    const color = focused ? theme.colors.primary : "#666";
    const size = 24;

    switch (name) {
      case "produtos":
        return <MaterialIcons name="store" size={size} color={color} />;
      case "ultimosEpisodios":
        return <AntDesign name="youtube" size={size} color={color} />;
      case "config":
        return <Ionicons name="person" size={size} color={color} />;
      default:
        return <MaterialIcons name="help" size={size} color={color} />;
    }
  };

  return <View style={styles.tabIcon}>{getIcon()}</View>;
};

const Navigator = () => {
  const insets = useSafeAreaInsets();

  return (
    <SafeAreaView
      style={styles.container}
      edges={["top", "left", "right", "bottom"]}
    >
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused }) => (
            <TabIcon name={route.name} focused={focused} />
          ),
          tabBarActiveTintColor: theme.colors.primary,
          tabBarInactiveTintColor: "#666",
          tabBarStyle: [
            styles.tabBar,
            {
              paddingBottom: Platform.OS === "android" ? insets.bottom + 5 : 5,
              height: Platform.OS === "android" ? 60 + insets.bottom : 60,
            },
          ],
          headerShown: route.name !== "produtos", // Não mostrar header na stack de produtos
          header: () => <CustomHeader />,
        })}
      >
        <Tab.Screen
          name="produtos"
          component={ProductsStack}
          options={{
            tabBarLabel: "Produtos",
          }}
        />
        <Tab.Screen
          name="ultimosEpisodios"
          component={EpisodiosScreen}
          options={{
            tabBarLabel: "Episódios",
          }}
        />
        <Tab.Screen
          name="config"
          component={PerfilScreen}
          options={{
            tabBarLabel: "Conta",
          }}
        />
      </Tab.Navigator>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  tabBar: {
    backgroundColor: "#ffffff",
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
    paddingTop: 5,
    elevation: 8,
    shadowColor: "#000000",
    shadowOffset: {
      width: 0,
      height: -5,
    },
    shadowOpacity: 0.12,
    shadowRadius: 6,
  },
  tabIcon: {
    alignItems: "center",
    justifyContent: "center",
  },
});

export default Navigator;
