// Sans Club - Design System (Light Mode Premium)
export const theme = {
  colors: {
    // Primary colors (Roxo Vibrante)
    primary: "#6200EA",
    primaryLight: "#7C4DFF",
    primaryDark: "#5000C9",
    primaryForeground: "#FFFFFF",

    // Secondary colors
    secondary: "#F5F7FA",
    secondaryForeground: "#1A1A1A",

    // Background colors
    background: "#FFFFFF",
    backgroundSecondary: "#F5F7FA",
    foreground: "#1A1A1A",

    // Text colors
    textPrimary: "#1A1A1A",
    textSecondary: "#424242",
    textMuted: "#757575",
    textLight: "#9E9E9E",

    // Card colors
    card: "#FFFFFF",
    cardForeground: "#1A1A1A",

    // Muted colors
    muted: "#F5F7FA",
    mutedForeground: "#757575",

    // Success/Warning/Error
    success: "#00C853",
    successLight: "#E8F5E9",
    successForeground: "#FFFFFF",
    warning: "#FFB300",
    warningLight: "#FFF8E1",
    error: "#FF1744",
    errorLight: "#FFEBEE",
    destructive: "#FF1744",
    destructiveForeground: "#FFFFFF",

    // Sans Coins (Gold accent)
    coins: "#FFD700",
    coinsBackground: "#FFF8E1",

    // Border colors
    border: "#E8E8E8",
    borderLight: "#F0F0F0",
    input: "#E8E8E8",

    // Status colors
    online: "#00C853",
    offline: "#BDBDBD",
    busy: "#FF5722",

    // Overlay
    overlay: "rgba(0, 0, 0, 0.5)",
    overlayLight: "rgba(0, 0, 0, 0.1)",

    // White & Black
    white: "#FFFFFF",
    black: "#000000",

    // Ring/Focus
    ring: "#6200EA",

    // Accent
    accent: "#F5F7FA",
    accentForeground: "#1A1A1A",
  },

  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    "2xl": 48,
    "3xl": 64,
  },

  borderRadius: {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    full: 9999,
  },

  fontSizes: {
    xs: 11,
    sm: 13,
    base: 15,
    md: 16,
    lg: 18,
    xl: 20,
    "2xl": 24,
    "3xl": 28,
    "4xl": 32,
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

// Gradient helpers
export const gradients = {
  primary: ["#6200EA", "#7C4DFF"],
  primaryReverse: ["#7C4DFF", "#6200EA"],
  gold: ["#FFD700", "#FFA000"],
  card: ["#FFFFFF", "#F5F7FA"],
  dark: ["#1A1A1A", "#424242"],
};

// Text style helper used across screens
export const createTextStyle = (variant = "body", color = "foreground") => {
  const variants = {
    h1: {
      fontSize: theme.fontSizes["3xl"],
      fontWeight: theme.fontWeights.bold,
      lineHeight: theme.fontSizes["3xl"] * 1.2,
    },
    h2: {
      fontSize: theme.fontSizes["2xl"],
      fontWeight: theme.fontWeights.semibold,
      lineHeight: theme.fontSizes["2xl"] * 1.2,
    },
    h3: {
      fontSize: theme.fontSizes.xl,
      fontWeight: theme.fontWeights.semibold,
      lineHeight: theme.fontSizes.xl * 1.2,
    },
    body: {
      fontSize: theme.fontSizes.base,
      fontWeight: theme.fontWeights.medium,
      lineHeight: theme.fontSizes.base * 1.4,
    },
    small: {
      fontSize: theme.fontSizes.sm,
      fontWeight: theme.fontWeights.regular,
      lineHeight: theme.fontSizes.sm * 1.4,
    },
    caption: {
      fontSize: theme.fontSizes.xs,
      fontWeight: theme.fontWeights.medium,
      lineHeight: theme.fontSizes.xs * 1.3,
    },
  };

  const palette = theme.colors[color] || color || theme.colors.textPrimary;

  return {
    ...(variants[variant] || variants.body),
    color: palette,
  };
};

// Button style helper used across screens
export const createButtonStyle = (variant = "primary", size = "md") => {
  const sizeScale = {
    sm: {
      paddingVertical: theme.spacing.sm,
      paddingHorizontal: theme.spacing.md,
      borderRadius: theme.borderRadius.md,
    },
    md: {
      paddingVertical: theme.spacing.md,
      paddingHorizontal: theme.spacing.lg,
      borderRadius: theme.borderRadius.lg,
    },
  };

  const variants = {
    primary: {
      backgroundColor: theme.colors.primary,
    },
    secondary: {
      backgroundColor: theme.colors.secondary,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    destructive: {
      backgroundColor: theme.colors.destructive,
    },
  };

  return {
    alignItems: "center",
    justifyContent: "center",
    ...sizeScale[size],
    ...(variants[variant] || variants.primary),
  };
};

export default theme;
