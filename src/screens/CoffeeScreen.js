import React, { useState, useEffect } from "react";
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
  coffeeCategories,
  coffeeProducts,
} from "../data/mockData";

const { width } = Dimensions.get("window");
const numColumns = theme.isTablet ? 3 : 2;
const padding = theme.spacing.lg * 2;
const gap = theme.spacing.md;
const PRODUCT_WIDTH = (width - padding - (gap * (numColumns - 1))) / numColumns;

const CoffeeScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const [selectedCategory, setSelectedCategory] = useState("1");
  const [cart, setCart] = useState([]);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [countdown, setCountdown] = useState(15);

  const filteredProducts = selectedCategory === "1"
    ? coffeeProducts
    : coffeeProducts.filter((p) => p.categoryId === selectedCategory);

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const cartTotalCoins = cart.reduce((sum, item) => sum + item.priceCoins * item.quantity, 0);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const addToCart = (product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (productId) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === productId);
      if (existing && existing.quantity > 1) {
        return prev.map((item) =>
          item.id === productId
            ? { ...item, quantity: item.quantity - 1 }
            : item
        );
      }
      return prev.filter((item) => item.id !== productId);
    });
  };

  const placeOrder = () => {
    setOrderPlaced(true);
    setCountdown(15);
  };

  // Countdown timer
  useEffect(() => {
    if (orderPlaced && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [orderPlaced, countdown]);

  const getItemQuantity = (productId) => {
    const item = cart.find((i) => i.id === productId);
    return item ? item.quantity : 0;
  };

  const renderCategory = ({ item }) => (
    <Chip
      label={item.name}
      selected={selectedCategory === item.id}
      onPress={() => setSelectedCategory(item.id)}
      style={styles.categoryChip}
    />
  );

  const renderProduct = ({ item }) => {
    const quantity = getItemQuantity(item.id);

    return (
      <Card style={styles.productCard} padding="none">
        <Image source={{ uri: item.image }} style={styles.productImage} />
        {item.highlight && (
          <View style={styles.productBadge}>
            <Text style={styles.badgeText}>⭐ Destaque</Text>
          </View>
        )}
        <View style={styles.productContent}>
          <Text style={styles.productName}>{item.name}</Text>
          <Text style={styles.productDescription} numberOfLines={2}>
            {item.description}
          </Text>
          
          <View style={styles.priceRow}>
            <View>
              <Text style={styles.productPrice}>R$ {item.price.toFixed(2)}</Text>
              <View style={styles.coinsPrice}>
                <Text style={styles.coinsPriceText}>ou </Text>
                <SansCoinsDisplay amount={item.priceCoins} size="sm" />
              </View>
            </View>
            
            {quantity === 0 ? (
              <TouchableOpacity
                style={styles.addButton}
                onPress={() => addToCart(item)}
              >
                <MaterialIcons name="add" size={24} color="#FFF" />
              </TouchableOpacity>
            ) : (
              <View style={styles.quantityControl}>
                <TouchableOpacity
                  style={styles.quantityButton}
                  onPress={() => removeFromCart(item.id)}
                >
                  <MaterialIcons name="remove" size={18} color={theme.colors.primary} />
                </TouchableOpacity>
                <Text style={styles.quantityText}>{quantity}</Text>
                <TouchableOpacity
                  style={styles.quantityButtonAdd}
                  onPress={() => addToCart(item)}
                >
                  <MaterialIcons name="add" size={18} color="#FFF" />
                </TouchableOpacity>
              </View>
            )}
          </View>

          <View style={styles.prepTimeRow}>
            <MaterialIcons name="access-time" size={14} color={theme.colors.textMuted} />
            <Text style={styles.prepTime}>~{item.prepTime} min</Text>
          </View>
        </View>
      </Card>
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Coffee ☕</Text>
          <Text style={styles.subtitle}>Take Away - Retire no balcão</Text>
        </View>
        <Card style={styles.coinsCard} padding="sm">
          <SansCoinsDisplay amount={currentUser.sansCoins} size="md" />
        </Card>
      </View>

      {/* Categories */}
      <View style={styles.categoriesWrapper}>
        <FlatList
          data={coffeeCategories}
          renderItem={renderCategory}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesList}
          style={styles.categoriesContainer}
        />
      </View>

      {/* Products Grid */}
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

      {/* Cart Bar */}
      {cartCount > 0 && !orderPlaced && (
        <View style={[styles.cartBar, { paddingBottom: insets.bottom + 16 }]}>
          <View style={styles.cartInfo}>
            <View style={styles.cartBadge}>
              <Text style={styles.cartBadgeText}>{cartCount}</Text>
            </View>
            <View>
              <Text style={styles.cartTotal}>R$ {cartTotal.toFixed(2)}</Text>
              <View style={{flexDirection: 'row', alignItems: 'center'}}><Text style={styles.cartCoins}>ou </Text><CoinIcon size={14} /><Text style={styles.cartCoins}> {cartTotalCoins}</Text></View>
            </View>
          </View>
          <Button
            title="Fazer Pedido"
            onPress={() => setShowOrderModal(true)}
            icon={<MaterialIcons name="shopping-cart" size={18} color="#FFF" />}
          />
        </View>
      )}

      {/* Order Placed Bar */}
      {orderPlaced && (
        <View style={[styles.orderBar, { paddingBottom: insets.bottom + 16 }]}>
          <View style={styles.orderInfo}>
            <MaterialIcons name="coffee" size={32} color={theme.colors.primary} />
            <View style={styles.orderDetails}>
              <Text style={styles.orderStatus}>Preparando seu pedido...</Text>
              <Text style={styles.orderTime}>
                Pronto em aproximadamente{" "}
                <Text style={styles.countdown}>{countdown} min</Text>
              </Text>
            </View>
          </View>
          <View style={styles.progressContainer}>
            <View
              style={[
                styles.progressBar,
                { width: `${((15 - countdown) / 15) * 100}%` },
              ]}
            />
          </View>
        </View>
      )}

      {/* Order Modal */}
      <Modal
        visible={showOrderModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowOrderModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { paddingBottom: insets.bottom + 24 }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Confirmar Pedido</Text>
              <TouchableOpacity onPress={() => setShowOrderModal(false)}>
                <MaterialIcons name="close" size={24} color={theme.colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalScroll}>
              {cart.map((item) => (
                <View key={item.id} style={styles.cartItem}>
                  <Image source={{ uri: item.image }} style={styles.cartItemImage} />
                  <View style={styles.cartItemInfo}>
                    <Text style={styles.cartItemName}>{item.name}</Text>
                    <Text style={styles.cartItemPrice}>
                      R$ {(item.price * item.quantity).toFixed(2)}
                    </Text>
                  </View>
                  <Text style={styles.cartItemQuantity}>x{item.quantity}</Text>
                </View>
              ))}
            </ScrollView>

            <View style={styles.modalFooter}>
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Total</Text>
                <View style={styles.totalValues}>
                  <Text style={styles.totalPrice}>R$ {cartTotal.toFixed(2)}</Text>
                  <View style={styles.totalCoins}>
                    <Text style={styles.orText}>ou</Text>
                    <SansCoinsDisplay amount={cartTotalCoins} size="md" />
                  </View>
                </View>
              </View>

              <Button
                title="Retirar no Balcão"
                onPress={() => {
                  setShowOrderModal(false);
                  placeOrder();
                }}
                fullWidth
                size="lg"
                icon={<MaterialIcons name="storefront" size={20} color="#FFF" />}
              />

              <Text style={styles.paymentNote}>
                Pagamento na retirada ou use seus Sans Coins
              </Text>
            </View>
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
  // Products
  productsList: {
    padding: 24,
    paddingBottom: 100,
  },
  productRow: {
    justifyContent: "space-between",
  },
  productCard: {
    width: PRODUCT_WIDTH,
    marginBottom: theme.spacing.md,
    overflow: "hidden",
    backgroundColor: "#FFFFFF",
    borderRadius: theme.borderRadius.lg,
    borderWidth: 2,
    borderColor: theme.colors.borderLight,
    elevation: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
  },
  productImage: {
    width: "100%",
    height: theme.isTablet ? 180 : 130,
    backgroundColor: theme.colors.secondary,
  },
  productBadge: {
    position: "absolute",
    top: 8,
    left: 8,
    backgroundColor: theme.colors.warning,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: "600",
    color: "#FFF",
  },
  productContent: {
    padding: 12,
  },
  productName: {
    fontSize: theme.fontSizes.base,
    fontWeight: "600",
    color: theme.colors.textPrimary,
  },
  productDescription: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.textMuted,
    marginTop: 4,
    lineHeight: theme.fontSizes.sm * 1.3,
  },
  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginTop: 12,
  },
  productPrice: {
    fontSize: theme.fontSizes.lg,
    fontWeight: "700",
    color: theme.colors.textPrimary,
  },
  coinsPrice: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2,
  },
  coinsPriceText: {
    fontSize: 11,
    color: theme.colors.textMuted,
  },
  addButton: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: theme.colors.primary,
    alignItems: "center",
    justifyContent: "center",
    ...theme.shadows.button,
  },
  quantityControl: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.secondary,
    borderRadius: 10,
    overflow: "hidden",
  },
  quantityButton: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  quantityButtonAdd: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.primary,
  },
  quantityText: {
    fontSize: 14,
    fontWeight: "600",
    color: theme.colors.textPrimary,
    paddingHorizontal: 8,
  },
  prepTimeRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },
  prepTime: {
    fontSize: 11,
    color: theme.colors.textMuted,
    marginLeft: 4,
  },
  // Cart Bar
  cartBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: theme.colors.background,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: theme.colors.borderLight,
  },
  cartInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  cartBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: theme.colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  cartBadgeText: {
    color: "#FFF",
    fontSize: 13,
    fontWeight: "700",
  },
  cartTotal: {
    fontSize: 18,
    fontWeight: "700",
    color: theme.colors.textPrimary,
  },
  cartCoins: {
    fontSize: 12,
    color: theme.colors.textMuted,
  },
  // Order Bar
  orderBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: theme.colors.successLight,
    paddingHorizontal: 24,
    paddingTop: 16,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  orderInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  orderDetails: {
    marginLeft: 16,
  },
  orderStatus: {
    fontSize: 16,
    fontWeight: "600",
    color: theme.colors.textPrimary,
  },
  orderTime: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  countdown: {
    fontWeight: "700",
    color: theme.colors.primary,
  },
  progressContainer: {
    height: 4,
    backgroundColor: theme.colors.border,
    borderRadius: 2,
    marginTop: 16,
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    backgroundColor: theme.colors.success,
    borderRadius: 2,
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
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderLight,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: theme.colors.textPrimary,
  },
  modalScroll: {
    maxHeight: 300,
    paddingHorizontal: 24,
  },
  cartItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderLight,
  },
  cartItemImage: {
    width: 50,
    height: 50,
    borderRadius: 10,
    backgroundColor: theme.colors.secondary,
  },
  cartItemInfo: {
    flex: 1,
    marginLeft: 12,
  },
  cartItemName: {
    fontSize: 15,
    fontWeight: "500",
    color: theme.colors.textPrimary,
  },
  cartItemPrice: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  cartItemQuantity: {
    fontSize: 14,
    fontWeight: "600",
    color: theme.colors.textMuted,
  },
  modalFooter: {
    padding: 24,
    borderTopWidth: 1,
    borderTopColor: theme.colors.borderLight,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  totalLabel: {
    fontSize: 16,
    color: theme.colors.textSecondary,
  },
  totalValues: {
    alignItems: "flex-end",
  },
  totalPrice: {
    fontSize: 24,
    fontWeight: "700",
    color: theme.colors.textPrimary,
  },
  totalCoins: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  orText: {
    fontSize: 12,
    color: theme.colors.textMuted,
    marginRight: 4,
  },
  paymentNote: {
    textAlign: "center",
    fontSize: 12,
    color: theme.colors.textMuted,
    marginTop: 12,
  },
});

export default CoffeeScreen;
