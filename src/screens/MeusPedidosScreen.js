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
import { theme, createTextStyle, createButtonStyle } from "../utils/theme";

const MeusPedidosScreen = ({ navigation }) => {
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    carregarPedidos();
  }, []);

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

  const calcularTotalPedido = (pedidoProducts, pedidoVouchers) => {
    const totalProducts = pedidoProducts.reduce((total, item) => {
      return total + item.product.product_price * item.pedido_product_quantity;
    }, 0);

    const totalVouchers = pedidoVouchers.reduce((total, voucher) => {
      return total + voucher.voucher.voucher_price;
    }, 0);

    return totalProducts - totalVouchers;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "PENDENTE":
        return theme.colors.muted;
      case "CONFIRMADO":
        return theme.colors.primary;
      case "PREPARANDO":
        return "#f59e0b";
      case "SAIU_PARA_ENTREGA":
        return "#3b82f6";
      case "ENTREGUE":
        return theme.colors.success;
      case "CANCELADO":
        return theme.colors.destructive;
      default:
        return theme.colors.muted;
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "PENDENTE":
        return "schedule";
      case "CONFIRMADO":
        return "check-circle";
      case "PREPARANDO":
        return "restaurant";
      case "SAIU_PARA_ENTREGA":
        return "local-shipping";
      case "ENTREGUE":
        return "done-all";
      case "CANCELADO":
        return "cancel";
      default:
        return "help";
    }
  };

  const formatarStatus = (status) => {
    const statusMap = {
      PENDENTE: "Pendente",
      CONFIRMADO: "Confirmado",
      PREPARANDO: "Preparando",
      SAIU_PARA_ENTREGA: "Saiu para Entrega",
      ENTREGUE: "Entregue",
      CANCELADO: "Cancelado",
    };
    return statusMap[status] || status;
  };

  const renderPedidoCard = ({ item }) => {
    const total = calcularTotalPedido(
      item.pedido_product,
      item.pedido_voucher || []
    );
    const statusColor = getStatusColor(item.status);
    const statusIcon = getStatusIcon(item.status);

    return (
      <View style={styles.pedidoCard}>
        {/* Header do Card */}
        <View style={styles.cardHeader}>
          <View style={styles.pedidoInfo}>
            <Text style={styles.pedidoId}>Pedido #{item.pedido_id}</Text>
            <Text style={styles.pedidoData}>
              {formatarData(item.created_at)}
            </Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
            <MaterialIcons name={statusIcon} size={16} color="white" />
            <Text style={styles.statusText}>{formatarStatus(item.status)}</Text>
          </View>
        </View>

        {/* Endereço de Entrega */}
        <View style={styles.enderecoSection}>
          <MaterialIcons
            name="location-on"
            size={16}
            color={theme.colors.muted}
          />
          <Text style={styles.enderecoText}>
            {item.endereco.rua}, {item.endereco.numero} - {item.endereco.bairro}
            {item.endereco.complemento ? `, ${item.endereco.complemento}` : ""}
          </Text>
        </View>

        {/* Lista de Produtos */}
        <View style={styles.produtosSection}>
          <Text style={styles.sectionTitle}>Itens:</Text>
          {item.pedido_product.map((produtoItem, index) => (
            <View key={index} style={styles.produtoItem}>
              <Text style={styles.produtoNome}>
                {produtoItem.pedido_product_quantity}x{" "}
                {produtoItem.product.product_name}
              </Text>
              <Text style={styles.produtoPreco}>
                R${" "}
                {(
                  produtoItem.product.product_price *
                  produtoItem.pedido_product_quantity
                ).toFixed(2)}
              </Text>
            </View>
          ))}
        </View>

        {/* Vouchers (se houver) */}
        {item.pedido_voucher && item.pedido_voucher.length > 0 && (
          <View style={styles.vouchersSection}>
            <Text style={styles.sectionTitle}>Descontos:</Text>
            {item.pedido_voucher.map((voucherItem, index) => (
              <View key={index} style={styles.voucherItem}>
                <Text style={styles.voucherNome}>
                  {voucherItem.voucher.voucher_name}
                </Text>
                <Text style={styles.voucherDesconto}>
                  -R$ {voucherItem.voucher.voucher_price.toFixed(2)}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Observações (se houver) */}
        {item.observacoes && (
          <View style={styles.observacoesSection}>
            <Text style={styles.sectionTitle}>Observações:</Text>
            <Text style={styles.observacoesText}>{item.observacoes}</Text>
          </View>
        )}

        {/* Footer com Total */}
        <View style={styles.cardFooter}>
          <View style={styles.totalSection}>
            <Text style={styles.totalLabel}>Total:</Text>
            <Text style={styles.totalValue}>R$ {total.toFixed(2)}</Text>
          </View>
          <TouchableOpacity
            style={styles.detalhesButton}
            onPress={() => {
              Alert.alert(
                "Detalhes do Pedido",
                `Pedido #${item.pedido_id}\nStatus: ${formatarStatus(
                  item.status
                )}`
              );
            }}
          >
            <Text style={styles.detalhesButtonText}>Ver Detalhes</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <MaterialIcons name="receipt-long" size={64} color={theme.colors.muted} />
      <Text style={styles.emptyTitle}>Nenhum pedido encontrado</Text>
      <Text style={styles.emptySubtitle}>
        Seus pedidos aparecerão aqui após realizar uma compra
      </Text>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Carregando seus pedidos...</Text>
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
        keyExtractor={(item) => item.pedido_id.toString()}
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    backgroundColor: theme.colors.card,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  backButton: {
    padding: theme.spacing.sm,
  },
  headerTitle: {
    ...createTextStyle("h3", "foreground"),
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
    ...theme.shadows.sm,
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
    ...createTextStyle("body", "foreground"),
    fontWeight: "600",
  },
  pedidoData: {
    ...createTextStyle("caption", "muted"),
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
    ...createTextStyle("caption", "white"),
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
    ...createTextStyle("caption", "muted"),
    marginLeft: theme.spacing.sm,
    flex: 1,
  },
  produtosSection: {
    marginBottom: theme.spacing.md,
  },
  sectionTitle: {
    ...createTextStyle("caption", "foreground"),
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
    ...createTextStyle("caption", "foreground"),
    flex: 1,
  },
  produtoPreco: {
    ...createTextStyle("caption", "foreground"),
    fontWeight: "600",
  },
  vouchersSection: {
    marginBottom: theme.spacing.md,
  },
  voucherItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: theme.spacing.xs,
  },
  voucherNome: {
    ...createTextStyle("caption", "success"),
    flex: 1,
  },
  voucherDesconto: {
    ...createTextStyle("caption", "success"),
    fontWeight: "600",
  },
  observacoesSection: {
    marginBottom: theme.spacing.md,
  },
  observacoesText: {
    ...createTextStyle("caption", "muted"),
    fontStyle: "italic",
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    paddingTop: theme.spacing.md,
  },
  totalSection: {
    flex: 1,
  },
  totalLabel: {
    ...createTextStyle("caption", "muted"),
  },
  totalValue: {
    ...createTextStyle("body", "foreground"),
    fontWeight: "700",
    fontSize: theme.fontSizes.lg,
  },
  detalhesButton: {
    ...createButtonStyle("outline", "sm"),
  },
  detalhesButtonText: {
    ...createTextStyle("caption", "primary"),
    fontWeight: "600",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    ...createTextStyle("body", "muted"),
    marginTop: theme.spacing.md,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: theme.spacing.xl,
  },
  emptyTitle: {
    ...createTextStyle("h3", "foreground"),
    marginTop: theme.spacing.lg,
    textAlign: "center",
  },
  emptySubtitle: {
    ...createTextStyle("body", "muted"),
    marginTop: theme.spacing.sm,
    textAlign: "center",
  },
});

export default MeusPedidosScreen;
