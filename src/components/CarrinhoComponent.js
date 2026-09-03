import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  Modal,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { useTheme } from "../utils/ThemeContext";
import { CartService } from "../services/cartService";
import { formatPrice, getProductMainImage } from "../api/products";
import { formatVoucherPrice, getVoucherMainImage } from "../api/vouchers";
import Toast from "react-native-toast-message";
import { SafeAreaView } from "react-native-safe-area-context";

export default function CarrinhoComponent({ visible, onClose, onGoToCart }) {
  const { theme, themeMode } = useTheme();
  const isDark = theme?.isDarkMode ?? (themeMode === "dark");
  const styles = getStyles(theme, isDark);

  const [cartItems, setCartItems] = useState([]);
  const [voucherCartItems, setVoucherCartItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    if (visible) {
      loadCartItems();
    }
  }, [visible]);

  const loadCartItems = async () => {
    try {
      setLoading(true);
      const items = await CartService.getCartItems();
      const voucherItems = await CartService.getVoucherCartItems();
      const grandTotal = await CartService.getGrandTotal();
      setCartItems(items);
      setVoucherCartItems(voucherItems);
      setTotal(grandTotal);
    } catch (error) {
      console.error("Erro ao carregar carrinho:", error);
      Toast.show({
        type: "error",
        text1: "Erro",
        text2: "Não foi possível carregar o carrinho",
        visibilityTime: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateQuantity = async (productId, newQuantity) => {
    try {
      await CartService.updateQuantity(productId, newQuantity);
      await loadCartItems(); // Recarrega os itens
      Toast.show({
        type: "success",
        text1: "Carrinho atualizado",
        visibilityTime: 2000,
      });
    } catch (error) {
      console.error("Erro ao atualizar quantidade:", error);
      Toast.show({
        type: "error",
        text1: "Erro",
        text2: "Não foi possível atualizar a quantidade",
        visibilityTime: 3000,
      });
    }
  };

  const handleRemoveItem = async (productId) => {
    try {
      await CartService.removeFromCart(productId);
      await loadCartItems();
      Toast.show({
        type: "success",
        text1: "Produto removido",
        visibilityTime: 2000,
      });
    } catch (error) {
      console.error("Erro ao remover item:", error);
      Toast.show({
        type: "error",
        text1: "Erro",
        text2: "Não foi possível remover o produto",
        visibilityTime: 3000,
      });
    }
  };

  const handleUpdateVoucherQuantity = async (voucherId, newQuantity) => {
    try {
      await CartService.updateVoucherQuantity(voucherId, newQuantity);
      await loadCartItems();
    } catch (error) {
      console.error("Erro ao atualizar voucher:", error);
      Toast.show({
        type: "error",
        text1: "Erro",
        text2: "Não foi possível atualizar o voucher",
        visibilityTime: 3000,
      });
    }
  };

  const handleRemoveVoucher = async (voucherId) => {
    try {
      await CartService.removeVoucherFromCart(voucherId);
      await loadCartItems();
      Toast.show({
        type: "success",
        text1: "Voucher removido",
        visibilityTime: 2000,
      });
    } catch (error) {
      console.error("Erro ao remover voucher:", error);
      Toast.show({
        type: "error",
        text1: "Erro",
        text2: "Não foi possível remover o voucher",
        visibilityTime: 3000,
      });
    }
  };

  const CartItem = ({ item }) => {
    const mainImage = getProductMainImage(item);

    return (
      <View style={styles.cartItem}>
        <View style={styles.itemImageContainer}>
          {mainImage ? (
            <Image source={{ uri: mainImage }} style={styles.itemImage} />
          ) : (
            <View style={styles.noImageContainer}>
              <MaterialIcons name="image" size={24} color="#ccc" />
            </View>
          )}
        </View>

        <View style={styles.itemInfo}>
          <Text style={styles.itemName} numberOfLines={2}>
            {item.product_name}
          </Text>
          {item.promotional_price &&
          Number(item.promotional_price) > 0 &&
          Number(item.promotional_price) < Number(item.product_price) ? (
            <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
              <Text style={[styles.itemPrice, { color: isDark ? "#FF5252" : "#D32F2F" }]}>
                {formatPrice(item.promotional_price)}
              </Text>
              <Text style={{ fontSize: 12, color: "#8E8E93", textDecorationLine: "line-through" }}>
                {formatPrice(item.product_price)}
              </Text>
            </View>
          ) : (
            <Text style={styles.itemPrice}>
              {formatPrice(item.product_price)}
            </Text>
          )}

          <View style={styles.quantityContainer}>
            <TouchableOpacity
              style={[
                styles.quantityButton,
                item.quantity === 1 && styles.quantityButtonDisabled,
              ]}
              onPress={() =>
                handleUpdateQuantity(item.product_id, item.quantity - 1)
              }
              disabled={item.quantity === 1}
            >
              <MaterialIcons
                name="remove"
                size={16}
                color={item.quantity === 1 ? (isDark ? "#555" : "#AAA") : (isDark ? "#FFF" : "#000")}
              />
            </TouchableOpacity>

            <Text style={styles.quantityText}>{item.quantity}</Text>

            <TouchableOpacity
              style={styles.quantityButton}
              onPress={() =>
                handleUpdateQuantity(item.product_id, item.quantity + 1)
              }
            >
              <MaterialIcons name="add" size={16} color={isDark ? "#FFF" : "#000"} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.itemActions}>
          <Text style={styles.itemTotal}>{formatPrice(item.total_price)}</Text>
          <TouchableOpacity
            style={styles.removeButton}
            onPress={() => handleRemoveItem(item.product_id)}
          >
            <MaterialIcons name="delete" size={18} color="#f44336" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const VoucherItem = ({ item }) => {
    const mainImage = getVoucherMainImage(item);

    return (
      <View style={styles.cartItem}>
        <View style={styles.itemImageContainer}>
          {mainImage ? (
            <Image source={{ uri: mainImage }} style={styles.itemImage} />
          ) : (
            <View style={styles.noImageContainer}>
              <MaterialIcons name="card-giftcard" size={24} color={isDark ? "#555" : "#ccc"} />
            </View>
          )}
        </View>

        <View style={styles.itemInfo}>
          <Text style={styles.itemName} numberOfLines={2}>
            {item.voucher_name}
          </Text>
          <Text style={styles.partnerName}>
            {item.partner?.partner_name || "Parceiro"}
          </Text>
          <Text style={styles.itemPrice}>
            {formatVoucherPrice(item.voucher_price)}
          </Text>

          <View style={styles.quantityContainer}>
            <TouchableOpacity
              style={[
                styles.quantityButton,
                item.quantity === 1 && styles.quantityButtonDisabled,
              ]}
              onPress={() =>
                handleUpdateVoucherQuantity(item.voucher_id, item.quantity - 1)
              }
              disabled={item.quantity === 1}
            >
              <MaterialIcons
                name="remove"
                size={16}
                color={item.quantity === 1 ? (isDark ? "#555" : "#AAA") : (isDark ? "#FFF" : "#000")}
              />
            </TouchableOpacity>

            <Text style={styles.quantityText}>{item.quantity}</Text>

            <TouchableOpacity
              style={styles.quantityButton}
              onPress={() =>
                handleUpdateVoucherQuantity(item.voucher_id, item.quantity + 1)
              }
            >
              <MaterialIcons name="add" size={16} color={isDark ? "#FFF" : "#000"} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.itemActions}>
          <Text style={styles.itemTotal}>
            {formatVoucherPrice(item.total_price)}
          </Text>
          <TouchableOpacity
            style={styles.removeButton}
            onPress={() => handleRemoveVoucher(item.voucher_id)}
          >
            <MaterialIcons name="delete" size={18} color="#f44336" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.container}>
        {/* Header do Modal */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={onClose}
            activeOpacity={0.7}
          >
            <MaterialIcons
              name="close"
              size={22}
              color={isDark ? "#FFFFFF" : "#1A1A1A"}
            />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Meu Carrinho</Text>
          <View style={styles.headerSpacer} />
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.colors.primary || "#7C4DFF"} />
            <Text style={styles.loadingText}>Carregando carrinho...</Text>
          </View>
        ) : cartItems.length === 0 && voucherCartItems.length === 0 ? (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconCircle}>
              <MaterialIcons
                name="remove-shopping-cart"
                size={44}
                color={isDark ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.3)"}
              />
            </View>
            <Text style={styles.emptyText}>Seu carrinho está vazio</Text>
            <Text style={styles.emptySubtext}>
              Adicione produtos ou vouchers para ver aqui
            </Text>
          </View>
        ) : (
          <>
            <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
              {/* Produtos */}
              {cartItems.length > 0 && (
                <>
                  <Text style={styles.sectionHeader}>Produtos</Text>
                  {cartItems.map((item) => (
                    <CartItem key={item.product_id} item={item} />
                  ))}
                </>
              )}

              {/* Vouchers */}
              {voucherCartItems.length > 0 && (
                <>
                  <Text style={styles.sectionHeader}>Vouchers</Text>
                  {voucherCartItems.map((item) => (
                    <VoucherItem key={item.voucher_id} item={item} />
                  ))}
                </>
              )}
            </ScrollView>

            {/* Footer com total e botão */}
            <View style={styles.footer}>
              <View style={styles.totalContainer}>
                <Text style={styles.totalLabel}>Total:</Text>
                <Text style={styles.totalValue}>{formatPrice(total)}</Text>
              </View>

              <TouchableOpacity
                style={styles.checkoutButton}
                onPress={() => {
                  onClose();
                  onGoToCart();
                }}
                activeOpacity={0.8}
              >
                <MaterialIcons
                  name="shopping-cart"
                  size={20}
                  color="white"
                  style={styles.checkoutIcon}
                />
                <Text style={styles.checkoutText}>Finalizar Compra</Text>
              </TouchableOpacity>
              {/* Aviso discreto sobre redirecionamento ao Mercado Pago */}
              <Text style={styles.captionText}>
                Ao finalizar, você será redirecionado ao Mercado Pago para concluir o pagamento.
              </Text>
            </View>
          </>
        )}
      </SafeAreaView>
    </Modal>
  );
}

const getStyles = (theme, isDark) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background || (isDark ? "#0F0F0F" : "#FFFFFF"),
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: isDark ? "#222226" : "#F0F0F0",
    backgroundColor: isDark ? "#141416" : "#FFFFFF",
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: isDark ? "rgba(255, 255, 255, 0.08)" : "rgba(0, 0, 0, 0.04)",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: 17,
    fontWeight: "700",
    color: isDark ? "#FFFFFF" : "#1A1A1A",
  },
  headerSpacer: {
    width: 36,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 15,
    color: isDark ? "#8A8A90" : theme.colors.muted,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  emptyIconCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: isDark ? "rgba(255, 255, 255, 0.06)" : "#F5F7FA",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "700",
    color: isDark ? "#F2F2F5" : "#1A1A1A",
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: isDark ? "#8A8A90" : theme.colors.muted,
    textAlign: "center",
  },
  scrollContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  cartItem: {
    flexDirection: "row",
    backgroundColor: isDark ? "#1A1A1E" : "#FFFFFF",
    padding: 14,
    marginVertical: 5,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: isDark ? "#282830" : "rgba(0,0,0,0.06)",
    shadowColor: isDark ? "#000" : "rgba(0,0,0,0.08)",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: isDark ? 0.3 : 0.06,
    shadowRadius: 6,
    elevation: 3,
  },
  itemImageContainer: {
    width: 64,
    height: 64,
    borderRadius: 10,
    overflow: "hidden",
    marginRight: 12,
    backgroundColor: isDark ? "#121214" : "#F0F0F4",
  },
  itemImage: {
    width: "100%",
    height: "100%",
  },
  noImageContainer: {
    width: "100%",
    height: "100%",
    backgroundColor: isDark ? "#16161A" : "#F0F0F4",
    justifyContent: "center",
    alignItems: "center",
  },
  itemInfo: {
    flex: 1,
    justifyContent: "space-between",
  },
  itemName: {
    fontSize: 14,
    fontWeight: "600",
    color: isDark ? "#F2F2F5" : "#1A1A1A",
    marginBottom: 4,
  },
  partnerName: {
    fontSize: 12,
    color: isDark ? "#8A8A90" : theme.colors.muted,
    marginBottom: 4,
    fontStyle: "italic",
  },
  itemPrice: {
    fontSize: 12,
    color: isDark ? "#8A8A90" : theme.colors.muted,
    marginBottom: 6,
  },
  quantityContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: isDark ? "#121214" : "#F0F0F0",
    borderRadius: 8,
    padding: 3,
    alignSelf: "flex-start",
  },
  quantityButton: {
    width: 28,
    height: 28,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: isDark ? "#25252B" : "#FFFFFF",
    borderRadius: 6,
  },
  quantityButtonDisabled: {
    backgroundColor: isDark ? "#18181C" : "#E5E5EA",
  },
  quantityText: {
    fontSize: 14,
    fontWeight: "700",
    marginHorizontal: 12,
    minWidth: 20,
    textAlign: "center",
    color: isDark ? "#FFFFFF" : "#1A1A1A",
  },
  itemActions: {
    alignItems: "flex-end",
    justifyContent: "space-between",
    marginLeft: 8,
  },
  itemTotal: {
    fontSize: 15,
    fontWeight: "800",
    color: theme.colors.primary || "#7C4DFF",
    marginBottom: 8,
  },
  removeButton: {
    padding: 6,
  },
  footer: {
    backgroundColor: isDark ? "#141416" : "#FFFFFF",
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 24,
    borderTopWidth: 1,
    borderTopColor: isDark ? "#222226" : "#F0F0F0",
  },
  totalContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  totalLabel: {
    fontSize: 17,
    fontWeight: "600",
    color: isDark ? "#FFFFFF" : "#1A1A1A",
  },
  totalValue: {
    fontSize: 22,
    fontWeight: "800",
    color: theme.colors.primary || "#7C4DFF",
  },
  checkoutButton: {
    backgroundColor: theme.colors.primary || "#7C4DFF",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 16,
    borderRadius: 14,
    shadowColor: theme.colors.primary || "#7C4DFF",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  checkoutIcon: {
    marginRight: 8,
  },
  checkoutText: {
    color: "white",
    fontSize: 16,
    fontWeight: "700",
  },
  captionText: {
    fontSize: 12,
    color: isDark ? "#8A8A90" : theme.colors.muted,
    textAlign: "center",
    marginTop: 10,
    lineHeight: 16,
  },
  sectionHeader: {
    fontSize: 15,
    fontWeight: "700",
    color: isDark ? "#FFFFFF" : "#1A1A1A",
    marginHorizontal: 4,
    marginVertical: 10,
    marginTop: 16,
  },
});
