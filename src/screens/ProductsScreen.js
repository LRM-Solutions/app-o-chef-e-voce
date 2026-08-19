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
import { useTheme } from "../utils/ThemeContext";
import { theme as defaultTheme } from "../utils/theme";
import {
  getProducts,
  formatPrice,
  formatCategory,
  isInStock,
  getProductMainImage,
} from "../api/products";
import Toast from "react-native-toast-message";
import Skeleton from "../components/ui/Skeleton";

const { width: screenWidth } = Dimensions.get("window");
const numColumns = defaultTheme.isTablet ? 3 : 2;
const padding = defaultTheme.spacing.md * 2;
const gap = defaultTheme.spacing.md;
const ITEM_WIDTH = (screenWidth - padding - (gap * (numColumns - 1))) / numColumns;

export default function ProductsScreen({ navigation }) {
  const { theme, themeMode } = useTheme();
  const styles = getStyles(theme);

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const productsData = await getProducts();
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
              <MaterialIcons name="image" size={40} color={theme.colors.textMuted} />
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
        Encontre os melhores produtos da barbearia
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
      <View style={styles.container}>
        {renderHeader()}
        <View style={styles.skeletonGrid}>
          {[1, 2, 3, 4, 5, 6].map((key) => (
            <View key={key} style={styles.productItem}>
              <Skeleton width="100%" height={ITEM_WIDTH * 0.8} style={{ borderTopLeftRadius: 12, borderTopRightRadius: 12, borderRadius: 0 }} />
              <View style={styles.productInfo}>
                <Skeleton width="80%" height={16} style={{ marginBottom: 8 }} />
                <Skeleton width="50%" height={16} style={{ marginBottom: 8 }} />
                <Skeleton width="40%" height={20} style={{ marginBottom: 8 }} />
                <Skeleton width="60%" height={14} />
              </View>
            </View>
          ))}
        </View>
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
        numColumns={numColumns}
        key={numColumns} // Força re-render se mudar o número de colunas
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

const getStyles = (theme) => StyleSheet.create({
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
    fontSize: theme.fontSizes["3xl"],
    fontWeight: "bold",
    color: theme.colors.foreground,
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: theme.fontSizes.base,
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
    color: theme.colors.textMuted,
  },
  listContainer: {
    paddingBottom: 20,
  },
  row: {
    justifyContent: "space-between",
    paddingHorizontal: 16,
  },
  skeletonGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    paddingHorizontal: 16,
  },
  productItem: {
    width: ITEM_WIDTH,
    backgroundColor: theme.colors.card,
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
    backgroundColor: theme.colors.backgroundSecondary,
  },
  noImageContainer: {
    width: "100%",
    height: "100%",
    backgroundColor: theme.colors.backgroundSecondary,
    justifyContent: "center",
    alignItems: "center",
  },
  noImageText: {
    marginTop: 8,
    fontSize: 12,
    color: theme.colors.textMuted,
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
    fontSize: theme.fontSizes.base,
    fontWeight: "600",
    color: theme.colors.foreground,
    marginBottom: 8,
    lineHeight: theme.fontSizes.base * 1.2,
  },
  priceContainer: {
    marginBottom: 8,
  },
  productPrice: {
    fontSize: theme.fontSizes.lg,
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
    color: theme.colors.textMuted,
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
