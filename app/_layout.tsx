import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useMemo } from 'react';
import { useColorScheme } from 'react-native';
import { useGymStore } from './store/gym';

import 'react-native-reanimated';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const accentColor = useGymStore((state) => state.accentColor);
  const theme = useMemo(() => {
    const base = colorScheme === 'dark' ? DarkTheme : DefaultTheme;
    return {
      ...base,
      colors: {
        ...base.colors,
        primary: accentColor,
      },
    };
  }, [accentColor, colorScheme]);

  return (
    <ThemeProvider value={theme}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen
          name="(tabs)"
          options={{
            title: "RollQuest",
          }}
        />
        {/* Technique stack lives outside (tabs) — no tab bar; card presentation for a clean full-screen push */}
        <Stack.Screen name="technique" options={{ headerShown: false, presentation: "card" }} />
      </Stack>
      <StatusBar style="light" />
    </ThemeProvider>
  );
}
