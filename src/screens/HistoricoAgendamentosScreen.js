import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { theme } from "../utils/theme";
import { listMyAppointments } from "../api/barberApi";
import Avatar from "../components/ui/Avatar";

const statusConfig = {
  COMPLETED: { label: "Concluído", color: theme.colors.success, icon: "check-circle", bg: theme.colors.successLight },
  CONFIRMED: { label: "Confirmado", color: theme.colors.primary, icon: "event-available", bg: theme.colors.primaryLight + "20" },
  PENDING: { label: "Pendente", color: theme.colors.warning, icon: "schedule", bg: theme.colors.warningLight },
  CANCELED: { label: "Cancelado", color: theme.colors.error, icon: "cancel", bg: theme.colors.errorLight },
};

const HistoricoAgendamentosScreen = ({ navigation }) => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
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
    const when = new Date(item.scheduled_at);
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
          <View style={styles.cardDetail}>
            <MaterialIcons name="calendar-today" size={16} color={theme.colors.textMuted} />
            <Text style={styles.cardDetailText}>
              {when.toLocaleDateString("pt-BR", {
                weekday: "short",
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </Text>
          </View>
          <View style={styles.cardDetail}>
            <MaterialIcons name="access-time" size={16} color={theme.colors.textMuted} />
            <Text style={styles.cardDetailText}>
              {when.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
            </Text>
          </View>
          {item.service?.price && (
            <View style={styles.cardDetail}>
              <Text style={styles.cardPrice}>
                R$ {Number(item.service.price).toFixed(2)}
              </Text>
            </View>
          )}
        </View>
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
          <MaterialIcons name="arrow-back" size={24} color={theme.colors.foreground} />
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
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Carregando agendamentos...</Text>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
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
    color: theme.colors.foreground,
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
    ...theme.shadows.sm,
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
    backgroundColor: theme.colors.backgroundSecondary,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 16,
  },
  cardDetail: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  cardDetailText: {
    fontSize: 12,
    color: theme.colors.textMuted,
    fontWeight: "500",
  },
  cardPrice: {
    fontSize: 13,
    fontWeight: "700",
    color: theme.colors.primary,
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
