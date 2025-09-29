import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { theme } from "../utils/theme";

export const BaseView = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Hello World</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: theme.colors.background,
  },
  text: {
    fontSize: 18,
    color: "#333",
  },
});
