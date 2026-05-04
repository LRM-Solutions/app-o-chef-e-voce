import api from "./apiConfig";

// Criar novo pedido
export const createPedido = async (pedidoData) => {
  try {
    console.log("🛒 [PEDIDOS API] Criando pedido:", JSON.stringify(pedidoData, null, 2));

    const response = await api.post("/pedidos", pedidoData);

    console.log("✅ [PEDIDOS API] Pedido criado com sucesso:", JSON.stringify(response.data, null, 2));
    return response.data;
  } catch (error) {
    console.error("❌ [PEDIDOS API] Erro ao criar pedido:", error);
    console.error("❌ [PEDIDOS API] Response error:", error.response?.data);
    throw error;
  }
};

// Buscar pedidos do usuário
export const getUserPedidos = async () => {
  try {
    const response = await api.get("/pedidos/usuario");
    console.log("✅ [PEDIDOS API] Pedidos encontrados:", JSON.stringify(response.data, null, 2));
    return response.data;
  } catch (error) {
    console.error("❌ [PEDIDOS API] Erro ao buscar pedidos:", error);
    console.error("❌ [PEDIDOS API] Response error:", error.response?.data);
    throw error;
  }
};

// Buscar pedido específico por ID
export const getPedidoById = async (pedidoId) => {
  try {
    const response = await api.get(`/pedidos/${pedidoId}`);
    console.log("✅ [PEDIDOS API] Pedido encontrado:", JSON.stringify(response.data, null, 2));
    return response.data;
  } catch (error) {
    console.error("❌ [PEDIDOS API] Erro ao buscar pedido:", error);
    console.error("❌ [PEDIDOS API] Response error:", error.response?.data);
    throw error;
  }
};

// Atualizar status do pedido
export const updatePedidoStatus = async (pedidoId, statusData) => {
  try {
    console.log(`📝 [PEDIDOS API] Atualizando status do pedido ${pedidoId}:`, JSON.stringify(statusData, null, 2));

    const response = await api.put(`/pedidos/${pedidoId}/status`, statusData);

    console.log("✅ [PEDIDOS API] Status atualizado:", JSON.stringify(response.data, null, 2));
    return response.data;
  } catch (error) {
    console.error("❌ [PEDIDOS API] Erro ao atualizar status:", error);
    console.error("❌ [PEDIDOS API] Response error:", error.response?.data);
    throw error;
  }
};

// Cancelar pedido
export const cancelPedido = async (pedidoId, motivo) => {
  try {
    console.log(`🚫 [PEDIDOS API] Cancelando pedido ${pedidoId}, motivo:`, motivo);

    const response = await api.put(`/pedidos/${pedidoId}/cancel`, { motivo });

    console.log("✅ [PEDIDOS API] Pedido cancelado:", JSON.stringify(response.data, null, 2));
    return response.data;
  } catch (error) {
    console.error("❌ [PEDIDOS API] Erro ao cancelar pedido:", error);
    console.error("❌ [PEDIDOS API] Response error:", error.response?.data);
    throw error;
  }
};
