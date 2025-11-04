import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
} from "react-native";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { theme } from "../utils/theme";
import { PAYMENT_METHODS } from "../api/paymentsApi";

export default function PaymentMethodSelector({
  onPaymentMethodSelect,
  selectedPaymentMethod,
  onPaymentDataChange,
}) {
  const [installments, setInstallments] = useState("1");
  const [payerEmail, setPayerEmail] = useState("");
  const [payerCPF, setPayerCPF] = useState("");

  const handleMethodSelect = (method) => {
    onPaymentMethodSelect(method);

    // Resetar parcelas para métodos que não suportam parcelamento
    if (method.id !== PAYMENT_METHODS.CREDIT_CARD.id) {
      setInstallments("1");
    }

    // Enviar dados do pagamento atualizados
    updatePaymentData(method.id, installments, payerEmail, payerCPF);
  };

  const updatePaymentData = (methodId, inst, email, cpf) => {
    const paymentData = {
      payment_method_id: methodId,
      payment_type_id: methodId,
      installments: parseInt(inst) || 1,
      payer_email: email,
      payer_identification_type: "CPF",
      payer_identification_number: cpf,
    };

    onPaymentDataChange(paymentData);
  };

  const handleInstallmentsChange = (value) => {
    setInstallments(value);
    if (selectedPaymentMethod) {
      updatePaymentData(selectedPaymentMethod.id, value, payerEmail, payerCPF);
    }
  };

  const handleEmailChange = (value) => {
    setPayerEmail(value);
    if (selectedPaymentMethod) {
      updatePaymentData(
        selectedPaymentMethod.id,
        installments,
        value,
        payerCPF
      );
    }
  };

  const handleCPFChange = (value) => {
    // Permitir apenas números e limitar a 11 dígitos
    const numericValue = value.replace(/[^0-9]/g, "").slice(0, 11);
    setPayerCPF(numericValue);
    if (selectedPaymentMethod) {
      updatePaymentData(
        selectedPaymentMethod.id,
        installments,
        payerEmail,
        numericValue
      );
    }
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

  const getMethodIcon = (method) => {
    switch (method.id) {
      case PAYMENT_METHODS.CREDIT_CARD.id:
        return "credit-card";
      case PAYMENT_METHODS.DEBIT_CARD.id:
        return "payment";
      case PAYMENT_METHODS.PIX.id:
        return "qr-code-scanner";
      case PAYMENT_METHODS.BANK_TRANSFER.id:
        return "receipt";
      default:
        return "payment";
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <MaterialIcons name="payment" size={20} color={theme.colors.primary} />
        <Text style={styles.headerTitle}>Método de Pagamento</Text>
      </View>

      <View style={styles.methodsList}>
        {Object.values(PAYMENT_METHODS).map((method) => (
          <TouchableOpacity
            key={method.id}
            style={[
              styles.methodItem,
              selectedPaymentMethod?.id === method.id &&
                styles.methodItemSelected,
            ]}
            onPress={() => handleMethodSelect(method)}
          >
            <View style={styles.methodContent}>
              <MaterialIcons
                name={getMethodIcon(method)}
                size={24}
                color={
                  selectedPaymentMethod?.id === method.id
                    ? theme.colors.primary
                    : "#666"
                }
              />
              <View style={styles.methodInfo}>
                <Text
                  style={[
                    styles.methodName,
                    selectedPaymentMethod?.id === method.id &&
                      styles.methodNameSelected,
                  ]}
                >
                  {method.name}
                </Text>
                <Text style={styles.methodDescription}>
                  {method.description}
                </Text>
              </View>
            </View>
            {selectedPaymentMethod?.id === method.id && (
              <MaterialIcons
                name="check-circle"
                size={20}
                color={theme.colors.primary}
              />
            )}
          </TouchableOpacity>
        ))}
      </View>

      {selectedPaymentMethod && (
        <View style={styles.paymentDetails}>
          <Text style={styles.detailsTitle}>Detalhes do Pagamento</Text>

          {/* Email do pagador */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Email *</Text>
            <TextInput
              style={styles.input}
              placeholder="seu.email@exemplo.com"
              placeholderTextColor="#999"
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
              placeholderTextColor="#999"
              value={formatCPF(payerCPF)}
              onChangeText={handleCPFChange}
              keyboardType="numeric"
              maxLength={14}
            />
          </View>

          {/* Parcelas (apenas para cartão de crédito) */}
          {selectedPaymentMethod.id === PAYMENT_METHODS.CREDIT_CARD.id && (
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Parcelas</Text>
              <View style={styles.installmentsContainer}>
                {[1, 2, 3, 6, 12].map((num) => (
                  <TouchableOpacity
                    key={num}
                    style={[
                      styles.installmentButton,
                      installments === num.toString() &&
                        styles.installmentButtonSelected,
                    ]}
                    onPress={() => handleInstallmentsChange(num.toString())}
                  >
                    <Text
                      style={[
                        styles.installmentText,
                        installments === num.toString() &&
                          styles.installmentTextSelected,
                      ]}
                    >
                      {num}x
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* Informações específicas do método */}
          {selectedPaymentMethod.id === PAYMENT_METHODS.PIX.id && (
            <View style={styles.paymentInfo}>
              <MaterialIcons
                name="info"
                size={16}
                color={theme.colors.primary}
              />
              <Text style={styles.paymentInfoText}>
                Após confirmar, você receberá um QR Code para pagamento via PIX
              </Text>
            </View>
          )}

          {selectedPaymentMethod.id === PAYMENT_METHODS.BANK_TRANSFER.id && (
            <View style={styles.paymentInfo}>
              <MaterialIcons
                name="info"
                size={16}
                color={theme.colors.primary}
              />
              <Text style={styles.paymentInfoText}>
                O boleto será gerado após a confirmação do pedido
              </Text>
            </View>
          )}
        </View>
      )}
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
  methodsList: {
    gap: 12,
    marginBottom: 16,
  },
  methodItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 8,
    backgroundColor: "#f9f9f9",
  },
  methodItemSelected: {
    borderColor: theme.colors.primary,
    backgroundColor: `${theme.colors.primary}10`,
  },
  methodContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  methodInfo: {
    marginLeft: 12,
    flex: 1,
  },
  methodName: {
    fontSize: 14,
    fontWeight: "600",
    color: theme.colors.foreground,
  },
  methodNameSelected: {
    color: theme.colors.primary,
  },
  methodDescription: {
    fontSize: 12,
    color: theme.colors.muted,
    marginTop: 2,
  },
  paymentDetails: {
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
    paddingTop: 16,
  },
  detailsTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: theme.colors.foreground,
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: theme.colors.foreground,
    marginBottom: 8,
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
  installmentsContainer: {
    flexDirection: "row",
    gap: 8,
    flexWrap: "wrap",
  },
  installmentButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 6,
    backgroundColor: "white",
  },
  installmentButtonSelected: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primary,
  },
  installmentText: {
    fontSize: 14,
    color: theme.colors.foreground,
  },
  installmentTextSelected: {
    color: "white",
    fontWeight: "600",
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
