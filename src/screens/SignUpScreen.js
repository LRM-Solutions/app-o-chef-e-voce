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
  ScrollView,
  Linking,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { signUp } from "../api/authApi";
import { validateEmail } from "../utils/helpers";
import { theme, createButtonStyle, createTextStyle } from "../utils/theme";
import { config } from "../utils/config";

export default function SignUpScreen({ navigation }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [nameError, setNameError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");

  const validateForm = () => {
    let isValid = true;

    // Validar nome
    if (!name.trim()) {
      setNameError("Nome é obrigatório");
      isValid = false;
    } else if (name.trim().length < 2) {
      setNameError("Nome deve ter pelo menos 2 caracteres");
      isValid = false;
    } else {
      setNameError("");
    }

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

    // Validar confirmação de senha
    if (!confirmPassword) {
      setConfirmPasswordError("Confirmação de senha é obrigatória");
      isValid = false;
    } else if (password !== confirmPassword) {
      setConfirmPasswordError("Senhas não coincidem");
      isValid = false;
    } else {
      setConfirmPasswordError("");
    }

    return isValid;
  };

  const handleSignUp = async () => {
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await signUp(name.trim(), email, password);
      if (response) {
        // Navegar para tela de verificação de email
        navigation.navigate("NewUserEmailCode", { userEmail: email });
      }
    } catch (error) {
      // O erro já é tratado na função signUp
      console.log("Erro ao cadastrar:", error);
    }

    setIsLoading(false);
  };

  const handleBackToLogin = () => {
    navigation.navigate("Login");
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.content}>
            {/* Header */}
            <View style={styles.header}>
              <Image
                source={require("../assets/images/logo.png")}
                style={styles.logo}
                resizeMode="contain"
              />
              <Text style={styles.subtitle}>Crie sua conta</Text>
            </View>

            {/* Form */}
            <View style={styles.form}>
              {/* Name Input */}
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Nome</Text>
                <TextInput
                  style={[styles.input, nameError ? styles.inputError : null]}
                  placeholder="Digite seu nome completo"
                  placeholderTextColor="#999"
                  value={name}
                  onChangeText={(text) => {
                    setName(text);
                    if (nameError) setNameError("");
                  }}
                  autoCapitalize="words"
                  autoCorrect={false}
                  returnKeyType="next"
                  blurOnSubmit={false}
                />
                {nameError ? (
                  <Text style={styles.errorText}>{nameError}</Text>
                ) : null}
              </View>

              {/* Email Input */}
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Email</Text>
                <TextInput
                  style={[styles.input, emailError ? styles.inputError : null]}
                  placeholder="Digite seu email"
                  placeholderTextColor="#999"
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
                  style={[
                    styles.input,
                    passwordError ? styles.inputError : null,
                  ]}
                  placeholder="Digite sua senha"
                  placeholderTextColor="#999"
                  value={password}
                  onChangeText={(text) => {
                    setPassword(text);
                    if (passwordError) setPasswordError("");
                  }}
                  secureTextEntry
                  autoCapitalize="none"
                  autoCorrect={false}
                  returnKeyType="next"
                  blurOnSubmit={false}
                />
                {passwordError ? (
                  <Text style={styles.errorText}>{passwordError}</Text>
                ) : null}
              </View>

              {/* Confirm Password Input */}
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Confirmar Senha</Text>
                <TextInput
                  style={[
                    styles.input,
                    confirmPasswordError ? styles.inputError : null,
                  ]}
                  placeholder="Confirme sua senha"
                  placeholderTextColor="#999"
                  value={confirmPassword}
                  onChangeText={(text) => {
                    setConfirmPassword(text);
                    if (confirmPasswordError) setConfirmPasswordError("");
                  }}
                  secureTextEntry
                  autoCapitalize="none"
                  autoCorrect={false}
                  returnKeyType="done"
                  onSubmitEditing={handleSignUp}
                />
                {confirmPasswordError ? (
                  <Text style={styles.errorText}>{confirmPasswordError}</Text>
                ) : null}
              </View>

              {/* SignUp Button */}
              <TouchableOpacity
                style={[styles.button, isLoading && styles.buttonDisabled]}
                onPress={handleSignUp}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text style={styles.buttonText}>Cadastrar</Text>
                )}
              </TouchableOpacity>

              {/* Privacy notice (discreet & sophisticated) */}
              {config.PRIVACY_POLICY_URL ? (
                <Text style={styles.privacyText}>
                  Ao continuar, você concorda com nossa{' '}
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
                Já tem uma conta?{" "}
                <Text style={styles.linkText} onPress={handleBackToLogin}>
                  Fazer login
                </Text>
              </Text>
            </View>
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
  scrollView: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.lg,
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
  privacyText: {
    fontSize: 12,
    color: theme.colors.muted,
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
