import type { Href } from "expo-router";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useMemo, useRef, useState } from "react";
import { Animated, Easing, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import Svg, { Circle } from "react-native-svg";
import { SafeAreaView } from "react-native-safe-area-context";
import { useResolvedTechniques } from "../hooks/useResolvedTechniques";
import { useGymStore, withAlpha } from "../store/gym";
import {
  CURRICULUM_BELTS,
  defaultProgress,
  loadProgress,
  markTechniqueReviewed,
  toggleDailyTaskCompleted,
  updateCurrentBelt,
  updateProfileName,
  type BeltLevel,
  type UserProgress,
} from "../store/progress";

const BELTS = CURRICULUM_BELTS as unknown as BeltLevel[];

const WARMUP_LIBRARY = [
  "Warm-up: Shrimping (3 x 30 seconds each side)",
  "Warm-up: Bridging + shoulder walk (2 minutes)",
  "Warm-up: Technical stand-ups (3 x 12 reps)",
  "Warm-up: Hip escapes to guard retention (2 minutes)",
  "Warm-up: Granby rolls + shoulder mobility (2 minutes)",
] as const;

export default function ProfileScreen() {
  const [progress, setProgress] = useState<UserProgress>(defaultProgress);
  const [draftProfileName, setDraftProfileName] = useState("Student");
  const [celebrationText, setCelebrationText] = useState("");
  const celebrationAnim = useRef(new Animated.Value(0)).current;

  const router = useRouter();
  const accentColor = useGymStore((state) => state.accentColor);
  const isGymMode = useGymStore((state) => state.isGymMode);
  const linkedGym = useGymStore((state) => state.linkedGym);
  const gymName = useGymStore((state) => state.gymName);
  const techniques = useResolvedTechniques();

  useFocusEffect(
    React.useCallback(() => {
      void loadProgress().then((loaded) => {
        setProgress(loaded);
        setDraftProfileName(loaded.profileName);
      });
    }, [])
  );

  async function onSelectBelt(belt: BeltLevel) {
    const updated = await updateCurrentBelt(belt);
    setProgress(updated);
  }

  async function onSaveProfileName() {
    const updated = await updateProfileName(draftProfileName);
    setProgress(updated);
    setDraftProfileName(updated.profileName);
  }

  const activeGymName = isGymMode ? gymName : linkedGym?.gymName;
  const todayKey = toDateKey(new Date());
  const completedToday = progress.completedDailyTaskIdsByDate[todayKey] ?? [];

  const totalForBelt = useMemo(
    () => techniques.filter((technique) => technique.belt === progress.currentBelt).length,
    [progress.currentBelt, techniques]
  );
  const masteredForBelt = useMemo(
    () =>
      techniques.filter(
        (technique) => technique.belt === progress.currentBelt && progress.learnedTechniqueIds.includes(technique.id)
      ).length,
    [progress.currentBelt, progress.learnedTechniqueIds, techniques]
  );
  const completionRatio = totalForBelt > 0 ? Math.min(1, masteredForBelt / totalForBelt) : 0;
  const completionPercent = Math.round(completionRatio * 100);

  const candidateTechniqueIds = progress.myTechniques.length > 0 ? progress.myTechniques : progress.learnedTechniqueIds;
  const candidateTechniques = candidateTechniqueIds
    .map((id) => techniques.find((item) => item.id === id))
    .filter((item): item is (typeof techniques)[number] => Boolean(item));

  const reviewPriority = [...candidateTechniques].sort((a, b) => {
    const daysA = daysSince(progress.lastReviewedByTechniqueId[a.id]);
    const daysB = daysSince(progress.lastReviewedByTechniqueId[b.id]);
    return daysB - daysA;
  });

  const unmasteredCurrentBelt = techniques.filter(
    (technique) => technique.belt === progress.currentBelt && !progress.learnedTechniqueIds.includes(technique.id)
  );
  const dailyWarmups = selectDailyWarmups(todayKey);
  const dailyTechniqueDrills = selectDailyTechniqueDrills(reviewPriority, unmasteredCurrentBelt);

  const todayMissionTasks: DailyTask[] = [
    ...dailyWarmups.map((label, idx) => ({ id: `warmup-${todayKey}-${idx}`, label, type: "warmup" as const })),
    ...dailyTechniqueDrills.map((technique) => ({
      id: `drill-${technique.id}`,
      label: `Drill: ${technique.name}`,
      type: "technique" as const,
      techniqueId: technique.id,
    })),
  ].slice(0, 4);

  const readyForReview = reviewPriority.slice(0, 6);

  const favoritePosition = useMemo(() => {
    const preferredIds = [...new Set([...progress.myTechniques, ...progress.learnedTechniqueIds])];
    if (preferredIds.length === 0) return { label: "Not enough data yet", percent: 0 };
    const counts = new Map<string, number>();
    for (const id of preferredIds) {
      const tech = techniques.find((item) => item.id === id);
      if (!tech) continue;
      counts.set(tech.position, (counts.get(tech.position) ?? 0) + 1);
    }
    const sorted = [...counts.entries()].sort((a, b) => b[1] - a[1]);
    if (sorted.length === 0) return { label: "Not enough data yet", percent: 0 };
    const top = sorted[0];
    return { label: top[0], percent: Math.round((top[1] / preferredIds.length) * 100) };
  }, [progress.learnedTechniqueIds, progress.myTechniques, techniques]);

  async function onToggleTask(task: DailyTask) {
    const wasDone = completedToday.includes(task.id);
    let updated = await toggleDailyTaskCompleted(task.id);
    if (task.techniqueId && !wasDone) {
      updated = await markTechniqueReviewed(task.techniqueId);
    }
    setProgress(updated);
    if (!wasDone) {
      triggerCelebration(task.type === "technique" ? "Technique banked. Keep stacking wins." : "Mission complete. Momentum locked in.");
    }
  }

  async function onReviewNow(techniqueId: string) {
    const updated = await markTechniqueReviewed(techniqueId);
    setProgress(updated);
    router.push(`/technique/${techniqueId}` as Href);
  }

  function triggerCelebration(message: string) {
    setCelebrationText(message);
    celebrationAnim.setValue(0);
    Animated.sequence([
      Animated.timing(celebrationAnim, {
        toValue: 1,
        duration: 280,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.delay(850),
      Animated.timing(celebrationAnim, {
        toValue: 0,
        duration: 280,
        easing: Easing.in(Easing.quad),
        useNativeDriver: true,
      }),
    ]).start();
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#030303" }} edges={["top"]}>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16, gap: 14, paddingBottom: 34 }}>
        <View style={heroCard}>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
            <View style={{ flex: 1 }}>
              <Text style={{ color: "#6E7788", letterSpacing: 1.2, fontWeight: "800", fontSize: 12 }}>ROLLQUEST PROFILE</Text>
              <TextInput
                value={draftProfileName}
                onChangeText={setDraftProfileName}
                placeholder="Your name"
                placeholderTextColor="#6B7280"
                style={{
                  color: "#FFFFFF",
                  fontSize: 30,
                  fontWeight: "900",
                  marginTop: 6,
                  borderBottomWidth: 1,
                  borderBottomColor: "#222",
                  paddingBottom: 4,
                }}
              />
              <Pressable
                onPress={() => void onSaveProfileName()}
                style={{
                  marginTop: 10,
                  alignSelf: "flex-start",
                  borderWidth: 1,
                  borderColor: withAlpha(accentColor, 0.8),
                  backgroundColor: withAlpha(accentColor, 0.18),
                  borderRadius: 999,
                  paddingHorizontal: 12,
                  paddingVertical: 7,
                }}
              >
                <Text style={{ color: "#FFFFFF", fontWeight: "800" }}>Save Name</Text>
              </Pressable>
              {activeGymName ? <Text style={{ color: "#D4B06A", marginTop: 10, fontWeight: "700" }}>Gym Mode: {activeGymName}</Text> : null}
            </View>
            <ProgressRing progress={completionRatio} accentColor={accentColor} />
          </View>
          <Text style={{ color: "#FFFFFF", fontSize: 22, fontWeight: "900", marginTop: 14, textTransform: "capitalize" }}>
            {progress.currentBelt} Belt • {completionPercent}% Complete
          </Text>
          <Text style={{ color: "#AAB2C2", marginTop: 4 }}>
            {masteredForBelt} / {totalForBelt} techniques at your current belt are mastered.
          </Text>
        </View>

        <View style={[glassCard, { borderColor: withAlpha("#D4B06A", 0.55), backgroundColor: "rgba(212,176,106,0.08)" }]}>
          <Text style={{ color: "#FFFFFF", fontSize: 30, fontWeight: "900" }}>🔥 {progress.streakCount} Day Streak</Text>
          <Text style={{ color: "#E7C98A", marginTop: 5, fontSize: 15, fontWeight: "700" }}>{streakMotivation(progress.streakCount)}</Text>
          <Text style={{ color: "#AAB2C2", marginTop: 6 }}>
            Longest streak: {progress.longestStreak} days • Sessions logged: {progress.totalSessionsLogged}
          </Text>
        </View>

        <View style={glassCard}>
          <Text style={sectionTitle}>Today&apos;s Mission</Text>
          <Text style={sectionSubtle}>Finish your daily reps and keep your progression curve moving up.</Text>
          <View style={{ gap: 10, marginTop: 10 }}>
            {todayMissionTasks.map((task) => {
              const done = completedToday.includes(task.id);
              return (
                <View
                  key={task.id}
                  style={{
                    borderWidth: 1,
                    borderColor: done ? withAlpha("#47B96E", 0.9) : "#262626",
                    borderRadius: 12,
                    backgroundColor: done ? "rgba(71,185,110,0.12)" : "#0A0A0A",
                    padding: 12,
                  }}
                >
                  <Text style={{ color: "#EAF0FC", fontWeight: "700" }}>{task.label}</Text>
                  <Pressable
                    onPress={() => void onToggleTask(task)}
                    style={{
                      marginTop: 8,
                      borderWidth: 1,
                      borderColor: done ? "#2A6B3E" : accentColor,
                      borderRadius: 10,
                      paddingVertical: 8,
                      alignItems: "center",
                      backgroundColor: done ? "rgba(35,85,53,0.45)" : withAlpha(accentColor, 0.24),
                    }}
                  >
                    <Text style={{ color: "#FFFFFF", fontWeight: "900" }}>{done ? "Completed ✓" : "Mark Complete"}</Text>
                  </Pressable>
                </View>
              );
            })}
          </View>
        </View>

        <View style={glassCard}>
          <Text style={sectionTitle}>Ready for Review</Text>
          <Text style={sectionSubtle}>These techniques are due now based on your review history.</Text>
          <View style={{ gap: 10, marginTop: 10 }}>
            {readyForReview.length === 0 ? (
              <Text style={{ color: "#AAB2C2" }}>Add techniques to My Library to unlock spaced repetition reviews.</Text>
            ) : (
              readyForReview.map((technique) => {
                const days = daysSince(progress.lastReviewedByTechniqueId[technique.id]);
                return (
                  <View
                    key={`review-${technique.id}`}
                    style={{
                      borderWidth: 1,
                      borderColor: "#232323",
                      borderRadius: 12,
                      backgroundColor: "#0D0D0D",
                      padding: 12,
                    }}
                  >
                    <Text style={{ color: "#FFFFFF", fontWeight: "900" }}>{technique.name}</Text>
                    <Text style={{ color: "#AAB2C2", marginTop: 2 }}>{technique.position}</Text>
                    <Text style={{ color: "#7F8795", marginTop: 4 }}>
                      {days >= 9999 ? "Never reviewed" : `${days} day${days === 1 ? "" : "s"} since review`}
                    </Text>
                    <Pressable
                      onPress={() => void onReviewNow(technique.id)}
                      style={{
                        marginTop: 8,
                        borderWidth: 1,
                        borderColor: accentColor,
                        borderRadius: 10,
                        paddingVertical: 8,
                        alignItems: "center",
                        backgroundColor: withAlpha(accentColor, 0.2),
                      }}
                    >
                      <Text style={{ color: "#FFFFFF", fontWeight: "900" }}>Review Now</Text>
                    </Pressable>
                  </View>
                );
              })
            )}
          </View>
        </View>

        <View style={glassCard}>
          <Text style={sectionTitle}>Quick Stats</Text>
          <View style={{ marginTop: 10, gap: 10 }}>
            <StatsGridTile label="Techniques Mastered" value={String(progress.learnedTechniqueIds.length)} />
            <StatsGridTile label="My Library Size" value={String(progress.myTechniques.length)} />
            <StatsGridTile label="Total Sessions Logged" value={String(progress.totalSessionsLogged)} />
            <StatsGridTile
              label="Favorite Position"
              value={favoritePosition.percent > 0 ? `${favoritePosition.label} (${favoritePosition.percent}%)` : favoritePosition.label}
            />
          </View>
        </View>

        <View style={glassCard}>
          <Text style={sectionTitle}>Set Current Belt</Text>
          <View style={{ gap: 8, marginTop: 8 }}>
            {BELTS.map((belt) => {
              const selected = belt === progress.currentBelt;
              return (
                <Pressable
                  key={belt}
                  onPress={() => void onSelectBelt(belt)}
                  style={{
                    borderWidth: 1,
                    borderColor: selected ? accentColor : "#2A2A2A",
                    borderRadius: 12,
                    backgroundColor: selected ? withAlpha(accentColor, 0.16) : "#0A0A0A",
                    padding: 12,
                  }}
                >
                  <Text style={{ color: "#FFFFFF", fontSize: 16, fontWeight: "900", textTransform: "capitalize" }}>{belt} belt</Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      </ScrollView>

      <Animated.View
        pointerEvents="none"
        style={{
          position: "absolute",
          left: 16,
          right: 16,
          bottom: 22,
          opacity: celebrationAnim,
          transform: [
            {
              translateY: celebrationAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [20, 0],
              }),
            },
          ],
        }}
      >
        <View
          style={{
            borderWidth: 1,
            borderColor: withAlpha("#47B96E", 0.9),
            borderRadius: 12,
            backgroundColor: "rgba(39,98,61,0.85)",
            paddingVertical: 10,
            paddingHorizontal: 12,
          }}
        >
          <Text style={{ color: "#EAFBEF", fontWeight: "900", textAlign: "center" }}>✅ {celebrationText}</Text>
        </View>
      </Animated.View>
    </SafeAreaView>
  );
}

function ProgressRing({ progress, accentColor }: { progress: number; accentColor: string }) {
  const size = 112;
  const strokeWidth = 10;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.max(0, Math.min(1, progress));
  const offset = circumference * (1 - clamped);
  return (
    <View style={{ width: size, height: size, alignItems: "center", justifyContent: "center" }}>
      <Svg width={size} height={size}>
        <Circle cx={size / 2} cy={size / 2} r={radius} stroke="#1D1D1D" strokeWidth={strokeWidth} fill="none" />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={accentColor}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={offset}
          strokeLinecap="round"
          rotation="-90"
          originX={size / 2}
          originY={size / 2}
        />
      </Svg>
      <Text style={{ position: "absolute", color: "#FFFFFF", fontWeight: "900", fontSize: 21 }}>{Math.round(clamped * 100)}%</Text>
    </View>
  );
}

function StatsGridTile({ label, value }: { label: string; value: string }) {
  return (
    <View
      style={{
        borderWidth: 1,
        borderColor: "#242424",
        borderRadius: 12,
        backgroundColor: "#0B0B0B",
        paddingVertical: 12,
        paddingHorizontal: 12,
      }}
    >
      <Text style={{ color: "#8E96A5", fontWeight: "700" }}>{label}</Text>
      <Text style={{ color: "#FFFFFF", fontSize: 18, fontWeight: "900", marginTop: 3 }}>{value}</Text>
    </View>
  );
}

function streakMotivation(streak: number): string {
  if (streak >= 30) return "Elite consistency. You are building a black-belt pace.";
  if (streak >= 14) return "Two-week heater. Stay ruthless with your reps.";
  if (streak >= 7) return "One full week stacked. Keep owning each day.";
  if (streak >= 3) return "Momentum is live. Small wins become big results.";
  return "Start today. A fresh streak starts with one mission.";
}

function toDateKey(date: Date): string {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function daysSince(dateString: string | undefined): number {
  if (!dateString) return 9999;
  const date = new Date(`${dateString}T00:00:00`);
  if (Number.isNaN(date.getTime())) return 9999;
  const today = new Date();
  const floorToday = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
  const floorDate = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
  return Math.max(0, Math.floor((floorToday - floorDate) / (1000 * 60 * 60 * 24)));
}

function selectDailyWarmups(dateKey: string): string[] {
  const hash = [...dateKey].reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const first = hash % WARMUP_LIBRARY.length;
  const second = (first + 2) % WARMUP_LIBRARY.length;
  return [WARMUP_LIBRARY[first], WARMUP_LIBRARY[second]];
}

function selectDailyTechniqueDrills(
  reviewPriority: { id: string; name: string }[],
  currentBeltUnmastered: { id: string; name: string }[]
): { id: string; name: string }[] {
  const picks: { id: string; name: string }[] = [];
  const seen = new Set<string>();
  for (const candidate of reviewPriority) {
    if (seen.has(candidate.id)) continue;
    picks.push(candidate);
    seen.add(candidate.id);
    if (picks.length >= 2) break;
  }
  for (const candidate of currentBeltUnmastered) {
    if (seen.has(candidate.id)) continue;
    picks.push(candidate);
    seen.add(candidate.id);
    if (picks.length >= 3) break;
  }
  return picks;
}

type DailyTask = {
  id: string;
  label: string;
  type: "warmup" | "technique";
  techniqueId?: string;
};

const heroCard = {
  borderWidth: 1,
  borderColor: "#232323",
  borderRadius: 18,
  backgroundColor: "#090909",
  padding: 16,
};

const glassCard = {
  borderWidth: 1,
  borderColor: "#202020",
  borderRadius: 14,
  backgroundColor: "#0E0E0E",
  padding: 14,
};

const sectionTitle = {
  color: "#FFFFFF",
  fontSize: 21,
  fontWeight: "900" as const,
};

const sectionSubtle = {
  color: "#98A1B2",
  marginTop: 4,
};
