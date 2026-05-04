import React from "react";
import { View, Text, StyleSheet } from "react-native";
import CoinIcon from "./CoinIcon";
import { useTheme } from "../../utils/ThemeContext";

const SansCoinsDisplay = ({
  amount,
  size = "md", // sm, md, lg
  showIcon = true,
  style,
}) => {
  const { theme } = useTheme();
  const styles = getStyles(theme);

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
  const displayAmount = amount !== undefined && amount !== null ? Number(amount).toLocaleString("pt-BR") : "0";

  return (
    <View style={[styles.container, style]}>
      {showIcon && (
        <CoinIcon size={sizeConfig.iconSize} style={styles.imageIconContainer} />
      )}
      <Text style={[styles.amount, { fontSize: sizeConfig.fontSize, color: theme.isDarkMode ? '#FFD700' : '#B8860B' }]}>
        {displayAmount}
      </Text>
      {size === "lg" && <Text style={styles.label}>Sans Coins</Text>}
    </View>
  );
};

const getStyles = (theme) => StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
  },
  imageIconContainer: {
    marginRight: 6,
    justifyContent: "center",
    alignItems: "center",
  },
  amount: {
    fontWeight: "700",
  },
  label: {
    fontSize: 12,
    color: theme.colors.textMuted,
    marginLeft: 4,
  },
});

export default SansCoinsDisplay;
