import React, { useEffect, useState, useCallback, useRef } from "react";
import CoinIcon from "../components/ui/CoinIcon";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Linking,
  ScrollView,
  Image,
  ActivityIndicator,
  Animated,
  Easing,
} from "react-native";
import { BlurView } from "expo-blur";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import * as ImagePicker from "expo-image-picker";
import { logout, requestDeleteAccount, getUserEmail } from "../api/authApi";
import { getProfile, uploadAvatar, updateProfile, getMyRedemptions } from "../api/barberApi";
import { useAuth } from "../components/AuthProvider";
import { CartService } from "../services/cartService";
import { theme, createTextStyle, createButtonStyle } from "../utils/theme";
import { config } from "../utils/config";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTheme } from "../utils/ThemeContext";
import Skeleton from "../components/ui/Skeleton";

const Watermark = ({ styles }) => {
  return (
    <View style={styles.watermarkWrapper}>
      <Text style={styles.watermarkCopyright}>
        © 2026 Sans Company Barbearia. Todos os direitos reservados.
      </Text>

      <Text style={styles.watermarkPreText}>App Desenvolvido com ❤️ por</Text>

      <TouchableOpacity
        activeOpacity={0.6}
        onPress={() => Linking.openURL('https://lrmsolutions.com.br')}
      >
        <View style={styles.watermarkBrandContainer}>
          <View style={styles.watermarkLogoWrapper}>
            <Image
              source={require("../../assets/lrm_logo.png")}
              style={styles.watermarkLogo}
              resizeMode="cover"
            />
          </View>
          <Text style={styles.watermarkLinkText}>LRM Software Solutions</Text>
        </View>
      </TouchableOpacity>
    </View>
  );
};

const PerfilScreen = ({ navigation }) => {
  const { logout: authLogout, isAuthenticated } = useAuth();
  const { theme, themeMode, changeTheme } = useTheme();
  const styles = getStyles(theme);
  const [profile, setProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [redemptions, setRedemptions] = useState([]);

  useFocusEffect(
    useCallback(() => {
      if (isAuthenticated) {
        loadProfile();
      }
    }, [isAuthenticated])
  );

  const loadProfile = async () => {
    setLoadingProfile(true);
    try {
      const data = await getProfile();
      setProfile(data);
      // Atualizar AsyncStorage com dados mais recentes
      if (data.user_name) {
        await AsyncStorage.setItem("user_name", data.user_name);
      }
      if (data.user_email) {
        await AsyncStorage.setItem("user_email", data.user_email);
      }
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Erro de Conexão",
        text2: error.message || "Falha na rede. Verifique sua conexão com a internet.",
      });
      // Fallback para AsyncStorage
      try {
        const name = await AsyncStorage.getItem("user_name");
        const email = await AsyncStorage.getItem("user_email");
        setProfile({ user_name: name || "", user_email: email || "", clube_sans: false });
      } catch (e) {
        setProfile(null);
      }
    } finally {
      setLoadingProfile(false);
    }
  };

  const loadRedemptions = async () => {
    try {
      const data = await getMyRedemptions();
      setRedemptions(data || []);
    } catch (e) {
    }
  };

  useFocusEffect(
    useCallback(() => {
      if (isAuthenticated) {
        loadRedemptions();
      }
    }, [isAuthenticated])
  );

  const handlePickAvatar = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permissão necessária", "Precisamos de acesso à galeria para alterar sua foto.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setUploadingAvatar(true);
      try {
        const updatedUser = await uploadAvatar(result.assets[0].uri);
        setProfile((prev) => ({ ...prev, ...updatedUser }));
      } catch (error) {
        Alert.alert("Erro", "Não foi possível atualizar a foto. Tente novamente.");
        console.error("Erro no upload:", error);
      } finally {
        setUploadingAvatar(false);
      }
    }
  };

  const handleHistorico = () => {
    navigation.navigate("HistoricoAgendamentos");
  };

  const handleMinhaJornada = () => {
    navigation.navigate("MinhaJornada");
  };

  const handleMeusPedidos = () => {
    navigation.navigate("MeusPedidos");
  };

  const handleAlterarSenha = () => {
    navigation.navigate("AlterarSenha");
  };

  const handleDeleteAccount = () => {
    const doDelete = async () => {
      try {
        const userEmail = await getUserEmail();
        const response = await requestDeleteAccount();
        if (response && userEmail) {
          navigation.navigate("ConfirmarExclusaoCode", { userEmail });
        } else {
          if (Platform.OS === "web") {
            window.alert("Não foi possível processar a solicitação.");
          } else {
            Alert.alert("Erro", "Não foi possível processar a solicitação.");
          }
        }
      } catch (error) {
        if (Platform.OS === "web") {
          window.alert("Erro ao processar a exclusão da conta.");
        } else {
          Alert.alert("Erro", "Erro ao processar a exclusão da conta.");
        }
      }
    };

    if (Platform.OS === "web") {
      const confirmDelete = window.confirm(
        "Esta ação é irreversível. Ao confirmar, todos os seus dados pessoais, histórico de agendamentos e saldo de Sans Coins serão apagados permanentemente de nossos servidores.\n\nDeseja prosseguir com a exclusão?"
      );
      if (confirmDelete) {
        doDelete();
      }
      return;
    }

    Alert.alert(
      "Excluir Minha Conta",
      "Esta ação é irreversível. Ao confirmar, todos os seus dados pessoais, histórico de agendamentos e saldo de Sans Coins serão apagados permanentemente de nossos servidores.\n\nDeseja prosseguir com a exclusão?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Excluir Definitivamente",
          style: "destructive",
          onPress: doDelete,
        },
      ],
      { cancelable: true }
    );
  };

  const openExternalLink = async (url) => {
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert("Erro", "Não foi possível abrir o link.");
      }
    } catch (error) {
      Alert.alert("Erro", "Erro ao tentar abrir o link.");
    }
  };

  const handleLogout = async () => {
    if (Platform.OS === 'web') {
      const confirmLogout = window.confirm("Tem certeza que deseja sair?");
      if (confirmLogout) {
        try {
          await logout();
          if (typeof CartService !== 'undefined') await CartService.clearAllCart();
          authLogout();
          navigation.reset({
            index: 0,
            routes: [{ name: 'Intro' }],
          });
        } catch (error) {
          alert("Erro ao fazer logout");
        }
      }
      return;
    }

    Alert.alert("Confirmar Logout", "Tem certeza que deseja sair?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Sair",
        style: "destructive",
        onPress: async () => {
          try {
            await logout();
            if (typeof CartService !== 'undefined') await CartService.clearAllCart();
            authLogout();
            navigation.reset({
              index: 0,
              routes: [{ name: 'Login' }],
            });
          } catch (error) {
            Alert.alert("Erro", "Erro ao fazer logout");
          }
        },
      },
    ]);
  };

  const getInitials = (name) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const renderMenuItem = (icon, label, onPress, { color, destructive } = {}) => (
    <TouchableOpacity style={styles.menuItem} onPress={onPress} activeOpacity={0.6}>
      <View style={styles.menuItemContent}>
        <View style={[styles.menuIconBox, destructive && styles.menuIconBoxDestructive]}>
          <MaterialIcons name={icon} size={20} color={destructive ? theme.colors.error : theme.colors.primary} />
        </View>
        <Text style={[styles.menuItemText, destructive && styles.deleteAccountText]}>
          {label}
        </Text>
      </View>
      <MaterialIcons name="chevron-right" size={22} color={theme.colors.textLight} />
    </TouchableOpacity>
  );

  const renderSeparator = () => <View style={styles.separator} />;

  // ========================
  // Tela para não logados
  // ========================
  if (!isAuthenticated) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <ScrollView style={styles.scrollView} contentContainerStyle={[styles.content, styles.contentNotLogged, { padding: 24, paddingBottom: 40 }]}>
          <View style={{ alignItems: 'center', marginTop: 20 }}>
            <Image
              source={Platform.OS === "android" ? require("../../assets/logosansnobg.png") : require("../../assets/sanslogo.png")}
              style={{ width: 120, height: 120, marginBottom: 24 }}
              resizeMode="contain"
            />
            <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 12, textAlign: 'center', color: theme.colors.textPrimary }}>Bem-vindo ao Sans Company!</Text>
            <Text style={{ fontSize: 16, color: theme.colors.textMuted, textAlign: 'center', marginBottom: 32 }}>Faça login ou crie uma conta para agendar serviços, ganhar moedas e resgatar prêmios.</Text>

            <TouchableOpacity
              style={[styles.logoutButton, { backgroundColor: theme.colors.primary, width: '100%', justifyContent: 'center', marginBottom: 16 }]}
              onPress={() => navigation.navigate("Login")}
            >
              <Text style={[styles.logoutButtonText, { color: '#FFFFFF' }]}>Fazer Login / Cadastrar</Text>
            </TouchableOpacity>
          </View>

          {/* Menu - Informações */}
          <Text style={[styles.sectionLabel, { marginTop: 24 }]}>Informações</Text>
          <View style={[styles.menuList, { width: '100%' }]}>
            {renderMenuItem("policy", "Política de Privacidade", () =>
              openExternalLink(config.PRIVACY_POLICY_URL)
            )}
            {renderSeparator()}
            {renderMenuItem("gavel", "Termos de Uso", () =>
              openExternalLink(config.TERMS_OF_USE_URL)
            )}
            {renderSeparator()}
            {renderMenuItem("support-agent", "Suporte", () =>
              openExternalLink(config.SUPPORT_URL)
            )}
          </View>

          {/* Menu - Aparência */}
          <Text style={[styles.sectionLabel, { marginTop: 16 }]}>Aparência</Text>
          <View style={[styles.menuList, { width: '100%' }]}>
            <View style={styles.themeToggleContainer}>
              <TouchableOpacity 
                style={[styles.themeOption, themeMode === 'light' && styles.themeOptionActive]} 
                onPress={() => changeTheme('light')}
              >
                <MaterialIcons name="light-mode" size={24} color={themeMode === 'light' ? theme.colors.primary : theme.colors.textMuted} />
                <Text style={[styles.themeOptionText, themeMode === 'light' && {color: theme.colors.primary, fontWeight: '700'}]}>Claro</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.themeOption, themeMode === 'dark' && styles.themeOptionActive]} 
                onPress={() => changeTheme('dark')}
              >
                <MaterialIcons name="dark-mode" size={24} color={themeMode === 'dark' ? theme.colors.primary : theme.colors.textMuted} />
                <Text style={[styles.themeOptionText, themeMode === 'dark' && {color: theme.colors.primary, fontWeight: '700'}]}>Escuro</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.themeOption, themeMode === 'system' && styles.themeOptionActive]} 
                onPress={() => changeTheme('system')}
              >
                <MaterialIcons name="settings-suggest" size={24} color={themeMode === 'system' ? theme.colors.primary : theme.colors.textMuted} />
                <Text style={[styles.themeOptionText, themeMode === 'system' && {color: theme.colors.primary, fontWeight: '700'}]}>Sistema</Text>
              </TouchableOpacity>
            </View>
          </View>

          <Watermark styles={styles} />
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ========================
  // Tela para logados
  // ========================
  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Header Card */}
        <View style={styles.profileCard}>
          {loadingProfile ? (
            <>
              <View style={styles.avatarContainer}>
                <Skeleton width={96} height={96} style={{ borderRadius: 48 }} />
              </View>
              <Skeleton width={150} height={24} style={{ marginBottom: 4 }} />
              <Skeleton width={180} height={16} style={{ marginBottom: 14 }} />
              <Skeleton width={120} height={32} style={{ borderRadius: 16 }} />
            </>
          ) : (
            <>
              <TouchableOpacity
                style={styles.avatarContainer}
                onPress={handlePickAvatar}
                activeOpacity={0.7}
              >
                {profile?.avatar_url ? (
                  <Image source={{ uri: profile.avatar_url }} style={styles.avatarImage} />
                ) : (
                  <View style={styles.avatarPlaceholder}>
                    <Text style={styles.avatarInitials}>
                      {getInitials(profile?.user_name)}
                    </Text>
                  </View>
                )}

                {/* Camera overlay badge */}
                <View style={styles.cameraBadge}>
                  {uploadingAvatar ? (
                    <ActivityIndicator size={14} color="#FFF" />
                  ) : (
                    <MaterialIcons name="camera-alt" size={14} color="#FFF" />
                  )}
                </View>
              </TouchableOpacity>

              <Text style={styles.profileName}>
                {profile?.user_name || "Usuário"}
              </Text>
              <Text style={styles.profileEmail}>
                {profile?.user_email || ""}
              </Text>

              {profile?.user_coins_balance !== undefined && (
                <View style={styles.coinsBadge}>
                  <CoinIcon size={14} style={{ marginRight: 6 }} />
                  <Text style={styles.coinsText}>
                    {profile.user_coins_balance} Sans Coins
                  </Text>
                </View>
              )}
            </>
          )}
        </View>

        {/* Ranking de Sans Coins */}
        <Text style={styles.sectionLabel}>Top Clube Sans</Text>
        <View style={styles.rankingContainer}>
          <View style={styles.rankingCard}>
            {(!profile?.clube_sans) && (
              <View style={styles.clubeOverlay}>
                <BlurView intensity={themeMode === 'dark' ? 30 : 10} tint={themeMode === 'dark' ? 'dark' : 'light'} style={styles.blurContainer} />
                <View style={styles.clubeOverlayContent}>
                  <View style={styles.clubeLockCircle}>
                    <MaterialIcons name="lock" size={24} color={theme.colors.primary} />
                  </View>
                  <Text style={styles.clubeOverlayTitle}>Ranking Exclusivo</Text>
                  <Text style={styles.clubeOverlayText}>
                    Assine o Clube Sans para participar do ranking e disputar prêmios.
                  </Text>
                  <TouchableOpacity
                    style={styles.clubeCTAButton}
                    onPress={() => {
                      const message = encodeURIComponent("Olá! Gostaria de saber mais sobre como fazer parte do Clube Sans!");
                      Linking.openURL(`whatsapp://send?phone=5541997355454&text=${message}`);
                    }}
                  >
                    <Text style={styles.clubeCTAButtonText}>QUERO SER CLUBE SANS</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {[
              { id: '1', name: 'João Silva', coins: 1500, avatar: null },
              { id: '2', name: 'Carlos Santos', coins: 1200, avatar: null },
              { id: '3', name: 'Marcos Paulo', coins: 950, avatar: null },
              { id: '4', name: 'Você', coins: profile?.user_coins_balance || 0, avatar: profile?.avatar_url, isMe: true }
            ].map((user, index) => (
              <View key={user.id} style={[styles.rankingItem, user.isMe && styles.rankingItemMe]}>
                <View style={styles.rankingPosition}>
                  {index === 0 ? (
                    <MaterialIcons name="emoji-events" size={24} color="#FFD700" />
                  ) : index === 1 ? (
                    <MaterialIcons name="emoji-events" size={24} color="#C0C0C0" />
                  ) : index === 2 ? (
                    <MaterialIcons name="emoji-events" size={24} color="#CD7F32" />
                  ) : (
                    <Text style={styles.rankingPositionText}>{index + 1}º</Text>
                  )}
                </View>
                <View style={styles.rankingAvatar}>
                  {user.avatar ? (
                    <Image source={{ uri: user.avatar }} style={styles.rankingAvatarImg} />
                  ) : (
                    <View style={styles.rankingAvatarPlaceholder}>
                      <Text style={styles.rankingAvatarInitials}>{getInitials(user.name)}</Text>
                    </View>
                  )}
                </View>
                <View style={styles.rankingContent}>
                  <Text style={[styles.rankingName, user.isMe && styles.rankingNameMe]}>{user.name}</Text>
                </View>
                <View style={styles.rankingPoints}>
                  <CoinIcon size={14} />
                  <Text style={styles.rankingPointsText}>{user.coins}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Menu - Conta */}
        <Text style={styles.sectionLabel}>Conta</Text>
        <View style={styles.menuList}>
          {renderMenuItem("history", "Histórico de Agendamentos", handleHistorico)}
          {renderSeparator()}
          {renderMenuItem("receipt-long", "Meus Pedidos", handleMeusPedidos)}
          {renderSeparator()}
          {renderMenuItem("redeem", "Histórico de Prêmios", handleMinhaJornada)}
          {renderSeparator()}
          {renderMenuItem("lock", "Alterar Senha", handleAlterarSenha)}
        </View>

        {/* Menu - Informações */}
        <Text style={styles.sectionLabel}>Informações</Text>
        <View style={styles.menuList}>
          {renderMenuItem("policy", "Política de Privacidade", () =>
            openExternalLink(config.PRIVACY_POLICY_URL)
          )}
          {renderSeparator()}
          {renderMenuItem("gavel", "Termos de Uso", () =>
            openExternalLink(config.TERMS_OF_USE_URL)
          )}
          {renderSeparator()}
          {renderMenuItem("support-agent", "Suporte", () =>
            openExternalLink(config.SUPPORT_URL)
          )}
        </View>

        {/* Menu - Aparência */}
        <Text style={styles.sectionLabel}>Aparência</Text>
        <View style={styles.menuList}>
          <View style={styles.themeToggleContainer}>
            <TouchableOpacity 
              style={[styles.themeOption, themeMode === 'light' && styles.themeOptionActive]} 
              onPress={() => changeTheme('light')}
            >
              <MaterialIcons name="light-mode" size={24} color={themeMode === 'light' ? theme.colors.primary : theme.colors.textMuted} />
              <Text style={[styles.themeOptionText, themeMode === 'light' && {color: theme.colors.primary, fontWeight: '700'}]}>Claro</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.themeOption, themeMode === 'dark' && styles.themeOptionActive]} 
              onPress={() => changeTheme('dark')}
            >
              <MaterialIcons name="dark-mode" size={24} color={themeMode === 'dark' ? theme.colors.primary : theme.colors.textMuted} />
              <Text style={[styles.themeOptionText, themeMode === 'dark' && {color: theme.colors.primary, fontWeight: '700'}]}>Escuro</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.themeOption, themeMode === 'system' && styles.themeOptionActive]} 
              onPress={() => changeTheme('system')}
            >
              <MaterialIcons name="settings-suggest" size={24} color={themeMode === 'system' ? theme.colors.primary : theme.colors.textMuted} />
              <Text style={[styles.themeOptionText, themeMode === 'system' && {color: theme.colors.primary, fontWeight: '700'}]}>Sistema</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Menu - Zona de Perigo */}
        <Text style={styles.sectionLabel}>Zona de Perigo</Text>
        <View style={styles.menuList}>
          {renderMenuItem("delete-forever", "Deletar Conta", handleDeleteAccount, {
            destructive: true,
          })}
        </View>

        {/* Botão de Sair */}
        <View style={styles.logoutContainer}>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout} activeOpacity={0.7}>
            <MaterialIcons name="logout" size={20} color="white" />
            <Text style={styles.logoutButtonText}>Sair da Conta</Text>
          </TouchableOpacity>
        </View>

        <Watermark styles={styles} />

        <View style={{ height: 30 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const getStyles = (theme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.backgroundSecondary,
  },
  scrollView: {
    flex: 1,
    backgroundColor: theme.colors.backgroundSecondary,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 30,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: theme.spacing.lg,
    justifyContent: "space-between",
  },
  contentNotLogged: {
    justifyContent: "flex-start",
  },
  // Profile Header
  profileCard: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.xl,
    alignItems: "center",
    paddingVertical: 28,
    paddingHorizontal: 20,
    marginBottom: 24,
    ...theme.shadows.md,
  },
  avatarContainer: {
    position: "relative",
    marginBottom: 16,
  },
  avatarImage: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: theme.colors.secondary,
  },
  avatarPlaceholder: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: theme.colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarInitials: {
    fontSize: 36,
    fontWeight: "700",
    color: "#FFF",
  },
  cameraBadge: {
    position: "absolute",
    bottom: 2,
    right: 2,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: theme.colors.primary,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2.5,
    borderColor: theme.colors.card,
    ...theme.shadows.sm,
  },
  profileName: {
    fontSize: 22,
    fontWeight: "700",
    color: theme.colors.textPrimary,
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
    color: theme.colors.textMuted,
    marginBottom: 14,
  },
  coinsBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.coinsBackground,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  coinsText: {
    fontSize: 13,
    fontWeight: "700",
    color: theme.isDarkMode ? '#FFD700' : '#B8860B',
  },
  // Section Labels
  sectionLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: theme.colors.textMuted,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 8,
    marginLeft: 4,
  },
  // Menu
  menuList: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.lg,
    marginBottom: 20,
    ...theme.shadows.sm,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  menuItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  rankingContainer: {
    paddingHorizontal: 20,
    marginBottom: theme.spacing.xl,
  },
  rankingCard: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.lg,
    overflow: 'hidden',
    position: 'relative',
    ...(theme.isDarkMode ? {} : theme.shadows.md),
  },
  rankingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderLight,
  },
  rankingItemMe: {
    backgroundColor: theme.colors.primaryLight + "10",
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: 8,
    marginHorizontal: -8,
    borderBottomWidth: 0,
  },
  rankingPosition: {
    width: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankingPositionText: {
    ...createTextStyle("body", "textMuted", theme),
    fontWeight: '700',
  },
  rankingAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginLeft: 8,
    backgroundColor: theme.colors.backgroundSecondary,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  rankingAvatarImg: {
    width: '100%',
    height: '100%',
  },
  rankingAvatarPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: theme.colors.borderLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rankingAvatarInitials: {
    ...createTextStyle("caption", "textMuted", theme),
    fontWeight: 'bold',
  },
  rankingContent: {
    flex: 1,
    paddingLeft: 12,
  },
  rankingName: {
    ...createTextStyle("body", "textPrimary", theme),
    fontWeight: '500',
  },
  rankingNameMe: {
    fontWeight: '700',
    color: theme.colors.primary,
  },
  rankingPoints: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.backgroundSecondary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  rankingPointsText: {
    ...createTextStyle("caption", "textPrimary", theme),
    fontWeight: '700',
    marginLeft: 4,
  },
  menuIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: theme.colors.primaryLight + "15",
    alignItems: "center",
    justifyContent: "center",
  },
  menuIconBoxDestructive: {
    backgroundColor: theme.colors.errorLight,
  },
  menuItemText: {
    fontSize: 15,
    fontWeight: "500",
    color: theme.colors.textPrimary,
    marginLeft: 14,
  },
  separator: {
    height: 1,
    backgroundColor: theme.colors.borderLight,
    marginHorizontal: 16,
  },
  deleteAccountText: {
    color: theme.colors.error,
  },
  logoutContainer: {
    marginTop: 4,
    marginBottom: 10,
  },
  logoutButton: {
    ...createButtonStyle("destructive", "md"),
    flexDirection: "row",
  },
  logoutButtonText: {
    ...createTextStyle("body", "white"),
    fontWeight: "600",
    marginLeft: theme.spacing.sm,
  },
  // Theme Toggle
  themeToggleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 12,
  },
  themeOption: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    marginHorizontal: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  themeOptionActive: {
    backgroundColor: theme.colors.primaryLight + "15",
    borderColor: theme.colors.primaryLight + "30",
  },
  themeOptionText: {
    marginTop: 6,
    fontSize: 12,
    color: theme.colors.textMuted,
    fontWeight: '500',
  },
  // Clube Overlay

  clubeOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
    backgroundColor: theme.isDarkMode ? 'rgba(0,0,0,0.4)' : 'rgba(255,255,255,0.15)',
  },
  blurContainer: {
    ...StyleSheet.absoluteFillObject,
  },
  clubeOverlayContent: {
    padding: 20,
    alignItems: 'center',
    zIndex: 20,
    width: '100%',
  },
  clubeLockCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: theme.isDarkMode ? 'rgba(30,30,30,0.95)' : 'rgba(255,255,255,0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
  },
  clubeOverlayTitle: {
    color: theme.colors.textPrimary,
    fontSize: 18,
    fontWeight: '900',
    marginBottom: 4,
    textAlign: 'center',
  },
  clubeOverlayText: {
    color: theme.colors.textMuted,
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 16,
    paddingHorizontal: 24,
    fontWeight: '500',
  },
  clubeCTAButton: {
    borderWidth: 1.5,
    borderColor: theme.colors.primary,
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 10,
    backgroundColor: theme.isDarkMode ? 'rgba(124,77,255,0.15)' : 'rgba(255,255,255,0.8)',
  },
  clubeCTAButtonText: {
    color: theme.colors.primary,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.8,
  },

  watermarkWrapper: {
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 20,
    opacity: 0.8,
  },
  watermarkCopyright: {
    fontSize: 10,
    color: theme.colors.textLight,
    marginBottom: 24,
    textAlign: 'center',
  },
  watermarkPreText: {
    fontSize: 11,
    color: theme.colors.textMuted,
    fontWeight: '400',
    marginBottom: 8,
  },
  watermarkBrandContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  watermarkLogoWrapper: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: theme.isDarkMode ? '#333' : '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 6,
    overflow: 'hidden',
  },
  watermarkLogo: {
    width: '100%',
    height: '100%',
  },
  watermarkLinkText: {
    fontSize: 12,
    color: theme.colors.textMuted,
    fontWeight: '500',
    letterSpacing: 0.2,
  }
});

export default PerfilScreen;

