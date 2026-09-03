import React, { useState, useEffect, useMemo, useCallback } from "react";
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
  const isDarkMode = theme?.isDarkMode ?? (themeMode === "dark");
  const isDark = isDarkMode;
  const { width: screenWidth } = useWindowDimensions();
  const ITEM_WIDTH = (screenWidth - padding - (gap * (numColumns - 1))) / numColumns;
  const styles = getStyles(theme, ITEM_WIDTH, isDarkMode);

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState(["Todos"]);
  const [selectedCategory, setSelectedCategory] = useState("Todos");
  
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async (isPull = false) => {
    try {
      if (!isPull) {
        setLoading(true);
      }
      const [productsData, categoriesData] = await Promise.all([
        getProducts(),
        getCategories(),
      ]);
      setProducts(productsData || []);
      setCategories(["Todos", ...(categoriesData || [])]);
    } catch (error) {
      console.error("Erro ao carregar dados da loja:", error);
      Toast.show({
        type: "error",
        text1: "Erro",
        text2: "Não foi possível carregar a loja",
        visibilityTime: 4000,
      });
    } finally {
      if (!isPull) {
        setLoading(false);
      }
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      const [productsData, categoriesData] = await Promise.all([
        getProducts(),
        getCategories(),
      ]);
      if (productsData) setProducts(productsData);
      if (categoriesData) setCategories(["Todos", ...categoriesData]);
    } catch (error) {
      console.error("Erro ao carregar dados da loja:", error);
    } finally {
      setRefreshing(false);
    }
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
    const hasPromo =
      item.promotional_price &&
      Number(item.promotional_price) > 0 &&
      Number(item.promotional_price) < Number(item.product_price);
    const discountPercent = hasPromo
      ? Math.round(
          ((Number(item.product_price) - Number(item.promotional_price)) /
            Number(item.product_price)) *
            100
        )
      : 0;

    return (
      <TouchableOpacity
        style={styles.productItem}
        onPress={() => navigateToProduct(item.product_id)}
        activeOpacity={0.85}
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

          {/* Promo Badge Inside Image */}
          {hasPromo && (
            <View style={styles.promoBadge}>
              <MaterialIcons name="local-fire-department" size={12} color="#FFFFFF" />
              <Text style={styles.promoBadgeText}>{discountPercent}% OFF</Text>
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

          <View style={styles.priceContainer}>
            {hasPromo ? (
              <View>
                <Text style={styles.dePriceText}>
                  De {formatPrice(item.product_price)}
                </Text>
                <View style={styles.porRow}>
                  <Text style={styles.porLabel}>Por </Text>
                  <Text style={styles.productPricePromo}>
                    {formatPrice(item.promotional_price)}
                  </Text>
                </View>
              </View>
            ) : (
              <View>
                <Text style={styles.regularPriceLabel}>Por</Text>
                <Text style={styles.productPrice}>
                  {formatPrice(item.product_price)}
                </Text>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderHeader = () => (
    <View style={styles.headerContainer}>
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
          <MaterialIcons
            name="inventory-2"
            size={36}
            color={theme.colors.primary || "#7C4DFF"}
          />
        </View>
        <Text style={styles.emptyText}>
          Nenhum produto {selectedCategory !== "Todos" ? `em ${selectedCategory}` : "encontrado"}
        </Text>
      </View>
    );
  };

  if (loading && products.length === 0) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['bottom']}>
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
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      {renderHeader()}
      <FlatList
        data={filteredProducts}
        keyExtractor={(item, index) => item.product_id ? item.product_id.toString() : index.toString()}
        renderItem={ProductItem}
        numColumns={numColumns}
        key={numColumns} // Força re-render se mudar o número de colunas
        columnWrapperStyle={filteredProducts.length > 0 ? styles.row : undefined}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[theme.colors.primary || "#7C4DFF"]}
            tintColor={theme.colors.primary || "#7C4DFF"}
          />
        }
        alwaysBounceVertical={true}
        bounces={true}
        overScrollMode="always"
        ListEmptyComponent={renderEmpty}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.listContainer,
          filteredProducts.length === 0 && styles.emptyListContainer,
          { flexGrow: 1 },
        ]}
      />
    </SafeAreaView>
  );
}

const getStyles = (theme, itemWidth, isDark) => StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background || (isDark ? "#0F0F0F" : "#FFFFFF"),
  },
  headerContainer: {
    backgroundColor: theme.colors.background || (isDark ? "#0F0F0F" : "#FFFFFF"),
    paddingBottom: 2,
  },
  categoriesWrapper: {
    marginTop: 0,
    paddingTop: 4,
    marginBottom: 10,
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
    backgroundColor: isDark ? "rgba(255,255,255,0.06)" : theme.colors.backgroundSecondary || "#F2F2F7",
    borderWidth: 1,
    borderColor: isDark ? "rgba(255,255,255,0.12)" : theme.colors.border || "#E5E5EA",
  },
  categoryChipSelected: {
    backgroundColor: theme.colors.primary || "#7C4DFF",
    borderColor: theme.colors.primary || "#7C4DFF",
    shadowColor: theme.colors.primary || "#7C4DFF",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: isDark ? 0.4 : 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  categoryChipText: {
    fontSize: theme.fontSizes?.sm || 13,
    fontWeight: "600",
    color: isDark ? "#D0D0D5" : "#4A4A4A",
  },
  categoryChipTextSelected: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
  listContainer: {
    paddingBottom: 40,
    flexGrow: 1,
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
    backgroundColor: isDark ? "#1A1A1E" : "#FFFFFF",
    borderRadius: 16,
    shadowColor: isDark ? "#000" : "rgba(0,0,0,0.1)",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: isDark ? 0.35 : 0.08,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)",
    overflow: "hidden",
  },
  imageContainer: {
    position: "relative",
    width: "100%",
    aspectRatio: 1,
    backgroundColor: isDark ? "#121214" : "#F7F7F9",
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
    backgroundColor: isDark ? "#16161A" : "#F0F0F4",
  },
  categoryBadge: {
    position: "absolute",
    bottom: 8,
    left: 8,
    backgroundColor: "rgba(0,0,0,0.7)",
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  categoryText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  promoBadge: {
    position: "absolute",
    top: 8,
    left: 8,
    backgroundColor: "#E53935",
    borderRadius: 8,
    paddingHorizontal: 7,
    paddingVertical: 3,
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    shadowColor: "#E53935",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 4,
  },
  promoBadgeText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.2,
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
    padding: 12,
  },
  productName: {
    fontSize: 13,
    fontWeight: "600",
    color: isDark ? "#F2F2F5" : "#1A1A1A",
    marginBottom: 8,
    lineHeight: 18,
    minHeight: 36,
  },
  priceContainer: {
    justifyContent: "flex-end",
  },
  dePriceText: {
    fontSize: 11,
    fontWeight: "600",
    color: isDark ? "#8E8E93" : "#8E8E93",
    textDecorationLine: "line-through",
    marginBottom: 1,
  },
  porRow: {
    flexDirection: "row",
    alignItems: "baseline",
  },
  porLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: isDark ? "#A0A0A5" : "#666666",
    marginRight: 2,
  },
  productPricePromo: {
    fontSize: 16,
    fontWeight: "900",
    color: isDark ? "#FF5252" : "#D32F2F",
  },
  regularPriceLabel: {
    fontSize: 10,
    fontWeight: "600",
    color: isDark ? "#8E8E93" : "#8E8E93",
    textTransform: "uppercase",
    letterSpacing: 0.3,
    marginBottom: 1,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: "800",
    color: theme.colors.primary || "#7C4DFF",
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
    backgroundColor: isDark ? "rgba(255,255,255,0.06)" : theme.colors.backgroundSecondary || "#F5F7FA",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  emptyListContainer: {
    flexGrow: 1,
  },
  emptyText: {
    fontSize: 15,
    fontWeight: "500",
    color: isDark ? "#A0A0A5" : theme.colors.muted || "#6B7280",
    textAlign: "center",
    maxWidth: 260,
    lineHeight: 22,
  },
});
