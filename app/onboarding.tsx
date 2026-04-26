import type { Href } from "expo-router";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuthStore } from "./store/auth";
import { CURRICULUM_BELTS, updateCurrentBelt, updateProfileName, type BeltLevel } from "./store/progress";
import { useGymStore, withAlpha } from "./store/gym";
import { useUiPreferencesStore } from "./store/uiPreferences";

const BELTS = CURRICULUM_BELTS as unknown as BeltLevel[];

export default function OnboardingScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const accentColor = useGymStore((s) => s.accentColor);
  const completeOnboarding = useGymStore((s) => s.completeOnboarding);
  const setIsGymMode = useGymStore((s) => s.setIsGymMode);
  const setRole = useAuthStore((s) => s.setRole);
  const reducedMotion = useUiPreferencesStore((s) => s.reducedMotion);
  const setReducedMotion = useUiPreferencesStore((s) => s.setReducedMotion);

  const [step, setStep] = useState(0);
  const [modeChoice, setModeChoice] = useState<"personal" | "gym" | null>(null);
  const [name, setName] = useState("");
  const [belt, setBelt] = useState<BeltLevel>("white");
  const [saving, setSaving] = useState(false);

  async function finish() {
    if (saving) return;
    setSaving(true);
    try {
      const trimmed = name.trim();
      if (trimmed.length > 0) {
        await updateProfileName(trimmed);
      }
      await updateCurrentBelt(belt);
      setIsGymMode(modeChoice === "gym");
      setRole(modeChoice === "gym" ? "owner" : "student");
      completeOnboarding();
      router.replace("/schedule" as Href);
    } finally {
      setSaving(false);
    }
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#030303" }} edges={["top", "bottom"]}>
      <ScrollView
        contentContainerStyle={{
          padding: 20,
          paddingBottom: Math.max(insets.bottom, 24) + 20,
          gap: 18,
        }}
        keyboardShouldPersistTaps="handled"
      >
        <View style={{ gap: 6 }}>
          <Text style={{ color: "#6E7788", letterSpacing: 2, fontWeight: "800", fontSize: 11 }}>ROLLQUEST</Text>
          <Text style={{ color: "#FFFFFF", fontSize: 32, fontWeight: "900" }}>Welcome, athlete</Text>
          <Text style={{ color: "#AAB2C2", lineHeight: 22, fontSize: 15 }}>
            A focused BJJ workspace for your academy or solo training. Set up once, then drill with intent.
          </Text>
        </View>

        <StepDots step={step} accentColor={accentColor} />

        {step === 0 ? (
          <View style={{ gap: 12 }}>
            <Text style={{ color: "#D4B06A", fontWeight: "900", fontSize: 16 }}>How will you use RollQuest?</Text>
            <ModeCard
              title="Personal training"
              subtitle="Library, notes, profile, and schedule without gym-owner tools."
              selected={modeChoice === "personal"}
              accentColor={accentColor}
              onPress={() => {
                setModeChoice("personal");
                setStep(1);
              }}
            />
            <ModeCard
              title="Gym owner / coach"
              subtitle="Unlock My Gym: roster, assignments, announcements, and curriculum controls."
              selected={modeChoice === "gym"}
              accentColor={accentColor}
              onPress={() => {
                setModeChoice("gym");
                setStep(1);
              }}
            />
          </View>
        ) : null}

        {step === 1 ? (
          <View style={{ gap: 12 }}>
            <Text style={{ color: "#D4B06A", fontWeight: "900", fontSize: 16 }}>Your display name</Text>
            <Text style={{ color: "#8E96A5", lineHeight: 20 }}>
              Shown on assignments, technique requests, and progress. Optional—defaults to Student if you skip. Change
              anytime in Profile.
            </Text>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="e.g. Jamie Silva"
              placeholderTextColor="#5D6574"
              style={{
                borderWidth: 1,
                borderColor: "#2A2A2A",
                borderRadius: 14,
                backgroundColor: "#0F0F0F",
                color: "#FFFFFF",
                paddingHorizontal: 14,
                paddingVertical: 14,
                fontSize: 17,
              }}
            />
            <RowNav accentColor={accentColor} onBack={() => setStep(0)} onNext={() => setStep(2)} nextLabel="Continue" />
          </View>
        ) : null}

        {step === 2 ? (
          <View style={{ gap: 14 }}>
            <Text style={{ color: "#D4B06A", fontWeight: "900", fontSize: 16 }}>Current belt focus</Text>
            <Text style={{ color: "#8E96A5", lineHeight: 20 }}>
              Curriculum filters default to this belt. White through brown tracks are available in the library.
            </Text>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
              {BELTS.map((b) => {
                const selected = b === belt;
                return (
                  <Pressable
                    key={b}
                    onPress={() => setBelt(b)}
                    style={{
                      paddingHorizontal: 16,
                      paddingVertical: 10,
                      borderRadius: 999,
                      borderWidth: 1,
                      borderColor: selected ? "#D4B06A" : "#2A2A2A",
                      backgroundColor: selected ? "rgba(212,176,106,0.2)" : "#101010",
                    }}
                  >
                    <Text style={{ color: "#FFFFFF", fontWeight: "800", textTransform: "capitalize" }}>{b}</Text>
                  </Pressable>
                );
              })}
            </View>
            <RowNav accentColor={accentColor} onBack={() => setStep(1)} onNext={() => setStep(3)} nextLabel="Continue" />
          </View>
        ) : null}

        {step === 3 ? (
          <View style={{ gap: 16 }}>
            <Text style={{ color: "#D4B06A", fontWeight: "900", fontSize: 16 }}>You are set</Text>
            <Text style={{ color: "#D0D7E4", lineHeight: 22 }}>
              {modeChoice === "gym"
                ? "My Gym is enabled. Head to Settings anytime to brand your academy, share a sync code with students, and post announcements."
                : "Stay in personal mode for a clean training log. Join a gym later from Settings with a coach sync code."}
            </Text>
            <View
              style={{
                borderWidth: 1,
                borderColor: "#2A2A2A",
                borderRadius: 12,
                backgroundColor: "#0F0F0F",
                padding: 12,
                gap: 8,
              }}
            >
              <Text style={{ color: "#FFFFFF", fontWeight: "800" }}>Comfort mode</Text>
              <Text style={{ color: "#8E96A5", lineHeight: 20 }}>
                Toggle reduced motion now. You can always change this later in Settings.
              </Text>
              <Pressable
                onPress={() => setReducedMotion(!reducedMotion)}
                style={{
                  borderWidth: 1,
                  borderColor: reducedMotion ? "#D4B06A" : "#2A2A2A",
                  borderRadius: 999,
                  paddingHorizontal: 12,
                  paddingVertical: 8,
                  alignSelf: "flex-start",
                  backgroundColor: reducedMotion ? "rgba(212,176,106,0.18)" : "#101010",
                }}
              >
                <Text style={{ color: "#FFFFFF", fontWeight: "800" }}>{reducedMotion ? "Reduced motion ON" : "Reduced motion OFF"}</Text>
              </Pressable>
            </View>
            <Pressable
              onPress={() => void finish()}
              disabled={saving}
              style={{
                marginTop: 8,
                borderRadius: 14,
                paddingVertical: 16,
                alignItems: "center",
                borderWidth: 1,
                borderColor: withAlpha(accentColor, 0.75),
                backgroundColor: withAlpha(accentColor, 0.22),
                opacity: saving ? 0.65 : 1,
              }}
            >
              <Text style={{ color: "#FFFFFF", fontWeight: "900", fontSize: 17 }}>{saving ? "Saving…" : "Enter RollQuest"}</Text>
            </Pressable>
            <Pressable onPress={() => setStep(2)} style={{ alignSelf: "center", padding: 8 }}>
              <Text style={{ color: "#8E96A5", fontWeight: "700" }}>Back</Text>
            </Pressable>
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

function StepDots({ step, accentColor }: { step: number; accentColor: string }) {
  return (
    <View style={{ flexDirection: "row", gap: 8, marginTop: 4 }}>
      {[0, 1, 2, 3].map((i) => (
        <View
          key={i}
          style={{
            flex: 1,
            height: 4,
            borderRadius: 999,
            backgroundColor: step >= i ? accentColor : "#252525",
            opacity: step >= i ? 1 : 0.45,
          }}
        />
      ))}
    </View>
  );
}

function ModeCard({
  title,
  subtitle,
  selected,
  accentColor,
  onPress,
}: {
  title: string;
  subtitle: string;
  selected: boolean;
  accentColor: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={{
        borderWidth: 1,
        borderColor: selected ? withAlpha(accentColor, 0.85) : "#2A2A2A",
        borderRadius: 16,
        padding: 16,
        backgroundColor: selected ? withAlpha(accentColor, 0.12) : "#0E0E0E",
        gap: 8,
      }}
    >
      <Text style={{ color: "#FFFFFF", fontSize: 18, fontWeight: "900" }}>{title}</Text>
      <Text style={{ color: "#AAB2C2", lineHeight: 21 }}>{subtitle}</Text>
    </Pressable>
  );
}

function RowNav({
  onBack,
  onNext,
  nextLabel,
  nextDisabled,
  accentColor,
}: {
  onBack: () => void;
  onNext: () => void;
  nextLabel: string;
  nextDisabled?: boolean;
  accentColor: string;
}) {
  return (
    <View style={{ flexDirection: "row", gap: 10, marginTop: 8 }}>
      <Pressable
        onPress={onBack}
        style={{
          flex: 1,
          borderRadius: 12,
          paddingVertical: 14,
          alignItems: "center",
          borderWidth: 1,
          borderColor: "#333",
          backgroundColor: "#151515",
        }}
      >
        <Text style={{ color: "#FFFFFF", fontWeight: "800" }}>Back</Text>
      </Pressable>
      <Pressable
        onPress={onNext}
        disabled={nextDisabled}
        style={{
          flex: 1,
          borderRadius: 12,
          paddingVertical: 14,
          alignItems: "center",
          borderWidth: 1,
          borderColor: nextDisabled ? "#333" : withAlpha(accentColor, 0.75),
          backgroundColor: nextDisabled ? "#121212" : withAlpha(accentColor, 0.2),
          opacity: nextDisabled ? 0.45 : 1,
        }}
      >
        <Text style={{ color: "#FFFFFF", fontWeight: "900" }}>{nextLabel}</Text>
      </Pressable>
    </View>
  );
}
