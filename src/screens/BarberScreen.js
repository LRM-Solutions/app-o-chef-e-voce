import React, { useState, useRef, useEffect, useCallback } from "react";
import CoinIcon from "../components/ui/CoinIcon";
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
  RefreshControl,
  Linking,
} from "react-native";
import { BlurView } from "expo-blur";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { theme } from "../utils/theme";
import { useTheme } from "../utils/ThemeContext";
import Card from "../components/ui/Card";
import Avatar from "../components/ui/Avatar";
import Button from "../components/ui/Button";
import SansCoinsDisplay from "../components/ui/SansCoinsDisplay";
import SectionHeader from "../components/ui/SectionHeader";
import Chip from "../components/ui/Chip";
// mockData removido

import {
  getPrizes,
  getBalance,
  getProfile,
  getProfessionals,
  getServices,
  getAvailability,
  createAppointment,
  getNextAppointment,
  cancelMyAppointment,
  getBanners,
} from "../api/barberApi";
import { useAuth } from "../components/AuthProvider";
import AsyncStorage from "@react-native-async-storage/async-storage";

const { width } = Dimensions.get("window");

const BarberScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { theme, isDarkMode } = useTheme();
  const BANNER_WIDTH = theme.isTablet ? width - 80 : width - 48;
  const styles = getStyles(theme);
  const scrollX = useRef(new Animated.Value(0)).current;
  const { isAuthenticated } = useAuth();
  const [currentUser, setCurrentUser] = useState({
    name: "Sans Company",
    sansCoins: 0,
    clubeSans: false,
  });
  const [barbers, setBarbers] = useState([]);
  const [barberServices, setBarberServices] = useState([]);
  const [prizes, setPrizes] = useState([]);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [occupiedSlots, setOccupiedSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [nextAppointment, setNextAppointmentState] = useState(null);
  const [banners, setBanners] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [selectedBarber, setSelectedBarber] = useState(null);
  const [selectedService, setSelectedService] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [providerMap, setProviderMap] = useState({});
  const [refreshing, setRefreshing] = useState(false);
  const scrollViewRef = useRef(null);

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

      // Resetar scroll
      if (scrollViewRef.current) {
        scrollViewRef.current.scrollTo({ y: 0, animated: false });
      }
    }, [isAuthenticated]),
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
      if (weekDayNumber !== 0) {
        // pula domingo
        days.push({
          id: added.toString(),
          date: date,
          day: date.getDate(),
          weekDay: date
            .toLocaleDateString("pt-BR", { weekday: "short" })
            .replace(".", ""),
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
    } catch (err) {}

    await Promise.all([
      isAuthenticated ? loadUserBalanceAndNext() : Promise.resolve(),
      loadCatalog(),
      loadBanners(),
    ]);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadInitialData();
    setRefreshing(false);
  };

  const loadUserBalanceAndNext = async () => {
    if (!isAuthenticated) {
      setCurrentUser((prev) => ({ ...prev, sansCoins: 0 }));
      setNextAppointmentState(null);
      return;
    }

    try {
      // Get profile returns full user data
      const user = await getProfile();
      const coins = user?.user_coins_balance ?? 0;
      setCurrentUser((prev) => ({
        ...prev,
        sansCoins: coins,
        clubeSans: user?.clube_sans || false,
      }));
    } catch (err) {}

    try {
      const appt = await getNextAppointment();
      if (appt) {
        setNextAppointmentState(formatAppointment(appt));
      } else {
        setNextAppointmentState(null);
      }
    } catch (err) {}
  };

  const loadBanners = async () => {
    try {
      const data = await getBanners();
      setBanners(data || []);
    } catch (err) {
      setBanners([]);
    }
  };

  const loadCatalog = async () => {
    setLoading(true);
    try {
      const [pros, services, fetchedPrizes] = await Promise.all([
        getProfessionals(),
        getServices(),
        getPrizes().catch(() => []),
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

      const mappedPrizes = (fetchedPrizes || []).map((p, index) => {
        const colors = ["#8b5cf6", "#10b981", "#f59e0b", "#ec4899", "#3b82f6"];
        return {
          id: String(p.prize_id),
          prize_id: p.prize_id,
          name: p.name,
          coins: p.coins_cost,
          icon_url: p.icon_url,
          color: colors[index % colors.length],
        };
      });
      setPrizes(mappedPrizes);
    } catch (err) {
      Toast.show({
        type: "error",
        text1: "Erro de Conexão",
        text2: err.message || "Falha na rede. Verifique sua conexão com a internet.",
      });
      setBarbers([]);
      setBarberServices([]);
      setPrizes([]);
    } finally {
      setLoading(false);
    }
  };

  const formatAppointment = (appt) => {
    if (
      !appt ||
      typeof appt !== "object" ||
      Array.isArray(appt) ||
      !appt.appointment_id
    )
      return null;

    // Forçar interpretação como UTC para evitar o offset de 3h do fuso local
    const dateStr = appt.scheduled_at.replace(" ", "T");
    const when = new Date(dateStr.endsWith("Z") ? dateStr : dateStr + "Z");

    // Obter partes UTC manuais
    const h = String(when.getUTCHours()).padStart(2, "0");
    const m = String(when.getUTCMinutes()).padStart(2, "0");

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
      dateObj: when,
      time: `${h}:${m}`,
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
        ],
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

      let finalProfessionalId = Number(
        selectedBarber.professional_id || selectedBarber.id,
      );
      if (selectedBarber.id === "any") {
        finalProfessionalId = providerMap[selectedTime.time];
        if (!finalProfessionalId) {
          Alert.alert(
            "Aviso",
            "Não foi possível alocar um barbeiro para este horário. Escolha outro horário ou recarregue a página.",
          );
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
        // Volta o scroll para o topo para que, ao fechar o modal, a tela esteja na posição correta
        scrollViewRef.current?.scrollTo({ y: 0, animated: true });
      }, 600);
    } catch (err) {
      setSubmitting(false);
      Alert.alert(
        "Não foi possível agendar",
        "Tente outro horário ou fale com a barbearia.",
      );
    }
  };

  const handleCancelAppointment = async () => {
    if (!nextAppointment) return;

    Alert.alert(
      "Cancelar Agendamento",
      "Tem certeza que deseja cancelar seu próximo horário?",
      [
        { text: "Não", style: "cancel" },
        {
          text: "Sim, Cancelar",
          style: "destructive",
          onPress: async () => {
            try {
              setSubmitting(true);
              await cancelMyAppointment(nextAppointment.id);
              await loadUserBalanceAndNext();
              Alert.alert(
                "Cancelado",
                "Seu agendamento foi cancelado com sucesso.",
              );
            } catch (err) {
              Alert.alert("Erro", "Não foi possível cancelar o agendamento.");
            } finally {
              setSubmitting(false);
            }
          },
        },
      ],
    );
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
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => {
          if (item.redirect_url) {
            Linking.openURL(item.redirect_url).catch(() => {
              Alert.alert("Erro", "Não foi possível abrir o link.");
            });
          }
        }}
        style={[styles.bannerContainer, { transform: [{ scale }] }]}
      >
        <Image
          source={{ uri: item.image_url }}
          style={styles.bannerImage}
          resizeMode="cover"
        />
        {/* Remover overlay de texto para banners profissionais que já vêm com arte */}
      </TouchableOpacity>
    );
  };

  const renderBarber = ({ item }) => {
    const isAny = item.id === "any";
    const isSelected = selectedBarber?.id === item.id;
    return (
      <TouchableOpacity
        style={[styles.barberCard, isSelected && styles.barberCardSelected]}
        onPress={() => {
          setSelectedBarber(item);
          setSelectedTime(null);
          setTimeout(() => {
            scrollViewRef.current?.scrollToEnd({ animated: true });
          }, 200);
        }}
        activeOpacity={0.7}
      >
        {isAny ? (
          <View
            style={{
              width: 64,
              height: 64,
              borderRadius: 32,
              backgroundColor: theme.colors.primary + "20",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 16,
            }}
          >
            <MaterialIcons
              name="search"
              size={32}
              color={theme.colors.primary}
            />
          </View>
        ) : (
          <Avatar
            source={item.avatar}
            size="lg"
            status={item.status}
            showStatus
          />
        )}
        <Text
          style={[
            styles.barberName,
            isAny && { color: theme.colors.primary, fontWeight: "bold" },
          ]}
        >
          {item.name}
        </Text>
        {item.specialty ? (
          <Text style={styles.barberSpecialty}>{item.specialty}</Text>
        ) : null}

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
        setTimeout(() => {
          scrollViewRef.current?.scrollToEnd({ animated: true });
        }, 200);
      }}
      activeOpacity={0.7}
    >
      {currentUser?.clubeSans && item.reward_points > 0 && (
        <View style={styles.serviceRewardBadge}>
          <CoinIcon size={12} />
          <Text style={styles.serviceRewardText}>+{item.reward_points}</Text>
        </View>
      )}
      <View style={styles.serviceHeader}>
        <View
          style={[
            styles.serviceIconContainer,
            selectedService?.id === item.id && styles.serviceIconSelected,
          ]}
        >
          <MaterialIcons
            name={item.icon}
            size={24}
            color={
              selectedService?.id === item.id ? "#FFF" : theme.colors.primary
            }
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
        <Text style={styles.servicePrice}>
          R$ {Number(item.price || 0).toFixed(2)}
        </Text>
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
      onPress={() => {
        setSelectedDate(item);
        setSelectedTime(null);
        setTimeout(() => {
          scrollViewRef.current?.scrollToEnd({ animated: true });
        }, 200);
      }}
    >
      <Text
        style={[
          styles.dateWeekDay,
          selectedDate?.id === item.id && styles.dateTextSelected,
        ]}
      >
        {item.weekDay.toUpperCase()}
      </Text>
      <Text
        style={[
          styles.dateDay,
          selectedDate?.id === item.id && styles.dateTextSelected,
        ]}
      >
        {item.day}
      </Text>
      {item.isToday && (
        <View
          style={[
            styles.todayDot,
            selectedDate?.id === item.id && styles.todayDotSelected,
          ]}
        />
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
      <Text
        style={[
          styles.timeText,
          selectedTime?.id === item.id && styles.timeTextSelected,
          !item.available && styles.timeTextDisabled,
        ]}
      >
        {item.time}
      </Text>
    </TouchableOpacity>
  );

  const handlePrizePress = (item) => {
    if (!isAuthenticated) {
      Alert.alert(
        "Login necessário",
        "Entre na sua conta para resgatar prêmios.",
        [
          { text: "Cancelar", style: "cancel" },
          {
            text: "Fazer login",
            onPress: () => navigation.navigate("Login"),
          },
        ],
      );
      return;
    }
    if (!currentUser.clubeSans) {
      Alert.alert(
        "Clube Sans",
        "Apenas membros do Clube Sans podem resgatar prêmios incríveis!",
      );
      return;
    }
    if (currentUser.sansCoins < item.coins) {
      Alert.alert(
        "Saldo Insuficiente",
        `Você precisa de ${item.coins} Sans Coins para resgatar este prêmio.`,
      );
      return;
    }
    navigation.navigate("PrizeScanner", { prize: item });
  };

  const renderPrize = ({ item }) => {
    const insufficientCoins =
      (currentUser?.sansCoins || 0) < (item.coins_cost || item.coins);

    return (
      <TouchableOpacity
        style={[
          styles.prizeCard,
          {
            borderColor: insufficientCoins
              ? theme.isDarkMode
                ? theme.colors.borderLight
                : "#F0F0F0"
              : item.color + "40",
          },
          insufficientCoins && styles.prizeCardDisabled,
        ]}
        activeOpacity={insufficientCoins ? 0.6 : 0.8}
        onPress={() => handlePrizePress(item)}
      >
        <View
          style={[
            styles.prizeIconContainer,
            {
              backgroundColor: insufficientCoins
                ? theme.isDarkMode
                  ? theme.colors.backgroundSecondary
                  : "#F5F5F5"
                : item.color + "15",
            },
          ]}
        >
          {item.icon_url ? (
            <Image
              source={{ uri: item.icon_url }}
              style={[
                { width: 32, height: 32, borderRadius: 8 },
                insufficientCoins && { opacity: 0.3, grayscale: 1 },
              ]}
            />
          ) : (
            <MaterialIcons
              name="redeem"
              size={32}
              color={
                insufficientCoins ? "#CCC" : item.color || theme.colors.primary
              }
            />
          )}
        </View>
        <View
          style={{
            alignItems: "center",
            width: "100%",
            flex: 1,
            justifyContent: "flex-end",
          }}
        >
          <View style={{ height: 40, justifyContent: "center", width: "100%" }}>
            <Text
              style={[
                styles.prizeName,
                insufficientCoins && { color: "#9E9E9E" },
              ]}
              numberOfLines={2}
            >
              {item.name}
            </Text>
          </View>
          <View
            style={[
              styles.prizeCoinsRow,
              insufficientCoins && {
                backgroundColor: theme.isDarkMode
                  ? theme.colors.muted
                  : "#F0F0F0",
                borderColor: theme.isDarkMode ? theme.colors.border : "#E0E0E0",
              },
            ]}
          >
            <CoinIcon
              size={14}
              style={[
                { marginRight: 4 },
                insufficientCoins && { opacity: 0.4 },
              ]}
            />
            <Text
              style={[
                styles.prizeCoinsText,
                {
                  color: insufficientCoins
                    ? theme.colors.textMuted
                    : theme.colors.textPrimary,
                },
              ]}
            >
              {item.coins_cost || item.coins}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View
        style={[
          styles.container,
          {
            paddingTop: insets.top,
            justifyContent: "center",
            alignItems: "center",
          },
        ]}
      >
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={{ marginTop: 12, color: theme.colors.textMuted }}>
          Carregando barbearia...
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView
        ref={scrollViewRef}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        scrollEnabled={true}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[theme.colors.primary]}
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.greeting}>
              Olá, {isAuthenticated ? currentUser.name || "Sans Company" : "Visitante"} 👋
            </Text>
            <Text style={styles.subGreeting}>Pronto para um novo visual?</Text>
          </View>
          <View style={styles.headerRight}>
            {isAuthenticated ? (
              <Card style={styles.coinsCard} padding="sm">
                <SansCoinsDisplay amount={currentUser.sansCoins} size="md" />
              </Card>
            ) : (
              <TouchableOpacity
                style={styles.headerLoginBtn}
                activeOpacity={0.8}
                onPress={() => navigation.navigate("Login")}
              >
                <Text style={styles.headerLoginBtnText}>ENTRAR</Text>
                <MaterialIcons
                  name="login"
                  size={16}
                  color="#FFF"
                  style={{ marginLeft: 6 }}
                />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Banners Promocionais */}
        {banners.length > 0 && (
          <View style={[styles.bannersSection, { marginBottom: 0 }]}>
            <Animated.FlatList
              data={banners}
              renderItem={renderBanner}
              keyExtractor={(item) => String(item.banner_id || item.id)}
              horizontal
              showsHorizontalScrollIndicator={false}
              pagingEnabled
              snapToInterval={BANNER_WIDTH + 16}
              decelerationRate="fast"
              contentContainerStyle={styles.bannerList}
              onScroll={Animated.event(
                [{ nativeEvent: { contentOffset: { x: scrollX } } }],
                { useNativeDriver: true },
              )}
            />
            {/* Indicadores */}
            <View style={styles.indicators}>
              {banners.map((_, index) => {
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
        )}

        {/* Bloco de Prêmios */}
        <View>
          <SectionHeader
            title="Clube de Recompensas"
            subtitle="Troque seus Sans Coins"
            style={styles.sectionHeader}
          />
          <View style={styles.prizesContainer}>
            <FlatList
              data={
                prizes.length > 0
                  ? prizes
                  : [
                      {
                        id: "dl1",
                        name: "Sobrancelha",
                        coins: 150,
                        color: "#8b5cf6",
                      },
                      {
                        id: "dl2",
                        name: "Barba VIP",
                        coins: 400,
                        color: "#f59e0b",
                      },
                    ]
              }
              renderItem={renderPrize}
              keyExtractor={(item) => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.prizesList}
            />
            {(!isAuthenticated || !currentUser.clubeSans) && (
              <View style={styles.clubeOverlay}>
                <BlurView
                  intensity={10}
                  tint="light"
                  style={styles.blurContainer}
                />
                <View style={styles.clubeOverlayContent}>
                  <View style={styles.clubeLockCircle}>
                    <MaterialIcons
                      name="lock"
                      size={32}
                      color={theme.colors.primary}
                    />
                  </View>
                  <Text style={styles.clubeOverlayTitle}>Clube Sans</Text>
                  <Text style={styles.clubeOverlayText}>
                    Resgate prêmios exclusivos sendo membro.
                  </Text>
                  <TouchableOpacity
                    style={styles.clubeCTAButton}
                    onPress={() => {
                      if (!isAuthenticated) {
                        navigation.navigate("Login");
                        return;
                      }
                      const message = encodeURIComponent(
                        "Olá! Gostaria de saber mais sobre como fazer parte do Clube Sans e ter acesso aos prêmios exclusivos!",
                      );
                      Linking.openURL(
                        `whatsapp://send?phone=5541997355454&text=${message}`,
                      );
                    }}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.clubeCTAButtonText}>
                      {isAuthenticated
                        ? "QUERO SER CLUBE SANS"
                        : "ENTRAR PARA PARTICIPAR"}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        </View>

        {nextAppointment ? (
          <View style={styles.sectionContainer}>
            <SectionHeader
              title="Seu Próximo Horário"
              subtitle="Tudo pronto para recebê-lo"
              style={styles.sectionHeader}
            />
            <Card style={styles.appointmentCard}>
              <View style={styles.appointmentHeader}>
                <View
                  style={[
                    styles.appointmentIconBadge,
                    { backgroundColor: theme.colors.success },
                  ]}
                >
                  <MaterialIcons
                    name="event-available"
                    size={18}
                    color="#FFF"
                  />
                </View>
                <Text style={styles.appointmentLabel}>
                  Agendamento Confirmado
                </Text>
                <View style={styles.appointmentStatusBadge}>
                  <View style={styles.appointmentStatusDot} />
                  <Text style={styles.appointmentStatusText}>Confirmado</Text>
                </View>
              </View>
              <View style={styles.appointmentContent}>
                <Avatar
                  source={nextAppointment.barber.avatar}
                  size="md"
                  name={nextAppointment.barber.name}
                />
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
                <MaterialIcons
                  name="access-time"
                  size={16}
                  color={theme.colors.primary}
                />
                <Text style={styles.appointmentTime}>
                  {nextAppointment.dateObj
                    ? nextAppointment.dateObj.toLocaleDateString("pt-BR", {
                        weekday: "long",
                        day: "numeric",
                        month: "long",
                        timeZone: "UTC",
                      })
                    : ""}{" "}
                  às {nextAppointment.time}
                </Text>
              </View>
            </Card>
            <View style={{ paddingHorizontal: 24 }}>
              <Button
                title="Cancelar Agendamento"
                variant="outline"
                size="sm"
                onPress={handleCancelAppointment}
                loading={submitting}
                style={{ borderColor: theme.colors.destructive, marginTop: -8 }}
                textStyle={{ color: theme.colors.destructive }}
              />
            </View>
          </View>
        ) : (
          <View style={styles.sectionContainer}>
            {/* Escolha seu Barbeiro */}
            <SectionHeader
              title="Agende seu horário"
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
            {selectedBarber && (
              <>
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
              </>
            )}

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
                  <Text
                    style={{
                      paddingHorizontal: 24,
                      color: theme.colors.textMuted,
                    }}
                  >
                    Nenhum horário disponível para este dia.
                  </Text>
                ) : (
                  <View style={styles.timeSlotsGrid}>
                    {availableSlots.map((slot) => (
                      <TouchableOpacity
                        key={slot.id}
                        style={[
                          styles.timeSlot,
                          selectedTime?.id === slot.id &&
                            styles.timeSlotSelected,
                          !slot.available && styles.timeSlotDisabled,
                        ]}
                        onPress={() => slot.available && setSelectedTime(slot)}
                        disabled={!slot.available}
                      >
                        <Text
                          style={[
                            styles.timeText,
                            selectedTime?.id === slot.id &&
                              styles.timeTextSelected,
                            !slot.available && styles.timeTextDisabled,
                          ]}
                        >
                          {slot.time}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </>
            )}
          </View>
        )}

        {/* Espaço para o botão fixo */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Botão Confirmar Fixo */}
      {selectedBarber && selectedService && selectedDate && selectedTime && (
        <View
          style={[
            styles.confirmButtonContainer,
            { paddingBottom: insets.bottom + 16 },
          ]}
        >
          <Button
            title={
              isAuthenticated ? "Confirmar Agendamento" : "Entrar para agendar"
            }
            onPress={
              isAuthenticated
                ? handleConfirmAppointment
                : () => navigation.navigate("Login")
            }
            fullWidth
            size="lg"
            loading={submitting}
            icon={
              <MaterialIcons
                name={isAuthenticated ? "check-circle" : "login"}
                size={20}
                color="#FFF"
              />
            }
          />
        </View>
      )}
    </View>
  );
};

const getStyles = (theme) => {
  const BANNER_WIDTH = theme.isTablet ? width - 80 : width - 48;
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.backgroundSecondary,
    },
    scrollContent: {
      paddingBottom: 20,
    },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: 24,
      paddingVertical: 10,
    },
    headerLeft: {
      flex: 1,
      marginRight: 10,
    },
    greeting: {
      fontSize: theme.fontSizes["3xl"],
      fontWeight: "700",
      color: theme.colors.textPrimary,
    },
    subGreeting: {
      fontSize: theme.fontSizes.sm,
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
    headerLoginBtn: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: theme.colors.primary,
      paddingHorizontal: 16,
      paddingVertical: 10,
      borderRadius: 20,
    },
    headerLoginBtnText: {
      color: "#FFF",
      fontSize: 13,
      fontWeight: "800",
      letterSpacing: 0.5,
    },
    // Prize Carousel
    prizesList: {
      paddingHorizontal: 24,
      paddingBottom: 20,
      paddingTop: 20,
    },
    prizeCard: {
      width: theme.isTablet ? (width - 80) / 3 : Math.max(140, width * 0.38),
      height: theme.isTablet ? 300 : 165,
      backgroundColor: theme.colors.card,
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing.md,
      marginRight: theme.spacing.md,
      alignItems: "center",
      ...theme.shadows.md,
      borderWidth: 1,
      borderColor: theme.colors.borderLight,
    },
    prizeCardDisabled: {
      backgroundColor: theme.isDarkMode ? theme.colors.muted : "#FAFAFA",
      shadowOpacity: 0.02,
      elevation: 1,
    },
    prizeIconContainer: {
      width: 60,
      height: 60,
      borderRadius: 16,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 8,
    },
    prizeName: {
      fontSize: 14,
      fontWeight: "700",
      color: theme.colors.textPrimary,
      textAlign: "center",
    },
    prizeCoinsRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: theme.isDarkMode ? theme.colors.background : "#f3f4f6",
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 8,
    },
    prizeCoinsText: {
      fontSize: 13,
      fontWeight: "800",
      color: theme.colors.coins,
      marginLeft: 4,
    },
    // Appointment Card
    appointmentCard: {
      marginHorizontal: 24,
      marginBottom: 16,
      backgroundColor: theme.colors.card,
      borderWidth: 1,
      borderColor: theme.colors.borderLight,
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing.md,
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
      backgroundColor: theme.colors.backgroundSecondary,
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
      height: theme.isTablet ? 350 : 160,
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
    sectionContainer: {
      marginBottom: 0,
    },
    sectionHeader: {
      paddingHorizontal: 24,
      marginTop: 16,
      marginBottom: 4,
    },
    // Barbers
    barbersList: {
      paddingHorizontal: 24,
      paddingBottom: 20,
      paddingTop: 20,
    },
    barberCard: {
      alignItems: "center",
      paddingVertical: 16,
      paddingHorizontal: 12,
      backgroundColor: theme.colors.card,
      borderRadius: theme.borderRadius.lg,
      marginRight: theme.spacing.md,
      width: theme.isTablet ? (width - 80) / 4 : Math.max(140, width * 0.35),
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
      textAlign: "center",
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
      paddingBottom: 20,
      paddingTop: 10,
    },
    serviceCard: {
      padding: theme.spacing.md,
      backgroundColor: theme.colors.card,
      borderRadius: theme.borderRadius.lg,
      marginRight: theme.spacing.md,
      width: theme.isTablet ? (width - 80) / 3 : Math.max(160, width * 0.42),
      ...theme.shadows.sm,
      borderWidth: 2,
      borderColor: theme.colors.borderLight || "#E5E7EB",
    },
    serviceRewardBadge: {
      position: "absolute",
      top: -10,
      right: -10,
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: "#FFD700",
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 12,
      borderWidth: 2,
      borderColor: theme.colors.card,
      ...theme.shadows.md,
      zIndex: 10,
    },
    serviceRewardText: {
      fontSize: 12,
      fontWeight: "900",
      color: "#000",
      marginLeft: 4,
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
      backgroundColor: theme.colors.card,
      borderRadius: theme.borderRadius.lg,
      marginRight: 10,
      minWidth: 60,
      borderWidth: 1,
      borderColor: theme.colors.borderLight || "#E5E7EB",
    },
    dateChipSelected: {
      backgroundColor: theme.colors.primary,
      borderColor: theme.colors.primary,
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
      backgroundColor: theme.colors.card,
      borderRadius: theme.borderRadius.md,
      borderWidth: 1,
      borderColor: theme.colors.borderLight || "#E5E7EB",
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
      backgroundColor: theme.colors.backgroundSecondary,
      paddingHorizontal: 24,
      paddingTop: 16,
      borderTopWidth: 1,
      borderTopColor: theme.colors.borderLight,
    },
    prizesContainer: {
      position: "relative",
      height: theme.isTablet ? 360 : 205,
    },
    clubeOverlay: {
      ...StyleSheet.absoluteFillObject,
      justifyContent: "center",
      alignItems: "center",
      zIndex: 10,
      backgroundColor: theme.isDarkMode
        ? "rgba(0,0,0,0.4)"
        : "rgba(255,255,255,0.05)",
    },
    blurContainer: {
      ...StyleSheet.absoluteFillObject,
    },
    clubeOverlayContent: {
      padding: 16,
      alignItems: "center",
      zIndex: 20,
      width: "100%",
    },
    clubeLockCircle: {
      width: 52,
      height: 52,
      borderRadius: 26,
      backgroundColor: theme.isDarkMode
        ? "rgba(30,30,30,0.95)"
        : "rgba(255,255,255,0.95)",
      justifyContent: "center",
      alignItems: "center",
      marginBottom: 8,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 10,
      elevation: 3,
    },
    clubeOverlayTitle: {
      color: theme.colors.textPrimary,
      fontSize: 22,
      fontWeight: "900",
      marginBottom: 6,
      textAlign: "center",
    },
    clubeOverlayText: {
      color: theme.colors.textMuted,
      fontSize: 13,
      textAlign: "center",
      marginBottom: 20,
      lineHeight: 18,
      paddingHorizontal: 32,
      fontWeight: "500",
    },
    clubeCTAButton: {
      borderWidth: 1.5,
      borderColor: theme.colors.primary,
      paddingVertical: 10,
      paddingHorizontal: 24,
      borderRadius: 12,
      backgroundColor: theme.isDarkMode
        ? "rgba(124,77,255,0.15)"
        : "rgba(255,255,255,0.7)",
    },
    clubeCTAButtonText: {
      color: theme.colors.primary,
      fontSize: 13,
      fontWeight: "800",
      letterSpacing: 0.8,
    },
  });
};

export default BarberScreen;
