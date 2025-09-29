import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  StyleSheet,
  Dimensions,
  RefreshControl,
} from "react-native";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { theme } from "../utils/theme";
import {
  getProducts,
  formatPrice,
  formatCategory,
  isInStock,
  getProductMainImage,
} from "../api/products";
import Toast from "react-native-toast-message";

const { width: screenWidth } = Dimensions.get("window");
const ITEM_WIDTH = (screenWidth - 48) / 2; // 2 colunas com 16px de margin

export default function ProductsScreen({ navigation }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      console.log("Carregando produtos...");
      const productsData = await getProducts();
      console.log("Produtos carregados:", productsData.length);
      setProducts(productsData);
    } catch (error) {
      console.error("Erro ao carregar produtos:", error);
      Toast.show({
        type: "error",
        text1: "Erro",
        text2: "Não foi possível carregar os produtos",
        visibilityTime: 4000,
      });
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadProducts();
    setRefreshing(false);
  };

  const navigateToProduct = (productId) => {
    navigation.navigate("SingleProduct", { productId });
  };

  const ProductItem = ({ item }) => {
    const mainImage = getProductMainImage(item);
    const inStock = isInStock(item.product_quantity);

    return (
      <TouchableOpacity
        style={styles.productItem}
        onPress={() => navigateToProduct(item.product_id)}
        activeOpacity={0.7}
      >
        <View style={styles.imageContainer}>
          {mainImage ? (
            <Image source={{ uri: mainImage }} style={styles.productImage} />
          ) : (
            <View style={styles.noImageContainer}>
              <MaterialIcons name="image" size={40} color="#ccc" />
              <Text style={styles.noImageText}>Sem imagem</Text>
            </View>
          )}

          {/* Badge de categoria */}
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>
              {formatCategory(item.product_category)}
            </Text>
          </View>

          {/* Badge de estoque */}
          {!inStock && (
            <View style={styles.outOfStockBadge}>
              <Text style={styles.outOfStockText}>Esgotado</Text>
            </View>
          )}
        </View>

        <View style={styles.productInfo}>
          <Text style={styles.productName} numberOfLines={2}>
            {item.product_name || "Produto sem nome"}
          </Text>

          <View style={styles.priceContainer}>
            <Text style={styles.productPrice}>
              {formatPrice(item.product_price)}
            </Text>
          </View>

          <View style={styles.stockContainer}>
            <MaterialIcons
              name="inventory"
              size={14}
              color={inStock ? "#4CAF50" : "#f44336"}
            />
            <Text
              style={[
                styles.stockText,
                { color: inStock ? "#4CAF50" : "#f44336" },
              ]}
            >
              {inStock ? `${item.product_quantity} em estoque` : "Sem estoque"}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderHeader = () => (
    <View style={styles.titleSection}>
      <Text style={styles.sectionTitle}>Nossos Produtos</Text>
      <Text style={styles.sectionSubtitle}>
        Encontre os melhores produtos para sua cozinha
      </Text>
    </View>
  );

  const renderEmpty = () => {
    if (loading) return null;

    return (
      <View style={styles.emptyContainer}>
        <MaterialIcons name="store" size={64} color="#ccc" />
        <Text style={styles.emptyText}>Nenhum produto encontrado</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadProducts}>
          <Text style={styles.retryButtonText}>Tentar novamente</Text>
        </TouchableOpacity>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Carregando produtos...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={products}
        keyExtractor={(item) => item.product_id.toString()}
        renderItem={ProductItem}
        ListHeaderComponent={renderHeader}
        numColumns={2}
        columnWrapperStyle={styles.row}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[theme.colors.primary]}
          />
        }
        ListEmptyComponent={renderEmpty}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={
          products.length === 0
            ? styles.emptyListContainer
            : styles.listContainer
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  titleSection: {
    paddingHorizontal: 16,
    paddingVertical: 20,
    backgroundColor: theme.colors.background,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: theme.colors.foreground,
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 16,
    color: "#666",
    fontWeight: "400",
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
  listContainer: {
    paddingBottom: 20,
  },
  row: {
    justifyContent: "space-between",
    paddingHorizontal: 16,
  },
  productItem: {
    width: ITEM_WIDTH,
    backgroundColor: "#ffffff",
    borderRadius: 12,
    marginBottom: 16,
    // iOS Shadow
    shadowColor: "#000000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    // Android Shadow
    elevation: 8,
    overflow: "visible",
    // Garante que o background seja renderizado para a sombra funcionar no iOS
    borderWidth: 0,
  },
  imageContainer: {
    position: "relative",
    width: "100%",
    height: ITEM_WIDTH * 0.8,
  },
  productImage: {
    width: "100%",
    height: "100%",
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    backgroundColor: "#f0f0f0",
  },
  noImageContainer: {
    width: "100%",
    height: "100%",
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
  },
  noImageText: {
    marginTop: 8,
    fontSize: 12,
    color: "#999",
  },
  categoryBadge: {
    position: "absolute",
    top: 8,
    left: 8,
    backgroundColor: theme.colors.primary,
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  categoryText: {
    color: "white",
    fontSize: 10,
    fontWeight: "600",
  },
  outOfStockBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "#f44336",
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  outOfStockText: {
    color: "white",
    fontSize: 10,
    fontWeight: "600",
  },
  productInfo: {
    padding: 12,
  },
  productName: {
    fontSize: 14,
    fontWeight: "600",
    color: theme.colors.foreground,
    marginBottom: 8,
    lineHeight: 18,
  },
  priceContainer: {
    marginBottom: 8,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: "bold",
    color: theme.colors.primary,
  },
  stockContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  stockText: {
    fontSize: 12,
    fontWeight: "500",
    marginLeft: 4,
  },
  emptyContainer: {
    alignItems: "center",
    padding: 32,
  },
  emptyListContainer: {
    flexGrow: 1,
    justifyContent: "center",
  },
  emptyText: {
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
});
