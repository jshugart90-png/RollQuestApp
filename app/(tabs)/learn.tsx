import { Text, View } from "react-native";

export default function LearnScreen() {
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: "#050505",
        padding: 20,
        justifyContent: "center",
        gap: 12,
      }}
    >
      <Text style={{ color: "#FFFFFF", fontSize: 30, fontWeight: "900" }}>Learn Mode</Text>
      <Text style={{ color: "#AAB2C2", fontSize: 16 }}>
        Spaced repetition drills are coming soon. RollQuest will schedule your next reps based on confidence and recall.
      </Text>
      <View
        style={{
          borderWidth: 1,
          borderColor: "#2A2A2A",
          backgroundColor: "#101010",
          borderRadius: 16,
          padding: 14,
        }}
      >
        <Text style={{ color: "#E10600", fontWeight: "800", fontSize: 16 }}>Next up</Text>
        <Text style={{ color: "#FFFFFF", marginTop: 6 }}>- Smart review queue</Text>
        <Text style={{ color: "#FFFFFF", marginTop: 4 }}>- Missed technique retries</Text>
        <Text style={{ color: "#FFFFFF", marginTop: 4 }}>- Daily mission cards</Text>
      </View>
    </View>
  );
}
