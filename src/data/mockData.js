// Sans Company - Mock Data para Wizard of Oz
// Este arquivo contém todos os dados mockados para demonstração

import { hassanAvatar } from './assets';

// Usuário logado (fake)
export const currentUser = {
  id: "1",
  name: "Lucas",
  fullName: "Lucas Mendes",
  email: "lucas@email.com",
  avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
  sansCoins: 1250,
  level: 3,
  levelName: "Gold Member",
  levelProgress: 0.65, // 65% para próximo nível
  nextLevelCoins: 2000,
  memberSince: "2024-03-15",
};

// Barbeiros disponíveis
export const barbers = [
  {
    id: "1",
    name: "Hassan",
    fullName: "Hassan Viadin",
    avatar: hassanAvatar,
    specialty: "Cortes Clássicos",
    rating: 4.9,
    reviews: 127,
    status: "online", // online, busy, offline
    experience: "8 anos",
  },
  {
    id: "2",
    name: "Rafael",
    fullName: "Rafael Santos",
    avatar: "https://images.unsplash.com/photo-1567515004624-219c11d31f2e?w=150&h=150&fit=crop&crop=face",
    specialty: "Degradê & Fade",
    rating: 4.8,
    reviews: 98,
    status: "online",
    experience: "5 anos",
  },
  {
    id: "3",
    name: "Bruno",
    fullName: "Bruno Costa",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face",
    specialty: "Barba Artística",
    rating: 4.9,
    reviews: 156,
    status: "busy",
    experience: "10 anos",
  },
  {
    id: "4",
    name: "André",
    fullName: "André Lima",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
    specialty: "Cortes Modernos",
    rating: 4.7,
    reviews: 73,
    status: "offline",
    experience: "3 anos",
  },
];

// Serviços da barbearia
export const barberServices = [
  {
    id: "1",
    name: "Corte Masculino",
    description: "Corte completo com máquina e tesoura",
    price: 45.00,
    priceCoins: 900,
    duration: 30, // minutos
    icon: "content-cut",
  },
  {
    id: "2",
    name: "Barba Completa",
    description: "Aparar, desenhar e hidratação",
    price: 35.00,
    priceCoins: 700,
    duration: 25,
    icon: "face-man",
  },
  {
    id: "3",
    name: "Combo Corte + Barba",
    description: "Serviço completo com desconto",
    price: 70.00,
    priceCoins: 1400,
    duration: 50,
    icon: "star",
    highlight: true,
  },
  {
    id: "4",
    name: "Degradê Premium",
    description: "Corte degradê com acabamento perfeito",
    price: 55.00,
    priceCoins: 1100,
    duration: 40,
    icon: "trending-up",
  },
  {
    id: "5",
    name: "Sobrancelha",
    description: "Design e limpeza de sobrancelhas",
    price: 15.00,
    priceCoins: 300,
    duration: 10,
    icon: "remove-red-eye",
  },
];

// Horários disponíveis (fake)
export const availableSlots = [
  { id: "1", time: "09:00", available: true },
  { id: "2", time: "09:30", available: true },
  { id: "3", time: "10:00", available: false },
  { id: "4", time: "10:30", available: true },
  { id: "5", time: "11:00", available: true },
  { id: "6", time: "11:30", available: false },
  { id: "7", time: "14:00", available: true },
  { id: "8", time: "14:30", available: true },
  { id: "9", time: "15:00", available: true },
  { id: "10", time: "15:30", available: false },
  { id: "11", time: "16:00", available: true },
  { id: "12", time: "16:30", available: true },
];

// Próximo agendamento do usuário
export const nextAppointment = {
  id: "1",
  barber: barbers[0],
  service: barberServices[2],
  date: "2026-01-28",
  time: "14:30",
  status: "confirmed",
};

// Banners promocionais
export const promoBanners = [
  {
    id: "1",
    title: "Ganhe o Dobro de Coins!",
    subtitle: "Na primeira visita do mês",
    image: "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=800&h=400&fit=crop",
    color: "#6200EA",
  },
  {
    id: "2",
    title: "Combo Especial",
    subtitle: "Corte + Barba + Café por R$ 85",
    image: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=800&h=400&fit=crop",
    color: "#7C4DFF",
  },
  {
    id: "3",
    title: "Indique um Amigo",
    subtitle: "Ganhe 500 Sans Coins",
    image: "https://images.unsplash.com/photo-1599351431202-1e0f0137899a?w=800&h=400&fit=crop",
    color: "#5000C9",
  },
];

// ========== COFFEE MODULE ==========

// Categorias do café
export const coffeeCategories = [
  { id: "1", name: "Cafés", icon: "coffee" },
  { id: "2", name: "Gelados", icon: "local-cafe" },
  { id: "3", name: "Snacks", icon: "restaurant" },
  { id: "4", name: "Doces", icon: "cake" },
];

// Produtos do café
export const coffeeProducts = [
  {
    id: "1",
    categoryId: "1",
    name: "Espresso",
    description: "Café puro e intenso",
    price: 8.00,
    priceCoins: 160,
    image: "https://images.unsplash.com/photo-1510707577719-ae7c14805e3a?w=400&h=400&fit=crop",
    prepTime: 5,
  },
  {
    id: "2",
    categoryId: "1",
    name: "Cappuccino",
    description: "Espresso com leite vaporizado e espuma",
    price: 14.00,
    priceCoins: 280,
    image: "https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=400&h=400&fit=crop",
    prepTime: 8,
  },
  {
    id: "3",
    categoryId: "1",
    name: "Latte",
    description: "Café com leite cremoso",
    price: 12.00,
    priceCoins: 240,
    image: "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400&h=400&fit=crop",
    prepTime: 7,
  },
  {
    id: "4",
    categoryId: "2",
    name: "Iced Coffee",
    description: "Café gelado refrescante",
    price: 15.00,
    priceCoins: 300,
    image: "https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?w=400&h=400&fit=crop",
    prepTime: 5,
  },
  {
    id: "5",
    categoryId: "2",
    name: "Frappuccino",
    description: "Bebida gelada com café e chantilly",
    price: 18.00,
    priceCoins: 360,
    image: "https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=400&h=400&fit=crop",
    prepTime: 10,
    highlight: true,
  },
  {
    id: "6",
    categoryId: "3",
    name: "Pão de Queijo",
    description: "6 unidades quentinhas",
    price: 12.00,
    priceCoins: 240,
    image: "https://images.unsplash.com/photo-1598142982901-df6cec890015?w=400&h=400&fit=crop",
    prepTime: 3,
  },
  {
    id: "7",
    categoryId: "3",
    name: "Croissant",
    description: "Croissant francês amanteigado",
    price: 10.00,
    priceCoins: 200,
    image: "https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=400&h=400&fit=crop",
    prepTime: 2,
  },
  {
    id: "8",
    categoryId: "4",
    name: "Brownie",
    description: "Brownie de chocolate belga",
    price: 14.00,
    priceCoins: 280,
    image: "https://images.unsplash.com/photo-1564355808539-22fda35bed7e?w=400&h=400&fit=crop",
    prepTime: 2,
  },
];

// ========== SHOP MODULE ==========

// Categorias da loja
export const shopCategories = [
  { id: "1", name: "Todos" },
  { id: "2", name: "Roupas" },
  { id: "3", name: "Acessórios" },
  { id: "4", name: "Grooming" },
  { id: "5", name: "Exclusivos" },
];

// Produtos da loja
export const shopProducts = [
  {
    id: "1",
    categoryId: "2",
    name: "Camiseta Sans Company",
    description: "Camiseta premium 100% algodão com logo bordado",
    price: 89.90,
    priceCoins: null,
    image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=500&fit=crop",
    sizes: ["P", "M", "G", "GG"],
    colors: ["Preta", "Branca", "Cinza"],
    isNew: true,
  },
  {
    id: "2",
    categoryId: "2",
    name: "Moletom Vintage",
    description: "Moletom oversized com estampa retrô",
    price: 189.90,
    priceCoins: null,
    image: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400&h=500&fit=crop",
    sizes: ["P", "M", "G", "GG"],
    colors: ["Preto", "Verde Militar"],
  },
  {
    id: "3",
    categoryId: "3",
    name: "Boné Sans",
    description: "Boné trucker com ajuste snapback",
    price: 79.90,
    priceCoins: null,
    image: "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=400&h=500&fit=crop",
    colors: ["Preto", "Marinho"],
    isNew: true,
  },
  {
    id: "4",
    categoryId: "4",
    name: "Kit Barba Completo",
    description: "Óleo + Balm + Pente de madeira",
    price: 149.90,
    priceCoins: null,
    image: "https://images.unsplash.com/photo-1621607512214-68297480165e?w=400&h=500&fit=crop",
  },
  {
    id: "5",
    categoryId: "4",
    name: "Pomada Modeladora",
    description: "Pomada matte de fixação forte",
    price: 59.90,
    priceCoins: null,
    image: "https://images.unsplash.com/photo-1597854712463-8c7a3b58b693?w=400&h=500&fit=crop",
  },
  {
    id: "6",
    categoryId: "5",
    name: "Jaqueta Members Only",
    description: "Edição limitada - Apenas com Sans Coins",
    price: null,
    priceCoins: 5000,
    image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&h=500&fit=crop",
    exclusive: true,
  },
  {
    id: "7",
    categoryId: "5",
    name: "Relógio Sans Edition",
    description: "Relógio exclusivo para membros Gold",
    price: null,
    priceCoins: 8000,
    image: "https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=400&h=500&fit=crop",
    exclusive: true,
  },
  {
    id: "8",
    categoryId: "3",
    name: "Óculos de Sol",
    description: "Lentes polarizadas UV400",
    price: 199.90,
    priceCoins: null,
    image: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400&h=500&fit=crop",
  },
];

// ========== PLAY MODULE ==========

// Mini Games disponíveis
export const miniGames = [
  {
    id: "1",
    name: "Roleta Sans",
    description: "Gire e ganhe até 500 coins!",
    image: "https://images.unsplash.com/photo-1596838132731-3301c3fd4317?w=400&h=300&fit=crop",
    reward: "10-500",
    type: "spin",
    available: true,
  },
  {
    id: "2",
    name: "Quiz Barba",
    description: "Teste seus conhecimentos!",
    image: "https://images.unsplash.com/photo-1606326608606-aa0b62935f2b?w=400&h=300&fit=crop",
    reward: "50",
    type: "quiz",
    available: true,
  },
  {
    id: "3",
    name: "Flappy Sans",
    description: "Quanto mais longe, mais coins!",
    image: "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=400&h=300&fit=crop",
    reward: "1-100",
    type: "arcade",
    available: true,
  },
  {
    id: "4",
    name: "Memory Match",
    description: "Encontre os pares em tempo!",
    image: "https://images.unsplash.com/photo-1612287230202-1ff1d85d1bdf?w=400&h=300&fit=crop",
    reward: "30",
    type: "puzzle",
    available: false,
    comingSoon: true,
  },
];

// Missões diárias
export const dailyMissions = [
  {
    id: "1",
    title: "Faça um check-in",
    description: "Abra o app e ganhe coins",
    reward: 10,
    completed: true,
    icon: "check-circle",
  },
  {
    id: "2",
    title: "Agende um corte",
    description: "Marque um horário na barbearia",
    reward: 50,
    completed: false,
    icon: "calendar",
  },
  {
    id: "3",
    title: "Compre um café",
    description: "Faça um pedido no Coffee",
    reward: 30,
    completed: false,
    icon: "coffee",
  },
  {
    id: "4",
    title: "Jogue um mini-game",
    description: "Complete qualquer jogo",
    reward: 20,
    completed: true,
    icon: "gamepad-variant",
  },
  {
    id: "5",
    title: "Convide um amigo",
    description: "Compartilhe seu código",
    reward: 100,
    completed: false,
    icon: "account-plus",
  },
];

// Níveis de fidelidade
export const loyaltyLevels = [
  { level: 1, name: "Bronze", minCoins: 0, color: "#CD7F32" },
  { level: 2, name: "Silver", minCoins: 500, color: "#C0C0C0" },
  { level: 3, name: "Gold", minCoins: 1500, color: "#FFD700" },
  { level: 4, name: "Platinum", minCoins: 3500, color: "#E5E4E2" },
  { level: 5, name: "Diamond", minCoins: 7000, color: "#B9F2FF" },
];

// Histórico de transações
export const transactionHistory = [
  { id: "1", type: "earn", description: "Check-in diário", amount: 10, date: "2026-01-27" },
  { id: "2", type: "earn", description: "Corte de cabelo", amount: 45, date: "2026-01-25" },
  { id: "3", type: "spend", description: "Cappuccino", amount: -280, date: "2026-01-24" },
  { id: "4", type: "earn", description: "Quiz Barba", amount: 50, date: "2026-01-23" },
  { id: "5", type: "earn", description: "Indicação de amigo", amount: 100, date: "2026-01-20" },
];
