import React, { memo } from "react";
import { View, Image, StyleSheet } from "react-native";

const COIN_SOURCE = require("../../../assets/sanscoinsnobg.png");

const CoinIcon = ({ size = 20, style }) => {
  return (
    <View style={[styles.container, { width: size, height: size }, style]}>
      <Image
        source={COIN_SOURCE}
        style={{ width: size, height: size }}
        resizeMode="contain"
        fadeDuration={0}
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

export default memo(CoinIcon);

