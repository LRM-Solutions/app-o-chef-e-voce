import AsyncStorage from "@react-native-async-storage/async-storage";

const CART_STORAGE_KEY = "@cart_items";

/**
 * Serviço para gerenciar o carrinho de compras
 */
export const CartService = {
  /**
   * Obtém todos os itens do carrinho
   */
  async getCartItems() {
    try {
      const cartData = await AsyncStorage.getItem(CART_STORAGE_KEY);
      return cartData ? JSON.parse(cartData) : [];
    } catch (error) {
      console.error("Erro ao buscar itens do carrinho:", error);
      return [];
    }
  },

  /**
   * Adiciona um produto ao carrinho ou atualiza a quantidade
   */
  async addToCart(product, quantity = 1) {
    try {
      const cartItems = await this.getCartItems();
      const existingItemIndex = cartItems.findIndex(
        (item) => item.product_id === product.product_id
      );

      if (existingItemIndex !== -1) {
        // Se o produto já existe, atualiza a quantidade
        cartItems[existingItemIndex].quantity += quantity;
        cartItems[existingItemIndex].total_price =
          cartItems[existingItemIndex].quantity * product.product_price;
      } else {
        // Se é um produto novo, adiciona ao carrinho
        const cartItem = {
          ...product,
          quantity: quantity,
          total_price: quantity * product.product_price,
          added_at: new Date().toISOString(),
        };
        cartItems.push(cartItem);
      }

      await AsyncStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
      return cartItems;
    } catch (error) {
      console.error("Erro ao adicionar produto ao carrinho:", error);
      throw error;
    }
  },

  /**
   * Remove um produto do carrinho
   */
  async removeFromCart(productId) {
    try {
      const cartItems = await this.getCartItems();
      const updatedItems = cartItems.filter(
        (item) => item.product_id !== productId
      );
      await AsyncStorage.setItem(
        CART_STORAGE_KEY,
        JSON.stringify(updatedItems)
      );
      return updatedItems;
    } catch (error) {
      console.error("Erro ao remover produto do carrinho:", error);
      throw error;
    }
  },

  /**
   * Atualiza a quantidade de um produto no carrinho
   */
  async updateQuantity(productId, newQuantity) {
    try {
      if (newQuantity <= 0) {
        return await this.removeFromCart(productId);
      }

      const cartItems = await this.getCartItems();
      const itemIndex = cartItems.findIndex(
        (item) => item.product_id === productId
      );

      if (itemIndex !== -1) {
        cartItems[itemIndex].quantity = newQuantity;
        cartItems[itemIndex].total_price =
          newQuantity * cartItems[itemIndex].product_price;
        await AsyncStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
      }

      return cartItems;
    } catch (error) {
      console.error("Erro ao atualizar quantidade:", error);
      throw error;
    }
  },

  /**
   * Limpa todo o carrinho
   */
  async clearCart() {
    try {
      await AsyncStorage.removeItem(CART_STORAGE_KEY);
      return [];
    } catch (error) {
      console.error("Erro ao limpar carrinho:", error);
      throw error;
    }
  },

  /**
   * Calcula o total do carrinho
   */
  async getCartTotal() {
    try {
      const cartItems = await this.getCartItems();
      return cartItems.reduce((total, item) => total + item.total_price, 0);
    } catch (error) {
      console.error("Erro ao calcular total do carrinho:", error);
      return 0;
    }
  },

  /**
   * Obtém a quantidade total de itens no carrinho
   */
  async getCartItemCount() {
    try {
      const cartItems = await this.getCartItems();
      return cartItems.reduce((total, item) => total + item.quantity, 0);
    } catch (error) {
      console.error("Erro ao contar itens do carrinho:", error);
      return 0;
    }
  },
};
