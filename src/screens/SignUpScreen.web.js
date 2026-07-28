import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Image,
  ScrollView,
  ImageBackground,
  useWindowDimensions,
} from "react-native";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { signUp } from "../api/authApi";
import { config } from "../utils/config";
import { Linking } from "react-native";

export default function SignUpScreen({ navigation }) {
  const { width } = useWindowDimensions();
  const isMobile = width < 768;

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const formatPhone = (text) => {
    let digits = text.replace(/\D/g, "");
    if (digits.length > 11) digits = digits.slice(0, 11);
    let formatted = digits;
    if (digits.length > 2) {
      formatted = `(${digits.slice(0, 2)}) `;
      if (digits.length > 7) {
        formatted += `${digits.slice(2, 7)}-${digits.slice(7)}`;
      } else {
        formatted += digits.slice(2);
      }
    }
    setPhone(formatted);
  };

  const handleRegister = async () => {
    if (!name || !email || !phone || !password) {
      setError("Todos os campos são obrigatórios");
      return;
    }
    if (password.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres");
      return;
    }
    
    setIsLoading(true);
    setError("");

    try {
      const cleanPhone = phone.replace(/\D/g, "");
      const response = await signUp(name, email, password, cleanPhone);
      if (response) {
        navigation.navigate("NewUserEmailCode", { userEmail: email, fromLogin: false });
      }
    } catch (err) {
      const msg = err.response?.data?.error || err.message || "Erro ao criar conta.";
      setError(msg);
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

          <Text style={styles.title}>Criar Conta</Text>
          <Text style={styles.subtitle}>Junte-se a nós para a melhor experiência</Text>

          <ScrollView 
            style={styles.scrollForm} 
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.inputContainer}>
              <MaterialIcons name="person" size={20} color="rgba(255,255,255,0.7)" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Seu nome completo"
                placeholderTextColor="rgba(255,255,255,0.5)"
                value={name}
                onChangeText={setName}
              />
            </View>

            <View style={styles.inputContainer}>
              <MaterialIcons name="email" size={20} color="rgba(255,255,255,0.7)" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Seu melhor email"
                placeholderTextColor="rgba(255,255,255,0.5)"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputContainer}>
              <MaterialIcons name="phone" size={20} color="rgba(255,255,255,0.7)" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="(00) 00000-0000"
                placeholderTextColor="rgba(255,255,255,0.5)"
                value={phone}
                onChangeText={formatPhone}
                keyboardType="phone-pad"
                maxLength={15}
              />
            </View>

            <View style={styles.inputContainer}>
              <MaterialIcons name="lock" size={20} color="rgba(255,255,255,0.7)" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Senha (min. 6 caracteres)"
                placeholderTextColor="rgba(255,255,255,0.5)"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
            </View>

            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <TouchableOpacity
              style={[styles.button, isLoading && styles.buttonDisabled]}
              onPress={handleRegister}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#000" />
              ) : (
                <Text style={styles.buttonText}>Cadastrar</Text>
              )}
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
                Já tem uma conta?{" "}
                <Text
                  style={styles.linkText}
                  onPress={() => navigation.navigate("Login")}
                >
                  Entrar
                </Text>
              </Text>
            </View>
          </ScrollView>
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
    maxHeight: '90vh',
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
    zIndex: 10,
  },
  logo: {
    width: 70,
    height: 70,
    marginBottom: 10,
    marginTop: 0,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 16,
  },
  scrollForm: {
    width: '100%',
  },
  scrollContent: {
    paddingBottom: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 12,
    marginBottom: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
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
