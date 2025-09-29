import React from "react";
import { View, Image, StyleSheet } from "react-native";
import { theme } from "../utils/theme";
import Logo from "../assets/images/logo.png";

const CustomHeader = () => {
  return (
    <View style={styles.header}>
      <Image source={Logo} style={styles.logo} resizeMode="contain" />
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 16,
    paddingVertical: 0,
    borderBottomWidth: 1.5,
    borderBottomColor: theme.colors.border,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: theme.colors.background,
  },
  logo: {
    width: 150,
    height: 100,
  },
});

export default CustomHeader;
