import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TextInput } from "react-native";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { useTheme } from "../utils/ThemeContext";
import { getUserEmail } from "../api/authApi";

export default function PaymentDataSelector({ onPaymentDataChange }) {
  const { theme, themeMode } = useTheme();
  const isDark = theme?.isDarkMode ?? (themeMode === "dark");
  const styles = getStyles(theme, isDark);

  const [installments, setInstallments] = useState("1");
  const [payerEmail, setPayerEmail] = useState("");
  const [payerCPF, setPayerCPF] = useState("");

  useEffect(() => {
    // Carregar email do usuário logado
    loadUserEmail();
  }, []);

  useEffect(() => {
    // Atualizar dados sempre que algo mudar
    updatePaymentData();
  }, [installments, payerEmail, payerCPF]);

  const loadUserEmail = async () => {
    try {
      const userEmail = await getUserEmail();
      if (userEmail) {
        setPayerEmail(userEmail);
      }
    } catch (error) {
      console.error("Erro ao carregar email do usuário:", error);
    }
  };

  const updatePaymentData = () => {
    const paymentData = {
      installments: parseInt(installments) || 1,
      payer_email: payerEmail,
      payer_identification_type: "CPF",
      payer_identification_number: payerCPF,
    };

    onPaymentDataChange(paymentData);
  };

  const handleEmailChange = (value) => {
    setPayerEmail(value);
  };

  const handleCPFChange = (value) => {
    // Permitir apenas números e limitar a 11 dígitos
    const numericValue = value.replace(/[^0-9]/g, "").slice(0, 11);
    setPayerCPF(numericValue);
  };

  const formatCPF = (cpf) => {
    // Formatar CPF: XXX.XXX.XXX-XX
    return cpf
      .replace(/\D/g, "")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d{1,2})/, "$1-$2")
      .replace(/(-\d{2})\d+?$/, "$1");
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <MaterialIcons name="payment" size={20} color={theme.colors.primary || "#7C4DFF"} />
        <Text style={styles.headerTitle}>Dados para Pagamento</Text>
      </View>

      <View style={styles.paymentDetails}>
        <Text style={styles.detailsTitle}>
          Informe os dados para processamento do pagamento
        </Text>

        {/* Email do pagador */}
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Email *</Text>
          <TextInput
            style={styles.input}
            placeholder="seu.email@exemplo.com"
            placeholderTextColor={isDark ? "#777" : "#999"}
            value={payerEmail}
            onChangeText={handleEmailChange}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>

        {/* CPF do pagador */}
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>CPF *</Text>
          <TextInput
            style={styles.input}
            placeholder="000.000.000-00"
            placeholderTextColor={isDark ? "#777" : "#999"}
            value={formatCPF(payerCPF)}
            onChangeText={handleCPFChange}
            keyboardType="numeric"
            maxLength={14}
          />
        </View>

        <View style={styles.paymentInfo}>
          <MaterialIcons name="info" size={16} color={theme.colors.primary || "#7C4DFF"} />
          <Text style={styles.paymentInfoText}>
            Você escolherá o método de pagamento na próxima etapa
          </Text>
        </View>
      </View>
    </View>
  );
}

const getStyles = (theme, isDark) => StyleSheet.create({
  container: {
    backgroundColor: isDark ? "#1A1A1E" : "white",
    marginHorizontal: 12,
    marginVertical: 6,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: isDark ? "#282830" : "rgba(0,0,0,0.06)",
    shadowColor: isDark ? "#000" : "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: isDark ? 0.3 : 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: isDark ? "#FFFFFF" : theme.colors.foreground,
    marginLeft: 8,
  },
  paymentDetails: {
    gap: 14,
  },
  detailsTitle: {
    fontSize: 14,
    fontWeight: "500",
    color: isDark ? "#A0A0A5" : theme.colors.muted,
    marginBottom: 4,
  },
  inputGroup: {
    gap: 6,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: isDark ? "#D0D0D5" : theme.colors.foreground,
  },
  input: {
    borderWidth: 1,
    borderColor: isDark ? "#2A2A32" : "#e0e0e0",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    backgroundColor: isDark ? "#121214" : "white",
    color: isDark ? "#FFFFFF" : "#1A1A1A",
  },
  paymentInfo: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: isDark ? "rgba(124, 77, 255, 0.15)" : "rgba(124, 77, 255, 0.08)",
    padding: 12,
    borderRadius: 10,
    marginTop: 4,
  },
  paymentInfoText: {
    fontSize: 12,
    color: theme.colors.primary || "#7C4DFF",
    marginLeft: 8,
    flex: 1,
    fontWeight: "500",
  },
});
