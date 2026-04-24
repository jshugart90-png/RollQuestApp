import type { Href } from "expo-router";
import { Stack, useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ALL_TECHNIQUES } from "../data/techniques";
import { useGymStore, withAlpha } from "../store/gym";

export default function GymCurriculumIndex() {
  const router = useRouter();
  const isGymMode = useGymStore((s) => s.isGymMode);
  const accentColor = useGymStore((s) => s.accentColor);
  const overrides = useGymStore((s) => s.techniqueOverrides);
  const [q, setQ] = useState("");

  useEffect(() => {
    if (!isGymMode) {
      router.replace("/settings");
    }
  }, [isGymMode, router]);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return ALL_TECHNIQUES;
    return ALL_TECHNIQUES.filter(
      (t) =>
        t.name.toLowerCase().includes(needle) ||
        t.shortDescription.toLowerCase().includes(needle) ||
        t.position.toLowerCase().includes(needle) ||
        t.id.toLowerCase().includes(needle)
    );
  }, [q]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#050505" }} edges={["bottom", "left", "right"]}>
      <Stack.Screen options={{ title: "Curriculum" }} />
      <ScrollView contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: 32 }}>
        <Text style={{ color: "#FFFFFF", fontSize: 26, fontWeight: "900" }}>Curriculum</Text>
        <Text style={{ color: "#AAB2C2", lineHeight: 20 }}>
          Pick a technique to customize copy and video for your gym. Core IDs stay the same for progress and notes.
        </Text>
        <TextInput
          value={q}
          onChangeText={setQ}
          placeholder="Search by name, position, or id…"
          placeholderTextColor="#5D6574"
          style={{
            borderWidth: 1,
            borderColor: "#2A2A2A",
            borderRadius: 12,
            backgroundColor: "#101010",
            color: "#FFFFFF",
            paddingHorizontal: 14,
            paddingVertical: 12,
            fontSize: 16,
          }}
        />
        {filtered.map((t) => {
          const touched = Boolean(overrides[t.id] && Object.keys(overrides[t.id] ?? {}).length);
          return (
            <Pressable
              key={t.id}
              onPress={() => router.push(`/gym-curriculum/${t.id}` as Href)}
              style={{
                borderWidth: 1,
                borderColor: touched ? withAlpha(accentColor, 0.55) : "#242424",
                backgroundColor: "#101010",
                borderRadius: 12,
                padding: 14,
                gap: 4,
              }}
            >
              <View style={{ flexDirection: "row", justifyContent: "space-between", gap: 8 }}>
                <Text style={{ color: "#FFFFFF", fontSize: 16, fontWeight: "900", flex: 1 }}>{t.name}</Text>
                {touched ? (
                  <Text style={{ color: "#D4B06A", fontWeight: "800", fontSize: 12 }}>CUSTOM</Text>
                ) : null}
              </View>
              <Text style={{ color: "#8E96A5", fontSize: 12, textTransform: "capitalize" }}>
                {t.belt} · {t.position}
              </Text>
              <Text style={{ color: "#AAB2C2", fontSize: 13 }} numberOfLines={2}>
                {t.shortDescription}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}
