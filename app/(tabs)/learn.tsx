import { useRouter } from "expo-router";
import { Pressable, ScrollView, Text, View } from "react-native";
import { BELTS } from "../../data/curriculum";

export default function Learn() {
  const router = useRouter();

  return (
    <ScrollView style={{ flex: 1, backgroundColor: "#0B1220" }} contentContainerStyle={{ padding: 16, gap: 14 }}>
      <View style={{ gap: 6 }}>
        <Text style={{ color: "white", fontSize: 28, fontWeight: "900" }}>Learn</Text>
        <Text style={{ color: "#A7B0C0" }}>
          Start simple: White + Blue only. Tap a belt to see everything you need for that level.
        </Text>
      </View>

      <View style={{ gap: 12, marginTop: 10 }}>
        {BELTS.map((b) => (
          <Pressable
            key={b.key}
            onPress={() => router.push(`/belt/${b.key}`)}
            style={{
              padding: 18,
              borderRadius: 18,
              backgroundColor: "rgba(255,255,255,0.04)",
              borderWidth: 1,
              borderColor: "rgba(255,255,255,0.10)",
              gap: 10,
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
              <Text style={{ color: "white", fontSize: 20, fontWeight: "900" }}>{b.label}</Text>
              <View
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: 999,
                  backgroundColor: b.key === "white" ? "#7FD1FF" : "#2F6BFF",
                }}
              />
            </View>

            <Text style={{ color: "#A7B0C0" }}>
              Tap to open curriculum → categories → techniques → steps + example links
            </Text>

            <Text style={{ color: "#7FD1FF", fontWeight: "800" }}>Open {b.label}</Text>
          </Pressable>
        ))}
      </View>
    </ScrollView>
  );
}
