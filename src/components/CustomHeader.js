import React, { useState, useEffect } from "react";
import { View, Image, StyleSheet, TouchableOpacity, Text } from "react-native";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { theme } from "../utils/theme";
import Logo from "../assets/images/logo.png";
import { CartService } from "../services/cartService";
import CarrinhoComponent from "./CarrinhoComponent";
import { useNavigation } from "@react-navigation/native";

const CustomHeader = () => {
  const [cartItemCount, setCartItemCount] = useState(0);
  const [showCartModal, setShowCartModal] = useState(false);
  const navigation = useNavigation();

  useEffect(() => {
    loadCartCount();

    // Listener para quando a tela ganha foco (carrinho foi atualizado)
    const unsubscribe = navigation.addListener("focus", () => {
      loadCartCount();
    });

    return unsubscribe;
  }, [navigation]);

  const loadCartCount = async () => {
    try {
      const count = await CartService.getCartItemCount();
      setCartItemCount(count);
    } catch (error) {
      console.error("Erro ao carregar contagem do carrinho:", error);
    }
  };

  const handleGoToCart = () => {
    navigation.navigate("Carrinho");
  };

  return (
    <>
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <Image source={Logo} style={styles.logo} resizeMode="contain" />
        </View>

        <TouchableOpacity
          style={styles.cartButton}
          onPress={() => setShowCartModal(true)}
        >
          <MaterialIcons name="shopping-cart" size={24} color="#000" />
          {cartItemCount > 0 && (
            <View style={styles.cartBadge}>
              <Text style={styles.cartBadgeText}>
                {cartItemCount > 99 ? "99+" : cartItemCount}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <CarrinhoComponent
        visible={showCartModal}
        onClose={() => setShowCartModal(false)}
        onGoToCart={handleGoToCart}
      />
    </>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 0,
    borderBottomWidth: 1.5,
    borderBottomColor: theme.colors.border,
    backgroundColor: theme.colors.background,
  },
  logoContainer: {
    flex: 1,
    alignItems: "center",
  },
  logo: {
    width: 150,
    height: 100,
  },
  cartButton: {
    position: "relative",
    padding: 8,
  },
  cartBadge: {
    position: "absolute",
    top: 2,
    right: 2,
    backgroundColor: "#f44336",
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  cartBadgeText: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
  },
});

export default CustomHeader;
