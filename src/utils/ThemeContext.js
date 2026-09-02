import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Appearance, useColorScheme, AppState } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { theme as baseTheme } from './theme';
import api from '../api/apiConfig';

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
};

export const darkColors = {
  ...baseTheme.colors,
  background: "#0F0F0F",
  backgroundSecondary: "#181818",
  card: "#1E1E1E",
  foreground: "#F0F0F0",
  textPrimary: "#F0F0F0",
  textSecondary: "#C4C4C4",
  textMuted: "#8A8A8A",
  textLight: "#5E5E5E",
  border: "#2E2E2E",
  borderLight: "#272727",
  input: "#2E2E2E",
  primary: "#7C4DFF",
  primaryLight: "#9E6BFF",
  primaryDark: "#6200EA",
  coinsBackground: "#2A2310",
  successLight: "#0D2E1A",
  warningLight: "#2E2200",
  errorLight: "#2E0A10",
  muted: "#242424",
  secondary: "#1E1E1E",
  accent: "#252525",
  overlay: "rgba(0, 0, 0, 0.7)",
  overlayLight: "rgba(0, 0, 0, 0.25)",
};

export const ThemeProvider = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const [themeMode, setThemeMode] = useState('system'); // 'light', 'dark', 'system'
  const [dynamicLogos, setDynamicLogos] = useState({ APP_LOGO_DEFAULT: null, APP_LOGO_NOBG: null });

  const loadDynamicLogos = useCallback(async () => {
    try {
      const res = await api.get(`/app/settings/public?_t=${Date.now()}`);
      if (res.data) {
        setDynamicLogos(prev => {
          const newDefault = res.data.APP_LOGO_DEFAULT || null;
          const newNoBg = res.data.APP_LOGO_NOBG || null;
          if (prev.APP_LOGO_DEFAULT !== newDefault || prev.APP_LOGO_NOBG !== newNoBg) {
            return {
              APP_LOGO_DEFAULT: newDefault,
              APP_LOGO_NOBG: newNoBg,
            };
          }
          return prev;
        });
      }
    } catch (err) {
      // silent catch for background polling
    }
  }, []);

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
    loadDynamicLogos();

    // 1. Atualiza imediatamente ao voltar para o app (foreground)
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState === 'active') {
        loadDynamicLogos();
      }
    });

    // 2. Polling leve a cada 10 segundos em tempo real
    const interval = setInterval(() => {
      loadDynamicLogos();
    }, 10000);

    return () => {
      subscription.remove();
      clearInterval(interval);
    };
  }, [loadDynamicLogos]);

  const changeTheme = async (mode) => {
    setThemeMode(mode);
    try {
      await AsyncStorage.setItem('themeMode', mode);
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
    logos: dynamicLogos,
  };

  return (
    <ThemeContext.Provider value={{ theme: currentTheme, changeTheme, themeMode, reloadLogos: loadDynamicLogos }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
