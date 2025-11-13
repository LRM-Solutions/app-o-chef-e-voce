import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Linking,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { logout } from "../api/authApi";
import { useAuth } from "../components/AuthProvider";
import { theme, createTextStyle, createButtonStyle } from "../utils/theme";

const PerfilScreen = ({ navigation }) => {
  const { logout: authLogout, isAuthenticated } = useAuth();

  const handleMeusPedidos = () => {
    navigation.navigate("MeusPedidos");
  };

  const handleAlterarSenha = () => {
    navigation.navigate("AlterarSenha");
  };

  const handleLogin = () => {
    navigation.navigate("login");
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
      {
        text: "Cancelar",
        style: "cancel",
      },
      {
        text: "Sair",
        style: "destructive",
        onPress: async () => {
          try {
            await logout();
            authLogout();
          } catch (error) {
            Alert.alert("Erro", "Erro ao fazer logout");
          }
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View
        style={[styles.content, !isAuthenticated && styles.contentNotLogged]}
      >
        {!isAuthenticated ? (
          /* Tela para usuários não logados - apenas links de políticas e suporte */
          <View style={styles.menuList}>
            {/* Política de Privacidade */}
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() =>
                openExternalLink("https://o-chef-e-voce.base44.app/privacidade")
              }
            >
              <View style={styles.menuItemContent}>
                <MaterialIcons name="policy" size={24} color="#666" />
                <Text style={styles.menuItemText}>Política de Privacidade</Text>
              </View>
              <MaterialIcons name="chevron-right" size={24} color="#ccc" />
            </TouchableOpacity>

            <View style={styles.separator} />

            {/* Termos de Uso */}
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() =>
                openExternalLink("https://o-chef-e-voce.base44.app/termos")
              }
            >
              <View style={styles.menuItemContent}>
                <MaterialIcons name="gavel" size={24} color="#666" />
                <Text style={styles.menuItemText}>Termos de Uso</Text>
              </View>
              <MaterialIcons name="chevron-right" size={24} color="#ccc" />
            </TouchableOpacity>

            <View style={styles.separator} />

            {/* Suporte */}
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() =>
                openExternalLink("https://o-chef-e-voce.base44.app/suporte")
              }
            >
              <View style={styles.menuItemContent}>
                <MaterialIcons name="support-agent" size={24} color="#666" />
                <Text style={styles.menuItemText}>Suporte</Text>
              </View>
              <MaterialIcons name="chevron-right" size={24} color="#ccc" />
            </TouchableOpacity>
          </View>
        ) : (
          /* Tela para usuários logados */
          <>
            {/* Lista de Opções */}
            <View style={styles.menuList}>
              {/* Meus Pedidos */}
              <TouchableOpacity
                style={styles.menuItem}
                onPress={handleMeusPedidos}
              >
                <View style={styles.menuItemContent}>
                  <MaterialIcons name="receipt-long" size={24} color="#666" />
                  <Text style={styles.menuItemText}>Meus Pedidos</Text>
                </View>
                <MaterialIcons name="chevron-right" size={24} color="#ccc" />
              </TouchableOpacity>

              {/* Linha separadora */}
              <View style={styles.separator} />

              {/* Alterar Senha */}
              <TouchableOpacity
                style={styles.menuItem}
                onPress={handleAlterarSenha}
              >
                <View style={styles.menuItemContent}>
                  <MaterialIcons name="lock" size={24} color="#666" />
                  <Text style={styles.menuItemText}>Alterar Senha</Text>
                </View>
                <MaterialIcons name="chevron-right" size={24} color="#ccc" />
              </TouchableOpacity>

              {/* Linha separadora */}
              <View style={styles.separator} />

              {/* Política de Privacidade */}
              <TouchableOpacity
                style={styles.menuItem}
                onPress={() =>
                  openExternalLink(
                    "https://o-chef-e-voce.base44.app/privacidade"
                  )
                }
              >
                <View style={styles.menuItemContent}>
                  <MaterialIcons name="policy" size={24} color="#666" />
                  <Text style={styles.menuItemText}>
                    Política de Privacidade
                  </Text>
                </View>
                <MaterialIcons name="chevron-right" size={24} color="#ccc" />
              </TouchableOpacity>

              <View style={styles.separator} />

              {/* Termos de Uso */}
              <TouchableOpacity
                style={styles.menuItem}
                onPress={() =>
                  openExternalLink("https://o-chef-e-voce.base44.app/termos")
                }
              >
                <View style={styles.menuItemContent}>
                  <MaterialIcons name="gavel" size={24} color="#666" />
                  <Text style={styles.menuItemText}>Termos de Uso</Text>
                </View>
                <MaterialIcons name="chevron-right" size={24} color="#ccc" />
              </TouchableOpacity>

              <View style={styles.separator} />

              {/* Suporte */}
              <TouchableOpacity
                style={styles.menuItem}
                onPress={() =>
                  openExternalLink("https://o-chef-e-voce.base44.app/suporte")
                }
              >
                <View style={styles.menuItemContent}>
                  <MaterialIcons name="support-agent" size={24} color="#666" />
                  <Text style={styles.menuItemText}>Suporte</Text>
                </View>
                <MaterialIcons name="chevron-right" size={24} color="#ccc" />
              </TouchableOpacity>
            </View>

            {/* Botão de Sair */}
            <View style={styles.logoutContainer}>
              <TouchableOpacity
                style={styles.logoutButton}
                onPress={handleLogout}
              >
                <MaterialIcons name="logout" size={20} color="white" />
                <Text style={styles.logoutButtonText}>Sair da Conta</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.lg,
    justifyContent: "space-between",
  },
  contentNotLogged: {
    justifyContent: "flex-start",
  },
  menuList: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.lg,
    ...theme.shadows.sm,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: theme.spacing.lg,
  },
  menuItemContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  menuItemText: {
    ...createTextStyle("body", "foreground"),
    marginLeft: theme.spacing.md,
  },
  separator: {
    height: 1,
    backgroundColor: theme.colors.border,
    marginHorizontal: theme.spacing.lg,
  },
  logoutContainer: {
    paddingBottom: theme.spacing.lg,
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
  // Estilos para usuários não logados
  notLoggedContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: theme.spacing.xl,
  },
  notLoggedTitle: {
    ...createTextStyle("h2", "foreground"),
    fontWeight: "700",
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.md,
  },
  notLoggedSubtitle: {
    ...createTextStyle("body", "muted"),
    textAlign: "center",
    lineHeight: 24,
    marginBottom: theme.spacing.xl,
  },
  loginButton: {
    backgroundColor: theme.colors.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: theme.spacing.lg,
    paddingHorizontal: theme.spacing.xl,
    borderRadius: theme.borderRadius.lg,
    ...theme.shadows.sm,
  },
  loginButtonText: {
    ...createTextStyle("body", "white"),
    fontWeight: "600",
    marginLeft: theme.spacing.sm,
  },
});

export default PerfilScreen;
