import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  StyleSheet,
  Dimensions,
  RefreshControl,
} from "react-native";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { theme } from "../utils/theme";
import {
  getVouchers,
  formatVoucherPrice,
  formatPartnerName,
  isVoucherAvailable,
  getVoucherMainImage,
} from "../api/vouchers";
import Toast from "react-native-toast-message";

const { width: screenWidth } = Dimensions.get("window");
const ITEM_WIDTH = (screenWidth - 48) / 2; // 2 colunas com 16px de margin

export default function VouchersScreen({ navigation }) {
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadVouchers();
  }, []);

  const loadVouchers = async () => {
    try {
      setLoading(true);
      console.log("Carregando vouchers...");
      const vouchersData = await getVouchers();
      console.log("Vouchers carregados:", vouchersData.length);
      setVouchers(vouchersData);
    } catch (error) {
      console.error("Erro ao carregar vouchers:", error);
      Toast.show({
        type: "error",
        text1: "Erro",
        text2: "Não foi possível carregar os vouchers",
        visibilityTime: 4000,
      });
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadVouchers();
    setRefreshing(false);
  };

  const navigateToVoucher = (voucherId) => {
    navigation.navigate("SingleVoucher", { voucherId });
  };

  const VoucherItem = ({ item }) => {
    const mainImage = getVoucherMainImage(item);
    const available = isVoucherAvailable(item.voucher_quantity);
    const partnerName = formatPartnerName(item.partner);

    return (
      <TouchableOpacity
        style={styles.voucherItem}
        onPress={() => navigateToVoucher(item.voucher_id)}
        activeOpacity={0.7}
      >
        <View style={styles.imageContainer}>
          {mainImage ? (
            <Image source={{ uri: mainImage }} style={styles.voucherImage} />
          ) : (
            <View style={styles.noImageContainer}>
              <MaterialIcons name="card-giftcard" size={40} color="#ccc" />
              <Text style={styles.noImageText}>Sem imagem</Text>
            </View>
          )}

          {/* Badge do parceiro */}
          <View style={styles.partnerBadge}>
            <Text style={styles.partnerText} numberOfLines={1}>
              {partnerName}
            </Text>
          </View>

          {/* Badge de disponibilidade */}
          {!available && (
            <View style={styles.unavailableBadge}>
              <Text style={styles.unavailableText}>Esgotado</Text>
            </View>
          )}
        </View>

        <View style={styles.voucherInfo}>
          <Text style={styles.voucherName} numberOfLines={2}>
            {item.voucher_name || "Voucher sem nome"}
          </Text>

          <View style={styles.priceContainer}>
            <Text style={styles.voucherPrice}>
              {formatVoucherPrice(item.voucher_price)}
            </Text>
          </View>

          <View style={styles.quantityContainer}>
            <MaterialIcons
              name="confirmation-number"
              size={14}
              color={available ? "#4CAF50" : "#f44336"}
            />
            <Text
              style={[
                styles.quantityText,
                { color: available ? "#4CAF50" : "#f44336" },
              ]}
            >
              {available ? `${item.voucher_quantity} disponíveis` : "Esgotado"}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderHeader = () => (
    <View style={styles.titleSection}>
      <Text style={styles.sectionTitle}>Vouchers Disponíveis</Text>
      <Text style={styles.sectionSubtitle}>
        Encontre os melhores vouchers de desconto
      </Text>
    </View>
  );

  const renderEmpty = () => {
    if (loading) return null;

    return (
      <View style={styles.emptyContainer}>
        <MaterialIcons name="card-giftcard" size={64} color="#ccc" />
        <Text style={styles.emptyText}>Nenhum voucher encontrado</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadVouchers}>
          <Text style={styles.retryButtonText}>Tentar novamente</Text>
        </TouchableOpacity>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Carregando vouchers...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={vouchers}
        keyExtractor={(item) => item.voucher_id.toString()}
        renderItem={VoucherItem}
        ListHeaderComponent={renderHeader}
        numColumns={2}
        columnWrapperStyle={styles.row}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[theme.colors.primary]}
          />
        }
        ListEmptyComponent={renderEmpty}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={
          vouchers.length === 0
            ? styles.emptyListContainer
            : styles.listContainer
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  titleSection: {
    paddingHorizontal: 16,
    paddingVertical: 20,
    backgroundColor: theme.colors.background,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: theme.colors.foreground,
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 16,
    color: "#666",
    fontWeight: "400",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: theme.colors.background,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: theme.colors.muted,
  },
  listContainer: {
    paddingBottom: 20,
  },
  row: {
    justifyContent: "space-between",
    paddingHorizontal: 16,
  },
  voucherItem: {
    width: ITEM_WIDTH,
    backgroundColor: "#ffffff",
    borderRadius: 12,
    marginBottom: 16,
    // iOS Shadow
    shadowColor: "#000000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    // Android Shadow
    elevation: 8,
    overflow: "visible",
    // Garante que o background seja renderizado para a sombra funcionar no iOS
    borderWidth: 0,
  },
  imageContainer: {
    position: "relative",
    width: "100%",
    height: ITEM_WIDTH * 0.8,
  },
  voucherImage: {
    width: "100%",
    height: "100%",
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    backgroundColor: "#f0f0f0",
  },
  noImageContainer: {
    width: "100%",
    height: "100%",
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  noImageText: {
    marginTop: 8,
    fontSize: 12,
    color: "#999",
  },
  partnerBadge: {
    position: "absolute",
    top: 8,
    left: 8,
    backgroundColor: theme.colors.primary,
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    maxWidth: ITEM_WIDTH * 0.7,
  },
  partnerText: {
    color: "white",
    fontSize: 10,
    fontWeight: "600",
  },
  unavailableBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "#f44336",
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  unavailableText: {
    color: "white",
    fontSize: 10,
    fontWeight: "600",
  },
  voucherInfo: {
    padding: 12,
  },
  voucherName: {
    fontSize: 14,
    fontWeight: "600",
    color: theme.colors.foreground,
    marginBottom: 8,
    lineHeight: 18,
  },
  priceContainer: {
    marginBottom: 8,
  },
  voucherPrice: {
    fontSize: 16,
    fontWeight: "bold",
    color: theme.colors.primary,
  },
  quantityContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  quantityText: {
    fontSize: 12,
    fontWeight: "500",
    marginLeft: 4,
  },
  emptyContainer: {
    alignItems: "center",
    padding: 32,
  },
  emptyListContainer: {
    flexGrow: 1,
    justifyContent: "center",
  },
  emptyText: {
    fontSize: 16,
    color: theme.colors.muted,
    marginTop: 16,
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
});
