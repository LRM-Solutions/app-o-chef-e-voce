import api from "./apiConfig";

// Buscar endereços do usuário
export const getUserEnderecos = async () => {
  try {
    console.log(
      "🔍 [DEBUG] GET /user/enderecos - Buscando endereços do usuário"
    );
    const response = await api.get("/user/enderecos");
    console.log("✅ [DEBUG] GET /user/enderecos - Response:", {
      status: response.status,
      data: response.data,
      count: response.data?.count || 0,
    });
    return response.data;
  } catch (error) {
    console.error("❌ [DEBUG] GET /user/enderecos - Erro:", {
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
    console.log("📝 [DEBUG] POST /enderecos - Criando novo endereço");
    console.log("📤 [DEBUG] POST /enderecos - Payload:", enderecoData);
    const response = await api.post("/enderecos", enderecoData);
    console.log("✅ [DEBUG] POST /enderecos - Response:", {
      status: response.status,
      data: response.data,
    });
    return response.data;
  } catch (error) {
    console.error("❌ [DEBUG] POST /enderecos - Erro:", {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
      payload: enderecoData,
      url: error.config?.url,
    });
    throw error;
  }
};

// Atualizar endereço existente (para futuro uso)
export const updateEndereco = async (enderecoId, enderecoData) => {
  try {
    console.log(
      `✏️ [DEBUG] PUT /enderecos/${enderecoId} - Atualizando endereço`
    );
    console.log("📤 [DEBUG] PUT /enderecos - Payload:", enderecoData);
    const response = await api.put(`/enderecos/${enderecoId}`, enderecoData);
    console.log("✅ [DEBUG] PUT /enderecos - Response:", {
      status: response.status,
      data: response.data,
    });
    return response.data;
  } catch (error) {
    console.error("❌ [DEBUG] PUT /enderecos - Erro:", {
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

// Deletar endereço (para futuro uso)
export const deleteEndereco = async (enderecoId) => {
  try {
    console.log(
      `🗑️ [DEBUG] DELETE /enderecos/${enderecoId} - Deletando endereço`
    );
    const response = await api.delete(`/enderecos/${enderecoId}`);
    console.log("✅ [DEBUG] DELETE /enderecos - Response:", {
      status: response.status,
      data: response.data,
    });
    return response.data;
  } catch (error) {
    console.error("❌ [DEBUG] DELETE /enderecos - Erro:", {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
      enderecoId: enderecoId,
      url: error.config?.url,
    });
    throw error;
  }
};
