import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { theme } from "../utils/theme";
import { changePassword } from "../api/resetPasswordApi";
import Toast from "react-native-toast-message";

export default function AlterarSenhaScreen({ navigation }) {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const validatePasswords = () => {
    if (!newPassword.trim()) {
      Alert.alert("Campo obrigatório", "Por favor, insira a nova senha.");
      return false;
    }

    if (newPassword.length < 6) {
      Alert.alert(
        "Senha inválida",
        "A senha deve ter pelo menos 6 caracteres."
      );
      return false;
    }

    if (!confirmPassword.trim()) {
      Alert.alert("Campo obrigatório", "Por favor, confirme a nova senha.");
      return false;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert(
        "Senhas não coincidem",
        "A nova senha e a confirmação devem ser iguais."
      );
      return false;
    }

    return true;
  };

  const handleChangePassword = async () => {
    if (!validatePasswords()) return;

    try {
      setLoading(true);

      const response = await changePassword(newPassword);

      Toast.show({
        type: "success",
        text1: "Senha alterada!",
        text2: response.message || "Sua senha foi alterada com sucesso!",
        visibilityTime: 4000,
      });

      // Voltar para a tela anterior após sucesso
      navigation.goBack();
    } catch (error) {
      console.error("Erro ao alterar senha:", error);

      Alert.alert(
        "Erro",
        error.message || "Não foi possível alterar a senha. Tente novamente."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <MaterialIcons
              name="arrow-back"
              size={24}
              color={theme.colors.foreground}
            />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Alterar Senha</Text>
          <View style={styles.headerRight} />
        </View>

        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Ícone e título */}
          <View style={styles.iconContainer}>
            <View style={styles.iconCircle}>
              <MaterialIcons
                name="lock"
                size={48}
                color={theme.colors.primary}
              />
            </View>
            <Text style={styles.title}>Nova Senha</Text>
            <Text style={styles.subtitle}>
              Digite sua nova senha abaixo. Certifique-se de usar uma senha
              segura.
            </Text>
          </View>

          {/* Formulário */}
          <View style={styles.form}>
            {/* Nova Senha */}
            <View style={styles.inputContainer}>
              <MaterialIcons name="lock" size={20} color={theme.colors.muted} />
              <TextInput
                style={styles.input}
                placeholder="Nova senha"
                placeholderTextColor={theme.colors.muted}
                value={newPassword}
                onChangeText={setNewPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoCorrect={false}
                editable={!loading}
              />
              <TouchableOpacity
                style={styles.eyeButton}
                onPress={() => setShowPassword(!showPassword)}
              >
                <MaterialIcons
                  name={showPassword ? "visibility" : "visibility-off"}
                  size={20}
                  color={theme.colors.muted}
                />
              </TouchableOpacity>
            </View>

            {/* Confirmar Senha */}
            <View style={styles.inputContainer}>
              <MaterialIcons
                name="lock-outline"
                size={20}
                color={theme.colors.muted}
              />
              <TextInput
                style={styles.input}
                placeholder="Confirmar nova senha"
                placeholderTextColor={theme.colors.muted}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showConfirmPassword}
                autoCapitalize="none"
                autoCorrect={false}
                editable={!loading}
              />
              <TouchableOpacity
                style={styles.eyeButton}
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                <MaterialIcons
                  name={showConfirmPassword ? "visibility" : "visibility-off"}
                  size={20}
                  color={theme.colors.muted}
                />
              </TouchableOpacity>
            </View>

            {/* Dicas de segurança */}
            <View style={styles.securityTips}>
              <Text style={styles.securityTitle}>
                Dicas para uma senha segura:
              </Text>
              <Text style={styles.securityTip}>• Pelo menos 6 caracteres</Text>
              <Text style={styles.securityTip}>
                • Combine letras, números e símbolos
              </Text>
              <Text style={styles.securityTip}>
                • Evite informações pessoais
              </Text>
            </View>

            <TouchableOpacity
              style={[
                styles.changeButton,
                loading && styles.changeButtonDisabled,
              ]}
              onPress={handleChangePassword}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <>
                  <MaterialIcons name="save" size={20} color="white" />
                  <Text style={styles.changeButtonText}>Alterar Senha</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "white",
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  backButton: {
    padding: 8,
    borderRadius: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: theme.colors.foreground,
    flex: 1,
    textAlign: "center",
    marginHorizontal: 16,
  },
  headerRight: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingVertical: 32,
  },
  iconContainer: {
    alignItems: "center",
    marginBottom: 32,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: theme.colors.primary + "20",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: theme.colors.foreground,
    textAlign: "center",
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: theme.colors.muted,
    textAlign: "center",
    lineHeight: 24,
  },
  form: {
    marginBottom: 32,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...theme.shadows.sm,
  },
  input: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: theme.colors.foreground,
  },
  eyeButton: {
    padding: 4,
  },
  securityTips: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...theme.shadows.sm,
  },
  securityTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: theme.colors.foreground,
    marginBottom: 8,
  },
  securityTip: {
    fontSize: 12,
    color: theme.colors.muted,
    marginBottom: 4,
  },
  changeButton: {
    backgroundColor: theme.colors.primary,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 16,
    borderRadius: 12,
    ...theme.shadows.sm,
  },
  changeButtonDisabled: {
    opacity: 0.7,
  },
  changeButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
});
