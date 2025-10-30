import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  Linking,
} from "react-native";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { theme } from "../utils/theme";
import { CartService } from "../services/cartService";
import { formatPrice, getProductMainImage } from "../api/products";
import { formatVoucherPrice, getVoucherMainImage } from "../api/vouchers";
import Toast from "react-native-toast-message";
import EnderecoSelector from "../components/EnderecoSelector";
import PaymentDataSelector from "../components/PaymentDataSelector";
import { createPedido } from "../api/pedidosApi";
import { createPayment, getNotificationUrl } from "../api/paymentsApi";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function CarrinhoScreen({ navigation }) {
  const [cartItems, setCartItems] = useState([]);
  const [voucherCartItems, setVoucherCartItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [selectedEndereco, setSelectedEndereco] = useState(null);
  const [paymentData, setPaymentData] = useState({});
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    loadCartItems();

    // Listener para quando a tela ganha foco
    const unsubscribe = navigation.addListener("focus", () => {
      loadCartItems();
    });

    return unsubscribe;
  }, [navigation]);

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
      await loadCartItems();
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

  const handleRemoveItem = async (productId, productName) => {
    Alert.alert(
      "Remover Produto",
      `Deseja remover "${productName}" do carrinho?`,
      [
        {
          text: "Cancelar",
          style: "cancel",
        },
        {
          text: "Remover",
          style: "destructive",
          onPress: async () => {
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
          },
        },
      ]
    );
  };

  const handleUpdateVoucherQuantity = async (voucherId, newQuantity) => {
    try {
      await CartService.updateVoucherQuantity(voucherId, newQuantity);
      await loadCartItems();
      Toast.show({
        type: "success",
        text1: "Carrinho atualizado",
        visibilityTime: 2000,
      });
    } catch (error) {
      console.error("Erro ao atualizar quantidade do voucher:", error);
      Toast.show({
        type: "error",
        text1: "Erro",
        text2: "Não foi possível atualizar a quantidade",
        visibilityTime: 3000,
      });
    }
  };

  const handleRemoveVoucher = async (voucherId, voucherName) => {
    Alert.alert(
      "Remover Voucher",
      `Deseja remover "${voucherName}" do carrinho?`,
      [
        {
          text: "Cancelar",
          style: "cancel",
        },
        {
          text: "Remover",
          style: "destructive",
          onPress: async () => {
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
          },
        },
      ]
    );
  };

  const handleClearCart = () => {
    Alert.alert(
      "Limpar Carrinho",
      "Deseja remover todos os produtos e vouchers do carrinho?",
      [
        {
          text: "Cancelar",
          style: "cancel",
        },
        {
          text: "Limpar",
          style: "destructive",
          onPress: async () => {
            try {
              await CartService.clearAllCart();
              await loadCartItems();
              Toast.show({
                type: "success",
                text1: "Carrinho limpo",
                visibilityTime: 2000,
              });
            } catch (error) {
              console.error("Erro ao limpar carrinho:", error);
              Toast.show({
                type: "error",
                text1: "Erro",
                text2: "Não foi possível limpar o carrinho",
                visibilityTime: 3000,
              });
            }
          },
        },
      ]
    );
  };

  const handleEnderecoSelect = (endereco) => {
    setSelectedEndereco(endereco);
  };

  const handlePaymentDataChange = (data) => {
    setPaymentData(data);
  };

  const openPaymentUrl = async (paymentData) => {
    try {
      // Log completo dos dados de pagamento recebidos
      console.log(
        "💳 Dados completos do pagamento recebidos:",
        JSON.stringify(paymentData, null, 2)
      );

      // Usar sandbox_init_point para desenvolvimento ou init_point para produção
      // Priorizar sandbox para desenvolvimento
      const paymentUrl =
        paymentData.sandbox_init_point || paymentData.init_point;

      if (!paymentUrl) {
        console.error("❌ URLs de pagamento não encontradas:", {
          init_point: paymentData.init_point,
          sandbox_init_point: paymentData.sandbox_init_point,
        });
        throw new Error("URL de pagamento não encontrada na resposta");
      }

      console.log("🌐 Tentando abrir URL de pagamento:", paymentUrl);
      console.log("🔍 Informações do pagamento:", {
        payment_id: paymentData.payment_id,
        preference_id: paymentData.preference_id,
        transaction_amount: paymentData.transaction_amount,
        status: paymentData.payment?.status,
      });

      // Verificar se a URL pode ser aberta
      const supported = await Linking.canOpenURL(paymentUrl);

      if (supported) {
        console.log("✅ URL suportada, abrindo no navegador...");

        // Mostrar feedback antes de redirecionar
        Toast.show({
          type: "info",
          text1: "Redirecionando",
          text2: "Abrindo gateway do Mercado Pago...",
          visibilityTime: 2000,
        });

        // Aguardar um pouco antes de abrir para o usuário ver o toast
        setTimeout(async () => {
          await Linking.openURL(paymentUrl);
          console.log("🚀 URL aberta com sucesso!");
        }, 500);
      } else {
        console.error("❌ URL não suportada pelo dispositivo");
        throw new Error("URL de pagamento não suportada pelo dispositivo");
      }
    } catch (error) {
      console.error("❌ Erro ao abrir URL de pagamento:", error);
      console.error("❌ Stack trace:", error.stack);

      Toast.show({
        type: "error",
        text1: "Erro no Redirecionamento",
        text2: "Não foi possível abrir o gateway de pagamento",
        visibilityTime: 4000,
      });

      // Mostrar alert com informações do pagamento e opção de tentar novamente
      const paymentUrl =
        paymentData.sandbox_init_point || paymentData.init_point;
      Alert.alert(
        "Erro ao Abrir Pagamento",
        `Não foi possível redirecionar automaticamente.\n\nPedido: ${
          paymentData.payment?.pedido_id || "N/A"
        }\nValor: R$ ${
          paymentData.transaction_amount || "N/A"
        }\n\nVocê pode acessar o link manualmente ou tentar novamente.`,
        [
          { text: "Cancelar", style: "cancel" },
          {
            text: "Tentar Novamente",
            onPress: () => openPaymentUrl(paymentData),
          },
          {
            text: "Ver Link",
            onPress: () => {
              Alert.alert("Link do Pagamento", paymentUrl, [{ text: "OK" }]);
            },
          },
        ]
      );
    }
  };

  const handleGoToPayment = async () => {
    // Validações
    if (!selectedEndereco) {
      Alert.alert(
        "Endereço Obrigatório",
        "Selecione um endereço de entrega para continuar.",
        [{ text: "OK" }]
      );
      return;
    }

    if (
      !paymentData ||
      !paymentData.payer_email ||
      !paymentData.payer_identification_number
    ) {
      Alert.alert(
        "Dados Obrigatórios",
        "Preencha todos os dados de pagamento para continuar.",
        [{ text: "OK" }]
      );
      return;
    }

    // Validação simples de email
    if (!/\S+@\S+\.\S+/.test(paymentData.payer_email)) {
      Alert.alert("Email Inválido", "Por favor, insira um email válido.", [
        { text: "OK" },
      ]);
      return;
    }

    // Validação de CPF (11 dígitos)
    if (
      !paymentData.payer_identification_number ||
      paymentData.payer_identification_number.length !== 11
    ) {
      Alert.alert(
        "CPF Inválido",
        "Por favor, insira um CPF válido com 11 dígitos.",
        [{ text: "OK" }]
      );
      return;
    }

    try {
      setProcessing(true);

      // 1. Criar o pedido
      const produtos = cartItems.map((item) => ({
        produto_id: item.product_id,
        quantidade: item.quantity,
        observacao: "", // Pode ser expandido futuramente
      }));

      // Buscar vouchers do carrinho
      const voucherCartItems = await CartService.getVoucherCartItems();
      const vouchers = voucherCartItems.map((item) => ({
        voucher_id: item.voucher_id,
        quantidade: item.quantity,
      }));

      const pedidoPayload = {
        endereco_id: selectedEndereco.endereco_id,
        status: "PENDENTE",
        statusEntrega: "PENDENTE",
        statusPagamento: "PENDING",
        observacoes: "", // Pode ser expandido futuramente
        taxa_entrega: 0.0, // Por enquanto frete grátis, pode ser expandido futuramente
        produtos: produtos,
        vouchers: vouchers,
      };

      // Debug dos dados de pagamento
      console.log(
        "🔍 PaymentData recebido:",
        JSON.stringify(paymentData, null, 2)
      );

      console.log("🛒 Criando pedido...");
      const pedidoResponse = await createPedido(pedidoPayload);

      if (!pedidoResponse.pedido_id) {
        throw new Error("Erro ao criar pedido: ID não retornado");
      }

      // 2. Criar o pagamento com nova estrutura
      const paymentPayload = {
        pedidoId: pedidoResponse.pedido_id,
        installments: paymentData.installments || 1,
        payerData: {
          email: paymentData.payer_email,
          identification: {
            type: paymentData.payer_identification_type || "CPF",
            number: paymentData.payer_identification_number,
          },
        },
      };

      console.log("💳 Processando pagamento...");
      const paymentResponse = await createPayment(paymentPayload);

      // Verificar se a resposta tem a estrutura esperada
      if (
        !paymentResponse ||
        (!paymentResponse.data &&
          !paymentResponse.init_point &&
          !paymentResponse.sandbox_init_point)
      ) {
        throw new Error("Resposta inválida da API de pagamento");
      }

      // Normalizar a resposta (pode vir direto ou dentro de 'data')
      const paymentResponseData = paymentResponse.data || paymentResponse;

      // 3. Limpar carrinho após sucesso da criação do pedido/pagamento
      await CartService.clearAllCart();

      // 4. Mostrar sucesso
      Toast.show({
        type: "success",
        text1: "Pedido Criado!",
        text2: "Redirecionando para pagamento...",
        visibilityTime: 2000,
      });

      // 5. Preparar informações do pedido
      let message = `Pedido #${pedidoResponse.pedido_id} criado com sucesso!\n\n`;
      message += `📍 Endereço: ${selectedEndereco.rua}, ${selectedEndereco.numero}\n`;
      message += `${selectedEndereco.bairro}, ${selectedEndereco.cidade}/${selectedEndereco.estado}\n\n`;

      // Adicionar informações específicas do método de pagamento
      if (paymentData.installments > 1) {
        message += `📊 Parcelas: ${paymentData.installments}x de ${formatPrice(
          total / paymentData.installments
        )}\n`;
      }

      message += `💰 Total: ${formatPrice(total)}\n\n`;
      message += `� Você escolherá o método de pagamento no gateway do Mercado Pago.\n`;
      message += `🔐 Ambiente seguro do Mercado Pago.`;

      // 6. Mostrar confirmação e redirecionar
      Alert.alert("Pedido Confirmado!", message, [
        {
          text: "Finalizar Pagamento",
          onPress: async () => {
            // Redirecionar para gateway de pagamento
            await openPaymentUrl(paymentResponseData);

            // Aguardar um pouco antes de navegar de volta
            setTimeout(() => {
              navigation.navigate("produtos");
            }, 1000);
          },
        },
        {
          text: "Pagar Depois",
          style: "cancel",
          onPress: () => {
            // Apenas voltar sem abrir o gateway
            navigation.navigate("produtos");
          },
        },
      ]);
    } catch (error) {
      console.error("Erro no processo de pagamento:", error);

      Toast.show({
        type: "error",
        text1: "Erro no Pagamento",
        text2:
          error.response?.data?.message ||
          "Não foi possível processar o pedido",
        visibilityTime: 4000,
      });

      Alert.alert(
        "Erro no Pagamento",
        "Não foi possível processar seu pedido. Tente novamente.",
        [{ text: "OK" }]
      );
    } finally {
      setProcessing(false);
    }
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
              <MaterialIcons name="card-giftcard" size={32} color="#ccc" />
            </View>
          )}
        </View>

        <View style={styles.itemInfo}>
          <Text style={styles.itemName} numberOfLines={2}>
            {item.voucher_name}
          </Text>
          <Text style={styles.itemCategory}>
            {item.partner?.partner_name || "Voucher"}
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
              <MaterialIcons name="remove" size={18} color="#000" />
            </TouchableOpacity>

            <Text style={styles.quantityText}>{item.quantity}</Text>

            <TouchableOpacity
              style={styles.quantityButton}
              onPress={() =>
                handleUpdateVoucherQuantity(item.voucher_id, item.quantity + 1)
              }
            >
              <MaterialIcons name="add" size={18} color="#000" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.itemActions}>
          <Text style={styles.itemTotal}>
            {formatVoucherPrice(item.total_price)}
          </Text>
          <TouchableOpacity
            style={styles.removeButton}
            onPress={() =>
              handleRemoveVoucher(item.voucher_id, item.voucher_name)
            }
          >
            <MaterialIcons name="delete" size={20} color="#f44336" />
          </TouchableOpacity>
        </View>
      </View>
    );
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
              <MaterialIcons name="image" size={32} color="#ccc" />
            </View>
          )}
        </View>

        <View style={styles.itemInfo}>
          <Text style={styles.itemName} numberOfLines={2}>
            {item.product_name}
          </Text>
          <Text style={styles.itemCategory}>
            {item.product_category || "Categoria"}
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
              <MaterialIcons name="remove" size={18} color="#000" />
            </TouchableOpacity>

            <Text style={styles.quantityText}>{item.quantity}</Text>

            <TouchableOpacity
              style={styles.quantityButton}
              onPress={() =>
                handleUpdateQuantity(item.product_id, item.quantity + 1)
              }
            >
              <MaterialIcons name="add" size={18} color="#000" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.itemActions}>
          <Text style={styles.itemTotal}>{formatPrice(item.total_price)}</Text>
          <TouchableOpacity
            style={styles.removeButton}
            onPress={() => handleRemoveItem(item.product_id, item.product_name)}
          >
            <MaterialIcons name="delete" size={20} color="#f44336" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Carregando carrinho...</Text>
      </View>
    );
  }

  if (cartItems.length === 0 && voucherCartItems.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <MaterialIcons name="shopping-cart" size={80} color="#ccc" />
        <Text style={styles.emptyText}>Seu carrinho está vazio</Text>
        <Text style={styles.emptySubtext}>
          Adicione produtos ou vouchers para finalizar sua compra
        </Text>
        <TouchableOpacity
          style={styles.continueShoppingButton}
          onPress={() => navigation.navigate("produtos")}
        >
          <Text style={styles.continueShoppingText}>Continuar Comprando</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header da tela */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <MaterialIcons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Meu Carrinho</Text>
        <TouchableOpacity style={styles.clearButton} onPress={handleClearCart}>
          <MaterialIcons name="delete-sweep" size={24} color="#f44336" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollContainer}>
        <View style={styles.itemsHeader}>
          <Text style={styles.itemsCount}>
            {cartItems.length + voucherCartItems.length}{" "}
            {cartItems.length + voucherCartItems.length === 1
              ? "item"
              : "itens"}
          </Text>
        </View>

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

        {/* Seleção de Endereço */}
        <EnderecoSelector
          onEnderecoSelect={handleEnderecoSelect}
          selectedEnderecoId={selectedEndereco?.endereco_id}
        />

        {/* Dados para Pagamento */}
        <PaymentDataSelector onPaymentDataChange={handlePaymentDataChange} />
      </ScrollView>

      {/* Footer com resumo e botão de pagamento */}
      <View style={styles.footer}>
        <View style={styles.summarySection}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal:</Text>
            <Text style={styles.summaryValue}>{formatPrice(total)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Entrega:</Text>
            <Text style={styles.summaryValue}>Grátis</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total:</Text>
            <Text style={styles.totalValue}>{formatPrice(total)}</Text>
          </View>
        </View>

        <TouchableOpacity
          style={[
            styles.paymentButton,
            processing && styles.paymentButtonDisabled,
          ]}
          onPress={handleGoToPayment}
          disabled={processing}
        >
          {processing ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <MaterialIcons
              name="payment"
              size={20}
              color="white"
              style={styles.paymentIcon}
            />
          )}
          <Text style={styles.paymentText}>
            {processing ? "Processando..." : "Finalizar Pedido"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
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
  backButton: {
    padding: 8,
  },
  headerTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: 18,
    fontWeight: "600",
    color: theme.colors.foreground,
  },
  clearButton: {
    padding: 8,
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
    fontSize: 20,
    fontWeight: "600",
    color: theme.colors.foreground,
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: theme.colors.muted,
    textAlign: "center",
    marginBottom: 24,
  },
  continueShoppingButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  continueShoppingText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  scrollContainer: {
    flex: 1,
  },
  itemsHeader: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  itemsCount: {
    fontSize: 16,
    fontWeight: "600",
    color: theme.colors.foreground,
  },
  cartItem: {
    flexDirection: "row",
    backgroundColor: "white",
    padding: 16,
    marginVertical: 1,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  itemImageContainer: {
    width: 80,
    height: 80,
    borderRadius: 8,
    overflow: "hidden",
    marginRight: 16,
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
    fontSize: 16,
    fontWeight: "600",
    color: theme.colors.foreground,
    marginBottom: 4,
  },
  itemCategory: {
    fontSize: 12,
    color: theme.colors.muted,
    marginBottom: 8,
  },
  itemPrice: {
    fontSize: 14,
    color: theme.colors.primary,
    fontWeight: "500",
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
    width: 32,
    height: 32,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 4,
  },
  quantityButtonDisabled: {
    backgroundColor: "#e0e0e0",
  },
  quantityText: {
    fontSize: 16,
    fontWeight: "600",
    marginHorizontal: 16,
    minWidth: 24,
    textAlign: "center",
  },
  itemActions: {
    alignItems: "flex-end",
    justifyContent: "space-between",
    marginLeft: 12,
  },
  itemTotal: {
    fontSize: 16,
    fontWeight: "bold",
    color: theme.colors.primary,
    marginBottom: 16,
  },
  removeButton: {
    padding: 8,
  },
  footer: {
    backgroundColor: "white",
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  summarySection: {
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: theme.colors.muted,
  },
  summaryValue: {
    fontSize: 14,
    color: theme.colors.foreground,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
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
  paymentButton: {
    backgroundColor: theme.colors.primary,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 16,
    borderRadius: 12,
  },
  paymentButtonDisabled: {
    opacity: 0.7,
  },
  paymentIcon: {
    marginRight: 8,
  },
  paymentText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: "600",
    color: theme.colors.foreground,
    marginHorizontal: 16,
    marginVertical: 12,
    marginTop: 20,
  },
});
