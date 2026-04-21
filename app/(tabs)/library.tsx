import { useFocusEffect } from "expo-router";
import React, { useCallback, useMemo, useState } from "react";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";
import techniquesData from "../data/techniques.json";
import { defaultProgress, loadProgress, toggleLearnedTechnique, type UserProgress } from "../store/progress";

type Technique = {
  id: string;
  name: string;
  belt: string;
  stripes: number;
  category: string;
  shortDescription: string;
};

const techniques = techniquesData as Technique[];

export default function LibraryScreen() {
  const [query, setQuery] = useState("");
  const [progress, setProgress] = useState<UserProgress>(defaultProgress);

  useFocusEffect(
    useCallback(() => {
      void loadProgress().then(setProgress);
    }, [])
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return techniques;
    return techniques.filter(
      (item) =>
        item.name.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q) ||
        item.belt.toLowerCase().includes(q)
    );
  }, [query]);

  async function onToggleLearned(id: string) {
    const updated = await toggleLearnedTechnique(id);
    setProgress(updated);
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: "#050505" }} contentContainerStyle={{ padding: 16, gap: 12 }}>
      <Text style={{ color: "#FFFFFF", fontSize: 28, fontWeight: "900" }}>Technique Library</Text>
      <TextInput
        value={query}
        onChangeText={setQuery}
        placeholder="Search by technique, category, or belt..."
        placeholderTextColor="#7C8392"
        style={{
          borderWidth: 1,
          borderColor: "#232323",
          backgroundColor: "#101010",
          color: "#FFFFFF",
          borderRadius: 12,
          paddingHorizontal: 12,
          paddingVertical: 10,
        }}
      />

      {filtered.map((tech) => {
        const learned = progress.learnedTechniqueIds.includes(tech.id);
        return (
          <Pressable
            key={tech.id}
            onPress={() => void onToggleLearned(tech.id)}
            style={{
              borderWidth: 1,
              borderColor: learned ? "#E10600" : "#222",
              backgroundColor: "#0F0F0F",
              borderRadius: 14,
              padding: 12,
              gap: 6,
            }}
          >
            <Text style={{ color: "#FFF", fontSize: 17, fontWeight: "800" }}>{tech.name}</Text>
            <Text style={{ color: "#AAB2C2" }}>
              {tech.belt} • Stripe {tech.stripes} • {tech.category}
            </Text>
            <Text style={{ color: "#8E96A5" }}>{tech.shortDescription}</Text>
            <Text style={{ color: learned ? "#E10600" : "#7FD1FF", fontWeight: "700" }}>
              {learned ? "Marked learned" : "Tap to mark learned"}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}
