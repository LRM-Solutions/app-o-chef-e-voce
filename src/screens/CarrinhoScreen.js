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
  Platform,
  Linking,
} from "react-native";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { useTheme } from "../utils/ThemeContext";
import { CartService } from "../services/cartService";
import { formatPrice, getProductMainImage } from "../api/products";
import { formatVoucherPrice, getVoucherMainImage } from "../api/vouchers";
import Toast from "react-native-toast-message";
import EnderecoSelector from "../components/EnderecoSelector";
import FreteSelector from "../components/FreteSelector";
import PaymentDataSelector from "../components/PaymentDataSelector";
import FinalizarCompraModal from "../components/FinalizarCompraModal";
import ConfirmModal from "../components/ConfirmModal";
import { createPedido } from "../api/pedidosApi";
import { createPayment, getNotificationUrl } from "../api/paymentsApi";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function CarrinhoScreen({ navigation }) {
  const { theme, themeMode } = useTheme();
  const isDark = theme?.isDarkMode ?? (themeMode === "dark");
  const insets = useSafeAreaInsets();
  const styles = getStyles(theme, isDark, insets);

  const [cartItems, setCartItems] = useState([]);
  const [voucherCartItems, setVoucherCartItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [deliveryMethod, setDeliveryMethod] = useState("DELIVERY"); // "DELIVERY" ou "PICKUP"
  const [selectedEndereco, setSelectedEndereco] = useState(null);
  const [selectedFrete, setSelectedFrete] = useState(null);
  const [paymentData, setPaymentData] = useState({});
  const [processing, setProcessing] = useState(false);
  const [showFinalizarModal, setShowFinalizarModal] = useState(false);
  const [pedidoConfirmado, setPedidoConfirmado] = useState(null);
  const [confirmModal, setConfirmModal] = useState({
    visible: false,
    title: "",
    message: "",
    confirmText: "Confirmar",
    confirmColor: "#EF4444",
    iconName: "delete-outline",
    onConfirm: null,
    loading: false,
  });

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

  // Calcula o total incluindo frete
  const getTotalComFrete = () => {
    const freteValue = deliveryMethod === "PICKUP" ? 0 : (selectedFrete?.preco || 0);
    return total + freteValue;
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

  const handleRemoveItem = (productId, productName) => {
    setConfirmModal({
      visible: true,
      title: "Remover Produto",
      message: `Deseja remover "${productName}" do seu carrinho da Sans Company?`,
      confirmText: "Remover",
      iconName: "delete-outline",
      confirmColor: "#EF4444",
      onConfirm: async () => {
        try {
          setConfirmModal((prev) => ({ ...prev, loading: true }));
          const updatedItems = await CartService.removeFromCart(productId);
          await loadCartItems();
          setConfirmModal((prev) => ({ ...prev, visible: false, loading: false }));
          Toast.show({
            type: "success",
            text1: "Produto removido",
            visibilityTime: 2000,
          });

          // Se esvaziou o carrinho, redireciona para a loja
          const remainingVouchers = await CartService.getVoucherCartItems();
          if (
            (!updatedItems || updatedItems.length === 0) &&
            (!remainingVouchers || remainingVouchers.length === 0)
          ) {
            navigation.navigate("MainTabs", { screen: "Loja" });
          }
        } catch (error) {
          console.error("Erro ao remover item:", error);
          setConfirmModal((prev) => ({ ...prev, loading: false }));
          Toast.show({
            type: "error",
            text1: "Erro",
            text2: "Não foi possível remover o produto",
            visibilityTime: 3000,
          });
        }
      },
    });
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

  const handleRemoveVoucher = (voucherId, voucherName) => {
    setConfirmModal({
      visible: true,
      title: "Remover Voucher",
      message: `Deseja remover o voucher "${voucherName}" do seu carrinho da Sans Company?`,
      confirmText: "Remover",
      iconName: "delete-outline",
      confirmColor: "#EF4444",
      onConfirm: async () => {
        try {
          setConfirmModal((prev) => ({ ...prev, loading: true }));
          const updatedVouchers = await CartService.removeVoucherFromCart(voucherId);
          await loadCartItems();
          setConfirmModal((prev) => ({ ...prev, visible: false, loading: false }));
          Toast.show({
            type: "success",
            text1: "Voucher removido",
            visibilityTime: 2000,
          });

          // Se esvaziou o carrinho, redireciona para a loja
          const remainingProducts = await CartService.getCartItems();
          if (
            (!updatedVouchers || updatedVouchers.length === 0) &&
            (!remainingProducts || remainingProducts.length === 0)
          ) {
            navigation.navigate("MainTabs", { screen: "Loja" });
          }
        } catch (error) {
          console.error("Erro ao remover voucher:", error);
          setConfirmModal((prev) => ({ ...prev, loading: false }));
          Toast.show({
            type: "error",
            text1: "Erro",
            text2: "Não foi possível remover o voucher",
            visibilityTime: 3000,
          });
        }
      },
    });
  };

  const handleClearCart = () => {
    setConfirmModal({
      visible: true,
      title: "Limpar Carrinho",
      message:
        "Tem certeza que deseja remover todos os itens do seu carrinho da Sans Company?",
      confirmText: "Limpar Carrinho",
      iconName: "delete-sweep",
      confirmColor: "#EF4444",
      onConfirm: async () => {
        try {
          setConfirmModal((prev) => ({ ...prev, loading: true }));
          await CartService.clearAllCart();
          await loadCartItems();
          setConfirmModal((prev) => ({ ...prev, visible: false, loading: false }));
          navigation.navigate("MainTabs", { screen: "Loja" });
          Toast.show({
            type: "success",
            text1: "Carrinho limpo",
            text2: "Você foi redirecionado para a loja",
            visibilityTime: 2500,
          });
        } catch (error) {
          console.error("Erro ao limpar carrinho:", error);
          setConfirmModal((prev) => ({ ...prev, loading: false }));
          Toast.show({
            type: "error",
            text1: "Erro",
            text2: "Não foi possível limpar o carrinho",
            visibilityTime: 3000,
          });
        }
      },
    });
  };

  const handleEnderecoSelect = (endereco) => {
    setSelectedEndereco(endereco);
    // Reset frete quando endereco mudar
    setSelectedFrete(null);
  };

  const handlePaymentDataChange = (data) => {
    setPaymentData(data);
  };

  const handleFinalizarPagamento = async () => {
    if (pedidoConfirmado?.paymentResponseData) {
      setShowFinalizarModal(false);
      await openPaymentUrl(pedidoConfirmado.paymentResponseData);

      // Navegar para Meus Pedidos após um breve delay
      setTimeout(() => {
        navigation.navigate("MeusPedidos");
      }, 1000);
    }
  };

  const handlePagarDepois = () => {
    setShowFinalizarModal(false);
    navigation.navigate("MeusPedidos");
  };

  const handleCloseModal = () => {
    setShowFinalizarModal(false);
    navigation.navigate("MeusPedidos");
  };

  const openPaymentUrl = async (paymentData) => {
    try {
      // Log completo dos dados de pagamento recebidos
        console.log("💳 Dados completos do pagamento recebidos:",
        JSON.stringify(paymentData, null, 2)
      );

      // Usar init_point para produção ou sandbox_init_point para desenvolvimento
      // Priorizar produção
      const paymentUrl =
        paymentData.init_point || paymentData.sandbox_init_point;

      if (!paymentUrl) {
        console.error("❌ URLs de pagamento não encontradas:", {
          init_point: paymentData.init_point,
          sandbox_init_point: paymentData.sandbox_init_point,
        });
        throw new Error("URL de pagamento não encontrada na resposta");
      }

        console.log({
        payment_id: paymentData.payment_id,
        preference_id: paymentData.preference_id,
        transaction_amount: paymentData.transaction_amount,
        status: paymentData.payment?.status,
      });

      // Verificar se a URL pode ser aberta
      const supported = await Linking.canOpenURL(paymentUrl);

      if (supported) {

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
        paymentData.init_point || paymentData.sandbox_init_point;
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

    // Verificar se há apenas vouchers no carrinho (não precisa de frete físico)
    const apenasVouchers =
      cartItems.length === 0 && voucherCartItems.length > 0;

    if (!apenasVouchers && !selectedFrete) {
      Alert.alert(
        "Frete Obrigatório",
        "Selecione uma opção de frete para continuar.",
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
      }));

      // Buscar vouchers do carrinho
      const voucherCartItems = await CartService.getVoucherCartItems();
      const vouchers = voucherCartItems.map((item) => ({
        voucher_id: item.voucher_id,
        quantidade: item.quantity,
      }));

      // Verificar se há apenas vouchers (frete grátis)
      const apenasVouchers = produtos.length === 0 && vouchers.length > 0;
      let taxaEntrega = 0;
      let modalidadeEntrega = "DELIVERY"; // padrão

      if (!apenasVouchers) {
        if (deliveryMethod === "DELIVERY") {
          taxaEntrega = selectedFrete?.preco || 0.0;
        } else {
          taxaEntrega = 0.0;
          modalidadeEntrega = "PICKUP";
        }
      }

      const pedidoPayload = {
        ...(selectedEndereco?.endereco_id && deliveryMethod === "DELIVERY" && { endereco_id: selectedEndereco.endereco_id }),
        status: "PENDENTE",
        statusEntrega: "PENDENTE",
        statusPagamento: "PENDING",
        observacoes: modalidadeEntrega === "PICKUP" ? "Retirar na Barbearia" : "",
        taxa_entrega: taxaEntrega,
        produtos: produtos,
        vouchers: vouchers,
      };

      // Debug dos dados de pagamento
        console.log("🔍 PaymentData recebido:",
        JSON.stringify(paymentData, null, 2)
      );

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
        text2: "Configurando pagamento...",
        visibilityTime: 2000,
      });

      // 5. Preparar dados para o modal
        console.log("🛒 [DEBUG] CarrinhoScreen - selectedFrete antes do modal:",
        selectedFrete
      );

      // Para vouchers, criar um objeto de frete simulado se não houver
      let freteParaModal = selectedFrete;
      
      if (apenasVouchers) {
        freteParaModal = {
          serviceCode: "VOUCHER_DIGITAL",
          serviceDescription: "Entrega Digital",
          carrier: "Email",
          preco: 0,
          deliveryTime: "Imediata",
        };
      } else if (deliveryMethod === "PICKUP") {
        freteParaModal = {
          serviceCode: "PICKUP",
          serviceDescription: "Retirar na Barbearia",
          carrier: "Barbearia",
          preco: 0,
          deliveryTime: "Imediata",
        };
      }

      const dadosPedido = {
        pedidoId: pedidoResponse.pedido_id,
        endereco: selectedEndereco,
        total: getTotalComFrete(),
        frete: freteParaModal,
        installments: paymentData.installments || 1,
        paymentResponseData: paymentResponseData,
      };

        console.log("🛒 [DEBUG] CarrinhoScreen - dadosPedido criado:",
        dadosPedido
      );

      // 6. Mostrar modal de confirmação
      setPedidoConfirmado(dadosPedido);
      setShowFinalizarModal(true);
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
                size={18}
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
              <MaterialIcons name="add" size={18} color={isDark ? "#FFF" : "#000"} />
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
              <MaterialIcons name="image" size={32} color={isDark ? "#555" : "#ccc"} />
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
                size={18}
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
              <MaterialIcons name="add" size={18} color={isDark ? "#FFF" : "#000"} />
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

  const isCheckoutValid = () => {
    if (cartItems.length === 0 && voucherCartItems.length === 0) return false;

    // Se tiver apenas vouchers, não precisa validar endereço e frete (é entrega digital)
    const apenasVouchers = cartItems.length === 0 && voucherCartItems.length > 0;

    if (!apenasVouchers) {
      if (deliveryMethod === "DELIVERY") {
        if (!selectedEndereco || !selectedFrete) return false;
      }
    }

    if (
      !paymentData.payer_email ||
      !paymentData.payer_identification_number ||
      paymentData.payer_identification_number.length !== 11
    ) {
      return false;
    }

    return true;
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary || "#7C4DFF"} />
        <Text style={styles.loadingText}>Carregando carrinho...</Text>
      </View>
    );
  }

  if (cartItems.length === 0 && voucherCartItems.length === 0) {
    return (
      <View style={styles.container}>
        {/* Header com botão de voltar para nunca travar o usuário */}
        <View
          style={[
            styles.header,
            {
              paddingTop:
                (Platform.OS === "ios"
                  ? insets.top || 44
                  : insets.top || 20) + 4,
            },
          ]}
        >
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => {
              if (navigation.canGoBack()) {
                navigation.goBack();
              } else {
                navigation.navigate("MainTabs", { screen: "Loja" });
              }
            }}
            activeOpacity={0.7}
          >
            <MaterialIcons
              name="arrow-back"
              size={22}
              color={isDark ? "#FFFFFF" : "#1A1A1A"}
            />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Meu Carrinho</Text>
          <View style={{ width: 40 }} />
        </View>

        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconCircle}>
            <MaterialIcons
              name="remove-shopping-cart"
              size={48}
              color={isDark ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.3)"}
            />
          </View>
          <Text style={styles.emptyText}>Seu carrinho está vazio</Text>
          <Text style={styles.emptySubtext}>
            Adicione produtos ou serviços da Sans Company para finalizar sua compra
          </Text>
          <TouchableOpacity
            style={styles.continueShoppingButton}
            onPress={() => navigation.navigate("MainTabs", { screen: "Loja" })}
            activeOpacity={0.8}
          >
            <Text style={styles.continueShoppingText}>Ir para a Loja</Text>
          </TouchableOpacity>
        </View>

        {/* Modal de Confirmação */}
        <ConfirmModal
          visible={confirmModal.visible}
          title={confirmModal.title}
          message={confirmModal.message}
          confirmText={confirmModal.confirmText}
          confirmColor={confirmModal.confirmColor}
          iconName={confirmModal.iconName}
          loading={confirmModal.loading}
          onConfirm={confirmModal.onConfirm}
          onCancel={() =>
            setConfirmModal((prev) => ({ ...prev, visible: false }))
          }
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header da tela */}
      <View style={[styles.header, { paddingTop: (Platform.OS === "ios" ? insets.top || 44 : insets.top || 20) + 4 }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <MaterialIcons name="arrow-back" size={22} color={isDark ? "#FFFFFF" : "#1A1A1A"} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Meu Carrinho</Text>
        <TouchableOpacity
          style={styles.clearButton}
          onPress={handleClearCart}
          activeOpacity={0.7}
        >
          <MaterialIcons name="delete-sweep" size={22} color="#f44336" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
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

        {/* Modalidade de Entrega */}
        {cartItems.length > 0 && (
          <View style={styles.deliveryMethodContainer}>
            <Text style={styles.sectionHeader}>Forma de Entrega</Text>
            <View style={styles.deliveryTabs}>
              <TouchableOpacity
                style={[
                  styles.deliveryTab,
                  deliveryMethod === "DELIVERY" && styles.deliveryTabActive,
                ]}
                onPress={() => setDeliveryMethod("DELIVERY")}
                activeOpacity={0.8}
              >
                <MaterialIcons
                  name="local-shipping"
                  size={20}
                  color={deliveryMethod === "DELIVERY" ? "#FFFFFF" : (isDark ? "#8A8A90" : "#6B7280")}
                />
                <Text
                  style={[
                    styles.deliveryTabText,
                    deliveryMethod === "DELIVERY" && styles.deliveryTabTextActive,
                  ]}
                >
                  Receber em Casa
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.deliveryTab,
                  deliveryMethod === "PICKUP" && styles.deliveryTabActive,
                ]}
                onPress={() => setDeliveryMethod("PICKUP")}
                activeOpacity={0.8}
              >
                <MaterialIcons
                  name="storefront"
                  size={20}
                  color={deliveryMethod === "PICKUP" ? "#FFFFFF" : (isDark ? "#8A8A90" : "#6B7280")}
                />
                <Text
                  style={[
                    styles.deliveryTabText,
                    deliveryMethod === "PICKUP" && styles.deliveryTabTextActive,
                  ]}
                >
                  Retirar na Barbearia
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Seleção de Endereço (Apenas se Delivery) */}
        {cartItems.length > 0 && deliveryMethod === "DELIVERY" && (
          <>
            <EnderecoSelector
              onEnderecoSelect={handleEnderecoSelect}
              selectedEnderecoId={selectedEndereco?.endereco_id}
            />

            {/* Seleção de Frete */}
            {selectedEndereco && (
              <FreteSelector
                endereco={selectedEndereco}
                cartItems={cartItems}
                voucherCartItems={voucherCartItems}
                onFreteSelect={setSelectedFrete}
                selectedFrete={selectedFrete}
              />
            )}
          </>
        )}

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
            <Text style={styles.summaryValue}>
              {deliveryMethod === "PICKUP"
                ? "Grátis (Retirada)"
                : selectedFrete
                ? formatPrice(selectedFrete.preco)
                : "Selecione o endereço"}
            </Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total:</Text>
            <Text style={styles.totalValue}>
              {formatPrice(getTotalComFrete())}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={[
            styles.checkoutButton,
            !isCheckoutValid() && styles.checkoutButtonDisabled,
          ]}
          disabled={processing || !isCheckoutValid()}
          onPress={handleGoToPayment}
          activeOpacity={0.8}
        >
          {processing ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <>
              <MaterialIcons
                name="shopping-cart"
                size={20}
                color={!isCheckoutValid() ? (isDark ? "#888" : theme.colors.textMuted) : "white"}
                style={styles.checkoutIcon}
              />
              <Text
                style={[
                  styles.checkoutText,
                  !isCheckoutValid() && styles.checkoutTextDisabled,
                ]}
              >
                Finalizar Compra
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* Modal de Finalizar Compra */}
      <FinalizarCompraModal
        visible={showFinalizarModal}
        onClose={handleCloseModal}
        onFinalizarPagamento={handleFinalizarPagamento}
        onPagarDepois={handlePagarDepois}
        pedidoData={pedidoConfirmado}
        loading={processing}
      />

      {/* Modal de Confirmação para Remoção / Limpeza */}
      <ConfirmModal
        visible={confirmModal.visible}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmText={confirmModal.confirmText}
        confirmColor={confirmModal.confirmColor}
        iconName={confirmModal.iconName}
        loading={confirmModal.loading}
        onConfirm={confirmModal.onConfirm}
        onCancel={() =>
          setConfirmModal((prev) => ({ ...prev, visible: false }))
        }
      />
    </View>
  );
}

const getStyles = (theme, isDark, insets) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background || (isDark ? "#0F0F0F" : "#FFFFFF"),
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: isDark ? "#222226" : "#F0F0F0",
    backgroundColor: isDark ? "#141416" : "#FFFFFF",
    zIndex: 10,
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
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
  clearButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: isDark ? "rgba(244, 67, 54, 0.12)" : "rgba(244, 67, 54, 0.06)",
    justifyContent: "center",
    alignItems: "center",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 15,
    color: isDark ? "#8A8A90" : theme.colors.textMuted,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  emptyIconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: isDark ? "rgba(255, 255, 255, 0.06)" : "#F5F7FA",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  emptyText: {
    fontSize: 19,
    fontWeight: "700",
    color: isDark ? "#F2F2F5" : "#1A1A1A",
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: isDark ? "#8A8A90" : theme.colors.textMuted,
    textAlign: "center",
    marginBottom: 24,
  },
  continueShoppingButton: {
    backgroundColor: theme.colors.primary || "#7C4DFF",
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 24,
    shadowColor: theme.colors.primary || "#7C4DFF",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  continueShoppingText: {
    color: "white",
    fontSize: 15,
    fontWeight: "700",
  },
  scrollContainer: {
    flex: 1,
  },
  itemsHeader: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: isDark ? "#121214" : "#F8F9FA",
    borderBottomWidth: 1,
    borderBottomColor: isDark ? "#222226" : "#F0F0F0",
  },
  itemsCount: {
    fontSize: 14,
    fontWeight: "600",
    color: isDark ? "#D0D0D5" : theme.colors.foreground,
  },
  deliveryMethodContainer: {
    marginVertical: 12,
    paddingHorizontal: 16,
  },
  deliveryTabs: {
    flexDirection: "row",
    backgroundColor: isDark ? "#121214" : "#F0F0F0",
    borderRadius: 10,
    padding: 3,
    marginTop: 6,
  },
  deliveryTab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  deliveryTabActive: {
    backgroundColor: theme.colors.primary || "#7C4DFF",
    shadowColor: theme.colors.primary || "#7C4DFF",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 2,
  },
  deliveryTabText: {
    fontSize: 12,
    fontWeight: "600",
    color: isDark ? "#8A8A90" : "#6B7280",
  },
  deliveryTabTextActive: {
    color: "#FFFFFF",
  },
  cartItem: {
    flexDirection: "row",
    backgroundColor: isDark ? "#1A1A1E" : "#FFFFFF",
    padding: 14,
    marginVertical: 4,
    marginHorizontal: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: isDark ? "#282830" : "rgba(0,0,0,0.06)",
    shadowColor: isDark ? "#000" : "rgba(0,0,0,0.06)",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: isDark ? 0.3 : 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  itemImageContainer: {
    width: 72,
    height: 72,
    borderRadius: 10,
    overflow: "hidden",
    marginRight: 14,
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
    fontSize: 15,
    fontWeight: "600",
    color: isDark ? "#F2F2F5" : theme.colors.foreground,
    marginBottom: 4,
  },
  itemCategory: {
    fontSize: 12,
    color: isDark ? "#8A8A90" : "#6B7280",
    marginBottom: 2,
  },
  itemPrice: {
    fontSize: 14,
    color: theme.colors.primary || "#7C4DFF",
    fontWeight: "700",
  },
  quantityContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: isDark ? "#121214" : "#F0F0F0",
    borderRadius: 8,
    padding: 3,
    alignSelf: "flex-start",
    marginTop: 6,
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
    marginLeft: 12,
  },
  itemTotal: {
    fontSize: 15,
    fontWeight: "800",
    color: theme.colors.primary || "#7C4DFF",
    marginBottom: 12,
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
    color: isDark ? "#8A8A90" : theme.colors.textMuted,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: "600",
    color: isDark ? "#F2F2F5" : theme.colors.foreground,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: isDark ? "#222226" : "#F0F0F0",
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
  checkoutButtonDisabled: {
    backgroundColor: isDark ? "#24242A" : "#E5E5EA",
  },
  checkoutIcon: {
    marginRight: 8,
  },
  checkoutText: {
    color: "white",
    fontSize: 16,
    fontWeight: "700",
  },
  checkoutTextDisabled: {
    color: isDark ? "#666" : "#9CA3AF",
  },
  captionText: {
    fontSize: 12,
    color: isDark ? "#9CA3AF" : "#6B7280",
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: "700",
    color: isDark ? "#FFFFFF" : "#1A1A1A",
    marginHorizontal: 16,
    marginVertical: 12,
    marginTop: 18,
  },
});
