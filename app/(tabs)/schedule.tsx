import { useFocusEffect } from "expo-router";
import React, { useMemo, useState } from "react";
import { Modal, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { GymLogoImage } from "../components/GymLogoImage";
import { useResolvedTechniques } from "../hooks/useResolvedTechniques";
import { loadProgress, toggleClassAttendance, type UserProgress } from "../store/progress";
import { GymDay, useGymStore, WEEK_DAYS, withAlpha, type GymScheduleClass } from "../store/gym";
import { formatShortWeekdayDate, formatWeekRangeLabel, getMondayWeekDates } from "../utils/week-dates";

function sortDayClasses<T extends { displayOrder?: number; time: string }>(list: T[]): T[] {
  return [...list].sort((a, b) => {
    const oa = a.displayOrder ?? 1_000_000;
    const ob = b.displayOrder ?? 1_000_000;
    if (oa !== ob) return oa - ob;
    return parseTimeToMinutes(a.time) - parseTimeToMinutes(b.time);
  });
}

export default function ScheduleScreen() {
  const isGymMode = useGymStore((state) => state.isGymMode);
  const gymName = useGymStore((state) => (state.isGymMode ? state.gymName : state.linkedGym?.gymName ?? state.gymName));
  const accentColor = useGymStore((state) =>
    state.isGymMode ? state.accentColor : state.linkedGym?.accentColor ?? state.accentColor
  );
  const logoUrl = useGymStore((state) => (state.isGymMode ? state.logoUrl : state.linkedGym?.logoUrl ?? state.logoUrl));
  const schedule = useGymStore((state) => (state.isGymMode ? state.schedule : state.linkedGym?.schedule ?? state.schedule));
  const upsertScheduleClass = useGymStore((state) => state.upsertScheduleClass);
  const removeScheduleClass = useGymStore((state) => state.removeScheduleClass);
  const techniques = useResolvedTechniques();
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [editingClass, setEditingClass] = useState<GymScheduleClass | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [draftDay, setDraftDay] = useState<GymDay>("Monday");
  const [draftTime, setDraftTime] = useState("");
  const [draftName, setDraftName] = useState("");
  const [draftInstructor, setDraftInstructor] = useState("");
  const [draftDescription, setDraftDescription] = useState("");

  useFocusEffect(
    React.useCallback(() => {
      void loadProgress().then(setProgress);
    }, [])
  );

  const week = useMemo(() => getMondayWeekDates(), []);
  const weekLabel = useMemo(() => formatWeekRangeLabel(week), [week]);
  const dateByDay = useMemo(() => {
    const map = new Map<GymDay, Date>();
    for (const { day, date } of week) map.set(day, date);
    return map;
  }, [week]);
  const dateTextByDay = useMemo(() => {
    const map = new Map<GymDay, string>();
    for (const { day, date } of week) map.set(day, formatShortWeekdayDate(date));
    return map;
  }, [week]);

  const byDay = useMemo(() => {
    const map: Record<GymDay, GymScheduleClass[]> = {
      Monday: [],
      Tuesday: [],
      Wednesday: [],
      Thursday: [],
      Friday: [],
      Saturday: [],
      Sunday: [],
    };
    for (const cls of schedule) map[cls.day].push(cls);
    (Object.keys(map) as GymDay[]).forEach((d) => (map[d] = sortDayClasses(map[d])));
    return map;
  }, [schedule]);

  const techniqueNameById = useMemo(() => new Map(techniques.map((t) => [t.id, t.name])), [techniques]);

  const upcoming = useMemo(() => {
    const now = new Date();
    const rows: { cls: GymScheduleClass; startsAt: Date }[] = [];
    for (const day of WEEK_DAYS) {
      const dayDate = dateByDay.get(day);
      if (!dayDate) continue;
      for (const cls of byDay[day]) {
        const mins = parseTimeToMinutes(cls.time);
        const startsAt = new Date(dayDate);
        startsAt.setHours(Math.floor(mins / 60), mins % 60, 0, 0);
        rows.push({ cls, startsAt });
      }
    }
    return rows
      .filter((r) => r.startsAt.getTime() >= now.getTime() - 1000 * 60 * 30)
      .sort((a, b) => a.startsAt.getTime() - b.startsAt.getTime())
      .slice(0, 4);
  }, [byDay, dateByDay]);

  function openCreateClass(day: GymDay) {
    setEditingClass(null);
    setDraftDay(day);
    setDraftTime("6:00 PM");
    setDraftName("");
    setDraftInstructor("");
    setDraftDescription("");
    setModalOpen(true);
  }

  function openEditClass(cls: GymScheduleClass) {
    setEditingClass(cls);
    setDraftDay(cls.day);
    setDraftTime(cls.time);
    setDraftName(cls.className);
    setDraftInstructor(cls.instructor ?? "");
    setDraftDescription(cls.description ?? "");
    setModalOpen(true);
  }

  function saveClass() {
    const className = draftName.trim();
    const time = draftTime.trim();
    if (!className || !time) return;
    const id = editingClass?.id ?? `class-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    upsertScheduleClass({
      id,
      day: draftDay,
      time,
      className,
      instructor: draftInstructor.trim() || undefined,
      description: draftDescription.trim() || undefined,
      focusTechniqueIds: editingClass?.focusTechniqueIds ?? [],
      displayOrder: editingClass?.displayOrder,
    });
    setModalOpen(false);
  }

  async function onToggleAttendance(classId: string, day: GymDay) {
    const classDate = dateByDay.get(day);
    if (!classDate) return;
    const key = toDateKey(classDate);
    const updated = await toggleClassAttendance(classId, key);
    setProgress(updated);
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#050505" }} edges={["top"]}>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16, gap: 14, paddingBottom: 34 }}>
        <View style={{ borderWidth: 1, borderColor: "#232323", borderRadius: 16, backgroundColor: "#101010", padding: 14, gap: 10 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
            <GymLogoImage uri={logoUrl} size={48} borderRadius={12} accentColor={accentColor} />
            <View style={{ flex: 1 }}>
              <Text style={{ color: "#FFFFFF", fontSize: 28, fontWeight: "900" }}>{gymName} Weekly Calendar</Text>
              <Text style={{ color: "#D4B06A", fontWeight: "700", marginTop: 2 }}>This week • {weekLabel}</Text>
              <Text style={{ color: "#AAB2C2", marginTop: 4 }}>
                {isGymMode
                  ? "Manage classes live and keep attendance momentum high."
                  : "Check upcoming classes and mark attendance to keep your streak alive."}
              </Text>
            </View>
          </View>
        </View>

        <View style={{ borderWidth: 1, borderColor: withAlpha("#D4B06A", 0.5), borderRadius: 12, backgroundColor: "rgba(212,176,106,0.08)", padding: 12, gap: 8 }}>
          <Text style={{ color: "#F2E2B8", fontWeight: "900", fontSize: 17 }}>Upcoming Classes</Text>
          {upcoming.length === 0 ? (
            <Text style={{ color: "#8E96A5" }}>No upcoming classes for this week.</Text>
          ) : (
            upcoming.map((row) => (
              <View key={`${row.cls.id}-${row.startsAt.toISOString()}`} style={{ borderWidth: 1, borderColor: "#2D2D2D", borderRadius: 10, backgroundColor: "#0F0F0F", padding: 10 }}>
                <Text style={{ color: "#FFFFFF", fontWeight: "900" }}>{row.cls.className}</Text>
                <Text style={{ color: "#D4B06A", marginTop: 2 }}>
                  {row.cls.day} • {row.cls.time} {row.cls.instructor ? `• ${row.cls.instructor}` : ""}
                </Text>
              </View>
            ))
          )}
        </View>

        <View style={{ borderWidth: 1, borderColor: "#232323", borderRadius: 12, backgroundColor: "#0E0E0E", padding: 12 }}>
          <Text style={{ color: "#FFFFFF", fontWeight: "900", marginBottom: 8 }}>Weekly Snapshot</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
            {WEEK_DAYS.map((day) => {
              const dayCount = byDay[day].length;
              const dayDate = dateByDay.get(day);
              const dateKey = dayDate ? toDateKey(dayDate) : "";
              const attendedCount = byDay[day].filter((cls) =>
                progress?.attendedClassKeys.includes(`${cls.id}|${dateKey}`)
              ).length;
              return (
                <View
                  key={`snap-${day}`}
                  style={{
                    width: 110,
                    borderWidth: 1,
                    borderColor: "#2A2A2A",
                    borderRadius: 10,
                    backgroundColor: "#111",
                    padding: 10,
                  }}
                >
                  <Text style={{ color: "#FFFFFF", fontWeight: "800" }}>{day.slice(0, 3)}</Text>
                  <Text style={{ color: "#D4B06A", marginTop: 4 }}>{dayCount} class{dayCount === 1 ? "" : "es"}</Text>
                  {!isGymMode ? (
                    <Text style={{ color: "#8E96A5", marginTop: 3, fontSize: 12 }}>
                      {attendedCount} attended
                    </Text>
                  ) : (
                    <Text style={{ color: "#8E96A5", marginTop: 3, fontSize: 12 }}>
                      {dayDate ? formatShortWeekdayDate(dayDate) : ""}
                    </Text>
                  )}
                </View>
              );
            })}
          </ScrollView>
        </View>

        {WEEK_DAYS.map((day) => {
          const classes = byDay[day];
          const dateLine = dateTextByDay.get(day) ?? "";
          return (
            <View key={day} style={{ gap: 8 }}>
              <View style={{ borderWidth: 1, borderColor: withAlpha(accentColor, 0.55), backgroundColor: withAlpha(accentColor, 0.12), borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8, flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                <View>
                  <Text style={{ color: "#FFFFFF", fontWeight: "900", fontSize: 16 }}>{day}</Text>
                  <Text style={{ color: "#D4B06A", fontWeight: "700", marginTop: 2 }}>{dateLine}</Text>
                </View>
                {isGymMode ? (
                  <Pressable onPress={() => openCreateClass(day)} style={{ borderWidth: 1, borderColor: withAlpha(accentColor, 0.72), borderRadius: 999, paddingHorizontal: 10, paddingVertical: 6, backgroundColor: withAlpha(accentColor, 0.2) }}>
                    <Text style={{ color: "#FFFFFF", fontWeight: "800", fontSize: 12 }}>+ Add Class</Text>
                  </Pressable>
                ) : null}
              </View>

              {classes.length === 0 ? (
                <View style={{ borderWidth: 1, borderColor: "#222", borderRadius: 12, backgroundColor: "#0E0E0E", padding: 12 }}>
                  <Text style={{ color: "#8E96A5" }}>No classes scheduled.</Text>
                </View>
              ) : (
                classes.map((cls) => {
                  const dateKey = toDateKey(dateByDay.get(day) ?? new Date());
                  const attended = Boolean(progress?.attendedClassKeys.includes(`${cls.id}|${dateKey}`));
                  return (
                    <View key={cls.id} style={{ borderWidth: 1, borderColor: "#222", borderRadius: 12, backgroundColor: "#0F0F0F", padding: 12, gap: 6 }}>
                      <Text style={{ color: accentColor, fontWeight: "900", fontSize: 13 }}>{cls.time}</Text>
                      <Text style={{ color: "#FFFFFF", fontSize: 17, fontWeight: "900" }}>{cls.className}</Text>
                      {cls.instructor ? <Text style={{ color: "#D4B06A", fontWeight: "700" }}>Instructor: {cls.instructor}</Text> : null}
                      {cls.description ? <Text style={{ color: "#AAB2C2", lineHeight: 20 }}>{cls.description}</Text> : null}
                      {(cls.focusTechniqueIds ?? []).length > 0 ? (
                        <View style={{ marginTop: 4, gap: 4 }}>
                          <Text style={{ color: "#D4B06A", fontWeight: "800", fontSize: 12 }}>Class focus moves</Text>
                          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
                            {(cls.focusTechniqueIds ?? []).map((techId) => (
                              <View key={`${cls.id}-${techId}`} style={{ borderWidth: 1, borderColor: "#2E2E2E", borderRadius: 999, backgroundColor: "#151515", paddingHorizontal: 10, paddingVertical: 5 }}>
                                <Text style={{ color: "#E6EBF4", fontSize: 12, fontWeight: "700" }}>
                                  {techniqueNameById.get(techId) ?? techId}
                                </Text>
                              </View>
                            ))}
                          </View>
                        </View>
                      ) : null}
                      <View style={{ flexDirection: "row", gap: 8, marginTop: 6 }}>
                        {!isGymMode ? (
                          <Pressable
                            onPress={() => void onToggleAttendance(cls.id, day)}
                            style={{
                              flex: 1,
                              borderWidth: 1,
                              borderColor: attended ? "#2A7A4A" : accentColor,
                              borderRadius: 10,
                              paddingVertical: 8,
                              alignItems: "center",
                              backgroundColor: attended ? "rgba(42,122,74,0.35)" : withAlpha(accentColor, 0.2),
                            }}
                          >
                            <Text style={{ color: "#FFFFFF", fontWeight: "800" }}>
                              {attended ? "Attended ✓" : "Mark Attended"}
                            </Text>
                          </Pressable>
                        ) : (
                          <>
                            <Pressable onPress={() => openEditClass(cls)} style={{ flex: 1, borderWidth: 1, borderColor: "#3E4B6A", borderRadius: 10, paddingVertical: 8, alignItems: "center", backgroundColor: "#162033" }}>
                              <Text style={{ color: "#DDE6FF", fontWeight: "800" }}>Edit</Text>
                            </Pressable>
                            <Pressable onPress={() => removeScheduleClass(cls.id)} style={{ flex: 1, borderWidth: 1, borderColor: "#5A1F1F", borderRadius: 10, paddingVertical: 8, alignItems: "center", backgroundColor: "#2A1111" }}>
                              <Text style={{ color: "#FFD6D6", fontWeight: "800" }}>Delete</Text>
                            </Pressable>
                          </>
                        )}
                      </View>
                    </View>
                  );
                })
              )}
            </View>
          );
        })}
      </ScrollView>

      <Modal visible={modalOpen} transparent animationType="slide" onRequestClose={() => setModalOpen(false)}>
        <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.7)", justifyContent: "flex-end" }}>
          <View style={{ backgroundColor: "#0A0A0A", borderTopLeftRadius: 18, borderTopRightRadius: 18, padding: 16, gap: 10 }}>
            <Text style={{ color: "#FFFFFF", fontSize: 20, fontWeight: "900" }}>
              {editingClass ? "Edit Class" : "New Class"}
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
              {WEEK_DAYS.map((day) => {
                const selected = day === draftDay;
                return (
                  <Pressable key={day} onPress={() => setDraftDay(day)} style={{ borderWidth: 1, borderColor: selected ? accentColor : "#2A2A2A", backgroundColor: selected ? withAlpha(accentColor, 0.2) : "#111", borderRadius: 999, paddingHorizontal: 10, paddingVertical: 6 }}>
                    <Text style={{ color: "#FFFFFF", fontWeight: "800", fontSize: 12 }}>{day}</Text>
                  </Pressable>
                );
              })}
            </ScrollView>
            <TextInput value={draftName} onChangeText={setDraftName} placeholder="Class name" placeholderTextColor="#5D6574" style={inputStyle} />
            <TextInput value={draftTime} onChangeText={setDraftTime} placeholder="Time (e.g. 6:00 PM)" placeholderTextColor="#5D6574" style={inputStyle} />
            <TextInput value={draftInstructor} onChangeText={setDraftInstructor} placeholder="Instructor" placeholderTextColor="#5D6574" style={inputStyle} />
            <TextInput value={draftDescription} onChangeText={setDraftDescription} placeholder="Class description" placeholderTextColor="#5D6574" style={[inputStyle, { minHeight: 72, textAlignVertical: "top" }]} multiline />
            <View style={{ flexDirection: "row", gap: 8 }}>
              <Pressable onPress={saveClass} style={[ctaButton, { flex: 1 }]}>
                <Text style={{ color: "#FFFFFF", fontWeight: "900" }}>Save Class</Text>
              </Pressable>
              <Pressable onPress={() => setModalOpen(false)} style={[secondaryButton, { flex: 1 }]}>
                <Text style={{ color: "#FFFFFF", fontWeight: "800" }}>Cancel</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

function parseTimeToMinutes(input: string): number {
  const raw = input.trim().toUpperCase();
  const m = raw.match(/^(\d{1,2})(?::(\d{2}))?\s*(AM|PM)?$/);
  if (!m) return 24 * 60;
  let hour = Number(m[1] ?? 0);
  const mins = Number(m[2] ?? 0);
  const ampm = m[3];
  if (ampm === "PM" && hour < 12) hour += 12;
  if (ampm === "AM" && hour === 12) hour = 0;
  return hour * 60 + mins;
}

function toDateKey(date: Date): string {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

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

const ctaButton = {
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
