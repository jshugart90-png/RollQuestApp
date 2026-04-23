import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import { Alert, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { getTechniqueById, type Technique } from "../data/techniques";
import { useGymStore, withAlpha } from "../store/gym";

const DIFFICULTIES = ["beginner", "intermediate", "advanced"] as const;

function linesToArray(text: string): string[] {
  return text
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);
}

export default function GymCurriculumEditScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const accentColor = useGymStore((s) => s.accentColor);
  const isGymMode = useGymStore((s) => s.isGymMode);
  const techniqueOverrides = useGymStore((s) => s.techniqueOverrides);
  const setTechniqueOverride = useGymStore((s) => s.setTechniqueOverride);
  const clearTechniqueOverride = useGymStore((s) => s.clearTechniqueOverride);

  const base = useMemo(() => (id ? getTechniqueById(id) : undefined), [id]);
  const patch = id ? techniqueOverrides[id] : undefined;
  const merged = useMemo<Technique | undefined>(
    () => (base ? { ...base, ...(patch ?? {}) } : undefined),
    [base, patch]
  );

  const [name, setName] = useState("");
  const [shortDescription, setShortDescription] = useState("");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [category, setCategory] = useState("");
  const [difficulty, setDifficulty] = useState<Technique["difficulty"]>("beginner");
  const [tipsText, setTipsText] = useState("");
  const [stepsText, setStepsText] = useState("");
  const [mistakesText, setMistakesText] = useState("");

  useEffect(() => {
    if (!isGymMode) {
      router.replace("/settings");
    }
  }, [isGymMode, router]);

  useEffect(() => {
    if (!merged) return;
    setName(merged.name);
    setShortDescription(merged.shortDescription);
    setYoutubeUrl(merged.youtubeUrl);
    setCategory(merged.category);
    setDifficulty(merged.difficulty);
    setTipsText(merged.tips.join("\n"));
    setStepsText(merged.fullStepByStep.join("\n"));
    setMistakesText(merged.commonMistakes.join("\n"));
  }, [merged]);

  if (!merged || !base) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: "#050505" }} edges={["bottom", "left", "right"]}>
        <Stack.Screen options={{ title: "Not found" }} />
        <View style={{ padding: 24 }}>
          <Text style={{ color: "#fff", fontWeight: "800" }}>Technique not found.</Text>
          <Pressable onPress={() => router.back()} style={{ marginTop: 16 }}>
            <Text style={{ color: accentColor }}>Go back</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  function onSave() {
    if (!id || !base) return;
    const tips = linesToArray(tipsText);
    const steps = linesToArray(stepsText);
    const mistakes = linesToArray(mistakesText);
    setTechniqueOverride(id, {
      name: name.trim() || base.name,
      shortDescription: shortDescription.trim() || base.shortDescription,
      youtubeUrl: youtubeUrl.trim() || base.youtubeUrl,
      category: category.trim() || base.category,
      difficulty,
      tips: tips.length ? tips : base.tips,
      fullStepByStep: steps.length ? steps : base.fullStepByStep,
      commonMistakes: mistakes.length ? mistakes : base.commonMistakes,
    });
    Alert.alert("Saved", "Overrides apply while Gym owner mode is on.", [
      { text: "OK", onPress: () => router.back() },
    ]);
  }

  function onRestore() {
    if (!id) return;
    Alert.alert("Restore master version?", "Removes your gym overrides for this technique.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Restore",
        style: "destructive",
        onPress: () => {
          clearTechniqueOverride(id);
          router.back();
        },
      },
    ]);
  }

  return (
    <>
      <Stack.Screen options={{ title: merged.name }} />
      <SafeAreaView style={{ flex: 1, backgroundColor: "#050505" }} edges={["bottom", "left", "right"]}>
        <ScrollView contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: 40 }}>
          <Text style={{ color: "#8E96A5", fontSize: 12 }}>ID: {id}</Text>
          <Text style={{ color: "#AAB2C2", lineHeight: 20 }}>
            Edits are layered on the master library. Members still reference the same technique ID in notes and
            progress.
          </Text>

          <Field label="Name" value={name} onChangeText={setName} />
          <Field label="Short description" value={shortDescription} onChangeText={setShortDescription} multiline />
          <Field label="YouTube URL" value={youtubeUrl} onChangeText={setYoutubeUrl} autoCapitalize="none" />
          <Field label="Category" value={category} onChangeText={setCategory} />

          <Text style={{ color: "#8E96A5", fontWeight: "700", marginTop: 4 }}>Difficulty</Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
            {DIFFICULTIES.map((d) => {
              const on = difficulty === d;
              return (
                <Pressable
                  key={d}
                  onPress={() => setDifficulty(d)}
                  style={{
                    paddingHorizontal: 12,
                    paddingVertical: 8,
                    borderRadius: 999,
                    borderWidth: 1,
                    borderColor: on ? accentColor : "#333",
                    backgroundColor: on ? withAlpha(accentColor, 0.2) : "#121212",
                  }}
                >
                  <Text style={{ color: "#fff", fontWeight: "800", textTransform: "capitalize" }}>{d}</Text>
                </Pressable>
              );
            })}
          </View>

          <Multiline label="Tips (one per line)" value={tipsText} onChangeText={setTipsText} />
          <Multiline label="Steps (one per line)" value={stepsText} onChangeText={setStepsText} />
          <Multiline label="Common mistakes (one per line)" value={mistakesText} onChangeText={setMistakesText} />

          <Pressable
            onPress={onSave}
            style={{
              marginTop: 8,
              borderRadius: 12,
              padding: 14,
              alignItems: "center",
              borderWidth: 1,
              borderColor: withAlpha(accentColor, 0.75),
              backgroundColor: withAlpha(accentColor, 0.22),
            }}
          >
            <Text style={{ color: "#FFFFFF", fontWeight: "900" }}>Save overrides</Text>
          </Pressable>

          <Pressable
            onPress={onRestore}
            style={{
              borderRadius: 12,
              padding: 14,
              alignItems: "center",
              borderWidth: 1,
              borderColor: "#5A2A2A",
              backgroundColor: "#221010",
            }}
          >
            <Text style={{ color: "#FFB4B4", fontWeight: "800" }}>Restore master copy</Text>
          </Pressable>
        </ScrollView>
      </SafeAreaView>
    </>
  );
}

function Field({
  label,
  value,
  onChangeText,
  multiline,
  autoCapitalize,
}: {
  label: string;
  value: string;
  onChangeText: (t: string) => void;
  multiline?: boolean;
  autoCapitalize?: "none" | "sentences";
}) {
  return (
    <View style={{ gap: 6 }}>
      <Text style={{ color: "#8E96A5", fontWeight: "700" }}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        multiline={multiline}
        autoCapitalize={autoCapitalize ?? "sentences"}
        style={{
          borderWidth: 1,
          borderColor: "#2A2A2A",
          borderRadius: 10,
          backgroundColor: "#101010",
          color: "#FFFFFF",
          paddingHorizontal: 12,
          paddingVertical: 10,
          fontSize: 16,
          minHeight: multiline ? 80 : undefined,
          textAlignVertical: multiline ? "top" : "center",
        }}
      />
    </View>
  );
}

function Multiline({
  label,
  value,
  onChangeText,
}: {
  label: string;
  value: string;
  onChangeText: (t: string) => void;
}) {
  return (
    <View style={{ gap: 6 }}>
      <Text style={{ color: "#8E96A5", fontWeight: "700" }}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        multiline
        style={{
          borderWidth: 1,
          borderColor: "#2A2A2A",
          borderRadius: 10,
          backgroundColor: "#101010",
          color: "#FFFFFF",
          paddingHorizontal: 12,
          paddingVertical: 10,
          fontSize: 16,
          minHeight: 120,
          textAlignVertical: "top",
        }}
      />
    </View>
  );
}
