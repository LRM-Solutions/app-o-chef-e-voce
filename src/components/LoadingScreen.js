import React, { useEffect, useRef } from "react";
import { View, Text, StyleSheet, Animated, Easing, Dimensions, ActivityIndicator } from "react-native";
import { theme as defaultTheme } from "../utils/theme";
import { useTheme } from "../utils/ThemeContext";

const { width } = Dimensions.get("window");

export default function LoadingScreen() {
  const { theme } = useTheme();
  const styles = getStyles(theme);
  
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim1 = useRef(new Animated.Value(0)).current;
  const pulseAnim2 = useRef(new Animated.Value(0)).current;
  const textTranslateY = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    // Animação de entrada principal
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 15,
        friction: 6,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 1000,
        delay: 300,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(textTranslateY, {
        toValue: 0,
        duration: 800,
        delay: 300,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      })
    ]).start();

    // Loop de pulso do fundo
    const createPulse = (anim, delay) => {
      return Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(anim, {
            toValue: 1,
            duration: 2500,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(anim, {
            toValue: 0,
            duration: 0,
            useNativeDriver: true,
          })
        ])
      );
    };

    createPulse(pulseAnim1, 0).start();
    createPulse(pulseAnim2, 1250).start();

  }, [scaleAnim, opacityAnim, textTranslateY, pulseAnim1, pulseAnim2]);

  // Estilos interpolados para o efeito de pulso
  const getPulseStyle = (anim) => ({
    opacity: anim.interpolate({
      inputRange: [0, 0.5, 1],
      outputRange: [0.5, 0.15, 0]
    }),
    transform: [{
      scale: anim.interpolate({
        inputRange: [0, 1],
        outputRange: [0.7, 1.8]
      })
    }]
  });

  return (
    <View style={styles.container}>
      <View style={styles.logoWrapper}>
        {/* Pulsos de fundo para chamar atenção */}
        <Animated.View style={[styles.pulseCircle, getPulseStyle(pulseAnim1)]} />
        <Animated.View style={[styles.pulseCircle, getPulseStyle(pulseAnim2)]} />
        
        {/* Logo com efeito de mola (spring) */}
        <Animated.Image 
          source={require("../../assets/sansicon.png")}
          style={[
            styles.logo,
            {
              transform: [{ scale: scaleAnim }]
            }
          ]}
          resizeMode="contain"
        />
      </View>

      {/* Textos da marca com fade e entrada suave */}
      <Animated.View 
        style={[
          styles.textContainer,
          {
            opacity: opacityAnim,
            transform: [{ translateY: textTranslateY }]
          }
        ]}
      >
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
    width: width * 0.55,
    height: width * 0.55,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 50,
  },
  pulseCircle: {
    position: "absolute",
    width: width * 0.4,
    height: width * 0.4,
    borderRadius: (width * 0.4) / 2,
    backgroundColor: theme.colors.primary,
  },
  logo: {
    width: "100%",
    height: "100%",
    zIndex: 10,
  },
  textContainer: {
    alignItems: "center",
  },
  title: {
    fontSize: theme.fontSizes["3xl"],
    fontWeight: theme.fontWeights.extrabold,
    color: theme.colors.primary,
    letterSpacing: 3,
  },
  subtitle: {
    fontSize: theme.fontSizes.base,
    color: theme.colors.textMuted,
    marginTop: 8,
    fontWeight: theme.fontWeights.medium,
    letterSpacing: 1,
  },
  loader: {
    marginTop: 30,
  }
});
