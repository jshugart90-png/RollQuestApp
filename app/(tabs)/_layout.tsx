import { FontAwesome6, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import React from "react";
import { Text, View } from "react-native";
import { GlobalQuickFab } from "../components/GlobalQuickFab";
import { GymLogoImage } from "../components/GymLogoImage";
import { useGymStore } from "../store/gym";

export default function TabLayout() {
  const accentColor = useGymStore((state) => state.accentColor);
  const gymName = useGymStore((state) => state.gymName);
  const logoUrl = useGymStore((state) => state.logoUrl);
  const isGymMode = useGymStore((state) => state.isGymMode);

  return (
    <View style={{ flex: 1 }}>
      <Tabs
        screenOptions={{
          headerShown: true,
          headerStyle: {
            backgroundColor: "#070707",
          },
          headerShadowVisible: false,
          headerTitle: () => (
            <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
              <GymLogoImage uri={logoUrl} size={28} borderRadius={8} accentColor={accentColor} />
              <Text style={{ color: "#F4F6FC", fontSize: 18, fontWeight: "900" }}>{gymName}</Text>
            </View>
          ),
          tabBarHideOnKeyboard: true,
          tabBarActiveTintColor: accentColor,
          tabBarInactiveTintColor: "#8C8F9A",
          tabBarStyle: {
            backgroundColor: "#090909",
            borderTopColor: "#1A1A1A",
          },
        }}
      >
        <Tabs.Screen
          name="schedule"
          options={{
            title: "Schedule",
            tabBarIcon: ({ color, size }) => <Ionicons name="calendar" color={color} size={size} />,
          }}
        />
        <Tabs.Screen name="index" options={{ href: null }} />
        <Tabs.Screen
          name="library"
          options={{
            title: "Library",
            tabBarIcon: ({ color, size }) => <MaterialCommunityIcons name="bookshelf" color={color} size={size} />,
          }}
        />
        <Tabs.Screen
          name="my-gym"
          options={{
            title: "My Gym",
            href: isGymMode ? undefined : null,
            tabBarIcon: ({ color, size }) => <FontAwesome6 name="dumbbell" color={color} size={size} />,
          }}
        />
        <Tabs.Screen
          name="notes"
          options={{
            title: "Notes",
            tabBarIcon: ({ color, size }) => (
              <MaterialCommunityIcons name="notebook-edit-outline" color={color} size={size} />
            ),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: "Profile",
            tabBarIcon: ({ color, size }) => <Ionicons name="person" color={color} size={size} />,
          }}
        />
        <Tabs.Screen
          name="settings"
          options={{
            title: "Settings",
            tabBarIcon: ({ color, size }) => <Ionicons name="settings-outline" color={color} size={size} />,
          }}
        />
      </Tabs>
      <GlobalQuickFab />
    </View>
  );
}
