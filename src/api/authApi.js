import api from "./apiConfig";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Toast from "react-native-toast-message";

// Função de cadastro
export const signUp = async (userName, userEmail, userPassword, userPhone = null) => {
  try {
    const payload = {
      user_name: userName,
      user_email: userEmail,
      user_password: userPassword,
      user_phone: userPhone,
      user_type_id: 1,
    };

    console.log("📤 [DEBUG] POST /sign-up - Payload:", {
      ...payload,
      user_password: "[HIDDEN]",
    });

    const response = await api.post("/sign-up", payload);

    console.log("📥 [DEBUG] POST /sign-up - Resposta:", {
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
    console.log("❌ [DEBUG] POST /sign-up - Erro:", {
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

    console.log("📤 [DEBUG] POST /login - Payload:", {
      user_email: userEmail,
      user_password: "[HIDDEN]",
    });

    const response = await api.post("/login", payload);

    console.log("📥 [DEBUG] POST /login - Resposta:", {
      status: response.status,
      data: {
        ...response.data,
        token: response.data.token ? "[HIDDEN]" : undefined,
      },
    });

    if (response.data.token) {
      await AsyncStorage.setItem("auth_token", response.data.token);
    }

    if (response.data.user && response.data.user.user_id) {
      await AsyncStorage.setItem("user_id", response.data.user.user_id.toString());
      console.log("💾 [DEBUG] User ID salvo no AsyncStorage:", response.data.user.user_id);

      await AsyncStorage.setItem("user_name", response.data.user.user_name || "");
      await AsyncStorage.setItem("user_email", response.data.user.user_email || "");
    }

    return response.data;
  } catch (error) {
    console.log("❌ [DEBUG] POST /login - Erro:", {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
      url: error.config?.url,
    });

    if (error.response?.status === 403 && error.response?.data?.needVerification) {
      Toast.show({
        type: "info",
        text1: "Conta não verificada",
        text2: "Redirecionando para verificação...",
        visibilityTime: 3000,
      });

      return {
        needVerification: true,
        userEmail: userEmail,
        error: error.response.data.error,
      };
    }

    let errorMessage = error.response?.data?.error || "Erro interno do servidor";

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
    await AsyncStorage.removeItem("user_id");
    await AsyncStorage.removeItem("user_name");
    await AsyncStorage.removeItem("user_email");
    console.log("💾 [DEBUG] Todos os dados do usuário removidos do AsyncStorage");
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

    console.log("📤 [DEBUG] PATCH /user-verify - Payload:", payload);

    const response = await api.patch("/user-verify", payload);

    console.log("📥 [DEBUG] PATCH /user-verify - Resposta:", {
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
    console.log("❌ [DEBUG] PATCH /user-verify - Erro:", {
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

    console.log("📤 [DEBUG] POST /resend-verification - Payload:", payload);

    const response = await api.post("/resend-verification", payload);

    console.log("📥 [DEBUG] POST /resend-verification - Resposta:", {
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
    console.log("❌ [DEBUG] POST /resend-verification - Erro:", {
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

// Função para obter o user_id atual
export const getUserId = async () => {
  try {
    const userId = await AsyncStorage.getItem("user_id");
    return userId ? parseInt(userId) : null;
  } catch (error) {
    console.error("Erro ao obter user_id:", error);
    return null;
  }
};

// Função para obter o nome do usuário
export const getUserName = async () => {
  try {
    return await AsyncStorage.getItem("user_name");
  } catch (error) {
    console.error("Erro ao obter user_name:", error);
    return null;
  }
};

// Função para obter o email do usuário
export const getUserEmail = async () => {
  try {
    return await AsyncStorage.getItem("user_email");
  } catch (error) {
    console.error("Erro ao obter user_email:", error);
    return null;
  }
};

// Função para solicitar exclusão de conta
export const requestDeleteAccount = async () => {
  try {
    console.log("🗑️ [DEBUG] POST /excluir-conta - Solicitando exclusão de conta");

    const response = await api.post("/excluir-conta", {});

    console.log("📥 [DEBUG] POST /excluir-conta - Resposta:", {
      status: response.status,
      data: response.data,
    });

    Toast.show({
      type: "success",
      text1: "Código enviado!",
      text2: "Verifique seu email para confirmar a exclusão da conta",
      visibilityTime: 4000,
    });

    return response.data;
  } catch (error) {
    console.log("❌ [DEBUG] POST /excluir-conta - Erro:", {
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
      text1: "Erro ao solicitar exclusão",
      text2: errorMessage,
      visibilityTime: 4000,
    });

    throw error;
  }
};

// Função para confirmar exclusão de conta
export const confirmDeleteAccount = async (code) => {
  try {
    const payload = {
      code: code.toString(),
    };

    console.log("🗑️ [DEBUG] POST /confirmar-exclusao-conta - Confirmando exclusão");
    console.log("📤 [DEBUG] POST /confirmar-exclusao-conta - Payload:", payload);

    const response = await api.post("/confirmar-exclusao-conta", payload);

    console.log("📥 [DEBUG] POST /confirmar-exclusao-conta - Resposta:", {
      status: response.status,
      data: response.data,
    });

    Toast.show({
      type: "success",
      text1: "Conta excluída!",
      text2: "Sua conta foi excluída com sucesso",
      visibilityTime: 4000,
    });

    return response.data;
  } catch (error) {
    console.log("❌ [DEBUG] POST /confirmar-exclusao-conta - Erro:", {
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
      text1: "Erro na exclusão",
      text2: errorMessage,
      visibilityTime: 4000,
    });

    throw error;
  }
};
