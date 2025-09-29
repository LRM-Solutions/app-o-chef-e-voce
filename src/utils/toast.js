import Toast from "react-native-toast-message";
import { View, Text } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { theme } from "./theme";

// Configurações padronizadas para toasts
export const showSuccessToast = (title, message) => {
  Toast.show({
    type: "success",
    text1: title,
    text2: message,
    visibilityTime: 4000,
    topOffset: 60,
  });
};

export const showErrorToast = (title, message) => {
  Toast.show({
    type: "error",
    text1: title,
    text2: message,
    visibilityTime: 5000,
    topOffset: 60,
  });
};

export const showInfoToast = (title, message) => {
  Toast.show({
    type: "info",
    text1: title,
    text2: message,
    visibilityTime: 4000,
    topOffset: 60,
  });
};

export const showWarningToast = (title, message) => {
  Toast.show({
    type: "warning",
    text1: title,
    text2: message,
    visibilityTime: 4500,
    topOffset: 60,
  });
};

// Configuração customizada para integrar com o tema do app
export const toastConfig = {
  success: (props) => (
    <View
      style={{
        height: 60,
        width: "90%",
        backgroundColor: theme.colors.primary,
        borderRadius: theme.borderRadius.md,
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: theme.spacing.md,
        ...theme.shadows.md,
      }}
    >
      <MaterialIcons name="check-circle" size={24} color="white" />
      <View style={{ marginLeft: theme.spacing.sm, flex: 1 }}>
        <Text style={{ color: "white", fontWeight: "bold", fontSize: 16 }}>
          {props.text1}
        </Text>
        {props.text2 && (
          <Text style={{ color: "white", fontSize: 14, opacity: 0.9 }}>
            {props.text2}
          </Text>
        )}
      </View>
    </View>
  ),
  error: (props) => (
    <View
      style={{
        height: 60,
        width: "90%",
        backgroundColor: theme.colors.destructive,
        borderRadius: theme.borderRadius.md,
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: theme.spacing.md,
        ...theme.shadows.md,
      }}
    >
      <MaterialIcons name="error" size={24} color="white" />
      <View style={{ marginLeft: theme.spacing.sm, flex: 1 }}>
        <Text style={{ color: "white", fontWeight: "bold", fontSize: 16 }}>
          {props.text1}
        </Text>
        {props.text2 && (
          <Text style={{ color: "white", fontSize: 14, opacity: 0.9 }}>
            {props.text2}
          </Text>
        )}
      </View>
    </View>
  ),
};
