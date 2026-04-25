import { Ionicons } from "@expo/vector-icons";
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
import { loadProgress, type UserProgress } from "../store/progress";
import { pendingRequestsForGym, useTechniqueRequestStore } from "../store/techniqueRequests";
import { explainLogoUrlIssue, isLikelyDirectImageUrl } from "../utils/gym-logo";
import { pickGymLogoFromLibrary } from "../utils/pick-gym-logo";

type TileId =
  | "overview"
  | "announcements"
  | "assignments"
  | "completion"
  | "roster"
  | "requests"
  | "videos"
  | "schedule"
  | "customMoves"
  | "logo"
  | "qr"
  | "curriculum";
const DEFAULT_TILE_ORDER: TileId[] = [
  "overview",
  "announcements",
  "assignments",
  "completion",
  "roster",
  "requests",
  "videos",
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
  const announcements = useGymStore((s) => s.announcements);
  const createAnnouncement = useGymStore((s) => s.createAnnouncement);
  const removeAnnouncement = useGymStore((s) => s.removeAnnouncement);
  const upsertCustomTechnique = useGymStore((s) => s.upsertCustomTechnique);
  const removeCustomTechnique = useGymStore((s) => s.removeCustomTechnique);
  const setVideoOverride = useGymStore((s) => s.setVideoOverride);
  const clearVideoOverride = useGymStore((s) => s.clearVideoOverride);
  const videoOverrides = useGymStore((s) => s.videoOverrides);
  const buildGymShareCode = useGymStore((s) => s.buildGymShareCode);
  const myGymTileOrder = useGymStore((s) => s.myGymTileOrder);
  const setMyGymTileOrder = useGymStore((s) => s.setMyGymTileOrder);
  const gymId = useGymStore((s) => s.gymId);

  const assignments = useAssignmentsStore((s) => s.assignments);
  const roster = useAssignmentsStore((s) => s.roster);
  const createAssignment = useAssignmentsStore((s) => s.createAssignment);
  const updateAssignment = useAssignmentsStore((s) => s.updateAssignment);
  const reorderAssignments = useAssignmentsStore((s) => s.reorderAssignments);
  const removeAssignment = useAssignmentsStore((s) => s.removeAssignment);
  const resolvedTechniques = useResolvedTechniques();
  const techniqueRequests = useTechniqueRequestStore((s) => s.requests);
  const dismissTechniqueRequest = useTechniqueRequestStore((s) => s.dismissRequest);
  const markTechniqueRequestAddressed = useTechniqueRequestStore((s) => s.markAddressed);
  const removeTechniqueRequest = useTechniqueRequestStore((s) => s.removeRequest);

  const boardAssignments = useMemo(
    () => assignments.filter((a) => !a.gymId || a.gymId === gymId),
    [assignments, gymId]
  );
  const pendingTechniqueRequests = useMemo(() => pendingRequestsForGym(gymId, techniqueRequests), [gymId, techniqueRequests]);

  const [logoInput, setLogoInput] = useState(logoUrl ?? "");
  const [pickingLogo, setPickingLogo] = useState(false);
  const [customMoveName, setCustomMoveName] = useState("");
  const [customMovePosition, setCustomMovePosition] = useState<PositionTab>("Guard Work");
  const [customMoveDescription, setCustomMoveDescription] = useState("");
  const [syncCode, setSyncCode] = useState(() => buildGymShareCode());
  const [isDraggingSchedule, setIsDraggingSchedule] = useState(false);
  const [myLibraryIds, setMyLibraryIds] = useState<string[]>([]);
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [assignmentTitle, setAssignmentTitle] = useState("");
  const [assignmentDescription, setAssignmentDescription] = useState("");
  const [assignmentDueDate, setAssignmentDueDate] = useState("");
  const [assignmentTechniqueSearch, setAssignmentTechniqueSearch] = useState("");
  const [assignmentTechniqueIds, setAssignmentTechniqueIds] = useState<string[]>([]);
  const [assignmentTargetStudents, setAssignmentTargetStudents] = useState<string[]>([]);
  const [editingAssignmentId, setEditingAssignmentId] = useState<string | null>(null);
  const [announcementTitle, setAnnouncementTitle] = useState("");
  const [announcementMessage, setAnnouncementMessage] = useState("");
  const [announcementExpiresOn, setAnnouncementExpiresOn] = useState("");
  const [videoSearch, setVideoSearch] = useState("");
  const [videoDrafts, setVideoDrafts] = useState<Record<string, string>>({});
  const [isReorderingTiles, setIsReorderingTiles] = useState(false);
  /** Extra lock: nested drag autoscroll can still nudge the parent; keep outer scroll off during assignment reorder. */
  const [isDraggingAssignmentBoard, setIsDraggingAssignmentBoard] = useState(false);

  React.useEffect(() => {
    setLogoInput(logoUrl ?? "");
  }, [logoUrl]);

  React.useEffect(() => {
    void loadProgress().then((loaded) => {
      setMyLibraryIds(loaded.myTechniques);
      setProgress(loaded);
    });
  }, []);

  React.useEffect(() => {
    if (newAssignment === "1") {
      setEditingAssignmentId(null);
      setAssignmentTitle("");
      setAssignmentDescription("");
      setAssignmentDueDate("");
      setAssignmentTechniqueSearch("");
      setAssignmentTechniqueIds([]);
      setAssignmentTargetStudents([]);
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
        const completed = boardAssignments.filter((item) => (item.completedBy ?? []).includes(student.name)).length;
        const totalAsg = boardAssignments.length;
        const completionPercent = totalAsg > 0 ? Math.round((completed / totalAsg) * 100) : 0;
        const masteredEstimate = estimateStudentMasteredCount(student.name, progress?.learnedTechniqueIds.length ?? 0);
        const report = simulatedStudentProgressReport(student.name, student.belt, completionPercent, masteredEstimate);
        return { student, completed, completionPercent, masteredEstimate, report, totalAsg };
      }),
    [boardAssignments, progress?.learnedTechniqueIds.length, roster]
  );

  const videoTechniqueChoices = resolvedTechniques.filter((technique) => {
    const q = videoSearch.trim().toLowerCase();
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
    const payload = {
      title,
      description,
      dueDate: due || undefined,
      linkedTechniqueIds: assignmentTechniqueIds,
      targetStudents: assignmentTargetStudents,
    };
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
    setAssignmentTargetStudents([]);
  }

  function startEditAssignment(id: string) {
    const assignment = assignments.find((item) => item.id === id);
    if (!assignment) return;
    setEditingAssignmentId(assignment.id);
    setAssignmentTitle(assignment.title);
    setAssignmentDescription(assignment.description);
    setAssignmentDueDate(assignment.dueDate ?? "");
    setAssignmentTechniqueIds(assignment.linkedTechniqueIds ?? []);
    setAssignmentTargetStudents(assignment.targetStudents ?? []);
  }

  function confirmDeleteAssignment(id: string) {
    Alert.alert("Delete assignment?", "This removes it from your gym dashboard.", [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: () => removeAssignment(id) },
    ]);
  }

  function submitAnnouncement() {
    const expiry = announcementExpiresOn.trim();
    if (expiry && !/^\d{4}-\d{2}-\d{2}$/.test(expiry)) {
      Alert.alert("Invalid expiration date", "Use YYYY-MM-DD format.");
      return;
    }
    const created = createAnnouncement({
      title: announcementTitle,
      message: announcementMessage,
      expiresOn: expiry || undefined,
    });
    if (!created) {
      Alert.alert("Write an announcement", "Add title and message before posting.");
      return;
    }
    setAnnouncementTitle("");
    setAnnouncementMessage("");
    setAnnouncementExpiresOn("");
  }

  function getTechniqueName(id: string): string {
    return resolvedTechniques.find((item) => item.id === id)?.name ?? id;
  }

  function toggleTargetStudent(name: string) {
    setAssignmentTargetStudents((prev) =>
      prev.includes(name) ? prev.filter((item) => item !== name) : [...prev, name]
    );
  }

  function setVideoDraft(techniqueId: string, value: string) {
    setVideoDrafts((prev) => ({ ...prev, [techniqueId]: value }));
  }

  function renderTile(id: TileId) {
    if (id === "overview") {
      return (
        <View style={[card, { borderColor: withAlpha(accentColor, 0.55), backgroundColor: withAlpha(accentColor, 0.1) }]}>
          <Text style={{ color: "#FFFFFF", fontSize: 22, fontWeight: "900" }}>{gymName} Admin HQ</Text>
          <Text style={{ color: "#C6D0E0", lineHeight: 22 }}>Announcements, homework, roster pulse, and requests—one place.</Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
            <MiniStat label="Assignments" value={String(boardAssignments.length)} />
            <MiniStat label="Roster" value={String(roster.length)} />
            <MiniStat label="Announcements" value={String(announcements.length)} />
            <MiniStat label="Tech requests" value={String(pendingTechniqueRequests.length)} />
          </View>
          <Text style={{ color: "#8E96A5" }}>
            {progress ? `${Object.keys(progress.masteryByTechniqueId).length} techniques on your mastery map.` : "Loading…"}
          </Text>
        </View>
      );
    }
    if (id === "announcements") {
      return (
        <View style={card}>
          <Text style={title}>Announcements</Text>
          <Text style={{ color: "#8E96A5", fontSize: 13 }}>Short posts for your team—class theme, schedule tweak, hype.</Text>
          <TextInput
            value={announcementTitle}
            onChangeText={setAnnouncementTitle}
            placeholder="Announcement title"
            placeholderTextColor="#5D6574"
            style={inputStyle}
          />
          <TextInput
            value={announcementMessage}
            onChangeText={setAnnouncementMessage}
            placeholder="Message for students..."
            placeholderTextColor="#5D6574"
            style={[inputStyle, { minHeight: 70, textAlignVertical: "top" }]}
            multiline
          />
          <TextInput
            value={announcementExpiresOn}
            onChangeText={setAnnouncementExpiresOn}
            placeholder="Optional expiration (YYYY-MM-DD)"
            placeholderTextColor="#5D6574"
            style={inputStyle}
          />
          <Pressable onPress={submitAnnouncement} style={primaryButton}>
            <Text style={buttonText}>Post announcement</Text>
          </Pressable>
          {announcements.length === 0 ? (
            <EmptyCard icon="megaphone-outline" text="Nothing posted yet. Drop one line—your crew will see it in Notifications." />
          ) : (
            announcements.slice(0, 4).map((item) => (
              <View key={item.id} style={announcementCard}>
                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", gap: 10 }}>
                  <View style={{ flex: 1, gap: 6 }}>
                    <Text style={{ color: "#FFFFFF", fontWeight: "900", fontSize: 16 }}>{item.title}</Text>
                    <Text style={{ color: "#C8D0E0", lineHeight: 21, fontSize: 14 }} numberOfLines={4}>
                      {item.message}
                    </Text>
                  </View>
                  <Pressable
                    onPress={() => removeAnnouncement(item.id)}
                    hitSlop={8}
                    style={({ pressed }) => ({
                      paddingHorizontal: 10,
                      paddingVertical: 6,
                      borderRadius: 8,
                      borderWidth: 1,
                      borderColor: "#3A2222",
                      backgroundColor: pressed ? "rgba(90,31,31,0.5)" : "#221010",
                    })}
                  >
                    <Text style={{ color: "#F29A9A", fontWeight: "800", fontSize: 12 }}>Delete</Text>
                  </Pressable>
                </View>
                <Text style={{ color: "#6F7785", fontSize: 12, marginTop: 8 }}>
                  {new Date(item.createdAt).toLocaleDateString()}
                  {item.expiresOn ? ` · Exp ${item.expiresOn}` : ""}
                </Text>
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
          <Text style={{ color: "#8E96A5", fontWeight: "700", fontSize: 12 }}>Roster chips optional—empty means whole team.</Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
            {roster.map((student) => {
              const on = assignmentTargetStudents.includes(student.name);
              return (
                <Pressable
                  key={`target-${student.name}`}
                  onPress={() => toggleTargetStudent(student.name)}
                  style={{
                    borderWidth: 1,
                    borderColor: on ? "#D4B06A" : "#2A2A2A",
                    borderRadius: 999,
                    paddingHorizontal: 10,
                    paddingVertical: 6,
                    backgroundColor: on ? "rgba(212,176,106,0.16)" : "#111",
                  }}
                >
                  <Text style={{ color: "#FFFFFF", fontWeight: "700", fontSize: 12 }}>
                    {student.name} ({student.belt})
                  </Text>
                </Pressable>
              );
            })}
          </View>
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
            <EmptyCard icon="clipboard-outline" text="No homework yet. Build one above—then drag cards to set the order your team sees." />
          ) : (
            <View style={{ gap: 4 }}>
              <Text style={{ color: "#6F7785", fontSize: 11, fontWeight: "800", letterSpacing: 0.6 }}>HOLD CARD TO REORDER</Text>
              <NestableDraggableFlatList
                data={assignments}
                keyExtractor={(item) => item.id}
                scrollEnabled={false}
                autoscrollSpeed={0}
                autoscrollThreshold={0}
                onDragBegin={() => setIsDraggingAssignmentBoard(true)}
                onRelease={() => setIsDraggingAssignmentBoard(false)}
                onDragEnd={({ data }) => {
                  setIsDraggingAssignmentBoard(false);
                  reorderAssignments(data.map((a) => a.id));
                }}
                renderItem={({ item: assignment, drag, isActive }) => (
                  <ScaleDecorator>
                    <Pressable
                      onLongPress={drag}
                      delayLongPress={280}
                      style={({ pressed }) => ({
                        borderWidth: 1,
                        borderColor: isActive ? withAlpha(accentColor, 0.95) : pressed ? "#3A3A3A" : "#252525",
                        borderRadius: 14,
                        backgroundColor: isActive ? "#121820" : "#0D0D0D",
                        padding: 14,
                        gap: 6,
                        marginBottom: 10,
                        opacity: pressed && !isActive ? 0.92 : 1,
                      })}
                    >
                      <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                        <Ionicons name="reorder-three" size={22} color="#6B7380" />
                        <Text style={{ color: "#FFFFFF", fontWeight: "900", flex: 1, fontSize: 16 }}>{assignment.title}</Text>
                      </View>
                      <Text style={{ color: "#AAB2C2", fontSize: 14 }} numberOfLines={3}>
                        {assignment.description}
                      </Text>
                      {assignment.dueDate ? (
                        <Text style={{ color: "#8E96A5", fontSize: 12 }}>Due {assignment.dueDate}</Text>
                      ) : null}
                      {(assignment.linkedTechniqueIds ?? []).length > 0 ? (
                        <Text style={{ color: "#D4B06A", fontSize: 12 }} numberOfLines={2}>
                          Linked: {(assignment.linkedTechniqueIds ?? []).map((tid) => getTechniqueName(tid)).join(", ")}
                        </Text>
                      ) : null}
                      <Text style={{ color: "#8E96A5", fontSize: 12 }}>
                        {(assignment.targetStudents ?? []).length > 0 ? assignment.targetStudents?.join(", ") : "Whole roster"} · Done:{" "}
                        {(assignment.completedBy ?? []).length > 0 ? assignment.completedBy?.join(", ") : "—"}
                      </Text>
                      <View style={{ flexDirection: "row", gap: 8, marginTop: 4 }}>
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
            </View>
          )}
        </View>
      );
    }
    if (id === "roster") {
      return (
        <View style={card}>
          <Text style={title}>Roster & progress</Text>
          <Text style={{ color: "#8E96A5", fontSize: 13, marginBottom: 4 }}>Demo metrics per student—belt pulse, homework, streak vibe.</Text>
          {rosterStats.map((item) => (
            <View key={item.student.name} style={rosterCard}>
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                <Text style={{ color: "#FFFFFF", fontWeight: "900" }}>
                  {item.student.name}{" "}
                  <Text style={{ color: "#D4B06A", textTransform: "capitalize" }}>({item.student.belt})</Text>
                </Text>
                <Text style={{ color: "#7CFFB1", fontWeight: "800" }}>{item.report.streak}d streak</Text>
              </View>
              <Text style={{ color: "#9AA2B1", marginTop: 6, fontSize: 12 }}>Belt curriculum momentum</Text>
              <View style={{ height: 8, borderRadius: 999, backgroundColor: "#1A1A1A", marginTop: 4, overflow: "hidden" }}>
                <View
                  style={{
                    width: `${item.report.beltMomentumPct}%`,
                    height: "100%",
                    borderRadius: 999,
                    backgroundColor: withAlpha(accentColor, 0.95),
                  }}
                />
              </View>
              <Text style={{ color: "#8E96A5", fontSize: 11, marginTop: 4 }}>
                {item.report.beltMomentumPct}% toward next curriculum milestone
              </Text>
              <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 8 }}>
                <Text style={{ color: "#9AA2B1" }}>
                  Assignments: {item.completed}/{item.totalAsg || 0} ({item.completionPercent}%)
                </Text>
                <Text style={{ color: "#D4B06A", fontWeight: "800" }}>{item.masteredEstimate} tech mastered</Text>
              </View>
            </View>
          ))}
        </View>
      );
    }
    if (id === "requests") {
      return (
        <View style={card}>
          <Text style={title}>Technique requests</Text>
          <Text style={{ color: "#8E96A5", fontSize: 13 }}>Linked students tap Request in Library—clear when you teach it.</Text>
          {pendingTechniqueRequests.length === 0 ? (
            <EmptyCard icon="hand-left-outline" text="All quiet. When students request moves, they land here." />
          ) : (
            pendingTechniqueRequests.map((req) => (
              <View key={req.id} style={chipCard}>
                <Text style={{ color: "#FFFFFF", fontWeight: "900" }}>{req.techniqueName}</Text>
                <Text style={{ color: "#AAB2C2", marginTop: 2 }}>From {req.studentName}</Text>
                {req.note ? (
                  <Text style={{ color: "#8E96A5", marginTop: 4, fontStyle: "italic" }}>{`"${req.note}"`}</Text>
                ) : null}
                <Text style={{ color: "#6F7785", fontSize: 12, marginTop: 4 }}>
                  {new Date(req.createdAt).toLocaleString()}
                </Text>
                <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 8 }}>
                  <Pressable
                    onPress={() => markTechniqueRequestAddressed(req.id)}
                    style={[tinyAction, { borderColor: withAlpha(accentColor, 0.65), backgroundColor: withAlpha(accentColor, 0.14) }]}
                  >
                    <Text style={{ color: "#DDE6FF", fontWeight: "700" }}>Mark covered</Text>
                  </Pressable>
                  <Pressable onPress={() => dismissTechniqueRequest(req.id)} style={tinyAction}>
                    <Text style={{ color: "#DDE6FF", fontWeight: "700" }}>Dismiss</Text>
                  </Pressable>
                  <Pressable
                    onPress={() => removeTechniqueRequest(req.id)}
                    style={[tinyAction, { borderColor: "#5A1F1F", backgroundColor: "#2A1111" }]}
                  >
                    <Text style={{ color: "#FFD6D6", fontWeight: "700" }}>Delete</Text>
                  </Pressable>
                </View>
              </View>
            ))
          )}
        </View>
      );
    }
    if (id === "videos") {
      return (
        <View style={card}>
          <Text style={title}>Gym preferred videos</Text>
          <Text style={{ color: "#8E96A5" }}>
            Override any technique video with your gym&apos;s private or preferred link. Students in Gym Mode see this first.
          </Text>
          <TextInput
            value={videoSearch}
            onChangeText={setVideoSearch}
            placeholder="Search techniques..."
            placeholderTextColor="#5D6574"
            style={inputStyle}
          />
          {videoTechniqueChoices.slice(0, 8).map((technique) => {
            const current = videoOverrides[technique.id] ?? "";
            const draft = videoDrafts[technique.id] ?? current;
            return (
              <View key={`video-${technique.id}`} style={chipCard}>
                <Text style={{ color: "#FFFFFF", fontWeight: "800" }}>{technique.name}</Text>
                <TextInput
                  value={draft}
                  onChangeText={(value) => setVideoDraft(technique.id, value)}
                  placeholder="https://... private or preferred link"
                  placeholderTextColor="#5D6574"
                  style={[inputStyle, { fontSize: 13 }]}
                />
                <View style={{ flexDirection: "row", gap: 8 }}>
                  <Pressable
                    onPress={() => setVideoOverride(technique.id, draft)}
                    style={[primaryButton, { flex: 1 }]}
                  >
                    <Text style={buttonText}>Save Override</Text>
                  </Pressable>
                  <Pressable
                    onPress={() => {
                      clearVideoOverride(technique.id);
                      setVideoDraft(technique.id, "");
                    }}
                    style={[secondaryButton, { flex: 1 }]}
                  >
                    <Text style={buttonText}>Clear</Text>
                  </Pressable>
                </View>
              </View>
            );
          })}
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
            <EmptyCard icon="barbell-outline" text="No custom moves yet—stamp your gym’s systems here." />
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
      <NestableScrollContainer
        scrollEnabled={!isDraggingSchedule && !isReorderingTiles && !isDraggingAssignmentBoard}
        contentContainerStyle={{ padding: 16, gap: 14, paddingBottom: 48 }}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={{ color: "#FFFFFF", fontSize: 32, fontWeight: "900" }}>My Gym</Text>
        <Text style={{ color: "#AAB2C2", lineHeight: 22 }}>Your command center—classes, comms, homework, roster.</Text>
        <Text style={{ color: "#6F7785", fontSize: 11, fontWeight: "800", letterSpacing: 0.5 }}>HOLD A SECTION TILE TO REORDER THE DASHBOARD</Text>
        <NestableDraggableFlatList
          data={tileOrder}
          keyExtractor={(item) => item}
          scrollEnabled={false}
          autoscrollSpeed={0}
          autoscrollThreshold={0}
          onDragBegin={() => setIsReorderingTiles(true)}
          onRelease={() => setIsReorderingTiles(false)}
          onDragEnd={({ data }) => {
            setIsReorderingTiles(false);
            setMyGymTileOrder(data);
          }}
          renderItem={({ item, drag, isActive }) => (
            <ScaleDecorator>
              <Pressable
                onLongPress={drag}
                delayLongPress={280}
                style={({ pressed }) => ({
                  marginBottom: 12,
                  opacity: isActive ? 0.94 : pressed ? 0.88 : 1,
                })}
              >
                {renderTile(item)}
                <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginTop: 8 }}>
                  <Ionicons name="swap-vertical" size={14} color="#5C6570" />
                  <Text style={{ color: "#5C6570", fontSize: 11, fontWeight: "700" }}>Hold to move this block</Text>
                </View>
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
    <View
      style={{
        minWidth: "47%",
        flexGrow: 1,
        borderWidth: 1,
        borderColor: "#2D2D2D",
        borderRadius: 10,
        padding: 10,
        backgroundColor: "#0D0D0D",
      }}
    >
      <Text style={{ color: "#8E96A5", fontSize: 12 }}>{label}</Text>
      <Text style={{ color: "#FFFFFF", fontWeight: "900", marginTop: 4 }}>{value}</Text>
    </View>
  );
}

function EmptyCard({ text, icon }: { text: string; icon?: keyof typeof Ionicons.glyphMap }) {
  return (
    <View
      style={{
        borderWidth: 1,
        borderColor: "#2A2A2A",
        borderRadius: 14,
        backgroundColor: "#0A0A0A",
        padding: 18,
        alignItems: "center",
        gap: 10,
      }}
    >
      {icon ? <Ionicons name={icon} size={36} color="#4A5568" /> : null}
      <Text style={{ color: "#AAB2C2", textAlign: "center", lineHeight: 22, fontSize: 14 }}>{text}</Text>
    </View>
  );
}

function estimateStudentMasteredCount(name: string, baseline: number): number {
  const hash = [...name].reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const offset = (hash % 12) - 4;
  return Math.max(0, baseline + offset);
}

const BELT_RANK: Record<string, number> = { white: 0, blue: 1, purple: 2, brown: 3, black: 4 };

function simulatedStudentProgressReport(
  name: string,
  belt: string,
  assignmentCompletionPct: number,
  masteredEstimate: number
): { beltMomentumPct: number; streak: number } {
  const hash = [...name].reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const rank = BELT_RANK[belt] ?? 0;
  const base = 38 + assignmentCompletionPct * 0.35 + Math.min(24, masteredEstimate);
  const beltBoost = rank * 7;
  const beltMomentumPct = Math.min(100, Math.round(base + beltBoost + (hash % 9)));
  const streak = 2 + (hash % 34);
  return { beltMomentumPct, streak };
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

const announcementCard = {
  borderWidth: 1,
  borderColor: "#2A2A2A",
  borderRadius: 14,
  backgroundColor: "#0C0C0C",
  padding: 14,
  gap: 4,
} as const;

const rosterCard = {
  borderWidth: 1,
  borderColor: "#2A2A2A",
  borderRadius: 14,
  backgroundColor: "#0C0C0C",
  padding: 14,
  gap: 8,
} as const;

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
