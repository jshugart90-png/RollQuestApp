import { Stack } from "expo-router";

export default function GymCurriculumLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerShadowVisible: false,
        headerStyle: { backgroundColor: "#111111" },
        headerTintColor: "#FFFFFF",
        headerTitleStyle: { color: "#FFFFFF", fontWeight: "800" },
        headerBackTitle: "",
      }}
    />
  );
}
