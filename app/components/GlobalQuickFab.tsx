import { Ionicons } from "@expo/vector-icons";
import { usePathname, useRouter } from "expo-router";
import React, { useRef, useState } from "react";
import { Animated, Pressable, Text, View } from "react-native";
import { useGymStore, withAlpha } from "../store/gym";
import { registerActivity } from "../store/progress";

export function GlobalQuickFab() {
  const router = useRouter();
  const pathname = usePathname();
  const accentColor = useGymStore((state) => state.accentColor);
  const isGymMode = useGymStore((state) => state.isGymMode);
  const [open, setOpen] = useState(false);
  const [feedback, setFeedback] = useState("");
  const anim = useRef(new Animated.Value(0)).current;

  if (!pathname.startsWith("/")) return null;

  async function onLogSession() {
    const updated = await registerActivity();
    setOpen(false);
    setFeedback(`Session logged. 🔥 ${updated.streakCount} day streak.`);
    anim.setValue(0);
    Animated.sequence([
      Animated.timing(anim, { toValue: 1, duration: 250, useNativeDriver: true }),
      Animated.delay(1200),
      Animated.timing(anim, { toValue: 0, duration: 250, useNativeDriver: true }),
    ]).start();
  }

  function onNewNote() {
    setOpen(false);
    router.push("/notes?compose=1");
  }

  function onNewAssignment() {
    setOpen(false);
    router.push("/my-gym?newAssignment=1");
  }

  return (
    <View pointerEvents="box-none" style={{ position: "absolute", right: 16, bottom: 84, zIndex: 20 }}>
      {open ? (
        <View style={{ alignItems: "flex-end", gap: 8, marginBottom: 10 }}>
          <FabAction label="Log a Session" icon="flame" onPress={() => void onLogSession()} accentColor={accentColor} />
          <FabAction label="New Note" icon="create" onPress={onNewNote} accentColor={accentColor} />
          {isGymMode ? <FabAction label="New Assignment" icon="clipboard" onPress={onNewAssignment} accentColor={accentColor} /> : null}
        </View>
      ) : null}
      <Pressable
        onPress={() => setOpen((v) => !v)}
        style={{
          width: 58,
          height: 58,
          borderRadius: 29,
          backgroundColor: "#C8102E",
          borderWidth: 1,
          borderColor: withAlpha("#FFFFFF", 0.26),
          alignItems: "center",
          justifyContent: "center",
          shadowColor: "#000",
          shadowOpacity: 0.45,
          shadowOffset: { width: 0, height: 4 },
          shadowRadius: 8,
          elevation: 8,
        }}
      >
        <Text style={{ color: "#FFFFFF", fontSize: 28, fontWeight: "900", marginTop: -2 }}>{open ? "×" : "+"}</Text>
      </Pressable>
      <Animated.View
        pointerEvents="none"
        style={{
          position: "absolute",
          right: 0,
          bottom: 68,
          opacity: anim,
          transform: [{ translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [12, 0] }) }],
        }}
      >
        <View style={{ backgroundColor: "#111", borderWidth: 1, borderColor: "#333", borderRadius: 10, padding: 8, maxWidth: 220 }}>
          <Text style={{ color: "#F2F5FC", fontWeight: "800", fontSize: 12 }}>{feedback}</Text>
        </View>
      </Animated.View>
    </View>
  );
}

function FabAction({
  label,
  icon,
  onPress,
  accentColor,
}: {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  accentColor: string;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        borderWidth: 1,
        borderColor: withAlpha(accentColor, 0.76),
        backgroundColor: withAlpha(accentColor, 0.18),
        borderRadius: 999,
        paddingVertical: 8,
        paddingHorizontal: 12,
      }}
    >
      <Ionicons name={icon} color="#FFFFFF" size={14} />
      <Text style={{ color: "#FFFFFF", fontWeight: "800", fontSize: 12 }}>{label}</Text>
    </Pressable>
  );
}
