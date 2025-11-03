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
import { theme } from "../utils/theme";
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

      // Payload correto conforme a API
      const paymentPayload = {
        pedidoId: pedido.pedido_id,
        installments: 1,
        payerData: {
          email: pedido.user.user_email,
          identification: {
            type: "CPF",
            number: "00000000000", // Pode precisar ser obtido de outra forma
          },
        },
      };

      console.log("💳 Processando pagamento do pedido...");
      console.log("📝 Payload:", JSON.stringify(paymentPayload, null, 2));

      const paymentResponse = await createPayment(paymentPayload);
      console.log(
        "📦 Resposta completa da API:",
        JSON.stringify(paymentResponse, null, 2)
      );

      // A resposta da API tem os dados dentro de 'data'
      const paymentData = paymentResponse.data || paymentResponse;
      console.log(
        "🔍 Dados extraídos para pagamento:",
        JSON.stringify(paymentData, null, 2)
      );

      if (
        paymentData &&
        (paymentData.init_point || paymentData.sandbox_init_point)
      ) {
        console.log("✅ URLs encontradas, prosseguindo com pagamento...");
        // Usar a mesma lógica do CarrinhoScreen para abrir o pagamento
        await openPaymentUrl(paymentData);

        // Após o redirecionamento, navegar para "Meus Pedidos"
        setTimeout(() => {
          navigation.navigate("MeusPedidos");
        }, 1000);
      } else {
        console.error("❌ Estrutura da resposta:", paymentResponse);
        console.error("❌ PaymentData extraído:", paymentData);
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
      // Log completo dos dados de pagamento recebidos
      console.log(
        "💳 Dados completos do pagamento recebidos:",
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
        {/* Header customizado com botão de voltar */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <MaterialIcons
              name="arrow-back"
              size={24}
              color={theme.colors.foreground}
            />
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
        {/* Header customizado com botão de voltar */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <MaterialIcons
              name="arrow-back"
              size={24}
              color={theme.colors.foreground}
            />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Detalhes do Pedido</Text>
          <View style={styles.headerRight} />
        </View>
        <View style={styles.errorContainer}>
          <MaterialIcons name="error" size={48} color={theme.colors.muted} />
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
      {/* Header customizado com botão de voltar */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <MaterialIcons
            name="arrow-back"
            size={24}
            color={theme.colors.foreground}
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{`Pedido #${pedido.pedido_id}`}</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header do Pedido */}
        <View style={styles.section}>
          <View style={styles.pedidoHeader}>
            <View>
              <Text style={styles.pedidoTitle}>Pedido #{pedido.pedido_id}</Text>
              <Text style={styles.pedidoData}>
                {formatarData(pedido.created_at)}
              </Text>
            </View>
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: statusPedido.color },
              ]}
            >
              <MaterialIcons name={statusPedido.icon} size={16} color="white" />
              <Text style={styles.statusText}>{statusPedido.text}</Text>
            </View>
          </View>
        </View>

        {/* Status Cards */}
        <View style={styles.statusContainer}>
          <View style={styles.statusCard}>
            <MaterialIcons
              name={statusEntrega.icon}
              size={24}
              color={statusEntrega.color}
            />
            <Text style={styles.statusCardTitle}>Entrega</Text>
            <Text
              style={[styles.statusCardValue, { color: statusEntrega.color }]}
            >
              {statusEntrega.text}
            </Text>
          </View>

          <View style={styles.statusCard}>
            <MaterialIcons
              name={statusPagamento.icon}
              size={24}
              color={statusPagamento.color}
            />
            <Text style={styles.statusCardTitle}>Pagamento</Text>
            <Text
              style={[styles.statusCardValue, { color: statusPagamento.color }]}
            >
              {statusPagamento.text}
            </Text>
          </View>
        </View>

        {/* Endereço de Entrega */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MaterialIcons
              name="location-on"
              size={20}
              color={theme.colors.primary}
            />
            <Text style={styles.sectionTitle}>Endereço de Entrega</Text>
          </View>
          <View style={styles.enderecoCard}>
            <Text style={styles.enderecoText}>
              {pedido.endereco.rua}, {pedido.endereco.numero}
            </Text>
            <Text style={styles.enderecoText}>
              {pedido.endereco.bairro}, {pedido.endereco.cidade}/
              {pedido.endereco.estado}
            </Text>
            <Text style={styles.enderecoText}>CEP: {pedido.endereco.cep}</Text>
            {pedido.endereco.complemento && (
              <Text style={styles.enderecoText}>
                {pedido.endereco.complemento}
              </Text>
            )}
          </View>
        </View>

        {/* Produtos */}
        {pedido.pedido_product && pedido.pedido_product.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <MaterialIcons
                name="shopping-cart"
                size={20}
                color={theme.colors.primary}
              />
              <Text style={styles.sectionTitle}>Produtos</Text>
            </View>
            {pedido.pedido_product.map((item, index) => (
              <View key={index} style={styles.itemCard}>
                <View style={styles.itemInfo}>
                  <Text style={styles.itemName}>
                    {item.product.product_name}
                  </Text>
                  <Text style={styles.itemDescription} numberOfLines={2}>
                    {item.product.product_description}
                  </Text>
                  <Text style={styles.itemCategory}>
                    {item.product.product_category}
                  </Text>
                </View>
                <View style={styles.itemPricing}>
                  <Text style={styles.itemQuantity}>
                    Qtd: {item.pedido_product_quantity}
                  </Text>
                  <Text style={styles.itemPrice}>
                    {formatPrice(item.product.product_price)}
                  </Text>
                  <Text style={styles.itemTotal}>
                    Total:{" "}
                    {formatPrice(
                      item.product.product_price * item.pedido_product_quantity
                    )}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Vouchers */}
        {pedido.pedido_voucher && pedido.pedido_voucher.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <MaterialIcons
                name="card-giftcard"
                size={20}
                color={theme.colors.primary}
              />
              <Text style={styles.sectionTitle}>Vouchers</Text>
            </View>
            {pedido.pedido_voucher.map((item, index) => (
              <View key={index} style={styles.itemCard}>
                <View style={styles.itemInfo}>
                  <Text style={styles.itemName}>
                    {item.voucher.voucher_name}
                  </Text>
                  <Text style={styles.itemDescription} numberOfLines={2}>
                    {item.voucher.voucher_description}
                  </Text>
                  <Text style={styles.itemValidate}>
                    Válido até:{" "}
                    {new Date(item.voucher.data_validade).toLocaleDateString(
                      "pt-BR"
                    )}
                  </Text>
                </View>
                <View style={styles.itemPricing}>
                  <Text style={styles.itemPrice}>
                    {formatVoucherPrice(item.voucher.voucher_price)}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Códigos de Voucher */}
        {pedido.voucher_codigos && pedido.voucher_codigos.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <MaterialIcons
                name="qr-code"
                size={20}
                color={theme.colors.primary}
              />
              <Text style={styles.sectionTitle}>Códigos dos Vouchers</Text>
            </View>
            {pedido.voucher_codigos.map((codigo, index) => (
              <View key={index} style={styles.codigoCard}>
                <View style={styles.codigoHeader}>
                  <Text style={styles.codigoNome}>
                    {codigo.voucher.voucher_name}
                  </Text>
                  <Text style={styles.codigoValor}>
                    {formatVoucherPrice(codigo.voucher.voucher_price)}
                  </Text>
                </View>
                <View style={styles.codigoInfo}>
                  <Text style={styles.codigoTexto}>Código:</Text>
                  <Text style={styles.codigoNumero}>{codigo.voucher_code}</Text>
                </View>
                {codigo.voucher.partner && (
                  <Text style={styles.codigoPartner}>
                    📍 {codigo.voucher.partner.partner_name}
                  </Text>
                )}
              </View>
            ))}
          </View>
        )}

        {/* Resumo Financeiro */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MaterialIcons
              name="receipt"
              size={20}
              color={theme.colors.primary}
            />
            <Text style={styles.sectionTitle}>Resumo Financeiro</Text>
          </View>
          <View style={styles.resumoCard}>
            {/* Subtotal Produtos */}
            {pedido.pedido_product && pedido.pedido_product.length > 0 && (
              <View style={styles.resumoRow}>
                <Text style={styles.resumoLabel}>Produtos:</Text>
                <Text style={styles.resumoValue}>
                  {formatPrice(
                    pedido.pedido_product.reduce(
                      (total, item) =>
                        total +
                        item.product.product_price *
                          item.pedido_product_quantity,
                      0
                    )
                  )}
                </Text>
              </View>
            )}

            {/* Subtotal Vouchers */}
            {pedido.pedido_voucher && pedido.pedido_voucher.length > 0 && (
              <View style={styles.resumoRow}>
                <Text style={styles.resumoLabel}>Vouchers:</Text>
                <Text style={styles.resumoValue}>
                  {formatPrice(
                    pedido.pedido_voucher.reduce(
                      (total, item) => total + item.voucher.voucher_price,
                      0
                    )
                  )}
                </Text>
              </View>
            )}

            {/* Taxa de Entrega */}
            <View style={styles.resumoRow}>
              <Text style={styles.resumoLabel}>Entrega:</Text>
              <Text style={styles.resumoValue}>
                {formatPrice(pedido.taxa_entrega || 0)}
              </Text>
            </View>

            {/* Total */}
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total:</Text>
              <Text style={styles.totalValue}>{formatPrice(total)}</Text>
            </View>
          </View>
        </View>

        {/* Observações */}
        {pedido.observacoes && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <MaterialIcons
                name="note"
                size={20}
                color={theme.colors.primary}
              />
              <Text style={styles.sectionTitle}>Observações</Text>
            </View>
            <View style={styles.observacoesCard}>
              <Text style={styles.observacoesText}>{pedido.observacoes}</Text>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Botão de Pagamento (se necessário) */}
      {statusPagamento.needsPayment && (
        <View style={styles.footer}>
          <TouchableOpacity
            style={[
              styles.paymentButton,
              pagamentoLoading && styles.paymentButtonDisabled,
            ]}
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "white",
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  backButton: {
    padding: 8,
    borderRadius: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: theme.colors.foreground,
    flex: 1,
    textAlign: "center",
    marginHorizontal: 16,
  },
  headerRight: {
    width: 40, // Para balancear o botão de voltar
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  loadingContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: theme.colors.muted,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  errorText: {
    marginTop: 16,
    fontSize: 16,
    color: theme.colors.muted,
    textAlign: "center",
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  section: {
    marginTop: 16,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: theme.colors.foreground,
    marginLeft: 8,
  },
  pedidoHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "white",
    padding: 16,
    borderRadius: 12,
    ...theme.shadows.sm,
  },
  pedidoTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: theme.colors.foreground,
  },
  pedidoData: {
    fontSize: 14,
    color: theme.colors.muted,
    marginTop: 4,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
    color: "white",
    marginLeft: 4,
  },
  statusContainer: {
    flexDirection: "row",
    gap: 12,
    marginTop: 16,
  },
  statusCard: {
    flex: 1,
    backgroundColor: "white",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    ...theme.shadows.sm,
  },
  statusCardTitle: {
    fontSize: 12,
    color: theme.colors.muted,
    marginTop: 8,
  },
  statusCardValue: {
    fontSize: 14,
    fontWeight: "600",
    marginTop: 4,
  },
  enderecoCard: {
    backgroundColor: "white",
    padding: 16,
    borderRadius: 12,
    ...theme.shadows.sm,
  },
  enderecoText: {
    fontSize: 14,
    color: theme.colors.foreground,
    lineHeight: 20,
  },
  itemCard: {
    backgroundColor: "white",
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    ...theme.shadows.sm,
  },
  itemInfo: {
    flex: 1,
    marginRight: 16,
  },
  itemName: {
    fontSize: 16,
    fontWeight: "600",
    color: theme.colors.foreground,
  },
  itemDescription: {
    fontSize: 14,
    color: theme.colors.muted,
    marginTop: 4,
  },
  itemCategory: {
    fontSize: 12,
    color: theme.colors.primary,
    marginTop: 4,
    fontWeight: "500",
  },
  itemValidate: {
    fontSize: 12,
    color: theme.colors.muted,
    marginTop: 4,
  },
  itemPricing: {
    alignItems: "flex-end",
  },
  itemQuantity: {
    fontSize: 12,
    color: theme.colors.muted,
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: "600",
    color: theme.colors.foreground,
    marginTop: 4,
  },
  itemTotal: {
    fontSize: 12,
    color: theme.colors.primary,
    marginTop: 4,
    fontWeight: "500",
  },
  codigoCard: {
    backgroundColor: "white",
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.primary,
    ...theme.shadows.sm,
  },
  codigoHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  codigoNome: {
    fontSize: 16,
    fontWeight: "600",
    color: theme.colors.foreground,
    flex: 1,
  },
  codigoValor: {
    fontSize: 14,
    fontWeight: "600",
    color: theme.colors.primary,
  },
  codigoInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  codigoTexto: {
    fontSize: 14,
    color: theme.colors.muted,
    marginRight: 8,
  },
  codigoNumero: {
    fontSize: 16,
    fontWeight: "700",
    color: theme.colors.foreground,
    fontFamily: "monospace",
    backgroundColor: theme.colors.muted + "20",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  codigoPartner: {
    fontSize: 12,
    color: theme.colors.muted,
    marginTop: 4,
  },
  resumoCard: {
    backgroundColor: "white",
    padding: 16,
    borderRadius: 12,
    ...theme.shadows.sm,
  },
  resumoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  resumoLabel: {
    fontSize: 14,
    color: theme.colors.muted,
  },
  resumoValue: {
    fontSize: 14,
    fontWeight: "500",
    color: theme.colors.foreground,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: theme.colors.foreground,
  },
  totalValue: {
    fontSize: 18,
    fontWeight: "700",
    color: theme.colors.primary,
  },
  observacoesCard: {
    backgroundColor: "white",
    padding: 16,
    borderRadius: 12,
    ...theme.shadows.sm,
  },
  observacoesText: {
    fontSize: 14,
    color: theme.colors.foreground,
    lineHeight: 20,
  },
  footer: {
    backgroundColor: "white",
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
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
  paymentButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
});
