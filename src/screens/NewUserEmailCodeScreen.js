import React, { useState, useRef } from "react";
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
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { verifyEmail, resendVerificationCode } from "../api/authApi";
import { theme, createButtonStyle, createTextStyle } from "../utils/theme";

export default function NewUserEmailCodeScreen({ navigation, route }) {
  // Email vem como parâmetro da tela anterior
  const { userEmail, fromLogin = false } = route.params;

  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [codeError, setCodeError] = useState("");

  // Ref para focar no input
  const codeInputRef = useRef(null);

  const validateCode = (codeToValidate = code) => {
    const cleanCode = codeToValidate.trim();

    if (!cleanCode) {
      setCodeError("Código é obrigatório");
      return false;
    }

    if (cleanCode.length !== 6) {
      setCodeError("Código deve ter 6 dígitos");
      return false;
    }

    if (!/^\d{6}$/.test(cleanCode)) {
      setCodeError("Código deve conter apenas números");
      return false;
    }

    setCodeError("");
    return true;
  };

  const handleVerifyCode = async (codeToVerify = code) => {
    if (!validateCode(codeToVerify)) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await verifyEmail(userEmail, codeToVerify.trim());
      if (response) {
        Alert.alert(
          "Email verificado!",
          "Sua conta foi criada com sucesso. Você já pode fazer login.",
          [
            {
              text: "Fazer Login",
              onPress: () => navigation.navigate("Login"),
            },
          ]
        );
      }
    } catch (error) {
      console.log("Erro ao verificar código:", error);
    }

    setIsLoading(false);
  };

  const handleResendCode = async () => {
    setIsResending(true);

    try {
      const response = await resendVerificationCode(userEmail);
      if (response) {
        Alert.alert(
          "Código reenviado",
          "Um novo código de verificação foi enviado para seu email."
        );
        setCode(""); // Limpar o código atual
        setCodeError("");
      }
    } catch (error) {
      console.log("Erro ao reenviar código:", error);
    }

    setIsResending(false);
  };

  const handleBackToSignUp = () => {
    if (fromLogin) {
      navigation.navigate("Login");
    } else {
      navigation.goBack();
    }
  };

  const formatCode = (text) => {
    // Remove tudo que não é dígito e limita a 6 caracteres
    const numbers = text.replace(/\D/g, "").slice(0, 6);
    setCode(numbers);
    if (codeError) setCodeError("");

    // Auto submit quando tiver 6 dígitos
    if (numbers.length === 6) {
      // Pequeno delay para melhor UX e passar o código diretamente
      setTimeout(() => {
        handleVerifyCode(numbers);
      }, 300);
    }
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
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.content}>
            {/* Header */}
            <View style={styles.header}>
              <Image
                source={require("../assets/images/logo.png")}
                style={styles.logo}
                resizeMode="contain"
              />

              <Text style={styles.title}>Verificar Email</Text>
              <Text style={styles.subtitle}>
                {fromLogin
                  ? "Sua conta precisa ser verificada. Enviamos um código de 6 dígitos para:"
                  : "Enviamos um código de 6 dígitos para:"}
              </Text>
              <Text style={styles.emailText}>{userEmail}</Text>
            </View>

            {/* Back Button */}
            <TouchableOpacity
              style={styles.backButton}
              onPress={handleBackToSignUp}
            >
              <MaterialIcons
                name="arrow-back"
                size={24}
                color={theme.colors.foreground}
              />
            </TouchableOpacity>

            {/* Ícone de Email */}
            <View style={styles.iconContainer}>
              <MaterialIcons
                name="mark-email-read"
                size={64}
                color={theme.colors.primary}
              />
            </View>

            {/* Form */}
            <View style={styles.form}>
              {/* Code Input */}
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Código de Verificação</Text>

                {/* Visual Code Display */}
                <TouchableOpacity
                  style={styles.codeDisplayContainer}
                  onPress={() => codeInputRef.current?.focus()}
                  activeOpacity={0.7}
                >
                  {[0, 1, 2, 3, 4, 5].map((index) => (
                    <View
                      key={index}
                      style={[
                        styles.codeDigitBox,
                        code.length > index && styles.codeDigitBoxFilled,
                        code.length === index && styles.codeDigitBoxActive,
                        codeError && styles.codeDigitBoxError,
                      ]}
                    >
                      <Text style={styles.codeDigitText}>
                        {code[index] || ""}
                      </Text>
                    </View>
                  ))}
                </TouchableOpacity>

                {/* Hidden Input */}
                <TextInput
                  ref={codeInputRef}
                  style={styles.hiddenInput}
                  value={code}
                  onChangeText={formatCode}
                  keyboardType="numeric"
                  maxLength={6}
                  autoFocus={true}
                  returnKeyType="done"
                  onSubmitEditing={handleVerifyCode}
                />

                {codeError ? (
                  <Text style={styles.errorText}>{codeError}</Text>
                ) : null}

                <Text style={styles.codeHint}>
                  Digite o código de 6 dígitos que enviamos para seu email
                </Text>
              </View>

              {/* Verify Button */}
              <TouchableOpacity
                style={[styles.button, isLoading && styles.buttonDisabled]}
                onPress={handleVerifyCode}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text style={styles.buttonText}>Verificar Código</Text>
                )}
              </TouchableOpacity>
            </View>

            {/* Resend Section */}
            <View style={styles.resendSection}>
              <Text style={styles.resendText}>Não recebeu o código?</Text>
              <TouchableOpacity
                style={styles.resendButton}
                onPress={handleResendCode}
                disabled={isResending}
              >
                {isResending ? (
                  <View style={styles.resendingContainer}>
                    <ActivityIndicator
                      size="small"
                      color={theme.colors.primary}
                    />
                    <Text style={styles.resendingText}>Reenviando...</Text>
                  </View>
                ) : (
                  <Text style={styles.resendButtonText}>Reenviar código</Text>
                )}
              </TouchableOpacity>
            </View>

            {/* Footer */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>
                Problemas com a verificação?{" "}
                <Text style={styles.linkText} onPress={handleBackToSignUp}>
                  {fromLogin ? "Voltar ao login" : "Voltar ao cadastro"}
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
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.lg,
  },
  header: {
    marginBottom: theme.spacing.xl,
    alignItems: "center",
  },
  backButton: {
    position: "absolute",
    top: -theme.spacing.lg,
    left: -theme.spacing.md,
    padding: theme.spacing.sm,
    zIndex: 1,
  },
  logo: {
    width: 150,
    height: 90,
    marginBottom: theme.spacing.md,
  },
  title: {
    ...createTextStyle("h2", "foreground"),
    textAlign: "center",
    marginBottom: theme.spacing.sm,
  },
  subtitle: {
    ...createTextStyle("body", "muted"),
    textAlign: "center",
    marginBottom: theme.spacing.xs,
  },
  emailText: {
    ...createTextStyle("body", "primary"),
    textAlign: "center",
    fontWeight: "600",
  },
  iconContainer: {
    alignItems: "center",
    marginBottom: theme.spacing.xl,
  },
  form: {
    marginBottom: theme.spacing.xl,
  },
  inputContainer: {
    marginBottom: theme.spacing.md,
    alignItems: "center",
  },
  label: {
    ...createTextStyle("body", "foreground"),
    marginBottom: theme.spacing.md,
    fontWeight: "500",
    textAlign: "center",
  },
  codeDisplayContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
  },
  codeDigitBox: {
    width: 45,
    height: 55,
    borderWidth: 2,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: theme.colors.card,
  },
  codeDigitBoxFilled: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primaryForeground,
  },
  codeDigitBoxActive: {
    borderColor: theme.colors.primary,
    borderWidth: 3,
  },
  codeDigitBoxError: {
    borderColor: theme.colors.destructive,
  },
  codeDigitText: {
    ...createTextStyle("h2", "foreground"),
    fontWeight: "600",
  },
  hiddenInput: {
    position: "absolute",
    opacity: 0,
    width: 1,
    height: 1,
  },
  inputError: {
    borderColor: theme.colors.destructive,
  },
  errorText: {
    ...createTextStyle("small", "destructive"),
    marginTop: theme.spacing.sm,
    textAlign: "center",
  },
  codeHint: {
    ...createTextStyle("caption", "muted"),
    marginTop: theme.spacing.md,
    textAlign: "center",
    paddingHorizontal: theme.spacing.md,
  },
  button: {
    ...createButtonStyle("primary", "md"),
    marginTop: theme.spacing.xl,
    paddingVertical: theme.spacing.lg,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    ...createTextStyle("body", "white"),
    textAlign: "center",
    fontWeight: "600",
  },
  resendSection: {
    alignItems: "center",
    marginBottom: theme.spacing.xl,
  },
  resendText: {
    ...createTextStyle("body", "muted"),
    marginBottom: theme.spacing.sm,
  },
  resendButton: {
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
  },
  resendingContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  resendingText: {
    ...createTextStyle("body", "muted"),
    marginLeft: theme.spacing.sm,
  },
  resendButtonText: {
    ...createTextStyle("body", "primary"),
    fontWeight: "600",
    textDecorationLine: "underline",
  },
  footer: {
    marginTop: theme.spacing.xl,
  },
  footerText: {
    ...createTextStyle("caption", "muted"),
    textAlign: "center",
  },
  linkText: {
    color: theme.colors.primary,
    fontWeight: "500",
  },
});
