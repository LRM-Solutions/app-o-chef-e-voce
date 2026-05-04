import axios from "axios";

const YOUTUBE_API_KEY = "AIzaSyCKCIiusSbSos2kNA0zm5ObDvqGThDd9f0";
const YOUTUBE_BASE_URL = "https://www.googleapis.com/youtube/v3";

const PLAYLIST_ID = "PLcPliuHMGlZuyNYBAdNWBs2EHOEQ77dNy";
const CHANNEL_ID = "UCYVwQ4TPRjJ6vBvDM2_i9eg";

const youtubeApi = axios.create({
  baseURL: YOUTUBE_BASE_URL,
  timeout: 10000,
});

export const getPlaylistVideos = async (pageToken = "", maxResults = 10) => {
  try {
    const params = {
      part: "snippet",
      playlistId: PLAYLIST_ID,
      maxResults,
      key: YOUTUBE_API_KEY,
    };

    if (pageToken) {
      params.pageToken = pageToken;
    }

    const response = await youtubeApi.get("/playlistItems", { params });

    const videoIds = response.data.items.map((item) => item.snippet.resourceId.videoId).join(",");

    const statsResponse = await youtubeApi.get("/videos", {
      params: {
        part: "statistics,contentDetails",
        id: videoIds,
        key: YOUTUBE_API_KEY,
      },
    });

    const videosWithStats = response.data.items.map((video) => {
      const stats = statsResponse.data.items.find((stat) => stat.id === video.snippet.resourceId.videoId);
      return {
        id: video.snippet.resourceId.videoId,
        title: video.snippet.title,
        description: video.snippet.description,
        thumbnail: video.snippet.thumbnails?.medium?.url || video.snippet.thumbnails?.default?.url || "",
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
    console.error("Erro ao buscar vídeos da playlist do YouTube:", error);
    throw error;
  }
};

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

    const videoIds = response.data.items.map((item) => item.id.videoId).join(",");

    const statsResponse = await youtubeApi.get("/videos", {
      params: {
        part: "statistics,contentDetails",
        id: videoIds,
        key: YOUTUBE_API_KEY,
      },
    });

    const videosWithStats = response.data.items.map((video) => {
      const stats = statsResponse.data.items.find((stat) => stat.id === video.id.videoId);
      return {
        id: video.id.videoId,
        title: video.snippet.title,
        description: video.snippet.description,
        thumbnail: video.snippet.thumbnails?.medium?.url || video.snippet.thumbnails?.default?.url || "",
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

    const videoIds = response.data.items.map((item) => item.id.videoId).join(",");

    const statsResponse = await youtubeApi.get("/videos", {
      params: {
        part: "statistics,contentDetails",
        id: videoIds,
        key: YOUTUBE_API_KEY,
      },
    });

    const videosWithStats = response.data.items.map((video) => {
      const stats = statsResponse.data.items.find((stat) => stat.id === video.id.videoId);
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

export const formatDuration = (duration) => {
  if (!duration || duration === "PT0S") return "0:00";
  const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
  if (!match) return "0:00";
  const hours = (match[1] || "").replace("H", "");
  const minutes = (match[2] || "").replace("M", "");
  const seconds = (match[3] || "").replace("S", "");
  if (hours) {
    return `${hours}:${minutes.padStart(2, "0")}:${seconds.padStart(2, "0")}`;
  }
  return `${minutes || "0"}:${seconds.padStart(2, "0")}`;
};

export const formatViewCount = (count) => {
  if (!count || count === "0") return "0";
  const num = parseInt(count);
  if (isNaN(num)) return "0";
  if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
  if (num >= 1000) return (num / 1000).toFixed(1) + "K";
  return num.toString();
};
