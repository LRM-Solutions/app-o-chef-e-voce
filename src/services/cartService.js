import AsyncStorage from "@react-native-async-storage/async-storage";

const CART_STORAGE_KEY = "@cart_items";
const VOUCHER_CART_STORAGE_KEY = "@voucher_cart_items";

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

  // ==================== FUNÇÕES PARA VOUCHERS ====================

  /**
   * Obtém todos os vouchers do carrinho
   */
  async getVoucherCartItems() {
    try {
      const voucherData = await AsyncStorage.getItem(VOUCHER_CART_STORAGE_KEY);
      return voucherData ? JSON.parse(voucherData) : [];
    } catch (error) {
      console.error("Erro ao buscar vouchers do carrinho:", error);
      return [];
    }
  },

  /**
   * Adiciona um voucher ao carrinho ou atualiza a quantidade
   */
  async addVoucherToCart(voucher, quantity = 1) {
    try {
      const voucherCartItems = await this.getVoucherCartItems();
      const existingItemIndex = voucherCartItems.findIndex(
        (item) => item.voucher_id === voucher.voucher_id
      );

      if (existingItemIndex !== -1) {
        // Se o voucher já existe, atualiza a quantidade
        voucherCartItems[existingItemIndex].quantity += quantity;
        voucherCartItems[existingItemIndex].total_price =
          voucherCartItems[existingItemIndex].quantity * voucher.voucher_price;
      } else {
        // Se é um voucher novo, adiciona ao carrinho
        const voucherCartItem = {
          ...voucher,
          quantity: quantity,
          total_price: quantity * voucher.voucher_price,
          added_at: new Date().toISOString(),
        };
        voucherCartItems.push(voucherCartItem);
      }

      await AsyncStorage.setItem(
        VOUCHER_CART_STORAGE_KEY,
        JSON.stringify(voucherCartItems)
      );
      return voucherCartItems;
    } catch (error) {
      console.error("Erro ao adicionar voucher ao carrinho:", error);
      throw error;
    }
  },

  /**
   * Remove um voucher do carrinho
   */
  async removeVoucherFromCart(voucherId) {
    try {
      const voucherCartItems = await this.getVoucherCartItems();
      const updatedItems = voucherCartItems.filter(
        (item) => item.voucher_id !== voucherId
      );
      await AsyncStorage.setItem(
        VOUCHER_CART_STORAGE_KEY,
        JSON.stringify(updatedItems)
      );
      return updatedItems;
    } catch (error) {
      console.error("Erro ao remover voucher do carrinho:", error);
      throw error;
    }
  },

  /**
   * Atualiza a quantidade de um voucher no carrinho
   */
  async updateVoucherQuantity(voucherId, newQuantity) {
    try {
      if (newQuantity <= 0) {
        return await this.removeVoucherFromCart(voucherId);
      }

      const voucherCartItems = await this.getVoucherCartItems();
      const itemIndex = voucherCartItems.findIndex(
        (item) => item.voucher_id === voucherId
      );

      if (itemIndex !== -1) {
        voucherCartItems[itemIndex].quantity = newQuantity;
        voucherCartItems[itemIndex].total_price =
          newQuantity * voucherCartItems[itemIndex].voucher_price;
        await AsyncStorage.setItem(
          VOUCHER_CART_STORAGE_KEY,
          JSON.stringify(voucherCartItems)
        );
      }

      return voucherCartItems;
    } catch (error) {
      console.error("Erro ao atualizar quantidade do voucher:", error);
      throw error;
    }
  },

  /**
   * Limpa todos os vouchers do carrinho
   */
  async clearVoucherCart() {
    try {
      await AsyncStorage.removeItem(VOUCHER_CART_STORAGE_KEY);
      return [];
    } catch (error) {
      console.error("Erro ao limpar carrinho de vouchers:", error);
      throw error;
    }
  },

  /**
   * Calcula o total dos vouchers no carrinho
   */
  async getVoucherCartTotal() {
    try {
      const voucherCartItems = await this.getVoucherCartItems();
      return voucherCartItems.reduce(
        (total, item) => total + item.total_price,
        0
      );
    } catch (error) {
      console.error("Erro ao calcular total dos vouchers:", error);
      return 0;
    }
  },

  /**
   * Obtém a quantidade total de vouchers no carrinho
   */
  async getVoucherCartItemCount() {
    try {
      const voucherCartItems = await this.getVoucherCartItems();
      return voucherCartItems.reduce((total, item) => total + item.quantity, 0);
    } catch (error) {
      console.error("Erro ao contar vouchers no carrinho:", error);
      return 0;
    }
  },

  /**
   * Limpa todo o carrinho (produtos e vouchers)
   */
  async clearAllCart() {
    try {
      await this.clearCart();
      await this.clearVoucherCart();
      return { products: [], vouchers: [] };
    } catch (error) {
      console.error("Erro ao limpar todo o carrinho:", error);
      throw error;
    }
  },

  /**
   * Obtém o total geral (produtos + vouchers)
   */
  async getGrandTotal() {
    try {
      const productTotal = await this.getCartTotal();
      const voucherTotal = await this.getVoucherCartTotal();
      return productTotal + voucherTotal;
    } catch (error) {
      console.error("Erro ao calcular total geral:", error);
      return 0;
    }
  },

  /**
   * Obtém contagem total de itens (produtos + vouchers)
   */
  async getTotalItemCount() {
    try {
      const productCount = await this.getCartItemCount();
      const voucherCount = await this.getVoucherCartItemCount();
      return productCount + voucherCount;
    } catch (error) {
      console.error("Erro ao contar todos os itens:", error);
      return 0;
    }
  },
};
