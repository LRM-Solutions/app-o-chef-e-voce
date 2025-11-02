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
import { createPayment, getNotificationUrl } from "../api/paymentsApi";
import Toast from "react-native-toast-message";
import CustomHeader from "../components/CustomHeader";

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

      // Preparar dados do pagamento similar ao CarrinhoScreen
      const total = calcularTotalPedido(pedido);

      // Dados básicos para o pagamento (pode precisar ser ajustado conforme necessário)
      const paymentData = {
        payer_email: pedido.user.user_email,
        payer_identification_number: "00000000000", // Pode precisar ser obtido de outra forma
        installments: 1,
      };

      const paymentPayload = {
        transaction_amount: total,
        description: `Pedido #${pedido.pedido_id}`,
        installments: paymentData.installments,
        payer: {
          email: paymentData.payer_email,
          identification: {
            type: "CPF",
            number: paymentData.payer_identification_number,
          },
        },
        notification_url: getNotificationUrl(),
        external_reference: `pedido_${pedido.pedido_id}`,
        pedido_id: pedido.pedido_id,
      };

      console.log("💳 Processando pagamento do pedido...");
      const paymentResponse = await createPayment(paymentPayload);

      if (paymentResponse && paymentResponse.init_point) {
        // Abrir o link de pagamento
        const supported = await Linking.canOpenURL(paymentResponse.init_point);
        if (supported) {
          await Linking.openURL(paymentResponse.init_point);

          Toast.show({
            type: "success",
            text1: "Redirecionamento",
            text2: "Você foi redirecionado para o pagamento",
            visibilityTime: 3000,
          });
        } else {
          throw new Error("Não foi possível abrir o link de pagamento");
        }
      } else {
        throw new Error("Erro ao processar pagamento");
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
      <View style={styles.loadingContainer}>
        <CustomHeader title="Detalhes do Pedido" />
        <View style={styles.loadingContent}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Carregando detalhes...</Text>
        </View>
      </View>
    );
  }

  if (!pedido) {
    return (
      <View style={styles.container}>
        <CustomHeader title="Detalhes do Pedido" />
        <View style={styles.errorContainer}>
          <MaterialIcons name="error" size={48} color={theme.colors.muted} />
          <Text style={styles.errorText}>Pedido não encontrado</Text>
        </View>
      </View>
    );
  }

  const statusPedido = formatarStatusPedido(pedido.status);
  const statusEntrega = formatarStatusEntrega(pedido.statusEntrega);
  const statusPagamento = formatarStatusPagamento(pedido.statusPagamento);
  const total = calcularTotalPedido(pedido);

  return (
    <View style={styles.container}>
      <CustomHeader title={`Pedido #${pedido.pedido_id}`} />

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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
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
