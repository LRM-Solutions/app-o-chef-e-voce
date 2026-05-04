import React, { createContext, useContext, useState, useEffect } from 'react';
import { Appearance, useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { theme as baseTheme } from './theme';

const ThemeContext = createContext();

export const lightColors = {
  ...baseTheme.colors,
  background: "#FFFFFF",
  backgroundSecondary: "#F5F7FA",
  card: "#FFFFFF",
  textPrimary: "#1A1A1A",
  textSecondary: "#424242",
  textMuted: "#757575",
  borderLight: "#F0F0F0",
  // adicione outras cores claras se precisar
};

export const darkColors = {
  ...baseTheme.colors,
  // Backgrounds — escuros profundos, sem "azul de sistema"
  background: "#0F0F0F",
  backgroundSecondary: "#181818",
  card: "#1E1E1E",
  // Textos — alto contraste
  foreground: "#F0F0F0",
  textPrimary: "#F0F0F0",
  textSecondary: "#C4C4C4",
  textMuted: "#8A8A8A",
  textLight: "#5E5E5E",
  // Bordas
  border: "#2E2E2E",
  borderLight: "#272727",
  input: "#2E2E2E",
  // Roxo primário — ligeiramente mais brilhante para contrastar no fundo escuro
  primary: "#7C4DFF",
  primaryLight: "#9E6BFF",
  primaryDark: "#6200EA",
  // Fundo dos coins — tom dourado escuro
  coinsBackground: "#2A2310",
  // Estados semânticos — mais saturados no escuro
  successLight: "#0D2E1A",
  warningLight: "#2E2200",
  errorLight: "#2E0A10",
  // Superfícies auxiliares
  muted: "#242424",
  secondary: "#1E1E1E",
  accent: "#252525",
  overlay: "rgba(0, 0, 0, 0.7)",
  overlayLight: "rgba(0, 0, 0, 0.25)",
};

export const ThemeProvider = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const [themeMode, setThemeMode] = useState('system'); // 'light', 'dark', 'system'

  useEffect(() => {
    const loadTheme = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem('themeMode');
        if (savedTheme) {
          setThemeMode(savedTheme);
        }
      } catch (error) {
        console.log('Error loading theme:', error);
      }
    };
    loadTheme();
  }, []);

  const changeTheme = async (mode) => {
    setThemeMode(mode);
    try {
      await AsyncStorage.setItem('themeMode', mode);
      // Optional: Appearance.setColorScheme(mode === 'system' ? null : mode) // Only RN 0.73+
    } catch (error) {
      console.log('Error saving theme:', error);
    }
  };

  const isDarkMode = themeMode === 'system' ? systemColorScheme === 'dark' : themeMode === 'dark';

  const currentTheme = {
    ...baseTheme,
    colors: isDarkMode ? darkColors : lightColors,
    isDarkMode,
    themeMode,
  };

  return (
    <ThemeContext.Provider value={{ theme: currentTheme, changeTheme, themeMode }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
