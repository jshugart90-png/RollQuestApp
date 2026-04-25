import { FontAwesome6, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { Tabs, useRouter } from "expo-router";
import React, { useEffect } from "react";
import { Modal, Pressable, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { GlobalQuickFab } from "../components/GlobalQuickFab";
import { GymLogoImage } from "../components/GymLogoImage";
import { useGymStore } from "../store/gym";
import { useAnnouncementCenter } from "../utils/announcement-center";

export default function TabLayout() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const accentColor = useGymStore((state) => state.accentColor);
  const gymName = useGymStore((state) => state.gymName);
  const logoUrl = useGymStore((state) => state.logoUrl);
  const isGymMode = useGymStore((state) => state.isGymMode);
  const announcements = useGymStore((state) => (state.isGymMode ? state.announcements : state.linkedGym?.announcements ?? state.announcements));
  const unreadCount = useAnnouncementCenter((state) => state.unreadCount);
  const announcementList = useAnnouncementCenter((state) => state.announcements);
  const readIds = useAnnouncementCenter((state) => state.readIds);
  const refreshAnnouncements = useAnnouncementCenter((state) => state.refresh);
  const markRead = useAnnouncementCenter((state) => state.markRead);
  const [showAnnouncementModal, setShowAnnouncementModal] = React.useState(false);

  useEffect(() => {
    void refreshAnnouncements();
  }, [announcements, isGymMode, refreshAnnouncements]);

  const unreadAnnouncements = announcementList.filter((item) => !readIds.includes(item.id));

  useEffect(() => {
    if (!isGymMode && unreadAnnouncements.length > 0) {
      setShowAnnouncementModal(true);
    }
  }, [isGymMode, unreadAnnouncements.length]);

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
          headerRight: () => (
            <Pressable
              onPress={() => router.push("/notifications")}
              style={{ marginRight: 12, flexDirection: "row", alignItems: "center", gap: 6 }}
            >
              <Ionicons name="notifications-outline" size={20} color="#EDEFF6" />
              {unreadCount > 0 ? (
                <View
                  style={{
                    minWidth: 18,
                    height: 18,
                    borderRadius: 999,
                    backgroundColor: "#C8102E",
                    justifyContent: "center",
                    alignItems: "center",
                    paddingHorizontal: 5,
                  }}
                >
                  <Text style={{ color: "#FFFFFF", fontSize: 10, fontWeight: "900" }}>
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </Text>
                </View>
              ) : null}
            </Pressable>
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
        <Tabs.Screen name="notifications" options={{ href: null }} />
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
      <Modal visible={showAnnouncementModal} transparent animationType="fade" onRequestClose={() => setShowAnnouncementModal(false)}>
        <Pressable
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.78)",
            justifyContent: "center",
            paddingHorizontal: 18,
            paddingTop: insets.top + 12,
            paddingBottom: insets.bottom + 12,
          }}
          onPress={() => setShowAnnouncementModal(false)}
        >
          <View
            style={{
              borderWidth: 1,
              borderColor: "#2A2A2A",
              borderRadius: 18,
              backgroundColor: "#0A0A0A",
              overflow: "hidden",
              maxHeight: "88%",
            }}
          >
            <View style={{ height: 4, backgroundColor: accentColor, width: "100%" }} />
            <ScrollView
              style={{ maxHeight: 420 }}
              contentContainerStyle={{ padding: 18, gap: 10 }}
              keyboardShouldPersistTaps="handled"
            >
              <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                <View
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 12,
                    backgroundColor: "rgba(200,16,46,0.18)",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Ionicons name="megaphone" size={22} color="#F4E6C4" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: "#8E96A5", fontSize: 12, fontWeight: "800", letterSpacing: 0.6 }}>GYM FEED</Text>
                  <Text style={{ color: "#FFFFFF", fontSize: 20, fontWeight: "900" }}>New announcement</Text>
                </View>
              </View>
              {unreadAnnouncements[0] ? (
                <>
                  <Text style={{ color: "#D4B06A", fontSize: 18, fontWeight: "900" }}>{unreadAnnouncements[0].title}</Text>
                  <Text style={{ color: "#D0D7E4", lineHeight: 24, fontSize: 15 }}>{unreadAnnouncements[0].message}</Text>
                  {unreadAnnouncements[0].expiresOn ? (
                    <Text style={{ color: "#6F7785", fontSize: 12 }}>Expires {unreadAnnouncements[0].expiresOn}</Text>
                  ) : null}
                </>
              ) : (
                <Text style={{ color: "#AAB2C2", lineHeight: 22 }}>You are all caught up.</Text>
              )}
            </ScrollView>
            <View style={{ flexDirection: "row", gap: 10, padding: 16, paddingTop: 0, borderTopWidth: 1, borderTopColor: "#1A1A1A" }}>
              <Pressable
                onPress={() => {
                  void markRead(unreadAnnouncements.map((item) => item.id));
                  setShowAnnouncementModal(false);
                }}
                style={{
                  flex: 1,
                  borderWidth: 1,
                  borderColor: accentColor,
                  borderRadius: 12,
                  paddingVertical: 14,
                  alignItems: "center",
                  backgroundColor: "rgba(200,16,46,0.16)",
                }}
              >
                <Text style={{ color: "#FFFFFF", fontWeight: "900" }}>Mark read</Text>
              </Pressable>
              <Pressable
                onPress={() => {
                  setShowAnnouncementModal(false);
                  router.push("/notifications");
                }}
                style={{
                  flex: 1,
                  borderWidth: 1,
                  borderColor: "#333",
                  borderRadius: 12,
                  paddingVertical: 14,
                  alignItems: "center",
                  backgroundColor: "#141414",
                }}
              >
                <Text style={{ color: "#FFFFFF", fontWeight: "800" }}>Open feed</Text>
              </Pressable>
            </View>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}
