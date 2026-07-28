import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Image,
  ImageBackground,
  useWindowDimensions,
} from "react-native";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { verifyEmail, resendVerificationCode } from "../api/authApi";
import { useAuth } from "../components/AuthProvider";

export default function NewUserEmailCodeScreen({ navigation, route }) {
  const { width } = useWindowDimensions();
  const isMobile = width < 768;
  const { login: authLogin } = useAuth();

  const userEmail = route?.params?.userEmail || "";
  const fromLogin = route?.params?.fromLogin || false;

  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const inputRef = useRef(null);

  useEffect(() => {
    // Focus no input ao montar a tela
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  }, []);

  const formatCode = (text) => {
    const numbers = text.replace(/\D/g, "").slice(0, 6);
    setCode(numbers);
    if (error) setError("");
    if (successMsg) setSuccessMsg("");

    // Submissão automática ao completar 6 dígitos
    if (numbers.length === 6) {
      handleVerifyCode(numbers);
    }
  };

  const handleVerifyCode = async (codeToVerify = code) => {
    const cleanCode = codeToVerify.trim();
    if (!cleanCode || cleanCode.length !== 6) {
      setError("Por favor, digite o código de 6 dígitos.");
      return;
    }

    setIsLoading(true);
    setError("");
    setSuccessMsg("");

    try {
      const response = await verifyEmail(userEmail, cleanCode);
      if (response) {
        authLogin();
        setSuccessMsg("Email verificado com sucesso! Entrando...");
        setTimeout(() => {
          navigation.replace("Navigator");
        }, 1200);
      }
    } catch (err) {
      const msg = err.response?.data?.error || err.message || "Código inválido ou expirado.";
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (!userEmail) {
      setError("Email não identificado.");
      return;
    }
    setIsResending(true);
    setError("");
    setSuccessMsg("");

    try {
      const response = await resendVerificationCode(userEmail);
      if (response) {
        setSuccessMsg("Um novo código de 6 dígitos foi enviado para seu e-mail.");
        setCode("");
        inputRef.current?.focus();
      }
    } catch (err) {
      const msg = err.response?.data?.error || err.message || "Erro ao reenviar código.";
      setError(msg);
    } finally {
      setIsResending(false);
    }
  };

  const handleBack = () => {
    if (fromLogin) {
      navigation.navigate("Login");
    } else {
      if (navigation.canGoBack()) {
        navigation.goBack();
      } else {
        navigation.navigate("SignUp");
      }
    }
  };

  return (
    <ImageBackground
      source={require("../../assets/web-bg.jpg")}
      style={styles.container}
      resizeMode="cover"
    >
      <View style={styles.overlay}>
        <View style={[styles.content, isMobile && styles.contentMobile]}>
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <MaterialIcons name="arrow-back" size={24} color="#FFF" />
          </TouchableOpacity>

          <Image
            source={require("../../assets/sanslogo.png")}
            style={styles.logo}
            resizeMode="contain"
          />

          <View style={styles.iconCircle}>
            <MaterialIcons name="mark-email-read" size={36} color="#ffffff" />
          </View>

          <Text style={styles.title}>Verificar Email</Text>
          <Text style={styles.subtitle}>
            {fromLogin
              ? "Sua conta precisa de verificação. Digite o código de 6 dígitos enviado para:"
              : "Digite o código de 6 dígitos que enviamos para:"}
          </Text>
          <Text style={styles.emailText}>{userEmail || "seu e-mail"}</Text>

          <View style={styles.form}>
            <Text style={styles.label}>Código de Verificação</Text>

            <TextInput
              ref={inputRef}
              style={[
                styles.codeInput,
                error ? styles.codeInputError : null,
                successMsg ? styles.codeInputSuccess : null,
              ]}
              value={code}
              onChangeText={formatCode}
              placeholder="000000"
              placeholderTextColor="rgba(255, 255, 255, 0.2)"
              keyboardType="numeric"
              maxLength={6}
              autoFocus={true}
              onSubmitEditing={() => handleVerifyCode(code)}
            />

            {error ? (
              <View style={styles.messageBoxError}>
                <MaterialIcons name="error-outline" size={16} color="#ff4d4d" style={{ marginRight: 6 }} />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            {successMsg ? (
              <View style={styles.messageBoxSuccess}>
                <MaterialIcons name="check-circle" size={16} color="#10b981" style={{ marginRight: 6 }} />
                <Text style={styles.successText}>{successMsg}</Text>
              </View>
            ) : null}

            <TouchableOpacity
              style={[styles.button, isLoading && styles.buttonDisabled]}
              onPress={() => handleVerifyCode(code)}
              disabled={isLoading || successMsg ? true : false}
            >
              {isLoading ? (
                <ActivityIndicator color="#000" />
              ) : (
                <Text style={styles.buttonText}>Verificar e Continuar</Text>
              )}
            </TouchableOpacity>

            <View style={styles.resendSection}>
              <Text style={styles.resendText}>Não recebeu o e-mail?</Text>
              <TouchableOpacity
                style={styles.resendButton}
                onPress={handleResendCode}
                disabled={isResending}
              >
                {isResending ? (
                  <View style={styles.resendingRow}>
                    <ActivityIndicator size="small" color="#FFF" style={{ marginRight: 6 }} />
                    <Text style={styles.resendLinkText}>Reenviando...</Text>
                  </View>
                ) : (
                  <Text style={styles.resendLinkText}>Reenviar código</Text>
                )}
              </TouchableOpacity>
            </View>

            <View style={styles.footer}>
              <Text style={styles.footerText}>
                Teve algum problema?{" "}
                <Text style={styles.linkText} onPress={handleBack}>
                  {fromLogin ? "Voltar ao Login" : "Voltar ao Cadastro"}
                </Text>
              </Text>
            </View>
          </View>
        </View>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
    height: "100vh",
  },
  overlay: {
    flex: 1,
    backgroundColor: "transparent",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  content: {
    width: "100%",
    maxWidth: 460,
    alignItems: "center",
    padding: 36,
    borderRadius: 24,
    backgroundColor: "rgba(20, 20, 20, 0.45)",
    backdropFilter: "blur(20px)",
    WebkitBackdropFilter: "blur(20px)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.15)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.4,
    shadowRadius: 35,
    elevation: 8,
  },
  contentMobile: {
    padding: 24,
    maxWidth: "100%",
    borderRadius: 18,
  },
  backButton: {
    position: "absolute",
    top: 24,
    left: 24,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },
  logo: {
    width: 70,
    height: 70,
    marginBottom: 12,
  },
  iconCircle: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  title: {
    fontSize: 26,
    fontWeight: "800",
    color: "#ffffff",
    marginBottom: 6,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.7)",
    textAlign: "center",
    marginBottom: 4,
    lineHeight: 20,
  },
  emailText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#ffffff",
    textAlign: "center",
    marginBottom: 24,
  },
  form: {
    width: "100%",
    alignItems: "center",
  },
  label: {
    fontSize: 13,
    color: "rgba(255, 255, 255, 0.8)",
    marginBottom: 10,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  codeInput: {
    width: "100%",
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 16,
    paddingVertical: 16,
    color: "#ffffff",
    fontSize: 28,
    fontWeight: "800",
    textAlign: "center",
    letterSpacing: 12,
    outlineStyle: "none",
    marginBottom: 16,
  },
  codeInputError: {
    borderColor: "#ff4d4d",
  },
  codeInputSuccess: {
    borderColor: "#10b981",
  },
  messageBoxError: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 77, 77, 0.15)",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 16,
    width: "100%",
    justifyContent: "center",
  },
  errorText: {
    color: "#ff4d4d",
    fontSize: 13,
    fontWeight: "500",
  },
  messageBoxSuccess: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(16, 185, 129, 0.15)",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 16,
    width: "100%",
    justifyContent: "center",
  },
  successText: {
    color: "#10b981",
    fontSize: 13,
    fontWeight: "600",
  },
  button: {
    width: "100%",
    backgroundColor: "#ffffff",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: "#000000",
    fontSize: 16,
    fontWeight: "800",
  },
  resendSection: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 20,
  },
  resendText: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.7)",
    marginRight: 6,
  },
  resendButton: {
    paddingVertical: 4,
  },
  resendingRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  resendLinkText: {
    fontSize: 14,
    color: "#ffffff",
    fontWeight: "700",
    textDecorationLine: "underline",
  },
  footer: {
    marginTop: 24,
    alignItems: "center",
    paddingTop: 16,
    borderTopWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    width: "100%",
  },
  footerText: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.7)",
    textAlign: "center",
  },
  linkText: {
    color: "#ffffff",
    fontWeight: "700",
  },
});
