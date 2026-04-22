import { Stack, useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { Linking, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { getTechniqueById } from "../data/techniques";
import { useGymStore, withAlpha } from "../store/gym";
import { loadNotes, type SessionNote } from "../store/notes";
import {
  addToMyLibrary,
  defaultProgress,
  loadProgress,
  toggleLearnedTechnique,
  type UserProgress,
} from "../store/progress";

export default function TechniqueDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [progress, setProgress] = useState<UserProgress>(defaultProgress);
  const technique = getTechniqueById(id ?? "");

  useEffect(() => {
    void loadProgress().then(setProgress);
  }, []);

  return (
    <>
      <Stack.Screen
        options={{
          title: technique?.name || "Technique",
          headerShown: true,
          headerBackVisible: true,
          headerShadowVisible: false,
          headerStyle: { backgroundColor: "#111" },
          headerTintColor: "#fff",
          headerTitleStyle: { fontWeight: "bold", color: "#fff" },
          headerBackTitle: "",
        }}
      />
      {!technique ? (
        <SafeAreaView style={{ flex: 1, backgroundColor: "#050505" }} edges={["bottom", "left", "right"]}>
          <View style={{ flex: 1, justifyContent: "center", alignItems: "center", padding: 24 }}>
            <Text style={{ color: "#FFFFFF", fontSize: 18, fontWeight: "700" }}>Technique not found</Text>
            <Text style={{ color: "#9AA2B1", marginTop: 6, textAlign: "center" }}>
              Return to Library and choose another movement.
            </Text>
          </View>
        </SafeAreaView>
      ) : (
        <TechniqueBody
          technique={technique}
          progress={progress}
          onProgressChange={setProgress}
          onOpenNotes={() => router.push(`/notes?techniqueId=${technique.id}`)}
        />
      )}
    </>
  );
}

function TechniqueBody({
  technique,
  progress,
  onProgressChange,
  onOpenNotes,
}: {
  technique: NonNullable<ReturnType<typeof getTechniqueById>>;
  progress: UserProgress;
  onProgressChange: (p: UserProgress) => void;
  onOpenNotes: () => void;
}) {
  const mastered = progress.learnedTechniqueIds.includes(technique.id);
  const accentColor = useGymStore((state) => state.accentColor);
  const [inMyLibrary, setInMyLibrary] = useState(false);
  const [linkedNotes, setLinkedNotes] = useState<SessionNote[]>([]);

  const refreshMyLibrary = useCallback(() => {
    void loadProgress().then((state) => {
      setInMyLibrary(state.myTechniques.includes(technique.id));
    });
  }, [technique.id]);

  const refreshLinkedNotes = useCallback(() => {
    void loadNotes().then((notes) => {
      setLinkedNotes(notes.filter((note) => note.techniques.some((tech) => tech.id === technique.id)));
    });
  }, [technique.id]);

  useFocusEffect(
    useCallback(() => {
      refreshMyLibrary();
      refreshLinkedNotes();
    }, [refreshLinkedNotes, refreshMyLibrary])
  );

  async function onToggleMastered() {
    const updated = await toggleLearnedTechnique(technique.id);
    onProgressChange(updated);
  }

  async function onAddToMyLibrary() {
    await addToMyLibrary(technique.id);
    setInMyLibrary(true);
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#050505" }} edges={["bottom", "left", "right"]}>
      <ScrollView
        style={{ flex: 1, backgroundColor: "#050505" }}
        contentContainerStyle={{ paddingBottom: 32 }}
        keyboardShouldPersistTaps="handled"
      >
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
                  padding: 14,
                }}
              >
                <View
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 999,
                    backgroundColor: accentColor,
                    justifyContent: "center",
                    alignItems: "center",
                    marginTop: 2,
                  }}
                >
                  <Text style={{ color: "#FFFFFF", fontWeight: "900", fontSize: 13 }}>{index + 1}</Text>
                </View>
                <Text style={{ color: "#E8ECF5", flex: 1, fontSize: 16, lineHeight: 24 }}>{step}</Text>
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
            <Text style={{ color: "#B7BECC", marginTop: 4 }}>
              Open the full video, study details, then drill with control and intention.
            </Text>
          </Pressable>

          <Pressable
            onPress={() => void onToggleMastered()}
            style={{
              borderWidth: 1,
              borderColor: mastered ? "#D4B06A" : accentColor,
              backgroundColor: mastered ? "rgba(212,176,106,0.16)" : withAlpha(accentColor, 0.16),
              borderRadius: 14,
              padding: 15,
              alignItems: "center",
            }}
          >
            <Text style={{ color: "#FFFFFF", fontWeight: "900", fontSize: 16 }}>
              {mastered ? "Mastered - Tap to Unmark" : "Mark as Mastered"}
            </Text>
          </Pressable>

          <Pressable
            onPress={() => void onAddToMyLibrary()}
            disabled={inMyLibrary}
            style={{
              borderWidth: 1,
              borderColor: inMyLibrary ? "#2A4A2A" : "#D4B06A",
              backgroundColor: inMyLibrary ? "rgba(60,120,60,0.15)" : "rgba(212,176,106,0.12)",
              borderRadius: 14,
              padding: 15,
              alignItems: "center",
              opacity: inMyLibrary ? 0.85 : 1,
            }}
          >
            <Text style={{ color: "#FFFFFF", fontWeight: "900", fontSize: 16 }}>
              {inMyLibrary ? "In My Library" : "Add to My Library"}
            </Text>
            <Text style={{ color: "#8E96A5", marginTop: 6, textAlign: "center", fontSize: 13 }}>
              Link this technique from the Notes tab to class notes, or save it here for quick access in Library → My
              Library.
            </Text>
          </Pressable>

          <View style={sectionCard}>
            <Text style={sectionTitle}>Class Notes</Text>
            <Text style={{ color: "#9AA2B1" }}>
              {linkedNotes.length === 0
                ? "No linked notes yet. Save a class note and attach this technique."
                : `${linkedNotes.length} linked note${linkedNotes.length === 1 ? "" : "s"} found.`}
            </Text>
            {linkedNotes.slice(0, 3).map((note) => (
              <View
                key={note.id}
                style={{
                  borderWidth: 1,
                  borderColor: "#252525",
                  borderRadius: 10,
                  backgroundColor: "#0B0B0B",
                  padding: 10,
                }}
              >
                <Text style={{ color: "#C7CDDA" }} numberOfLines={3}>
                  {note.text}
                </Text>
              </View>
            ))}
            <Pressable
              onPress={onOpenNotes}
              style={{
                borderWidth: 1,
                borderColor: accentColor,
                backgroundColor: withAlpha(accentColor, 0.18),
                borderRadius: 12,
                padding: 12,
                alignItems: "center",
              }}
            >
              <Text style={{ color: "#FFFFFF", fontWeight: "900" }}>
                {linkedNotes.length === 0 ? "Create / Link Notes" : "Review Notes for This Technique"}
              </Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
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
  lineHeight: 22,
  fontSize: 15,
};
