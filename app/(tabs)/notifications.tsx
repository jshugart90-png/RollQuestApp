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
    <SafeAreaView style={{ flex: 1, backgroundColor: "#050505" }} edges={["top"]}>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: 34 }}>
        <Text style={{ color: "#FFFFFF", fontSize: 30, fontWeight: "900" }}>Notifications</Text>
        <Text style={{ color: "#AAB2C2" }}>Stay synced with your gym announcements, class updates, and coaching notes.</Text>
        {unread.length > 0 ? (
          <Pressable
            onPress={() => void markRead(unread.map((item) => item.id))}
            style={{
              borderWidth: 1,
              borderColor: withAlpha(accentColor, 0.75),
              borderRadius: 10,
              paddingVertical: 10,
              alignItems: "center",
              backgroundColor: withAlpha(accentColor, 0.16),
            }}
          >
            <Text style={{ color: "#FFFFFF", fontWeight: "900" }}>Mark All Unread as Read</Text>
          </Pressable>
        ) : null}

        <SectionTitle title={`Unread (${unread.length})`} />
        {unread.length === 0 ? (
          <EmptyBlock text="No new announcements. You are up to date." />
        ) : (
          unread.map((item) => (
            <AnnouncementCard
              key={item.id}
              title={item.title}
              message={item.message}
              date={item.createdAt}
              expiresOn={item.expiresOn}
              onMarkRead={() => void markRead([item.id])}
              unread
            />
          ))
        )}

        <SectionTitle title={`Earlier (${read.length})`} />
        {read.length === 0 ? (
          <EmptyBlock text="Past announcements will appear here once read." />
        ) : (
          read.map((item) => (
            <AnnouncementCard
              key={item.id}
              title={item.title}
              message={item.message}
              date={item.createdAt}
              expiresOn={item.expiresOn}
            />
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function SectionTitle({ title }: { title: string }) {
  return <Text style={{ color: "#D4B06A", fontWeight: "900", marginTop: 4 }}>{title}</Text>;
}

function AnnouncementCard({
  title,
  message,
  date,
  expiresOn,
  onMarkRead,
  unread,
}: {
  title: string;
  message: string;
  date: string;
  expiresOn?: string;
  onMarkRead?: () => void;
  unread?: boolean;
}) {
  return (
    <View
      style={{
        borderWidth: 1,
        borderColor: unread ? "#C8102E" : "#242424",
        borderRadius: 12,
        backgroundColor: unread ? "rgba(200,16,46,0.08)" : "#0F0F0F",
        padding: 12,
        gap: 6,
      }}
    >
      <Text style={{ color: "#FFFFFF", fontSize: 17, fontWeight: "900" }}>{title}</Text>
      <Text style={{ color: "#D0D7E4", lineHeight: 21 }}>{message}</Text>
      <Text style={{ color: "#8E96A5", fontSize: 12 }}>
        {new Date(date).toLocaleDateString()}
        {expiresOn ? ` • expires ${expiresOn}` : ""}
      </Text>
      {onMarkRead ? (
        <Pressable
          onPress={onMarkRead}
          style={{
            borderWidth: 1,
            borderColor: "#2A2A2A",
            borderRadius: 8,
            paddingVertical: 7,
            alignItems: "center",
            backgroundColor: "#121212",
          }}
        >
          <Text style={{ color: "#FFFFFF", fontWeight: "800" }}>Mark Read</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

function EmptyBlock({ text }: { text: string }) {
  return (
    <View style={{ borderWidth: 1, borderColor: "#232323", borderRadius: 12, backgroundColor: "#0E0E0E", padding: 12 }}>
      <Text style={{ color: "#8E96A5" }}>{text}</Text>
    </View>
  );
}
