import api from "./apiConfig";
import { config } from "../utils/config";

// Criar pagamento
export const createPayment = async (paymentData) => {
  try {
    console.log("💳 [PAYMENTS API] Criando pagamento:", JSON.stringify(paymentData, null, 2));

    const response = await api.post("/payments", paymentData);

    console.log("✅ [PAYMENTS API] Pagamento criado com sucesso:", JSON.stringify(response.data, null, 2));
    return response.data;
  } catch (error) {
    console.error("❌ [PAYMENTS API] Erro ao criar pagamento:", error);
    console.error("❌ [PAYMENTS API] Response error:", error.response?.data);
    throw error;
  }
};

// Verificar status do pagamento
export const getPaymentStatus = async (paymentId) => {
  try {
    console.log(`🔍 [PAYMENTS API] Verificando status do pagamento ID: ${paymentId}`);

    const response = await api.get(`/payments/${paymentId}/status`);

    console.log("✅ [PAYMENTS API] Status do pagamento:", JSON.stringify(response.data, null, 2));
    return response.data;
  } catch (error) {
    console.error("❌ [PAYMENTS API] Erro ao verificar status:", error);
    console.error("❌ [PAYMENTS API] Response error:", error.response?.data);
    throw error;
  }
};

// Cancelar pagamento
export const cancelPayment = async (paymentId) => {
  try {
    console.log(`🚫 [PAYMENTS API] Cancelando pagamento ID: ${paymentId}`);

    const response = await api.put(`/payments/${paymentId}/cancel`);

    console.log("✅ [PAYMENTS API] Pagamento cancelado:", JSON.stringify(response.data, null, 2));
    return response.data;
  } catch (error) {
    console.error("❌ [PAYMENTS API] Erro ao cancelar pagamento:", error);
    console.error("❌ [PAYMENTS API] Response error:", error.response?.data);
    throw error;
  }
};

// Reprocessar pagamento
export const retryPayment = async (paymentId) => {
  try {
    console.log(`🔄 [PAYMENTS API] Reprocessando pagamento ID: ${paymentId}`);

    const response = await api.post(`/payments/${paymentId}/retry`);

    console.log("✅ [PAYMENTS API] Pagamento reprocessado:", JSON.stringify(response.data, null, 2));
    return response.data;
  } catch (error) {
    console.error("❌ [PAYMENTS API] Erro ao reprocessar pagamento:", error);
    console.error("❌ [PAYMENTS API] Response error:", error.response?.data);
    throw error;
  }
};

// Constantes dos métodos de pagamento do Mercado Pago
export const PAYMENT_METHODS = {
  CREDIT_CARD: {
    id: "credit_card",
    name: "Cartão de Crédito",
    icon: "credit-card",
    description: "Parcelamento em até 12x",
  },
  DEBIT_CARD: {
    id: "debit_card",
    name: "Cartão de Débito",
    icon: "payment",
    description: "Débito à vista",
  },
  PIX: {
    id: "pix",
    name: "PIX",
    icon: "qr-code-scanner",
    description: "Pagamento instantâneo",
  },
  BANK_TRANSFER: {
    id: "bank_transfer",
    name: "Boleto Bancário",
    icon: "receipt",
    description: "Vencimento em 3 dias úteis",
  },
};

// Helper para obter URL base da API para webhook
export const getNotificationUrl = () => {
  const baseUrl = config.API_BASE_URL.replace(/\/$/, "");
  return `${baseUrl}/webhook/mercadopago`;
};
