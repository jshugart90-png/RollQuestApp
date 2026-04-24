import type { Href } from "expo-router";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";
import Svg, { Circle } from "react-native-svg";
import { SafeAreaView } from "react-native-safe-area-context";
import { useResolvedTechniques } from "../hooks/useResolvedTechniques";
import { useAssignmentsStore } from "../store/assignments";
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

export default function ProfileScreen() {
  const [progress, setProgress] = useState<UserProgress>(defaultProgress);
  const router = useRouter();
  const accentColor = useGymStore((state) => state.accentColor);
  const isGymMode = useGymStore((state) => state.isGymMode);
  const linkedGym = useGymStore((state) => state.linkedGym);
  const gymName = useGymStore((state) => state.gymName);
  const techniques = useResolvedTechniques();
  const assignments = useAssignmentsStore((state) => state.assignments);
  const [draftProfileName, setDraftProfileName] = useState("Student");

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
  const todayKey = toDateKey(new Date());
  const completedToday = progress.completedDailyTaskIdsByDate[todayKey] ?? [];

  const candidateTechniqueIds = progress.myTechniques.length > 0 ? progress.myTechniques : progress.learnedTechniqueIds;
  const candidateTechniques = candidateTechniqueIds
    .map((id) => techniques.find((item) => item.id === id))
    .filter((item): item is (typeof techniques)[number] => Boolean(item));
  const reviewPriority = [...candidateTechniques].sort((a, b) => {
    const dateA = progress.lastReviewedByTechniqueId[a.id];
    const dateB = progress.lastReviewedByTechniqueId[b.id];
    const daysA = daysSince(dateA);
    const daysB = daysSince(dateB);
    return daysB - daysA;
  });

  const todayTechniqueDrills = reviewPriority.slice(0, 3);
  const todayTrainingTasks: DailyTask[] = [
    {
      id: "stretch-hips-90-90",
      label: "Stretch: 90/90 hip switches (2 minutes each side)",
      type: "stretch" as const,
    },
    {
      id: "stretch-hamstrings-couch",
      label: "Stretch: couch stretch + hamstring fold (3 minutes total)",
      type: "stretch" as const,
    },
    ...todayTechniqueDrills.map((technique) => ({
      id: `tech-${technique.id}`,
      label: `Technique drill: ${technique.name}`,
      type: "technique" as const,
      techniqueId: technique.id,
    })),
  ].slice(0, 4);

  const reviewPastMaterial = reviewPriority.slice(0, 5);
  const activeGymName = isGymMode ? gymName : linkedGym?.gymName;
  const completedAssignments = assignments.filter((item) => (item.completedBy ?? []).includes(progress.profileName)).length;
  const pendingAssignments = Math.max(0, assignments.length - completedAssignments);

  async function onToggleTask(task: DailyTask) {
    const wasDone = completedToday.includes(task.id);
    let updated = await toggleDailyTaskCompleted(task.id);
    if (task.techniqueId) {
      updated = wasDone ? updated : await markTechniqueReviewed(task.techniqueId);
    }
    setProgress(updated);
  }

  async function onReviewNow(techniqueId: string) {
    const updated = await markTechniqueReviewed(techniqueId);
    setProgress(updated);
    router.push(`/technique/${techniqueId}` as Href);
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#050505" }} edges={["top"]}>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16, gap: 14 }}>
        <Text style={{ color: "#FFFFFF", fontSize: 30, fontWeight: "900" }}>Profile</Text>
        <Text style={{ color: "#AAB2C2" }}>Build your game daily and stack the reps.</Text>

        <View style={card}>
          <Text style={{ color: "#8E96A5", fontWeight: "700" }}>Profile Name</Text>
          <TextInput
            value={draftProfileName}
            onChangeText={setDraftProfileName}
            placeholder="Student name"
            placeholderTextColor="#6F7786"
            style={{
              marginTop: 8,
              borderWidth: 1,
              borderColor: "#2A2A2A",
              borderRadius: 10,
              backgroundColor: "#0F0F0F",
              color: "#FFFFFF",
              paddingHorizontal: 12,
              paddingVertical: 10,
              fontSize: 16,
            }}
          />
          <Pressable
            onPress={() => void onSaveProfileName()}
            style={{
              marginTop: 10,
              borderWidth: 1,
              borderColor: withAlpha(accentColor, 0.8),
              backgroundColor: withAlpha(accentColor, 0.2),
              borderRadius: 10,
              paddingVertical: 10,
              alignItems: "center",
            }}
          >
            <Text style={{ color: "#FFFFFF", fontWeight: "800" }}>Save Name</Text>
          </Pressable>
        </View>

        <View style={card}>
          <Text style={{ color: "#8E96A5" }}>Dashboard</Text>
          <View style={{ marginTop: 8, flexDirection: "row", alignItems: "center", gap: 16 }}>
            <ProgressRing progress={completionRatio} accentColor={accentColor} />
            <View style={{ flex: 1 }}>
              <Text style={{ color: "#FFFFFF", fontSize: 20, fontWeight: "900", textTransform: "capitalize" }}>
                {progress.currentBelt} Belt - {completionPercent}% Complete
              </Text>
              <Text style={{ color: "#AAB2C2", marginTop: 4 }}>
                {masteredForBelt} / {totalForBelt} current belt techniques mastered
              </Text>
              {activeGymName ? <Text style={{ color: "#C7CEDB", marginTop: 6 }}>Gym: {activeGymName}</Text> : null}
            </View>
          </View>
        </View>

        <View style={[card, { borderColor: withAlpha(accentColor, 0.42) }]}>
          <Text style={{ color: "#FFFFFF", fontSize: 26, fontWeight: "900" }}>🔥 {progress.streakCount} Day Streak</Text>
          <Text style={{ color: "#D4B06A", marginTop: 4, fontWeight: "700" }}>Keep the momentum going!</Text>
        </View>

        <View style={card}>
          <Text style={{ color: "#FFFFFF", fontSize: 20, fontWeight: "900" }}>Today&apos;s Training</Text>
          <Text style={{ color: "#98A1B2", marginTop: 4 }}>Focus on mobility outside class and sharpen your top moves.</Text>
          <View style={{ gap: 10, marginTop: 10 }}>
            {todayTrainingTasks.map((task) => {
              const done = completedToday.includes(task.id);
              return (
                <View
                  key={task.id}
                  style={{
                    borderWidth: 1,
                    borderColor: done ? withAlpha("#47B96E", 0.9) : "#2A2A2A",
                    borderRadius: 12,
                    backgroundColor: done ? "rgba(71,185,110,0.12)" : "#0D0D0D",
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
                      backgroundColor: done ? "rgba(35,85,53,0.45)" : withAlpha(accentColor, 0.22),
                    }}
                  >
                    <Text style={{ color: "#FFFFFF", fontWeight: "800" }}>
                      {done ? "Undo Completed" : "Mark as Completed"}
                    </Text>
                  </Pressable>
                </View>
              );
            })}
          </View>
        </View>

        <View style={card}>
          <Text style={{ color: "#FFFFFF", fontSize: 20, fontWeight: "900" }}>Review Past Material</Text>
          <Text style={{ color: "#98A1B2", marginTop: 4 }}>Rotate older techniques to keep your game sharp.</Text>
          <View style={{ gap: 10, marginTop: 10 }}>
            {reviewPastMaterial.length === 0 ? (
              <Text style={{ color: "#AAB2C2" }}>Add techniques to My Library to start spaced reviews.</Text>
            ) : (
              reviewPastMaterial.map((technique) => (
                <View
                  key={`review-${technique.id}`}
                  style={{
                    borderWidth: 1,
                    borderColor: "#252525",
                    borderRadius: 12,
                    backgroundColor: "#0F0F0F",
                    padding: 12,
                  }}
                >
                  <Text style={{ color: "#FFFFFF", fontWeight: "900" }}>{technique.name}</Text>
                  <Text style={{ color: "#AAB2C2", marginTop: 2 }}>{technique.position}</Text>
                  <Text style={{ color: "#7F8795", marginTop: 4 }}>
                    Last reviewed: {formatReviewDate(progress.lastReviewedByTechniqueId[technique.id])}
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
                    <Text style={{ color: "#FFFFFF", fontWeight: "800" }}>Review Now</Text>
                  </Pressable>
                </View>
              ))
            )}
          </View>
        </View>

        <View style={card}>
          <Text style={{ color: "#FFFFFF", fontSize: 20, fontWeight: "900" }}>Quick Stats</Text>
          <View style={{ marginTop: 10, gap: 8 }}>
            <StatRow label="Techniques Mastered" value={String(progress.learnedTechniqueIds.length)} />
            <StatRow label="My Library Total" value={String(progress.myTechniques.length)} />
            <StatRow label="Current Streak" value={`${progress.streakCount} days`} />
            <StatRow label="Assignments Pending" value={String(pendingAssignments)} />
            <StatRow label="Assignments Completed" value={String(completedAssignments)} />
          </View>
        </View>

        <View style={{ gap: 10 }}>
          <Text style={{ color: "#9AA2B1", fontWeight: "700" }}>Set Current Belt</Text>
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
                  backgroundColor: selected ? withAlpha(accentColor, 0.16) : "#0F0F0F",
                  padding: 12,
                }}
              >
                <Text style={{ color: "#FFFFFF", fontSize: 16, fontWeight: "800", textTransform: "capitalize" }}>
                  {belt}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function ProgressRing({ progress, accentColor }: { progress: number; accentColor: string }) {
  const size = 96;
  const strokeWidth = 10;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.max(0, Math.min(1, progress));
  const offset = circumference * (1 - clamped);
  return (
    <View style={{ width: size, height: size, alignItems: "center", justifyContent: "center" }}>
      <Svg width={size} height={size}>
        <Circle cx={size / 2} cy={size / 2} r={radius} stroke="#242424" strokeWidth={strokeWidth} fill="none" />
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
      <Text style={{ position: "absolute", color: "#FFFFFF", fontWeight: "900" }}>{Math.round(clamped * 100)}%</Text>
    </View>
  );
}

function StatRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
      <Text style={{ color: "#B5BECE" }}>{label}</Text>
      <Text style={{ color: "#FFFFFF", fontWeight: "900" }}>{value}</Text>
    </View>
  );
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

function formatReviewDate(dateString: string | undefined): string {
  if (!dateString) return "Not yet reviewed";
  const date = new Date(`${dateString}T00:00:00`);
  if (Number.isNaN(date.getTime())) return "Not yet reviewed";
  return date.toLocaleDateString();
}

type DailyTask = {
  id: string;
  label: string;
  type: "stretch" | "technique";
  techniqueId?: string;
};

const card = {
  borderWidth: 1,
  borderColor: "#202020",
  borderRadius: 14,
  backgroundColor: "#101010",
  padding: 14,
};
