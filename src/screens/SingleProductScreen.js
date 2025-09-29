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
} from "react-native";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { theme } from "../utils/theme";
import {
  getProductById,
  formatPrice,
  formatCategory,
  isInStock,
  getProductImages,
} from "../api/products";
import Toast from "react-native-toast-message";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

export default function SingleProductScreen({ route, navigation }) {
  const { productId } = route.params;
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    loadProduct();
  }, [productId]);

  const loadProduct = async () => {
    try {
      setLoading(true);
      console.log("Carregando produto:", productId);
      const productData = await getProductById(productId);
      console.log("Produto carregado:", productData);
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

  const handleAddToCart = () => {
    // TODO: Implementar adição ao carrinho quando o endpoint estiver disponível
    Toast.show({
      type: "success",
      text1: "Produto adicionado!",
      text2: `${quantity}x ${product.product_name} adicionado ao carrinho`,
      visibilityTime: 3000,
    });

    Alert.alert(
      "Carrinho",
      `${quantity}x ${product.product_name} foi adicionado ao carrinho!`,
      [{ text: "OK" }]
    );
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

  return (
    <View style={styles.container}>
      {/* Seção do nome do produto com seta de voltar */}

      <ScrollView style={styles.scrollContainer}>
        <View style={styles.productTitleSection}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <MaterialIcons name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.productName} numberOfLines={1}>
            {product?.product_name || "Carregando..."}
          </Text>
        </View>
        {/* Carrossel de imagens */}
        <ImageCarousel />

        {/* Informações do produto */}
        <View style={styles.productInfo}>
          {/* Categoria */}
          <View style={styles.categoryContainer}>
            <Text style={styles.categoryLabel}>
              {formatCategory(product.product_category)}
            </Text>
          </View>

          {/* Nome do produto */}
          {/*<Text style={styles.productName}>{product.product_name}</Text>*/}

          {/* Preço */}
          <Text style={styles.productPrice}>
            {formatPrice(product.product_price)}
          </Text>

          {/* Status do estoque */}
          <View style={styles.stockContainer}>
            <MaterialIcons
              name="inventory"
              size={18}
              color={inStock ? "#4CAF50" : "#f44336"}
            />
            <Text
              style={[
                styles.stockText,
                { color: inStock ? "#4CAF50" : "#f44336" },
              ]}
            >
              {inStock
                ? `${product.product_quantity} unidades em estoque`
                : "Produto esgotado"}
            </Text>
          </View>

          {/* Seletor de quantidade */}
          {inStock && (
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
                  <MaterialIcons name="remove" size={20} color="#000" />
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
                  <MaterialIcons name="add" size={20} color="#000" />
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Botão de adicionar ao carrinho */}
          <TouchableOpacity
            style={[
              styles.addToCartButton,
              !inStock && styles.addToCartButtonDisabled,
            ]}
            onPress={handleAddToCart}
            disabled={!inStock}
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
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  productTitleSection: {
    flexDirection: "row",
    display: "flex",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    backgroundColor: "white",
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  productTitleText: {
    flex: 1,
    fontSize: 18,
    fontWeight: "600",
    color: theme.colors.foreground,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: theme.colors.background,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: theme.colors.muted,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  errorText: {
    fontSize: 16,
    color: theme.colors.muted,
    marginTop: 16,
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
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
  },
  carouselImage: {
    width: screenWidth,
    height: screenHeight * 0.4,
  },
  noImageContainer: {
    width: screenWidth,
    height: screenHeight * 0.4,
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
  },
  noImageText: {
    marginTop: 16,
    fontSize: 16,
    color: "#999",
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
    backgroundColor: "rgba(0, 0, 0, 0.6)",
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
    marginBottom: 12,
  },
  categoryLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: theme.colors.primary,
    textTransform: "uppercase",
  },
  productName: {
    fontSize: 20,
    fontWeight: 500,
    color: theme.colors.foreground,
    marginBottom: 0,
    lineHeight: 32,
  },
  productPrice: {
    fontSize: 28,
    fontWeight: "bold",
    color: theme.colors.primary,
    marginBottom: 16,
  },
  stockContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },
  stockText: {
    fontSize: 16,
    fontWeight: "500",
    marginLeft: 8,
  },
  quantitySection: {
    marginBottom: 32,
  },
  quantityLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: theme.colors.foreground,
    marginBottom: 12,
  },
  quantityContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
    borderRadius: 8,
    padding: 4,
    alignSelf: "flex-start",
  },
  quantityButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 6,
  },
  quantityButtonDisabled: {
    backgroundColor: "#e0e0e0",
  },
  quantityText: {
    fontSize: 18,
    fontWeight: "600",
    marginHorizontal: 20,
    minWidth: 30,
    textAlign: "center",
  },
  addToCartButton: {
    backgroundColor: theme.colors.primary,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 16,
  },
  addToCartButtonDisabled: {
    backgroundColor: "#ccc",
  },
  cartIcon: {
    marginRight: 8,
  },
  addToCartText: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
  },
});
