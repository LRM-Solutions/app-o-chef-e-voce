import React from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  TouchableWithoutFeedback,
} from "react-native";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { useTheme } from "../utils/ThemeContext";

export default function ConfirmModal({
  visible,
  title = "Confirmação",
  message = "Deseja prosseguir com esta ação?",
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  confirmColor = "#EF4444",
  iconName = "delete-outline",
  onConfirm,
  onCancel,
  loading = false,
}) {
  const { theme, themeMode } = useTheme();
  const isDark = theme?.isDarkMode ?? themeMode === "dark";
  const styles = getStyles(theme, isDark, confirmColor);

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <TouchableWithoutFeedback onPress={onCancel}>
        <View style={styles.backdrop}>
          <TouchableWithoutFeedback>
            <View style={styles.card}>
              {/* Ícone de Destaque */}
              <View style={styles.iconCircle}>
                <MaterialIcons
                  name={iconName}
                  size={28}
                  color={confirmColor}
                />
              </View>

              {/* Título e Mensagem */}
              <Text style={styles.title}>{title}</Text>
              <Text style={styles.message}>{message}</Text>

              {/* Botões de Ação */}
              <View style={styles.actionsRow}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={onCancel}
                  disabled={loading}
                  activeOpacity={0.7}
                >
                  <Text style={styles.cancelButtonText}>{cancelText}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.confirmButton}
                  onPress={onConfirm}
                  disabled={loading}
                  activeOpacity={0.8}
                >
                  {loading ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <Text style={styles.confirmButtonText}>{confirmText}</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const getStyles = (theme, isDark, confirmColor) =>
  StyleSheet.create({
    backdrop: {
      flex: 1,
      backgroundColor: "rgba(0, 0, 0, 0.72)",
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: 24,
    },
    card: {
      width: "100%",
      maxWidth: 340,
      backgroundColor: isDark ? "#1A1A1E" : "#FFFFFF",
      borderRadius: 24,
      padding: 24,
      alignItems: "center",
      shadowColor: "#000000",
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: isDark ? 0.5 : 0.15,
      shadowRadius: 20,
      elevation: 8,
      borderWidth: 1,
      borderColor: isDark ? "rgba(255, 255, 255, 0.08)" : "rgba(0, 0, 0, 0.06)",
    },
    iconCircle: {
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: isDark ? "rgba(239, 68, 68, 0.12)" : "rgba(239, 68, 68, 0.08)",
      justifyContent: "center",
      alignItems: "center",
      marginBottom: 16,
    },
    title: {
      fontSize: 18,
      fontWeight: "800",
      color: isDark ? "#FFFFFF" : "#111827",
      marginBottom: 8,
      textAlign: "center",
    },
    message: {
      fontSize: 14,
      color: isDark ? "#A0A0B0" : "#6B7280",
      textAlign: "center",
      lineHeight: 20,
      marginBottom: 24,
    },
    actionsRow: {
      flexDirection: "row",
      gap: 12,
      width: "100%",
    },
    cancelButton: {
      flex: 1,
      paddingVertical: 13,
      borderRadius: 14,
      backgroundColor: isDark ? "rgba(255, 255, 255, 0.08)" : "#F3F4F6",
      alignItems: "center",
      justifyContent: "center",
    },
    cancelButtonText: {
      fontSize: 14,
      fontWeight: "700",
      color: isDark ? "#D1D5DB" : "#4B5563",
    },
    confirmButton: {
      flex: 1,
      paddingVertical: 13,
      borderRadius: 14,
      backgroundColor: confirmColor,
      alignItems: "center",
      justifyContent: "center",
      shadowColor: confirmColor,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.35,
      shadowRadius: 8,
      elevation: 3,
    },
    confirmButtonText: {
      fontSize: 14,
      fontWeight: "700",
      color: "#FFFFFF",
    },
  });
