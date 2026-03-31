import React from "react";
import { View, StyleSheet } from "react-native";
import { theme } from "../../utils/theme";

const Card = ({
  children,
  style,
  variant = "elevated", // elevated, outlined, flat
  padding = "md", // none, sm, md, lg
}) => {
  const getVariantStyle = () => {
    switch (variant) {
      case "outlined":
        return styles.outlined;
      case "flat":
        return styles.flat;
      default:
        return styles.elevated;
    }
  };

  const getPaddingStyle = () => {
    switch (padding) {
      case "none":
        return styles.paddingNone;
      case "sm":
        return styles.paddingSm;
      case "lg":
        return styles.paddingLg;
      default:
        return styles.paddingMd;
    }
  };

  return (
    <View
      style={[
        styles.base,
        getVariantStyle(),
        getPaddingStyle(),
        variant === "elevated" && theme.shadows.card,
        style,
      ]}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  base: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.lg,
  },
  // Variants
  elevated: {
    backgroundColor: theme.colors.card,
  },
  outlined: {
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  flat: {
    backgroundColor: theme.colors.secondary,
  },
  // Padding
  paddingNone: {
    padding: 0,
  },
  paddingSm: {
    padding: theme.spacing.sm,
  },
  paddingMd: {
    padding: theme.spacing.md,
  },
  paddingLg: {
    padding: theme.spacing.lg,
  },
});

export default Card;
