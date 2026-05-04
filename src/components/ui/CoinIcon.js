import React from "react";
import { View, Image, StyleSheet } from "react-native";
import { theme } from "../../utils/theme";

const CoinIcon = ({ size = 20, style }) => {
  return (
    <View style={[styles.container, { width: size, height: size }, style]}>
      <Image
        source={require("../../../assets/sanscoins.png")}
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
