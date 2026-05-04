import React, { useEffect, useMemo, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Easing,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { useTheme } from "../utils/ThemeContext";
import Button from "../components/ui/Button";
import Avatar from "../components/ui/Avatar";

import { useRoute } from "@react-navigation/native";

const AppointmentSuccessScreen = ({ navigation }) => {
  const route = useRoute();
  const insets = useSafeAreaInsets();
  const { theme, isDarkMode } = useTheme();
  const styles = getStyles(theme, isDarkMode);
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  const appointment = route.params?.appointment || null;

  const formatted = useMemo(() => {
    if (!appointment) return null;
    
    // Forçar interpretação UTC
    const dateStr = appointment.scheduled_at.replace(' ', 'T');
    const when = new Date(dateStr.endsWith('Z') ? dateStr : dateStr + 'Z');
    
    // Obter partes UTC manuais
    const h = String(when.getUTCHours()).padStart(2, '0');
    const m = String(when.getUTCMinutes()).padStart(2, '0');
    
    return {
      dateLabel: when.toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "long", timeZone: "UTC" }),
      timeLabel: `${h}:${m}`,
      service: appointment.service?.name || "Serviço",
      barber: appointment.professional?.name || "Barbeiro",
      user: appointment.user?.user_name || "Cliente",
    };
  }, [appointment]);

  useEffect(() => {
    // Animação de entrada
    Animated.sequence([
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 4,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 400,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, []);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.content}>
        {/* Success Icon */}
        <Animated.View
          style={[
            styles.iconContainer,
            { transform: [{ scale: scaleAnim }] },
          ]}
        >
          <View style={styles.iconCircle}>
            <MaterialIcons name="check" size={64} color="#FFF" />
          </View>
        </Animated.View>

        {/* Success Message */}
        <Animated.View
          style={[
            styles.messageContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <Text style={styles.title}>Agendamento Confirmado!</Text>
          <Text style={styles.subtitle}>
            Seu horário foi reservado com sucesso.
          </Text>

          {/* Appointment Details */}
          {formatted && (
            <View style={styles.detailsCard}>
              <View style={styles.detailRow}>
                <MaterialIcons name="event" size={20} color={theme.colors.primary} />
                <Text style={styles.detailText}>{formatted.dateLabel}</Text>
              </View>
              <View style={styles.detailRow}>
                <MaterialIcons name="access-time" size={20} color={theme.colors.primary} />
                <Text style={styles.detailText}>{formatted.timeLabel}</Text>
              </View>
              <View style={styles.barberProfileDivider} />
              <View style={styles.barberProfileCard}>
                {appointment.professional ? (
                  <Avatar source={appointment.professional.avatar_url} size="lg" name={formatted.barber} />
                ) : (
                  <View style={styles.placeholderAvatar}>
                    <MaterialIcons name="person" size={28} color="#FFF" />
                  </View>
                )}
                <View style={styles.barberProfileInfo}>
                  <Text style={styles.barberGreeting}>Seu profissional</Text>
                  <Text style={styles.barberName}>{formatted.barber}</Text>
                  <View style={styles.serviceTag}>
                    <MaterialIcons name="content-cut" size={14} color={theme.colors.primary} />
                    <Text style={styles.serviceTagText}>{formatted.service}</Text>
                  </View>
                </View>
              </View>
            </View>
          )}
        </Animated.View>
      </View>

      {/* Bottom Button */}
      <Animated.View
        style={[
          styles.buttonContainer,
          {
            paddingBottom: insets.bottom + 24,
            opacity: fadeAnim,
          },
        ]}
      >
        <Button
          title="Voltar ao Início"
          onPress={() => navigation.goBack()}
          fullWidth
          size="lg"
          icon={<MaterialIcons name="home" size={20} color="#FFF" />}
        />
      </Animated.View>
    </View>
  );
};

const getStyles = (theme, isDarkMode) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.backgroundSecondary,
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  iconContainer: {
    marginBottom: 32,
  },
  iconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: theme.colors.success,
    alignItems: "center",
    justifyContent: "center",
    ...(isDarkMode ? {} : theme.shadows.lg),
  },
  messageContainer: {
    alignItems: "center",
    width: "100%",
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: theme.colors.textPrimary,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: theme.colors.textMuted,
    marginTop: 8,
    textAlign: "center",
  },
  detailsCard: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.lg,
    padding: 20,
    width: "100%",
    marginTop: 32,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  detailText: {
    fontSize: 16,
    color: theme.colors.textPrimary,
    marginLeft: 12,
    fontWeight: "600",
  },
  barberProfileDivider: {
    height: 1,
    backgroundColor: theme.colors.borderLight,
    marginVertical: 16,
  },
  barberProfileCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.card,
    padding: 16,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
    ...(isDarkMode ? {} : {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.05,
      shadowRadius: 8,
      elevation: 2,
    }),
  },
  placeholderAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: theme.colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  barberProfileInfo: {
    marginLeft: 16,
    flex: 1,
  },
  barberGreeting: {
    fontSize: 12,
    color: theme.colors.textMuted,
    textTransform: "uppercase",
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  barberName: {
    fontSize: 18,
    fontWeight: "700",
    color: theme.colors.textPrimary,
    marginTop: 2,
    marginBottom: 6,
  },
  serviceTag: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.primaryLight + "20",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: "flex-start",
  },
  serviceTagText: {
    fontSize: 13,
    fontWeight: "600",
    color: theme.colors.primary,
    marginLeft: 4,
  },
  coinsCard: {
    backgroundColor: theme.colors.coinsBackground,
    borderRadius: theme.borderRadius.lg,
    padding: 20,
    width: "100%",
    marginTop: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: theme.colors.coins + "50",
  },
  coinsTitle: {
    fontSize: 13,
    color: theme.colors.textSecondary,
  },
  coinsRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },
  coinsEmoji: {
    fontSize: 28,
    marginRight: 8,
  },
  coinsAmount: {
    fontSize: 32,
    fontWeight: "700",
    color: theme.colors.textPrimary,
  },
  coinsLabel: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    marginLeft: 8,
  },
  coinsHint: {
    fontSize: 12,
    color: theme.colors.textMuted,
    marginTop: 8,
  },
  buttonContainer: {
    paddingHorizontal: 24,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: theme.colors.borderLight,
  },
});

export default AppointmentSuccessScreen;
