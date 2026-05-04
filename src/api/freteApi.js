import api from "./apiConfig";

/**
 * Calcula o frete para um pedido
 */
export const calcularFrete = async (destinationCEP, invoiceValue, products, vouchers) => {
  try {
    const payload = {
      destinationCEP,
      invoiceValue,
      products,
      vouchers,
    };

    console.log("🚚 [DEBUG] POST /frete/calcular - Payload:", payload);

    const response = await api.post("/frete/calcular", payload);

    console.log("📥 [DEBUG] POST /frete/calcular - Resposta:", {
      status: response.status,
      data: response.data,
    });

    return response.data;
  } catch (error) {
    console.log("❌ [DEBUG] POST /frete/calcular - Erro:", {
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
 */
export const formatFretePrice = (price) => {
  const numericPrice = parseFloat(price);
  if (numericPrice === 0 || isNaN(numericPrice) || price === null) {
    return "Grátis";
  }
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(numericPrice);
};

/**
 * Formata o prazo de entrega
 */
export const formatDeliveryTime = (days) => {
  if (days === 1) {
    return "1 dia útil";
  }
  return `${days} dias úteis`;
};
