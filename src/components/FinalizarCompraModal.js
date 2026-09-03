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
import { useTheme } from "../utils/ThemeContext";
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
  const { theme, themeMode } = useTheme();
  const isDark = theme?.isDarkMode ?? (themeMode === "dark");
  const styles = getStyles(theme, isDark);

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
          {endereco && frete?.serviceCode !== "PICKUP" && frete?.serviceCode !== "VOUCHER_DIGITAL" && (
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
          )}
          {/* Frete - sempre mostrar */}
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
                color={isDark ? "#8A8A90" : "#6B7280"}
              />
              <Text style={styles.infoText}>
                Pagamento processado com segurança pelo Mercado Pago
              </Text>
            </View>
            <View style={styles.infoItem}>
              <MaterialIcons
                name="info"
                size={16}
                color={isDark ? "#8A8A90" : "#6B7280"}
              />
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
        {/* Aviso discreto sobre redirecionamento ao Mercado Pago */}
        <View style={styles.captionContainer}>
          <Text style={styles.captionText}>
            Ao finalizar, você será redirecionado ao Mercado Pago para concluir o pagamento.
          </Text>
        </View>
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
    backgroundColor: isDark ? "#141416" : "white",
    paddingHorizontal: 20,
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: isDark ? "#242428" : "#F0F0F0",
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: isDark ? "#FFFFFF" : theme.colors.foreground,
    marginLeft: 12,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  section: {
    marginTop: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: isDark ? "#FFFFFF" : theme.colors.foreground,
    marginLeft: 8,
  },
  pedidoHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: isDark ? "#1A1A1E" : "white",
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: isDark ? "#282830" : "rgba(0,0,0,0.06)",
    shadowColor: isDark ? "#000" : "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: isDark ? 0.3 : 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  pedidoTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: isDark ? "#FFFFFF" : theme.colors.foreground,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: isDark ? "#2E2E36" : theme.colors.muted,
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
    backgroundColor: isDark ? "#1A1A1E" : "white",
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: isDark ? "#282830" : "rgba(0,0,0,0.06)",
    shadowColor: isDark ? "#000" : "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: isDark ? 0.3 : 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  enderecoText: {
    fontSize: 14,
    color: isDark ? "#E0E0E5" : theme.colors.foreground,
    lineHeight: 20,
  },
  freteCard: {
    backgroundColor: isDark ? "#1A1A1E" : "white",
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: isDark ? "#282830" : "rgba(0,0,0,0.06)",
    shadowColor: isDark ? "#000" : "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: isDark ? 0.3 : 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  freteRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  freteLabel: {
    fontSize: 14,
    color: isDark ? "#8A8A90" : "#6B7280",
  },
  freteValue: {
    fontSize: 14,
    fontWeight: "600",
    color: isDark ? "#F2F2F5" : theme.colors.foreground,
  },
  pagamentoCard: {
    backgroundColor: isDark ? "#1A1A1E" : "white",
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: isDark ? "#282830" : "rgba(0,0,0,0.06)",
    shadowColor: isDark ? "#000" : "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: isDark ? 0.3 : 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  pagamentoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  pagamentoLabel: {
    fontSize: 14,
    color: isDark ? "#8A8A90" : "#6B7280",
  },
  pagamentoValue: {
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
    borderTopColor: isDark ? "#282830" : "#F0F0F0",
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: "700",
    color: isDark ? "#FFFFFF" : theme.colors.foreground,
  },
  totalValue: {
    fontSize: 20,
    fontWeight: "800",
    color: theme.colors.primary || "#7C4DFF",
  },
  infoSection: {
    marginTop: 20,
    marginBottom: 28,
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  infoText: {
    fontSize: 12,
    color: isDark ? "#8A8A90" : "#6B7280",
    marginLeft: 8,
    flex: 1,
    lineHeight: 16,
  },
  footer: {
    flexDirection: "row",
    backgroundColor: isDark ? "#141416" : "white",
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: isDark ? "#242428" : "#F0F0F0",
    gap: 12,
  },
  button: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 16,
    borderRadius: 14,
  },
  primaryButton: {
    backgroundColor: theme.colors.primary || "#7C4DFF",
  },
  secondaryButton: {
    backgroundColor: isDark ? "#1A1A1E" : "transparent",
    borderWidth: 1,
    borderColor: isDark ? "#2E2E36" : theme.colors.border,
  },
  primaryButtonText: {
    color: "white",
    fontSize: 15,
    fontWeight: "700",
    marginLeft: 8,
  },
  secondaryButtonText: {
    color: isDark ? "#FFFFFF" : theme.colors.foreground,
    fontSize: 15,
    fontWeight: "600",
  },
  buttonIcon: {
    marginRight: 4,
  },
  captionContainer: {
    backgroundColor: isDark ? "#141416" : "white",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderTopColor: isDark ? "#242428" : "#F0F0F0",
  },
  captionText: {
    fontSize: 12,
    color: isDark ? "#9CA3AF" : "#6B7280",
    textAlign: "center",
    lineHeight: 16,
  },
});
