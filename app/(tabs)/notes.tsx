import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { type Technique } from "../data/techniques";
import { useResolvedTechniques } from "../hooks/useResolvedTechniques";
import { useAssignmentsStore } from "../store/assignments";
import { useGymStore, withAlpha } from "../store/gym";
import { addMultipleToMyLibrary, loadProgress } from "../store/progress";
import {
  addNote,
  deleteNote,
  loadNotes,
  updateNote,
  type SessionNote,
} from "../store/notes";

type BeltFilter = "all" | "white" | "blue" | "purple" | "brown";

function formatNoteDate(iso: string) {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

export default function NotesScreen() {
  const router = useRouter();
  const { techniqueId, compose } = useLocalSearchParams<{ techniqueId?: string; compose?: string }>();
  const accentColor = useGymStore((state) => state.accentColor);
  const [notes, setNotes] = useState<SessionNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draftText, setDraftText] = useState("");
  const [draftTechniques, setDraftTechniques] = useState<Technique[]>([]);
  const [search, setSearch] = useState("");
  const [beltFilter, setBeltFilter] = useState<BeltFilter>("all");
  const [addToMyLibrary, setAddToMyLibrary] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profileName, setProfileName] = useState("Student");
  const assignments = useAssignmentsStore((state) => state.assignments);
  const toggleAssignmentCompletion = useAssignmentsStore((state) => state.toggleAssignmentCompletion);

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      const progress = await loadProgress();
      const list = await loadNotes();
      setProfileName(progress.profileName);
      setNotes(list);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void reload();
    }, [reload])
  );

  React.useEffect(() => {
    if (compose === "1") {
      openNew();
    }
  }, [compose]);

  const techniques = useResolvedTechniques();
  const searchResults = useMemo(() => {
    const q = search.trim().toLowerCase();
    return techniques
      .filter((t) => {
        if (beltFilter !== "all" && t.belt !== beltFilter) return false;
        if (!q) return true;
        return (
          t.name.toLowerCase().includes(q) ||
          t.shortDescription.toLowerCase().includes(q) ||
          t.category.toLowerCase().includes(q) ||
          t.position.toLowerCase().includes(q) ||
          t.id.toLowerCase().includes(q)
        );
      })
      .slice(0, 100);
  }, [search, beltFilter, techniques]);

  const selectedIds = useMemo(() => new Set(draftTechniques.map((t) => t.id)), [draftTechniques]);
  const filteredNotes = useMemo(() => {
    if (!techniqueId) return notes;
    return notes.filter((note) => note.techniques.some((tech) => tech.id === techniqueId));
  }, [notes, techniqueId]);
  const assignmentCards = useMemo(
    () =>
      assignments.map((assignment) => {
        const done = (assignment.completedBy ?? []).includes(profileName);
        const linkedTechniques = (assignment.linkedTechniqueIds ?? [])
          .map((id) => techniques.find((item) => item.id === id))
          .filter((item): item is Technique => Boolean(item));
        return { assignment, done, linkedTechniques };
      }),
    [assignments, profileName, techniques]
  );
  const pendingAssignments = assignmentCards.filter((item) => !item.done);
  const completedAssignments = assignmentCards.filter((item) => item.done);

  function openNew() {
    setEditingId(null);
    setDraftText("");
    setDraftTechniques([]);
    setSearch("");
    setBeltFilter("all");
    setAddToMyLibrary(true);
    setModalOpen(true);
  }

  function openEdit(note: SessionNote) {
    setEditingId(note.id);
    setDraftText(note.text);
    setDraftTechniques(note.techniques.map((t) => ({ ...t })));
    setSearch("");
    setBeltFilter("all");
    setAddToMyLibrary(true);
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setSaving(false);
  }

  function toggleTechnique(tech: Technique) {
    setDraftTechniques((prev) => {
      if (prev.some((t) => t.id === tech.id)) {
        return prev.filter((t) => t.id !== tech.id);
      }
      return [...prev, { ...tech }];
    });
  }

  function removeDraftTechnique(id: string) {
    setDraftTechniques((prev) => prev.filter((t) => t.id !== id));
  }

  async function onSave() {
    const text = draftText.trim();
    if (!text) {
      Alert.alert("Add a note", "Write something about class—positions, partners, or what clicked.");
      return;
    }
    setSaving(true);
    try {
      if (editingId) {
        await updateNote(editingId, text, draftTechniques);
      } else {
        await addNote(text, draftTechniques);
      }
      if (addToMyLibrary && draftTechniques.length > 0) {
        await addMultipleToMyLibrary(draftTechniques.map((t) => t.id));
      }
      await reload();
      closeModal();
    } catch {
      Alert.alert("Could not save", "Try again in a moment.");
      setSaving(false);
    }
  }

  function confirmDelete(note: SessionNote) {
    Alert.alert("Delete note?", "This cannot be undone.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => void deleteNote(note.id).then(reload),
      },
    ]);
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#050505" }} edges={["top"]}>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16, paddingBottom: 32, gap: 14 }}>
        <Text style={{ color: "#FFFFFF", fontSize: 28, fontWeight: "900" }}>Training Notes</Text>
        <Text style={{ color: "#AAB2C2", lineHeight: 22 }}>
          Log class takeaways, search techniques you worked on, and link them to your notes. Optionally save those
          techniques to My Library so they stay one tap away.
        </Text>

        <Pressable
          onPress={openNew}
          style={{
            borderWidth: 1,
            borderColor: accentColor,
            backgroundColor: withAlpha(accentColor, 0.18),
            borderRadius: 14,
            padding: 14,
            alignItems: "center",
          }}
        >
          <Text style={{ color: "#FFFFFF", fontWeight: "900", fontSize: 16 }}>+ New class note</Text>
        </Pressable>

        <View
          style={{
            borderWidth: 1,
            borderColor: "#222",
            borderRadius: 14,
            backgroundColor: "#0F0F0F",
            padding: 14,
            gap: 10,
          }}
        >
          <Text style={{ color: "#FFFFFF", fontSize: 20, fontWeight: "900" }}>My Assignments</Text>
          <Text style={{ color: "#AAB2C2" }}>
            Student: <Text style={{ color: "#FFFFFF", fontWeight: "800" }}>{profileName}</Text>
          </Text>
          {assignmentCards.length === 0 ? (
            <Text style={{ color: "#8E96A5" }}>No assignments posted yet by your gym.</Text>
          ) : (
            <>
              <Text style={{ color: "#D4B06A", fontWeight: "800" }}>Pending</Text>
              {pendingAssignments.length === 0 ? (
                <Text style={{ color: "#8E96A5" }}>All assignments completed. Nice work.</Text>
              ) : (
                pendingAssignments.map(({ assignment, linkedTechniques }) => (
                  <AssignmentCard
                    key={assignment.id}
                    assignment={assignment}
                    linkedTechniques={linkedTechniques}
                    accentColor={accentColor}
                    done={false}
                    onToggle={() => toggleAssignmentCompletion(assignment.id, profileName)}
                    onOpenTechnique={(id) => router.push(`/technique/${id}`)}
                  />
                ))
              )}
              <Text style={{ color: "#8E96A5", marginTop: 6, fontWeight: "800" }}>Completed</Text>
              {completedAssignments.length === 0 ? (
                <Text style={{ color: "#8E96A5" }}>No completed assignments yet.</Text>
              ) : (
                completedAssignments.map(({ assignment, linkedTechniques }) => (
                  <AssignmentCard
                    key={assignment.id}
                    assignment={assignment}
                    linkedTechniques={linkedTechniques}
                    accentColor={accentColor}
                    done
                    onToggle={() => toggleAssignmentCompletion(assignment.id, profileName)}
                    onOpenTechnique={(id) => router.push(`/technique/${id}`)}
                  />
                ))
              )}
            </>
          )}
        </View>

        {techniqueId ? (
          <View
            style={{
              borderWidth: 1,
              borderColor: withAlpha(accentColor, 0.7),
              backgroundColor: withAlpha(accentColor, 0.12),
              borderRadius: 12,
              padding: 12,
            }}
          >
            <Text style={{ color: "#FFFFFF", fontWeight: "800" }}>
              Showing notes linked to selected technique.
            </Text>
            <Text style={{ color: "#AAB2C2", marginTop: 4 }}>
              Clear the filter by returning from Library/Technique and opening Notes directly.
            </Text>
          </View>
        ) : null}

        {loading ? (
          <View style={{ padding: 24, alignItems: "center" }}>
            <ActivityIndicator color={accentColor} />
          </View>
        ) : filteredNotes.length === 0 ? (
          <View
            style={{
              borderWidth: 1,
              borderColor: "#232323",
              borderRadius: 14,
              backgroundColor: "#0D0D0D",
              padding: 16,
              gap: 8,
            }}
          >
            <Text style={{ color: "#FFFFFF", fontWeight: "800" }}>No notes yet</Text>
            <Text style={{ color: "#8E96A5", lineHeight: 22 }}>
              {techniqueId
                ? "No notes are linked to this technique yet. Create one and attach this technique to review faster later."
                : "After your next class, tap \"New class note\", write what you remember, and attach the techniques you drilled. They will show up here and can sync to My Library."}
            </Text>
          </View>
        ) : (
          filteredNotes.map((note) => (
            <View
              key={note.id}
              style={{
                borderWidth: 1,
                borderColor: "#222",
                backgroundColor: "#0F0F0F",
                borderRadius: 14,
                padding: 14,
                gap: 10,
              }}
            >
              <Text style={{ color: "#8E96A5", fontSize: 12 }}>{formatNoteDate(note.updatedAt)}</Text>
              <Text style={{ color: "#E8ECF5", fontSize: 16, lineHeight: 24 }}>{note.text}</Text>
              {note.techniques.length > 0 ? (
                <View style={{ gap: 8 }}>
                  <Text style={{ color: "#D4B06A", fontWeight: "800", fontSize: 13 }}>Linked techniques</Text>
                  <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
                    {note.techniques.map((t) => (
                      <Pressable
                        key={`${note.id}-${t.id}`}
                        onPress={() => router.push(`/technique/${t.id}`)}
                        style={{
                          borderWidth: 1,
                          borderColor: "#2A2A2A",
                          backgroundColor: "#141414",
                          borderRadius: 999,
                          paddingHorizontal: 12,
                          paddingVertical: 6,
                        }}
                      >
                        <Text style={{ color: "#FFFFFF", fontWeight: "700", fontSize: 13 }}>{t.name}</Text>
                      </Pressable>
                    ))}
                  </View>
                </View>
              ) : null}
              <View style={{ flexDirection: "row", gap: 10, marginTop: 4 }}>
                <Pressable
                  onPress={() => openEdit(note)}
                  style={{
                    flex: 1,
                    borderWidth: 1,
                    borderColor: "#D4B06A",
                    borderRadius: 10,
                    paddingVertical: 10,
                    alignItems: "center",
                  }}
                >
                  <Text style={{ color: "#D4B06A", fontWeight: "800" }}>Edit</Text>
                </Pressable>
                <Pressable
                  onPress={() => confirmDelete(note)}
                  style={{
                    flex: 1,
                    borderWidth: 1,
                    borderColor: "#5A3030",
                    borderRadius: 10,
                    paddingVertical: 10,
                    alignItems: "center",
                  }}
                >
                  <Text style={{ color: "#E87A7A", fontWeight: "800" }}>Delete</Text>
                </Pressable>
              </View>
            </View>
          ))
        )}
      </ScrollView>

      <Modal visible={modalOpen} animationType="slide" presentationStyle="pageSheet" onRequestClose={closeModal}>
        <SafeAreaView style={{ flex: 1, backgroundColor: "#050505" }} edges={["top", "bottom"]}>
          <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === "ios" ? "padding" : undefined}
            keyboardVerticalOffset={Platform.OS === "ios" ? 8 : 0}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                paddingHorizontal: 16,
                paddingVertical: 12,
                borderBottomWidth: 1,
                borderBottomColor: "#1E1E1E",
              }}
            >
              <Text style={{ color: "#FFFFFF", fontSize: 18, fontWeight: "900" }}>
                {editingId ? "Edit note" : "New class note"}
              </Text>
              <Pressable onPress={closeModal} hitSlop={12}>
                <Text style={{ color: "#9AA2B1", fontWeight: "800" }}>Close</Text>
              </Pressable>
            </View>

            <ScrollView
              style={{ flex: 1 }}
              contentContainerStyle={{ padding: 16, gap: 14, paddingBottom: 120 }}
              keyboardShouldPersistTaps="handled"
            >
              <Text style={{ color: "#8E96A5", fontWeight: "700" }}>What happened in class?</Text>
              <TextInput
                value={draftText}
                onChangeText={setDraftText}
                placeholder="Drilling partners, coach cues, positions, what to try next time…"
                placeholderTextColor="#5C6575"
                multiline
                style={{
                  minHeight: 120,
                  borderWidth: 1,
                  borderColor: "#2A2A2A",
                  borderRadius: 12,
                  padding: 14,
                  color: "#FFFFFF",
                  backgroundColor: "#101010",
                  textAlignVertical: "top",
                  fontSize: 16,
                  lineHeight: 24,
                }}
              />

              <Text style={{ color: "#D4B06A", fontWeight: "800" }}>Link techniques</Text>
              <Text style={{ color: "#8E96A5", fontSize: 13, lineHeight: 20 }}>
                Search by name, position, or category. Tap results to attach; chips show what is linked to this note.
              </Text>

              {draftTechniques.length > 0 ? (
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
                  {draftTechniques.map((t) => (
                    <Pressable
                      key={t.id}
                      onPress={() => removeDraftTechnique(t.id)}
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 6,
                        borderWidth: 1,
                        borderColor: "#D4B06A",
                        backgroundColor: "rgba(212,176,106,0.12)",
                        borderRadius: 999,
                        paddingHorizontal: 12,
                        paddingVertical: 8,
                      }}
                    >
                      <Text style={{ color: "#FFFFFF", fontWeight: "700", fontSize: 13 }}>{t.name}</Text>
                      <Text style={{ color: "#D4B06A", fontWeight: "900" }}>×</Text>
                    </Pressable>
                  ))}
                </ScrollView>
              ) : null}

              <TextInput
                value={search}
                onChangeText={setSearch}
                placeholder="Search techniques…"
                placeholderTextColor="#5C6575"
                style={{
                  borderWidth: 1,
                  borderColor: "#2A2A2A",
                  borderRadius: 12,
                  padding: 14,
                  color: "#FFFFFF",
                  backgroundColor: "#101010",
                  fontSize: 16,
                }}
              />

              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
                {(["all", "white", "blue", "purple", "brown"] as const).map((b) => {
                  const selected = beltFilter === b;
                  return (
                    <Pressable
                      key={b}
                      onPress={() => setBeltFilter(b)}
                      style={{
                        paddingHorizontal: 12,
                        paddingVertical: 8,
                        borderRadius: 999,
                        borderWidth: 1,
                        borderColor: selected ? accentColor : "#2A2A2A",
                        backgroundColor: selected ? withAlpha(accentColor, 0.2) : "#101010",
                      }}
                    >
                      <Text style={{ color: selected ? "#FFFFFF" : "#9AA2B1", fontWeight: "800", textTransform: "capitalize" }}>
                        {b === "all" ? "All belts" : `${b} belt`}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>

              <Text style={{ color: "#8E96A5", fontSize: 12 }}>
                {search.trim() || beltFilter !== "all"
                  ? `${searchResults.length} match${searchResults.length === 1 ? "" : "es"}`
                  : "Showing first 100 techniques — type to narrow down"}
              </Text>

              {searchResults.map((tech) => {
                const on = selectedIds.has(tech.id);
                return (
                  <Pressable
                    key={tech.id}
                    onPress={() => toggleTechnique(tech)}
                    style={{
                      borderWidth: 1,
                      borderColor: on ? "#D4B06A" : "#222",
                      backgroundColor: on ? "rgba(212,176,106,0.1)" : "#0F0F0F",
                      borderRadius: 12,
                      padding: 12,
                      gap: 4,
                    }}
                  >
                    <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                      <Text style={{ color: "#FFFFFF", fontWeight: "800", flex: 1 }}>{tech.name}</Text>
                      <Text style={{ color: on ? "#D4B06A" : "#5C6575", fontWeight: "900" }}>{on ? "✓" : "+"}</Text>
                    </View>
                    <Text style={{ color: "#8E96A5", fontSize: 13 }}>
                      {tech.position} • {tech.belt} • {tech.category}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>

            <View
              style={{
                borderTopWidth: 1,
                borderTopColor: "#1E1E1E",
                padding: 16,
                gap: 12,
                backgroundColor: "#080808",
              }}
            >
              <Pressable
                onPress={() => setAddToMyLibrary(!addToMyLibrary)}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 10,
                  borderWidth: 1,
                  borderColor: addToMyLibrary ? "#D4B06A" : "#2A2A2A",
                  borderRadius: 12,
                  padding: 12,
                  backgroundColor: addToMyLibrary ? "rgba(212,176,106,0.1)" : "#101010",
                }}
              >
                <View
                  style={{
                    width: 22,
                    height: 22,
                    borderRadius: 6,
                    borderWidth: 2,
                    borderColor: addToMyLibrary ? "#D4B06A" : "#5C6575",
                    backgroundColor: addToMyLibrary ? "#D4B06A" : "transparent",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  {addToMyLibrary ? <Text style={{ color: "#111", fontWeight: "900", fontSize: 12 }}>✓</Text> : null}
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: "#FFFFFF", fontWeight: "800" }}>Add linked techniques to My Library</Text>
                  <Text style={{ color: "#8E96A5", fontSize: 12, marginTop: 2 }}>
                    Saves each linked technique to Library → My Library when you save this note.
                  </Text>
                </View>
              </Pressable>

              <Pressable
                onPress={() => void onSave()}
                disabled={saving}
                style={{
                  borderWidth: 1,
                  borderColor: accentColor,
                  backgroundColor: withAlpha(accentColor, 0.22),
                  borderRadius: 14,
                  padding: 16,
                  alignItems: "center",
                  opacity: saving ? 0.6 : 1,
                }}
              >
                {saving ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={{ color: "#FFFFFF", fontWeight: "900", fontSize: 16 }}>
                    {editingId ? "Update note" : "Save note"}
                  </Text>
                )}
              </Pressable>
            </View>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

function AssignmentCard({
  assignment,
  linkedTechniques,
  accentColor,
  done,
  onToggle,
  onOpenTechnique,
}: {
  assignment: { id: string; title: string; description: string; dueDate?: string; linkedTechniqueIds?: string[] };
  linkedTechniques: Technique[];
  accentColor: string;
  done: boolean;
  onToggle: () => void;
  onOpenTechnique: (id: string) => void;
}) {
  return (
    <View
      style={{
        borderWidth: 1,
        borderColor: done ? withAlpha("#47B96E", 0.95) : "#2A2A2A",
        backgroundColor: done ? "rgba(71,185,110,0.1)" : "#111",
        borderRadius: 12,
        padding: 12,
        gap: 8,
      }}
    >
      <Text style={{ color: "#FFFFFF", fontWeight: "900" }}>{assignment.title}</Text>
      <Text style={{ color: "#C2C9D8" }}>{assignment.description}</Text>
      {assignment.dueDate ? <Text style={{ color: "#8E96A5", fontSize: 12 }}>Due: {assignment.dueDate}</Text> : null}
      {linkedTechniques.length > 0 ? (
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
          {linkedTechniques.map((technique) => (
            <Pressable
              key={`${assignment.id}-${technique.id}`}
              onPress={() => onOpenTechnique(technique.id)}
              style={{
                borderWidth: 1,
                borderColor: "#2A2A2A",
                borderRadius: 999,
                paddingHorizontal: 10,
                paddingVertical: 6,
                backgroundColor: "#191919",
              }}
            >
              <Text style={{ color: "#FFFFFF", fontWeight: "700", fontSize: 12 }}>{technique.name}</Text>
            </Pressable>
          ))}
        </View>
      ) : null}
      <Pressable
        onPress={onToggle}
        style={{
          borderWidth: 1,
          borderColor: done ? "#2E7A48" : accentColor,
          borderRadius: 10,
          paddingVertical: 9,
          alignItems: "center",
          backgroundColor: done ? "rgba(46,122,72,0.35)" : withAlpha(accentColor, 0.2),
        }}
      >
        <Text style={{ color: "#FFFFFF", fontWeight: "800" }}>{done ? "Mark as Pending" : "Mark as Completed"}</Text>
      </Pressable>
    </View>
  );
}
