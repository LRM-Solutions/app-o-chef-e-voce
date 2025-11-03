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
import { resetPassword } from "../api/resetPasswordApi";
import Toast from "react-native-toast-message";

export default function RecuperarSenhaScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleResetPassword = async () => {
    // Validações
    if (!email.trim()) {
      Alert.alert("Campo obrigatório", "Por favor, insira seu email.");
      return;
    }

    if (!validateEmail(email)) {
      Alert.alert("Email inválido", "Por favor, insira um email válido.");
      return;
    }

    try {
      setLoading(true);

      await resetPassword(email.trim().toLowerCase());

      setEmailSent(true);

      Toast.show({
        type: "success",
        text1: "Email enviado!",
        text2: "Uma nova senha foi enviada ao email inserido!",
        visibilityTime: 4000,
      });
    } catch (error) {
      console.error("Erro ao solicitar recuperação:", error);

      Alert.alert(
        "Erro",
        error.message ||
          "Não foi possível enviar o email de recuperação. Tente novamente."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleBackToLogin = () => {
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
          <TouchableOpacity
            style={styles.backButton}
            onPress={handleBackToLogin}
          >
            <MaterialIcons
              name="arrow-back"
              size={24}
              color={theme.colors.foreground}
            />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Recuperar Senha</Text>
          <View style={styles.headerRight} />
        </View>

        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {!emailSent ? (
            <>
              {/* Ícone e título */}
              <View style={styles.iconContainer}>
                <View style={styles.iconCircle}>
                  <MaterialIcons
                    name="lock-reset"
                    size={48}
                    color={theme.colors.primary}
                  />
                </View>
                <Text style={styles.title}>Esqueceu sua senha?</Text>
                <Text style={styles.subtitle}>
                  Não se preocupe! Digite seu email abaixo e enviaremos uma nova
                  senha para você.
                </Text>
              </View>

              {/* Formulário */}
              <View style={styles.form}>
                <View style={styles.inputContainer}>
                  <MaterialIcons
                    name="email"
                    size={20}
                    color={theme.colors.muted}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Digite seu email"
                    placeholderTextColor={theme.colors.muted}
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    autoComplete="email"
                    editable={!loading}
                  />
                </View>

                <TouchableOpacity
                  style={[
                    styles.resetButton,
                    loading && styles.resetButtonDisabled,
                  ]}
                  onPress={handleResetPassword}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator size="small" color="white" />
                  ) : (
                    <>
                      <MaterialIcons name="send" size={20} color="white" />
                      <Text style={styles.resetButtonText}>
                        Enviar Nova Senha
                      </Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            </>
          ) : (
            /* Tela de sucesso */
            <View style={styles.successContainer}>
              <View style={styles.successIconContainer}>
                <View style={styles.successIconCircle}>
                  <MaterialIcons name="check" size={48} color="white" />
                </View>
              </View>

              <Text style={styles.successTitle}>Email Enviado!</Text>
              <Text style={styles.successMessage}>
                Uma nova senha foi enviada ao email inserido!
              </Text>
              <Text style={styles.successSubMessage}>
                Verifique sua caixa de entrada e use a nova senha para fazer
                login.
              </Text>

              <TouchableOpacity
                style={styles.loginButton}
                onPress={handleBackToLogin}
              >
                <MaterialIcons name="login" size={20} color="white" />
                <Text style={styles.loginButtonText}>Voltar ao Login</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Link para voltar ao login */}
          {!emailSent && (
            <TouchableOpacity
              style={styles.backToLoginContainer}
              onPress={handleBackToLogin}
            >
              <MaterialIcons
                name="arrow-back"
                size={16}
                color={theme.colors.primary}
              />
              <Text style={styles.backToLoginText}>Voltar ao Login</Text>
            </TouchableOpacity>
          )}
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
    marginBottom: 20,
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
  resetButton: {
    backgroundColor: theme.colors.primary,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 16,
    borderRadius: 12,
    ...theme.shadows.sm,
  },
  resetButtonDisabled: {
    opacity: 0.7,
  },
  resetButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  successContainer: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
  },
  successIconContainer: {
    marginBottom: 32,
  },
  successIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: theme.colors.success || "#10b981",
    justifyContent: "center",
    alignItems: "center",
  },
  successTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: theme.colors.foreground,
    textAlign: "center",
    marginBottom: 16,
  },
  successMessage: {
    fontSize: 18,
    fontWeight: "600",
    color: theme.colors.success || "#10b981",
    textAlign: "center",
    marginBottom: 12,
  },
  successSubMessage: {
    fontSize: 16,
    color: theme.colors.muted,
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 32,
  },
  loginButton: {
    backgroundColor: theme.colors.primary,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    ...theme.shadows.sm,
  },
  loginButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  backToLoginContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 16,
  },
  backToLoginText: {
    fontSize: 16,
    color: theme.colors.primary,
    marginLeft: 8,
    fontWeight: "500",
  },
});
