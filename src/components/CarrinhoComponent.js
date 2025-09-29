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
import { theme } from "../utils/theme";
import { CartService } from "../services/cartService";
import { formatPrice, getProductMainImage } from "../api/products";
import Toast from "react-native-toast-message";

export default function CarrinhoComponent({ visible, onClose, onGoToCart }) {
  const [cartItems, setCartItems] = useState([]);
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
      const cartTotal = await CartService.getCartTotal();
      setCartItems(items);
      setTotal(cartTotal);
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
          <Text style={styles.itemPrice}>
            {formatPrice(item.product_price)}
          </Text>

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
              <MaterialIcons name="remove" size={16} color="#000" />
            </TouchableOpacity>

            <Text style={styles.quantityText}>{item.quantity}</Text>

            <TouchableOpacity
              style={styles.quantityButton}
              onPress={() =>
                handleUpdateQuantity(item.product_id, item.quantity + 1)
              }
            >
              <MaterialIcons name="add" size={16} color="#000" />
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

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Header do Modal */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <MaterialIcons name="close" size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Meu Carrinho</Text>
          <View style={styles.headerSpacer} />
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
            <Text style={styles.loadingText}>Carregando carrinho...</Text>
          </View>
        ) : cartItems.length === 0 ? (
          <View style={styles.emptyContainer}>
            <MaterialIcons name="shopping-cart" size={64} color="#ccc" />
            <Text style={styles.emptyText}>Seu carrinho está vazio</Text>
            <Text style={styles.emptySubtext}>
              Adicione produtos para ver aqui
            </Text>
          </View>
        ) : (
          <>
            <ScrollView style={styles.scrollContainer}>
              {cartItems.map((item) => (
                <CartItem key={item.product_id} item={item} />
              ))}
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
              >
                <MaterialIcons
                  name="shopping-cart"
                  size={20}
                  color="white"
                  style={styles.checkoutIcon}
                />
                <Text style={styles.checkoutText}>Finalizar Compra</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    backgroundColor: "white",
  },
  closeButton: {
    padding: 8,
  },
  headerTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: 18,
    fontWeight: "600",
    color: theme.colors.foreground,
  },
  headerSpacer: {
    width: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: theme.colors.muted,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    color: theme.colors.foreground,
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: theme.colors.muted,
    textAlign: "center",
  },
  scrollContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  cartItem: {
    flexDirection: "row",
    backgroundColor: "white",
    padding: 16,
    marginVertical: 4,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  itemImageContainer: {
    width: 60,
    height: 60,
    borderRadius: 8,
    overflow: "hidden",
    marginRight: 12,
  },
  itemImage: {
    width: "100%",
    height: "100%",
  },
  noImageContainer: {
    width: "100%",
    height: "100%",
    backgroundColor: "#f0f0f0",
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
    color: theme.colors.foreground,
    marginBottom: 4,
  },
  itemPrice: {
    fontSize: 12,
    color: theme.colors.muted,
    marginBottom: 8,
  },
  quantityContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
    borderRadius: 6,
    padding: 2,
    alignSelf: "flex-start",
  },
  quantityButton: {
    width: 28,
    height: 28,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 4,
  },
  quantityButtonDisabled: {
    backgroundColor: "#e0e0e0",
  },
  quantityText: {
    fontSize: 14,
    fontWeight: "600",
    marginHorizontal: 12,
    minWidth: 20,
    textAlign: "center",
  },
  itemActions: {
    alignItems: "flex-end",
    justifyContent: "space-between",
    marginLeft: 8,
  },
  itemTotal: {
    fontSize: 14,
    fontWeight: "bold",
    color: theme.colors.primary,
    marginBottom: 8,
  },
  removeButton: {
    padding: 4,
  },
  footer: {
    backgroundColor: "white",
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  totalContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: "600",
    color: theme.colors.foreground,
  },
  totalValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: theme.colors.primary,
  },
  checkoutButton: {
    backgroundColor: theme.colors.primary,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 16,
    borderRadius: 12,
  },
  checkoutIcon: {
    marginRight: 8,
  },
  checkoutText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
});
