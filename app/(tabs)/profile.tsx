import React, { useEffect, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { defaultProgress, loadProgress, updateCurrentBelt, type BeltLevel, type UserProgress } from "../store/progress";

const BELTS: BeltLevel[] = ["White", "Blue", "Purple", "Brown", "Black"];

export default function ProfileScreen() {
  const [progress, setProgress] = useState<UserProgress>(defaultProgress);

  useEffect(() => {
    void loadProgress().then(setProgress);
  }, []);

  async function onSelectBelt(belt: BeltLevel) {
    const updated = await updateCurrentBelt(belt);
    setProgress(updated);
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: "#050505" }} contentContainerStyle={{ padding: 16, gap: 14 }}>
      <Text style={{ color: "#FFFFFF", fontSize: 30, fontWeight: "900" }}>Profile</Text>
      <Text style={{ color: "#AAB2C2" }}>Set your belt level so lessons stay focused and realistic.</Text>

      <View style={{ borderWidth: 1, borderColor: "#202020", borderRadius: 14, backgroundColor: "#101010", padding: 14 }}>
        <Text style={{ color: "#8E96A5", marginBottom: 8 }}>Current Belt</Text>
        <Text style={{ color: "#FFFFFF", fontSize: 24, fontWeight: "900" }}>{progress.currentBelt}</Text>
      </View>

      <View style={{ gap: 10 }}>
        {BELTS.map((belt) => {
          const selected = belt === progress.currentBelt;
          return (
            <Pressable
              key={belt}
              onPress={() => void onSelectBelt(belt)}
              style={{
                borderWidth: 1,
                borderColor: selected ? "#E10600" : "#2A2A2A",
                borderRadius: 12,
                backgroundColor: selected ? "rgba(225,6,0,0.16)" : "#0F0F0F",
                padding: 12,
              }}
            >
              <Text style={{ color: "#FFFFFF", fontSize: 16, fontWeight: "800" }}>{belt}</Text>
            </Pressable>
          );
        })}
      </View>
    </ScrollView>
  );
}
