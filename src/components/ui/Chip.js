import React from "react";
import { TouchableOpacity, Text, StyleSheet, View } from "react-native";
import { theme } from "../../utils/theme";

const Chip = ({
  label,
  selected = false,
  onPress,
  icon,
  size = "md", // sm, md
  style,
}) => {
  return (
    <TouchableOpacity
      style={[
        styles.base,
        size === "sm" ? styles.sizeSm : styles.sizeMd,
        selected ? styles.selected : styles.unselected,
        style,
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {icon && <View style={styles.icon}>{icon}</View>}
      <Text style={[styles.label, selected && styles.labelSelected]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: theme.borderRadius.full,
  },
  sizeSm: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    minHeight: 32,
  },
  sizeMd: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    minHeight: 44,
  },
  selected: {
    backgroundColor: theme.colors.primary,
    elevation: 4,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  unselected: {
    backgroundColor: theme.colors.secondary,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    color: theme.colors.textSecondary,
  },
  labelSelected: {
    color: "#FFFFFF",
  },
  icon: {
    marginRight: 6,
  },
});

export default Chip;
