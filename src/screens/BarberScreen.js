import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Dimensions,
  FlatList,
  Animated,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { theme } from "../utils/theme";
import Card from "../components/ui/Card";
import Avatar from "../components/ui/Avatar";
import Button from "../components/ui/Button";
import SansCoinsDisplay from "../components/ui/SansCoinsDisplay";
import SectionHeader from "../components/ui/SectionHeader";
import Chip from "../components/ui/Chip";
import { promoBanners } from "../data/mockData";
import {
  getBalance,
  getProfessionals,
  getServices,
  getAvailability,
  createAppointment,
  getNextAppointment,
} from "../api/barberApi";
import { useAuth } from "../components/AuthProvider";
import AsyncStorage from "@react-native-async-storage/async-storage";

const { width } = Dimensions.get("window");
const BANNER_WIDTH = width - 48;

const BarberScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const scrollX = useRef(new Animated.Value(0)).current;
  const { isAuthenticated } = useAuth();
  const [currentUser, setCurrentUser] = useState({ name: "Sans Club", sansCoins: 0 });
  const [barbers, setBarbers] = useState([]);
  const [barberServices, setBarberServices] = useState([]);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [occupiedSlots, setOccupiedSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [nextAppointment, setNextAppointmentState] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [selectedBarber, setSelectedBarber] = useState(null);
  const [selectedService, setSelectedService] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [providerMap, setProviderMap] = useState({});

  useEffect(() => {
    loadInitialData();
  }, [isAuthenticated]);

  // Recarregar agendamento ao voltar para a tela
  useFocusEffect(
    useCallback(() => {
      if (isAuthenticated) {
        loadUserBalanceAndNext();
      }
      
      // Resetar seleções ao voltar para a tela (limpa o fluxo após sucesso ou cancelamento)
      setSelectedBarber(null);
      setSelectedService(null);
      setSelectedDate(null);
      setSelectedTime(null);
      setAvailableSlots([]);
    }, [isAuthenticated])
  );

  useEffect(() => {
    if (selectedBarber && selectedDate && selectedService) {
      fetchAvailability();
    } else {
      setAvailableSlots([]);
      setSelectedTime(null);
    }
  }, [selectedBarber, selectedDate, selectedService]);

  // Gerar próximos 7 dias
  const getNextDays = () => {
    const days = [];
    const today = new Date();
    let added = 0;
    let offset = 0;
    while (added < 7) {
      const date = new Date(today);
      date.setDate(today.getDate() + offset);
      const weekDayNumber = date.getDay();
      if (weekDayNumber !== 0) { // pula domingo
        days.push({
          id: added.toString(),
          date: date,
          day: date.getDate(),
          weekDay: date.toLocaleDateString("pt-BR", { weekday: "short" }).replace(".", ""),
          isToday: offset === 0,
        });
        added += 1;
      }
      offset += 1;
    }
    return days;
  };

  const nextDays = getNextDays();

  const loadInitialData = async () => {
    try {
      const storedName = await AsyncStorage.getItem("user_name");
      if (storedName) {
        setCurrentUser((prev) => ({ ...prev, name: storedName }));
      }
    } catch (err) {
      console.log("Erro ao recuperar nome do usuário", err.message);
    }

    await Promise.all([
      isAuthenticated ? loadUserBalanceAndNext() : Promise.resolve(),
      loadCatalog(),
    ]);
  };

  const loadUserBalanceAndNext = async () => {
    if (!isAuthenticated) {
      setCurrentUser((prev) => ({ ...prev, sansCoins: 0 }));
      setNextAppointmentState(null);
      return;
    }

    try {
      const balanceResp = await getBalance();
      const coins = balanceResp?.balance ?? balanceResp?.user?.user_coins_balance ?? 0;
      setCurrentUser((prev) => ({ ...prev, sansCoins: coins }));
    } catch (err) {
      console.log("Erro ao carregar saldo", err.message);
    }

    try {
      const appt = await getNextAppointment();
      if (appt) {
        setNextAppointmentState(formatAppointment(appt));
      } else {
        setNextAppointmentState(null);
      }
    } catch (err) {
      console.log("Erro ao carregar próximo agendamento", err.message);
    }
  };

  const loadCatalog = async () => {
    setLoading(true);
    try {
      const [pros, services] = await Promise.all([
        getProfessionals(),
        getServices(),
      ]);

      const mappedBarbers = (pros || []).map((p) => ({
        id: String(p.professional_id),
        professional_id: p.professional_id,
        name: p.name,
        avatar: p.avatar_url,
        specialty: p.bio || "Barbeiro",
        rating: p.rating || 5,
        status: "online",
      }));

      mappedBarbers.unshift({
        id: "any",
        professional_id: "any",
        name: "Qualquer Profissional",
        avatar: null,
        specialty: "",
        rating: null,
        status: "online",
      });

      const mappedServices = (services || []).map((s) => ({
        id: String(s.service_id),
        service_id: s.service_id,
        name: s.name,
        description: s.description || "",
        price: Number(s.price),
        duration: s.duration_min,
        reward_points: s.reward_points,
        icon: s.icon || "content-cut",
      }));

      setBarbers(mappedBarbers);
      setBarberServices(mappedServices);
    } catch (err) {
      console.log("Erro ao carregar catálogo", err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatAppointment = (appt) => {
    if (!appt || typeof appt !== "object" || Array.isArray(appt) || !appt.appointment_id) return null;
    const when = new Date(appt.scheduled_at);
    return {
      id: appt.appointment_id,
      barber: {
        name: appt.professional?.name || "",
        avatar: appt.professional?.avatar_url,
      },
      service: {
        name: appt.service?.name || "",
      },
      date: appt.scheduled_at,
      time: when.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
      status: appt.status,
    };
  };

  const formatDateParam = (dateObj) => {
    if (!dateObj) return null;
    const year = dateObj.getFullYear();
    const month = `${dateObj.getMonth() + 1}`.padStart(2, "0");
    const day = `${dateObj.getDate()}`.padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const fetchAvailability = async () => {
    if (!selectedBarber || !selectedDate || !selectedService) return;
    setLoadingSlots(true);
    try {
      const pId = selectedBarber.professional_id || selectedBarber.id;
      const response = await getAvailability({
        professionalId: pId === "any" ? "any" : Number(pId),
        date: formatDateParam(selectedDate.date),
        serviceId: Number(selectedService.service_id || selectedService.id),
      });

      const occupied = (response?.occupied_slots || []).map((time) => ({
        id: `occ-${time}`,
        time,
        available: false,
      }));
      const occupiedTimes = new Set(occupied.map((o) => o.time));

      const available = (response?.available_slots || [])
        .filter((time) => !occupiedTimes.has(time))
        .map((time) => ({
          id: time,
          time,
          available: true,
        }));

      setAvailableSlots([...available, ...occupied]);
      setOccupiedSlots(Array.from(occupiedTimes));
      setProviderMap(response?.provider_map || {});
    } catch (err) {
      console.log("Erro ao carregar disponibilidade", err.message);
      setAvailableSlots([]);
      setOccupiedSlots([]);
      setProviderMap({});
    } finally {
      setLoadingSlots(false);
    }
  };

  const handleConfirmAppointment = async () => {
    if (!selectedBarber || !selectedService || !selectedDate || !selectedTime) {
      return;
    }

    if (!isAuthenticated) {
      Alert.alert(
        "Login necessário",
        "Entre na sua conta para confirmar o agendamento.",
        [
          { text: "Cancelar", style: "cancel" },
          {
            text: "Fazer login",
            onPress: () => navigation.navigate("Login"),
          },
        ]
      );
      return;
    }

    setSubmitting(true);
    try {
      const [hour, minute] = selectedTime.time.split(":").map(Number);
      const hourStr = String(hour).padStart(2, "0");
      const minuteStr = String(minute).padStart(2, "0");
      
      // Corrigindo a construção da data: precisamos do formato YYYY-MM-DD
      const dateStr = formatDateParam(selectedDate.date);
      
      // Força o timezone do Brasil (-03:00) na string ISO para garantir que a API receba a conversão UTC correta,
      // independente se o celular/simulador estiver no fuso UTC ou outro.
      const scheduled = new Date(`${dateStr}T${hourStr}:${minuteStr}:00-03:00`);

      let finalProfessionalId = Number(selectedBarber.professional_id || selectedBarber.id);
      if (selectedBarber.id === "any") {
        finalProfessionalId = providerMap[selectedTime.time];
        if (!finalProfessionalId) {
          Alert.alert("Aviso", "Não foi possível alocar um barbeiro para este horário. Escolha outro horário ou recarregue a página.");
          setSubmitting(false);
          return;
        }
        finalProfessionalId = Number(finalProfessionalId);
      }

      const appointment = await createAppointment({
        professionalId: finalProfessionalId,
        serviceId: Number(selectedService.service_id || selectedService.id),
        scheduledAt: scheduled.toISOString(),
      });

      setNextAppointmentState(formatAppointment(appointment));
      await loadUserBalanceAndNext();

      // Aguarda um pequeno momento para garantir que a animação de carregamento seja percebida e que 
      // a navegação para o modal aconteça sem o spinner sumir repentinamente na tela de baixo.
      setTimeout(() => {
        navigation.navigate("AppointmentSuccess", { appointment });
        // Somente voltamos o estado de submissão para falso após a navegação ter sido iniciada
        setSubmitting(false);
      }, 600);
    } catch (err) {
      setSubmitting(false);
      Alert.alert(
        "Não foi possível agendar",
        "Tente outro horário ou fale com a barbearia."
      );
      console.log("Erro ao criar agendamento", err.message);
    } 
  };

  const renderBanner = ({ item, index }) => {
    const inputRange = [
      (index - 1) * BANNER_WIDTH,
      index * BANNER_WIDTH,
      (index + 1) * BANNER_WIDTH,
    ];
    const scale = scrollX.interpolate({
      inputRange,
      outputRange: [0.95, 1, 0.95],
      extrapolate: "clamp",
    });

    return (
      <Animated.View style={[styles.bannerContainer, { transform: [{ scale }] }]}>
        <Image source={{ uri: item.image }} style={styles.bannerImage} />
        <View style={[styles.bannerOverlay, { backgroundColor: item.color + "CC" }]}>
          <Text style={styles.bannerTitle}>{item.title}</Text>
          <Text style={styles.bannerSubtitle}>{item.subtitle}</Text>
        </View>
      </Animated.View>
    );
  };

  const renderBarber = ({ item }) => {
    const isAny = item.id === "any";
    const isSelected = selectedBarber?.id === item.id;
    return (
      <TouchableOpacity
        style={[
          styles.barberCard,
          isSelected && styles.barberCardSelected,
        ]}
        onPress={() => {
          setSelectedBarber(item);
          setSelectedTime(null);
        }}
        activeOpacity={0.7}
      >
        {isAny ? (
          <View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: theme.colors.primary + "20", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
            <MaterialIcons name="search" size={32} color={theme.colors.primary} />
          </View>
        ) : (
          <Avatar
            source={item.avatar}
            size="lg"
            status={item.status}
            showStatus
          />
        )}
        <Text style={[styles.barberName, isAny && { color: theme.colors.primary, fontWeight: "bold" }]}>{item.name}</Text>
        {item.specialty ? <Text style={styles.barberSpecialty}>{item.specialty}</Text> : null}
        
        {!isAny && (
          <View style={styles.barberRating}>
            <MaterialIcons name="star" size={14} color="#FFD700" />
            <Text style={styles.ratingText}>{item.rating}</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const renderService = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.serviceCard,
        selectedService?.id === item.id && styles.serviceCardSelected,
        item.highlight && styles.serviceCardHighlight,
      ]}
      onPress={() => {
        setSelectedService(item);
        setSelectedTime(null);
      }}
      activeOpacity={0.7}
    >
      <View style={styles.serviceHeader}>
        <View style={[
          styles.serviceIconContainer,
          selectedService?.id === item.id && styles.serviceIconSelected,
        ]}>
          <MaterialIcons
            name={item.icon}
            size={24}
            color={selectedService?.id === item.id ? "#FFF" : theme.colors.primary}
          />
        </View>
        {item.highlight && (
          <View style={styles.highlightBadge}>
            <Text style={styles.highlightText}>Popular</Text>
          </View>
        )}
      </View>
      <Text style={styles.serviceName}>{item.name}</Text>
      <Text style={styles.serviceDescription}>{item.description}</Text>
      <View style={styles.servicePricing}>
        <Text style={styles.servicePrice}>R$ {Number(item.price || 0).toFixed(2)}</Text>
        <Text style={styles.serviceDuration}>{item.duration} min</Text>
      </View>
    </TouchableOpacity>
  );

  const renderDateChip = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.dateChip,
        selectedDate?.id === item.id && styles.dateChipSelected,
      ]}
      onPress={() => setSelectedDate(item)}
    >
      <Text style={[
        styles.dateWeekDay,
        selectedDate?.id === item.id && styles.dateTextSelected,
      ]}>
        {item.weekDay.toUpperCase()}
      </Text>
      <Text style={[
        styles.dateDay,
        selectedDate?.id === item.id && styles.dateTextSelected,
      ]}>
        {item.day}
      </Text>
      {item.isToday && (
        <View style={[
          styles.todayDot,
          selectedDate?.id === item.id && styles.todayDotSelected,
        ]} />
      )}
    </TouchableOpacity>
  );

  const renderTimeSlot = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.timeSlot,
        selectedTime?.id === item.id && styles.timeSlotSelected,
        !item.available && styles.timeSlotDisabled,
      ]}
      onPress={() => item.available && setSelectedTime(item)}
      disabled={!item.available}
    >
      <Text style={[
        styles.timeText,
        selectedTime?.id === item.id && styles.timeTextSelected,
        !item.available && styles.timeTextDisabled,
      ]}>
        {item.time}
      </Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={[styles.container, { paddingTop: insets.top, justifyContent: "center", alignItems: "center" }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={{ marginTop: 12, color: theme.colors.textMuted }}>Carregando barbearia...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Olá, {currentUser.name || "Sans Club"} 👋</Text>
            <Text style={styles.subGreeting}>Pronto para um novo visual?</Text>
          </View>
          <View style={styles.headerRight}>
            <Card style={styles.coinsCard} padding="sm">
              <SansCoinsDisplay amount={currentUser.sansCoins} size="md" />
            </Card>
          </View>
        </View>

        {/* Próximo Agendamento */}
        <Card style={styles.appointmentCard}>
          {nextAppointment ? (
            <>
              <View style={styles.appointmentHeader}>
                <View style={styles.appointmentIconBadge}>
                  <MaterialIcons name="event" size={18} color="#FFF" />
                </View>
                <Text style={styles.appointmentLabel}>Próximo Agendamento</Text>
                <View style={styles.appointmentStatusBadge}>
                  <View style={styles.appointmentStatusDot} />
                  <Text style={styles.appointmentStatusText}>Confirmado</Text>
                </View>
              </View>
              <View style={styles.appointmentContent}>
                <Avatar source={nextAppointment.barber.avatar} size="md" name={nextAppointment.barber.name} />
                <View style={styles.appointmentInfo}>
                  <Text style={styles.appointmentService}>
                    {nextAppointment.service.name}
                  </Text>
                  <Text style={styles.appointmentBarber}>
                    com {nextAppointment.barber.name}
                  </Text>
                </View>
              </View>
              <View style={styles.appointmentTimeRow}>
                <MaterialIcons name="access-time" size={16} color={theme.colors.primary} />
                <Text style={styles.appointmentTime}>
                  {new Date(nextAppointment.date).toLocaleDateString("pt-BR", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                  })} às {nextAppointment.time}
                </Text>
              </View>
            </>
          ) : (
            <>
              <View style={styles.appointmentHeader}>
                <View style={[styles.appointmentIconBadge, { backgroundColor: theme.colors.coins }]}>
                  <MaterialIcons name="event-available" size={18} color="#FFF" />
                </View>
                <Text style={styles.appointmentLabel}>Agende agora</Text>
              </View>
              <View style={styles.noAppointmentContent}>
                <Text style={styles.noAppointmentTitle}>Sem agendamentos futuros</Text>
                <Text style={styles.noAppointmentText}>
                  Marque seu próximo horário e ganhe Sans Coins extras na conclusão.
                </Text>
              </View>
            </>
          )}
        </Card>

        {/* Banners Promocionais */}
        <View style={styles.bannersSection}>
          <Animated.FlatList
            data={promoBanners}
            renderItem={renderBanner}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            pagingEnabled
            snapToInterval={BANNER_WIDTH + 16}
            decelerationRate="fast"
            contentContainerStyle={styles.bannerList}
            onScroll={Animated.event(
              [{ nativeEvent: { contentOffset: { x: scrollX } } }],
              { useNativeDriver: true }
            )}
          />
          {/* Indicadores */}
          <View style={styles.indicators}>
            {promoBanners.map((_, index) => {
              const inputRange = [
                (index - 1) * BANNER_WIDTH,
                index * BANNER_WIDTH,
                (index + 1) * BANNER_WIDTH,
              ];
              const opacity = scrollX.interpolate({
                inputRange,
                outputRange: [0.3, 1, 0.3],
                extrapolate: "clamp",
              });
              return (
                <Animated.View
                  key={index}
                  style={[styles.indicator, { opacity }]}
                />
              );
            })}
          </View>
        </View>

        {/* Escolha seu Barbeiro */}
        <SectionHeader
          title="Escolha seu Barbeiro"
          subtitle="Profissionais disponíveis"
          style={styles.sectionHeader}
        />
        <FlatList
          data={barbers}
          renderItem={renderBarber}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.barbersList}
        />

        {/* Serviços */}
        <SectionHeader
          title="Serviços"
          subtitle="O que você precisa hoje?"
          style={styles.sectionHeader}
        />
        <FlatList
          data={barberServices}
          renderItem={renderService}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.servicesList}
        />

        {/* Calendário */}
        {selectedBarber && selectedService && (
          <View>
            <SectionHeader
              title="Data"
              subtitle="Selecione o melhor dia"
              style={styles.sectionHeader}
            />
            <FlatList
              data={nextDays}
              renderItem={renderDateChip}
              keyExtractor={(item) => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.datesList}
            />
          </View>
        )}

        {/* Horários */}
        {selectedBarber && selectedService && selectedDate && (
          <>
            <SectionHeader
              title="Horário"
              subtitle="Horários disponíveis"
              style={styles.sectionHeader}
            />
            {loadingSlots ? (
              <View style={{ paddingVertical: 16 }}>
                <ActivityIndicator color={theme.colors.primary} />
              </View>
            ) : availableSlots.length === 0 ? (
              <Text style={{ paddingHorizontal: 24, color: theme.colors.textMuted }}>
                Nenhum horário disponível para este dia.
              </Text>
            ) : (
              <View style={styles.timeSlotsGrid}>
                {availableSlots.map((slot) => (
                  <TouchableOpacity
                    key={slot.id}
                    style={[
                      styles.timeSlot,
                      selectedTime?.id === slot.id && styles.timeSlotSelected,
                      !slot.available && styles.timeSlotDisabled,
                    ]}
                    onPress={() => slot.available && setSelectedTime(slot)}
                    disabled={!slot.available}
                  >
                    <Text style={[
                      styles.timeText,
                      selectedTime?.id === slot.id && styles.timeTextSelected,
                      !slot.available && styles.timeTextDisabled,
                    ]}>
                      {slot.time}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </>
        )}

        {/* Espaço para o botão fixo */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Botão Confirmar Fixo */}
      {selectedBarber && selectedService && selectedDate && selectedTime && (
        <View style={[styles.confirmButtonContainer, { paddingBottom: insets.bottom + 16 }]}>
          <Button
            title={isAuthenticated ? "Confirmar Agendamento" : "Entrar para agendar"}
            onPress={isAuthenticated ? handleConfirmAppointment : () => navigation.navigate("Login")}
            fullWidth
            size="lg"
            loading={submitting}
            icon={<MaterialIcons name={isAuthenticated ? "check-circle" : "login"} size={20} color="#FFF" />}
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  greeting: {
    fontSize: 24,
    fontWeight: "700",
    color: theme.colors.textPrimary,
  },
  subGreeting: {
    fontSize: 14,
    color: theme.colors.textMuted,
    marginTop: 2,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  coinsCard: {
    backgroundColor: theme.colors.coinsBackground,
  },
  // Appointment Card
  appointmentCard: {
    marginHorizontal: 24,
    marginBottom: 16,
    backgroundColor: theme.colors.primaryLight + "12",
    borderWidth: 1,
    borderColor: theme.colors.primaryLight + "25",
  },
  appointmentHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
  },
  appointmentIconBadge: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: theme.colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  appointmentLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: theme.colors.textPrimary,
    marginLeft: 10,
    flex: 1,
  },
  appointmentStatusBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.successLight,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  appointmentStatusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: theme.colors.success,
    marginRight: 5,
  },
  appointmentStatusText: {
    fontSize: 11,
    fontWeight: "600",
    color: theme.colors.success,
  },
  appointmentContent: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  appointmentInfo: {
    marginLeft: 12,
    flex: 1,
  },
  appointmentService: {
    fontSize: 16,
    fontWeight: "600",
    color: theme.colors.textPrimary,
  },
  appointmentBarber: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  appointmentTimeRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.background,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
  },
  appointmentTime: {
    fontSize: 13,
    color: theme.colors.primary,
    marginLeft: 8,
    fontWeight: "600",
  },
  noAppointmentContent: {
    paddingTop: 2,
  },
  noAppointmentTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: theme.colors.textPrimary,
    marginBottom: 4,
  },
  noAppointmentText: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    lineHeight: 18,
  },
  // Banners
  bannersSection: {
    marginBottom: 32,
  },
  bannerList: {
    paddingHorizontal: 24,
  },
  bannerContainer: {
    width: BANNER_WIDTH,
    height: 160,
    marginRight: 16,
    borderRadius: theme.borderRadius.lg,
    overflow: "hidden",
  },
  bannerImage: {
    width: "100%",
    height: "100%",
  },
  bannerOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "flex-end",
    padding: 20,
  },
  bannerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#FFF",
  },
  bannerSubtitle: {
    fontSize: 14,
    color: "rgba(255,255,255,0.9)",
    marginTop: 4,
  },
  indicators: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 12,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.primary,
    marginHorizontal: 4,
  },
  // Section
  sectionHeader: {
    paddingHorizontal: 24,
    marginTop: 24,
    marginBottom: 16,
  },
  // Barbers
  barbersList: {
    paddingHorizontal: 24,
  },
  barberCard: {
    alignItems: "center",
    padding: 16,
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.lg,
    marginRight: 12,
    width: 120,
    ...theme.shadows.sm,
    borderWidth: 2,
    borderColor: "transparent",
  },
  barberCardSelected: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primaryLight + "10",
  },
  barberName: {
    fontSize: 14,
    fontWeight: "600",
    color: theme.colors.textPrimary,
    marginTop: 10,
  },
  barberSpecialty: {
    fontSize: 11,
    color: theme.colors.textMuted,
    marginTop: 2,
    textAlign: "center",
  },
  barberRating: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: "600",
    color: theme.colors.textSecondary,
    marginLeft: 4,
  },
  // Services
  servicesList: {
    paddingHorizontal: 24,
  },
  serviceCard: {
    padding: 16,
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.lg,
    marginRight: 12,
    width: 160,
    ...theme.shadows.sm,
    borderWidth: 2,
    borderColor: "transparent",
  },
  serviceCardSelected: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primaryLight + "10",
  },
  serviceCardHighlight: {
    borderColor: theme.colors.primary + "40",
  },
  serviceHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  serviceIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: theme.colors.primaryLight + "20",
    alignItems: "center",
    justifyContent: "center",
  },
  serviceIconSelected: {
    backgroundColor: theme.colors.primary,
  },
  highlightBadge: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  highlightText: {
    fontSize: 10,
    fontWeight: "600",
    color: "#FFF",
  },
  serviceName: {
    fontSize: 15,
    fontWeight: "600",
    color: theme.colors.textPrimary,
  },
  serviceDescription: {
    fontSize: 12,
    color: theme.colors.textMuted,
    marginTop: 4,
  },
  servicePricing: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 12,
  },
  servicePrice: {
    fontSize: 16,
    fontWeight: "700",
    color: theme.colors.primary,
  },
  serviceDuration: {
    fontSize: 12,
    color: theme.colors.textMuted,
  },
  // Dates
  datesList: {
    paddingHorizontal: 24,
  },
  dateChip: {
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: theme.colors.secondary,
    borderRadius: theme.borderRadius.lg,
    marginRight: 10,
    minWidth: 60,
  },
  dateChipSelected: {
    backgroundColor: theme.colors.primary,
  },
  dateWeekDay: {
    fontSize: 11,
    fontWeight: "600",
    color: theme.colors.textMuted,
  },
  dateDay: {
    fontSize: 18,
    fontWeight: "700",
    color: theme.colors.textPrimary,
    marginTop: 4,
  },
  dateTextSelected: {
    color: "#FFF",
  },
  todayDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: theme.colors.primary,
    marginTop: 6,
  },
  todayDotSelected: {
    backgroundColor: "#FFF",
  },
  // Time Slots
  timeSlotsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 24,
    gap: 10,
  },
  timeSlot: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: theme.colors.secondary,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: "transparent",
  },
  timeSlotSelected: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  timeSlotDisabled: {
    backgroundColor: theme.colors.backgroundSecondary,
    opacity: 0.5,
  },
  timeText: {
    fontSize: 14,
    fontWeight: "600",
    color: theme.colors.textSecondary,
  },
  timeTextSelected: {
    color: "#FFF",
  },
  timeTextDisabled: {
    color: theme.colors.textMuted,
  },
  // Confirm Button
  confirmButtonContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: theme.colors.background,
    paddingHorizontal: 24,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: theme.colors.borderLight,
  },
});

export default BarberScreen;
