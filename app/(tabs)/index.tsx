import { useFocusEffect } from "expo-router";
import React, { useCallback, useMemo, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { TECHNIQUES } from "../data/techniques";
import { defaultProgress, loadProgress, updateCurrentBelt, type BeltLevel, type UserProgress } from "../store/progress";

const BELTS: BeltLevel[] = ["white", "blue"];

export default function HomeScreen() {
  const [progress, setProgress] = useState<UserProgress>(defaultProgress);

  useFocusEffect(
    useCallback(() => {
      void loadProgress().then(setProgress);
    }, [])
  );

  const beltTechniqueCount = useMemo(
    () => TECHNIQUES.filter((item) => item.belt === progress.currentBelt).length,
    [progress.currentBelt]
  );
  const learnedCount = progress.learnedTechniqueIds.length;
  const progressPercent = beltTechniqueCount ? Math.round((learnedCount / beltTechniqueCount) * 100) : 0;

  async function onSelectBelt(belt: BeltLevel) {
    const updated = await updateCurrentBelt(belt);
    setProgress(updated);
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#050505" }} edges={["top"]}>
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 18, gap: 14 }}>
      <Text style={{ color: "#FFFFFF", fontSize: 32, fontWeight: "900" }}>RollQuest</Text>
      <Text style={{ color: "#B8BDC9", fontSize: 16 }}>
        Small reps, daily wins. Build unstoppable jiu-jitsu fundamentals.
      </Text>

      <View style={card}>
        <Text style={label}>Current Belt</Text>
        <Text style={[value, { textTransform: "capitalize" }]}>{progress.currentBelt}</Text>
        <View style={{ flexDirection: "row", gap: 8, marginTop: 10 }}>
          {BELTS.map((belt) => (
            <Pressable
              key={belt}
              onPress={() => void onSelectBelt(belt)}
              style={{
                paddingHorizontal: 12,
                paddingVertical: 8,
                borderRadius: 999,
                borderWidth: 1,
                borderColor: progress.currentBelt === belt ? "#E10600" : "#2A2A2A",
                backgroundColor: progress.currentBelt === belt ? "rgba(225,6,0,0.18)" : "#0F0F0F",
              }}
            >
              <Text style={{ color: "#FFFFFF", fontWeight: "800", textTransform: "capitalize" }}>{belt}</Text>
            </Pressable>
          ))}
        </View>
      </View>

      <View style={card}>
        <Text style={label}>Streak</Text>
        <Text style={value}>{progress.streakDays} days</Text>
      </View>

      <View style={card}>
        <Text style={label}>Daily Goal</Text>
        <Text style={value}>{learnedCount}/{progress.dailyGoal} techniques</Text>
      </View>

      <View style={card}>
        <Text style={label}>Belt Progress</Text>
        <Text style={value}>{progressPercent}% complete</Text>
        <View style={{ marginTop: 10, height: 10, borderRadius: 999, backgroundColor: "#1C1C1C", overflow: "hidden" }}>
          <View
            style={{
              height: "100%",
              width: `${Math.min(progressPercent, 100)}%`,
              backgroundColor: "#E10600",
            }}
          />
        </View>
      </View>
    </ScrollView>
    </SafeAreaView>
  );
}

const card = {
  borderWidth: 1,
  borderColor: "#1E1E1E",
  backgroundColor: "#101010",
  borderRadius: 16,
  padding: 14,
};

const label = {
  color: "#8E96A5",
  fontSize: 13,
  marginBottom: 6,
};

const value = {
  color: "#FFFFFF",
  fontSize: 24,
  fontWeight: "800" as const,
};
