import axios from "axios";
import { config } from "../utils/config";

// Configuração do axios para produtos
const api = axios.create({
  baseURL: config.API_BASE_URL,
  timeout: 10000,
});

/**
 * Busca todos os produtos
 */
export const getProducts = async () => {
  try {
    const response = await api.get("/products");
    console.log("📥 [DEBUG] GET /products - Resposta:", {
      status: response.status,
      count: response.data?.length || 0,
      firstProduct: response.data?.[0]?.product_name || "N/A",
    });
    return response.data;
  } catch (error) {
    console.log("❌ [DEBUG] GET /products - Erro:", {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
      url: error.config?.url,
    });
    throw new Error(error.response?.data?.message || "Erro ao carregar produtos");
  }
};

/**
 * Busca um produto específico por ID
 */
export const getProductById = async (productId) => {
  try {
    console.log(`🔍 [DEBUG] GET /products/${productId} - Buscando produto específico`);
    const response = await api.get(`/products/${productId}`);
    console.log("📥 [DEBUG] GET /products/:id - Resposta:", {
      status: response.status,
      productId: productId,
      productName: response.data?.product_name || "N/A",
      productPrice: response.data?.product_price || "N/A",
    });
    return response.data;
  } catch (error) {
    console.log("❌ [DEBUG] GET /products/:id - Erro:", {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
      productId: productId,
      url: error.config?.url,
    });
    throw new Error(error.response?.data?.message || "Erro ao carregar produto");
  }
};

/**
 * Formata o preço para exibição
 */
export const formatPrice = (price) => {
  if (!price && price !== 0) return "R$ 0,00";
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(price);
};

/**
 * Formata a categoria do produto
 */
export const formatCategory = (category) => {
  if (!category) return "Categoria não informada";
  return category.charAt(0).toUpperCase() + category.slice(1).toLowerCase();
};

/**
 * Verifica se o produto está em estoque
 */
export const isInStock = (quantity) => {
  return quantity && quantity > 0;
};

/**
 * Obtém a primeira imagem do produto ou uma imagem padrão
 */
export const getProductMainImage = (product) => {
  if (product.imagens && product.imagens.length > 0) {
    return product.imagens[0].imagem_url;
  }
  return null;
};

/**
 * Obtém todas as imagens do produto
 */
export const getProductImages = (product) => {
  if (product.imagens && product.imagens.length > 0) {
    return product.imagens.map((img) => img.imagem_url);
  }
  return [];
};
