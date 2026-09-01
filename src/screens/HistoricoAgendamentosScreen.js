import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { useTheme } from "../utils/ThemeContext";
import { listMyAppointments, cancelMyAppointment } from "../api/barberApi";
import { parseBackendDate } from "../utils/dateUtils";
import Avatar from "../components/ui/Avatar";
import Skeleton from "../components/ui/Skeleton";

const HistoricoAgendamentosScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const { isDarkMode } = theme;
  const styles = getStyles(theme, isDarkMode);

  const statusConfig = {
    COMPLETED: { label: "Concluído", color: theme.colors.success, icon: "check-circle", bg: theme.colors.successLight },
    CONFIRMED: { label: "Confirmado", color: theme.colors.primary, icon: "event-available", bg: theme.colors.primaryLight + "20" },
    PENDING: { label: "Pendente", color: theme.colors.warning, icon: "schedule", bg: theme.colors.warningLight },
    CANCELED: { label: "Cancelado", color: theme.colors.error, icon: "cancel", bg: theme.colors.errorLight },
  };

  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancelingId, setCancelingId] = useState(null);
  const [filter, setFilter] = useState("all"); // all, past, upcoming

  useEffect(() => {
    loadAppointments();
  }, []);

  const loadAppointments = async () => {
    setLoading(true);
    try {
      const items = await listMyAppointments();
      setAppointments(items || []);
    } catch (error) {
      console.debug("Erro ao carregar histórico:", error);
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelAppointment = async (apptId, serviceName) => {
    const performCancel = async () => {
      try {
        setCancelingId(apptId);
        await cancelMyAppointment(apptId);
        if (Platform.OS === "web") {
          window.alert("Agendamento cancelado com sucesso.");
        } else {
          Alert.alert("Cancelado", "Seu agendamento foi cancelado com sucesso.");
        }
        await loadAppointments();
      } catch (err) {
        console.error("Erro ao cancelar histórico:", err);
        const msg =
          err.response?.data?.error ||
          err.message ||
          "Não foi possível cancelar o agendamento.";
        if (Platform.OS === "web") {
          window.alert(`Erro: ${msg}`);
        } else {
          Alert.alert("Erro", msg);
        }
      } finally {
        setCancelingId(null);
      }
    };

    if (Platform.OS === "web") {
      const confirm = window.confirm(
        `Tem certeza que deseja cancelar seu agendamento de ${serviceName || "serviço"}?`
      );
      if (confirm) {
        await performCancel();
      }
      return;
    }

    Alert.alert(
      "Cancelar Agendamento",
      `Tem certeza que deseja cancelar seu agendamento de ${serviceName || "serviço"}?`,
      [
        { text: "Não", style: "cancel" },
        {
          text: "Sim, Cancelar",
          style: "destructive",
          onPress: performCancel,
        },
      ],
      { cancelable: true }
    );
  };

  const filteredAppointments = () => {
    const now = new Date();
    switch (filter) {
      case "past":
        return appointments.filter((a) => new Date(a.scheduled_at) < now);
      case "upcoming":
        return appointments.filter((a) => new Date(a.scheduled_at) >= now);
      default:
        return appointments;
    }
  };

  const renderFilterChip = (key, label) => (
    <TouchableOpacity
      style={[styles.filterChip, filter === key && styles.filterChipActive]}
      onPress={() => setFilter(key)}
    >
      <Text style={[styles.filterChipText, filter === key && styles.filterChipTextActive]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  const renderAppointment = ({ item }) => {
    const parsed = parseBackendDate(item.scheduled_at);
    if (!parsed) return null;
    
    const when = parsed.dateObj;
    const h = parsed.hour;
    const m = parsed.minute;

    const config = statusConfig[item.status] || statusConfig.PENDING;
    const isPast = when < new Date();

    return (
      <View style={[styles.appointmentCard, isPast && styles.appointmentCardPast]}>
        <View style={styles.cardHeader}>
          <View style={styles.cardHeaderLeft}>
            <Avatar
              source={item.professional?.avatar_url}
              size="md"
              name={item.professional?.name}
            />
            <View style={styles.cardInfo}>
              <Text style={styles.cardService}>{item.service?.name || "Serviço"}</Text>
              <Text style={styles.cardProfessional}>
                com {item.professional?.name || "Barbeiro"}
              </Text>
            </View>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: config.bg }]}>
            <MaterialIcons name={config.icon} size={14} color={config.color} />
            <Text style={[styles.statusText, { color: config.color }]}>{config.label}</Text>
          </View>
        </View>

        <View style={styles.cardFooter}>
          <View style={styles.cardFooterLeft}>
            <View style={styles.cardDetail}>
              <MaterialIcons name="calendar-today" size={14} color={theme.colors.textMuted} />
              <Text style={styles.cardDetailText}>
                {when.toLocaleDateString("pt-BR", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                  timeZone: "UTC",
                })}
              </Text>
            </View>
            <View style={styles.cardDetail}>
              <MaterialIcons name="access-time" size={14} color={theme.colors.textMuted} />
              <Text style={styles.cardDetailText}>{h}:{m}</Text>
            </View>
          </View>
          {item.service?.price !== undefined && (
            <View style={styles.cardPriceContainer}>
              <Text style={styles.cardPrice}>
                {Number(item.service.price) === 0 ? "Grátis" : `R$ ${Number(item.service.price).toFixed(2).replace('.', ',')}`}
              </Text>
            </View>
          )}
        </View>

        {!isPast && (item.status === "CONFIRMED" || item.status === "PENDING") && (
          <View style={styles.cardActions}>
            <TouchableOpacity
              style={styles.cancelAppointmentBtn}
              onPress={() => handleCancelAppointment(item.appointment_id, item.service?.name)}
              disabled={cancelingId === item.appointment_id}
            >
              {cancelingId === item.appointment_id ? (
                <ActivityIndicator size="small" color={theme.colors.error} />
              ) : (
                <>
                  <MaterialIcons name="close" size={14} color={theme.colors.error} />
                  <Text style={styles.cancelAppointmentText}>Cancelar Horário</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconCircle}>
        <MaterialIcons name="event-busy" size={48} color={theme.colors.textMuted} />
      </View>
      <Text style={styles.emptyTitle}>Nenhum agendamento</Text>
      <Text style={styles.emptySubtitle}>
        {filter === "upcoming"
          ? "Você não tem agendamentos futuros."
          : filter === "past"
          ? "Você não tem agendamentos anteriores."
          : "Seu histórico de agendamentos aparecerá aqui."}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <MaterialIcons name="arrow-back" size={24} color={theme.colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Agendamentos</Text>
        <View style={styles.headerRight} />
      </View>

      {/* Filters */}
      <View style={styles.filtersRow}>
        {renderFilterChip("all", "Todos")}
        {renderFilterChip("upcoming", "Próximos")}
        {renderFilterChip("past", "Anteriores")}
      </View>

      {/* List */}
      {loading ? (
        <View style={[styles.listContent, { paddingTop: 16 }]}>
          {[1, 2, 3].map((key) => (
            <View key={key} style={styles.appointmentCard}>
              <View style={styles.cardHeader}>
                <View style={styles.cardHeaderLeft}>
                  <Skeleton width={48} height={48} style={{ borderRadius: 24 }} />
                  <View style={styles.cardInfo}>
                    <Skeleton width={120} height={18} style={{ marginBottom: 6 }} />
                    <Skeleton width={100} height={14} />
                  </View>
                </View>
                <Skeleton width={80} height={24} style={{ borderRadius: 12 }} />
              </View>
              <View style={styles.cardFooter}>
                <Skeleton width={100} height={16} />
                <Skeleton width={60} height={16} />
              </View>
            </View>
          ))}
        </View>
      ) : (
        <FlatList
          data={filteredAppointments()}
          renderItem={renderAppointment}
          keyExtractor={(item) => String(item.appointment_id)}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={renderEmpty}
        />
      )}
    </SafeAreaView>
  );
};

const getStyles = (theme, isDarkMode) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.backgroundSecondary,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  backButton: {
    padding: 8,
    borderRadius: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: theme.colors.textPrimary,
    flex: 1,
    textAlign: "center",
    marginHorizontal: 16,
  },
  headerRight: {
    width: 40,
  },
  filtersRow: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingVertical: 14,
    gap: 10,
  },
  filterChip: {
    paddingVertical: 8,
    paddingHorizontal: 18,
    borderRadius: 20,
    backgroundColor: theme.colors.secondary,
    borderWidth: 1,
    borderColor: "transparent",
  },
  filterChipActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  filterChipText: {
    fontSize: 13,
    fontWeight: "600",
    color: theme.colors.textSecondary,
  },
  filterChipTextActive: {
    color: "#FFF",
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  appointmentCard: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.lg,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
    ...(isDarkMode ? {} : theme.shadows.sm),
  },
  appointmentCardPast: {
    opacity: 0.8,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  cardHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  cardInfo: {
    marginLeft: 12,
    flex: 1,
  },
  cardService: {
    fontSize: 15,
    fontWeight: "600",
    color: theme.colors.textPrimary,
  },
  cardProfessional: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    gap: 4,
  },
  statusText: {
    fontSize: 11,
    fontWeight: "600",
  },
  cardFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: theme.colors.backgroundSecondary,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
  },
  cardFooterLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flexShrink: 1,
    flexWrap: "wrap",
  },
  cardDetail: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  cardDetailText: {
    fontSize: 12,
    color: theme.colors.textMuted,
    fontWeight: "500",
  },
  cardPriceContainer: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    backgroundColor: isDarkMode ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)",
  },
  cardPrice: {
    fontSize: 13,
    fontWeight: "700",
    color: theme.colors.primary,
  },
  cardActions: {
    marginTop: 10,
    flexDirection: "row",
    justifyContent: "flex-end",
    borderTopWidth: 1,
    borderTopColor: theme.colors.borderLight,
    paddingTop: 8,
  },
  cancelAppointmentBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: theme.colors.errorLight || "#FEE2E2",
  },
  cancelAppointmentText: {
    fontSize: 12,
    fontWeight: "600",
    color: theme.colors.error,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    color: theme.colors.textMuted,
    fontSize: 14,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyIconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: theme.colors.secondary + "60",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: theme.colors.textPrimary,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: theme.colors.textMuted,
    textAlign: "center",
    maxWidth: 260,
    lineHeight: 20,
  },
});

export default HistoricoAgendamentosScreen;
