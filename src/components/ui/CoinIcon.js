import React from "react";
import { View, Image, StyleSheet, Platform } from "react-native";
import { theme } from "../../utils/theme";

const CoinIcon = ({ size = 20, style }) => {
  const coinSource = Platform.OS === "android"
    ? require("../../../assets/sanscoinsnobg.png")
    : require("../../../assets/Coins_Sans.png");

  return (
    <View style={[styles.container, { width: size, height: size }, style]}>
      <Image
        source={coinSource}
        style={{ width: size, height: size }}
        resizeMode="contain"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 2,
  },
});

export default CoinIcon;
