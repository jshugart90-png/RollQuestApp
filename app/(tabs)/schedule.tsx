import React, { useMemo } from "react";
import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { GymLogoImage } from "../components/GymLogoImage";
import { useResolvedTechniques } from "../hooks/useResolvedTechniques";
import { GymDay, useGymStore, withAlpha } from "../store/gym";
import { formatShortWeekdayDate, formatWeekRangeLabel, getMondayWeekDates } from "../utils/week-dates";

const DAYS: GymDay[] = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

function sortDayClasses<T extends { displayOrder?: number; time: string }>(list: T[]): T[] {
  return [...list].sort((a, b) => {
    const oa = a.displayOrder ?? 1_000_000;
    const ob = b.displayOrder ?? 1_000_000;
    if (oa !== ob) return oa - ob;
    return a.time.localeCompare(b.time, undefined, { numeric: true });
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
  const techniques = useResolvedTechniques();

  const week = useMemo(() => getMondayWeekDates(), []);
  const weekLabel = useMemo(() => formatWeekRangeLabel(week), [week]);

  const dateByDay = useMemo(() => {
    const map = new Map<GymDay, string>();
    for (const { day, date } of week) {
      map.set(day, formatShortWeekdayDate(date));
    }
    return map;
  }, [week]);

  const byDay = useMemo(() => {
    const map: Record<GymDay, typeof schedule> = {
      Monday: [],
      Tuesday: [],
      Wednesday: [],
      Thursday: [],
      Friday: [],
      Saturday: [],
      Sunday: [],
    };
    for (const cls of schedule) {
      map[cls.day].push(cls);
    }
    (Object.keys(map) as GymDay[]).forEach((d) => {
      map[d] = sortDayClasses(map[d]);
    });
    return map;
  }, [schedule]);
  const techniqueNameById = useMemo(() => new Map(techniques.map((t) => [t.id, t.name])), [techniques]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#050505" }} edges={["top"]}>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16, gap: 14, paddingBottom: 32 }}>
        <View
          style={{
            borderWidth: 1,
            borderColor: "#232323",
            borderRadius: 16,
            backgroundColor: "#101010",
            padding: 14,
            gap: 10,
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
            <GymLogoImage uri={logoUrl} size={48} borderRadius={12} accentColor={accentColor} />
            <View style={{ flex: 1 }}>
              <Text style={{ color: "#FFFFFF", fontSize: 28, fontWeight: "900" }}>{gymName} Schedule</Text>
              <Text style={{ color: "#D4B06A", fontWeight: "700", marginTop: 2 }}>This week · {weekLabel}</Text>
              <Text style={{ color: "#AAB2C2", marginTop: 4 }}>
                Weekly class calendar for coaches, members, and visitors.
              </Text>
            </View>
          </View>
        </View>

        {DAYS.map((day) => {
          const classes = byDay[day];
          const dateLine = dateByDay.get(day) ?? "";
          return (
            <View key={day} style={{ gap: 8 }}>
              <View
                style={{
                  borderWidth: 1,
                  borderColor: withAlpha(accentColor, 0.55),
                  backgroundColor: withAlpha(accentColor, 0.12),
                  borderRadius: 10,
                  paddingHorizontal: 12,
                  paddingVertical: 8,
                }}
              >
                <Text style={{ color: "#FFFFFF", fontWeight: "900", fontSize: 16 }}>{day}</Text>
                <Text style={{ color: "#D4B06A", fontWeight: "700", marginTop: 2 }}>{dateLine}</Text>
              {!isGymMode && day === "Monday" ? (
                <Text style={{ color: "#8E96A5", marginTop: 3, fontSize: 12 }}>
                  Viewing synced gym schedule (student mode).
                </Text>
              ) : null}
              </View>

              {classes.length === 0 ? (
                <View
                  style={{
                    borderWidth: 1,
                    borderColor: "#222",
                    borderRadius: 12,
                    backgroundColor: "#0E0E0E",
                    padding: 12,
                  }}
                >
                  <Text style={{ color: "#8E96A5" }}>No classes scheduled.</Text>
                </View>
              ) : (
                classes.map((cls) => (
                  <View
                    key={cls.id}
                    style={{
                      borderWidth: 1,
                      borderColor: "#222",
                      borderRadius: 12,
                      backgroundColor: "#0F0F0F",
                      padding: 12,
                      gap: 6,
                    }}
                  >
                    <Text style={{ color: accentColor, fontWeight: "900", fontSize: 13 }}>{cls.time}</Text>
                    <Text style={{ color: "#FFFFFF", fontSize: 17, fontWeight: "900" }}>{cls.className}</Text>
                    {cls.instructor ? (
                      <Text style={{ color: "#D4B06A", fontWeight: "700" }}>Instructor: {cls.instructor}</Text>
                    ) : null}
                    {cls.description ? (
                      <Text style={{ color: "#AAB2C2", lineHeight: 20 }}>{cls.description}</Text>
                    ) : null}
                    {(cls.focusTechniqueIds ?? []).length > 0 ? (
                      <View style={{ marginTop: 4, gap: 4 }}>
                        <Text style={{ color: "#D4B06A", fontWeight: "800", fontSize: 12 }}>Class focus moves</Text>
                        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
                          {(cls.focusTechniqueIds ?? []).map((techId) => (
                            <View
                              key={`${cls.id}-${techId}`}
                              style={{
                                borderWidth: 1,
                                borderColor: "#2E2E2E",
                                borderRadius: 999,
                                backgroundColor: "#151515",
                                paddingHorizontal: 10,
                                paddingVertical: 5,
                              }}
                            >
                              <Text style={{ color: "#E6EBF4", fontSize: 12, fontWeight: "700" }}>
                                {techniqueNameById.get(techId) ?? techId}
                              </Text>
                            </View>
                          ))}
                        </View>
                      </View>
                    ) : null}
                  </View>
                ))
              )}
            </View>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}
