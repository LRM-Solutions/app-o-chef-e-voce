import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  StyleSheet,
  Dimensions,
  Alert,
  RefreshControl,
  Linking,
} from "react-native";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { theme } from "../utils/theme";
import {
  getPlaylistVideos,
  formatDuration,
  formatViewCount,
} from "../api/youtube";
import Toast from "react-native-toast-message";
import Logo from "../assets/images/logo.png";
const { width: screenWidth } = Dimensions.get("window");
const ITEM_WIDTH = screenWidth - 32; // 16px margin on each side

export default function EpisodiosScreen() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [nextPageToken, setNextPageToken] = useState("");
  const [showScrollToTop, setShowScrollToTop] = useState(false);

  const flatListRef = useRef(null);

  useEffect(() => {
    loadInitialVideos();
  }, []);

  const loadInitialVideos = async () => {
    try {
      setLoading(true);
      console.log("Carregando vídeos iniciais da playlist...");
      const response = await getPlaylistVideos("", 10);
      console.log("Resposta recebida:", response);
      console.log("Número de vídeos:", response.videos.length);
      console.log("Primeiro vídeo:", response.videos[0]);
      setVideos(response.videos);
      setNextPageToken(response.nextPageToken || "");
    } catch (error) {
      console.error("Erro ao carregar vídeos:", error);
      Toast.show({
        type: "error",
        text1: "Erro",
        text2: "Não foi possível carregar os vídeos",
        visibilityTime: 4000,
      });
    } finally {
      setLoading(false);
    }
  };

  const loadMoreVideos = async () => {
    if (loadingMore || !nextPageToken) return;

    try {
      setLoadingMore(true);
      const response = await getPlaylistVideos(nextPageToken, 10);
      setVideos((prev) => [...prev, ...response.videos]);
      setNextPageToken(response.nextPageToken || "");
    } catch (error) {
      console.error("Erro ao carregar mais vídeos:", error);
      Toast.show({
        type: "error",
        text1: "Erro",
        text2: "Não foi possível carregar mais vídeos",
        visibilityTime: 3000,
      });
    } finally {
      setLoadingMore(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    setNextPageToken("");
    await loadInitialVideos();
    setRefreshing(false);
  };

  const scrollToTop = () => {
    flatListRef.current?.scrollToOffset({ animated: true, offset: 0 });
  };

  const handleScroll = (event) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    setShowScrollToTop(offsetY > 1000); // Mostrar botão após 1000px de scroll
  };

  const openVideo = async (videoId, videoTitle) => {
    try {
      // URLs do YouTube
      const youtubeAppUrl = `vnd.youtube://www.youtube.com/watch?v=${videoId}`;
      const youtubeBrowserUrl = `https://www.youtube.com/watch?v=${videoId}`;

      // Tenta abrir no app do YouTube primeiro
      const canOpenYouTubeApp = await Linking.canOpenURL(youtubeAppUrl);

      // Toast de feedback
      Toast.show({
        type: "info",
        text1: "Abrindo vídeo...",
        text2:
          videoTitle.length > 50
            ? videoTitle.substring(0, 50) + "..."
            : videoTitle,
        visibilityTime: 2000,
      });

      if (canOpenYouTubeApp) {
        // Abre no app do YouTube
        await Linking.openURL(youtubeAppUrl);
      } else {
        // Abre no navegador se não tiver o app
        await Linking.openURL(youtubeBrowserUrl);
      }
    } catch (error) {
      console.error("Erro ao abrir vídeo:", error);

      Alert.alert(
        "Erro",
        "Não foi possível abrir o vídeo. Verifique sua conexão com a internet.",
        [{ text: "OK" }]
      );
    }
  };

  const formatPublishedDate = (dateString) => {
    if (!dateString) return "Data não disponível";

    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffTime = Math.abs(now - date);
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 0) return "Hoje";
      if (diffDays === 1) return "Ontem";
      if (diffDays < 7) return `${diffDays} dias atrás`;
      if (diffDays < 30) return `${Math.floor(diffDays / 7)} semanas atrás`;
      if (diffDays < 365) return `${Math.floor(diffDays / 30)} meses atrás`;
      return `${Math.floor(diffDays / 365)} anos atrás`;
    } catch (error) {
      console.error("Erro ao formatar data:", error);
      return "Data inválida";
    }
  };

  const VideoItem = ({ item }) => {
    console.log("Renderizando item:", {
      id: item.id,
      title: item.title?.substring(0, 30) + "...",
      viewCount: item.viewCount,
      channelTitle: item.channelTitle,
      publishedAt: item.publishedAt,
      thumbnail: item.thumbnail ? "✓" : "✗",
    });

    const formattedViews = formatViewCount(item.viewCount);
    const formattedDate = formatPublishedDate(item.publishedAt);

    console.log("Dados formatados:", {
      viewCount: item.viewCount,
      formattedViews,
      publishedAt: item.publishedAt,
      formattedDate,
    });

    return (
      <TouchableOpacity
        style={styles.videoItem}
        onPress={() => openVideo(item.id, item.title)}
        activeOpacity={0.7}
      >
        <View style={styles.thumbnailContainer}>
          {item.thumbnail ? (
            <Image source={{ uri: item.thumbnail }} style={styles.thumbnail} />
          ) : (
            <View
              style={[
                styles.thumbnail,
                {
                  backgroundColor: "#f0f0f0",
                  justifyContent: "center",
                  alignItems: "center",
                },
              ]}
            >
              <MaterialIcons name="videocam-off" size={40} color="#ccc" />
            </View>
          )}

          {/* Ícone de play centralizado */}
          <View style={styles.playIconContainer}>
            <MaterialIcons
              name="play-circle-filled"
              size={50}
              color="rgba(255, 255, 255, 0.9)"
            />
          </View>

          <View style={styles.durationBadge}>
            <Text style={styles.durationText}>
              {formatDuration(item.duration)}
            </Text>
          </View>
        </View>

        <View style={styles.videoInfo}>
          <Text style={styles.videoTitle} numberOfLines={2}>
            {item.title || "Título não disponível"}
          </Text>

          <Text style={styles.channelName} numberOfLines={1}>
            {item.channelTitle || "Canal não disponível"}
          </Text>

          <View style={styles.videoStats}>
            <Text style={styles.viewCount}>{formattedViews} visualizações</Text>
            <Text style={styles.publishedDate}>• {formattedDate}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderFooter = () => {
    if (!loadingMore) return null;

    return (
      <View style={styles.loadingFooter}>
        <ActivityIndicator size="small" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Carregando mais vídeos...</Text>
      </View>
    );
  };

  const renderEmpty = () => {
    if (loading) return null;

    return (
      <View style={styles.emptyContainer}>
        <MaterialIcons name="videocam-off" size={64} color="#ccc" />
        <Text style={styles.emptyText}>Nenhum vídeo encontrado</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={loadInitialVideos}
        >
          <Text style={styles.retryButtonText}>Tentar novamente</Text>
        </TouchableOpacity>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Carregando episódios...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Image source={Logo} style={styles.logo} resizeMode="contain" />
      </View>

      <FlatList
        ref={flatListRef}
        data={videos}
        keyExtractor={(item) => item.id}
        renderItem={VideoItem}
        onEndReached={loadMoreVideos}
        onEndReachedThreshold={0.5}
        onScroll={handleScroll}
        scrollEventThrottle={400}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[theme.colors.primary]}
          />
        }
        ListFooterComponent={renderFooter}
        ListEmptyComponent={renderEmpty}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={
          videos.length === 0 ? styles.emptyListContainer : null
        }
      />

      {showScrollToTop && (
        <TouchableOpacity
          style={styles.scrollToTopButton}
          onPress={scrollToTop}
          activeOpacity={0.8}
        >
          <MaterialIcons name="keyboard-arrow-up" size={24} color="white" />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  logo: {
    width: 150,
    height: 100,
  },
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: theme.colors.foreground,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: theme.colors.muted,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: theme.colors.background,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: theme.colors.muted,
  },
  videoItem: {
    marginHorizontal: 16,
    marginVertical: 8,
    backgroundColor: "white",
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
    overflow: "hidden",
  },
  thumbnailContainer: {
    position: "relative",
  },
  thumbnail: {
    width: ITEM_WIDTH,
    height: (ITEM_WIDTH * 9) / 16, // Aspect ratio 16:9
    backgroundColor: "#f0f0f0",
  },
  playIconContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.3)",
  },
  durationBadge: {
    position: "absolute",
    bottom: 8,
    right: 8,
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  durationText: {
    color: "white",
    fontSize: 12,
    fontWeight: "500",
  },
  videoInfo: {
    padding: 12,
  },
  videoTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: theme.colors.foreground,
    marginBottom: 6,
    lineHeight: 22,
  },
  channelName: {
    fontSize: 14,
    color: "#888",
    marginBottom: 6,
    fontWeight: "400",
  },
  videoStats: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  viewCount: {
    fontSize: 12,
    color: "#666",
    fontWeight: "400",
  },
  publishedDate: {
    fontSize: 12,
    color: "#666",
    marginLeft: 4,
    fontWeight: "400",
  },
  loadingFooter: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  emptyContainer: {
    alignItems: "center",
    padding: 32,
  },
  emptyListContainer: {
    flexGrow: 1,
    justifyContent: "center",
  },
  emptyText: {
    fontSize: 16,
    color: theme.colors.muted,
    marginTop: 16,
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  scrollToTopButton: {
    position: "absolute",
    bottom: 20,
    right: 20,
    backgroundColor: theme.colors.primary,
    borderRadius: 28,
    width: 56,
    height: 56,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
});
