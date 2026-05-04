import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Image,
  Linking,
  Keyboard,
  TouchableWithoutFeedback,
} from "react-native";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { SafeAreaView } from "react-native-safe-area-context";
import { login } from "../api/authApi";
import { useAuth } from "../components/AuthProvider";
import { validateEmail } from "../utils/helpers";
import { theme, createButtonStyle, createTextStyle } from "../utils/theme";
import { config } from "../utils/config";
import { useTheme } from "../utils/ThemeContext";

export default function LoginScreen({ navigation }) {
  const { login: authLogin } = useAuth();
  const { theme } = useTheme();
  const { isDarkMode } = theme;
  const styles = getStyles(theme);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const validateForm = () => {
    let isValid = true;

    // Validar email
    if (!email) {
      setEmailError("Email é obrigatório");
      isValid = false;
    } else if (!validateEmail(email)) {
      setEmailError("Email inválido");
      isValid = false;
    } else {
      setEmailError("");
    }

    // Validar senha
    if (!password) {
      setPasswordError("Senha é obrigatória");
      isValid = false;
    } else if (password.length < 6) {
      setPasswordError("Senha deve ter pelo menos 6 caracteres");
      isValid = false;
    } else {
      setPasswordError("");
    }

    return isValid;
  };

  const handleLogin = async () => {
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    const response = await login(email, password);

    if (response) {
      // Verificar se precisa de verificação de email
      if (response.needVerification) {
        // Redirecionar para tela de verificação
        navigation.navigate("NewUserEmailCode", {
          userEmail: response.userEmail || email,
          fromLogin: true,
        });
      } else {
        // Login bem-sucedido
        authLogin(); // Atualizar estado de autenticação
        navigation.navigate("Navigator");
      }
    }

    setIsLoading(false);
  };

  const handleNavigateToSignUp = () => {
    navigation.navigate("SignUp");
  };

  const handleNavigateToRecuperarSenha = () => {
    navigation.navigate("RecuperarSenha");
  };

  return (
    <SafeAreaView style={styles.container}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.keyboardView}
          keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
        >
          <View style={styles.content}>
            {/* ... previous content ... */}
            <View style={styles.header}>
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => {
                  if (navigation.canGoBack()) {
                    navigation.goBack();
                  } else {
                    navigation.navigate("Navigator");
                  }
                }}
              >
                <MaterialIcons name="arrow-back" size={24} color={theme.colors.textPrimary} />
              </TouchableOpacity>

              <Image
                source={require("../../assets/sanslogo.png")}
                style={styles.logo}
                resizeMode="contain"
              />

              <Text style={styles.subtitle}>Faça login para continuar</Text>
            </View>

            {/* Form */}
            <View style={styles.form}>
              {/* Email Input */}
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Email</Text>
                <TextInput
                  style={[styles.input, emailError ? styles.inputError : null]}
                  placeholder="Digite seu email"
                  placeholderTextColor={theme.colors.textMuted}
                  value={email}
                  onChangeText={(text) => {
                    setEmail(text);
                    if (emailError) setEmailError("");
                  }}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  returnKeyType="next"
                  blurOnSubmit={false}
                />
                {emailError ? (
                  <Text style={styles.errorText}>{emailError}</Text>
                ) : null}
              </View>

              {/* Password Input */}
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Senha</Text>
                <TextInput
                  style={[styles.input, passwordError ? styles.inputError : null]}
                  placeholder="Digite sua senha"
                  placeholderTextColor={theme.colors.textMuted}
                  value={password}
                  onChangeText={(text) => {
                    setPassword(text);
                    if (passwordError) setPasswordError("");
                  }}
                  secureTextEntry
                  autoCapitalize="none"
                  autoCorrect={false}
                  returnKeyType="done"
                  onSubmitEditing={handleLogin}
                />
                {passwordError ? (
                  <Text style={styles.errorText}>{passwordError}</Text>
                ) : null}
              </View>

              {/* Login Button */}
              <TouchableOpacity
                style={[styles.button, isLoading && styles.buttonDisabled]}
                onPress={handleLogin}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text style={styles.buttonText}>Entrar</Text>
                )}
              </TouchableOpacity>

              {/* Privacy notice */}
              {config.PRIVACY_POLICY_URL ? (
                <Text style={styles.privacyText}>
                  Ao continuar, você concorda com nossa{" "}
                  <Text
                    style={styles.privacyLink}
                    onPress={() => Linking.openURL(config.PRIVACY_POLICY_URL)}
                  >
                    Política de Privacidade
                  </Text>
                  .
                </Text>
              ) : null}
            </View>

            {/* Footer */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>
                Esqueceu sua senha?{" "}
                <Text
                  style={styles.linkText}
                  onPress={handleNavigateToRecuperarSenha}
                >
                  Recuperar senha
                </Text>
              </Text>
              <Text style={[styles.footerText, { marginTop: theme.spacing.md }]}>
                Não tem uma conta?{" "}
                <Text style={styles.linkText} onPress={handleNavigateToSignUp}>
                  Cadastrar-se
                </Text>
              </Text>
            </View>
          </View>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
}

const getStyles = (theme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: theme.spacing.xl,
  },
  header: {
    marginBottom: theme.spacing.xl,
  },
  logo: {
    width: 200,
    height: 120,
    alignSelf: "center",
    marginBottom: theme.spacing.sm,
  },
  title: {
    fontSize: theme.fontSizes.xl,
    color: theme.colors.textPrimary,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: theme.spacing.sm,
  },
  subtitle: {
    fontSize: theme.fontSizes.base,
    color: theme.colors.textMuted,
    textAlign: "center",
  },
  form: {
    marginBottom: theme.spacing.xl,
  },
  inputContainer: {
    marginBottom: theme.spacing.md,
  },
  label: {
    fontSize: theme.fontSizes.base,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.sm,
    fontWeight: "500",
  },
  backButton: {
    position: "absolute",
    left: theme.spacing.xl,
    top: 0,
    padding: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    color: theme.colors.textPrimary,
    fontSize: theme.fontSizes.base,
    backgroundColor: theme.colors.backgroundSecondary,
  },
  inputError: {
    borderColor: theme.colors.error,
  },
  errorText: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.error,
    marginTop: theme.spacing.xs,
  },
  button: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.md,
    alignItems: "center",
    justifyContent: "center",
    marginTop: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    fontSize: theme.fontSizes.base,
    color: "#FFFFFF",
    textAlign: "center",
    fontWeight: "600",
  },
  footer: {
    marginTop: theme.spacing.xl,
  },
  footerText: {
    fontSize: theme.fontSizes.base,
    color: theme.colors.textMuted,
    textAlign: "center",
  },
  linkText: {
    color: theme.colors.primary,
    fontWeight: "500",
  },
  privacyText: {
    fontSize: 12,
    color: theme.colors.textMuted,
    textAlign: "center",
    marginTop: theme.spacing.md,
    lineHeight: 18,
    opacity: 0.95,
  },
  privacyLink: {
    color: theme.colors.primary,
    textDecorationLine: "underline",
    fontWeight: "500",
  },
});
