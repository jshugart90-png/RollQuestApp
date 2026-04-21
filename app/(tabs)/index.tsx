import { useFocusEffect } from "expo-router";
import React, { useCallback, useMemo, useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { TECHNIQUES } from "../data/techniques";
import { defaultProgress, loadProgress, type UserProgress } from "../store/progress";

export default function HomeScreen() {
  const [progress, setProgress] = useState<UserProgress>(defaultProgress);

  useFocusEffect(
    useCallback(() => {
      void loadProgress().then(setProgress);
    }, [])
  );

  const beltTechniqueCount = useMemo(
    () => TECHNIQUES.filter((item) => item.belt === "white").length,
    []
  );
  const learnedCount = progress.learnedTechniqueIds.length;
  const progressPercent = beltTechniqueCount ? Math.round((learnedCount / beltTechniqueCount) * 100) : 0;

  return (
    <ScrollView style={{ flex: 1, backgroundColor: "#050505" }} contentContainerStyle={{ padding: 18, gap: 14 }}>
      <Text style={{ color: "#FFFFFF", fontSize: 32, fontWeight: "900" }}>RollQuest</Text>
      <Text style={{ color: "#B8BDC9", fontSize: 16 }}>
        Small reps, daily wins. Build unstoppable jiu-jitsu fundamentals.
      </Text>

      <View style={card}>
        <Text style={label}>Current Belt</Text>
        <Text style={value}>{progress.currentBelt}</Text>
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
