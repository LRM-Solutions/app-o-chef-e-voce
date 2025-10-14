import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TextInput } from "react-native";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { theme } from "../utils/theme";
import { getUserEmail } from "../api/authApi";

export default function PaymentDataSelector({ onPaymentDataChange }) {
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
        <MaterialIcons name="payment" size={20} color={theme.colors.primary} />
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
            value={formatCPF(payerCPF)}
            onChangeText={handleCPFChange}
            keyboardType="numeric"
            maxLength={14}
          />
        </View>

        <View style={styles.paymentInfo}>
          <MaterialIcons name="info" size={16} color={theme.colors.primary} />
          <Text style={styles.paymentInfoText}>
            Você escolherá o método de pagamento na próxima etapa
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "white",
    margin: 16,
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: theme.colors.foreground,
    marginLeft: 8,
  },
  paymentDetails: {
    gap: 16,
  },
  detailsTitle: {
    fontSize: 14,
    fontWeight: "500",
    color: theme.colors.foreground,
    marginBottom: 8,
  },
  inputGroup: {
    gap: 8,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: theme.colors.foreground,
  },
  input: {
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    backgroundColor: "white",
  },
  paymentInfo: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: `${theme.colors.primary}15`,
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  paymentInfoText: {
    fontSize: 12,
    color: theme.colors.primary,
    marginLeft: 8,
    flex: 1,
  },
});
