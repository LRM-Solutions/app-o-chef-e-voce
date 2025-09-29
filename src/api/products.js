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
    console.log("Buscando lista de produtos...");
    const response = await api.get("/products");
    console.log("Produtos recebidos:", response.data.length);
    return response.data;
  } catch (error) {
    console.error("Erro ao buscar produtos:", error);
    throw new Error(
      error.response?.data?.message || "Erro ao carregar produtos"
    );
  }
};

/**
 * Busca um produto específico por ID
 */
export const getProductById = async (productId) => {
  try {
    console.log(`Buscando produto com ID: ${productId}`);
    const response = await api.get(`/products/${productId}`);
    console.log("Produto recebido:", response.data);
    return response.data;
  } catch (error) {
    console.error("Erro ao buscar produto:", error);
    throw new Error(
      error.response?.data?.message || "Erro ao carregar produto"
    );
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

  // Capitaliza a primeira letra
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
  return null; // Retorna null se não houver imagem
};

/**
 * Obtém todas as imagens do produto
 */
export const getProductImages = (product) => {
  if (product.imagens && product.imagens.length > 0) {
    return product.imagens.map((img) => img.imagem_url);
  }
  return []; // Retorna array vazio se não houver imagens
};
