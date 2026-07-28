import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Image,
  Linking,
  ImageBackground,
  useWindowDimensions,
} from "react-native";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { login } from "../api/authApi";
import { useAuth } from "../components/AuthProvider";
import { useTheme } from "../utils/ThemeContext";
import { config } from "../utils/config";

export default function LoginScreen({ navigation }) {
  const { theme } = useTheme();
  const { login: authLogin } = useAuth();
  const { width } = useWindowDimensions();
  const isMobile = width < 768;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async () => {
    if (!email || !password) {
      setError("Preencha todos os campos");
      return;
    }
    setIsLoading(true);
    setError("");

    try {
      const response = await login(email, password);
      if (response && response.needVerification) {
        navigation.navigate("NewUserEmailCode", {
          userEmail: response.userEmail || email,
          fromLogin: true,
        });
        return;
      }
      if (response && response.user) {
        authLogin();
        navigation.replace("Navigator");
      } else if (response && response.error) {
        setError(response.error);
      } else if (!response) {
        setError("Email ou senha incorretos. Verifique seus dados.");
      }
    } catch (err) {
      if (err.message?.includes("Email não verificado") || err.message?.includes("Conta não verificada")) {
        navigation.navigate("NewUserEmailCode", { userEmail: email, fromLogin: true });
      } else {
        setError(err.message || "Email ou senha incorretos.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = () => {
    navigation.navigate("RecuperarSenha");
  };

  return (
    <ImageBackground
      source={require('../../assets/web-bg.jpg')}
      style={styles.container}
      resizeMode="cover"
    >
      <View style={styles.overlay}>
        <View style={[styles.content, isMobile && styles.contentMobile]}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <MaterialIcons name="arrow-back" size={24} color="#FFF" />
          </TouchableOpacity>

          <Image
            source={require("../../assets/sanslogo.png")}
            style={styles.logo}
            resizeMode="contain"
          />

          <Text style={styles.title}>Bem-vindo de volta</Text>
          <Text style={styles.subtitle}>Faça login para continuar</Text>

          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <MaterialIcons name="email" size={20} color="rgba(255,255,255,0.7)" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Seu email"
                placeholderTextColor="rgba(255,255,255,0.5)"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputContainer}>
              <MaterialIcons name="lock" size={20} color="rgba(255,255,255,0.7)" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Sua senha"
                placeholderTextColor="rgba(255,255,255,0.5)"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
            </View>

            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <TouchableOpacity
              style={[styles.button, isLoading && styles.buttonDisabled]}
              onPress={handleLogin}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#000" />
              ) : (
                <Text style={styles.buttonText}>Entrar</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity style={styles.forgotPassword} onPress={handleForgotPassword}>
              <Text style={styles.forgotPasswordText}>Esqueci minha senha</Text>
            </TouchableOpacity>

            {/* Privacy notice */}
            {config?.PRIVACY_POLICY_URL ? (
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

            {/* Footer */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>
                Não tem uma conta?{" "}
                <Text
                  style={styles.linkText}
                  onPress={() => navigation.navigate("SignUp")}
                >
                  Cadastrar-se
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
    width: '100%',
    height: '100vh',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  content: {
    width: '100%',
    maxWidth: 450,
    alignItems: 'center',
    padding: 32,
    borderRadius: 24,
    backgroundColor: 'rgba(20, 20, 20, 0.4)',
    backdropFilter: 'blur(15px)',
    WebkitBackdropFilter: 'blur(15px)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 30,
    elevation: 5,
  },
  contentMobile: {
    padding: 24,
    maxWidth: '100%',
    borderRadius: 16,
  },
  backButton: {
    position: 'absolute',
    top: 24,
    left: 24,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 80,
    height: 80,
    marginBottom: 16,
    marginTop: 10,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 24,
  },
  form: {
    width: '100%',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 12,
    marginBottom: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    paddingVertical: 14,
    color: '#ffffff',
    fontSize: 15,
    outlineStyle: 'none',
  },
  errorText: {
    color: '#ff4d4d',
    marginBottom: 16,
    textAlign: 'center',
    fontSize: 14,
  },
  button: {
    backgroundColor: '#ffffff',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: 'bold',
  },
  forgotPassword: {
    marginTop: 16,
    alignItems: 'center',
  },
  forgotPasswordText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 14,
    textDecorationLine: 'underline',
  },
  privacyText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
    textAlign: "center",
    marginTop: 16,
    lineHeight: 18,
  },
  privacyLink: {
    color: '#ffffff',
    textDecorationLine: "underline",
    fontWeight: "500",
  },
  footer: {
    marginTop: 16,
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  footerText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: "center",
  },
  linkText: {
    color: '#ffffff',
    fontWeight: "600",
  },
});
