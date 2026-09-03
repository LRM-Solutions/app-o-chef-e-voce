import React, { useState, useEffect } from "react";
import { View, Image, StyleSheet, TouchableOpacity, Text, Platform } from "react-native";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { useTheme } from "../utils/ThemeContext";
import LogoDefault from "../../assets/sanslogo.png";
import LogoAndroid from "../../assets/logosansnobg.png";
import { CartService } from "../services/cartService";
import CarrinhoComponent from "./CarrinhoComponent";
import { useNavigation } from "@react-navigation/native";
import { useAuth } from "./AuthProvider";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const Logo = Platform.OS === "android" ? LogoAndroid : LogoDefault;

const CustomHeader = () => {
  const [cartItemCount, setCartItemCount] = useState(0);
  const [showCartModal, setShowCartModal] = useState(false);
  const navigation = useNavigation();
  const { isAuthenticated } = useAuth();
  const { theme, themeMode } = useTheme();
  const insets = useSafeAreaInsets();
  const styles = getStyles(theme, insets);

  useEffect(() => {
    if (isAuthenticated) {
      loadCartCount();

      // Listener para quando a tela ganha foco (carrinho foi atualizado)
      const unsubscribe = navigation.addListener("focus", () => {
        loadCartCount();
      });

      return unsubscribe;
    }
  }, [navigation, isAuthenticated]);

  const loadCartCount = async () => {
    try {
      const items = await CartService.getCartItems();
      const totalCount = items.reduce((sum, item) => sum + item.quantity, 0);
      setCartItemCount(totalCount);
    } catch (error) {
      console.error("Error loading cart count:", error);
    }
  };

  const handleLoginPress = () => {
    navigation.navigate("Login");
  };

  const handleGoToCart = () => {
    navigation.navigate("Carrinho");
  };

  const canGoBack = navigation.canGoBack();

  return (
    <>
      <View style={styles.header}>
        <View style={styles.sideContainer}>
          {canGoBack ? (
            <TouchableOpacity
              style={styles.iconButton}
              onPress={() => navigation.goBack()}
              activeOpacity={0.7}
            >
              <MaterialIcons
                name="arrow-back"
                size={22}
                color={theme.colors.textPrimary || (theme.isDarkMode ? "#FFFFFF" : "#1A1A1A")}
              />
            </TouchableOpacity>
          ) : (
            <View style={{ width: 44 }} />
          )}
        </View>

        <View style={styles.logoContainer}>
          <Image
            source={
              Platform.OS === "android"
                ? theme?.logos?.APP_LOGO_NOBG
                  ? { uri: theme.logos.APP_LOGO_NOBG }
                  : LogoAndroid
                : theme?.logos?.APP_LOGO_DEFAULT
                ? { uri: theme.logos.APP_LOGO_DEFAULT }
                : LogoDefault
            }
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        <View style={[styles.sideContainer, { alignItems: "flex-end" }]}>
          {isAuthenticated ? (
            <TouchableOpacity
              style={styles.cartButton}
              onPress={() => setShowCartModal(true)}
              activeOpacity={0.7}
            >
              <MaterialIcons
                name="shopping-cart"
                size={22}
                color={theme.colors.textPrimary || (theme.isDarkMode ? "#FFFFFF" : "#1A1A1A")}
              />
              {cartItemCount > 0 && (
                <View style={styles.cartBadge}>
                  <Text style={styles.cartBadgeText}>
                    {cartItemCount > 99 ? "99+" : cartItemCount}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.loginButton}
              onPress={handleLoginPress}
              activeOpacity={0.8}
            >
              <Text style={styles.loginButtonText}>Login</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {isAuthenticated && (
        <CarrinhoComponent
          visible={showCartModal}
          onClose={() => setShowCartModal(false)}
          onGoToCart={handleGoToCart}
        />
      )}
    </>
  );
};

const getStyles = (theme, insets) => {
  const isDark = theme?.isDarkMode;
  return StyleSheet.create({
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 16,
      paddingTop: (insets?.top || (Platform.OS === "ios" ? 44 : 20)) + 6,
      paddingBottom: 12,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border || (isDark ? "#2E2E2E" : "#F0F0F0"),
      backgroundColor: theme.colors.background || (isDark ? "#0F0F0F" : "#FFFFFF"),
    },
    sideContainer: {
      width: 50,
      justifyContent: "center",
    },
    iconButton: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: isDark ? "rgba(255, 255, 255, 0.08)" : "rgba(0, 0, 0, 0.04)",
      borderWidth: 1,
      borderColor: isDark ? "rgba(255, 255, 255, 0.12)" : "rgba(0, 0, 0, 0.08)",
      justifyContent: "center",
      alignItems: "center",
    },
    logoContainer: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
    },
    logo: {
      width: 130,
      height: 44,
    },
    cartButton: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: isDark ? "rgba(255, 255, 255, 0.08)" : "rgba(0, 0, 0, 0.04)",
      borderWidth: 1,
      borderColor: isDark ? "rgba(255, 255, 255, 0.12)" : "rgba(0, 0, 0, 0.08)",
      justifyContent: "center",
      alignItems: "center",
      position: "relative",
    },
    cartBadge: {
      position: "absolute",
      top: -3,
      right: -3,
      backgroundColor: theme.colors.primary || "#7C4DFF",
      borderRadius: 10,
      minWidth: 20,
      height: 20,
      paddingHorizontal: 4,
      justifyContent: "center",
      alignItems: "center",
      borderWidth: 2,
      borderColor: theme.colors.background || (isDark ? "#0F0F0F" : "#FFFFFF"),
    },
    cartBadgeText: {
      color: "#FFFFFF",
      fontSize: 10,
      fontWeight: "800",
    },
    loginButton: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      backgroundColor: theme.colors.primary,
      borderRadius: 20,
    },
    loginButtonText: {
      color: "white",
      fontSize: 14,
      fontWeight: "600",
    },
  });
};

export default CustomHeader;
