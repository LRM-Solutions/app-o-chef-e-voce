import { Dimensions, Platform } from "react-native";

const { width, height } = Dimensions.get("window");
const isTablet = width >= 768;

// Escala mais agressiva para iPad para preencher a tela
const scale = isTablet ? 1.8 : 1;

// Sans Company - Design System (Light Mode Premium)
export const theme = {
  isTablet,
  width,
  height,
  colors: {
    primary: "#6200EA",
    primaryLight: "#7C4DFF",
    primaryDark: "#5000C9",
    primaryForeground: "#FFFFFF",
    secondary: "#F5F7FA",
    secondaryForeground: "#1A1A1A",
    background: "#FFFFFF",
    backgroundSecondary: "#F5F7FA",
    foreground: "#1A1A1A",
    textPrimary: "#1A1A1A",
    textSecondary: "#424242",
    textMuted: "#757575",
    textLight: "#9E9E9E",
    card: "#FFFFFF",
    cardForeground: "#1A1A1A",
    muted: "#F5F7FA",
    mutedForeground: "#757575",
    success: "#00C853",
    successLight: "#E8F5E9",
    successForeground: "#FFFFFF",
    warning: "#FFB300",
    warningLight: "#FFF8E1",
    error: "#FF1744",
    errorLight: "#FFEBEE",
    destructive: "#FF1744",
    destructiveForeground: "#FFFFFF",
    coins: "#FFD700",
    coinsBackground: "#FFF8E1",
    border: "#E8E8E8",
    borderLight: "#F0F0F0",
    input: "#E8E8E8",
    online: "#00C853",
    offline: "#BDBDBD",
    busy: "#FF5722",
    overlay: "rgba(0, 0, 0, 0.5)",
    overlayLight: "rgba(0, 0, 0, 0.1)",
    white: "#FFFFFF",
    black: "#000000",
    ring: "#6200EA",
    accent: "#F5F7FA",
    accentForeground: "#1A1A1A",
  },
  spacing: {
    xs: 4 * scale,
    sm: 8 * scale,
    md: 16 * scale,
    lg: 24 * scale,
    xl: 32 * scale,
    "2xl": 48 * scale,
    "3xl": 64 * scale,
  },
  borderRadius: {
    sm: 8 * scale,
    md: 12 * scale,
    lg: 16 * scale,
    xl: 20 * scale,
    full: 9999,
  },
  fontSizes: {
    xs: 11 * scale,
    sm: 13 * scale,
    base: 15 * scale,
    md: 16 * scale,
    lg: 18 * scale,
    xl: 20 * scale,
    "2xl": 24 * scale,
    "3xl": 28 * scale,
    "4xl": 32 * scale,
  },
  fontWeights: {
    regular: "400",
    medium: "500",
    semibold: "600",
    bold: "700",
    extrabold: "800",
  },
  shadows: {
    sm: {
      shadowColor: "#000000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.06,
      shadowRadius: 8,
      elevation: 2,
    },
    md: {
      shadowColor: "#000000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.08,
      shadowRadius: 12,
      elevation: 4,
    },
    lg: {
      shadowColor: "#000000",
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.1,
      shadowRadius: 24,
      elevation: 8,
    },
    card: {
      shadowColor: "#6200EA",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.08,
      shadowRadius: 16,
      elevation: 4,
    },
    button: {
      shadowColor: "#6200EA",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 4,
    },
  },
  animations: {
    fast: 150,
    normal: 300,
    slow: 500,
  },
};

export const gradients = {
  primary: ["#6200EA", "#7C4DFF"],
  primaryReverse: ["#7C4DFF", "#6200EA"],
  gold: ["#FFD700", "#FFA000"],
  card: ["#FFFFFF", "#F5F7FA"],
  dark: ["#1A1A1A", "#424242"],
};

export const createTextStyle = (variant = "body", color = "foreground", themeOverride = null) => {
  const currentTheme = themeOverride || theme;
  const variants = {
    h1: { fontSize: currentTheme.fontSizes["3xl"], fontWeight: currentTheme.fontWeights.bold, lineHeight: currentTheme.fontSizes["3xl"] * 1.2 },
    h2: { fontSize: currentTheme.fontSizes["2xl"], fontWeight: currentTheme.fontWeights.semibold, lineHeight: currentTheme.fontSizes["2xl"] * 1.2 },
    h3: { fontSize: currentTheme.fontSizes.xl, fontWeight: currentTheme.fontWeights.semibold, lineHeight: currentTheme.fontSizes.xl * 1.2 },
    body: { fontSize: currentTheme.fontSizes.base, fontWeight: currentTheme.fontWeights.medium, lineHeight: currentTheme.fontSizes.base * 1.4 },
    small: { fontSize: currentTheme.fontSizes.sm, fontWeight: currentTheme.fontWeights.regular, lineHeight: currentTheme.fontSizes.sm * 1.4 },
    caption: { fontSize: currentTheme.fontSizes.xs, fontWeight: currentTheme.fontWeights.medium, lineHeight: currentTheme.fontSizes.xs * 1.3 },
  };
  const palette = currentTheme.colors[color] || color || currentTheme.colors.textPrimary;
  return { ...(variants[variant] || variants.body), color: palette };
};

export const createButtonStyle = (variant = "primary", size = "md", themeOverride = null) => {
  const currentTheme = themeOverride || theme;
  const sizeScale = {
    sm: { paddingVertical: currentTheme.spacing.sm, paddingHorizontal: currentTheme.spacing.md, borderRadius: currentTheme.borderRadius.md },
    md: { paddingVertical: currentTheme.spacing.md, paddingHorizontal: currentTheme.spacing.lg, borderRadius: currentTheme.borderRadius.lg },
  };
  const variants = {
    primary: { backgroundColor: currentTheme.colors.primary },
    secondary: { backgroundColor: currentTheme.colors.secondary, borderWidth: 1, borderColor: currentTheme.colors.border },
    destructive: { backgroundColor: currentTheme.colors.destructive },
  };
  return { alignItems: "center", justifyContent: "center", ...sizeScale[size], ...(variants[variant] || variants.primary) };
};

export default theme;
