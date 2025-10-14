import api from "./apiConfig";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Toast from "react-native-toast-message";

// Função de cadastro
export const signUp = async (userName, userEmail, userPassword) => {
  try {
    const payload = {
      user_name: userName,
      user_email: userEmail,
      user_password: userPassword,
      user_type_id: 1,
    };

    console.log("👤 [DEBUG] POST /sign-up - Criando nova conta");
    console.log("📤 [DEBUG] POST /sign-up - Payload:", {
      ...payload,
      user_password: "[HIDDEN]", // Não mostrar senha no log
    });

    const response = await api.post("/sign-up", payload);

    console.log("✅ [DEBUG] POST /sign-up - Response:", {
      status: response.status,
      data: {
        ...response.data,
        token: response.data.token ? "[HIDDEN]" : undefined,
      },
    });

    Toast.show({
      type: "success",
      text1: "Cadastro realizado com sucesso!",
      text2: "Verifique seu email para confirmar a conta",
      visibilityTime: 4000,
    });

    return response.data;
  } catch (error) {
    console.error("❌ [DEBUG] POST /sign-up - Erro:", {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
      url: error.config?.url,
    });

    let errorMessage = "Erro interno do servidor";
    if (error.response && error.response.data && error.response.data.error) {
      errorMessage = error.response.data.error;
    }

    Toast.show({
      type: "error",
      text1: "Erro no Cadastro",
      text2: errorMessage,
      visibilityTime: 4000,
    });

    throw error;
  }
};

// Função de login
export const login = async (userEmail, userPassword) => {
  try {
    const payload = {
      user_email: userEmail,
      user_password: userPassword,
    };

    console.log("🔐 [DEBUG] POST /login - Fazendo login");
    console.log("📤 [DEBUG] POST /login - Payload:", {
      user_email: userEmail,
      user_password: "[HIDDEN]", // Não mostrar senha no log
    });

    const response = await api.post("/login", payload);

    console.log("✅ [DEBUG] POST /login - Response:", {
      status: response.status,
      data: {
        ...response.data,
        token: response.data.token ? "[HIDDEN]" : undefined,
      },
    });

    // Armazenar o token no AsyncStorage
    if (response.data.token) {
      await AsyncStorage.setItem("auth_token", response.data.token);
      console.log("💾 [DEBUG] Token salvo no AsyncStorage");
    }

    return response.data;
  } catch (error) {
    console.error("❌ [DEBUG] POST /login - Erro:", {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
      url: error.config?.url,
    });

    // Verificar se é erro de conta não verificada
    if (
      error.response?.status === 403 &&
      error.response?.data?.needVerification
    ) {
      Toast.show({
        type: "info",
        text1: "Conta não verificada",
        text2: "Redirecionando para verificação...",
        visibilityTime: 3000,
      });

      // Retornar informação especial para redirecionamento
      return {
        needVerification: true,
        userEmail: userEmail,
        error: error.response.data.error,
      };
    }

    let errorMessage =
      error.response?.data?.error || "Erro interno do servidor";

    Toast.show({
      type: "error",
      text1: "Erro no Login",
      text2: errorMessage,
      visibilityTime: 4000,
    });

    return null;
  }
};

// Função para logout
export const logout = async () => {
  try {
    await AsyncStorage.removeItem("auth_token");
    return true;
  } catch (error) {
    console.error("Erro no logout:", error);
    throw error;
  }
};

// Função para verificar se o usuário está logado
export const checkAuthToken = async () => {
  try {
    const token = await AsyncStorage.getItem("auth_token");
    return token !== null;
  } catch (error) {
    console.error("Erro ao verificar token:", error);
    return false;
  }
};

// Função para verificar email com código
export const verifyEmail = async (userEmail, verificationCode) => {
  try {
    const payload = {
      email: userEmail,
      code: verificationCode,
    };

    console.log("✉️ [DEBUG] PATCH /user-verify - Verificando email");
    console.log("📤 [DEBUG] PATCH /user-verify - Payload:", payload);

    const response = await api.patch("/user-verify", payload);

    console.log("✅ [DEBUG] PATCH /user-verify - Response:", {
      status: response.status,
      data: response.data,
    });

    Toast.show({
      type: "success",
      text1: "Email verificado!",
      text2: "Sua conta foi ativada com sucesso",
      visibilityTime: 4000,
    });

    return response.data;
  } catch (error) {
    console.error("❌ [DEBUG] PATCH /user-verify - Erro:", {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
      url: error.config?.url,
    });

    let errorMessage = "Erro ao verificar email";
    if (error.response && error.response.data && error.response.data.error) {
      errorMessage = error.response.data.error;
    }

    Toast.show({
      type: "error",
      text1: "Erro na Verificação",
      text2: errorMessage,
      visibilityTime: 4000,
    });

    throw error;
  }
};

// Função para reenviar código de verificação
export const resendVerificationCode = async (userEmail) => {
  try {
    const payload = {
      email: userEmail,
    };

    console.log("📧 [DEBUG] POST /resend-verification - Reenviando código");
    console.log("📤 [DEBUG] POST /resend-verification - Payload:", payload);

    const response = await api.post("/resend-verification", payload);

    console.log("✅ [DEBUG] POST /resend-verification - Response:", {
      status: response.status,
      data: response.data,
    });

    Toast.show({
      type: "success",
      text1: "Código reenviado!",
      text2: "Verifique sua caixa de entrada",
      visibilityTime: 4000,
    });

    return response.data;
  } catch (error) {
    console.error("❌ [DEBUG] POST /resend-verification - Erro:", {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
      url: error.config?.url,
    });

    let errorMessage = "Erro ao reenviar código";
    if (error.response && error.response.data && error.response.data.error) {
      errorMessage = error.response.data.error;
    }

    Toast.show({
      type: "error",
      text1: "Erro no Reenvio",
      text2: errorMessage,
      visibilityTime: 4000,
    });

    throw error;
  }
};

// Função para obter o token atual
export const getAuthToken = async () => {
  try {
    return await AsyncStorage.getItem("auth_token");
  } catch (error) {
    console.error("Erro ao obter token:", error);
    return null;
  }
};
