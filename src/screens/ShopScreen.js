import React, { useState } from "react";
import CoinIcon from "../components/ui/CoinIcon";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Dimensions,
  FlatList,
  Modal,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { theme } from "../utils/theme";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import SansCoinsDisplay from "../components/ui/SansCoinsDisplay";
import Chip from "../components/ui/Chip";
import {
  currentUser,
  shopCategories,
  shopProducts,
} from "../data/mockData";

const { width } = Dimensions.get("window");
const numColumns = theme.isTablet ? 3 : 2;
const padding = theme.spacing.lg * 2;
const gap = theme.spacing.md;
const PRODUCT_WIDTH = (width - padding - (gap * (numColumns - 1))) / numColumns;

const ShopScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const [selectedCategory, setSelectedCategory] = useState("1");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);
  const [showProductModal, setShowProductModal] = useState(false);
  const [purchaseSuccess, setPurchaseSuccess] = useState(false);

  const filteredProducts = selectedCategory === "1"
    ? shopProducts
    : shopProducts.filter((p) => p.categoryId === selectedCategory);

  const openProduct = (product) => {
    setSelectedProduct(product);
    setSelectedSize(product.sizes?.[0] || null);
    setSelectedColor(product.colors?.[0] || null);
    setShowProductModal(true);
    setPurchaseSuccess(false);
  };

  const handlePurchase = () => {
    setPurchaseSuccess(true);
    setTimeout(() => {
      setShowProductModal(false);
      setPurchaseSuccess(false);
    }, 2000);
  };

  const renderCategory = ({ item }) => (
    <Chip
      label={item.name}
      selected={selectedCategory === item.id}
      onPress={() => setSelectedCategory(item.id)}
      style={styles.categoryChip}
    />
  );

  const renderProduct = ({ item }) => (
    <TouchableOpacity
      style={styles.productCard}
      onPress={() => openProduct(item)}
      activeOpacity={0.9}
    >
      <View style={styles.productImageContainer}>
        <Image source={{ uri: item.image }} style={styles.productImage} />
        {item.isNew && (
          <View style={styles.newBadge}>
            <Text style={styles.newBadgeText}>NOVO</Text>
          </View>
        )}
        {item.exclusive && (
          <View style={styles.exclusiveBadge}>
            <View style={{flexDirection: 'row', alignItems: 'center'}}><CoinIcon size={12} /><Text style={[styles.exclusiveBadgeText, {marginLeft: 4}]}>EXCLUSIVO</Text></View>
          </View>
        )}
      </View>
      <View style={styles.productInfo}>
        <Text style={styles.productName} numberOfLines={2}>{item.name}</Text>
        {item.price ? (
          <Text style={styles.productPrice}>R$ {item.price.toFixed(2)}</Text>
        ) : (
          <SansCoinsDisplay amount={item.priceCoins} size="md" />
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Shop 🛍️</Text>
          <Text style={styles.subtitle}>Lifestyle Sans Company</Text>
        </View>
        <Card style={styles.coinsCard} padding="sm">
          <SansCoinsDisplay amount={currentUser.sansCoins} size="md" />
        </Card>
      </View>

      {/* Categories */}
      <View style={styles.categoriesWrapper}>
        <FlatList
          data={shopCategories}
          renderItem={renderCategory}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesList}
          style={styles.categoriesContainer}
        />
      </View>

      {/* Products Grid (Pinterest Style) */}
      <FlatList
        data={filteredProducts}
        renderItem={renderProduct}
        keyExtractor={(item) => item.id}
        numColumns={numColumns}
        key={numColumns}
        columnWrapperStyle={styles.productRow}
        contentContainerStyle={styles.productsList}
        showsVerticalScrollIndicator={false}
      />

      {/* Product Detail Modal */}
      <Modal
        visible={showProductModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowProductModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { paddingBottom: insets.bottom + 24 }]}>
            {/* Close Button */}
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowProductModal(false)}
            >
              <MaterialIcons name="close" size={24} color={theme.colors.textSecondary} />
            </TouchableOpacity>

            {purchaseSuccess ? (
              <View style={styles.successContainer}>
                <View style={styles.successIcon}>
                  <MaterialIcons name="check" size={48} color="#FFF" />
                </View>
                <Text style={styles.successTitle}>Compra Realizada!</Text>
                <Text style={styles.successSubtitle}>
                  Você receberá o pedido em breve
                </Text>
              </View>
            ) : selectedProduct && (
              <ScrollView showsVerticalScrollIndicator={false}>
                {/* Product Image */}
                <Image
                  source={{ uri: selectedProduct.image }}
                  style={styles.modalImage}
                  resizeMode="cover"
                />

                {/* Product Info */}
                <View style={styles.modalInfo}>
                  {selectedProduct.exclusive && (
                    <View style={styles.exclusiveTag}>
                      <Text style={styles.exclusiveTagText}>
                        Produto Exclusivo - Apenas com Sans Coins
                      </Text>
                    </View>
                  )}

                  <Text style={styles.modalProductName}>{selectedProduct.name}</Text>
                  <Text style={styles.modalDescription}>
                    {selectedProduct.description}
                  </Text>

                  {/* Price */}
                  <View style={styles.priceContainer}>
                    {selectedProduct.price ? (
                      <>
                        <Text style={styles.modalPrice}>
                          R$ {selectedProduct.price.toFixed(2)}
                        </Text>
                        <Text style={styles.installments}>
                          ou 3x de R$ {(selectedProduct.price / 3).toFixed(2)}
                        </Text>
                      </>
                    ) : (
                      <View style={styles.coinsOnlyPrice}>
                        <Text style={styles.coinsLabel}>Preço:</Text>
                        <SansCoinsDisplay amount={selectedProduct.priceCoins} size="lg" />
                      </View>
                    )}
                  </View>

                  {/* Sizes */}
                  {selectedProduct.sizes && (
                    <View style={styles.optionSection}>
                      <Text style={styles.optionLabel}>Tamanho</Text>
                      <View style={styles.optionRow}>
                        {selectedProduct.sizes.map((size) => (
                          <TouchableOpacity
                            key={size}
                            style={[
                              styles.sizeOption,
                              selectedSize === size && styles.sizeOptionSelected,
                            ]}
                            onPress={() => setSelectedSize(size)}
                          >
                            <Text
                              style={[
                                styles.sizeText,
                                selectedSize === size && styles.sizeTextSelected,
                              ]}
                            >
                              {size}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    </View>
                  )}

                  {/* Colors */}
                  {selectedProduct.colors && (
                    <View style={styles.optionSection}>
                      <Text style={styles.optionLabel}>Cor</Text>
                      <View style={styles.optionRow}>
                        {selectedProduct.colors.map((color) => (
                          <Chip
                            key={color}
                            label={color}
                            selected={selectedColor === color}
                            onPress={() => setSelectedColor(color)}
                            size="sm"
                            style={styles.colorChip}
                          />
                        ))}
                      </View>
                    </View>
                  )}

                  {/* Buy Button */}
                  <View style={styles.buySection}>
                    {selectedProduct.exclusive ? (
                      currentUser.sansCoins >= selectedProduct.priceCoins ? (
                        <Button
                          title="Comprar com Sans Coins"
                          onPress={handlePurchase}
                          fullWidth
                          size="lg"
                          icon={<CoinIcon size={18} />}
                        />
                      ) : (
                        <View style={styles.insufficientCoins}>
                          <Text style={styles.insufficientText}>
                            Você precisa de mais {selectedProduct.priceCoins - currentUser.sansCoins} Sans Coins
                          </Text>
                          <Button
                            title="Jogar para Ganhar"
                            onPress={() => {
                              setShowProductModal(false);
                              navigation.navigate("Play");
                            }}
                            variant="outline"
                            fullWidth
                          />
                        </View>
                      )
                    ) : (
                      <>
                        <Button
                          title="Comprar Agora"
                          onPress={handlePurchase}
                          fullWidth
                          size="lg"
                          icon={<MaterialIcons name="shopping-bag" size={20} color="#FFF" />}
                        />
                        <TouchableOpacity style={styles.addToCartButton}>
                          <MaterialIcons name="add-shopping-cart" size={20} color={theme.colors.primary} />
                          <Text style={styles.addToCartText}>Adicionar ao Carrinho</Text>
                        </TouchableOpacity>
                      </>
                    )}
                  </View>

                  {/* Delivery Info */}
                  <View style={styles.deliveryInfo}>
                    <MaterialIcons name="local-shipping" size={20} color={theme.colors.success} />
                    <Text style={styles.deliveryText}>
                      Frete grátis para pedidos acima de R$ 150
                    </Text>
                  </View>
                </View>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  title: {
    fontSize: theme.fontSizes["4xl"],
    fontWeight: "700",
    color: theme.colors.textPrimary,
  },
  subtitle: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.textMuted,
    marginTop: 2,
  },
  coinsCard: {
    backgroundColor: theme.colors.coinsBackground,
  },
  // Categories
  categoriesWrapper: {
    paddingVertical: 12,
  },
  categoriesContainer: {
    flexGrow: 0,
  },
  categoriesList: {
    paddingHorizontal: 24,
    alignItems: "center",
  },
  categoryChip: {
    marginRight: 10,
  },
  // Products Grid
  productsList: {
    padding: 24,
    paddingBottom: 100,
  },
  productRow: {
    justifyContent: "space-between",
  },
  productCard: {
    width: PRODUCT_WIDTH,
    marginBottom: 20,
    backgroundColor: "#FFFFFF",
    borderRadius: theme.borderRadius.lg,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: theme.colors.border,
    elevation: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
  },
  productImageContainer: {
    position: "relative",
  },
  productImage: {
    width: "100%",
    height: PRODUCT_WIDTH * 1.25,
    backgroundColor: theme.colors.secondary,
  },
  newBadge: {
    position: "absolute",
    top: 10,
    left: 10,
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  newBadgeText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#FFF",
  },
  exclusiveBadge: {
    position: "absolute",
    top: 10,
    left: 10,
    backgroundColor: theme.colors.coinsBackground,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: theme.colors.coins,
  },
  exclusiveBadgeText: {
    fontSize: 10,
    fontWeight: "700",
    color: theme.colors.textPrimary,
  },
  productInfo: {
    padding: 12,
  },
  productName: {
    fontSize: theme.fontSizes.base,
    fontWeight: "600",
    color: theme.colors.textPrimary,
    marginBottom: 6,
  },
  productPrice: {
    fontSize: theme.fontSizes.lg,
    fontWeight: "700",
    color: theme.colors.primary,
  },
  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: theme.colors.overlay,
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: theme.colors.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "90%",
  },
  closeButton: {
    position: "absolute",
    top: 16,
    right: 16,
    zIndex: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.background,
    alignItems: "center",
    justifyContent: "center",
    ...theme.shadows.md,
  },
  modalImage: {
    width: "100%",
    height: 350,
    backgroundColor: theme.colors.secondary,
  },
  modalInfo: {
    padding: 24,
  },
  exclusiveTag: {
    backgroundColor: theme.colors.coinsBackground,
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: theme.colors.coins,
  },
  exclusiveTagText: {
    fontSize: 13,
    fontWeight: "600",
    color: theme.colors.textPrimary,
    textAlign: "center",
  },
  modalProductName: {
    fontSize: 24,
    fontWeight: "700",
    color: theme.colors.textPrimary,
  },
  modalDescription: {
    fontSize: 15,
    color: theme.colors.textSecondary,
    marginTop: 8,
    lineHeight: 22,
  },
  priceContainer: {
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: theme.colors.borderLight,
  },
  modalPrice: {
    fontSize: 28,
    fontWeight: "700",
    color: theme.colors.textPrimary,
  },
  installments: {
    fontSize: 14,
    color: theme.colors.textMuted,
    marginTop: 4,
  },
  coinsOnlyPrice: {
    flexDirection: "row",
    alignItems: "center",
  },
  coinsLabel: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    marginRight: 8,
  },
  // Options
  optionSection: {
    marginTop: 24,
  },
  optionLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: theme.colors.textPrimary,
    marginBottom: 12,
  },
  optionRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  sizeOption: {
    width: 48,
    height: 48,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: theme.colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  sizeOptionSelected: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primaryLight + "15",
  },
  sizeText: {
    fontSize: 14,
    fontWeight: "600",
    color: theme.colors.textSecondary,
  },
  sizeTextSelected: {
    color: theme.colors.primary,
  },
  colorChip: {
    marginRight: 0,
  },
  // Buy Section
  buySection: {
    marginTop: 32,
  },
  addToCartButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    marginTop: 12,
  },
  addToCartText: {
    fontSize: 15,
    fontWeight: "600",
    color: theme.colors.primary,
    marginLeft: 8,
  },
  insufficientCoins: {
    alignItems: "center",
  },
  insufficientText: {
    fontSize: 14,
    color: theme.colors.textMuted,
    marginBottom: 16,
    textAlign: "center",
  },
  // Delivery
  deliveryInfo: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.successLight,
    padding: 16,
    borderRadius: 12,
    marginTop: 24,
  },
  deliveryText: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    marginLeft: 12,
    flex: 1,
  },
  // Success
  successContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 80,
  },
  successIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: theme.colors.success,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: theme.colors.textPrimary,
  },
  successSubtitle: {
    fontSize: 15,
    color: theme.colors.textMuted,
    marginTop: 8,
  },
});

export default ShopScreen;
