import api from "./apiConfig";

/**
 * Calcula o frete para um pedido
 * @param {string} destinationCEP - CEP de destino
 * @param {number} invoiceValue - Valor total dos produtos (sem vouchers)
 * @param {Array} products - Lista de produtos
 * @param {Array} vouchers - Lista de vouchers
 * @returns {Promise} Response da API
 */
export const calcularFrete = async (
  destinationCEP,
  invoiceValue,
  products,
  vouchers
) => {
  try {
    const payload = {
      destinationCEP,
      invoiceValue,
      products,
      vouchers,
    };

    console.log("🚚 [DEBUG] POST /frete/calcular - Calculando frete:", payload);

    const response = await api.post("/frete/calcular", payload);

    console.log("✅ [DEBUG] POST /frete/calcular - Response:", {
      status: response.status,
      data: response.data,
    });

    return response.data;
  } catch (error) {
    console.error("❌ [DEBUG] POST /frete/calcular - Erro:", {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
      url: error.config?.url,
    });
    throw new Error(error.response?.data?.message || "Erro ao calcular frete");
  }
};

/**
 * Formata o preço do frete para exibição
 * @param {number} price - Preço do frete
 * @returns {string} Preço formatado
 */
export const formatFretePrice = (price) => {
  if (price === 0 || price === null) {
    return "Grátis";
  }
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(price);
};

/**
 * Formata o prazo de entrega
 * @param {number} days - Dias de entrega
 * @returns {string} Prazo formatado
 */
export const formatDeliveryTime = (days) => {
  if (days === 1) {
    return "1 dia útil";
  }
  return `${days} dias úteis`;
};
