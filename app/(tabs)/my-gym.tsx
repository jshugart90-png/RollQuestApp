import type { Href } from "expo-router";
import { Link, useLocalSearchParams, useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
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

type TileId = "overview" | "announcements" | "assignments" | "completion" | "roster" | "schedule" | "customMoves" | "logo" | "qr" | "curriculum";
const DEFAULT_TILE_ORDER: TileId[] = [
  "overview",
  "announcements",
  "assignments",
  "completion",
  "roster",
  "schedule",
  "customMoves",
  "logo",
  "qr",
  "curriculum",
];

export default function MyGymScreen() {
  const { newAssignment } = useLocalSearchParams<{ newAssignment?: string }>();
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
  const announcements = useAssignmentsStore((s) => s.announcements);
  const createAssignment = useAssignmentsStore((s) => s.createAssignment);
  const updateAssignment = useAssignmentsStore((s) => s.updateAssignment);
  const reorderAssignments = useAssignmentsStore((s) => s.reorderAssignments);
  const removeAssignment = useAssignmentsStore((s) => s.removeAssignment);
  const addAnnouncement = useAssignmentsStore((s) => s.addAnnouncement);
  const removeAnnouncement = useAssignmentsStore((s) => s.removeAnnouncement);
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
  const [announcementDraft, setAnnouncementDraft] = useState("");
  const [isReorderingTiles, setIsReorderingTiles] = useState(false);

  React.useEffect(() => {
    setLogoInput(logoUrl ?? "");
  }, [logoUrl]);

  React.useEffect(() => {
    void loadProgress().then((progress) => setMyLibraryIds(progress.myTechniques));
  }, []);

  React.useEffect(() => {
    if (newAssignment === "1") {
      setEditingAssignmentId(null);
      setAssignmentTitle("");
      setAssignmentDescription("");
      setAssignmentDueDate("");
      setAssignmentTechniqueSearch("");
      setAssignmentTechniqueIds([]);
    }
  }, [newAssignment]);

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

  const rosterStats = useMemo(
    () =>
      roster.map((student) => {
        const completed = assignments.filter((item) => (item.completedBy ?? []).includes(student)).length;
        const completionPercent = assignments.length > 0 ? Math.round((completed / assignments.length) * 100) : 0;
        return { student, completed, completionPercent };
      }),
    [assignments, roster]
  );

  const fromStore = myGymTileOrder.filter((id): id is TileId => DEFAULT_TILE_ORDER.includes(id as TileId));
  const missingTiles = DEFAULT_TILE_ORDER.filter((id) => !fromStore.includes(id));
  const tileOrder: TileId[] = [...fromStore, ...missingTiles];

  if (!isGymMode) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: "#050505" }} edges={["top"]}>
        <View style={{ padding: 20, gap: 14 }}>
          <Text style={{ color: "#FFFFFF", fontSize: 30, fontWeight: "900" }}>My Gym</Text>
          <Text style={{ color: "#AAB2C2", lineHeight: 22 }}>
            Turn on Gym Owner Mode to unlock announcements, assignment workflows, roster tracking, and share tools.
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
      youtubeUrl: "",
      difficulty: "beginner",
      curriculum: { sourceGym: gymName, track: "Gym Custom", isMasterLibrary: false, tags: ["custom", "gym"] },
    };
    upsertCustomTechnique(move);
    setCustomMoveName("");
    setCustomMoveDescription("");
  }

  function refreshShareCode() {
    setSyncCode(buildGymShareCode());
  }

  function toggleAssignmentTechnique(id: string) {
    setAssignmentTechniqueIds((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
  }

  function onCreateAssignment() {
    const title = assignmentTitle.trim();
    const description = assignmentDescription.trim();
    const due = assignmentDueDate.trim();
    if (!title || !description) {
      Alert.alert("Missing assignment details", "Add both a title and description before creating homework.");
      return;
    }
    if (due && !/^\d{4}-\d{2}-\d{2}$/.test(due)) {
      Alert.alert("Invalid due date", "Use YYYY-MM-DD format for due date.");
      return;
    }
    const payload = { title, description, dueDate: due || undefined, linkedTechniqueIds: assignmentTechniqueIds };
    if (editingAssignmentId) updateAssignment(editingAssignmentId, payload);
    else createAssignment(payload);
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
    Alert.alert("Delete assignment?", "This removes it from your gym dashboard.", [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: () => removeAssignment(id) },
    ]);
  }

  function submitAnnouncement() {
    const created = addAnnouncement(announcementDraft);
    if (!created) {
      Alert.alert("Write an announcement", "Add a short announcement before posting.");
      return;
    }
    setAnnouncementDraft("");
  }

  function getTechniqueName(id: string): string {
    return resolvedTechniques.find((item) => item.id === id)?.name ?? id;
  }

  function renderTile(id: TileId) {
    if (id === "overview") {
      return (
        <View style={[card, { borderColor: withAlpha(accentColor, 0.55), backgroundColor: withAlpha(accentColor, 0.1) }]}>
          <Text style={{ color: "#FFFFFF", fontSize: 22, fontWeight: "900" }}>{gymName} Admin HQ</Text>
          <Text style={{ color: "#C6D0E0" }}>
            Publish announcements, assign focused drills, and monitor student completion in one premium dashboard.
          </Text>
          <View style={{ flexDirection: "row", gap: 8 }}>
            <MiniStat label="Assignments" value={String(assignments.length)} />
            <MiniStat label="Roster" value={String(roster.length)} />
            <MiniStat label="Announcements" value={String(announcements.length)} />
          </View>
        </View>
      );
    }
    if (id === "announcements") {
      return (
        <View style={card}>
          <Text style={title}>Quick announcements</Text>
          <Text style={{ color: "#8E96A5" }}>Broadcast class updates, focus themes, and reminders instantly.</Text>
          <TextInput
            value={announcementDraft}
            onChangeText={setAnnouncementDraft}
            placeholder="Team note: tonight we focus on guard retention rounds..."
            placeholderTextColor="#5D6574"
            style={[inputStyle, { minHeight: 70, textAlignVertical: "top" }]}
            multiline
          />
          <Pressable onPress={submitAnnouncement} style={primaryButton}>
            <Text style={buttonText}>Post announcement</Text>
          </Pressable>
          {announcements.length === 0 ? (
            <EmptyCard text="No announcements yet. Post your first update to keep students aligned." />
          ) : (
            announcements.slice(0, 4).map((item) => (
              <View key={item.id} style={chipCard}>
                <Text style={{ color: "#E9EDF7", lineHeight: 20 }}>{item.message}</Text>
                <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 8 }}>
                  <Text style={{ color: "#7B8392", fontSize: 12 }}>{new Date(item.createdAt).toLocaleDateString()}</Text>
                  <Pressable onPress={() => removeAnnouncement(item.id)}>
                    <Text style={{ color: "#F29A9A", fontWeight: "800" }}>Delete</Text>
                  </Pressable>
                </View>
              </View>
            ))
          )}
        </View>
      );
    }
    if (id === "assignments") {
      return (
        <View style={card}>
          <Text style={title}>Assignment builder</Text>
          <TextInput value={assignmentTitle} onChangeText={setAssignmentTitle} placeholder="Title (e.g. Week 3 Guard Retention)" placeholderTextColor="#5D6574" style={inputStyle} />
          <TextInput value={assignmentDescription} onChangeText={setAssignmentDescription} placeholder="Description / coaching objective" placeholderTextColor="#5D6574" multiline style={[inputStyle, { minHeight: 84, textAlignVertical: "top" }]} />
          <TextInput value={assignmentDueDate} onChangeText={setAssignmentDueDate} placeholder="Due date (YYYY-MM-DD)" placeholderTextColor="#5D6574" style={inputStyle} />
          <TextInput value={assignmentTechniqueSearch} onChangeText={setAssignmentTechniqueSearch} placeholder="Search My Library techniques to link" placeholderTextColor="#5D6574" style={inputStyle} />
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
            {ownerTechniqueChoices.slice(0, 14).map((technique) => {
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
    if (id === "completion") {
      return (
        <View style={card}>
          <Text style={title}>Assignment board</Text>
          {assignments.length === 0 ? (
            <EmptyCard text="No assignments yet. Create your first mission above." />
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
                      <Pressable onPress={() => startEditAssignment(assignment.id)} style={tinyAction}>
                        <Text style={{ color: "#DDE6FF", fontWeight: "700" }}>Edit</Text>
                      </Pressable>
                      <Pressable onPress={() => confirmDeleteAssignment(assignment.id)} style={[tinyAction, { borderColor: "#5A1F1F", backgroundColor: "#2A1111" }]}>
                        <Text style={{ color: "#FFD6D6", fontWeight: "700" }}>Delete</Text>
                      </Pressable>
                    </View>
                  </Pressable>
                </ScaleDecorator>
              )}
            />
          )}
        </View>
      );
    }
    if (id === "roster") {
      return (
        <View style={card}>
          <Text style={title}>Student roster pulse</Text>
          <Text style={{ color: "#8E96A5" }}>Prototype roster with completion visibility for quick coach check-ins.</Text>
          {rosterStats.map((item) => (
            <View key={item.student} style={chipCard}>
              <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                <Text style={{ color: "#FFFFFF", fontWeight: "800" }}>{item.student}</Text>
                <Text style={{ color: "#D4B06A", fontWeight: "800" }}>{item.completionPercent}%</Text>
              </View>
              <Text style={{ color: "#9AA2B1", marginTop: 4 }}>
                {item.completed}/{assignments.length || 0} assignments complete
              </Text>
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
          {customTechniques.length === 0 ? (
            <EmptyCard text="No custom moves yet. Add gym-specific systems and local variants here." />
          ) : (
            customTechniques.map((move) => (
              <View key={move.id} style={chipCard}>
                <Text style={{ color: "#FFFFFF", fontWeight: "900" }}>{move.name}</Text>
                <Text style={{ color: "#8E96A5", fontSize: 12 }}>{move.position}</Text>
                <Pressable onPress={() => removeCustomTechnique(move.id)} style={[tinyAction, { borderColor: "#5A1F1F", backgroundColor: "#2A1111", alignSelf: "flex-start" }]}>
                  <Text style={{ color: "#FFD6D6", fontWeight: "700" }}>Delete</Text>
                </Pressable>
              </View>
            ))
          )}
        </View>
      );
    }
    if (id === "logo") {
      return (
        <View style={card}>
          <Text style={title}>Gym logo</Text>
          <Text style={{ color: "#8E96A5", fontSize: 12, lineHeight: 18 }}>Use a direct image URL or choose a photo.</Text>
          <View style={{ flexDirection: "row", gap: 10 }}>
            <Pressable onPress={() => void onChoosePhoto()} disabled={pickingLogo} style={[primaryButton, { flex: 1 }]}>
              {pickingLogo ? <ActivityIndicator color="#fff" /> : <Text style={buttonText}>Choose photo</Text>}
            </Pressable>
            {logoUrl ? (
              <Pressable
                onPress={() => {
                  setLogoUrl(undefined);
                  setLogoInput("");
                }}
                style={secondaryButton}
              >
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
    return (
      <Pressable onPress={() => router.push("/gym-curriculum" as Href)} style={[card, { borderColor: withAlpha("#D4B06A", 0.55), backgroundColor: "rgba(212,176,106,0.12)" }]}>
        <Text style={{ color: "#D4B06A", fontWeight: "900" }}>Curriculum & techniques</Text>
        <Text style={{ color: "#AAB2C2", marginTop: 4 }}>Override titles/descriptions/video links for your gym.</Text>
      </Pressable>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#050505" }} edges={["top"]}>
      <NestableScrollContainer scrollEnabled={!isDraggingSchedule && !isReorderingTiles} contentContainerStyle={{ padding: 16, gap: 14, paddingBottom: 48 }}>
        <Text style={{ color: "#FFFFFF", fontSize: 32, fontWeight: "900" }}>My Gym</Text>
        <Text style={{ color: "#AAB2C2" }}>A premium command center for classes, communication, and student progress.</Text>
        <Text style={{ color: "#8E96A5", fontSize: 12 }}>Long press any tile to personalize your dashboard layout.</Text>
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

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ flex: 1, borderWidth: 1, borderColor: "#2D2D2D", borderRadius: 10, padding: 10, backgroundColor: "#0D0D0D" }}>
      <Text style={{ color: "#8E96A5", fontSize: 12 }}>{label}</Text>
      <Text style={{ color: "#FFFFFF", fontWeight: "900", marginTop: 4 }}>{value}</Text>
    </View>
  );
}

function EmptyCard({ text }: { text: string }) {
  return (
    <View style={{ borderWidth: 1, borderColor: "#242424", borderRadius: 10, backgroundColor: "#0B0B0B", padding: 12 }}>
      <Text style={{ color: "#8E96A5" }}>{text}</Text>
    </View>
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

const chipCard = {
  borderWidth: 1,
  borderColor: "#242424",
  borderRadius: 10,
  backgroundColor: "#0D0D0D",
  padding: 10,
  gap: 4,
};

const title = {
  color: "#FFFFFF",
  fontSize: 18,
  fontWeight: "900" as const,
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

const tinyAction = {
  borderWidth: 1,
  borderColor: "#3E4B6A",
  borderRadius: 8,
  paddingHorizontal: 10,
  paddingVertical: 6,
  backgroundColor: "#162033",
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
