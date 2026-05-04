import React, { useEffect, useRef } from "react";
import CoinIcon from "../components/ui/CoinIcon";
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Animated, Easing } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { useTheme } from "../utils/ThemeContext";
import { ScrollView } from "react-native";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";

const { width } = Dimensions.get("window");

const RedemptionSuccessScreen = ({ route, navigation }) => {
  const { prize, redemption } = route.params;
  const insets = useSafeAreaInsets();
  const { theme, isDarkMode } = useTheme();
  const styles = getStyles(theme, isDarkMode);

  const scaleValue = useRef(new Animated.Value(0)).current;
  const opacityValue = useRef(new Animated.Value(0)).current;
  const slideValue = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.timing(scaleValue, {
        toValue: 1,
        duration: 400,
        easing: Easing.out(Easing.back(1.5)),
        useNativeDriver: true,
      }),
      Animated.parallel([
        Animated.timing(opacityValue, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(slideValue, {
          toValue: 0,
          duration: 300,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, []);

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    }).format(date);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* Animated Checkmark */}
        <Animated.View style={[styles.checkmarkContainer, { transform: [{ scale: scaleValue }] }]}>
          <View style={styles.checkmarkCircle}>
            <MaterialIcons name="card-giftcard" size={48} color="#FFF" />
          </View>
        </Animated.View>

        <Animated.View style={[styles.contentContainer, { opacity: opacityValue, transform: [{ translateY: slideValue }] }]}>
          <Text style={styles.title}>Prêmio Resgatado!</Text>
          <Text style={styles.subtitle}>
            Apresente esta tela para o barbeiro e pegue sua recompensa exclusiva.
          </Text>

          <Card style={styles.detailsCard}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardHeaderTitle}>Detalhes do Resgate</Text>
            </View>

            <View style={styles.detailRow}>
              <View style={styles.detailIconContainer}>
                <MaterialIcons name="redeem" size={24} color={theme.colors.primary} />
              </View>
              <View style={styles.detailTextContainer}>
                <Text style={styles.detailLabel}>Prêmio</Text>
                <Text style={styles.detailValue}>{prize.name}</Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.detailRow}>
              <View style={styles.detailIconContainer}>
                <MaterialIcons name="monetization-on" size={24} color={theme.colors.primary} />
              </View>
              <View style={styles.detailTextContainer}>
                <Text style={styles.detailLabel}>Custo</Text>
                <View style={{flexDirection: 'row', alignItems: 'center'}}>
                  <CoinIcon size={16} />
                  <Text style={[styles.detailValue, {marginLeft: 4}]}>{prize.coins || prize.coins_cost} Sans Coins</Text>
                </View>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.detailRow}>
              <View style={styles.detailIconContainer}>
                <MaterialIcons name="check-circle" size={24} color={theme.colors.success} />
              </View>
              <View style={styles.detailTextContainer}>
                <Text style={styles.detailLabel}>Data e Hora do Resgate</Text>
                <Text style={styles.detailValue}>{redemption ? formatDate(redemption.redeemed_at) : formatDate(new Date())}</Text>
              </View>
            </View>

          </Card>

          <View style={styles.actionContainer}>
            <Button
              title="Voltar para o Início"
              onPress={() => navigation.navigate("MainTabs")}
              style={styles.primaryButton}
            />
          </View>
        </Animated.View>
      </ScrollView>
    </View>
  );
};

const getStyles = (theme, isDarkMode) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.backgroundSecondary,
  },
  scrollContent: {
    padding: 24,
    alignItems: "center",
    flexGrow: 1,
  },
  checkmarkContainer: {
    marginTop: 40,
    marginBottom: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  checkmarkCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: theme.colors.primary,
    alignItems: "center",
    justifyContent: "center",
    ...(isDarkMode ? {} : {
      shadowColor: theme.colors.primary,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.3,
      shadowRadius: 16,
      elevation: 8,
    }),
  },
  contentContainer: {
    width: "100%",
    alignItems: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: theme.colors.textPrimary,
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    textAlign: "center",
    marginBottom: 40,
    lineHeight: 24,
    paddingHorizontal: 16,
  },
  detailsCard: {
    width: "100%",
    padding: 0,
    overflow: "hidden",
    marginBottom: 32,
  },
  cardHeader: {
    backgroundColor: theme.colors.backgroundSecondary,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderLight,
  },
  cardHeaderTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: theme.colors.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  detailIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: theme.colors.primary + "15",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  detailTextContainer: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: theme.colors.textMuted,
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: "700",
    color: theme.colors.textPrimary,
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.borderLight,
    marginLeft: 84,
  },
  actionContainer: {
    width: "100%",
    marginTop: "auto",
  },
  primaryButton: {
    marginBottom: 16,
  },
});

export default RedemptionSuccessScreen;
