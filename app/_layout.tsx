import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from 'react-native';

import 'react-native-reanimated';

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        {/* Technique stack lives outside (tabs) — no tab bar; card presentation for a clean full-screen push */}
        <Stack.Screen name="technique" options={{ headerShown: false, presentation: "card" }} />
      </Stack>
      <StatusBar style="light" />
    </ThemeProvider>
  );
}
