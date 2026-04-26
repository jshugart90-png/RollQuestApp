import { Ionicons } from "@expo/vector-icons";
import type { Href } from "expo-router";
import { useFocusEffect, useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import React, { useMemo, useRef, useState } from "react";
import { Animated, Easing, Modal, Platform, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import Svg, { Circle } from "react-native-svg";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useResolvedTechniques } from "../hooks/useResolvedTechniques";
import { buildRollingChallenges } from "../engines/challenges";
import { summarizeProgression } from "../engines/progression";
import { buildSmartReviewQueue } from "../engines/review";
import { useAssignmentsStore } from "../store/assignments";
import { useChallengesStore } from "../store/challenges";
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
import { useUiPreferencesStore } from "../store/uiPreferences";
import { insertChallengeCompletion, insertRollingLog } from "../services/supabase/repositories";
import { useSessionStore } from "../store/session";

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
  const challengeCompletionsByDate = useChallengesStore((state) => state.completionsByDate);
  const addRollingLog = useChallengesStore((state) => state.addRollingLog);
  const completeChallenge = useChallengesStore((state) => state.completeChallenge);
  const reducedMotion = useUiPreferencesStore((state) => state.reducedMotion);
  const userId = useSessionStore((state) => state.userId);

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
  const reviewQueue: ReviewQueueItem[] = useMemo(
    () =>
      buildSmartReviewQueue(candidateTechniques, progress).map((item) => ({
        technique: { id: item.technique.id, name: item.technique.name, position: item.technique.position },
        days: item.daysSinceReview,
        strength: item.recallStrength,
        score: item.urgencyScore,
      })),
    [candidateTechniques, progress]
  );

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
  const progressionSummary = useMemo(() => summarizeProgression(techniques, progress), [techniques, progress]);
  const rollingChallenges = useMemo(
    () => buildRollingChallenges(techniques, progress, todayKey),
    [progress, techniques, todayKey]
  );
  const completedChallengesToday = challengeCompletionsByDate[todayKey] ?? [];

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
    if (reducedMotion) return;
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
    if (reducedMotion) return;
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
                    outputRange: [1, 1.06],
                  }),
                },
              ],
            },
          ]}
        >
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 4 }}>
            <View
              style={{
                width: 44,
                height: 44,
                borderRadius: 14,
                backgroundColor: "rgba(200,16,46,0.2)",
                borderWidth: 1,
                borderColor: withAlpha(accentColor, 0.45),
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Ionicons name="flame" size={26} color="#FFB347" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ color: "#8E96A5", fontSize: 11, fontWeight: "900", letterSpacing: 1 }}>STREAK</Text>
              <Text style={{ color: "#E7C98A", fontSize: 13, fontWeight: "700" }}>{streakMotivation(progress.streakCount)}</Text>
            </View>
          </View>
          <Text style={{ color: "#FFFFFF", fontSize: 56, fontWeight: "900", letterSpacing: -1 }}>{progress.streakCount}</Text>
          <Text style={{ color: "#D4B06A", fontSize: 16, fontWeight: "800", marginTop: 2 }}>day{progress.streakCount === 1 ? "" : "s"} on the board</Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12, marginTop: 14 }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
              <Ionicons name="trophy-outline" size={18} color="#D4B06A" />
              <Text style={{ color: "#AAB2C2", fontWeight: "700" }}>
                Best <Text style={{ color: "#FFFFFF" }}>{progress.longestStreak}</Text> days
              </Text>
            </View>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
              <Ionicons name="fitness-outline" size={18} color="#8E96A5" />
              <Text style={{ color: "#AAB2C2", fontWeight: "700" }}>
                <Text style={{ color: "#FFFFFF" }}>{progress.totalSessionsLogged}</Text> sessions logged
              </Text>
            </View>
          </View>
          <Text style={{ color: "#F8DDA8", marginTop: 12, fontWeight: "800", fontSize: 14 }}>Train today—keep the flame.</Text>
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
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
            <View style={{ flex: 1 }}>
              <Text style={sectionTitle}>Today&apos;s mission</Text>
              <Text style={[sectionSubtle, { marginTop: 4 }]}>Three quick wins. Tap done when you finish.</Text>
            </View>
            <View
              style={{
                width: 40,
                height: 40,
                borderRadius: 12,
                backgroundColor: withAlpha(accentColor, 0.15),
                alignItems: "center",
                justifyContent: "center",
                borderWidth: 1,
                borderColor: withAlpha(accentColor, 0.35),
              }}
            >
              <Ionicons name="flash" size={22} color={accentColor} />
            </View>
          </View>
          <MissionProgressBar completed={todayMissionTasks.filter((task) => completedToday.includes(task.id)).length} total={todayMissionTasks.length} accentColor={accentColor} />
          <View style={{ gap: 10, marginTop: 12 }}>
            {todayMissionTasks.map((task) => {
              const done = completedToday.includes(task.id);
              return (
                <View
                  key={task.id}
                  style={{
                    borderWidth: 1,
                    borderColor: done ? withAlpha("#47B96E", 0.85) : "#262626",
                    borderRadius: 14,
                    backgroundColor: done ? "rgba(71,185,110,0.1)" : "#0A0A0A",
                    padding: 14,
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 12,
                  }}
                >
                  <Ionicons name={done ? "checkmark-circle" : "ellipse-outline"} size={26} color={done ? "#47B96E" : "#4B5563"} />
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: "#EAF0FC", fontWeight: "700", fontSize: 15 }}>{task.label}</Text>
                  </View>
                  <Pressable
                    onPress={() => void onToggleTask(task)}
                    style={({ pressed }) => ({
                      borderWidth: 1,
                      borderColor: done ? "#2A6B3E" : accentColor,
                      borderRadius: 999,
                      paddingVertical: 10,
                      paddingHorizontal: 16,
                      backgroundColor: done ? "rgba(35,85,53,0.45)" : withAlpha(accentColor, 0.22),
                      opacity: pressed ? 0.85 : 1,
                    })}
                  >
                    <Text style={{ color: "#FFFFFF", fontWeight: "900", fontSize: 13 }}>{done ? "Done" : "Do it"}</Text>
                  </Pressable>
                </View>
              );
            })}
          </View>
        </View>

        <View style={glassCard}>
          <View style={{ flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
            <View style={{ flex: 1 }}>
              <Text style={sectionTitle}>Review past material</Text>
              <Text style={[sectionSubtle, { marginTop: 4 }]}>Spaced reps—what you&apos;re most likely to forget first.</Text>
            </View>
            <Ionicons name="school-outline" size={26} color="#D4B06A" />
          </View>
          {reviewQueue.length > 0 ? (
            <Pressable
              onPress={() => {
                void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                setSessionQueue([...reviewQueue]);
                setSessionTotalCount(reviewQueue.length);
                setReviewSessionOpen(true);
              }}
              style={({ pressed }) => ({
                marginTop: 12,
                borderWidth: 1,
                borderColor: withAlpha("#D4B06A", 0.85),
                backgroundColor: pressed ? "rgba(212,176,106,0.22)" : "rgba(212,176,106,0.14)",
                borderRadius: 14,
                paddingVertical: 14,
                paddingHorizontal: 16,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                gap: 10,
              })}
            >
              <Ionicons name="play-circle" size={22} color="#F4E6C4" />
              <Text style={{ color: "#F4E6C4", fontWeight: "900", fontSize: 16 }}>Start review ({reviewQueue.length})</Text>
            </Pressable>
          ) : null}
          <View style={{ gap: 10, marginTop: 12 }}>
            {readyForReview.length === 0 ? (
              <View style={{ alignItems: "center", paddingVertical: 8, gap: 8 }}>
                <Ionicons name="book-outline" size={40} color="#4A5568" />
                <Text style={{ color: "#AAB2C2", textAlign: "center", lineHeight: 22 }}>
                  Add moves to My Library to unlock smart reviews.
                </Text>
              </View>
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
                      style={({ pressed }) => ({
                        marginTop: 10,
                        borderWidth: 1,
                        borderColor: accentColor,
                        borderRadius: 12,
                        paddingVertical: 11,
                        alignItems: "center",
                        backgroundColor: withAlpha(accentColor, pressed ? 0.32 : 0.2),
                      })}
                    >
                      <Text style={{ color: "#FFFFFF", fontWeight: "900" }}>Quick review</Text>
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
          <Text style={sectionTitle}>Progression Engine</Text>
          <Text style={sectionSubtle}>Readiness model for your next milestone.</Text>
          <View
            style={{
              marginTop: 10,
              borderWidth: 1,
              borderColor: "#242424",
              borderRadius: 12,
              backgroundColor: "#0C0C0C",
              padding: 12,
            }}
          >
            <Text style={{ color: "#FFFFFF", fontWeight: "900", fontSize: 18 }}>
              {progressionSummary.readinessScore}% ready • {progressionSummary.belt} belt
            </Text>
            <Text style={{ color: "#AAB2C2", marginTop: 4 }}>
              {progressionSummary.masteredInBelt}/{progressionSummary.totalInBelt} mastered in current curriculum
            </Text>
            <Text style={{ color: "#D4B06A", marginTop: 6, fontWeight: "800" }}>{progressionSummary.nextMilestone}</Text>
          </View>
        </View>

        <View style={glassCard}>
          <Text style={sectionTitle}>Rolling Challenges</Text>
          <Text style={sectionSubtle}>Land these live and tap complete.</Text>
          <View style={{ gap: 8, marginTop: 10 }}>
            {rollingChallenges.length === 0 ? (
              <Text style={{ color: "#AAB2C2" }}>Add and review techniques to unlock personalized move challenges.</Text>
            ) : (
              rollingChallenges.map((challenge) => (
                <View
                  key={challenge.id}
                  style={{ borderWidth: 1, borderColor: "#242424", borderRadius: 12, backgroundColor: "#0C0C0C", padding: 12 }}
                >
                  <Text style={{ color: "#FFFFFF", fontWeight: "900" }}>{challenge.techniqueName}</Text>
                  <Text style={{ color: "#8E96A5", fontSize: 12, marginTop: 2 }}>
                    Source: {challenge.source === "mastered" ? "Mastered move" : challenge.source === "recent" ? "Recently worked" : "Work-in-progress"}
                  </Text>
                  {completedChallengesToday.some((c) => c.challengeId === challenge.id) ? (
                    <Text style={{ color: "#47B96E", marginTop: 6, fontWeight: "800" }}>Completed today ✓</Text>
                  ) : null}
                  <Pressable
                    onPress={() => {
                      completeChallenge(todayKey, {
                        challengeId: challenge.id,
                        techniqueId: challenge.techniqueId,
                        techniqueName: challenge.techniqueName,
                      });
                      addRollingLog({
                        techniqueId: challenge.techniqueId,
                        techniqueName: challenge.techniqueName,
                        className: "Class Rolling",
                        notes: "Challenge completed live.",
                      });
                      const gymId = progress.activeGymId ?? undefined;
                      void insertChallengeCompletion({
                        gym_id: gymId,
                        user_id: userId ?? undefined,
                        date_key: todayKey,
                        challenge_id: challenge.id,
                        technique_id: challenge.techniqueId,
                        technique_name: challenge.techniqueName,
                      });
                      void insertRollingLog({
                        gym_id: gymId,
                        user_id: userId ?? undefined,
                        technique_id: challenge.techniqueId,
                        technique_name: challenge.techniqueName,
                        class_name: "Class Rolling",
                        notes: "Challenge completed live.",
                      });
                      void onToggleTask({
                        id: `challenge-${challenge.techniqueId}-${todayKey}`,
                        label: `Challenge ${challenge.techniqueName}`,
                        type: "technique",
                        techniqueId: challenge.techniqueId,
                      });
                    }}
                    style={({ pressed }) => ({
                      marginTop: 10,
                      borderWidth: 1,
                      borderColor: withAlpha(accentColor, 0.75),
                      borderRadius: 10,
                      paddingVertical: 10,
                      alignItems: "center",
                      backgroundColor: withAlpha(accentColor, pressed ? 0.28 : 0.16),
                    })}
                  >
                    <Text style={{ color: "#FFFFFF", fontWeight: "900" }}>I hit this in class</Text>
                  </Pressable>
                </View>
              ))
            )}
          </View>
        </View>

        <View style={glassCard}>
          <Text style={sectionTitle}>Shortcuts</Text>
          <Text style={sectionSubtle}>Jump to tools you use daily.</Text>
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
      style={({ pressed }) => ({
        flex: 1,
        borderWidth: 1,
        borderColor: withAlpha(accentColor, 0.7),
        backgroundColor: withAlpha(accentColor, pressed ? 0.24 : 0.14),
        borderRadius: 12,
        paddingVertical: 11,
        alignItems: "center",
        opacity: pressed ? 0.92 : 1,
      })}
    >
      <Text style={{ color: "#FFFFFF", fontWeight: "800", fontSize: 12 }}>{label}</Text>
    </Pressable>
  );
}

function MissionProgressBar({ completed, total, accentColor }: { completed: number; total: number; accentColor: string }) {
  const ratio = total > 0 ? completed / total : 0;
  return (
    <View style={{ marginTop: 12 }}>
      <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 8 }}>
        <Text style={{ color: "#BFC8D8", fontWeight: "800" }}>
          {completed}/{total} done
        </Text>
        <Text style={{ color: "#D4B06A", fontWeight: "900" }}>{Math.round(ratio * 100)}%</Text>
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
            <Text style={{ color: "#FFFFFF", fontSize: 20, fontWeight: "900" }}>Review</Text>
            <Pressable onPress={onClose} hitSlop={12} style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}>
              <Text style={{ color: "#AAB2C2", fontWeight: "800" }}>Close</Text>
            </Pressable>
          </View>
          {current ? (
            <View style={{ borderWidth: 1, borderColor: "#232323", borderRadius: 16, padding: 16, backgroundColor: "#0F0F0F", gap: 12 }}>
              <View style={{ flexDirection: "row", gap: 6, justifyContent: "center", marginBottom: 4 }}>
                {Array.from({ length: sessionTotal }, (_, i) => {
                  const n = i + 1;
                  const active = n === positionInSession;
                  const done = n < positionInSession;
                  return (
                    <View
                      key={`dot-${i}`}
                      style={{
                        width: active ? 12 : 6,
                        height: 6,
                        borderRadius: 999,
                        backgroundColor: done ? withAlpha(accentColor, 0.45) : active ? accentColor : "#2A2A2A",
                      }}
                    />
                  );
                })}
              </View>
              <Text style={{ color: "#8E96A5", fontWeight: "800", textAlign: "center", fontSize: 12 }}>
                {positionInSession} / {sessionTotal}
              </Text>
              <Text style={{ color: "#FFFFFF", fontSize: 24, fontWeight: "900", textAlign: "center" }}>{current.technique.name}</Text>
              <Text style={{ color: "#B6C0D0", textAlign: "center" }}>{current.technique.position}</Text>
              <Text style={{ color: "#6F7785", textAlign: "center", fontSize: 13 }}>
                {current.days >= 9999 ? "Not reviewed yet" : `${current.days}d since review`} · Recall {current.strength}/5
              </Text>
              <Pressable
                onPress={() => {
                  void Haptics.selectionAsync();
                  onOpenTechnique(current.technique.id);
                }}
                style={({ pressed }) => ({
                  borderWidth: 1,
                  borderColor: withAlpha(accentColor, 0.85),
                  borderRadius: 14,
                  minHeight: 50,
                  paddingVertical: 12,
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: withAlpha(accentColor, pressed ? 0.28 : 0.16),
                })}
              >
                <Text style={{ color: "#FFFFFF", fontWeight: "900" }}>Open technique</Text>
              </Pressable>
              <View style={{ flexDirection: "column", gap: 10, marginTop: 6 }}>
                <Pressable
                  onPress={() => {
                    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                    onRemembered(current.technique.id);
                  }}
                  style={({ pressed }) => ({
                    borderWidth: 1,
                    borderColor: "#2A7F48",
                    borderRadius: 14,
                    minHeight: 56,
                    paddingVertical: 16,
                    paddingHorizontal: 14,
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: pressed ? "rgba(58,134,89,0.42)" : "rgba(58,134,89,0.28)",
                  })}
                >
                  <Text style={{ color: "#E9FFF1", fontWeight: "900", fontSize: 16 }}>Nailed it</Text>
                  <Text style={{ color: "#9BC9A8", fontSize: 12, marginTop: 2 }}>Boost recall strength</Text>
                </Pressable>
                <Pressable
                  onPress={() => {
                    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
                    onNeedPractice(current.technique.id);
                  }}
                  style={({ pressed }) => ({
                    borderWidth: 1,
                    borderColor: "#A8732E",
                    borderRadius: 14,
                    minHeight: 56,
                    paddingVertical: 16,
                    paddingHorizontal: 14,
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: pressed ? "rgba(168,115,46,0.38)" : "rgba(168,115,46,0.26)",
                  })}
                >
                  <Text style={{ color: "#FFEFD9", fontWeight: "900", fontSize: 16 }}>Need reps</Text>
                  <Text style={{ color: "#D4B896", fontSize: 12, marginTop: 2 }}>We&apos;ll surface it sooner</Text>
                </Pressable>
              </View>
            </View>
          ) : (
            <View style={{ borderWidth: 1, borderColor: "#232323", borderRadius: 16, padding: 20, backgroundColor: "#0F0F0F", alignItems: "center", gap: 10 }}>
              <Ionicons name="sparkles" size={40} color="#D4B06A" />
              <Text style={{ color: "#FFFFFF", fontWeight: "900", fontSize: 20 }}>Session complete</Text>
              <Text style={{ color: "#AAB2C2", textAlign: "center", lineHeight: 22 }}>Stacked reps today. Come back when your queue refills.</Text>
              <Pressable
                onPress={() => {
                  void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  onClose();
                }}
                style={({ pressed }) => ({
                  marginTop: 8,
                  borderRadius: 14,
                  minHeight: 52,
                  width: "100%",
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: withAlpha(accentColor, pressed ? 0.32 : 0.22),
                  borderWidth: 1,
                  borderColor: withAlpha(accentColor, 0.55),
                })}
              >
                <Text style={{ color: "#FFFFFF", fontWeight: "900" }}>Done</Text>
              </Pressable>
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
