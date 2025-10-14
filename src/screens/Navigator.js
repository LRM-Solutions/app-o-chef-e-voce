import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

import PerfilScreen from "./PerfilScreen";
import EpisodiosScreen from "./EpisodiosScreen";
import ProductsStack from "./ProductsStack";
import CarrinhoScreen from "./CarrinhoScreen";
import MeusPedidosScreen from "./MeusPedidosScreen";
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
    <View style={styles.wrapper}>
      <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
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
                paddingBottom: Platform.OS === "ios" ? insets.bottom : 5,
                height: Platform.OS === "ios" ? 30 + insets.bottom : 60,
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
          {/* Tela do carrinho - oculta da tab bar mas acessível via navegação */}
          <Tab.Screen
            name="Carrinho"
            component={CarrinhoScreen}
            options={{
              tabBarButton: () => null, // Remove da tab bar
              tabBarItemStyle: { display: "none" },
              headerShown: false, // CarrinhoScreen tem seu próprio header
            }}
          />
          {/* Tela de Meus Pedidos - oculta da tab bar mas acessível via navegação */}
          <Tab.Screen
            name="MeusPedidos"
            component={MeusPedidosScreen}
            options={{
              tabBarButton: () => null, // Remove da tab bar
              tabBarItemStyle: { display: "none" },
              headerShown: false, // MeusPedidosScreen tem seu próprio header
            }}
          />
        </Tab.Navigator>
      </SafeAreaView>
      {/* Área inferior para cobrir o home indicator com a cor da tab bar */}
      <SafeAreaView style={styles.bottomSafeArea} edges={["bottom"]} />
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  bottomSafeArea: {
    backgroundColor: theme.colors.background,
  },
  tabBar: {
    backgroundColor: theme.colors.background,
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
