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
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { login } from "../api/authApi";
import { useAuth } from "../components/AuthProvider";
import { validateEmail } from "../utils/helpers";
import { theme, createButtonStyle, createTextStyle } from "../utils/theme";

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const { login: authLogin } = useAuth();

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
      }
    }

    setIsLoading(false);
  };

  const handleNavigateToSignUp = () => {
    navigation.navigate("SignUp");
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <Image
              source={require("../assets/images/logo.png")}
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
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              Esqueceu sua senha?{" "}
              <Text style={styles.linkText}>Recuperar senha</Text>
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
    ...createTextStyle("h1", "foreground"),
    textAlign: "center",
    marginBottom: theme.spacing.sm,
  },
  subtitle: {
    ...createTextStyle("body", "muted"),
    textAlign: "center",
  },
  form: {
    marginBottom: theme.spacing.xl,
  },
  inputContainer: {
    marginBottom: theme.spacing.md,
  },
  label: {
    ...createTextStyle("body", "foreground"),
    marginBottom: theme.spacing.sm,
    fontWeight: "500",
  },
  input: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    color: theme.colors.foreground,
    fontSize: theme.fontSizes.base,
  },
  inputError: {
    borderColor: theme.colors.destructive,
  },
  errorText: {
    ...createTextStyle("small", "destructive"),
    marginTop: theme.spacing.xs,
  },
  button: {
    ...createButtonStyle("primary", "md"),
    marginTop: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    ...createTextStyle("body", "white"),
    textAlign: "center",
    fontWeight: "600",
  },
  footer: {
    marginTop: theme.spacing.xl,
  },
  footerText: {
    ...createTextStyle("body", "muted"),
    textAlign: "center",
  },
  linkText: {
    color: theme.colors.primary,
    fontWeight: "500",
  },
});
