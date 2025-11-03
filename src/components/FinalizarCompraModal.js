import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
} from "react-native";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { theme } from "../utils/theme";
import { formatPrice } from "../api/products";
import { SafeAreaView } from "react-native-safe-area-context";

export default function FinalizarCompraModal({
  visible,
  onClose,
  onFinalizarPagamento,
  onPagarDepois,
  pedidoData,
  loading = false,
}) {
  if (!pedidoData) return null;

  const { pedidoId, endereco, total, frete, installments } = pedidoData;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <MaterialIcons
              name="check-circle"
              size={24}
              color={theme.colors.success}
            />
            <Text style={styles.headerTitle}>Pedido Confirmado!</Text>
          </View>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Pedido Info */}
          <View style={styles.section}>
            <View style={styles.pedidoHeader}>
              <Text style={styles.pedidoTitle}>Pedido #{pedidoId}</Text>
              <View style={styles.statusBadge}>
                <MaterialIcons name="schedule" size={16} color="white" />
                <Text style={styles.statusText}>Pendente</Text>
              </View>
            </View>
          </View>
          {/* Endereço */}
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
                {endereco.rua}, {endereco.numero}
              </Text>
              <Text style={styles.enderecoText}>
                {endereco.bairro}, {endereco.cidade}/{endereco.estado}
              </Text>
              {endereco.complemento && (
                <Text style={styles.enderecoText}>{endereco.complemento}</Text>
              )}
            </View>
          </View>
          {/* Frete - sempre mostrar se há endereço */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <MaterialIcons
                name="local-shipping"
                size={20}
                color={theme.colors.primary}
              />
              <Text style={styles.sectionTitle}>Entrega</Text>
            </View>
            <View style={styles.freteCard}>
              <View style={styles.freteRow}>
                <Text style={styles.freteLabel}>Modalidade:</Text>
                <Text style={styles.freteValue}>
                  {frete?.serviceDescription ||
                    frete?.nome ||
                    "Não selecionado"}
                </Text>
              </View>
              <View style={styles.freteRow}>
                <Text style={styles.freteLabel}>Valor:</Text>
                <Text style={styles.freteValue}>
                  {frete
                    ? formatPrice(frete.preco || frete.valor || 0)
                    : "R$ 0,00"}
                </Text>
              </View>
              <View style={styles.freteRow}>
                <Text style={styles.freteLabel}>Prazo:</Text>
                <Text style={styles.freteValue}>
                  {frete?.deliveryTime === "Imediata"
                    ? "Imediata (por email)"
                    : `${frete?.deliveryTime || frete?.prazo_entrega || 0} ${
                        (frete?.deliveryTime || frete?.prazo_entrega) === 1 ||
                        (frete?.deliveryTime || frete?.prazo_entrega) === "1"
                          ? "dia útil"
                          : "dias úteis"
                      }`}
                </Text>
              </View>
            </View>
          </View>
          {/* Pagamento */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <MaterialIcons
                name="payment"
                size={20}
                color={theme.colors.primary}
              />
              <Text style={styles.sectionTitle}>Resumo do Pagamento</Text>
            </View>
            <View style={styles.pagamentoCard}>
              {installments > 1 && (
                <View style={styles.pagamentoRow}>
                  <Text style={styles.pagamentoLabel}>Parcelas:</Text>
                  <Text style={styles.pagamentoValue}>
                    {installments}x de {formatPrice(total / installments)}
                  </Text>
                </View>
              )}
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Total:</Text>
                <Text style={styles.totalValue}>{formatPrice(total)}</Text>
              </View>
            </View>
          </View>
          {/* Informações Adicionais */}
          <View style={styles.infoSection}>
            <View style={styles.infoItem}>
              <MaterialIcons
                name="security"
                size={16}
                color={theme.colors.muted}
              />
              <Text style={styles.infoText}>
                Pagamento processado com segurança pelo Mercado Pago
              </Text>
            </View>
            <View style={styles.infoItem}>
              <MaterialIcons name="info" size={16} color={theme.colors.muted} />
              <Text style={styles.infoText}>
                Você pode acompanhar o status do seu pedido na aba "Meus
                Pedidos"
              </Text>
            </View>
          </View>
        </ScrollView>

        {/* Footer com Botões */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.button, styles.secondaryButton]}
            onPress={onPagarDepois}
            disabled={loading}
          >
            <Text style={styles.secondaryButtonText}>Pagar Depois</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.primaryButton]}
            onPress={onFinalizarPagamento}
            disabled={loading}
          >
            <Text style={styles.primaryButtonText}>
              {loading ? "Processando..." : "Finalizar Pagamento"}
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    backgroundColor: "white",
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: theme.colors.foreground,
    marginLeft: 12,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginTop: 24,
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
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.muted,
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
  freteCard: {
    backgroundColor: "white",
    padding: 16,
    borderRadius: 12,
    ...theme.shadows.sm,
  },
  freteRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  freteLabel: {
    fontSize: 14,
    color: theme.colors.muted,
  },
  freteValue: {
    fontSize: 14,
    fontWeight: "500",
    color: theme.colors.foreground,
  },
  pagamentoCard: {
    backgroundColor: "white",
    padding: 16,
    borderRadius: 12,
    ...theme.shadows.sm,
  },
  pagamentoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  pagamentoLabel: {
    fontSize: 14,
    color: theme.colors.muted,
  },
  pagamentoValue: {
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
  infoSection: {
    marginTop: 24,
    marginBottom: 32,
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  infoText: {
    fontSize: 12,
    color: theme.colors.muted,
    marginLeft: 8,
    flex: 1,
    lineHeight: 16,
  },
  footer: {
    flexDirection: "row",
    backgroundColor: "white",
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    gap: 12,
  },
  button: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 16,
    borderRadius: 12,
  },
  primaryButton: {
    backgroundColor: theme.colors.primary,
  },
  secondaryButton: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  primaryButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  secondaryButtonText: {
    color: theme.colors.foreground,
    fontSize: 16,
    fontWeight: "600",
  },
  buttonIcon: {
    marginRight: 4,
  },
});
