import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { getUserPedidos } from "../api/pedidosApi";
import { formatarStatusPagamento, formatarStatusPedido, cancelarPedido } from "../api/pedidoDetalhesApi";
import { createTextStyle, createButtonStyle } from "../utils/theme";
import { useTheme } from "../utils/ThemeContext";
import Skeleton from "../components/ui/Skeleton";

const MeusPedidosScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const { isDarkMode } = theme;
  const styles = getStyles(theme, isDarkMode);

  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    carregarPedidos();

    // Listener para quando a tela ganha foco
    const unsubscribe = navigation.addListener("focus", () => {
      carregarPedidos();
    });

    return unsubscribe;
  }, [navigation]);

  const carregarPedidos = async () => {
    try {
      setLoading(true);
      const response = await getUserPedidos();

      if (response.success) {
        setPedidos(response.data);
      } else {
        Alert.alert("Erro", "Erro ao carregar pedidos");
      }
    } catch (error) {
      console.error("Erro ao carregar pedidos:", error);
      Alert.alert("Erro", "Erro ao carregar seus pedidos");
    } finally {
      setLoading(false);
    }
  };

  const navegarParaDetalhes = (pedidoId) => {
    navigation.navigate("PedidoDetalhes", { pedidoId });
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await carregarPedidos();
    setRefreshing(false);
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

  const confirmarCancelamento = (pedidoId) => {
    Alert.alert(
      "Cancelar Pedido",
      "Tem certeza que deseja cancelar este pedido? Se houver produtos reservados, eles voltarão para o estoque.",
      [
        { text: "Não, manter", style: "cancel" },
        {
          text: "Sim, cancelar",
          style: "destructive",
          onPress: async () => {
            try {
              setLoading(true);
              await cancelarPedido(pedidoId);
              Alert.alert("Sucesso", "Seu pedido foi cancelado com sucesso.");
              await carregarPedidos();
            } catch (err) {
              Alert.alert("Erro ao cancelar", err.message || "Não foi possível cancelar o pedido.");
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const getProductItemPrice = (product) => {
    if (!product) return 0;
    const promo = Number(product.promotional_price);
    const normal = Number(product.product_price) || 0;
    if (promo && promo > 0 && promo < normal) {
      return promo;
    }
    return normal;
  };

  const calcularTotalPedido = (pedido) => {
    if (!pedido) return 0;
    const pedidoProducts = pedido.pedido_product || [];
    const pedidoVouchers = pedido.pedido_voucher || [];

    const totalProducts = pedidoProducts.reduce((total, pItem) => {
      const price = getProductItemPrice(pItem.product);
      const qty = Number(pItem.pedido_product_quantity) || 1;
      return total + price * qty;
    }, 0);

    const totalVouchers = pedidoVouchers.reduce((total, vItem) => {
      const price = Number(vItem.voucher?.voucher_price) || 0;
      const qty = Number(vItem.pedido_voucher_quantity) || 1;
      return total + price * qty;
    }, 0);

    const taxaEntrega = Number(pedido.taxa_entrega) || 0;

    return totalProducts + totalVouchers + taxaEntrega;
  };

  const obterBadgeStatusCard = (item) => {
    // 1. Cancelado
    if (item.status === "CANCELADO" || item.statusPagamento === "CANCELLED") {
      return { text: "Cancelado", color: "#ef4444", icon: "cancel" };
    }

    // 2. Concluído
    if (item.status === "CONCLUIDO" || item.status === "CONCLUÍDO") {
      return { text: "Concluído", color: "#10b981", icon: "check-circle" };
    }

    // 3. Status de Entrega (se for delivery e estiver enviado ou entregue)
    if (item.statusEntrega === "ENTREGUE") {
      return { text: "Entregue", color: "#10b981", icon: "done-all" };
    }
    if (item.statusEntrega === "ENVIADO") {
      return { text: "Enviado", color: "#3b82f6", icon: "local-shipping" };
    }

    // 4. Pagamento Pendente
    if (item.statusPagamento === "PENDING" || item.statusPagamento === "PENDENTE") {
      return { text: "Pagamento Pendente", color: "#f59e0b", icon: "schedule" };
    }

    // 5. Se já foi pago
    if (
      item.statusPagamento === "APPROVED" ||
      item.statusPagamento === "PAID" ||
      item.statusPagamento === "APROVADO"
    ) {
      if (!item.endereco || (item.observacoes && item.observacoes.toLowerCase().includes("retirar"))) {
        return { text: "Pronto p/ Retirar", color: "#10b981", icon: "storefront" };
      }
      return { text: "Confirmado", color: "#3b82f6", icon: "check-circle" };
    }

    return formatarStatusPedido(item.status);
  };

  const renderPedidoCard = ({ item }) => {
    const total = calcularTotalPedido(item);
    const badgeStatus = obterBadgeStatusCard(item);
    const isPago = Boolean(
      item.statusPagamento === "APPROVED" ||
      item.statusPagamento === "PAID" ||
      item.statusPagamento === "APROVADO"
    );
    const isCancelado = item.status === "CANCELADO" || item.statusPagamento === "CANCELLED";
    const podeCancelar = item.status === "PENDENTE" && item.statusEntrega !== "ENVIADO" && item.statusEntrega !== "ENTREGUE";

    return (
      <TouchableOpacity
        style={styles.pedidoCard}
        onPress={() => navegarParaDetalhes(item.pedido_id)}
        activeOpacity={0.7}
      >
        {/* Header do Card */}
        <View style={styles.cardHeader}>
          <View style={styles.pedidoInfo}>
            <Text style={styles.pedidoId}>Pedido #{item.pedido_id}</Text>
            <Text style={styles.pedidoData}>
              {formatarData(item.created_at)}
            </Text>
          </View>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: badgeStatus.color },
            ]}
          >
            <MaterialIcons
              name={badgeStatus.icon}
              size={16}
              color="white"
            />
            <Text style={styles.statusText}>{badgeStatus.text}</Text>
          </View>
        </View>

        {/* Endereço de Entrega ou Retirada */}
        <View style={styles.enderecoSection}>
          <MaterialIcons
            name={item.endereco ? "location-on" : "storefront"}
            size={16}
            color={
              item.endereco
                ? theme.colors.textMuted
                : isCancelado
                ? "#ef4444"
                : isPago
                ? theme.colors.primary
                : "#f59e0b"
            }
          />
          <Text
            style={[
              styles.enderecoText,
              !item.endereco && {
                color: isCancelado
                  ? "#ef4444"
                  : isPago
                  ? theme.colors.primary
                  : "#d97706",
                fontWeight: "600",
              },
            ]}
          >
            {item.endereco
              ? `${item.endereco.rua}, ${item.endereco.numero} - ${item.endereco.bairro}${item.endereco.complemento ? `, ${item.endereco.complemento}` : ""}`
              : isCancelado
              ? "Retirada na Barbearia (Cancelado)"
              : isPago
              ? "Seu produto está pronto para retirar na loja!"
              : "Retirar na Barbearia (Aguardando Pagamento)"}
          </Text>
        </View>

        {/* Lista de Produtos */}
        <View style={styles.produtosSection}>
          <Text style={styles.sectionTitle}>Itens:</Text>
          {item.pedido_product.map((produtoItem, index) => {
            const price = getProductItemPrice(produtoItem.product);
            const qty = Number(produtoItem.pedido_product_quantity) || 1;
            return (
              <View key={index} style={styles.produtoItem}>
                <Text style={styles.produtoNome}>
                  {qty}x {produtoItem.product?.product_name}
                </Text>
                <Text style={styles.produtoPreco}>
                  R$ {(price * qty).toFixed(2)}
                </Text>
              </View>
            );
          })}
          {Number(item.taxa_entrega) > 0 && (
            <View style={styles.produtoItem}>
              <Text style={[styles.produtoNome, { color: theme.colors.textMuted }]}>
                Taxa de Entrega
              </Text>
              <Text style={styles.produtoPreco}>
                R$ {Number(item.taxa_entrega).toFixed(2)}
              </Text>
            </View>
          )}
        </View>

        {/* Vouchers (se houver) */}
        {item.pedido_voucher && item.pedido_voucher.length > 0 && (
          <>
            {item.pedido_voucher.map((voucherItem, index) => (
              <View key={index} style={styles.produtoItem}>
                <Text style={styles.produtoNome}>{voucherItem.pedido_voucher_quantity}x {voucherItem.voucher.voucher_name}</Text>
                <Text style={styles.produtoPreco}>R$ {(voucherItem.voucher.voucher_price * voucherItem.pedido_voucher_quantity).toFixed(2)}</Text>
              </View>
            ))}
          </>
        )}

        {/* Observações (se houver) */}
        {item.observacoes && (
          <View style={styles.observacoesSection}>
            <Text style={styles.sectionTitle}>Observações:</Text>
            <Text style={styles.observacoesText}>{item.observacoes}</Text>
          </View>
        )}

        {/* Footer com Total e Ações */}
        <View style={styles.cardFooter}>
          <View style={styles.totalSection}>
            <Text style={styles.totalLabel}>Total:</Text>
            <Text style={styles.totalValue}>R$ {total.toFixed(2)}</Text>
          </View>
          <View style={{ flexDirection: "row", gap: 8, alignItems: "center" }}>
            {podeCancelar && !isCancelado && (
              <TouchableOpacity
                style={styles.cancelarCardButton}
                onPress={() => confirmarCancelamento(item.pedido_id)}
              >
                <Text style={styles.cancelarCardButtonText}>Cancelar</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={styles.detalhesButton}
              onPress={() => navegarParaDetalhes(item.pedido_id)}
            >
              <Text style={styles.detalhesButtonText}>Ver Detalhes</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <MaterialIcons name="receipt-long" size={64} color={theme.colors.textMuted} />
      <Text style={styles.emptyTitle}>Nenhum pedido encontrado</Text>
      <Text style={styles.emptySubtitle}>
        Seus pedidos aparecerão aqui após realizar uma compra
      </Text>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        {/* Header */}
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
          <Text style={styles.headerTitle}>Meus Pedidos</Text>
          <View style={styles.headerSpacer} />
        </View>
        <View style={styles.listContainer}>
          {[1, 2, 3].map((key) => (
            <View key={key} style={styles.pedidoCard}>
              <View style={styles.cardHeader}>
                <View style={styles.pedidoInfo}>
                  <Skeleton width={100} height={18} style={{ marginBottom: 4 }} />
                  <Skeleton width={140} height={14} />
                </View>
                <Skeleton width={80} height={24} style={{ borderRadius: 12 }} />
              </View>
              <View style={styles.enderecoSection}>
                <Skeleton width={20} height={20} style={{ marginRight: 8, borderRadius: 10 }} />
                <Skeleton width="80%" height={14} />
              </View>
              <View style={styles.cardFooter}>
                <View style={styles.totalSection}>
                  <Skeleton width={60} height={14} style={{ marginBottom: 4 }} />
                  <Skeleton width={80} height={20} />
                </View>
                <Skeleton width={80} height={16} />
              </View>
            </View>
          ))}
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
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
        <Text style={styles.headerTitle}>Meus Pedidos</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Lista de Pedidos */}
      <FlatList
        data={pedidos}
        keyExtractor={(item, index) => item.pedido_id ? item.pedido_id.toString() : index.toString()}
        renderItem={renderPedidoCard}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[theme.colors.primary]}
          />
        }
        ListEmptyComponent={renderEmptyState}
      />
    </SafeAreaView>
  );
};

const getStyles = (theme, isDarkMode) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.backgroundSecondary,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    backgroundColor: theme.colors.card,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderLight,
  },
  backButton: {
    padding: theme.spacing.sm,
  },
  headerTitle: {
    ...createTextStyle("h3", "textPrimary", theme),
  },
  headerSpacer: {
    width: 40, // Para equilibrar o botão de voltar
  },
  listContainer: {
    padding: theme.spacing.lg,
    flexGrow: 1,
  },
  pedidoCard: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    ...(isDarkMode ? {} : theme.shadows.sm),
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: theme.spacing.md,
  },
  pedidoInfo: {
    flex: 1,
  },
  pedidoId: {
    ...createTextStyle("body", "textPrimary", theme),
    fontWeight: "600",
  },
  pedidoData: {
    ...createTextStyle("caption", "textMuted", theme),
    marginTop: 2,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
  },
  statusText: {
    ...createTextStyle("caption", "white", theme),
    fontWeight: "600",
    marginLeft: theme.spacing.xs,
  },
  enderecoSection: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: theme.spacing.md,
    paddingHorizontal: theme.spacing.sm,
  },
  enderecoText: {
    ...createTextStyle("caption", "textMuted", theme),
    marginLeft: theme.spacing.sm,
    flex: 1,
  },
  produtosSection: {
    marginBottom: theme.spacing.md,
  },
  sectionTitle: {
    ...createTextStyle("caption", "textPrimary", theme),
    fontWeight: "600",
    marginBottom: theme.spacing.sm,
  },
  produtoItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: theme.spacing.xs,
  },
  produtoNome: {
    ...createTextStyle("caption", "textPrimary", theme),
    flex: 1,
  },
  produtoPreco: {
    ...createTextStyle("caption", "textPrimary", theme),
    fontWeight: "600",
  },
  observacoesSection: {
    marginBottom: theme.spacing.md,
  },
  observacoesText: {
    ...createTextStyle("caption", "textMuted", theme),
    fontStyle: "italic",
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: theme.colors.borderLight,
    paddingTop: theme.spacing.md,
  },
  totalSection: {
    flex: 1,
  },
  totalLabel: {
    ...createTextStyle("caption", "textMuted", theme),
  },
  totalValue: {
    ...createTextStyle("body", "textPrimary", theme),
    fontWeight: "700",
    fontSize: theme.fontSizes.lg,
  },
  detalhesButton: {
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
  },
  detalhesButtonText: {
    ...createTextStyle("caption", "primary", theme),
    fontWeight: "600",
    textDecorationLine: "underline",
  },
  cancelarCardButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: isDarkMode ? "#451a1a" : "#fecaca",
    backgroundColor: isDarkMode ? "#2d1212" : "#fff5f5",
  },
  cancelarCardButtonText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#ef4444",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    ...createTextStyle("body", "textMuted", theme),
    marginTop: theme.spacing.md,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: theme.spacing.xl,
  },
  emptyTitle: {
    ...createTextStyle("h3", "textPrimary", theme),
    marginTop: theme.spacing.lg,
    textAlign: "center",
  },
  emptySubtitle: {
    ...createTextStyle("body", "textMuted", theme),
    marginTop: theme.spacing.sm,
    textAlign: "center",
  },
});

export default MeusPedidosScreen;
