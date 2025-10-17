import api from "./apiConfig";

/**
 * Busca todos os vouchers disponíveis
 */
export const getVouchers = async () => {
  try {
    console.log("🎫 [DEBUG] GET /vouchers - Buscando lista de vouchers");

    const response = await api.get("/vouchers");

    console.log("✅ [DEBUG] GET /vouchers - Response:", {
      status: response.status,
      count: response.data?.data?.length || 0,
      firstVoucher: response.data?.data?.[0]?.voucher_name || "N/A",
    });

    if (response.data.success && Array.isArray(response.data.data)) {
      return response.data.data;
    } else {
      console.warn(
        "⚠️ [DEBUG] GET /vouchers - Resposta da API não contém dados válidos:",
        response.data
      );
      return [];
    }
  } catch (error) {
    console.error("❌ [DEBUG] GET /vouchers - Erro:", {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
      url: error.config?.url,
    });
    throw new Error(
      error.response?.data?.message || "Erro ao carregar vouchers"
    );
  }
};

/**
 * Busca um voucher específico por ID
 */
export const getVoucherById = async (voucherId) => {
  try {
    console.log(
      `🔍 [DEBUG] GET /vouchers/${voucherId} - Buscando voucher específico`
    );

    const response = await api.get(`/vouchers/${voucherId}`);

    console.log("✅ [DEBUG] GET /vouchers/:id - Response:", {
      status: response.status,
      voucherId: voucherId,
      voucherName: response.data?.data?.voucher_name || "N/A",
      voucherPrice: response.data?.data?.voucher_price || "N/A",
      partnerName: response.data?.data?.partner?.partner_name || "N/A",
    });

    if (response.data.success && response.data.data) {
      return response.data.data;
    } else {
      console.warn(
        "⚠️ [DEBUG] GET /vouchers/:id - Resposta da API não contém dados válidos:",
        response.data
      );
      throw new Error("Voucher não encontrado");
    }
  } catch (error) {
    console.error("❌ [DEBUG] GET /vouchers/:id - Erro:", {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
      url: error.config?.url,
    });
    throw new Error(
      error.response?.data?.message || "Erro ao carregar voucher"
    );
  }
};

/**
 * Formatar o preço do voucher
 */
export const formatVoucherPrice = (price) => {
  if (typeof price === "number") {
    return `R$ ${price.toFixed(2).replace(".", ",")}`;
  }
  return "R$ 0,00";
};

/**
 * Verificar se o voucher está disponível
 */
export const isVoucherAvailable = (quantity) => {
  return quantity > 0;
};

/**
 * Obter a imagem principal do voucher
 */
export const getVoucherMainImage = (voucher) => {
  if (voucher && voucher.voucher_image) {
    return voucher.voucher_image;
  }
  return null;
};

/**
 * Formatar o nome do parceiro
 */
export const formatPartnerName = (partner) => {
  if (partner && partner.partner_name) {
    return partner.partner_name;
  }
  return "Parceiro não identificado";
};
