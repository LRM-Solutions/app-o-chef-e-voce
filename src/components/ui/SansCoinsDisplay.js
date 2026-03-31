import React from "react";
import { View, Text, StyleSheet } from "react-native";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { theme } from "../../utils/theme";

const SansCoinsDisplay = ({
  amount,
  size = "md", // sm, md, lg
  showIcon = true,
  style,
}) => {
  const getSizeStyles = () => {
    switch (size) {
      case "sm":
        return { fontSize: 13, iconSize: 14 };
      case "lg":
        return { fontSize: 20, iconSize: 22 };
      default:
        return { fontSize: 16, iconSize: 18 };
    }
  };

  const sizeConfig = getSizeStyles();

  return (
    <View style={[styles.container, style]}>
      {showIcon && (
        <Text style={[styles.icon, { fontSize: sizeConfig.iconSize }]}>💎</Text>
      )}
      <Text style={[styles.amount, { fontSize: sizeConfig.fontSize }]}>
        {amount?.toLocaleString("pt-BR")}
      </Text>
      {size === "lg" && <Text style={styles.label}>Sans Coins</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
  },
  icon: {
    marginRight: 4,
  },
  amount: {
    fontWeight: "700",
    color: theme.colors.textPrimary,
  },
  label: {
    fontSize: 12,
    color: theme.colors.textMuted,
    marginLeft: 4,
  },
});

export default SansCoinsDisplay;
