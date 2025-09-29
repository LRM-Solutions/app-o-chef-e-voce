// shadcn UI inspired theme with black as primary color
export const theme = {
  colors: {
    // Primary colors
    primary: "#c19b52",
    primaryForeground: "#ffffff",

    // Secondary colors
    secondary: "#f1f5f9",
    secondaryForeground: "#0f172a",

    // Muted colors
    muted: "#64748b",
    mutedForeground: "#64748b",

    success: "#4ade80",
    successForeground: "#ffffff",
    // Accent colors
    accent: "#f1f5f9",
    accentForeground: "#0f172a",

    // Destructive/Error colors
    destructive: "#ef4444",
    destructiveForeground: "#ffffff",

    // Border and input colors
    border: "#e2e8f0",
    input: "#e2e8f0",

    // Ring/Focus colors
    ring: "#000000",

    // Background colors
    background: "#ffffff",
    foreground: "#0f172a",

    // Card colors
    card: "#ffffff",
    cardForeground: "#0f172a",

    // Popover colors
    popover: "#ffffff",
    popoverForeground: "#0f172a",

    // Chart colors
    chart1: "#000000",
    chart2: "#64748b",
    chart3: "#94a3b8",
    chart4: "#cbd5e1",
    chart5: "#e2e8f0",
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
    sm: 6,
    md: 8,
    lg: 12,
    xl: 16,
  },

  fontSizes: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    "2xl": 24,
    "3xl": 30,
  },

  shadows: {
    sm: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 1,
    },
    md: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 3,
      elevation: 2,
    },
    lg: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 6,
      elevation: 4,
    },
  },
};

// Helper function to create consistent button styles
export const createButtonStyle = (variant = "primary", size = "md") => {
  const baseStyle = {
    borderRadius: theme.borderRadius.md,
    alignItems: "center",
    justifyContent: "center",
    ...theme.shadows.sm,
  };

  const sizeStyles = {
    sm: {
      paddingVertical: theme.spacing.sm,
      paddingHorizontal: theme.spacing.md,
    },
    md: {
      paddingVertical: theme.spacing.md,
      paddingHorizontal: theme.spacing.lg,
    },
    lg: {
      paddingVertical: theme.spacing.lg,
      paddingHorizontal: theme.spacing.xl,
    },
  };

  const variantStyles = {
    primary: {
      backgroundColor: theme.colors.primary,
    },
    success: {
      backgroundColor: theme.colors.primary,
    },
    secondary: {
      backgroundColor: theme.colors.secondary,
    },
    destructive: {
      backgroundColor: theme.colors.destructive,
    },
    outline: {
      backgroundColor: "transparent",
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
  };

  return {
    ...baseStyle,
    ...sizeStyles[size],
    ...variantStyles[variant],
  };
};

// Helper function to create consistent text styles
export const createTextStyle = (variant = "body", color = "foreground") => {
  const variantStyles = {
    h1: {
      fontSize: theme.fontSizes["3xl"],
      fontWeight: "bold",
    },
    h2: {
      fontSize: theme.fontSizes["2xl"],
      fontWeight: "bold",
    },
    h3: {
      fontSize: theme.fontSizes.xl,
      fontWeight: "600",
    },
    body: {
      fontSize: theme.fontSizes.base,
      fontWeight: "normal",
    },
    caption: {
      fontSize: theme.fontSizes.sm,
      fontWeight: "normal",
    },
    small: {
      fontSize: theme.fontSizes.xs,
      fontWeight: "normal",
    },
  };

  const colorStyles = {
    foreground: { color: theme.colors.foreground },
    primary: { color: theme.colors.primary },
    secondary: { color: theme.colors.secondaryForeground },
    muted: { color: theme.colors.mutedForeground },
    destructive: { color: theme.colors.destructive },
    white: { color: theme.colors.primaryForeground },
  };

  return {
    ...variantStyles[variant],
    ...colorStyles[color],
  };
};
