import React from "react";
import { View, Image, StyleSheet, Text } from "react-native";
import { theme } from "../../utils/theme";

const Avatar = ({
  source,
  size = "md", // sm, md, lg, xl
  status, // online, busy, offline
  showStatus = false,
  style,
  name,
}) => {
  const getSizeValue = () => {
    switch (size) {
      case "sm":
        return 40;
      case "lg":
        return 64;
      case "xl":
        return 80;
      default:
        return 50;
    }
  };

  const getStatusSize = () => {
    switch (size) {
      case "sm":
        return 10;
      case "lg":
        return 16;
      case "xl":
        return 20;
      default:
        return 12;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case "online":
        return theme.colors.online;
      case "busy":
        return theme.colors.busy;
      default:
        return theme.colors.offline;
    }
  };

  const sizeValue = getSizeValue();
  const statusSize = getStatusSize();

  const getInitials = () => {
    if (!name) return "";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // Determine if source is a URI or a local require
  const imageSource = typeof source === 'string' ? { uri: source } : source;

  return (
    <View style={[styles.container, { width: sizeValue, height: sizeValue }, style]}>
      {source ? (
        <Image
          source={imageSource}
          style={[
            styles.image,
            {
              width: sizeValue,
              height: sizeValue,
              borderRadius: sizeValue / 2,
            },
          ]}
        />
      ) : (
        <View
          style={[
            styles.placeholder,
            {
              width: sizeValue,
              height: sizeValue,
              borderRadius: sizeValue / 2,
            },
          ]}
        >
          <Text style={[styles.initials, { fontSize: sizeValue * 0.4 }]}>
            {getInitials()}
          </Text>
        </View>
      )}
      {showStatus && status && (
        <View
          style={[
            styles.status,
            {
              width: statusSize,
              height: statusSize,
              borderRadius: statusSize / 2,
              backgroundColor: getStatusColor(),
              right: 0,
              bottom: 0,
            },
          ]}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "relative",
  },
  image: {
    backgroundColor: theme.colors.secondary,
  },
  placeholder: {
    backgroundColor: theme.colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  initials: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  status: {
    position: "absolute",
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
});

export default Avatar;
