import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useMemo, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { POSITION_TABS, TECHNIQUES, type PositionTab } from "../data/techniques";
import { defaultProgress, loadProgress, type UserProgress } from "../store/progress";

export default function LibraryScreen() {
  const router = useRouter();
  const [activePosition, setActivePosition] = useState<PositionTab>("Back / Rear Mount");
  const [progress, setProgress] = useState<UserProgress>(defaultProgress);

  useFocusEffect(
    useCallback(() => {
      void loadProgress().then(setProgress);
    }, [])
  );

  const filtered = useMemo(
    () =>
      TECHNIQUES.filter(
        (item) => item.position === activePosition && item.belt === progress.currentBelt
      ),
    [activePosition, progress.currentBelt]
  );

  return (
    <ScrollView style={{ flex: 1, backgroundColor: "#050505" }} contentContainerStyle={{ padding: 16, gap: 14 }}>
      <Text style={{ color: "#FFFFFF", fontSize: 28, fontWeight: "900" }}>Technique Library</Text>
      <Text style={{ color: "#D4B06A", fontWeight: "700" }}>
        {progress.currentBelt} Belt Curriculum
      </Text>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingRight: 8 }}>
        {POSITION_TABS.map((position) => {
          const selected = position === activePosition;
          return (
            <Pressable
              key={position}
              onPress={() => setActivePosition(position)}
              style={{
                paddingHorizontal: 12,
                paddingVertical: 9,
                borderRadius: 999,
                borderWidth: 1,
                borderColor: selected ? "#E10600" : "#2A2A2A",
                backgroundColor: selected ? "rgba(225,6,0,0.2)" : "#101010",
              }}
            >
              <Text style={{ color: selected ? "#FFFFFF" : "#9AA2B1", fontWeight: "700" }}>{position}</Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <View
        style={{
          borderWidth: 1,
          borderColor: "#2A2A2A",
          backgroundColor: "#101010",
          borderRadius: 12,
          padding: 12,
        }}
      >
        <Text style={{ color: "#FFFFFF", fontWeight: "800", fontSize: 16 }}>{activePosition}</Text>
        <Text style={{ color: "#9AA2B1", marginTop: 4 }}>
          {filtered.length} technique{filtered.length === 1 ? "" : "s"} available for {progress.currentBelt} belt.
        </Text>
      </View>

      {filtered.map((tech) => {
        const mastered = progress.learnedTechniqueIds.includes(tech.id);
        return (
          <Pressable
            key={tech.id}
            onPress={() => router.push(`/technique/${tech.id}`)}
            style={{
              borderWidth: 1,
              borderColor: mastered ? "#D4B06A" : "#222",
              backgroundColor: "#0F0F0F",
              borderRadius: 14,
              padding: 12,
              gap: 6,
            }}
          >
            <Text style={{ color: "#FFF", fontSize: 17, fontWeight: "800" }}>{tech.name}</Text>
            <Text style={{ color: "#AAB2C2" }}>
              {tech.belt} • Stripe {tech.stripes} • {tech.difficulty}
            </Text>
            <Text style={{ color: "#8E96A5" }}>{tech.shortDescription}</Text>
            <Text style={{ color: mastered ? "#D4B06A" : "#E10600", fontWeight: "800" }}>
              {mastered ? "Mastered - Keep Sharp" : "Open Technique"}
            </Text>
          </Pressable>
        );
      })}

      {filtered.length === 0 ? (
        <View
          style={{
            borderWidth: 1,
            borderColor: "#232323",
            borderRadius: 14,
            backgroundColor: "#0D0D0D",
            padding: 14,
          }}
        >
          <Text style={{ color: "#FFFFFF", fontWeight: "700" }}>No techniques in this tab yet.</Text>
          <Text style={{ color: "#8E96A5", marginTop: 4 }}>
            More {activePosition.toLowerCase()} content will unlock soon.
          </Text>
        </View>
      ) : null}
    </ScrollView>
  );
}
