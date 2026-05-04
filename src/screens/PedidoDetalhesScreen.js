import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Linking,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { useTheme } from "../utils/ThemeContext";
import { formatPrice } from "../api/products";
import { formatVoucherPrice } from "../api/vouchers";
import {
  getPedidoDetalhes,
  formatarStatusPedido,
  formatarStatusEntrega,
  formatarStatusPagamento,
  calcularTotalPedido,
} from "../api/pedidoDetalhesApi";
import { createPayment } from "../api/paymentsApi";
import Toast from "react-native-toast-message";

export default function PedidoDetalhesScreen({ route, navigation }) {
  const { theme, isDarkMode } = useTheme();
  const styles = getStyles(theme, isDarkMode);

  const { pedidoId } = route.params;
  const [pedido, setPedido] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pagamentoLoading, setPagamentoLoading] = useState(false);

  useEffect(() => {
    carregarDetalhes();
  }, [pedidoId]);

  const carregarDetalhes = async () => {
    try {
      setLoading(true);
      const detalhes = await getPedidoDetalhes(pedidoId);
      setPedido(detalhes);
    } catch (error) {
      console.error("Erro ao carregar detalhes:", error);
      Toast.show({
        type: "error",
        text1: "Erro",
        text2: "Não foi possível carregar os detalhes do pedido",
        visibilityTime: 3000,
      });
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const irParaPagamento = async () => {
    if (!pedido) return;

    try {
      setPagamentoLoading(true);

      const paymentPayload = {
        pedidoId: pedido.pedido_id,
        installments: 1,
        payerData: {
          email: pedido.user.user_email,
          identification: {
            type: "CPF",
            number: "00000000000",
          },
        },
      };

      console.log("💳 [DEBUG] Criando pagamento:", paymentPayload);
      const paymentResponse = await createPayment(paymentPayload);
      console.log("📦 [DEBUG] Resposta completa da API:", JSON.stringify(paymentResponse, null, 2));

      const paymentData = paymentResponse.data || paymentResponse;
      console.log("🔍 [DEBUG] Dados extraídos para pagamento:", JSON.stringify(paymentData, null, 2));

      if (paymentData && (paymentData.init_point || paymentData.sandbox_init_point)) {
        await openPaymentUrl(paymentData);
        setTimeout(() => {
          navigation.navigate("MeusPedidos");
        }, 1000);
      } else {
        console.error("❌ Estrutura da resposta:", paymentResponse);
        throw new Error("Erro ao processar pagamento - URLs não encontradas");
      }
    } catch (error) {
      console.error("Erro no pagamento:", error);
      Toast.show({
        type: "error",
        text1: "Erro no Pagamento",
        text2: error.message || "Não foi possível processar o pagamento",
        visibilityTime: 3000,
      });
    } finally {
      setPagamentoLoading(false);
    }
  };

  const openPaymentUrl = async (paymentData) => {
    try {
      console.log("💳 [DEBUG] Abrindo URL de pagamento:", paymentData.init_point || paymentData.sandbox_init_point);

      const paymentUrl = paymentData.init_point || paymentData.sandbox_init_point;

      if (!paymentUrl) {
        throw new Error("URL de pagamento não encontrada na resposta");
      }

      const supported = await Linking.canOpenURL(paymentUrl);

      if (supported) {
        Toast.show({
          type: "info",
          text1: "Redirecionando",
          text2: "Abrindo gateway do Mercado Pago...",
          visibilityTime: 2000,
        });

        setTimeout(async () => {
          await Linking.openURL(paymentUrl);
        }, 500);
      } else {
        throw new Error("URL de pagamento não suportada pelo dispositivo");
      }
    } catch (error) {
      console.error("❌ Erro ao abrir URL de pagamento:", error);
      Alert.alert(
        "Erro ao Abrir Pagamento",
        "Não foi possível redirecionar automaticamente para o pagamento.",
        [{ text: "OK" }]
      );
    }
  };

  const formatarData = (dataString) => {
    const data = new Date(dataString);
    return data.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer} edges={["top"]}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <MaterialIcons name="arrow-back" size={24} color={theme.colors.foreground} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Detalhes do Pedido</Text>
          <View style={styles.headerRight} />
        </View>
        <View style={styles.loadingContent}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Carregando detalhes...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!pedido) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <MaterialIcons name="arrow-back" size={24} color={theme.colors.foreground} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Detalhes do Pedido</Text>
          <View style={styles.headerRight} />
        </View>
        <View style={styles.errorContainer}>
          <MaterialIcons name="error" size={48} color={theme.colors.textMuted} />
          <Text style={styles.errorText}>Pedido não encontrado</Text>
        </View>
      </SafeAreaView>
    );
  }

  const statusPedido = formatarStatusPedido(pedido.status);
  const statusEntrega = formatarStatusEntrega(pedido.statusEntrega);
  const statusPagamento = formatarStatusPagamento(pedido.statusPagamento);
  const total = calcularTotalPedido(pedido);

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <MaterialIcons name="arrow-back" size={24} color={theme.colors.foreground} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{`Pedido #${pedido.pedido_id}`}</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <View style={styles.pedidoHeader}>
            <View>
              <Text style={styles.pedidoTitle}>Pedido #{pedido.pedido_id}</Text>
              <Text style={styles.pedidoData}>{formatarData(pedido.created_at)}</Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: statusPedido.color }]}>
              <MaterialIcons name={statusPedido.icon} size={16} color="white" />
              <Text style={styles.statusText}>{statusPedido.text}</Text>
            </View>
          </View>
        </View>

        <View style={styles.statusContainer}>
          <View style={styles.statusCard}>
            <MaterialIcons name={statusEntrega.icon} size={24} color={statusEntrega.color} />
            <Text style={styles.statusCardTitle}>Entrega</Text>
            <Text style={[styles.statusCardValue, { color: statusEntrega.color }]}>{statusEntrega.text}</Text>
          </View>

          <View style={styles.statusCard}>
            <MaterialIcons name={statusPagamento.icon} size={24} color={statusPagamento.color} />
            <Text style={styles.statusCardTitle}>Pagamento</Text>
            <Text style={[styles.statusCardValue, { color: statusPagamento.color }]}>{statusPagamento.text}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MaterialIcons name="location-on" size={20} color={theme.colors.primary} />
            <Text style={styles.sectionTitle}>Endereço de Entrega</Text>
          </View>
          <View style={styles.enderecoCard}>
            <Text style={styles.enderecoText}>{pedido.endereco.rua}, {pedido.endereco.numero}</Text>
            <Text style={styles.enderecoText}>{pedido.endereco.bairro}, {pedido.endereco.cidade}/{pedido.endereco.estado}</Text>
            <Text style={styles.enderecoText}>CEP: {pedido.endereco.cep}</Text>
          </View>
        </View>

        {pedido.pedido_product && pedido.pedido_product.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <MaterialIcons name="shopping-cart" size={20} color={theme.colors.primary} />
              <Text style={styles.sectionTitle}>Produtos</Text>
            </View>
            {pedido.pedido_product.map((item, index) => (
              <View key={index} style={styles.itemCard}>
                <View style={styles.itemInfo}>
                  <Text style={styles.itemName}>{item.product.product_name}</Text>
                  <Text style={styles.itemDescription} numberOfLines={2}>{item.product.product_description}</Text>
                </View>
                <View style={styles.itemPricing}>
                  <Text style={styles.itemQuantity}>Qtd: {item.pedido_product_quantity}</Text>
                  <Text style={styles.itemPrice}>{formatPrice(item.product.product_price)}</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {pedido.pedido_voucher && pedido.pedido_voucher.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <MaterialIcons name="card-giftcard" size={20} color={theme.colors.primary} />
              <Text style={styles.sectionTitle}>Vouchers</Text>
            </View>
            {pedido.pedido_voucher.map((item, index) => (
              <View key={index} style={styles.itemCard}>
                <View style={styles.itemInfo}>
                  <Text style={styles.itemName}>{item.voucher.voucher_name}</Text>
                  <Text style={styles.itemDescription} numberOfLines={2}>{item.voucher.voucher_description}</Text>
                </View>
                <View style={styles.itemPricing}>
                  <Text style={styles.itemPrice}>{formatVoucherPrice(item.voucher.voucher_price)}</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MaterialIcons name="receipt" size={20} color={theme.colors.primary} />
            <Text style={styles.sectionTitle}>Resumo Financeiro</Text>
          </View>
          <View style={styles.resumoCard}>
            <View style={styles.resumoRow}>
              <Text style={styles.resumoLabel}>Subtotal:</Text>
              <Text style={styles.resumoValue}>{formatPrice(total - (pedido.taxa_entrega || 0))}</Text>
            </View>
            <View style={styles.resumoRow}>
              <Text style={styles.resumoLabel}>Entrega:</Text>
              <Text style={styles.resumoValue}>{formatPrice(pedido.taxa_entrega || 0)}</Text>
            </View>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total:</Text>
              <Text style={styles.totalValue}>{formatPrice(total)}</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {statusPagamento.needsPayment && (
        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.paymentButton, pagamentoLoading && styles.paymentButtonDisabled]}
            onPress={irParaPagamento}
            disabled={pagamentoLoading}
          >
            {pagamentoLoading ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <>
                <MaterialIcons name="payment" size={20} color="white" />
                <Text style={styles.paymentButtonText}>Ir para Pagamento</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const getStyles = (theme, isDarkMode) => StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.backgroundSecondary },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: theme.colors.card,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderLight,
  },
  backButton: { padding: 8 },
  headerTitle: { fontSize: 18, fontWeight: "600", color: theme.colors.foreground, flex: 1, textAlign: "center" },
  headerRight: { width: 40 },
  loadingContainer: { flex: 1, backgroundColor: theme.colors.backgroundSecondary },
  loadingContent: { flex: 1, justifyContent: "center", alignItems: "center" },
  loadingText: { marginTop: 16, fontSize: 16, color: theme.colors.textMuted },
  errorContainer: { flex: 1, justifyContent: "center", alignItems: "center", padding: 32 },
  errorText: { marginTop: 16, fontSize: 16, color: theme.colors.textMuted, textAlign: "center" },
  content: { flex: 1, paddingHorizontal: 16 },
  section: { marginTop: 16 },
  sectionHeader: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  sectionTitle: { fontSize: 16, fontWeight: "600", color: theme.colors.foreground, marginLeft: 8 },
  pedidoHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: theme.colors.card,
    padding: 16,
    borderRadius: 12,
    ...(isDarkMode ? {} : theme.shadows.sm),
  },
  pedidoTitle: { fontSize: 18, fontWeight: "600", color: theme.colors.foreground },
  pedidoData: { fontSize: 14, color: theme.colors.textMuted, marginTop: 4 },
  statusBadge: { flexDirection: "row", alignItems: "center", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16 },
  statusText: { fontSize: 12, fontWeight: "600", color: "white", marginLeft: 4 },
  statusContainer: { flexDirection: "row", gap: 12, marginTop: 16 },
  statusCard: { flex: 1, backgroundColor: theme.colors.card, padding: 16, borderRadius: 12, alignItems: "center", ...(isDarkMode ? {} : theme.shadows.sm) },
  statusCardTitle: { fontSize: 12, color: theme.colors.textMuted, marginTop: 8 },
  statusCardValue: { fontSize: 14, fontWeight: "600", marginTop: 4 },
  enderecoCard: { backgroundColor: theme.colors.card, padding: 16, borderRadius: 12, ...(isDarkMode ? {} : theme.shadows.sm) },
  enderecoText: { fontSize: 14, color: theme.colors.foreground, lineHeight: 20 },
  itemCard: {
    backgroundColor: theme.colors.card,
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    ...(isDarkMode ? {} : theme.shadows.sm),
  },
  itemInfo: { flex: 1, marginRight: 16 },
  itemName: { fontSize: 16, fontWeight: "600", color: theme.colors.foreground },
  itemDescription: { fontSize: 14, color: theme.colors.textMuted, marginTop: 4 },
  itemPricing: { alignItems: "flex-end" },
  itemQuantity: { fontSize: 12, color: theme.colors.textMuted },
  itemPrice: { fontSize: 14, fontWeight: "600", color: theme.colors.foreground, marginTop: 4 },
  resumoCard: { backgroundColor: theme.colors.card, padding: 16, borderRadius: 12, ...(isDarkMode ? {} : theme.shadows.sm) },
  resumoRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
  resumoLabel: { fontSize: 14, color: theme.colors.textMuted },
  resumoValue: { fontSize: 14, fontWeight: "500", color: theme.colors.foreground },
  totalRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingTop: 12, borderTopWidth: 1, borderTopColor: theme.colors.borderLight },
  totalLabel: { fontSize: 16, fontWeight: "600", color: theme.colors.foreground },
  totalValue: { fontSize: 18, fontWeight: "700", color: theme.colors.primary },
  footer: { backgroundColor: theme.colors.card, padding: 16, borderTopWidth: 1, borderTopColor: theme.colors.borderLight },
  paymentButton: { backgroundColor: theme.colors.primary, flexDirection: "row", justifyContent: "center", alignItems: "center", paddingVertical: 16, borderRadius: 12 },
  paymentButtonDisabled: { opacity: 0.7 },
  paymentButtonText: { color: "white", fontSize: 16, fontWeight: "600", marginLeft: 8 },
});
