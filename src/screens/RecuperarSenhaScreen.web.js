import React, { useState } from "react";
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
import { resetPassword } from "../api/resetPasswordApi";

export default function RecuperarSenhaScreen({ navigation }) {
  const { width } = useWindowDimensions();
  const isMobile = width < 768;

  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [error, setError] = useState("");

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleResetPassword = async () => {
    if (!email.trim()) {
      setError("Por favor, insira seu email.");
      return;
    }
    if (!validateEmail(email)) {
      setError("Por favor, insira um email válido.");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      await resetPassword(email.trim().toLowerCase());
      setEmailSent(true);
    } catch (err) {
      setError(err.message || "Não foi possível enviar o email. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
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

          {!emailSent ? (
            <>
              <Text style={styles.title}>Esqueceu a senha?</Text>
              <Text style={styles.subtitle}>Digite seu email abaixo e enviaremos instruções para redefinir.</Text>

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

                {error ? <Text style={styles.errorText}>{error}</Text> : null}

                <TouchableOpacity
                  style={[styles.button, isLoading && styles.buttonDisabled]}
                  onPress={handleResetPassword}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <ActivityIndicator color="#000" />
                  ) : (
                    <Text style={styles.buttonText}>Enviar nova senha</Text>
                  )}
                </TouchableOpacity>
              </View>
            </>
          ) : (
            <View style={styles.successContainer}>
              <View style={styles.successIconCircle}>
                <MaterialIcons name="check" size={48} color="white" />
              </View>
              <Text style={styles.title}>Email Enviado!</Text>
              <Text style={styles.subtitle}>
                Verifique sua caixa de entrada e use a nova senha para fazer login.
              </Text>

              <TouchableOpacity
                style={styles.button}
                onPress={() => navigation.navigate("Login")}
              >
                <Text style={styles.buttonText}>Voltar ao Login</Text>
              </TouchableOpacity>
            </View>
          )}
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
    padding: 40,
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
    zIndex: 10,
  },
  logo: {
    width: 90,
    height: 90,
    marginBottom: 20,
    marginTop: 10,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 32,
    textAlign: 'center',
    lineHeight: 22,
  },
  form: {
    width: '100%',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 12,
    marginBottom: 16,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    paddingVertical: 16,
    color: '#ffffff',
    fontSize: 16,
    outlineStyle: 'none',
  },
  errorText: {
    color: '#ff4d4d',
    marginBottom: 16,
    textAlign: 'center',
    fontSize: 14,
  },
  button: {
    width: '100%',
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
  successContainer: {
    width: '100%',
    alignItems: 'center',
  },
  successIconCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#10b981',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
});
