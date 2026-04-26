import "react-native-gesture-handler";

import { DarkTheme, DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useMemo } from "react";
import { useColorScheme } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useGymStore } from "./store/gym";
import { useSessionStore } from "./store/session";

import "react-native-reanimated";

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const accentColor = useGymStore((state) => state.accentColor);
  const hydrateSupabaseSession = useSessionStore((state) => state.hydrateSupabaseSession);
  const theme = useMemo(() => {
    const base = colorScheme === "dark" ? DarkTheme : DefaultTheme;
    return {
      ...base,
      colors: {
        ...base.colors,
        primary: accentColor,
      },
    };
  }, [accentColor, colorScheme]);

  useEffect(() => {
    void hydrateSupabaseSession();
  }, [hydrateSupabaseSession]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider value={theme}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" options={{ title: "RollQuest" }} />
          <Stack.Screen name="sign-in" options={{ title: "Sign in" }} />
          <Stack.Screen name="onboarding" options={{ title: "Welcome" }} />
          <Stack.Screen
            name="(tabs)"
            options={{
              title: "RollQuest",
            }}
          />
          <Stack.Screen name="technique" options={{ headerShown: false, presentation: "card" }} />
        </Stack>
        <StatusBar style="light" />
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
