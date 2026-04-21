import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import React, { useMemo } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { CATEGORIES, TECHNIQUES, type Belt, type TechniqueCategory } from "../../../data/curriculum";

export default function BeltLearnScreen() {
  const router = useRouter();
  const { belt } = useLocalSearchParams<{ belt: string }>();

  const beltKey = (belt ?? "").toLowerCase() as Belt;
  const beltLabel = beltKey === "white" ? "White Belt" : beltKey === "blue" ? "Blue Belt" : "Learn";

  const beltTechniques = useMemo(() => {
    return TECHNIQUES.filter((t) => t.belt === beltKey);
  }, [beltKey]);

  const grouped = useMemo(() => {
    const map: Record<string, typeof beltTechniques> = {};
    for (const c of CATEGORIES) map[c.key] = [];
    for (const t of beltTechniques) {
      const k = t.category as TechniqueCategory;
      if (!map[k]) map[k] = [];
      map[k].push(t);
    }
    return map;
  }, [beltTechniques]);

  return (
    <ScrollView style={{ flex: 1, backgroundColor: "#0B1220" }} contentContainerStyle={{ padding: 16, gap: 14 }}>
      <Stack.Screen options={{ title: beltLabel, headerShown: true }} />

      <View style={{ gap: 6 }}>
        <Text style={{ color: "white", fontSize: 28, fontWeight: "900" }}>{beltLabel}</Text>
        <Text style={{ color: "#A7B0C0" }}>
          Categories → techniques → steps + example links.
        </Text>
      </View>

      {CATEGORIES.map((c) => {
        const list = grouped[c.key] ?? [];
        if (list.length === 0) return null;

        return (
          <View
            key={c.key}
            style={{
              padding: 14,
              borderRadius: 18,
              backgroundColor: "rgba(255,255,255,0.04)",
              borderWidth: 1,
              borderColor: "rgba(255,255,255,0.10)",
              gap: 10,
            }}
          >
            <Text style={{ color: "white", fontWeight: "900", fontSize: 16 }}>{c.label}</Text>

            <View style={{ gap: 10 }}>
              {list.map((t) => (
                <Pressable
                  key={t.id}
                  onPress={() => router.push(`/technique/${t.id}`)}
                  style={{
                    padding: 14,
                    borderRadius: 16,
                    backgroundColor: "rgba(255,255,255,0.03)",
                    borderWidth: 1,
                    borderColor: "rgba(255,255,255,0.08)",
                    gap: 6,
                  }}
                >
                  <Text style={{ color: "white", fontSize: 16, fontWeight: "900" }}>{t.title}</Text>
                  <Text style={{ color: "#A7B0C0" }}>
                    {t.position ? `${t.position} • ` : ""}
                    {t.steps?.length ?? 0} steps
                  </Text>

                  {t.videoLinks?.[0]?.url ? (
                    <Text style={{ color: "#7FD1FF", fontWeight: "700" }}>
                      Example: {t.videoLinks[0].label}
                    </Text>
                  ) : null}
                </Pressable>
              ))}
            </View>
          </View>
        );
      })}
    </ScrollView>
  );
}
