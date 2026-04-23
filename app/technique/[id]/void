import { Stack, useLocalSearchParams } from "expo-router";
import { Linking, Pressable, ScrollView, Text, View } from "react-native";
import { getTechniqueById } from "../../../data/curriculum";

export default function TechniqueDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const tech = getTechniqueById(id ?? "");

  if (!tech) {
    return (
      <View style={{ flex: 1, backgroundColor: "#0B1220", justifyContent: "center", alignItems: "center" }}>
        <Text style={{ color: "white" }}>Technique not found.</Text>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: tech.title }} />
      <ScrollView style={{ flex: 1, backgroundColor: "#0B1220" }} contentContainerStyle={{ padding: 16, gap: 14 }}>
        <View style={{ gap: 6 }}>
          <Text style={{ color: "white", fontSize: 26, fontWeight: "900" }}>{tech.title}</Text>
          <Text style={{ color: "#A7B0C0" }}>
            {tech.positionTag ? `${tech.positionTag} • ` : ""}
            {tech.steps.length} steps
          </Text>
        </View>

        <View style={{ gap: 10 }}>
          {tech.steps.map((s, idx) => (
            <View
              key={`${tech.id}-${idx}`}
              style={{
                padding: 14,
                borderRadius: 16,
                backgroundColor: "rgba(255,255,255,0.04)",
                borderWidth: 1,
                borderColor: "rgba(255,255,255,0.10)",
                gap: 6,
              }}
            >
              <Text style={{ color: "#7FD1FF", fontWeight: "900" }}>{idx + 1}. {s.title}</Text>
              <Text style={{ color: "white" }}>{s.detail}</Text>
            </View>
          ))}
        </View>

        {tech.links?.length ? (
          <View style={{ gap: 10, marginTop: 6 }}>
            <Text style={{ color: "white", fontSize: 16, fontWeight: "900" }}>Example Links</Text>
            {tech.links.map((l, idx) => (
              <Pressable
                key={`${tech.id}-link-${idx}`}
                onPress={() => Linking.openURL(l.url)}
                style={{
                  padding: 14,
                  borderRadius: 16,
                  backgroundColor: "rgba(127,209,255,0.10)",
                  borderWidth: 1,
                  borderColor: "rgba(127,209,255,0.30)",
                }}
              >
                <Text style={{ color: "#7FD1FF", fontWeight: "900" }}>{l.label}</Text>
                <Text style={{ color: "#A7B0C0" }}>{l.url}</Text>
              </Pressable>
            ))}
          </View>
        ) : null}
      </ScrollView>
    </>
  );
}
