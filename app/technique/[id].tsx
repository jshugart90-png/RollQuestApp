import { Stack, useLocalSearchParams } from "expo-router";
import { Linking, Pressable, ScrollView, Text, View } from "react-native";
import { getTechniqueById } from "../data/techniques";
import { defaultProgress, loadProgress, toggleLearnedTechnique, type UserProgress } from "../store/progress";
import { useEffect, useState } from "react";

export default function TechniqueDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [progress, setProgress] = useState<UserProgress>(defaultProgress);
  const technique = getTechniqueById(id ?? "");

  useEffect(() => {
    void loadProgress().then(setProgress);
  }, []);

  if (!technique) {
    return (
      <View style={{ flex: 1, backgroundColor: "#050505", justifyContent: "center", alignItems: "center" }}>
        <Text style={{ color: "#FFFFFF", fontSize: 18, fontWeight: "700" }}>Technique not found</Text>
        <Text style={{ color: "#9AA2B1", marginTop: 6 }}>Return to Library and choose another movement.</Text>
      </View>
    );
  }

  const mastered = progress.learnedTechniqueIds.includes(technique.id);

  async function onToggleMastered() {
    const updated = await toggleLearnedTechnique(technique.id);
    setProgress(updated);
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: technique.name,
          headerBackTitleVisible: false,
        }}
      />
      <ScrollView style={{ flex: 1, backgroundColor: "#050505" }} contentContainerStyle={{ paddingBottom: 24 }}>
        <View
          style={{
            padding: 18,
            backgroundColor: "#0E0E0E",
            borderBottomWidth: 1,
            borderBottomColor: "#1E1E1E",
            gap: 8,
          }}
        >
          <Text style={{ color: "#D4B06A", fontWeight: "800" }}>{technique.position}</Text>
          <Text style={{ color: "#FFFFFF", fontSize: 30, fontWeight: "900" }}>{technique.name}</Text>
          <Text style={{ color: "#AAB2C2" }}>
            {technique.belt.toUpperCase()} BELT • {technique.category} • {technique.difficulty}
          </Text>
          <Text style={{ color: "#B7BECC", marginTop: 4 }}>{technique.shortDescription}</Text>
        </View>

        <View style={{ padding: 16, gap: 14 }}>
          <View style={sectionCard}>
            <Text style={sectionTitle}>Step-by-Step Breakdown</Text>
            {technique.fullStepByStep.map((step, index) => (
              <View
                key={`${technique.id}-step-${index}`}
                style={{
                  flexDirection: "row",
                  gap: 12,
                  alignItems: "flex-start",
                  backgroundColor: "#0B0B0B",
                  borderWidth: 1,
                  borderColor: "#1B1B1B",
                  borderRadius: 12,
                  padding: 12,
                }}
              >
                <View
                  style={{
                    width: 26,
                    height: 26,
                    borderRadius: 999,
                    backgroundColor: "#E10600",
                    justifyContent: "center",
                    alignItems: "center",
                    marginTop: 2,
                  }}
                >
                  <Text style={{ color: "#FFFFFF", fontWeight: "900", fontSize: 12 }}>{index + 1}</Text>
                </View>
                <Text style={{ color: "#E8ECF5", flex: 1, lineHeight: 21 }}>{step}</Text>
              </View>
            ))}
          </View>

          <View style={sectionCard}>
            <Text style={sectionTitle}>Coaching Tips</Text>
            {technique.tips.map((tip, index) => (
              <Text key={`${technique.id}-tip-${index}`} style={bulletText}>
                • {tip}
              </Text>
            ))}
          </View>

          <View style={sectionCard}>
            <Text style={sectionTitle}>Common Mistakes</Text>
            {technique.commonMistakes.map((mistake, index) => (
              <Text key={`${technique.id}-mistake-${index}`} style={bulletText}>
                • {mistake}
              </Text>
            ))}
          </View>

          <Pressable
            onPress={() => Linking.openURL(technique.youtubeUrl)}
            style={{
              borderWidth: 1,
              borderColor: "#D4B06A",
              backgroundColor: "rgba(212,176,106,0.12)",
              borderRadius: 14,
              padding: 14,
            }}
          >
            <Text style={{ color: "#D4B06A", fontWeight: "900", fontSize: 16 }}>Watch Exact YouTube Breakdown</Text>
            <Text style={{ color: "#B7BECC", marginTop: 4 }}>Open the full video, study details, then drill with control and intention.</Text>
          </Pressable>

          <Pressable
            onPress={() => void onToggleMastered()}
            style={{
              borderWidth: 1,
              borderColor: mastered ? "#D4B06A" : "#E10600",
              backgroundColor: mastered ? "rgba(212,176,106,0.16)" : "rgba(225,6,0,0.16)",
              borderRadius: 14,
              padding: 15,
              alignItems: "center",
            }}
          >
            <Text style={{ color: "#FFFFFF", fontWeight: "900", fontSize: 16 }}>
              {mastered ? "Mastered - Tap to Unmark" : "Mark as Mastered"}
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </>
  );
}

const sectionCard = {
  borderWidth: 1,
  borderColor: "#1F1F1F",
  backgroundColor: "#101010",
  borderRadius: 14,
  padding: 14,
  gap: 10,
};

const sectionTitle = {
  color: "#FFFFFF",
  fontSize: 18,
  fontWeight: "900" as const,
};

const bulletText = {
  color: "#D3D9E5",
  lineHeight: 21,
};
