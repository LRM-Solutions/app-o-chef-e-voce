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
import { theme } from "../utils/theme";
import Button from "../components/ui/Button";

import { useRoute } from "@react-navigation/native";

const AppointmentSuccessScreen = ({ navigation }) => {
  const route = useRoute();
  const insets = useSafeAreaInsets();
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  const appointment = route.params?.appointment || null;

  const formatted = useMemo(() => {
    if (!appointment) return null;
    const when = new Date(appointment.scheduled_at);
    return {
      dateLabel: when.toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "long" }),
      timeLabel: when.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
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
              <View style={styles.detailRow}>
                <MaterialIcons name="content-cut" size={20} color={theme.colors.primary} />
                <Text style={styles.detailText}>{formatted.service}</Text>
              </View>
              <View style={styles.detailRow}>
                <MaterialIcons name="person" size={20} color={theme.colors.primary} />
                <Text style={styles.detailText}>com {formatted.barber}</Text>
              </View>
              <View style={styles.detailRow}>
                <MaterialIcons name="badge" size={20} color={theme.colors.primary} />
                <Text style={styles.detailText}>Cliente: {formatted.user}</Text>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
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
    ...theme.shadows.lg,
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
    backgroundColor: theme.colors.secondary,
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
    fontSize: 15,
    color: theme.colors.textPrimary,
    marginLeft: 12,
    fontWeight: "500",
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
