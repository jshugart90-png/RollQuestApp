import React, { useMemo, useState } from "react";
import { Modal, Pressable, StyleSheet, Text, TextInput, TouchableWithoutFeedback, View } from "react-native";
import { useResolvedTechniques } from "../hooks/useResolvedTechniques";
import type { GymDay, GymScheduleClass } from "../store/gym";
import { WEEK_DAYS, withAlpha } from "../store/gym";

type Props = {
  accentColor: string;
  schedule: GymScheduleClass[];
  upsertScheduleClass: (item: GymScheduleClass) => void;
  removeScheduleClass: (id: string) => void;
  reorderScheduleForDay: (day: GymDay, orderedIds: string[]) => void;
  duplicateScheduleClassToDays: (id: string, targetDays: GymDay[]) => void;
  onDragStateChange?: (isDragging: boolean) => void;
};

const input = {
  borderWidth: 1,
  borderColor: "#2A2A2A",
  borderRadius: 10,
  backgroundColor: "#0F0F0F",
  color: "#FFFFFF",
  paddingHorizontal: 12,
  paddingVertical: 10,
  fontSize: 16,
} as const;

export function GymScheduleEditor({
  accentColor,
  schedule,
  upsertScheduleClass,
  removeScheduleClass,
  reorderScheduleForDay,
  duplicateScheduleClassToDays,
  onDragStateChange,
}: Props) {
  const techniques = useResolvedTechniques();
  const techniqueNameById = useMemo(() => new Map(techniques.map((t) => [t.id, t.name])), [techniques]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [focusSearch, setFocusSearch] = useState("");
  const [classForm, setClassForm] = useState<Omit<GymScheduleClass, "id">>({
    day: "Monday",
    time: "",
    className: "",
    instructor: "",
    description: "",
    focusTechniqueIds: [],
  });
  const [dupSourceId, setDupSourceId] = useState<string | null>(null);
  const [dupTargets, setDupTargets] = useState<Record<GymDay, boolean>>(
    () =>
      ({
        Monday: false,
        Tuesday: false,
        Wednesday: false,
        Thursday: false,
        Friday: false,
        Saturday: false,
        Sunday: false,
      }) as Record<GymDay, boolean>
  );

  const sortedFlat = useMemo(() => {
    const order = new Map(WEEK_DAYS.map((d, i) => [d, i]));
    return [...schedule].sort((a, b) => {
      const di = (order.get(a.day) ?? 99) - (order.get(b.day) ?? 99);
      if (di !== 0) return di;
      const oa = a.displayOrder ?? 1_000_000;
      const ob = b.displayOrder ?? 1_000_000;
      if (oa !== ob) return oa - ob;
      return a.time.localeCompare(b.time, undefined, { numeric: true });
    });
  }, [schedule]);

  function clearClassForm() {
    setEditingId(null);
    setClassForm({
      day: "Monday",
      time: "",
      className: "",
      instructor: "",
      description: "",
      focusTechniqueIds: [],
    });
    setFocusSearch("");
  }

  function onSaveClass() {
    if (!classForm.className.trim() || !classForm.time.trim()) return;
    const id = editingId ?? `class-${Date.now()}`;
    upsertScheduleClass({
      id,
      day: classForm.day,
      time: classForm.time.trim(),
      className: classForm.className.trim(),
      instructor: classForm.instructor?.trim() || undefined,
      description: classForm.description?.trim() || undefined,
      focusTechniqueIds: classForm.focusTechniqueIds?.length ? classForm.focusTechniqueIds : undefined,
    });
    clearClassForm();
  }

  function onEditClass(item: GymScheduleClass) {
    setEditingId(item.id);
    setClassForm({
      day: item.day,
      time: item.time,
      className: item.className,
      instructor: item.instructor ?? "",
      description: item.description ?? "",
      focusTechniqueIds: item.focusTechniqueIds ?? [],
    });
  }

  const focusResults = useMemo(() => {
    const q = focusSearch.trim().toLowerCase();
    if (!q) return [];
    const selected = new Set(classForm.focusTechniqueIds ?? []);
    return techniques
      .filter((t) => !selected.has(t.id))
      .filter((t) => t.name.toLowerCase().includes(q) || t.position.toLowerCase().includes(q))
      .slice(0, 8);
  }, [classForm.focusTechniqueIds, focusSearch, techniques]);

  function openDuplicate(item: GymScheduleClass) {
    setDupSourceId(item.id);
    const fresh: Record<GymDay, boolean> = {
      Monday: false,
      Tuesday: false,
      Wednesday: false,
      Thursday: false,
      Friday: false,
      Saturday: false,
      Sunday: false,
    };
    setDupTargets(fresh);
  }

  function confirmDuplicate() {
    if (!dupSourceId) return;
    const days = WEEK_DAYS.filter((d) => dupTargets[d]);
    if (days.length === 0) return;
    duplicateScheduleClassToDays(dupSourceId, days);
    setDupSourceId(null);
  }

  return (
    <>
      <View style={{ gap: 14, paddingBottom: 40 }}>
        <View
          style={{
            borderWidth: 1,
            borderColor: "#222",
            backgroundColor: "#101010",
            borderRadius: 14,
            padding: 14,
            gap: 10,
          }}
        >
          <Text style={{ color: "#FFFFFF", fontSize: 17, fontWeight: "800" }}>Class schedule</Text>
          <Text style={{ color: "#8E96A5" }}>
            Add or edit classes. Long press a row to drag and reorder within that day.
          </Text>

          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
            {WEEK_DAYS.map((day) => {
              const selected = classForm.day === day;
              return (
                <Pressable
                  key={day}
                  onPress={() => setClassForm((prev) => ({ ...prev, day }))}
                  style={{
                    borderWidth: 1,
                    borderColor: selected ? accentColor : "#2A2A2A",
                    backgroundColor: selected ? withAlpha(accentColor, 0.2) : "#0D0D0D",
                    borderRadius: 999,
                    paddingHorizontal: 10,
                    paddingVertical: 6,
                  }}
                >
                  <Text style={{ color: "#FFFFFF", fontWeight: "700", fontSize: 12 }}>{day.slice(0, 3)}</Text>
                </Pressable>
              );
            })}
          </View>

          <TextInput
            value={classForm.time}
            onChangeText={(time) => setClassForm((prev) => ({ ...prev, time }))}
            placeholder="Time (e.g. 6:30 PM)"
            placeholderTextColor="#5D6574"
            style={input}
          />
          <TextInput
            value={classForm.className}
            onChangeText={(className) => setClassForm((prev) => ({ ...prev, className }))}
            placeholder="Class name"
            placeholderTextColor="#5D6574"
            style={input}
          />
          <TextInput
            value={classForm.instructor}
            onChangeText={(instructor) => setClassForm((prev) => ({ ...prev, instructor }))}
            placeholder="Instructor (optional)"
            placeholderTextColor="#5D6574"
            style={input}
          />
          <TextInput
            value={classForm.description}
            onChangeText={(description) => setClassForm((prev) => ({ ...prev, description }))}
            placeholder="Description (optional)"
            placeholderTextColor="#5D6574"
            style={[input, { minHeight: 70, textAlignVertical: "top" }]}
            multiline
          />
          <Text style={{ color: "#8E96A5", fontWeight: "700" }}>Class focus moves (optional)</Text>
          {(classForm.focusTechniqueIds ?? []).length > 0 ? (
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
              {(classForm.focusTechniqueIds ?? []).map((techId) => (
                <Pressable
                  key={techId}
                  onPress={() =>
                    setClassForm((prev) => ({
                      ...prev,
                      focusTechniqueIds: (prev.focusTechniqueIds ?? []).filter((id) => id !== techId),
                    }))
                  }
                  style={{
                    borderWidth: 1,
                    borderColor: "#D4B06A",
                    backgroundColor: "rgba(212,176,106,0.12)",
                    borderRadius: 999,
                    paddingHorizontal: 10,
                    paddingVertical: 6,
                  }}
                >
                  <Text style={{ color: "#FFFFFF", fontWeight: "700", fontSize: 12 }}>
                    {techniqueNameById.get(techId) ?? techId} ×
                  </Text>
                </Pressable>
              ))}
            </View>
          ) : null}
          <TextInput
            value={focusSearch}
            onChangeText={setFocusSearch}
            placeholder="Search moves to tag for this class..."
            placeholderTextColor="#5D6574"
            style={input}
          />
          {focusSearch.trim().length > 0 ? (
            <View
              style={{
                borderWidth: 1,
                borderColor: "#2A2A2A",
                borderRadius: 10,
                backgroundColor: "#0D0D0D",
                padding: 8,
                gap: 6,
              }}
            >
              {focusResults.length === 0 ? (
                <Text style={{ color: "#8E96A5", paddingHorizontal: 4, paddingVertical: 8 }}>No matching techniques</Text>
              ) : (
                focusResults.map((tech) => (
                  <Pressable
                    key={tech.id}
                    onPress={() =>
                      setClassForm((prev) => ({
                        ...prev,
                        focusTechniqueIds: [...(prev.focusTechniqueIds ?? []), tech.id],
                      }))
                    }
                    style={{
                      borderWidth: 1,
                      borderColor: "#2A2A2A",
                      backgroundColor: "#111",
                      borderRadius: 8,
                      paddingHorizontal: 10,
                      paddingVertical: 8,
                    }}
                  >
                    <Text style={{ color: "#FFFFFF", fontWeight: "700" }}>{tech.name}</Text>
                    <Text style={{ color: "#8E96A5", fontSize: 12 }}>{tech.position}</Text>
                  </Pressable>
                ))
              )}
            </View>
          ) : null}

          <View style={{ flexDirection: "row", gap: 10 }}>
            <Pressable
              onPress={onSaveClass}
              style={{
                flex: 1,
                borderWidth: 1,
                borderColor: withAlpha(accentColor, 0.75),
                backgroundColor: withAlpha(accentColor, 0.2),
                borderRadius: 10,
                paddingVertical: 10,
                alignItems: "center",
              }}
            >
              <Text style={{ color: "#FFFFFF", fontWeight: "900" }}>{editingId ? "Update Class" : "Add Class"}</Text>
            </Pressable>
            {editingId ? (
              <Pressable
                onPress={clearClassForm}
                style={{
                  borderWidth: 1,
                  borderColor: "#2F2F2F",
                  backgroundColor: "#151515",
                  borderRadius: 10,
                  paddingVertical: 10,
                  paddingHorizontal: 12,
                }}
              >
                <Text style={{ color: "#FFFFFF", fontWeight: "800" }}>Cancel</Text>
              </Pressable>
            ) : null}
          </View>
        </View>

        <View
          style={{
            borderWidth: 1,
            borderColor: "#222",
            backgroundColor: "#101010",
            borderRadius: 14,
            padding: 14,
            gap: 10,
          }}
        >
          <Text style={{ color: "#8E96A5", fontWeight: "700" }}>All classes (compact)</Text>
          {sortedFlat.map((item) => (
            <View
              key={item.id}
              style={{
                borderWidth: 1,
                borderColor: "#242424",
                backgroundColor: "#0D0D0D",
                borderRadius: 10,
                padding: 10,
                gap: 4,
              }}
            >
              <Text style={{ color: accentColor, fontWeight: "800" }}>
                {item.day} · {item.time}
              </Text>
              <Text style={{ color: "#FFFFFF", fontSize: 16, fontWeight: "900" }}>{item.className}</Text>
              {(item.focusTechniqueIds ?? []).length > 0 ? (
                <Text style={{ color: "#D4B06A", fontSize: 12 }}>
                  Focus: {(item.focusTechniqueIds ?? []).map((id) => techniqueNameById.get(id) ?? id).join(" · ")}
                </Text>
              ) : null}
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 4 }}>
                <Pressable
                  onPress={() => onEditClass(item)}
                  style={{
                    borderWidth: 1,
                    borderColor: "#333",
                    borderRadius: 8,
                    paddingHorizontal: 10,
                    paddingVertical: 6,
                    backgroundColor: "#171717",
                  }}
                >
                  <Text style={{ color: "#FFFFFF", fontWeight: "700" }}>Edit</Text>
                </Pressable>
                <Pressable
                  onPress={() => openDuplicate(item)}
                  style={{
                    borderWidth: 1,
                    borderColor: withAlpha(accentColor, 0.55),
                    borderRadius: 8,
                    paddingHorizontal: 10,
                    paddingVertical: 6,
                    backgroundColor: withAlpha(accentColor, 0.12),
                  }}
                >
                  <Text style={{ color: "#FFFFFF", fontWeight: "700" }}>Copy to days…</Text>
                </Pressable>
                <Pressable
                  onPress={() => removeScheduleClass(item.id)}
                  style={{
                    borderWidth: 1,
                    borderColor: "#5A1F1F",
                    borderRadius: 8,
                    paddingHorizontal: 10,
                    paddingVertical: 6,
                    backgroundColor: "#2A1111",
                  }}
                >
                  <Text style={{ color: "#FFD6D6", fontWeight: "700" }}>Delete</Text>
                </Pressable>
              </View>
            </View>
          ))}
        </View>

      </View>

      <Modal transparent visible={dupSourceId !== null} animationType="fade">
        <View style={{ flex: 1 }}>
          <TouchableWithoutFeedback onPress={() => setDupSourceId(null)}>
            <View style={[StyleSheet.absoluteFillObject, { backgroundColor: "rgba(0,0,0,0.65)" }]} />
          </TouchableWithoutFeedback>
          <View
            style={{
              zIndex: 2,
              position: "absolute",
              left: 20,
              right: 20,
              top: "18%",
              borderRadius: 16,
              borderWidth: 1,
              borderColor: "#2A2A2A",
              backgroundColor: "#121212",
              padding: 16,
              gap: 12,
            }}
          >
            <Text style={{ color: "#FFFFFF", fontSize: 18, fontWeight: "900" }}>Copy class to</Text>
            <Text style={{ color: "#8E96A5" }}>Pick one or more weekdays. A duplicate is created for each.</Text>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
              {WEEK_DAYS.map((day) => {
                const on = dupTargets[day];
                return (
                  <Pressable
                    key={day}
                    onPress={() => setDupTargets((prev) => ({ ...prev, [day]: !prev[day] }))}
                    style={{
                      borderWidth: 1,
                      borderColor: on ? accentColor : "#333",
                      backgroundColor: on ? withAlpha(accentColor, 0.22) : "#0D0D0D",
                      borderRadius: 999,
                      paddingHorizontal: 12,
                      paddingVertical: 8,
                    }}
                  >
                    <Text style={{ color: "#FFFFFF", fontWeight: "800", fontSize: 12 }}>{day}</Text>
                  </Pressable>
                );
              })}
            </View>
            <View style={{ flexDirection: "row", gap: 10 }}>
              <Pressable
                onPress={confirmDuplicate}
                style={{
                  flex: 1,
                  borderRadius: 10,
                  paddingVertical: 12,
                  alignItems: "center",
                  backgroundColor: withAlpha(accentColor, 0.25),
                  borderWidth: 1,
                  borderColor: accentColor,
                }}
              >
                <Text style={{ color: "#FFFFFF", fontWeight: "900" }}>Duplicate</Text>
              </Pressable>
              <Pressable
                onPress={() => setDupSourceId(null)}
                style={{
                  borderRadius: 10,
                  paddingVertical: 12,
                  paddingHorizontal: 16,
                  backgroundColor: "#1E1E1E",
                  borderWidth: 1,
                  borderColor: "#333",
                }}
              >
                <Text style={{ color: "#FFFFFF", fontWeight: "800" }}>Close</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}
