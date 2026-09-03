import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from "react-native";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { useTheme } from "../utils/ThemeContext";
import {
  calcularFrete,
  formatFretePrice,
  formatDeliveryTime,
} from "../api/freteApi";
import Toast from "react-native-toast-message";

export default function FreteSelector({
  endereco,
  cartItems,
  voucherCartItems,
  onFreteSelect,
  selectedFrete,
}) {
  const { theme, themeMode } = useTheme();
  const isDark = theme?.isDarkMode ?? (themeMode === "dark");
  const styles = getStyles(theme, isDark);

  const [opcoesFrete, setOpcoesFrete] = useState([]);
  const [loading, setLoading] = useState(false);
  const [expandido, setExpandido] = useState(false);

  useEffect(() => {
    // Se só há vouchers no carrinho (sem produtos físicos), frete é grátis
    if (cartItems.length === 0 && voucherCartItems.length > 0) {
      setFreteGratuito();
    } else if (endereco && endereco.cep && cartItems.length > 0) {
      calcularOpcoesFrete();
    } else {
      resetarFrete();
    }
  }, [endereco, cartItems, voucherCartItems]);

  const calcularOpcoesFrete = async () => {
    if (!endereco || !endereco.cep) return;

    // Se não há produtos físicos, apenas vouchers
    if (cartItems.length === 0) {
      setFreteGratuito();
      return;
    }

    try {
      setLoading(true);
      setOpcoesFrete([]);

      // Calcular valor total dos produtos (sem vouchers)
      const invoiceValue = cartItems.reduce((total, item) => {
        return total + item.product_price * item.quantity;
      }, 0);

      // Preparar dados dos produtos para a API
      const products = cartItems.map((item) => ({
        product_id: item.product_id,
        product_quantity: item.quantity,
        product_price: item.product_price,
      }));

      // Preparar dados dos vouchers para a API
      const vouchers = voucherCartItems.map((item) => ({
        voucher_id: item.voucher_id,
        voucher_quantity: item.quantity,
        voucher_price: item.voucher_price,
      }));

      // Limpar CEP (remover caracteres especiais)
      const cepLimpo = endereco.cep.replace(/\D/g, "");

      const response = await calcularFrete(
        cepLimpo,
        invoiceValue,
        products,
        vouchers
      );

      if (response.success && response.quote && response.quote.services) {
        const servicos = response.quote.services.filter(
          (service) => !service.Error
        );

        if (servicos.length > 0) {
          setOpcoesFrete(servicos);

          // Selecionar automaticamente a opção mais barata
          const maisBarato = servicos.reduce((prev, curr) =>
            prev.ShippingPrice < curr.ShippingPrice ? prev : curr
          );

          if (onFreteSelect) {
            onFreteSelect({
              serviceCode: maisBarato.ServiceCode,
              serviceDescription: maisBarato.ServiceDescription,
              carrier: maisBarato.Carrier,
              preco: parseFloat(maisBarato.ShippingPrice),
              deliveryTime: maisBarato.DeliveryTime,
            });
          }

          Toast.show({
            type: "success",
            text1: "Frete Calculado",
            text2: `${servicos.length} opções disponíveis`,
            visibilityTime: 2000,
          });
        } else {
          Toast.show({
            type: "error",
            text1: "Erro no Frete",
            text2: "Nenhuma opção disponível para este CEP",
            visibilityTime: 3000,
          });
        }
      }
    } catch (error) {
      console.error("Erro ao calcular frete:", error);

      Toast.show({
        type: "error",
        text1: "Erro no Frete",
        text2: "Não foi possível calcular o frete",
        visibilityTime: 3000,
      });

      Alert.alert(
        "Erro no Cálculo de Frete",
        "Não foi possível calcular o frete. Verifique o endereço selecionado.",
        [{ text: "OK" }]
      );
    } finally {
      setLoading(false);
    }
  };

  const selecionarFrete = (servico) => {
    const freteData = {
      serviceCode: servico.ServiceCode,
      serviceDescription: servico.ServiceDescription,
      carrier: servico.Carrier,
      preco: parseFloat(servico.ShippingPrice),
      deliveryTime: servico.DeliveryTime,
    };

    if (onFreteSelect) {
      onFreteSelect(freteData);
    }
  };

  const resetarFrete = () => {
    setOpcoesFrete([]);
    setExpandido(false);
    if (onFreteSelect) {
      onFreteSelect(null);
    }
  };

  const setFreteGratuito = () => {
    // Para vouchers, o frete é sempre gratuito (entrega por email)
    const freteGratis = {
      serviceCode: "VOUCHER_DIGITAL",
      serviceDescription: "Entrega Digital",
      carrier: "Email",
      preco: 0,
      deliveryTime: "Imediata",
    };

    setOpcoesFrete([freteGratis]);

    if (onFreteSelect) {
      onFreteSelect(freteGratis);
    }

    Toast.show({
      type: "success",
      text1: "Frete Grátis",
      text2: "Vouchers são entregues por email",
      visibilityTime: 2000,
    });
  };

  const toggleExpandir = () => {
    if (opcoesFrete.length > 0) {
      setExpandido(!expandido);
    }
  };

  // Se não há endereço ou não há itens no carrinho
  if (!endereco || (cartItems.length === 0 && voucherCartItems.length === 0)) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <MaterialIcons name="local-shipping" size={20} color="#ccc" />
          <Text style={styles.headerTextDisabled}>
            {!endereco
              ? "Selecione um endereço para calcular o frete"
              : "Adicione produtos para calcular o frete"}
          </Text>
        </View>
      </View>
    );
  }

  // Se há apenas vouchers no carrinho (sem produtos físicos)
  if (cartItems.length === 0 && voucherCartItems.length > 0) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <MaterialIcons name="email" size={20} color={theme.colors.primary} />
          <View style={styles.headerContent}>
            <Text style={styles.headerText}>Entrega Digital - Grátis</Text>
            <Text style={styles.freteInfo}>
              Vouchers são enviados por email após a confirmação do pagamento
            </Text>
          </View>
          <MaterialIcons name="check-circle" size={20} color="#4CAF50" />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.header}
        onPress={toggleExpandir}
        disabled={loading || opcoesFrete.length === 0}
      >
        <MaterialIcons
          name="local-shipping"
          size={20}
          color={theme.colors.primary}
        />
        <View style={styles.headerContent}>
          {loading ? (
            <Text style={styles.headerText}>Calculando frete...</Text>
          ) : selectedFrete ? (
            <>
              <Text style={styles.headerText}>
                Frete: {selectedFrete.serviceDescription}
              </Text>
              <Text style={styles.freteInfo}>
                {formatFretePrice(selectedFrete.preco)} -{" "}
                {formatDeliveryTime(selectedFrete.deliveryTime)}
              </Text>
            </>
          ) : (
            <Text style={styles.headerText}>CEP: {endereco.cep}</Text>
          )}
        </View>

        <View style={styles.headerActions}>
          {loading && (
            <ActivityIndicator size="small" color={theme.colors.primary} />
          )}
          {opcoesFrete.length > 1 && !loading && (
            <MaterialIcons
              name={expandido ? "expand-less" : "expand-more"}
              size={24}
              color={theme.colors.primary}
            />
          )}
        </View>
      </TouchableOpacity>

      {/* Opções de frete expandidas */}
      {expandido && opcoesFrete.length > 0 && (
        <View style={styles.opcoesContainer}>
          {opcoesFrete.map((servico, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.opcaoFrete,
                selectedFrete?.serviceCode === servico.ServiceCode &&
                  styles.opcaoFreteSelecionada,
              ]}
              onPress={() => selecionarFrete(servico)}
            >
              <View style={styles.opcaoInfo}>
                <View style={styles.opcaoHeader}>
                  <Text style={styles.opcaoNome}>
                    {servico.ServiceDescription}
                  </Text>
                  <Text style={styles.opcaoValor}>
                    {formatFretePrice(servico.ShippingPrice)}
                  </Text>
                </View>
                <Text style={styles.opcaoCarrier}>{servico.Carrier}</Text>
                <Text style={styles.opcaoPrazo}>
                  Entrega em {formatDeliveryTime(servico.DeliveryTime)}
                </Text>
              </View>

              {selectedFrete?.serviceCode === servico.ServiceCode && (
                <MaterialIcons
                  name="check-circle"
                  size={20}
                  color={theme.colors.primary}
                />
              )}
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Informação do endereço */}
      <View style={styles.enderecoInfo}>
        <MaterialIcons name="place" size={16} color={theme.colors.muted} />
        <Text style={styles.enderecoTexto} numberOfLines={2}>
          {endereco.rua}, {endereco.numero} - {endereco.bairro},{" "}
          {endereco.cidade}/{endereco.estado}
        </Text>
      </View>
    </View>
  );
}

const getStyles = (theme, isDark) => StyleSheet.create({
  container: {
    backgroundColor: isDark ? "#1A1A1E" : "white",
    borderRadius: 14,
    marginHorizontal: 12,
    marginVertical: 6,
    overflow: "hidden",
    elevation: 2,
    borderWidth: 1,
    borderColor: isDark ? "#282830" : "rgba(0,0,0,0.06)",
    shadowColor: isDark ? "#000" : "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: isDark ? 0.3 : 0.06,
    shadowRadius: 6,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: isDark ? "#282830" : "#f0f0f0",
  },
  headerContent: {
    flex: 1,
    marginLeft: 12,
  },
  headerText: {
    fontSize: 16,
    fontWeight: "700",
    color: isDark ? "#FFFFFF" : theme.colors.foreground,
  },
  headerTextDisabled: {
    fontSize: 16,
    color: isDark ? "#777" : theme.colors.muted,
    marginLeft: 12,
  },
  freteInfo: {
    fontSize: 14,
    color: isDark ? "#8A8A90" : theme.colors.muted,
    marginTop: 2,
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  opcoesContainer: {
    paddingBottom: 4,
  },
  opcaoFrete: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: isDark ? "#24242A" : "#f5f5f5",
  },
  opcaoFreteSelecionada: {
    backgroundColor: isDark ? "rgba(124, 77, 255, 0.12)" : "#f8f9ff",
    borderLeftWidth: 3,
    borderLeftColor: theme.colors.primary || "#7C4DFF",
  },
  opcaoInfo: {
    flex: 1,
  },
  opcaoHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  opcaoNome: {
    fontSize: 15,
    fontWeight: "600",
    color: isDark ? "#F2F2F5" : theme.colors.foreground,
  },
  opcaoValor: {
    fontSize: 16,
    fontWeight: "bold",
    color: theme.colors.primary || "#7C4DFF",
  },
  opcaoCarrier: {
    fontSize: 12,
    color: isDark ? "#8A8A90" : theme.colors.muted,
    marginBottom: 2,
  },
  opcaoPrazo: {
    fontSize: 12,
    color: isDark ? "#8A8A90" : theme.colors.muted,
  },
  enderecoInfo: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    backgroundColor: isDark ? "#121214" : "#f8f9fa",
  },
  enderecoTexto: {
    fontSize: 12,
    color: isDark ? "#8A8A90" : theme.colors.muted,
    marginLeft: 8,
    flex: 1,
  },
});
