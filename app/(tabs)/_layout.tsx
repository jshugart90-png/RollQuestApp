import { Tabs } from "expo-router";
import React from "react";

export default function TabsLayout() {
  return (
    <Tabs screenOptions={{ headerShown: true }}>
      <Tabs.Screen name="index" options={{ title: "Home" }} />
      <Tabs.Screen name="learn" options={{ title: "Learn" }} />
      <Tabs.Screen name="daily" options={{ title: "Daily Roll" }} />
      <Tabs.Screen name="path" options={{ title: "My Path" }} />
      <Tabs.Screen name="kids" options={{ title: "Kids" }} />
      <Tabs.Screen name="gym" options={{ title: "Gym" }} />
    </Tabs>
  );
}
