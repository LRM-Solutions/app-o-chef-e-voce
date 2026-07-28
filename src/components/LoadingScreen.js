import React, { useEffect, useRef } from "react";
import { View, Text, StyleSheet, Animated, Easing, Dimensions, ActivityIndicator, Image } from "react-native";
import { theme as defaultTheme } from "../utils/theme";
import { useTheme } from "../utils/ThemeContext";

const { width } = Dimensions.get("window");

export default function LoadingScreen() {
  const { theme } = useTheme();
  const styles = getStyles(theme);
  
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Animação de entrada
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 10,
        friction: 5,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 1500,
        easing: Easing.out(Easing.back(1.5)),
        useNativeDriver: true,
      }),
      Animated.timing(textOpacity, {
        toValue: 1,
        duration: 800,
        delay: 500,
        useNativeDriver: true,
      })
    ]).start();

    // Loop de pulso infinito e suave
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        })
      ])
    ).start();

  }, []);

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['-10deg', '0deg']
  });

  return (
    <View style={styles.container}>
      <Animated.View 
        style={[
          styles.logoWrapper,
          {
            opacity: opacityAnim,
            transform: [
              { scale: Animated.multiply(scaleAnim, pulseAnim) },
              { rotate: spin }
            ]
          }
        ]}
      >
        <Image 
          source={require("../../assets/splash-icon.png")}
          style={styles.logo}
          resizeMode="contain"
        />
      </Animated.View>

      <Animated.View style={[styles.textContainer, { opacity: textOpacity }]}>
        <Text style={styles.title}>SANS COMPANY</Text>
        <Text style={styles.subtitle}>Sua Experiência Premium</Text>
        <ActivityIndicator size="small" color={theme.colors.primary} style={styles.loader} />
      </Animated.View>
    </View>
  );
}

const getStyles = (theme) => StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: theme.colors.background,
  },
  logoWrapper: {
    width: width * 0.65,
    height: width * 0.65,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 40,
  },
  logo: {
    width: "100%",
    height: "100%",
  },
  textContainer: {
    alignItems: "center",
  },
  title: {
    fontSize: theme.fontSizes["3xl"],
    fontWeight: "900",
    color: theme.colors.primary,
    letterSpacing: 4,
    textTransform: "uppercase",
  },
  subtitle: {
    fontSize: 14,
    color: theme.colors.textMuted,
    marginTop: 6,
    fontWeight: "600",
    letterSpacing: 2,
    textTransform: "uppercase",
  },
  loader: {
    marginTop: 40,
  }
});
