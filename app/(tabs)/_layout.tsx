import { FontAwesome6, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { Tabs, useRouter } from "expo-router";
import React, { useEffect } from "react";
import { Modal, Pressable, Text, View } from "react-native";
import { GlobalQuickFab } from "../components/GlobalQuickFab";
import { GymLogoImage } from "../components/GymLogoImage";
import { useGymStore } from "../store/gym";
import { useAnnouncementCenter } from "../utils/announcement-center";

export default function TabLayout() {
  const router = useRouter();
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
        <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.72)", justifyContent: "center", padding: 18 }}>
          <View style={{ borderWidth: 1, borderColor: "#2A2A2A", borderRadius: 16, backgroundColor: "#0C0C0C", padding: 16 }}>
            <Text style={{ color: "#FFFFFF", fontSize: 21, fontWeight: "900" }}>New Gym Announcement</Text>
            {unreadAnnouncements[0] ? (
              <>
                <Text style={{ color: "#D4B06A", marginTop: 8, fontWeight: "800" }}>{unreadAnnouncements[0].title}</Text>
                <Text style={{ color: "#D0D7E4", marginTop: 8, lineHeight: 22 }}>{unreadAnnouncements[0].message}</Text>
              </>
            ) : (
              <Text style={{ color: "#AAB2C2", marginTop: 8 }}>You are all caught up.</Text>
            )}
            <View style={{ flexDirection: "row", gap: 8, marginTop: 14 }}>
              <Pressable
                onPress={() => {
                  void markRead(unreadAnnouncements.map((item) => item.id));
                  setShowAnnouncementModal(false);
                }}
                style={{
                  flex: 1,
                  borderWidth: 1,
                  borderColor: "#C8102E",
                  borderRadius: 10,
                  paddingVertical: 10,
                  alignItems: "center",
                  backgroundColor: "rgba(200,16,46,0.2)",
                }}
              >
                <Text style={{ color: "#FFFFFF", fontWeight: "900" }}>Mark Read</Text>
              </Pressable>
              <Pressable
                onPress={() => {
                  setShowAnnouncementModal(false);
                  router.push("/notifications");
                }}
                style={{
                  flex: 1,
                  borderWidth: 1,
                  borderColor: "#2A2A2A",
                  borderRadius: 10,
                  paddingVertical: 10,
                  alignItems: "center",
                  backgroundColor: "#131313",
                }}
              >
                <Text style={{ color: "#FFFFFF", fontWeight: "800" }}>Open Feed</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
