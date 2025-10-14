import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { logout } from "../api/authApi";
import { useAuth } from "../components/AuthProvider";
import { theme, createTextStyle, createButtonStyle } from "../utils/theme";

const PerfilScreen = ({ navigation }) => {
  const { logout: authLogout } = useAuth();

  const handleMeusPedidos = () => {
    // TODO: Navegar para tela de pedidos
    Alert.alert("Em breve", "Tela de pedidos será implementada em breve!");
  };

  const handleAlterarSenha = () => {
    // TODO: Navegar para tela de alterar senha
    Alert.alert(
      "Em breve",
      "Tela de alteração de senha será implementada em breve!"
    );
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
      <View style={styles.content}>
        {/* Lista de Opções */}
        <View style={styles.menuList}>
          {/* Meus Pedidos */}
          <TouchableOpacity style={styles.menuItem} onPress={handleMeusPedidos}>
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
        </View>

        {/* Botão de Sair */}
        <View style={styles.logoutContainer}>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <MaterialIcons name="logout" size={20} color="white" />
            <Text style={styles.logoutButtonText}>Sair da Conta</Text>
          </TouchableOpacity>
        </View>
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
});

export default PerfilScreen;
