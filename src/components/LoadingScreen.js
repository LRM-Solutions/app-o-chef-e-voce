import React from "react";
import { View, ActivityIndicator, Text, StyleSheet } from "react-native";
import { theme } from "../utils/theme";

export default function LoadingScreen() {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={theme.colors.primary} />
      <Text style={styles.text}>Carregando...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: theme.colors.background,
  },
  text: {
    color: theme.colors.muted,
    marginTop: 16,
    fontSize: 18,
  },
});
