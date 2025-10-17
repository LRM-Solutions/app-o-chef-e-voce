import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  StyleSheet,
  Dimensions,
  ScrollView,
  Linking,
} from "react-native";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { theme } from "../utils/theme";
import {
  getVoucherById,
  formatVoucherPrice,
  formatPartnerName,
  isVoucherAvailable,
  getVoucherMainImage,
} from "../api/vouchers";
import { CartService } from "../services/cartService";
import Toast from "react-native-toast-message";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

export default function SingleVoucherScreen({ route, navigation }) {
  const { voucherId } = route.params;
  const [voucher, setVoucher] = useState(null);
  const [loading, setLoading] = useState(false);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    loadVoucher();
  }, [voucherId]);

  const loadVoucher = async () => {
    try {
      setLoading(true);
      console.log("Carregando voucher:", voucherId);
      const voucherData = await getVoucherById(voucherId);
      console.log("Voucher carregado:", voucherData);
      setVoucher(voucherData);
    } catch (error) {
      console.error("Erro ao carregar voucher:", error);
      Toast.show({
        type: "error",
        text1: "Erro",
        text2: "Não foi possível carregar o voucher",
        visibilityTime: 4000,
      });
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const handleQuantityChange = (increment) => {
    if (increment && quantity < voucher.voucher_quantity) {
      setQuantity(quantity + 1);
    } else if (!increment && quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const handleAddVoucherToCart = async () => {
    try {
      await CartService.addVoucherToCart(voucher, quantity);

      Toast.show({
        type: "success",
        text1: "Voucher adicionado!",
        text2: `${quantity}x ${voucher.voucher_name} adicionado ao carrinho`,
        visibilityTime: 3000,
      });

      // Reset da quantidade para 1 após adicionar
      setQuantity(1);
    } catch (error) {
      console.error("Erro ao adicionar voucher ao carrinho:", error);
      Toast.show({
        type: "error",
        text1: "Erro",
        text2: "Não foi possível adicionar o voucher ao carrinho",
        visibilityTime: 3000,
      });
    }
  };

  const handleVisitPartnerSite = async () => {
    if (voucher?.partner?.partner_site) {
      try {
        const url = voucher.partner.partner_site.startsWith("http")
          ? voucher.partner.partner_site
          : `https://${voucher.partner.partner_site}`;

        const supported = await Linking.canOpenURL(url);

        if (supported) {
          await Linking.openURL(url);
        } else {
          Toast.show({
            type: "error",
            text1: "Erro",
            text2: "Não foi possível abrir o site do parceiro",
            visibilityTime: 3000,
          });
        }
      } catch (error) {
        console.error("Erro ao abrir site do parceiro:", error);
        Toast.show({
          type: "error",
          text1: "Erro",
          text2: "Não foi possível abrir o site do parceiro",
          visibilityTime: 3000,
        });
      }
    }
  };

  const VoucherImage = () => {
    const imageUrl = getVoucherMainImage(voucher);

    if (!imageUrl) {
      return (
        <View style={styles.noImageContainer}>
          <MaterialIcons name="card-giftcard" size={80} color="#ccc" />
          <Text style={styles.noImageText}>Nenhuma imagem disponível</Text>
        </View>
      );
    }

    return (
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: imageUrl }}
          style={styles.voucherImage}
          resizeMode="cover"
        />
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Carregando voucher...</Text>
      </View>
    );
  }

  if (!voucher) {
    return (
      <View style={styles.errorContainer}>
        <MaterialIcons name="error" size={64} color="#ccc" />
        <Text style={styles.errorText}>Voucher não encontrado</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.retryButtonText}>Voltar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const available = isVoucherAvailable(voucher.voucher_quantity);
  const partnerName = formatPartnerName(voucher.partner);

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollContainer}>
        {/* Seção do nome do voucher com seta de voltar */}
        <View style={styles.voucherTitleSection}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <MaterialIcons name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.voucherName} numberOfLines={1}>
            {voucher?.voucher_name || "Carregando..."}
          </Text>
        </View>

        {/* Imagem do voucher */}
        <VoucherImage />

        {/* Informações do voucher */}
        <View style={styles.voucherInfo}>
          {/* Parceiro */}
          <View style={styles.partnerContainer}>
            <Text style={styles.partnerLabel}>{partnerName}</Text>
          </View>

          {/* Preço */}
          <Text style={styles.voucherPrice}>
            {formatVoucherPrice(voucher.voucher_price)}
          </Text>

          {/* Status da disponibilidade */}
          <View style={styles.availabilityContainer}>
            <MaterialIcons
              name="confirmation-number"
              size={18}
              color={available ? "#4CAF50" : "#f44336"}
            />
            <Text
              style={[
                styles.availabilityText,
                { color: available ? "#4CAF50" : "#f44336" },
              ]}
            >
              {available
                ? `${voucher.voucher_quantity} vouchers disponíveis`
                : "Voucher esgotado"}
            </Text>
          </View>

          {/* Seletor de quantidade */}
          {available && (
            <View style={styles.quantitySection}>
              <Text style={styles.quantityLabel}>Quantidade:</Text>
              <View style={styles.quantityContainer}>
                <TouchableOpacity
                  style={[
                    styles.quantityButton,
                    quantity === 1 && styles.quantityButtonDisabled,
                  ]}
                  onPress={() => handleQuantityChange(false)}
                  disabled={quantity === 1}
                >
                  <MaterialIcons name="remove" size={20} color="#000" />
                </TouchableOpacity>

                <Text style={styles.quantityText}>{quantity}</Text>

                <TouchableOpacity
                  style={[
                    styles.quantityButton,
                    quantity === voucher.voucher_quantity &&
                      styles.quantityButtonDisabled,
                  ]}
                  onPress={() => handleQuantityChange(true)}
                  disabled={quantity === voucher.voucher_quantity}
                >
                  <MaterialIcons name="add" size={20} color="#000" />
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Informações do parceiro */}
          {voucher.partner && (
            <View style={styles.partnerInfoSection}>
              <Text style={styles.partnerInfoTitle}>
                Informações do Parceiro
              </Text>

              {voucher.partner.partner_image && (
                <View style={styles.partnerImageContainer}>
                  <Image
                    source={{ uri: voucher.partner.partner_image }}
                    style={styles.partnerImage}
                    resizeMode="cover"
                  />
                </View>
              )}

              <View style={styles.partnerDetails}>
                <Text style={styles.partnerName}>
                  {voucher.partner.partner_name}
                </Text>

                {voucher.partner.partner_address && (
                  <View style={styles.partnerDetailRow}>
                    <MaterialIcons name="location-on" size={16} color="#666" />
                    <Text style={styles.partnerDetailText}>
                      {voucher.partner.partner_address}
                    </Text>
                  </View>
                )}

                {voucher.partner.partner_phone && (
                  <View style={styles.partnerDetailRow}>
                    <MaterialIcons name="phone" size={16} color="#666" />
                    <Text style={styles.partnerDetailText}>
                      {voucher.partner.partner_phone}
                    </Text>
                  </View>
                )}

                {voucher.partner.partner_site && (
                  <TouchableOpacity
                    style={styles.partnerDetailRow}
                    onPress={handleVisitPartnerSite}
                  >
                    <MaterialIcons
                      name="language"
                      size={16}
                      color={theme.colors.primary}
                    />
                    <Text
                      style={[
                        styles.partnerDetailText,
                        { color: theme.colors.primary },
                      ]}
                    >
                      Visitar site
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          )}

          {/* Botão de adicionar voucher ao carrinho */}
          <TouchableOpacity
            style={[
              styles.addToCartButton,
              !available && styles.addToCartButtonDisabled,
            ]}
            onPress={handleAddVoucherToCart}
            disabled={!available}
          >
            <MaterialIcons
              name="shopping-cart"
              size={20}
              color="white"
              style={styles.cartIcon}
            />
            <Text style={styles.addToCartText}>
              {available ? "Adicionar ao Carrinho" : "Voucher Esgotado"}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  voucherTitleSection: {
    flexDirection: "row",
    display: "flex",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    backgroundColor: "white",
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  voucherName: {
    flex: 1,
    fontSize: 18,
    fontWeight: "600",
    color: theme.colors.foreground,
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
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  errorText: {
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
  scrollContainer: {
    flex: 1,
  },
  imageContainer: {
    height: screenHeight * 0.4,
    position: "relative",
  },
  voucherImage: {
    width: screenWidth,
    height: screenHeight * 0.4,
  },
  noImageContainer: {
    width: screenWidth,
    height: screenHeight * 0.4,
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
  },
  noImageText: {
    marginTop: 16,
    fontSize: 16,
    color: "#999",
  },
  voucherInfo: {
    padding: 20,
  },
  partnerContainer: {
    marginBottom: 12,
  },
  partnerLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: theme.colors.primary,
    textTransform: "uppercase",
  },
  voucherPrice: {
    fontSize: 28,
    fontWeight: "bold",
    color: theme.colors.primary,
    marginBottom: 16,
  },
  availabilityContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },
  availabilityText: {
    fontSize: 16,
    fontWeight: "500",
    marginLeft: 8,
  },
  partnerInfoSection: {
    backgroundColor: "#f8f9fa",
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  partnerInfoTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: theme.colors.foreground,
    marginBottom: 12,
  },
  partnerImageContainer: {
    alignItems: "center",
    marginBottom: 12,
  },
  partnerImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#e0e0e0",
  },
  partnerDetails: {
    gap: 8,
  },
  partnerName: {
    fontSize: 18,
    fontWeight: "600",
    color: theme.colors.foreground,
    marginBottom: 8,
    textAlign: "center",
  },
  partnerDetailRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 4,
  },
  partnerDetailText: {
    fontSize: 14,
    color: "#666",
    marginLeft: 8,
    flex: 1,
  },
  quantitySection: {
    marginBottom: 24,
  },
  quantityLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: theme.colors.foreground,
    marginBottom: 12,
  },
  quantityContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
    borderRadius: 8,
    padding: 4,
    alignSelf: "flex-start",
  },
  quantityButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 6,
  },
  quantityButtonDisabled: {
    backgroundColor: "#e0e0e0",
  },
  quantityText: {
    fontSize: 18,
    fontWeight: "600",
    marginHorizontal: 20,
    minWidth: 30,
    textAlign: "center",
  },
  addToCartButton: {
    backgroundColor: theme.colors.primary,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 16,
  },
  addToCartButtonDisabled: {
    backgroundColor: "#ccc",
  },
  cartIcon: {
    marginRight: 8,
  },
  addToCartText: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
  },
});
