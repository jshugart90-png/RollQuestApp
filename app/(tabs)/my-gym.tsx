import type { Href } from "expo-router";
import { Link, useRouter } from "expo-router";
import React, { useState } from "react";
import { ActivityIndicator, Alert, Pressable, Text, TextInput, View } from "react-native";
import QRCode from "react-native-qrcode-svg";
import { NestableDraggableFlatList, NestableScrollContainer, ScaleDecorator } from "react-native-draggable-flatlist";
import { SafeAreaView } from "react-native-safe-area-context";
import { GymScheduleEditor } from "../components/GymScheduleEditor";
import type { PositionTab, Technique } from "../data/techniques";
import { POSITION_TABS } from "../data/techniques";
import { useResolvedTechniques } from "../hooks/useResolvedTechniques";
import { useAssignmentsStore } from "../store/assignments";
import { useGymStore, withAlpha } from "../store/gym";
import { loadProgress } from "../store/progress";
import { explainLogoUrlIssue, isLikelyDirectImageUrl } from "../utils/gym-logo";
import { pickGymLogoFromLibrary } from "../utils/pick-gym-logo";

type TileId = "logo" | "curriculum" | "qr" | "customMoves" | "schedule" | "assignments" | "roster" | "completion";
const DEFAULT_TILE_ORDER: TileId[] = ["logo", "curriculum", "qr", "customMoves", "schedule", "assignments", "roster", "completion"];

export default function MyGymScreen() {
  const router = useRouter();
  const isGymMode = useGymStore((s) => s.isGymMode);
  const accentColor = useGymStore((s) => s.accentColor);
  const gymName = useGymStore((s) => s.gymName);
  const logoUrl = useGymStore((s) => s.logoUrl);
  const schedule = useGymStore((s) => s.schedule);
  const setLogoUrl = useGymStore((s) => s.setLogoUrl);
  const customTechniques = useGymStore((s) => s.customTechniques);
  const upsertScheduleClass = useGymStore((s) => s.upsertScheduleClass);
  const removeScheduleClass = useGymStore((s) => s.removeScheduleClass);
  const reorderScheduleForDay = useGymStore((s) => s.reorderScheduleForDay);
  const duplicateScheduleClassToDays = useGymStore((s) => s.duplicateScheduleClassToDays);
  const upsertCustomTechnique = useGymStore((s) => s.upsertCustomTechnique);
  const removeCustomTechnique = useGymStore((s) => s.removeCustomTechnique);
  const buildGymShareCode = useGymStore((s) => s.buildGymShareCode);
  const myGymTileOrder = useGymStore((s) => s.myGymTileOrder);
  const setMyGymTileOrder = useGymStore((s) => s.setMyGymTileOrder);
  const assignments = useAssignmentsStore((s) => s.assignments);
  const roster = useAssignmentsStore((s) => s.roster);
  const createAssignment = useAssignmentsStore((s) => s.createAssignment);
  const updateAssignment = useAssignmentsStore((s) => s.updateAssignment);
  const reorderAssignments = useAssignmentsStore((s) => s.reorderAssignments);
  const removeAssignment = useAssignmentsStore((s) => s.removeAssignment);
  const resolvedTechniques = useResolvedTechniques();

  const [logoInput, setLogoInput] = useState(logoUrl ?? "");
  const [pickingLogo, setPickingLogo] = useState(false);
  const [customMoveName, setCustomMoveName] = useState("");
  const [customMovePosition, setCustomMovePosition] = useState<PositionTab>("Guard Work");
  const [customMoveDescription, setCustomMoveDescription] = useState("");
  const [syncCode, setSyncCode] = useState(() => buildGymShareCode());
  const [isDraggingSchedule, setIsDraggingSchedule] = useState(false);
  const [myLibraryIds, setMyLibraryIds] = useState<string[]>([]);
  const [assignmentTitle, setAssignmentTitle] = useState("");
  const [assignmentDescription, setAssignmentDescription] = useState("");
  const [assignmentDueDate, setAssignmentDueDate] = useState("");
  const [assignmentTechniqueSearch, setAssignmentTechniqueSearch] = useState("");
  const [assignmentTechniqueIds, setAssignmentTechniqueIds] = useState<string[]>([]);
  const [editingAssignmentId, setEditingAssignmentId] = useState<string | null>(null);
  const [isReorderingTiles, setIsReorderingTiles] = useState(false);

  React.useEffect(() => {
    setLogoInput(logoUrl ?? "");
  }, [logoUrl]);

  React.useEffect(() => {
    void loadProgress().then((progress) => {
      setMyLibraryIds(progress.myTechniques);
    });
  }, []);

  if (!isGymMode) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: "#050505" }} edges={["top"]}>
        <View style={{ padding: 20, gap: 14 }}>
          <Text style={{ color: "#FFFFFF", fontSize: 28, fontWeight: "900" }}>My Gym</Text>
          <Text style={{ color: "#AAB2C2", lineHeight: 22 }}>
            Gym branding, class schedule, logo, and curriculum tools are available when Gym owner mode is on in
            Settings.
          </Text>
          <Link href="/settings" asChild>
            <Pressable
              style={{
                marginTop: 8,
                borderRadius: 12,
                padding: 14,
                alignItems: "center",
                borderWidth: 1,
                borderColor: withAlpha(accentColor, 0.65),
                backgroundColor: withAlpha(accentColor, 0.18),
              }}
            >
              <Text style={{ color: "#FFFFFF", fontWeight: "900" }}>Open Settings</Text>
            </Pressable>
          </Link>
        </View>
      </SafeAreaView>
    );
  }

  async function onChoosePhoto() {
    setPickingLogo(true);
    try {
      const uri = await pickGymLogoFromLibrary();
      if (uri) setLogoUrl(uri);
    } catch {
      Alert.alert("Could not save logo", "Try again or paste a direct image URL instead.");
    } finally {
      setPickingLogo(false);
    }
  }

  function applyLogoUrl() {
    const raw = logoInput.trim();
    if (!raw) {
      setLogoUrl(undefined);
      return;
    }
    if (!isLikelyDirectImageUrl(raw)) {
      const hint = explainLogoUrlIssue(raw);
      Alert.alert("That link is not a direct image", hint || "Use a .png or .jpg URL, or Choose photo.");
      return;
    }
    setLogoUrl(raw);
  }

  function addCustomMove() {
    const name = customMoveName.trim();
    if (!name) {
      Alert.alert("Missing move name", "Add a move name before saving.");
      return;
    }
    const id = `custom-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const move: Technique = {
      id,
      name,
      belt: "white",
      position: customMovePosition,
      category: "Custom Gym Move",
      shortDescription: customMoveDescription.trim() || "Gym-defined movement.",
      fullStepByStep: [customMoveDescription.trim() || "Coach-defined sequence."],
      tips: ["Customize this movement from Curriculum if needed."],
      commonMistakes: ["Not yet defined."],
      youtubeUrl: "https://www.youtube.com/",
      difficulty: "beginner",
      curriculum: {
        sourceGym: gymName,
        track: "Gym Custom",
        isMasterLibrary: false,
        tags: ["custom", "gym"],
      },
    };
    upsertCustomTechnique(move);
    setCustomMoveName("");
    setCustomMoveDescription("");
  }

  function refreshShareCode() {
    setSyncCode(buildGymShareCode());
  }

  const ownerTechniqueChoices = resolvedTechniques.filter((technique) => {
    if (myLibraryIds.length > 0 && !myLibraryIds.includes(technique.id)) return false;
    const q = assignmentTechniqueSearch.trim().toLowerCase();
    if (!q) return true;
    return (
      technique.name.toLowerCase().includes(q) ||
      technique.position.toLowerCase().includes(q) ||
      technique.category.toLowerCase().includes(q)
    );
  });

  const fromStore = myGymTileOrder.filter((id): id is TileId => DEFAULT_TILE_ORDER.includes(id as TileId));
  const missingTiles = DEFAULT_TILE_ORDER.filter((id) => !fromStore.includes(id));
  const tileOrder: TileId[] = [...fromStore, ...missingTiles];

  function toggleAssignmentTechnique(id: string) {
    setAssignmentTechniqueIds((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
  }

  function onCreateAssignment() {
    const title = assignmentTitle.trim();
    const description = assignmentDescription.trim();
    if (!title || !description) {
      Alert.alert("Missing assignment details", "Add both a title and description before creating homework.");
      return;
    }
    const payload = {
      title,
      description,
      dueDate: assignmentDueDate.trim() || undefined,
      linkedTechniqueIds: assignmentTechniqueIds,
    };
    if (editingAssignmentId) {
      updateAssignment(editingAssignmentId, payload);
    } else {
      createAssignment(payload);
    }
    clearAssignmentDraft();
  }

  function clearAssignmentDraft() {
    setEditingAssignmentId(null);
    setAssignmentTitle("");
    setAssignmentDescription("");
    setAssignmentDueDate("");
    setAssignmentTechniqueSearch("");
    setAssignmentTechniqueIds([]);
  }

  function startEditAssignment(id: string) {
    const assignment = assignments.find((item) => item.id === id);
    if (!assignment) return;
    setEditingAssignmentId(assignment.id);
    setAssignmentTitle(assignment.title);
    setAssignmentDescription(assignment.description);
    setAssignmentDueDate(assignment.dueDate ?? "");
    setAssignmentTechniqueIds(assignment.linkedTechniqueIds ?? []);
  }

  function confirmDeleteAssignment(id: string) {
    Alert.alert("Delete assignment?", "This removes it from the local prototype.", [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: () => removeAssignment(id) },
    ]);
  }

  function getTechniqueName(id: string): string {
    return resolvedTechniques.find((item) => item.id === id)?.name ?? id;
  }

  function renderTile(id: TileId) {
    if (id === "logo") {
      return (
        <View style={card}>
          <Text style={title}>Gym logo</Text>
          <Text style={{ color: "#8E96A5", fontSize: 12, lineHeight: 18 }}>
            Use a direct image URL or choose a photo.
          </Text>
          <View style={{ flexDirection: "row", gap: 10 }}>
            <Pressable onPress={() => void onChoosePhoto()} disabled={pickingLogo} style={[primaryButton, { flex: 1 }]}>
              {pickingLogo ? <ActivityIndicator color="#fff" /> : <Text style={buttonText}>Choose photo</Text>}
            </Pressable>
            {logoUrl ? (
              <Pressable onPress={() => { setLogoUrl(undefined); setLogoInput(""); }} style={secondaryButton}>
                <Text style={{ color: "#FFB4B4", fontWeight: "800" }}>Clear</Text>
              </Pressable>
            ) : null}
          </View>
          <TextInput value={logoInput} onChangeText={setLogoInput} placeholder="https://yoursite.com/images/logo.png" placeholderTextColor="#5D6574" autoCapitalize="none" autoCorrect={false} style={inputStyle} />
          <Pressable onPress={applyLogoUrl} style={secondaryButton}>
            <Text style={buttonText}>Apply URL</Text>
          </Pressable>
        </View>
      );
    }
    if (id === "curriculum") {
      return (
        <Pressable onPress={() => router.push("/gym-curriculum" as Href)} style={[card, { borderColor: withAlpha("#D4B06A", 0.55), backgroundColor: "rgba(212,176,106,0.12)" }]}>
          <Text style={{ color: "#D4B06A", fontWeight: "900" }}>Curriculum & techniques</Text>
          <Text style={{ color: "#AAB2C2", marginTop: 4 }}>Override titles/descriptions/video links for your gym.</Text>
        </Pressable>
      );
    }
    if (id === "qr") {
      return (
        <View style={card}>
          <Text style={title}>Student gym QR</Text>
          <View style={{ alignItems: "center", justifyContent: "center", backgroundColor: "#FFFFFF", borderRadius: 12, padding: 14 }}>
            <QRCode value={syncCode} size={210} />
          </View>
          <Pressable onPress={refreshShareCode} style={primaryButton}>
            <Text style={buttonText}>Refresh gym QR</Text>
          </Pressable>
        </View>
      );
    }
    if (id === "customMoves") {
      return (
        <View style={card}>
          <Text style={title}>Custom gym moves</Text>
          <TextInput value={customMoveName} onChangeText={setCustomMoveName} placeholder="Move name" placeholderTextColor="#5D6574" style={inputStyle} />
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
            {POSITION_TABS.map((position) => {
              const selected = customMovePosition === position;
              return (
                <Pressable key={position} onPress={() => setCustomMovePosition(position)} style={{ borderWidth: 1, borderColor: selected ? accentColor : "#2A2A2A", backgroundColor: selected ? withAlpha(accentColor, 0.22) : "#0D0D0D", borderRadius: 999, paddingHorizontal: 10, paddingVertical: 6 }}>
                  <Text style={{ color: "#FFFFFF", fontWeight: "700", fontSize: 12 }}>{position}</Text>
                </Pressable>
              );
            })}
          </View>
          <TextInput value={customMoveDescription} onChangeText={setCustomMoveDescription} placeholder="Optional short description" placeholderTextColor="#5D6574" style={inputStyle} />
          <Pressable onPress={addCustomMove} style={primaryButton}>
            <Text style={buttonText}>Add custom move</Text>
          </Pressable>
          {customTechniques.map((move) => (
            <View key={move.id} style={{ borderWidth: 1, borderColor: "#242424", borderRadius: 10, backgroundColor: "#0D0D0D", padding: 10, gap: 4 }}>
              <Text style={{ color: "#FFFFFF", fontWeight: "900" }}>{move.name}</Text>
              <Text style={{ color: "#8E96A5", fontSize: 12 }}>{move.position}</Text>
              <Pressable onPress={() => removeCustomTechnique(move.id)} style={{ alignSelf: "flex-start", marginTop: 4, borderWidth: 1, borderColor: "#5A1F1F", borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6, backgroundColor: "#2A1111" }}>
                <Text style={{ color: "#FFD6D6", fontWeight: "700" }}>Delete</Text>
              </Pressable>
            </View>
          ))}
        </View>
      );
    }
    if (id === "schedule") {
      return (
        <GymScheduleEditor
          accentColor={accentColor}
          schedule={schedule}
          upsertScheduleClass={upsertScheduleClass}
          removeScheduleClass={removeScheduleClass}
          reorderScheduleForDay={reorderScheduleForDay}
          duplicateScheduleClassToDays={duplicateScheduleClassToDays}
          onDragStateChange={setIsDraggingSchedule}
        />
      );
    }
    if (id === "assignments") {
      return (
        <View style={card}>
          <Text style={title}>Homework / Assignments</Text>
          <TextInput value={assignmentTitle} onChangeText={setAssignmentTitle} placeholder="Assignment title" placeholderTextColor="#5D6574" style={inputStyle} />
          <TextInput value={assignmentDescription} onChangeText={setAssignmentDescription} placeholder="Description / coaching objective" placeholderTextColor="#5D6574" multiline style={[inputStyle, { minHeight: 84, textAlignVertical: "top" }]} />
          <TextInput value={assignmentDueDate} onChangeText={setAssignmentDueDate} placeholder="Optional due date" placeholderTextColor="#5D6574" style={inputStyle} />
          <TextInput value={assignmentTechniqueSearch} onChangeText={setAssignmentTechniqueSearch} placeholder="Search techniques to link" placeholderTextColor="#5D6574" style={inputStyle} />
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
            {ownerTechniqueChoices.slice(0, 12).map((technique) => {
              const on = assignmentTechniqueIds.includes(technique.id);
              return (
                <Pressable key={technique.id} onPress={() => toggleAssignmentTechnique(technique.id)} style={{ borderWidth: 1, borderColor: on ? accentColor : "#2A2A2A", backgroundColor: on ? withAlpha(accentColor, 0.2) : "#0D0D0D", borderRadius: 999, paddingHorizontal: 10, paddingVertical: 6 }}>
                  <Text style={{ color: "#FFFFFF", fontWeight: "700", fontSize: 12 }}>{technique.name}</Text>
                </Pressable>
              );
            })}
          </View>
          <View style={{ flexDirection: "row", gap: 8 }}>
            <Pressable onPress={onCreateAssignment} style={[primaryButton, { flex: 1 }]}>
              <Text style={buttonText}>{editingAssignmentId ? "Update assignment" : "Create assignment"}</Text>
            </Pressable>
            {editingAssignmentId ? (
              <Pressable onPress={clearAssignmentDraft} style={secondaryButton}>
                <Text style={buttonText}>Cancel</Text>
              </Pressable>
            ) : null}
          </View>
        </View>
      );
    }
    if (id === "roster") {
      return (
        <View style={card}>
          <Text style={title}>Roster (prototype)</Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
            {roster.map((student) => (
              <View key={student} style={{ borderWidth: 1, borderColor: "#2A2A2A", borderRadius: 999, paddingHorizontal: 10, paddingVertical: 6, backgroundColor: "#0D0D0D" }}>
                <Text style={{ color: "#E4EAF6", fontWeight: "700", fontSize: 12 }}>{student}</Text>
              </View>
            ))}
          </View>
        </View>
      );
    }
    return (
      <View style={card}>
        <Text style={title}>Assignment completion</Text>
        {assignments.length === 0 ? (
          <Text style={{ color: "#8E96A5" }}>No assignments yet. Create one above.</Text>
        ) : (
          <NestableDraggableFlatList
            data={assignments}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            onDragEnd={({ data }) => reorderAssignments(data.map((a) => a.id))}
            renderItem={({ item: assignment, drag, isActive }) => (
              <ScaleDecorator>
                <Pressable onLongPress={drag} delayLongPress={160} style={{ borderWidth: 1, borderColor: isActive ? withAlpha(accentColor, 0.9) : "#252525", borderRadius: 12, backgroundColor: "#0D0D0D", padding: 12, gap: 6, marginBottom: 8 }}>
                  <Text style={{ color: "#FFFFFF", fontWeight: "900" }}>{assignment.title}</Text>
                  <Text style={{ color: "#AAB2C2" }}>{assignment.description}</Text>
                  {assignment.dueDate ? <Text style={{ color: "#8E96A5" }}>Due: {assignment.dueDate}</Text> : null}
                  {(assignment.linkedTechniqueIds ?? []).length > 0 ? <Text style={{ color: "#D4B06A", fontSize: 12 }}>Linked: {(assignment.linkedTechniqueIds ?? []).map((tid) => getTechniqueName(tid)).join(", ")}</Text> : null}
                  <Text style={{ color: "#8E96A5", fontSize: 12 }}>Completed by: {(assignment.completedBy ?? []).length > 0 ? assignment.completedBy?.join(", ") : "No one yet"}</Text>
                  <View style={{ flexDirection: "row", gap: 8 }}>
                    <Pressable onPress={() => startEditAssignment(assignment.id)} style={{ borderWidth: 1, borderColor: "#3E4B6A", borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6, backgroundColor: "#162033" }}>
                      <Text style={{ color: "#DDE6FF", fontWeight: "700" }}>Edit</Text>
                    </Pressable>
                    <Pressable onPress={() => confirmDeleteAssignment(assignment.id)} style={{ borderWidth: 1, borderColor: "#5A1F1F", borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6, backgroundColor: "#2A1111" }}>
                      <Text style={{ color: "#FFD6D6", fontWeight: "700" }}>Delete</Text>
                    </Pressable>
                  </View>
                  <Text style={{ color: "#626A78", fontSize: 11 }}>Long press to reorder assignments</Text>
                </Pressable>
              </ScaleDecorator>
            )}
          />
        )}
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#050505" }} edges={["top"]}>
      <NestableScrollContainer scrollEnabled={!isDraggingSchedule && !isReorderingTiles} contentContainerStyle={{ padding: 16, gap: 14, paddingBottom: 48 }}>
        <Text style={{ color: "#FFFFFF", fontSize: 30, fontWeight: "900" }}>My Gym</Text>
        <Text style={{ color: "#8E96A5", fontSize: 12 }}>Long press any tile to reorder your My Gym layout.</Text>
        <NestableDraggableFlatList
          data={tileOrder}
          keyExtractor={(item) => item}
          scrollEnabled={false}
          onDragBegin={() => setIsReorderingTiles(true)}
          onRelease={() => setIsReorderingTiles(false)}
          onDragEnd={({ data }) => {
            setIsReorderingTiles(false);
            setMyGymTileOrder(data);
          }}
          renderItem={({ item, drag, isActive }) => (
            <ScaleDecorator>
              <Pressable onLongPress={drag} delayLongPress={160} style={{ marginBottom: 10, opacity: isActive ? 0.92 : 1 }}>
                {renderTile(item)}
                <Text style={{ color: "#626A78", fontSize: 11, marginTop: 6 }}>Long press tile to move</Text>
              </Pressable>
            </ScaleDecorator>
          )}
        />
      </NestableScrollContainer>
    </SafeAreaView>
  );
}

const card = {
  borderWidth: 1,
  borderColor: "#222",
  backgroundColor: "#101010",
  borderRadius: 14,
  padding: 14,
  gap: 10,
};

const title = {
  color: "#FFFFFF",
  fontSize: 17,
  fontWeight: "800" as const,
};

const primaryButton = {
  borderRadius: 10,
  paddingVertical: 10,
  alignItems: "center" as const,
  borderWidth: 1,
  borderColor: withAlpha("#C8102E", 0.75),
  backgroundColor: withAlpha("#C8102E", 0.2),
};

const secondaryButton = {
  borderRadius: 10,
  paddingVertical: 10,
  paddingHorizontal: 12,
  alignItems: "center" as const,
  borderWidth: 1,
  borderColor: "#333",
  backgroundColor: "#151515",
};

const buttonText = {
  color: "#FFFFFF",
  fontWeight: "800" as const,
};

const inputStyle = {
  borderWidth: 1,
  borderColor: "#2A2A2A",
  borderRadius: 10,
  backgroundColor: "#0F0F0F",
  color: "#FFFFFF",
  paddingHorizontal: 12,
  paddingVertical: 10,
  fontSize: 16,
};
