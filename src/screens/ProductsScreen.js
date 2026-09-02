import React, { useState, useEffect, useMemo } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  StyleSheet,
  useWindowDimensions,
  RefreshControl,
  ScrollView,
} from "react-native";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { useTheme } from "../utils/ThemeContext";
import { theme as defaultTheme } from "../utils/theme";
import {
  getProducts,
  getCategories,
  formatPrice,
  isInStock,
  getProductMainImage,
} from "../api/products";
import Toast from "react-native-toast-message";
import Skeleton from "../components/ui/Skeleton";
import { SafeAreaView } from "react-native-safe-area-context";

const numColumns = defaultTheme.isTablet ? 3 : 2;
const padding = 32; // 16 * 2
const gap = 16;

export default function ProductsScreen({ navigation }) {
  const { theme, themeMode } = useTheme();
  const { width: screenWidth } = useWindowDimensions();
  const ITEM_WIDTH = (screenWidth - padding - (gap * (numColumns - 1))) / numColumns;
  const styles = getStyles(theme, ITEM_WIDTH, themeMode);

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState(["Todos"]);
  const [selectedCategory, setSelectedCategory] = useState("Todos");
  
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [productsData, categoriesData] = await Promise.all([
        getProducts(),
        getCategories(),
      ]);
      setProducts(productsData);
      setCategories(["Todos", ...categoriesData]);
    } catch (error) {
      console.error("Erro ao carregar dados da loja:", error);
      Toast.show({
        type: "error",
        text1: "Erro",
        text2: "Não foi possível carregar a loja",
        visibilityTime: 4000,
      });
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const navigateToProduct = (productId) => {
    navigation.navigate("SingleProduct", { productId });
  };

  // Filter products locally based on selectedCategory
  const filteredProducts = useMemo(() => {
    if (selectedCategory === "Todos") return products;
    return products.filter((p) => p.product_category === selectedCategory);
  }, [products, selectedCategory]);

  const ProductItem = ({ item }) => {
    const mainImage = getProductMainImage(item);
    const inStock = isInStock(item.product_quantity);

    return (
      <TouchableOpacity
        style={styles.productItem}
        onPress={() => navigateToProduct(item.product_id)}
        activeOpacity={0.8}
      >
        <View style={styles.imageContainer}>
          {mainImage ? (
            <Image source={{ uri: mainImage }} style={styles.productImage} />
          ) : (
            <View style={styles.noImageContainer}>
              <MaterialIcons name="image" size={32} color={theme.colors.textMuted} />
            </View>
          )}

          {/* Category Badge Inside Image */}
          {item.product_category && item.product_category !== "Outros" && (
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryText}>{item.product_category}</Text>
            </View>
          )}

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

          <View style={styles.priceRow}>
            <Text style={styles.productPrice}>
              {formatPrice(item.product_price)}
            </Text>
            <View style={styles.stockStatus}>
               <View style={[styles.stockIndicator, { backgroundColor: inStock ? "#4CAF50" : "#f44336" }]} />
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <View style={styles.logoSection}>
        {theme.logoUrl ? (
          <Image
            source={{ uri: theme.logoUrl }}
            style={styles.headerLogo}
            resizeMode="contain"
          />
        ) : (
          <Text style={styles.headerTitle}>Loja</Text>
        )}
        <Text style={styles.sectionSubtitle}>
          Encontre os melhores produtos da barbearia
        </Text>
      </View>

      <View style={styles.categoriesWrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesContainer}
        >
          {categories.map((cat, index) => {
            const isSelected = selectedCategory === cat;
            return (
              <TouchableOpacity
                key={index}
                style={[
                  styles.categoryChip,
                  isSelected && styles.categoryChipSelected,
                ]}
                onPress={() => setSelectedCategory(cat)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.categoryChipText,
                    isSelected && styles.categoryChipTextSelected,
                  ]}
                >
                  {cat}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>
    </View>
  );

  const renderEmpty = () => {
    if (loading) return null;

    return (
      <View style={styles.emptyContainer}>
        <View style={styles.emptyIconCircle}>
          <MaterialIcons name="inventory-2" size={40} color={theme.colors.primary} />
        </View>
        <Text style={styles.emptyText}>
          Nenhum produto {selectedCategory !== "Todos" ? `em ${selectedCategory}` : "encontrado"}
        </Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadData}>
          <Text style={styles.retryButtonText}>Recarregar</Text>
        </TouchableOpacity>
      </View>
    );
  };

  if (loading && products.length === 0) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {renderHeader()}
        <View style={styles.skeletonGrid}>
          {[1, 2, 3, 4, 5, 6].map((key) => (
            <View key={key} style={styles.productItem}>
              <Skeleton width="100%" height={ITEM_WIDTH} style={{ borderTopLeftRadius: 16, borderTopRightRadius: 16, borderRadius: 0 }} />
              <View style={styles.productInfo}>
                <Skeleton width="80%" height={16} style={{ marginBottom: 12 }} />
                <Skeleton width="40%" height={20} />
              </View>
            </View>
          ))}
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <FlatList
        data={filteredProducts}
        keyExtractor={(item, index) => item.product_id ? item.product_id.toString() : index.toString()}
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
            tintColor={theme.colors.primary}
          />
        }
        ListEmptyComponent={renderEmpty}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={
          filteredProducts.length === 0
            ? styles.emptyListContainer
            : styles.listContainer
        }
      />
    </SafeAreaView>
  );
}

const getStyles = (theme, itemWidth, themeMode) => StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  headerContainer: {
    backgroundColor: theme.colors.background,
    paddingBottom: 8,
  },
  logoSection: {
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  headerLogo: {
    width: 140,
    height: 45,
    marginBottom: 8,
  },
  headerTitle: {
    fontSize: theme.fontSizes["2xl"],
    fontWeight: "bold",
    color: theme.colors.foreground,
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.textMuted,
    textAlign: "center",
  },
  categoriesWrapper: {
    marginTop: 8,
    marginBottom: 16,
  },
  categoriesContainer: {
    paddingHorizontal: 16,
    gap: 10,
    alignItems: "center",
  },
  categoryChip: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: themeMode === "dark" ? "rgba(255,255,255,0.05)" : theme.colors.backgroundSecondary,
    borderWidth: 1,
    borderColor: themeMode === "dark" ? "rgba(255,255,255,0.1)" : theme.colors.border,
  },
  categoryChipSelected: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  categoryChipText: {
    fontSize: theme.fontSizes.sm,
    fontWeight: "600",
    color: theme.colors.foreground,
  },
  categoryChipTextSelected: {
    color: "#FFFFFF",
  },
  listContainer: {
    paddingBottom: 24,
  },
  row: {
    justifyContent: "space-between",
    paddingHorizontal: 16,
    marginBottom: gap,
  },
  skeletonGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    paddingHorizontal: 16,
  },
  productItem: {
    width: itemWidth,
    backgroundColor: themeMode === "dark" ? "#1A1A1A" : "#FFFFFF",
    borderRadius: 16,
    // Modern Drop Shadow
    shadowColor: themeMode === "dark" ? "#000" : "rgba(0,0,0,0.4)",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: themeMode === "dark" ? 0.3 : 0.08,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: themeMode === "dark" ? "rgba(255,255,255,0.05)" : "transparent",
  },
  imageContainer: {
    position: "relative",
    width: "100%",
    height: itemWidth,
    backgroundColor: themeMode === "dark" ? "#222" : "#F8F9FA",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    overflow: "hidden",
  },
  productImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  noImageContainer: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  categoryBadge: {
    position: "absolute",
    bottom: 8,
    left: 8,
    backgroundColor: "rgba(0,0,0,0.65)",
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backdropFilter: "blur(4px)",
  },
  categoryText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  outOfStockBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "rgba(244,67,54,0.9)",
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  outOfStockText: {
    color: "white",
    fontSize: 10,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  productInfo: {
    padding: 14,
  },
  productName: {
    fontSize: 13,
    fontWeight: "600",
    color: theme.colors.foreground,
    marginBottom: 8,
    lineHeight: 18,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  productPrice: {
    fontSize: 16,
    fontWeight: "800",
    color: theme.colors.primary,
  },
  stockStatus: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: themeMode === "dark" ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.03)",
    justifyContent: "center",
    alignItems: "center",
  },
  stockIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  emptyContainer: {
    alignItems: "center",
    padding: 40,
    marginTop: 20,
  },
  emptyIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: themeMode === "dark" ? "rgba(255,255,255,0.05)" : theme.colors.backgroundSecondary,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  emptyListContainer: {
    flexGrow: 1,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: "500",
    color: theme.colors.foreground,
    marginBottom: 24,
    textAlign: "center",
  },
  retryButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  retryButtonText: {
    color: "white",
    fontSize: 15,
    fontWeight: "700",
  },
});
