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
import { confirmDeleteAccount, requestDeleteAccount } from "../api/authApi";
import { useAuth } from "../components/AuthProvider";
import { CartService } from "../services/cartService";
import { theme, createButtonStyle, createTextStyle } from "../utils/theme";

export default function ConfirmarExclusaoCodeScreen({ navigation, route }) {
  // Email vem como parâmetro da tela anterior
  const { userEmail } = route.params;
  const { logout: authLogout } = useAuth();

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

  const handleConfirmDeletion = async (codeToVerify = code) => {
    if (!validateCode(codeToVerify)) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await confirmDeleteAccount(codeToVerify.trim());
      if (response) {
        Alert.alert(
          "Conta excluída!",
          "Sua conta foi excluída com sucesso. Você será redirecionado para a tela inicial.",
          [
            {
              text: "OK",
              onPress: async () => {
                // Limpar carrinho e fazer logout
                await CartService.clearAllCart();
                authLogout();
                navigation.navigate("Navigator");
              },
            },
          ]
        );
      }
    } catch (error) {
      console.log("Erro ao confirmar exclusão:", error);
    }

    setIsLoading(false);
  };

  const handleResendCode = async () => {
    setIsResending(true);

    try {
      const response = await requestDeleteAccount();
      if (response) {
        Alert.alert(
          "Código reenviado",
          "Um novo código de exclusão foi enviado para seu email."
        );
        setCode(""); // Limpar o código atual
        setCodeError("");
      }
    } catch (error) {
      console.log("Erro ao reenviar código:", error);
    }

    setIsResending(false);
  };

  const handleBackToProfile = () => {
    navigation.goBack();
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
        handleConfirmDeletion(numbers);
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

              <Text style={styles.title}>Confirmar Exclusão</Text>
              <Text style={styles.subtitle}>
                Enviamos um código de 6 dígitos para:
              </Text>
              <Text style={styles.emailText}>{userEmail}</Text>
            </View>

            {/* Back Button */}
            <TouchableOpacity
              style={styles.backButton}
              onPress={handleBackToProfile}
            >
              <MaterialIcons
                name="arrow-back"
                size={24}
                color={theme.colors.foreground}
              />
            </TouchableOpacity>

            {/* Ícone de Exclusão */}
            <View style={styles.iconContainer}>
              <MaterialIcons name="delete-forever" size={64} color="#dc2626" />
            </View>

            {/* Form */}
            <View style={styles.form}>
              {/* Code Input */}
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Código de Exclusão</Text>

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
                  onSubmitEditing={handleConfirmDeletion}
                />

                {codeError ? (
                  <Text style={styles.errorText}>{codeError}</Text>
                ) : null}

                <Text style={styles.codeHint}>
                  Digite o código de 6 dígitos que enviamos para seu email
                </Text>
              </View>

              {/* Delete Button */}
              <TouchableOpacity
                style={[
                  styles.deleteButton,
                  isLoading && styles.buttonDisabled,
                ]}
                onPress={handleConfirmDeletion}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text style={styles.deleteButtonText}>Excluir Conta</Text>
                )}
              </TouchableOpacity>
            </View>

            {/* Footer */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>
                Não recebeu o código?{" "}
                <Text
                  style={[
                    styles.linkText,
                    isResending && styles.linkTextDisabled,
                  ]}
                  onPress={isResending ? null : handleResendCode}
                >
                  {isResending ? "Reenviando..." : "Reenviar"}
                </Text>
              </Text>

              <Text
                style={[styles.footerText, { marginTop: theme.spacing.md }]}
              >
                Mudou de ideia?{" "}
                <Text style={styles.linkText} onPress={handleBackToProfile}>
                  Cancelar exclusão
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
    borderColor: "#dc2626",
    backgroundColor: "rgba(220, 38, 38, 0.1)",
  },
  codeDigitBoxActive: {
    borderColor: "#dc2626",
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
  deleteButton: {
    backgroundColor: "#dc2626",
    borderRadius: theme.borderRadius.md,
    paddingVertical: theme.spacing.lg,
    marginTop: theme.spacing.xl,
    alignItems: "center",
    justifyContent: "center",
    ...theme.shadows.sm,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  deleteButtonText: {
    ...createTextStyle("body", "white"),
    textAlign: "center",
    fontWeight: "600",
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
  linkTextDisabled: {
    color: theme.colors.muted,
  },
});
