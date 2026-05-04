import api from "./apiConfig";

// Buscar endereços do usuário
export const getUserEnderecos = async () => {
  try {
    console.log("🔍 [DEBUG] GET /user/enderecos - Buscando endereços do usuário");
    const response = await api.get("/user/enderecos");
    console.log("📥 [DEBUG] GET /user/enderecos - Resposta:", {
      status: response.status,
      data: response.data,
      count: response.data?.count || 0,
    });
    return response.data;
  } catch (error) {
    console.log("❌ [DEBUG] GET /user/enderecos - Erro:", {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
      url: error.config?.url,
    });
    throw error;
  }
};

// Criar novo endereço
export const createEndereco = async (enderecoData) => {
  try {
    const response = await api.post("/enderecos", enderecoData);
    console.log("📥 [DEBUG] POST /enderecos - Resposta:", {
      status: response.status,
      data: response.data,
    });
    return response.data;
  } catch (error) {
    console.log("❌ [DEBUG] POST /enderecos - Erro:", {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
      payload: enderecoData,
      url: error.config?.url,
    });
    throw error;
  }
};

// Atualizar endereço existente
export const updateEndereco = async (enderecoId, enderecoData) => {
  try {
    console.log(`✏️ [DEBUG] PUT /enderecos/${enderecoId} - Atualizando endereço`);
    const response = await api.put(`/enderecos/${enderecoId}`, enderecoData);
    console.log("📥 [DEBUG] PUT /enderecos - Resposta:", {
      status: response.status,
      data: response.data,
    });
    return response.data;
  } catch (error) {
    console.log("❌ [DEBUG] PUT /enderecos - Erro:", {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
      enderecoId: enderecoId,
      payload: enderecoData,
      url: error.config?.url,
    });
    throw error;
  }
};

// Deletar endereço
export const deleteEndereco = async (enderecoId) => {
  try {
    console.log(`🗑️ [DEBUG] DELETE /enderecos/${enderecoId} - Deletando endereço`);
    const response = await api.delete(`/enderecos/${enderecoId}`);
    console.log("📥 [DEBUG] DELETE /enderecos - Resposta:", {
      status: response.status,
      data: response.data,
    });
    return response.data;
  } catch (error) {
    console.log("❌ [DEBUG] DELETE /enderecos - Erro:", {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
      enderecoId: enderecoId,
      url: error.config?.url,
    });
    throw error;
  }
};
