import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  StyleSheet,
  Dimensions,
  ScrollView,
  Alert,
  TextInput,
} from "react-native";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { useTheme } from "../utils/ThemeContext";
import {
  getProductById,
  formatPrice,
  formatCategory,
  isInStock,
  getProductImages,
} from "../api/products";
import { CartService } from "../services/cartService";
import { useAuth } from "../components/AuthProvider";
import Toast from "react-native-toast-message";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

export default function SingleProductScreen({ route, navigation }) {
  const { productId } = route.params;
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const { isAuthenticated } = useAuth();
  const { theme, themeMode } = useTheme();
  const isDark = theme?.isDarkMode ?? (themeMode === "dark");
  const styles = getStyles(theme, isDark);

  useEffect(() => {
    loadProduct();
  }, [productId]);

  const loadProduct = async () => {
    try {
      setLoading(true);
      const productData = await getProductById(productId);
      setProduct(productData);
    } catch (error) {
      console.error("Erro ao carregar produto:", error);
      Toast.show({
        type: "error",
        text1: "Erro",
        text2: "Não foi possível carregar o produto",
        visibilityTime: 4000,
      });
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const handleQuantityChange = (increment) => {
    if (increment && quantity < product.product_quantity) {
      setQuantity(quantity + 1);
    } else if (!increment && quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const handleLoginPress = () => {
    navigation.navigate("Login");
  };

  const handleAddToCart = async () => {
    try {
      await CartService.addToCart(product, quantity);

      Toast.show({
        type: "success",
        text1: "Produto adicionado!",
        text2: `${quantity}x ${product.product_name} adicionado ao carrinho`,
        visibilityTime: 3000,
      });

      // Reset da quantidade para 1 após adicionar
      setQuantity(1);
    } catch (error) {
      console.error("Erro ao adicionar ao carrinho:", error);
      Toast.show({
        type: "error",
        text1: "Erro",
        text2: "Não foi possível adicionar o produto ao carrinho",
        visibilityTime: 3000,
      });
    }
  };

  const ImageCarousel = () => {
    const images = getProductImages(product);

    if (images.length === 0) {
      return (
        <View style={styles.noImageContainer}>
          <MaterialIcons name="image" size={80} color="#ccc" />
          <Text style={styles.noImageText}>Nenhuma imagem disponível</Text>
        </View>
      );
    }

    return (
      <View style={styles.carouselContainer}>
        <ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={(event) => {
            const index = Math.round(
              event.nativeEvent.contentOffset.x / screenWidth
            );
            setSelectedImageIndex(index);
          }}
        >
          {images.map((imageUrl, index) => (
            <Image
              key={index}
              source={{ uri: imageUrl }}
              style={styles.carouselImage}
              resizeMode="cover"
            />
          ))}
        </ScrollView>

        {/* Indicadores de paginação */}
        {images.length > 1 && (
          <View style={styles.paginationContainer}>
            {images.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.paginationDot,
                  {
                    backgroundColor:
                      index === selectedImageIndex
                        ? theme.colors.primary
                        : "rgba(255, 255, 255, 0.5)",
                  },
                ]}
              />
            ))}
          </View>
        )}

        {/* Contador de imagens */}
        {images.length > 1 && (
          <View style={styles.imageCounter}>
            <Text style={styles.imageCounterText}>
              {selectedImageIndex + 1} / {images.length}
            </Text>
          </View>
        )}
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Carregando produto...</Text>
      </View>
    );
  }

  if (!product) {
    return (
      <View style={styles.errorContainer}>
        <MaterialIcons name="error" size={64} color="#ccc" />
        <Text style={styles.errorText}>Produto não encontrado</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.retryButtonText}>Voltar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const inStock = isInStock(product.product_quantity);
  const hasPromo =
    product.promotional_price &&
    Number(product.promotional_price) > 0 &&
    Number(product.promotional_price) < Number(product.product_price);
  const discountPercent = hasPromo
    ? Math.round(
        ((Number(product.product_price) - Number(product.promotional_price)) /
          Number(product.product_price)) *
          100
      )
    : 0;

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* Carrossel de imagens */}
        <ImageCarousel />

        {/* Informações do produto */}
        <View style={styles.productInfo}>
          {product.product_category && product.product_category !== "Outros" && (
            <View style={styles.categoryContainer}>
              <Text style={styles.categoryLabel}>{product.product_category}</Text>
            </View>
          )}

          <Text style={styles.productName}>
            {product?.product_name || "Produto"}
          </Text>

          {/* Preço */}
          {hasPromo ? (
            <View style={styles.promoPriceContainer}>
              <View style={styles.promoBadgeInline}>
                <MaterialIcons name="local-fire-department" size={14} color="#FFFFFF" />
                <Text style={styles.promoBadgeInlineText}>{discountPercent}% OFF</Text>
              </View>
              <Text style={styles.dePriceDetail}>
                De {formatPrice(product.product_price)}
              </Text>
              <View style={styles.porRowDetail}>
                <Text style={styles.porLabelDetail}>Por </Text>
                <Text style={styles.productPricePromoDetail}>
                  {formatPrice(product.promotional_price)}
                </Text>
              </View>
            </View>
          ) : (
            <Text style={styles.productPrice}>
              {formatPrice(product.product_price)}
            </Text>
          )}

          {/* Descrição do produto */}
          {Boolean(product.description) && (
            <View style={styles.descriptionSection}>
              <Text style={styles.descriptionTitle}>Descrição</Text>
              <Text style={styles.descriptionText}>{product.description}</Text>
            </View>
          )}

          {/* Seletor de quantidade */}
          {inStock && isAuthenticated && (
            <View style={styles.quantitySection}>
              <Text style={styles.quantityLabel}>Quantidade:</Text>
              <View style={styles.quantityContainer}>
                <TouchableOpacity
                  style={[
                    styles.quantityButton,
                    quantity === 1 && styles.quantityButtonDisabled,
                  ]}
                  onPress={() => handleQuantityChange(false)}
                  disabled={quantity === 1}
                >
                  <MaterialIcons
                    name="remove"
                    size={20}
                    color={quantity === 1 ? (isDark ? "#555" : "#AAA") : (isDark ? "#FFF" : "#000")}
                  />
                </TouchableOpacity>

                <Text style={styles.quantityText}>{quantity}</Text>

                <TouchableOpacity
                  style={[
                    styles.quantityButton,
                    quantity === product.product_quantity &&
                      styles.quantityButtonDisabled,
                  ]}
                  onPress={() => handleQuantityChange(true)}
                  disabled={quantity === product.product_quantity}
                >
                  <MaterialIcons
                    name="add"
                    size={20}
                    color={quantity === product.product_quantity ? (isDark ? "#555" : "#AAA") : (isDark ? "#FFF" : "#000")}
                  />
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Botão de adicionar ao carrinho ou fazer login */}
          {!isAuthenticated ? (
            <TouchableOpacity
              style={styles.loginPromptButton}
              onPress={handleLoginPress}
              activeOpacity={0.8}
            >
              <MaterialIcons
                name="login"
                size={20}
                color="white"
                style={styles.cartIcon}
              />
              <Text style={styles.loginPromptText}>
                Faça seu login para comprar
              </Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[
                styles.addToCartButton,
                !inStock && styles.addToCartButtonDisabled,
              ]}
              onPress={handleAddToCart}
              disabled={!inStock}
              activeOpacity={0.8}
            >
              <MaterialIcons
                name="shopping-cart"
                size={20}
                color="white"
                style={styles.cartIcon}
              />
              <Text style={styles.addToCartText}>
                {inStock ? "Adicionar ao Carrinho" : "Produto Esgotado"}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const getStyles = (theme, isDark) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background || (isDark ? "#0F0F0F" : "#FFFFFF"),
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: theme.colors.background || (isDark ? "#0F0F0F" : "#FFFFFF"),
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: isDark ? "#8A8A90" : theme.colors.textMuted,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
    backgroundColor: theme.colors.background || (isDark ? "#0F0F0F" : "#FFFFFF"),
  },
  errorText: {
    fontSize: 16,
    color: isDark ? "#8A8A90" : theme.colors.textMuted,
    marginTop: 16,
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: theme.colors.primary || "#7C4DFF",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  retryButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  scrollContainer: {
    flex: 1,
  },
  carouselContainer: {
    height: screenHeight * 0.4,
    position: "relative",
    backgroundColor: isDark ? "#121214" : "#F5F5F7",
  },
  carouselImage: {
    width: screenWidth,
    height: screenHeight * 0.4,
  },
  noImageContainer: {
    width: screenWidth,
    height: screenHeight * 0.4,
    backgroundColor: isDark ? "#16161A" : theme.colors.backgroundSecondary,
    justifyContent: "center",
    alignItems: "center",
  },
  noImageText: {
    marginTop: 16,
    fontSize: 16,
    color: isDark ? "#8A8A90" : theme.colors.textMuted,
  },
  paginationContainer: {
    position: "absolute",
    bottom: 20,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  imageCounter: {
    position: "absolute",
    top: 20,
    right: 20,
    backgroundColor: "rgba(0, 0, 0, 0.65)",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  imageCounterText: {
    color: "white",
    fontSize: 12,
    fontWeight: "600",
  },
  productInfo: {
    padding: 20,
  },
  categoryContainer: {
    marginBottom: 8,
  },
  categoryLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: theme.colors.primary || "#7C4DFF",
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  productName: {
    fontSize: 22,
    fontWeight: "700",
    color: isDark ? "#FFFFFF" : theme.colors.foreground,
    marginBottom: 8,
    lineHeight: 28,
  },
  promoPriceContainer: {
    marginBottom: 16,
  },
  promoBadgeInline: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: "#E53935",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
    marginBottom: 6,
  },
  promoBadgeInlineText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "800",
  },
  dePriceDetail: {
    fontSize: 14,
    fontWeight: "600",
    color: isDark ? "#8E8E93" : "#8E8E93",
    textDecorationLine: "line-through",
    marginBottom: 2,
  },
  porRowDetail: {
    flexDirection: "row",
    alignItems: "baseline",
  },
  porLabelDetail: {
    fontSize: 16,
    fontWeight: "700",
    color: isDark ? "#A0A0A5" : "#666666",
    marginRight: 4,
  },
  productPricePromoDetail: {
    fontSize: 28,
    fontWeight: "900",
    color: isDark ? "#FF5252" : "#D32F2F",
  },
  productPrice: {
    fontSize: 26,
    fontWeight: "800",
    color: theme.colors.primary || "#7C4DFF",
    marginBottom: 16,
  },
  descriptionSection: {
    marginBottom: 24,
    padding: 16,
    backgroundColor: isDark ? "#1A1A1E" : theme.colors.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: isDark ? "#282830" : theme.colors.border,
  },
  descriptionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: isDark ? "#FFFFFF" : theme.colors.foreground,
    marginBottom: 8,
  },
  descriptionText: {
    fontSize: 14,
    color: isDark ? "#A0A0A5" : theme.colors.textMuted,
    lineHeight: 22,
  },
  quantitySection: {
    marginBottom: 28,
  },
  quantityLabel: {
    fontSize: 15,
    fontWeight: "600",
    color: isDark ? "#FFFFFF" : theme.colors.foreground,
    marginBottom: 10,
  },
  quantityContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: isDark ? "#121214" : theme.colors.backgroundSecondary,
    borderRadius: 10,
    padding: 3,
    alignSelf: "flex-start",
  },
  quantityButton: {
    width: 36,
    height: 36,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: isDark ? "#25252B" : theme.colors.card,
    borderRadius: 8,
  },
  quantityButtonDisabled: {
    backgroundColor: isDark ? "#18181C" : theme.colors.backgroundSecondary,
  },
  quantityText: {
    fontSize: 16,
    fontWeight: "700",
    color: isDark ? "#FFFFFF" : theme.colors.foreground,
    marginHorizontal: 16,
    minWidth: 28,
    textAlign: "center",
  },
  addToCartButton: {
    backgroundColor: theme.colors.primary || "#7C4DFF",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 16,
    borderRadius: 14,
    marginTop: 8,
    shadowColor: theme.colors.primary || "#7C4DFF",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  addToCartButtonDisabled: {
    backgroundColor: isDark ? "#2A2A30" : "#ccc",
    shadowOpacity: 0,
    elevation: 0,
  },
  cartIcon: {
    marginRight: 8,
  },
  addToCartText: {
    color: "white",
    fontSize: 16,
    fontWeight: "700",
  },
  loginPromptButton: {
    backgroundColor: "#4CAF50",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 16,
    borderRadius: 14,
    marginTop: 8,
  },
  loginPromptText: {
    color: "white",
    fontSize: 16,
    fontWeight: "700",
  },
});
