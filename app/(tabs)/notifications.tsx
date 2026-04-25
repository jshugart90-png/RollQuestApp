import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "expo-router";
import React, { useCallback } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useGymStore, withAlpha } from "../store/gym";
import { useAnnouncementCenter } from "../utils/announcement-center";

export default function NotificationsScreen() {
  const accentColor = useGymStore((state) => state.accentColor);
  const announcements = useAnnouncementCenter((state) => state.announcements);
  const readIds = useAnnouncementCenter((state) => state.readIds);
  const refresh = useAnnouncementCenter((state) => state.refresh);
  const markRead = useAnnouncementCenter((state) => state.markRead);

  useFocusEffect(
    useCallback(() => {
      void refresh();
    }, [refresh])
  );

  const unread = announcements.filter((item) => !readIds.includes(item.id));
  const read = announcements.filter((item) => readIds.includes(item.id));

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#030303" }} edges={["top"]}>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 18, gap: 16, paddingBottom: 40 }}>
        <View style={{ gap: 8 }}>
          <Text style={{ color: "#6E7788", letterSpacing: 1.4, fontWeight: "800", fontSize: 11 }}>INBOX</Text>
          <Text style={{ color: "#FFFFFF", fontSize: 30, fontWeight: "900" }}>Notifications</Text>
          <Text style={{ color: "#AAB2C2", lineHeight: 22, fontSize: 15 }}>
            Gym announcements and class updates in one clean feed. Mark items read as you review them.
          </Text>
        </View>

        {unread.length > 0 ? (
          <Pressable
            onPress={() => void markRead(unread.map((item) => item.id))}
            style={{
              borderWidth: 1,
              borderColor: withAlpha(accentColor, 0.75),
              borderRadius: 14,
              paddingVertical: 14,
              alignItems: "center",
              backgroundColor: withAlpha(accentColor, 0.14),
              flexDirection: "row",
              justifyContent: "center",
              gap: 8,
            }}
          >
            <Ionicons name="checkmark-done" size={18} color="#FFFFFF" />
            <Text style={{ color: "#FFFFFF", fontWeight: "900" }}>Mark all as read</Text>
          </Pressable>
        ) : null}

        <FeedSection
          accentColor={accentColor}
          title="Unread"
          count={unread.length}
          empty="No new announcements. You are fully caught up."
          items={unread}
          onMarkRead={(id) => void markRead([id])}
        />

        <FeedSection
          accentColor={accentColor}
          title="Earlier"
          count={read.length}
          empty="Past announcements appear here after you mark them read."
          items={read}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

function FeedSection({
  title,
  count,
  empty,
  items,
  onMarkRead,
  accentColor,
}: {
  title: string;
  count: number;
  empty: string;
  items: { id: string; title: string; message: string; createdAt: string; expiresOn?: string }[];
  onMarkRead?: (id: string) => void;
  accentColor: string;
}) {
  return (
    <View style={{ gap: 10 }}>
      <View style={{ flexDirection: "row", alignItems: "baseline", justifyContent: "space-between" }}>
        <Text style={{ color: "#D4B06A", fontWeight: "900", fontSize: 16 }}>{title}</Text>
        <Text style={{ color: "#6F7785", fontWeight: "800", fontSize: 12 }}>{count}</Text>
      </View>
      {items.length === 0 ? (
        <View style={{ borderWidth: 1, borderColor: "#232323", borderRadius: 14, backgroundColor: "#0C0C0C", padding: 14 }}>
          <Text style={{ color: "#8E96A5", lineHeight: 21 }}>{empty}</Text>
        </View>
      ) : (
        items.map((item) => (
          <AnnouncementCard
            key={item.id}
            title={item.title}
            message={item.message}
            date={item.createdAt}
            expiresOn={item.expiresOn}
            accentColor={accentColor}
            onMarkRead={onMarkRead ? () => onMarkRead(item.id) : undefined}
            unread={Boolean(onMarkRead)}
          />
        ))
      )}
    </View>
  );
}

function AnnouncementCard({
  title,
  message,
  date,
  expiresOn,
  onMarkRead,
  unread,
  accentColor,
}: {
  title: string;
  message: string;
  date: string;
  expiresOn?: string;
  onMarkRead?: () => void;
  unread?: boolean;
  accentColor: string;
}) {
  const formatted = formatAnnouncementDate(date);
  return (
    <View
      style={{
        borderWidth: 1,
        borderColor: unread ? withAlpha(accentColor, 0.55) : "#252525",
        borderRadius: 16,
        backgroundColor: unread ? "rgba(200,16,46,0.06)" : "#0C0C0C",
        padding: 16,
        gap: 10,
      }}
    >
      <View style={{ flexDirection: "row", justifyContent: "space-between", gap: 12, alignItems: "flex-start" }}>
        <Text style={{ color: "#FFFFFF", fontSize: 18, fontWeight: "900", flex: 1 }}>{title}</Text>
        {unread ? (
          <View
            style={{
              paddingHorizontal: 8,
              paddingVertical: 4,
              borderRadius: 999,
              backgroundColor: "rgba(200,16,46,0.2)",
              borderWidth: 1,
              borderColor: withAlpha(accentColor, 0.45),
            }}
          >
            <Text style={{ color: "#FFD6DC", fontSize: 10, fontWeight: "900" }}>NEW</Text>
          </View>
        ) : null}
      </View>
      <Text style={{ color: "#D0D7E4", lineHeight: 23, fontSize: 15 }}>{message}</Text>
      <Text style={{ color: "#6F7785", fontSize: 12 }}>
        {formatted}
        {expiresOn ? ` · Expires ${expiresOn}` : ""}
      </Text>
      {onMarkRead ? (
        <Pressable
          onPress={onMarkRead}
          style={{
            alignSelf: "flex-start",
            borderWidth: 1,
            borderColor: "#333",
            borderRadius: 10,
            paddingVertical: 10,
            paddingHorizontal: 14,
            backgroundColor: "#141414",
          }}
        >
          <Text style={{ color: "#FFFFFF", fontWeight: "800" }}>Mark read</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

function formatAnnouncementDate(iso: string): string {
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    return d.toLocaleString(undefined, { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" });
  } catch {
    return iso;
  }
}
