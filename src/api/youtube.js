import axios from "axios";

const YOUTUBE_API_KEY = "AIzaSyCKCIiusSbSos2kNA0zm5ObDvqGThDd9f0";
const YOUTUBE_BASE_URL = "https://www.googleapis.com/youtube/v3";

// ID do canal do YouTube para culinária (substitua pelo seu canal específico)
// Estou usando um canal de culinária popular como exemplo
const CHANNEL_ID = "UCYVwQ4TPRjJ6vBvDM2_i9eg"; // Tasty channel ID

// Criar instância do axios para YouTube API
const youtubeApi = axios.create({
  baseURL: YOUTUBE_BASE_URL,
  timeout: 10000, // 10 segundos
});

/**
 * Busca vídeos de um canal do YouTube
 * @param {string} pageToken - Token para paginação (próxima página)
 * @param {number} maxResults - Número máximo de resultados (padrão: 10)
 * @returns {Promise<Object>} Dados dos vídeos e token para próxima página
 */
export const getChannelVideos = async (pageToken = "", maxResults = 10) => {
  try {
    const params = {
      part: "snippet",
      channelId: CHANNEL_ID,
      order: "date",
      type: "video",
      maxResults,
      key: YOUTUBE_API_KEY,
    };

    if (pageToken) {
      params.pageToken = pageToken;
    }

    const response = await youtubeApi.get("/search", { params });

    // Buscar estatísticas dos vídeos (views, likes, etc.)
    const videoIds = response.data.items
      .map((item) => item.id.videoId)
      .join(",");

    const statsResponse = await youtubeApi.get("/videos", {
      params: {
        part: "statistics,contentDetails",
        id: videoIds,
        key: YOUTUBE_API_KEY,
      },
    });

    // Combinar dados do vídeo com estatísticas
    const videosWithStats = response.data.items.map((video) => {
      const stats = statsResponse.data.items.find(
        (stat) => stat.id === video.id.videoId
      );
      return {
        id: video.id.videoId,
        title: video.snippet.title,
        description: video.snippet.description,
        thumbnail: video.snippet.thumbnails.medium.url,
        channelTitle: video.snippet.channelTitle,
        publishedAt: video.snippet.publishedAt,
        viewCount: stats?.statistics?.viewCount || "0",
        likeCount: stats?.statistics?.likeCount || "0",
        duration: stats?.contentDetails?.duration || "PT0S",
      };
    });

    return {
      videos: videosWithStats,
      nextPageToken: response.data.nextPageToken || null,
      totalResults: response.data.pageInfo.totalResults,
    };
  } catch (error) {
    console.error("Erro ao buscar vídeos do YouTube:", error);
    throw error;
  }
};

/**
 * Busca vídeos por termo de pesquisa
 * @param {string} query - Termo de pesquisa
 * @param {string} pageToken - Token para paginação
 * @param {number} maxResults - Número máximo de resultados
 * @returns {Promise<Object>} Dados dos vídeos e token para próxima página
 */
export const searchVideos = async (query, pageToken = "", maxResults = 10) => {
  try {
    const params = {
      part: "snippet",
      q: query,
      order: "relevance",
      type: "video",
      maxResults,
      key: YOUTUBE_API_KEY,
    };

    if (pageToken) {
      params.pageToken = pageToken;
    }

    const response = await youtubeApi.get("/search", { params });

    // Buscar estatísticas dos vídeos
    const videoIds = response.data.items
      .map((item) => item.id.videoId)
      .join(",");

    const statsResponse = await youtubeApi.get("/videos", {
      params: {
        part: "statistics,contentDetails",
        id: videoIds,
        key: YOUTUBE_API_KEY,
      },
    });

    // Combinar dados do vídeo com estatísticas
    const videosWithStats = response.data.items.map((video) => {
      const stats = statsResponse.data.items.find(
        (stat) => stat.id === video.id.videoId
      );
      return {
        id: video.id.videoId,
        title: video.snippet.title,
        description: video.snippet.description,
        thumbnail: video.snippet.thumbnails.medium.url,
        channelTitle: video.snippet.channelTitle,
        publishedAt: video.snippet.publishedAt,
        viewCount: stats?.statistics?.viewCount || "0",
        likeCount: stats?.statistics?.likeCount || "0",
        duration: stats?.contentDetails?.duration || "PT0S",
      };
    });

    return {
      videos: videosWithStats,
      nextPageToken: response.data.nextPageToken || null,
      totalResults: response.data.pageInfo.totalResults,
    };
  } catch (error) {
    console.error("Erro ao pesquisar vídeos do YouTube:", error);
    throw error;
  }
};

/**
 * Formata a duração do vídeo de ISO 8601 para formato legível
 * @param {string} duration - Duração no formato ISO 8601 (ex: PT4M13S)
 * @returns {string} Duração formatada (ex: 4:13)
 */
export const formatDuration = (duration) => {
  const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);

  const hours = (match[1] || "").replace("H", "");
  const minutes = (match[2] || "").replace("M", "");
  const seconds = (match[3] || "").replace("S", "");

  if (hours) {
    return `${hours}:${minutes.padStart(2, "0")}:${seconds.padStart(2, "0")}`;
  }

  return `${minutes || "0"}:${seconds.padStart(2, "0")}`;
};

/**
 * Formata número de visualizações
 * @param {string} count - Número de visualizações
 * @returns {string} Número formatado (ex: 1.2M, 15K)
 */
export const formatViewCount = (count) => {
  const num = parseInt(count);

  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + "M";
  }

  if (num >= 1000) {
    return (num / 1000).toFixed(1) + "K";
  }

  return num.toString();
};
