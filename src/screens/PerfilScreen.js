import React, { useEffect, useState, useCallback } from "react";
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
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import * as ImagePicker from "expo-image-picker";
import { logout, requestDeleteAccount, getUserEmail } from "../api/authApi";
import { getProfile, uploadAvatar, updateProfile } from "../api/barberApi";
import { useAuth } from "../components/AuthProvider";
import { CartService } from "../services/cartService";
import { theme, createTextStyle, createButtonStyle } from "../utils/theme";
import { config } from "../utils/config";
import AsyncStorage from "@react-native-async-storage/async-storage";

const PerfilScreen = ({ navigation }) => {
  const { logout: authLogout, isAuthenticated } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

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
      console.debug("Erro ao carregar perfil:", error);
      // Fallback para AsyncStorage
      try {
        const name = await AsyncStorage.getItem("user_name");
        const email = await AsyncStorage.getItem("user_email");
        setProfile({ user_name: name || "Usuário", user_email: email || "" });
      } catch (e) {
        setProfile({ user_name: "Usuário", user_email: "" });
      }
    } finally {
      setLoadingProfile(false);
    }
  };

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

  const handleMeusPedidos = () => {
    navigation.navigate("MeusPedidos");
  };

  const handleAlterarSenha = () => {
    navigation.navigate("AlterarSenha");
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      "Confirmar exclusão",
      "Deseja solicitar a exclusão da conta?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Confirmar",
          style: "destructive",
          onPress: async () => {
            try {
              const userEmail = await getUserEmail();
              const response = await requestDeleteAccount();
              if (response && userEmail) {
                navigation.navigate("ConfirmarExclusaoCode", { userEmail });
              } else {
                Alert.alert("Erro", "Não foi possível solicitar exclusão.");
              }
            } catch (error) {
              Alert.alert("Erro", "Erro ao solicitar exclusão da conta");
            }
          },
        },
      ]
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
    Alert.alert("Confirmar Logout", "Tem certeza que deseja sair?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Sair",
        style: "destructive",
        onPress: async () => {
          try {
            await logout();
            await CartService.clearAllCart();
            authLogout();
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
      <SafeAreaView style={styles.container}>
        <View style={[styles.content, styles.contentNotLogged]}>
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
        </View>
      </SafeAreaView>
    );
  }

  // ========================
  // Tela para logados
  // ========================
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Header Card */}
        <View style={styles.profileCard}>
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
            {loadingProfile ? "Carregando..." : profile?.user_name || "Usuário"}
          </Text>
          <Text style={styles.profileEmail}>
            {profile?.user_email || ""}
          </Text>

          {profile?.user_coins_balance !== undefined && (
            <View style={styles.coinsBadge}>
              <Text style={{ fontSize: 14, marginRight: 4 }}>💎</Text>
              <Text style={styles.coinsText}>
                {profile.user_coins_balance} Sans Coins
              </Text>
            </View>
          )}
        </View>

        {/* Menu - Conta */}
        <Text style={styles.sectionLabel}>Conta</Text>
        <View style={styles.menuList}>
          {renderMenuItem("history", "Histórico de Agendamentos", handleHistorico)}
          {renderSeparator()}
          {renderMenuItem("receipt-long", "Meus Pedidos", handleMeusPedidos)}
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

        {/* Menu - Zona de Perigo */}
        <Text style={styles.sectionLabel}>Conta</Text>
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

        <View style={{ height: 30 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.backgroundSecondary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 30,
  },
  content: {
    flex: 1,
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
    color: "#B8860B",
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
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
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
});

export default PerfilScreen;
