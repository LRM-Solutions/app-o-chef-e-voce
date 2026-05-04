import React, { useState, useRef, useEffect } from "react";
import CoinIcon from "../components/ui/CoinIcon";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Dimensions,
  FlatList,
  Modal,
  Animated,
  Easing,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { theme } from "../utils/theme";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import SansCoinsDisplay from "../components/ui/SansCoinsDisplay";
import SectionHeader from "../components/ui/SectionHeader";
import Avatar from "../components/ui/Avatar";
import {
  currentUser,
  miniGames,
  dailyMissions,
  loyaltyLevels,
  transactionHistory,
} from "../data/mockData";

const { width } = Dimensions.get("window");

const PlayScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const [showGameModal, setShowGameModal] = useState(false);
  const [selectedGame, setSelectedGame] = useState(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [reward, setReward] = useState(null);
  const [showReward, setShowReward] = useState(false);
  
  const spinValue = useRef(new Animated.Value(0)).current;
  const scaleValue = useRef(new Animated.Value(1)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: currentUser.levelProgress,
      duration: 1000,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, []);

  const getCurrentLevel = () => {
    return loyaltyLevels.find((l) => l.level === currentUser.level);
  };

  const getNextLevel = () => {
    return loyaltyLevels.find((l) => l.level === currentUser.level + 1);
  };

  const openGame = (game) => {
    setSelectedGame(game);
    setShowGameModal(true);
    setReward(null);
    setShowReward(false);
    spinValue.setValue(0);
  };

  const spinRoulette = () => {
    setIsSpinning(true);
    
    // Random reward between 10 and 500
    const randomReward = Math.floor(Math.random() * (500 - 10 + 1)) + 10;
    
    // Spin animation
    Animated.sequence([
      Animated.timing(spinValue, {
        toValue: 5, // 5 full rotations
        duration: 3000,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start(() => {
      setReward(randomReward);
      setShowReward(true);
      setIsSpinning(false);
      
      // Bounce animation for reward
      Animated.spring(scaleValue, {
        toValue: 1.2,
        friction: 3,
        tension: 40,
        useNativeDriver: true,
      }).start(() => {
        Animated.spring(scaleValue, {
          toValue: 1,
          friction: 3,
          useNativeDriver: true,
        }).start();
      });
    });
  };

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  const renderGame = ({ item }) => (
    <TouchableOpacity
      style={[styles.gameCard, item.comingSoon && styles.gameCardDisabled]}
      onPress={() => !item.comingSoon && openGame(item)}
      activeOpacity={0.9}
      disabled={item.comingSoon}
    >
      <Image source={{ uri: item.image }} style={styles.gameImage} />
      <View style={styles.gameOverlay}>
        {item.comingSoon ? (
          <View style={styles.comingSoonBadge}>
            <Text style={styles.comingSoonText}>EM BREVE</Text>
          </View>
        ) : (
          <View style={styles.rewardBadge}>
            <View style={{flexDirection: 'row', alignItems: 'center'}}><CoinIcon size={10} /><Text style={[styles.rewardBadgeText, {marginLeft: 4}]}>{item.reward}</Text></View>
          </View>
        )}
      </View>
      <View style={styles.gameInfo}>
        <Text style={styles.gameName}>{item.name}</Text>
        <Text style={styles.gameDescription} numberOfLines={1}>
          {item.description}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const renderMission = ({ item }) => (
    <Card
      style={[
        styles.missionCard,
        item.completed && styles.missionCardCompleted,
      ]}
      padding="sm"
    >
      <View style={styles.missionContent}>
        <View
          style={[
            styles.missionIcon,
            item.completed && styles.missionIconCompleted,
          ]}
        >
          <MaterialCommunityIcons
            name={item.icon}
            size={20}
            color={item.completed ? "#FFF" : theme.colors.primary}
          />
        </View>
        <View style={styles.missionInfo}>
          <Text
            style={[
              styles.missionTitle,
              item.completed && styles.missionTitleCompleted,
            ]}
          >
            {item.title}
          </Text>
          <Text style={styles.missionDescription}>{item.description}</Text>
        </View>
        <View style={styles.missionReward}>
          {item.completed ? (
            <MaterialIcons name="check-circle" size={24} color={theme.colors.success} />
          ) : (
            <View style={styles.missionCoins}>
              <Text style={styles.missionCoinsText}>+{item.reward}</Text>
              <CoinIcon size={16} />
            </View>
          )}
        </View>
      </View>
    </Card>
  );

  const renderTransaction = ({ item }) => (
    <View style={styles.transactionItem}>
      <View
        style={[
          styles.transactionIcon,
          item.type === "earn" ? styles.earnIcon : styles.spendIcon,
        ]}
      >
        <MaterialIcons
          name={item.type === "earn" ? "add" : "remove"}
          size={16}
          color={item.type === "earn" ? theme.colors.success : theme.colors.error}
        />
      </View>
      <View style={styles.transactionInfo}>
        <Text style={styles.transactionDescription}>{item.description}</Text>
        <Text style={styles.transactionDate}>
          {new Date(item.date).toLocaleDateString("pt-BR")}
        </Text>
      </View>
      <Text
        style={[
          styles.transactionAmount,
          item.type === "earn" ? styles.earnAmount : styles.spendAmount,
        ]}
      >
        {item.type === "earn" ? "+" : ""}{item.amount}
      </Text>
    </View>
  );

  const currentLevel = getCurrentLevel();
  const nextLevel = getNextLevel();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Play 🎮</Text>
          <Text style={styles.subtitle}>Ganhe Sans Coins jogando!</Text>
        </View>

        {/* Wallet Card */}
        <Card style={styles.walletCard}>
          <View style={styles.walletGradient}>
            <View style={styles.walletHeader}>
              <View style={styles.walletUserInfo}>
                <Avatar
                  source={currentUser.avatar}
                  size="lg"
                  name={currentUser.name}
                />
                <View style={styles.walletUserDetails}>
                  <Text style={styles.walletName}>{currentUser.fullName}</Text>
                  <View style={styles.levelBadge}>
                    <Text style={styles.levelText}>{currentLevel?.name}</Text>
                  </View>
                </View>
              </View>
              <View style={styles.walletBalance}>
                <Text style={styles.balanceLabel}>Saldo</Text>
                <View style={styles.balanceRow}>
                  <CoinIcon size={24} />
                  <Text style={styles.balanceAmount}>
                    {currentUser.sansCoins.toLocaleString("pt-BR")}
                  </Text>
                </View>
              </View>
            </View>

            {/* Progress to Next Level */}
            <View style={styles.levelProgress}>
              <View style={styles.levelProgressHeader}>
                <Text style={styles.levelProgressLabel}>
                  Progresso para {nextLevel?.name}
                </Text>
                <Text style={styles.levelProgressValue}>
                  {Math.round(currentUser.levelProgress * 100)}%
                </Text>
              </View>
              <View style={styles.progressBarContainer}>
                <Animated.View
                  style={[
                    styles.progressBarFill,
                    {
                      width: progressAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: ["0%", "100%"],
                      }),
                    },
                  ]}
                />
              </View>
              <Text style={styles.levelProgressHint}>
                Faltam {(currentUser.nextLevelCoins - currentUser.sansCoins).toLocaleString("pt-BR")} coins
              </Text>
            </View>
          </View>
        </Card>

        {/* Mini Games */}
        <SectionHeader
          title="Mini Games"
          subtitle="Jogue e ganhe coins"
          style={styles.sectionHeader}
        />
        <FlatList
          data={miniGames}
          renderItem={renderGame}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.gamesList}
        />

        {/* Daily Missions */}
        <SectionHeader
          title="Missões Diárias"
          subtitle="Complete e ganhe recompensas"
          style={styles.sectionHeader}
        />
        <View style={styles.missionsContainer}>
          {dailyMissions.map((mission) => (
            <Card
              key={mission.id}
              style={[
                styles.missionCard,
                mission.completed && styles.missionCardCompleted,
              ]}
              padding="sm"
            >
              <View style={styles.missionContent}>
                <View
                  style={[
                    styles.missionIcon,
                    mission.completed && styles.missionIconCompleted,
                  ]}
                >
                  <MaterialCommunityIcons
                    name={mission.icon}
                    size={20}
                    color={mission.completed ? "#FFF" : theme.colors.primary}
                  />
                </View>
                <View style={styles.missionInfo}>
                  <Text
                    style={[
                      styles.missionTitle,
                      mission.completed && styles.missionTitleCompleted,
                    ]}
                  >
                    {mission.title}
                  </Text>
                  <Text style={styles.missionDescription}>{mission.description}</Text>
                </View>
                <View style={styles.missionReward}>
                  {mission.completed ? (
                    <MaterialIcons name="check-circle" size={24} color={theme.colors.success} />
                  ) : (
                    <View style={styles.missionCoins}>
                      <Text style={styles.missionCoinsText}>+{mission.reward}</Text>
                      <CoinIcon size={12} />
                    </View>
                  )}
                </View>
              </View>
            </Card>
          ))}
        </View>

        {/* Recent Transactions */}
        <SectionHeader
          title="Últimas Transações"
          actionText="Ver todas"
          onActionPress={() => {}}
          style={styles.sectionHeader}
        />
        <Card style={styles.transactionsCard}>
          {transactionHistory.slice(0, 5).map((transaction, index) => (
            <View
              key={transaction.id}
              style={[
                styles.transactionItem,
                index < transactionHistory.length - 1 && styles.transactionBorder,
              ]}
            >
              <View
                style={[
                  styles.transactionIcon,
                  transaction.type === "earn" ? styles.earnIcon : styles.spendIcon,
                ]}
              >
                <MaterialIcons
                  name={transaction.type === "earn" ? "add" : "remove"}
                  size={16}
                  color={transaction.type === "earn" ? theme.colors.success : theme.colors.error}
                />
              </View>
              <View style={styles.transactionInfo}>
                <Text style={styles.transactionDescription}>{transaction.description}</Text>
                <Text style={styles.transactionDate}>
                  {new Date(transaction.date).toLocaleDateString("pt-BR")}
                </Text>
              </View>
              <Text
                style={[
                  styles.transactionAmount,
                  transaction.type === "earn" ? styles.earnAmount : styles.spendAmount,
                ]}
              >
                <View style={{flexDirection: 'row', alignItems: 'center'}}><Text style={[styles.transactionAmount, transaction.type === "earn" ? styles.earnAmount : styles.spendAmount]}>{transaction.type === "earn" ? "+" : ""}{transaction.amount} </Text><CoinIcon size={12} /></View>
              </Text>
            </View>
          ))}
        </Card>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Game Modal */}
      <Modal
        visible={showGameModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowGameModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { paddingBottom: insets.bottom + 24 }]}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowGameModal(false)}
            >
              <MaterialIcons name="close" size={24} color={theme.colors.textSecondary} />
            </TouchableOpacity>

            {selectedGame?.type === "spin" && (
              <View style={styles.gameContent}>
                <Text style={styles.gameModalTitle}>Roleta Sans</Text>
                <Text style={styles.gameModalSubtitle}>
                  Gire a roleta e ganhe até 500 Sans Coins!
                </Text>

                {/* Roulette */}
                <View style={styles.rouletteContainer}>
                  <Animated.View
                    style={[
                      styles.roulette,
                      { transform: [{ rotate: spin }] },
                    ]}
                  >
                    <View style={styles.rouletteInner}>
                      {[10, 50, 100, 200, 500, 25, 75, 150].map((value, index) => (
                        <View
                          key={index}
                          style={[
                            styles.rouletteSection,
                            {
                              transform: [{ rotate: `${index * 45}deg` }],
                              backgroundColor: index % 2 === 0 
                                ? theme.colors.primary 
                                : theme.colors.primaryLight,
                            },
                          ]}
                        >
                          <Text style={styles.rouletteSectionText}>{value}</Text>
                        </View>
                      ))}
                      <View style={styles.rouletteCenter}>
                        <CoinIcon size={24} />
                      </View>
                    </View>
                  </Animated.View>
                  <View style={styles.roulettePointer}>
                    <MaterialIcons name="arrow-drop-down" size={40} color={theme.colors.coins} />
                  </View>
                </View>

                {/* Reward Display */}
                {showReward && (
                  <Animated.View
                    style={[
                      styles.rewardDisplay,
                      { transform: [{ scale: scaleValue }] },
                    ]}
                  >
                    <Text style={styles.rewardTitle}>Parabéns! 🎉</Text>
                    <Text style={styles.rewardAmount}>+{reward} Sans Coins</Text>
                  </Animated.View>
                )}

                {/* Spin Button */}
                {!showReward && (
                  <Button
                    title={isSpinning ? "Girando..." : "Girar Roleta"}
                    onPress={spinRoulette}
                    disabled={isSpinning}
                    size="lg"
                    icon={
                      !isSpinning && (
                        <MaterialIcons name="refresh" size={20} color="#FFF" />
                      )
                    }
                  />
                )}

                {showReward && (
                  <Button
                    title="Jogar Novamente"
                    onPress={() => {
                      setShowReward(false);
                      setReward(null);
                      spinValue.setValue(0);
                    }}
                    size="lg"
                    variant="outline"
                  />
                )}
              </View>
            )}

            {selectedGame?.type === "quiz" && (
              <View style={styles.gameContent}>
                <Text style={styles.gameModalTitle}>Quiz Barba</Text>
                <Text style={styles.gameModalSubtitle}>
                  Teste seus conhecimentos sobre barbearia!
                </Text>
                <View style={styles.quizPlaceholder}>
                  <MaterialIcons name="help-outline" size={64} color={theme.colors.primary} />
                  <Text style={styles.placeholderText}>
                    Quiz em desenvolvimento
                  </Text>
                  <Text style={styles.placeholderSubtext}>
                    Em breve você poderá jogar e ganhar 50 Sans Coins!
                  </Text>
                </View>
              </View>
            )}

            {selectedGame?.type === "arcade" && (
              <View style={styles.gameContent}>
                <Text style={styles.gameModalTitle}>Flappy Sans</Text>
                <Text style={styles.gameModalSubtitle}>
                  Quanto mais longe, mais coins você ganha!
                </Text>
                <View style={styles.quizPlaceholder}>
                  <MaterialIcons name="videogame-asset" size={64} color={theme.colors.primary} />
                  <Text style={styles.placeholderText}>
                    Jogo em desenvolvimento
                  </Text>
                  <Text style={styles.placeholderSubtext}>
                    Em breve você poderá jogar e ganhar até 100 Sans Coins!
                  </Text>
                </View>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  header: {
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: theme.colors.textPrimary,
  },
  subtitle: {
    fontSize: 14,
    color: theme.colors.textMuted,
    marginTop: 2,
  },
  // Wallet Card
  walletCard: {
    marginHorizontal: 24,
    marginBottom: 32,
    overflow: "hidden",
    backgroundColor: theme.colors.primary,
  },
  walletGradient: {
    padding: 20,
  },
  walletHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  walletUserInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  walletUserDetails: {
    marginLeft: 12,
  },
  walletName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFF",
  },
  levelBadge: {
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 4,
  },
  levelText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#FFF",
  },
  walletBalance: {
    alignItems: "flex-end",
  },
  balanceLabel: {
    fontSize: 12,
    color: "rgba(255,255,255,0.7)",
  },
  balanceRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  coinEmojiBig: {
    fontSize: 24,
    marginRight: 8,
  },
  balanceAmount: {
    fontSize: 28,
    fontWeight: "700",
    color: "#FFF",
  },
  levelProgress: {
    marginTop: 24,
  },
  levelProgressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  levelProgressLabel: {
    fontSize: 13,
    color: "rgba(255,255,255,0.8)",
  },
  levelProgressValue: {
    fontSize: 13,
    fontWeight: "600",
    color: "#FFF",
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: "rgba(255,255,255,0.3)",
    borderRadius: 4,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: theme.colors.coins,
    borderRadius: 4,
  },
  levelProgressHint: {
    fontSize: 11,
    color: "rgba(255,255,255,0.6)",
    marginTop: 6,
  },
  // Section Header
  sectionHeader: {
    paddingHorizontal: 24,
    marginTop: 32,
    marginBottom: 8,
  },
  // Games
  gamesList: {
    paddingHorizontal: 24,
  },
  gameCard: {
    width: 180,
    marginRight: 16,
    borderRadius: theme.borderRadius.lg,
    overflow: "hidden",
    backgroundColor: theme.colors.card,
    ...theme.shadows.md,
  },
  gameCardDisabled: {
    opacity: 0.6,
  },
  gameImage: {
    width: "100%",
    height: 100,
    backgroundColor: theme.colors.secondary,
  },
  gameOverlay: {
    position: "absolute",
    top: 8,
    right: 8,
  },
  rewardBadge: {
    backgroundColor: theme.colors.coinsBackground,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.colors.coins,
  },
  rewardBadgeText: {
    fontSize: 11,
    fontWeight: "600",
    color: theme.colors.textPrimary,
  },
  comingSoonBadge: {
    backgroundColor: theme.colors.textMuted,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  comingSoonText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#FFF",
  },
  gameInfo: {
    padding: 12,
  },
  gameName: {
    fontSize: 15,
    fontWeight: "600",
    color: theme.colors.textPrimary,
  },
  gameDescription: {
    fontSize: 12,
    color: theme.colors.textMuted,
    marginTop: 4,
  },
  // Missions
  missionsContainer: {
    paddingHorizontal: 24,
    gap: 10,
  },
  missionCard: {
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
  },
  missionCardCompleted: {
    backgroundColor: theme.colors.successLight,
    borderColor: theme.colors.success + "30",
  },
  missionContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  missionIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: theme.colors.primaryLight + "20",
    alignItems: "center",
    justifyContent: "center",
  },
  missionIconCompleted: {
    backgroundColor: theme.colors.success,
  },
  missionInfo: {
    flex: 1,
    marginLeft: 12,
  },
  missionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: theme.colors.textPrimary,
  },
  missionTitleCompleted: {
    textDecorationLine: "line-through",
    color: theme.colors.textMuted,
  },
  missionDescription: {
    fontSize: 12,
    color: theme.colors.textMuted,
    marginTop: 2,
  },
  missionReward: {
    marginLeft: 12,
  },
  missionCoins: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.coinsBackground,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  missionCoinsText: {
    fontSize: 13,
    fontWeight: "700",
    color: theme.colors.textPrimary,
  },
  coinEmojiSmall: {
    fontSize: 12,
    marginLeft: 4,
  },
  // Transactions
  transactionsCard: {
    marginHorizontal: 24,
  },
  transactionItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
  },
  transactionBorder: {
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderLight,
  },
  transactionIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  earnIcon: {
    backgroundColor: theme.colors.successLight,
  },
  spendIcon: {
    backgroundColor: theme.colors.errorLight,
  },
  transactionInfo: {
    flex: 1,
    marginLeft: 12,
  },
  transactionDescription: {
    fontSize: 14,
    fontWeight: "500",
    color: theme.colors.textPrimary,
  },
  transactionDate: {
    fontSize: 12,
    color: theme.colors.textMuted,
    marginTop: 2,
  },
  transactionAmount: {
    fontSize: 14,
    fontWeight: "600",
  },
  earnAmount: {
    color: theme.colors.success,
  },
  spendAmount: {
    color: theme.colors.error,
  },
  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: theme.colors.overlay,
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: theme.colors.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    minHeight: 500,
  },
  closeButton: {
    position: "absolute",
    top: 16,
    right: 16,
    zIndex: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.secondary,
    alignItems: "center",
    justifyContent: "center",
  },
  gameContent: {
    padding: 24,
    alignItems: "center",
  },
  gameModalTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: theme.colors.textPrimary,
    marginTop: 16,
  },
  gameModalSubtitle: {
    fontSize: 14,
    color: theme.colors.textMuted,
    marginTop: 8,
    textAlign: "center",
  },
  // Roulette
  rouletteContainer: {
    width: 260,
    height: 260,
    marginVertical: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  roulette: {
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: theme.colors.primary,
    alignItems: "center",
    justifyContent: "center",
    ...theme.shadows.lg,
  },
  rouletteInner: {
    width: 220,
    height: 220,
    borderRadius: 110,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
  },
  rouletteSection: {
    position: "absolute",
    width: 110,
    height: 60,
    alignItems: "flex-end",
    justifyContent: "center",
    paddingRight: 20,
    transformOrigin: "0% 50%",
    left: "50%",
  },
  rouletteSectionText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#FFF",
  },
  rouletteCenter: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#FFF",
    alignItems: "center",
    justifyContent: "center",
    ...theme.shadows.md,
  },
  rouletteCenterText: {
    fontSize: 28,
  },
  roulettePointer: {
    position: "absolute",
    top: 0,
  },
  // Reward
  rewardDisplay: {
    alignItems: "center",
    marginBottom: 24,
  },
  rewardTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: theme.colors.textPrimary,
  },
  rewardAmount: {
    fontSize: 32,
    fontWeight: "700",
    color: theme.colors.primary,
    marginTop: 8,
  },
  // Placeholder
  quizPlaceholder: {
    alignItems: "center",
    paddingVertical: 40,
  },
  placeholderText: {
    fontSize: 18,
    fontWeight: "600",
    color: theme.colors.textPrimary,
    marginTop: 16,
  },
  placeholderSubtext: {
    fontSize: 14,
    color: theme.colors.textMuted,
    marginTop: 8,
    textAlign: "center",
  },
});

export default PlayScreen;
