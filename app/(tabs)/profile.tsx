import type { Href } from "expo-router";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useMemo, useRef, useState } from "react";
import { Animated, Easing, Modal, Platform, Pressable, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import Svg, { Circle } from "react-native-svg";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useResolvedTechniques } from "../hooks/useResolvedTechniques";
import { useAssignmentsStore } from "../store/assignments";
import { useGymStore, withAlpha } from "../store/gym";
import { pendingRequestsForGym, useTechniqueRequestStore } from "../store/techniqueRequests";
import {
  CURRICULUM_BELTS,
  defaultProgress,
  loadProgress,
  markTechniqueReviewed,
  rateTechniqueRecall,
  setTechniqueMasteryLevel,
  toggleDailyTaskCompleted,
  updateCurrentBelt,
  updateProfileName,
  type BeltLevel,
  type TechniqueMasteryLevel,
  type UserProgress,
} from "../store/progress";

const BELTS = CURRICULUM_BELTS as unknown as BeltLevel[];

type ReviewQueueItem = {
  technique: { id: string; name: string; position: string };
  days: number;
  strength: number;
  score: number;
};

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
  const [reviewSessionOpen, setReviewSessionOpen] = useState(false);
  const [sessionQueue, setSessionQueue] = useState<ReviewQueueItem[]>([]);
  const [sessionTotalCount, setSessionTotalCount] = useState(0);
  const celebrationAnim = useRef(new Animated.Value(0)).current;
  const streakPulseAnim = useRef(new Animated.Value(0)).current;
  const previousStreakRef = useRef(defaultProgress.streakCount);

  const router = useRouter();
  const accentColor = useGymStore((state) => state.accentColor);
  const isGymMode = useGymStore((state) => state.isGymMode);
  const linkedGym = useGymStore((state) => state.linkedGym);
  const gymName = useGymStore((state) => state.gymName);
  const techniques = useResolvedTechniques();
  const assignments = useAssignmentsStore((state) => state.assignments);
  const techniqueRequests = useTechniqueRequestStore((state) => state.requests);

  useFocusEffect(
    React.useCallback(() => {
      void loadProgress().then((loaded) => {
        if (loaded.streakCount > previousStreakRef.current) {
          setCelebrationText(`Streak up! You are now at ${loaded.streakCount} days.`);
          streakPulseAnim.setValue(0);
          Animated.sequence([
            Animated.timing(streakPulseAnim, {
              toValue: 1,
              duration: 320,
              easing: Easing.out(Easing.back(1.8)),
              useNativeDriver: true,
            }),
            Animated.timing(streakPulseAnim, {
              toValue: 0,
              duration: 240,
              easing: Easing.inOut(Easing.quad),
              useNativeDriver: true,
            }),
          ]).start();
        }
        previousStreakRef.current = loaded.streakCount;
        setProgress(loaded);
        setDraftProfileName(loaded.profileName);
      });
    }, [streakPulseAnim])
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
  const pendingGymRequests = useMemo(() => {
    if (!linkedGym || isGymMode) return 0;
    return pendingRequestsForGym(linkedGym.gymId, techniqueRequests).length;
  }, [isGymMode, linkedGym, techniqueRequests]);
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
  const myPendingAssignments = assignments.filter((item) => {
    const assignedToMe =
      !item.targetStudents || item.targetStudents.length === 0
        ? true
        : item.targetStudents.includes(progress.profileName);
    return assignedToMe && !(item.completedBy ?? []).includes(progress.profileName);
  });
  const assignmentRecommended = myPendingAssignments
    .flatMap((assignment) => assignment.linkedTechniqueIds ?? [])
    .map((id) => techniques.find((technique) => technique.id === id))
    .filter((technique): technique is (typeof techniques)[number] => Boolean(technique));
  const dailyTechniqueDrills = selectDailyTechniqueDrills(assignmentRecommended, reviewPriority, unmasteredCurrentBelt);

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
  const reviewQueue: ReviewQueueItem[] = useMemo(() => {
    const candidates = candidateTechniques.map((technique) => {
      const days = daysSince(progress.lastReviewedByTechniqueId[technique.id]);
      const strength = progress.reviewStrengthByTechniqueId[technique.id] ?? 2;
      const targetInterval = 2 + strength * 2;
      const overdue = Math.max(0, days - targetInterval);
      const score = overdue * 2 + days + (5 - strength) * 3;
      return { technique, days, strength, score };
    });
    return candidates.sort((a, b) => b.score - a.score);
  }, [candidateTechniques, progress.lastReviewedByTechniqueId, progress.reviewStrengthByTechniqueId]);

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
  const masteryCounts = useMemo(() => {
    const levels = Object.values(progress.masteryByTechniqueId);
    return {
      novice: levels.filter((l) => l === "novice").length,
      proficient: levels.filter((l) => l === "proficient").length,
      master: levels.filter((l) => l === "master").length,
    };
  }, [progress.masteryByTechniqueId]);

  async function onToggleTask(task: DailyTask) {
    const wasDone = completedToday.includes(task.id);
    let updated = await toggleDailyTaskCompleted(task.id);
    if (task.techniqueId && !wasDone) {
      updated = await markTechniqueReviewed(task.techniqueId);
    }
    if (updated.streakCount > progress.streakCount) {
      triggerStreakCelebration(updated.streakCount);
    }
    previousStreakRef.current = updated.streakCount;
    setProgress(updated);
    if (!wasDone) {
      triggerCelebration(task.type === "technique" ? "Technique banked. Keep stacking wins." : "Mission complete. Momentum locked in.");
    }
  }

  async function onReviewNow(techniqueId: string) {
    const updated = await markTechniqueReviewed(techniqueId);
    if (updated.streakCount > progress.streakCount) {
      triggerStreakCelebration(updated.streakCount);
    }
    previousStreakRef.current = updated.streakCount;
    setProgress(updated);
    router.push(`/technique/${techniqueId}` as Href);
  }

  async function onRateRecall(techniqueId: string, remembered: boolean) {
    let updated = await rateTechniqueRecall(techniqueId, remembered);
    const currentMastery: TechniqueMasteryLevel = updated.masteryByTechniqueId[techniqueId] ?? "novice";
    const nextMastery: TechniqueMasteryLevel = remembered
      ? currentMastery === "novice"
        ? "proficient"
        : "master"
      : currentMastery === "master"
        ? "proficient"
        : "novice";
    if (nextMastery !== currentMastery) {
      updated = await setTechniqueMasteryLevel(techniqueId, nextMastery);
    }
    if (updated.streakCount > progress.streakCount) {
      triggerStreakCelebration(updated.streakCount);
    }
    previousStreakRef.current = updated.streakCount;
    setProgress(updated);
    setSessionQueue((q) => q.filter((item) => item.technique.id !== techniqueId));
    if (remembered) {
      triggerCelebration("Locked in. Your recall strength just improved.");
    } else {
      triggerCelebration("Noted. We will bring this one back sooner.");
    }
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

  function triggerStreakCelebration(nextStreak: number) {
    setCelebrationText(`Streak up! You are now at ${nextStreak} days.`);
    streakPulseAnim.setValue(0);
    Animated.sequence([
      Animated.timing(streakPulseAnim, {
        toValue: 1,
        duration: 320,
        easing: Easing.out(Easing.back(1.8)),
        useNativeDriver: true,
      }),
      Animated.timing(streakPulseAnim, {
        toValue: 0,
        duration: 240,
        easing: Easing.inOut(Easing.quad),
        useNativeDriver: true,
      }),
    ]).start();
    triggerCelebration("🔥 Streak extended. Keep your championship pace.");
  }

  return (
    <>
      <SafeAreaView style={{ flex: 1, backgroundColor: "#030303" }} edges={["top"]}>
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ padding: 16, gap: 14, paddingBottom: 34 }}
          keyboardShouldPersistTaps="handled"
        >
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

        <Animated.View
          style={[
            glassCard,
            {
              borderColor: withAlpha("#D4B06A", 0.55),
              backgroundColor: "rgba(212,176,106,0.08)",
              transform: [
                {
                  scale: streakPulseAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [1, 1.03],
                  }),
                },
              ],
            },
          ]}
        >
          <Text style={{ color: "#FFFFFF", fontSize: 40, fontWeight: "900" }}>🔥🔥 {progress.streakCount} Day Streak</Text>
          <Text style={{ color: "#E7C98A", marginTop: 5, fontSize: 15, fontWeight: "700" }}>{streakMotivation(progress.streakCount)}</Text>
          <Text style={{ color: "#AAB2C2", marginTop: 6 }}>
            Longest streak: {progress.longestStreak} days • Sessions logged: {progress.totalSessionsLogged}
          </Text>
          <Text style={{ color: "#F8DDA8", marginTop: 4, fontWeight: "800" }}>Show up today, protect the fire.</Text>
        </Animated.View>

        {linkedGym && !isGymMode ? (
          <View style={[glassCard, { borderColor: withAlpha(accentColor, 0.35) }]}>
            <Text style={sectionTitle}>Request techniques from {linkedGym.gymName}</Text>
            <Text style={sectionSubtle}>
              Open the Library and tap Request from gym on any technique card. Coaches track open items in My Gym.
            </Text>
            <Text style={{ color: "#D4B06A", fontWeight: "800", marginTop: 4 }}>
              {pendingGymRequests} open request{pendingGymRequests === 1 ? "" : "s"} pending with your gym
            </Text>
            <Pressable
              onPress={() => router.push("/library" as Href)}
              style={{
                marginTop: 10,
                borderRadius: 12,
                paddingVertical: 12,
                alignItems: "center",
                borderWidth: 1,
                borderColor: withAlpha(accentColor, 0.65),
                backgroundColor: withAlpha(accentColor, 0.16),
              }}
            >
              <Text style={{ color: "#FFFFFF", fontWeight: "900" }}>Go to Library</Text>
            </Pressable>
          </View>
        ) : null}

        <View style={glassCard}>
          <Text style={sectionTitle}>Today&apos;s Mission</Text>
          <Text style={sectionSubtle}>AI picks from your library + pending assignments. Finish strong and protect your streak.</Text>
          <MissionProgressBar completed={todayMissionTasks.filter((task) => completedToday.includes(task.id)).length} total={todayMissionTasks.length} accentColor={accentColor} />
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
          <Text style={sectionSubtle}>Ordered by likely forgetting risk: days since review + recall strength.</Text>
          {reviewQueue.length > 0 ? (
            <Pressable
              onPress={() => {
                setSessionQueue([...reviewQueue]);
                setSessionTotalCount(reviewQueue.length);
                setReviewSessionOpen(true);
              }}
              style={{
                marginTop: 10,
                borderWidth: 1,
                borderColor: withAlpha("#D4B06A", 0.8),
                backgroundColor: "rgba(212,176,106,0.14)",
                borderRadius: 10,
                paddingVertical: 10,
                alignItems: "center",
              }}
            >
              <Text style={{ color: "#F4E6C4", fontWeight: "900" }}>Start Review Session</Text>
            </Pressable>
          ) : null}
          <View style={{ gap: 10, marginTop: 10 }}>
            {readyForReview.length === 0 ? (
              <Text style={{ color: "#AAB2C2" }}>Add techniques to My Library to unlock spaced repetition reviews.</Text>
            ) : (
              readyForReview.map((technique) => {
                const days = daysSince(progress.lastReviewedByTechniqueId[technique.id]);
                const strength = progress.reviewStrengthByTechniqueId[technique.id] ?? 2;
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
                    <Text style={{ color: "#8E96A5", marginTop: 2 }}>Recall strength: {strength}/5</Text>
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
            <StatsGridTile
              label="Mastery Levels"
              value={`N ${masteryCounts.novice} • P ${masteryCounts.proficient} • M ${masteryCounts.master}`}
            />
          </View>
        </View>

        <View style={glassCard}>
          <Text style={sectionTitle}>Daily Flow Shortcuts</Text>
          <Text style={sectionSubtle}>Move from planning to drilling to notes in seconds.</Text>
          <View style={{ flexDirection: "row", gap: 8, marginTop: 10 }}>
            <ShortcutButton label="Open Notes" onPress={() => router.push("/notes" as Href)} accentColor={accentColor} />
            <ShortcutButton label="My Library" onPress={() => router.push("/library" as Href)} accentColor={accentColor} />
            <ShortcutButton label="My Gym" onPress={() => router.push("/my-gym" as Href)} accentColor={accentColor} />
          </View>
          <View style={{ flexDirection: "row", gap: 8 }}>
            <ShortcutButton label="Notifications" onPress={() => router.push("/notifications" as Href)} accentColor={accentColor} />
            <View style={{ flex: 1 }} />
            <View style={{ flex: 1 }} />
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
        <StreakConfetti progress={streakPulseAnim} />
      </SafeAreaView>
      <ReviewSessionModal
        open={reviewSessionOpen}
        onClose={() => {
          setReviewSessionOpen(false);
          setSessionQueue([]);
          setSessionTotalCount(0);
        }}
        queue={sessionQueue}
        sessionTotal={sessionTotalCount}
        onRemembered={(id) => void onRateRecall(id, true)}
        onNeedPractice={(id) => void onRateRecall(id, false)}
        onOpenTechnique={(id) => {
          setReviewSessionOpen(false);
          setSessionQueue([]);
          setSessionTotalCount(0);
          router.push(`/technique/${id}` as Href);
        }}
        accentColor={accentColor}
      />
    </>
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

function ShortcutButton({ label, onPress, accentColor }: { label: string; onPress: () => void; accentColor: string }) {
  return (
    <Pressable
      onPress={onPress}
      style={{
        flex: 1,
        borderWidth: 1,
        borderColor: withAlpha(accentColor, 0.7),
        backgroundColor: withAlpha(accentColor, 0.14),
        borderRadius: 10,
        paddingVertical: 10,
        alignItems: "center",
      }}
    >
      <Text style={{ color: "#FFFFFF", fontWeight: "800", fontSize: 12 }}>{label}</Text>
    </Pressable>
  );
}

function MissionProgressBar({ completed, total, accentColor }: { completed: number; total: number; accentColor: string }) {
  const ratio = total > 0 ? completed / total : 0;
  return (
    <View style={{ marginTop: 10 }}>
      <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 6 }}>
        <Text style={{ color: "#BFC8D8", fontWeight: "700" }}>
          {completed}/{total} missions complete
        </Text>
        <Text style={{ color: "#D4B06A", fontWeight: "800" }}>{Math.round(ratio * 100)}%</Text>
      </View>
      <View style={{ height: 9, borderRadius: 999, backgroundColor: "#1A1A1A", overflow: "hidden" }}>
        <View style={{ width: `${Math.max(4, ratio * 100)}%`, height: "100%", backgroundColor: withAlpha(accentColor, 0.95) }} />
      </View>
    </View>
  );
}

function ReviewSessionModal({
  open,
  onClose,
  queue,
  sessionTotal,
  onRemembered,
  onNeedPractice,
  onOpenTechnique,
  accentColor,
}: {
  open: boolean;
  onClose: () => void;
  queue: ReviewQueueItem[];
  sessionTotal: number;
  onRemembered: (id: string) => void;
  onNeedPractice: (id: string) => void;
  onOpenTechnique: (id: string) => void;
  accentColor: string;
}) {
  const insets = useSafeAreaInsets();
  const current = queue[0];
  const positionInSession = current && sessionTotal > 0 ? sessionTotal - queue.length + 1 : 0;

  return (
    <Modal
      visible={open}
      animationType="slide"
      transparent
      statusBarTranslucent
      presentationStyle={Platform.OS === "ios" ? "overFullScreen" : undefined}
      onRequestClose={onClose}
    >
      <View
        style={{
          flex: 1,
          backgroundColor: "rgba(0,0,0,0.82)",
          zIndex: 99999,
          elevation: Platform.OS === "android" ? 32 : 0,
        }}
      >
        <Pressable
          style={{ flex: 1 }}
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel="Dismiss review session"
        />
        <View
          style={{
            backgroundColor: "#0A0A0A",
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            padding: 16,
            gap: 12,
            paddingBottom: Math.max(insets.bottom, 16) + 8,
            borderWidth: 1,
            borderColor: "#232323",
          }}
        >
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
            <Text style={{ color: "#FFFFFF", fontSize: 20, fontWeight: "900" }}>Review Session</Text>
            <Pressable onPress={onClose} hitSlop={12}>
              <Text style={{ color: "#AAB2C2", fontWeight: "800" }}>Close</Text>
            </Pressable>
          </View>
          {current ? (
            <View style={{ borderWidth: 1, borderColor: "#232323", borderRadius: 14, padding: 14, backgroundColor: "#0F0F0F", gap: 10 }}>
              <Text style={{ color: "#8E96A5", fontWeight: "700" }}>
                Technique {positionInSession} of {sessionTotal}
              </Text>
              <Text style={{ color: "#FFFFFF", fontSize: 22, fontWeight: "900" }}>{current.technique.name}</Text>
              <Text style={{ color: "#B6C0D0" }}>{current.technique.position}</Text>
              <Text style={{ color: "#8E96A5" }}>
                {current.days >= 9999 ? "Never reviewed" : `${current.days} day${current.days === 1 ? "" : "s"} since review`} • Strength {current.strength}/5
              </Text>
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={() => onOpenTechnique(current.technique.id)}
                style={{
                  borderWidth: 1,
                  borderColor: withAlpha(accentColor, 0.8),
                  borderRadius: 12,
                  minHeight: 48,
                  paddingVertical: 12,
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: withAlpha(accentColor, 0.16),
                }}
              >
                <Text style={{ color: "#FFFFFF", fontWeight: "800" }}>Open Technique Detail</Text>
              </TouchableOpacity>
              <View style={{ flexDirection: "column", gap: 10, marginTop: 4 }}>
                <TouchableOpacity
                  activeOpacity={0.88}
                  onPress={() => onRemembered(current.technique.id)}
                  hitSlop={{ top: 6, bottom: 6, left: 4, right: 4 }}
                  style={{
                    borderWidth: 1,
                    borderColor: "#2A7F48",
                    borderRadius: 14,
                    minHeight: 56,
                    paddingVertical: 16,
                    paddingHorizontal: 14,
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: "rgba(58,134,89,0.28)",
                  }}
                >
                  <Text style={{ color: "#E9FFF1", fontWeight: "900", fontSize: 16 }}>I Remembered It</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  activeOpacity={0.88}
                  onPress={() => onNeedPractice(current.technique.id)}
                  hitSlop={{ top: 6, bottom: 6, left: 4, right: 4 }}
                  style={{
                    borderWidth: 1,
                    borderColor: "#A8732E",
                    borderRadius: 14,
                    minHeight: 56,
                    paddingVertical: 16,
                    paddingHorizontal: 14,
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: "rgba(168,115,46,0.26)",
                  }}
                >
                  <Text style={{ color: "#FFEFD9", fontWeight: "900", fontSize: 16 }}>Need More Practice</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View style={{ borderWidth: 1, borderColor: "#232323", borderRadius: 14, padding: 16, backgroundColor: "#0F0F0F" }}>
              <Text style={{ color: "#FFFFFF", fontWeight: "900", fontSize: 18 }}>Session complete ✅</Text>
              <Text style={{ color: "#AAB2C2", marginTop: 6 }}>Great work. You just reinforced your recall map for the week.</Text>
              <TouchableOpacity
                activeOpacity={0.88}
                onPress={onClose}
                style={{
                  marginTop: 14,
                  borderRadius: 14,
                  minHeight: 52,
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: withAlpha(accentColor, 0.22),
                  borderWidth: 1,
                  borderColor: withAlpha(accentColor, 0.55),
                }}
              >
                <Text style={{ color: "#FFFFFF", fontWeight: "900" }}>Done</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}

function StreakConfetti({ progress }: { progress: Animated.Value }) {
  const pieces = [-110, -55, 0, 55, 110];
  return (
    <View pointerEvents="none" style={{ position: "absolute", top: 78, left: 0, right: 0, alignItems: "center" }}>
      {pieces.map((x, idx) => (
        <Animated.Text
          key={`confetti-${x}`}
          style={{
            position: "absolute",
            fontSize: 18 + (idx % 2) * 4,
            opacity: progress.interpolate({
              inputRange: [0, 0.2, 1],
              outputRange: [0, 1, 0],
            }),
            transform: [
              { translateX: x },
              {
                translateY: progress.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, -38 - idx * 6],
                }),
              },
              {
                rotate: progress.interpolate({
                  inputRange: [0, 1],
                  outputRange: ["0deg", `${idx % 2 === 0 ? "-" : ""}24deg`],
                }),
              },
            ],
          }}
        >
          {idx % 2 === 0 ? "🔥" : "✨"}
        </Animated.Text>
      ))}
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
  assignmentRecommended: { id: string; name: string }[],
  reviewPriority: { id: string; name: string }[],
  currentBeltUnmastered: { id: string; name: string }[]
): { id: string; name: string }[] {
  const picks: { id: string; name: string }[] = [];
  const seen = new Set<string>();
  for (const candidate of assignmentRecommended) {
    if (seen.has(candidate.id)) continue;
    picks.push(candidate);
    seen.add(candidate.id);
    if (picks.length >= 2) break;
  }
  for (const candidate of reviewPriority) {
    if (seen.has(candidate.id)) continue;
    picks.push(candidate);
    seen.add(candidate.id);
    if (picks.length >= 3) break;
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
