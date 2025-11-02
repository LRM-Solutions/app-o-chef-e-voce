import api from "./apiConfig";

/**
 * Busca os detalhes de um pedido específico
 * @param {number} pedidoId - ID do pedido
 * @returns {Promise} Response da API
 */
export const getPedidoDetalhes = async (pedidoId) => {
  try {
    console.log(
      `📦 [DEBUG] GET /pedidos/${pedidoId} - Buscando detalhes do pedido`
    );

    const response = await api.get(`/pedidos/${pedidoId}`);

    console.log("✅ [DEBUG] GET /pedidos/:id - Response:", {
      status: response.status,
      pedidoId: response.data?.pedido_id,
      status_pedido: response.data?.status,
      produtos: response.data?.pedido_product?.length || 0,
      vouchers: response.data?.pedido_voucher?.length || 0,
    });

    return response.data;
  } catch (error) {
    console.error("❌ [DEBUG] GET /pedidos/:id - Erro:", {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
      url: error.config?.url,
    });
    throw new Error(
      error.response?.data?.message || "Erro ao carregar detalhes do pedido"
    );
  }
};

/**
 * Formata o status do pedido para exibição
 * @param {string} status - Status do pedido
 * @returns {object} Objeto com cor e texto formatado
 */
export const formatarStatusPedido = (status) => {
  const statusMap = {
    PENDENTE: { text: "Pendente", color: "#f59e0b", icon: "schedule" },
    CONFIRMADO: { text: "Confirmado", color: "#3b82f6", icon: "check-circle" },
    PREPARANDO: { text: "Preparando", color: "#8b5cf6", icon: "restaurant" },
    SAIU_ENTREGA: {
      text: "Saiu para Entrega",
      color: "#06b6d4",
      icon: "local-shipping",
    },
    ENTREGUE: { text: "Entregue", color: "#10b981", icon: "done-all" },
    CANCELADO: { text: "Cancelado", color: "#ef4444", icon: "cancel" },
  };

  return statusMap[status] || { text: status, color: "#6b7280", icon: "help" };
};

/**
 * Formata o status de entrega para exibição
 * @param {string} statusEntrega - Status da entrega
 * @returns {object} Objeto com cor e texto formatado
 */
export const formatarStatusEntrega = (statusEntrega) => {
  const statusMap = {
    PENDENTE: { text: "Pendente", color: "#f59e0b", icon: "schedule" },
    PREPARANDO: { text: "Preparando", color: "#8b5cf6", icon: "restaurant" },
    SAIU_ENTREGA: {
      text: "Saiu para Entrega",
      color: "#06b6d4",
      icon: "local-shipping",
    },
    ENTREGUE: { text: "Entregue", color: "#10b981", icon: "done-all" },
    CANCELADO: { text: "Cancelado", color: "#ef4444", icon: "cancel" },
  };

  return (
    statusMap[statusEntrega] || {
      text: statusEntrega,
      color: "#6b7280",
      icon: "help",
    }
  );
};

/**
 * Formata o status de pagamento para exibição
 * @param {string} statusPagamento - Status do pagamento
 * @returns {object} Objeto com cor e texto formatado
 */
export const formatarStatusPagamento = (statusPagamento) => {
  const statusMap = {
    PENDING: {
      text: "Pendente",
      color: "#f59e0b",
      icon: "schedule",
      needsPayment: true,
    },
    APPROVED: {
      text: "Aprovado",
      color: "#10b981",
      icon: "check-circle",
      needsPayment: false,
    },
    AUTHORIZED: {
      text: "Autorizado",
      color: "#3b82f6",
      icon: "verified",
      needsPayment: false,
    },
    IN_PROCESS: {
      text: "Em Processamento",
      color: "#8b5cf6",
      icon: "autorenew",
      needsPayment: false,
    },
    REJECTED: {
      text: "Rejeitado",
      color: "#ef4444",
      icon: "cancel",
      needsPayment: true,
    },
    CANCELLED: {
      text: "Cancelado",
      color: "#6b7280",
      icon: "cancel",
      needsPayment: true,
    },
    REFUNDED: {
      text: "Reembolsado",
      color: "#06b6d4",
      icon: "replay",
      needsPayment: false,
    },
  };

  return (
    statusMap[statusPagamento] || {
      text: statusPagamento,
      color: "#6b7280",
      icon: "help",
      needsPayment: false,
    }
  );
};

/**
 * Calcula o total do pedido
 * @param {object} pedido - Dados do pedido
 * @returns {number} Total do pedido
 */
export const calcularTotalPedido = (pedido) => {
  if (!pedido) return 0;

  // Soma dos produtos
  const totalProdutos =
    pedido.pedido_product?.reduce((total, item) => {
      return total + item.product.product_price * item.pedido_product_quantity;
    }, 0) || 0;

  // Soma dos vouchers (vouchers são comprados, não desconto)
  const totalVouchers =
    pedido.pedido_voucher?.reduce((total, item) => {
      return total + item.voucher.voucher_price;
    }, 0) || 0;

  // Taxa de entrega
  const taxaEntrega = pedido.taxa_entrega || 0;

  return totalProdutos + totalVouchers + taxaEntrega;
};
