import type { Href } from "expo-router";
import { Link, useRouter } from "expo-router";
import React, { useState } from "react";
import { ActivityIndicator, Alert, Pressable, Text, TextInput, View } from "react-native";
import QRCode from "react-native-qrcode-svg";
import { NestableScrollContainer } from "react-native-draggable-flatlist";
import { SafeAreaView } from "react-native-safe-area-context";
import { GymScheduleEditor } from "../components/GymScheduleEditor";
import type { PositionTab, Technique } from "../data/techniques";
import { POSITION_TABS } from "../data/techniques";
import { explainLogoUrlIssue, isLikelyDirectImageUrl } from "../utils/gym-logo";
import { pickGymLogoFromLibrary } from "../utils/pick-gym-logo";
import { useGymStore, withAlpha } from "../store/gym";

export default function MyGymScreen() {
  const router = useRouter();
  const isGymMode = useGymStore((s) => s.isGymMode);
  const accentColor = useGymStore((s) => s.accentColor);
  const gymName = useGymStore((s) => s.gymName);
  const logoUrl = useGymStore((s) => s.logoUrl);
  const schedule = useGymStore((s) => s.schedule);
  const setLogoUrl = useGymStore((s) => s.setLogoUrl);
  const customTechniques = useGymStore((s) => s.customTechniques);
  const upsertScheduleClass = useGymStore((s) => s.upsertScheduleClass);
  const removeScheduleClass = useGymStore((s) => s.removeScheduleClass);
  const reorderScheduleForDay = useGymStore((s) => s.reorderScheduleForDay);
  const duplicateScheduleClassToDays = useGymStore((s) => s.duplicateScheduleClassToDays);
  const upsertCustomTechnique = useGymStore((s) => s.upsertCustomTechnique);
  const removeCustomTechnique = useGymStore((s) => s.removeCustomTechnique);
  const buildGymShareCode = useGymStore((s) => s.buildGymShareCode);

  const [logoInput, setLogoInput] = useState(logoUrl ?? "");
  const [pickingLogo, setPickingLogo] = useState(false);
  const [customMoveName, setCustomMoveName] = useState("");
  const [customMovePosition, setCustomMovePosition] = useState<PositionTab>("Guard Work");
  const [customMoveDescription, setCustomMoveDescription] = useState("");
  const [syncCode, setSyncCode] = useState(() => buildGymShareCode());
  const [isDraggingSchedule, setIsDraggingSchedule] = useState(false);

  React.useEffect(() => {
    setLogoInput(logoUrl ?? "");
  }, [logoUrl]);

  if (!isGymMode) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: "#050505" }} edges={["top"]}>
        <View style={{ padding: 20, gap: 14 }}>
          <Text style={{ color: "#FFFFFF", fontSize: 28, fontWeight: "900" }}>My Gym</Text>
          <Text style={{ color: "#AAB2C2", lineHeight: 22 }}>
            Gym branding, class schedule, logo, and curriculum tools are available when Gym owner mode is on in
            Settings.
          </Text>
          <Link href="/settings" asChild>
            <Pressable
              style={{
                marginTop: 8,
                borderRadius: 12,
                padding: 14,
                alignItems: "center",
                borderWidth: 1,
                borderColor: withAlpha(accentColor, 0.65),
                backgroundColor: withAlpha(accentColor, 0.18),
              }}
            >
              <Text style={{ color: "#FFFFFF", fontWeight: "900" }}>Open Settings</Text>
            </Pressable>
          </Link>
        </View>
      </SafeAreaView>
    );
  }

  async function onChoosePhoto() {
    setPickingLogo(true);
    try {
      const uri = await pickGymLogoFromLibrary();
      if (uri) setLogoUrl(uri);
    } catch {
      Alert.alert("Could not save logo", "Try again or paste a direct image URL instead.");
    } finally {
      setPickingLogo(false);
    }
  }

  function applyLogoUrl() {
    const raw = logoInput.trim();
    if (!raw) {
      setLogoUrl(undefined);
      return;
    }
    if (!isLikelyDirectImageUrl(raw)) {
      const hint = explainLogoUrlIssue(raw);
      Alert.alert("That link is not a direct image", hint || "Use a .png or .jpg URL, or Choose photo.");
      return;
    }
    setLogoUrl(raw);
  }

  function addCustomMove() {
    const name = customMoveName.trim();
    if (!name) {
      Alert.alert("Missing move name", "Add a move name before saving.");
      return;
    }
    const id = `custom-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const move: Technique = {
      id,
      name,
      belt: "white",
      position: customMovePosition,
      category: "Custom Gym Move",
      shortDescription: customMoveDescription.trim() || "Gym-defined movement.",
      fullStepByStep: [customMoveDescription.trim() || "Coach-defined sequence."],
      tips: ["Customize this movement from Curriculum if needed."],
      commonMistakes: ["Not yet defined."],
      youtubeUrl: "https://www.youtube.com/",
      difficulty: "beginner",
      curriculum: {
        sourceGym: gymName,
        track: "Gym Custom",
        isMasterLibrary: false,
        tags: ["custom", "gym"],
      },
    };
    upsertCustomTechnique(move);
    setCustomMoveName("");
    setCustomMoveDescription("");
  }

  function refreshShareCode() {
    setSyncCode(buildGymShareCode());
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#050505" }} edges={["top"]}>
      <NestableScrollContainer
        scrollEnabled={!isDraggingSchedule}
        contentContainerStyle={{ padding: 16, gap: 14, paddingBottom: 48 }}
      >
        <Text style={{ color: "#FFFFFF", fontSize: 30, fontWeight: "900" }}>My Gym</Text>
        <Text style={{ color: "#AAB2C2", lineHeight: 22 }}>
          Academy tools for {gymName}. Mode is controlled from Settings.
        </Text>

        <View
          style={{
            borderWidth: 1,
            borderColor: "#222",
            backgroundColor: "#101010",
            borderRadius: 14,
            padding: 14,
            gap: 10,
          }}
        >
          <Text style={{ color: "#FFFFFF", fontSize: 17, fontWeight: "800" }}>Gym logo</Text>
          <Text style={{ color: "#8E96A5", fontSize: 12, lineHeight: 18 }}>
            Social profile links (Instagram, Facebook, etc.) are websites, not image files — they will not load here.
            Use “Choose photo” or paste a link that ends in .png / .jpg / .webp, or open your photo in the browser and
            copy the image address.
          </Text>
          <View style={{ flexDirection: "row", gap: 10 }}>
            <Pressable
              onPress={() => void onChoosePhoto()}
              disabled={pickingLogo}
              style={{
                flex: 1,
                borderRadius: 10,
                paddingVertical: 12,
                alignItems: "center",
                borderWidth: 1,
                borderColor: withAlpha(accentColor, 0.75),
                backgroundColor: withAlpha(accentColor, 0.22),
                opacity: pickingLogo ? 0.6 : 1,
              }}
            >
              {pickingLogo ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={{ color: "#FFFFFF", fontWeight: "900" }}>Choose photo</Text>
              )}
            </Pressable>
            {logoUrl ? (
              <Pressable
                onPress={() => {
                  setLogoUrl(undefined);
                  setLogoInput("");
                }}
                style={{
                  borderRadius: 10,
                  paddingHorizontal: 14,
                  justifyContent: "center",
                  borderWidth: 1,
                  borderColor: "#333",
                  backgroundColor: "#181818",
                }}
              >
                <Text style={{ color: "#FFB4B4", fontWeight: "800" }}>Clear</Text>
              </Pressable>
            ) : null}
          </View>
          <Text style={{ color: "#8E96A5", fontWeight: "700" }}>Or direct image URL</Text>
          <TextInput
            value={logoInput}
            onChangeText={setLogoInput}
            placeholder="https://yoursite.com/images/logo.png"
            placeholderTextColor="#5D6574"
            autoCapitalize="none"
            autoCorrect={false}
            style={{
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
            onPress={applyLogoUrl}
            style={{
              borderRadius: 10,
              paddingVertical: 10,
              alignItems: "center",
              borderWidth: 1,
              borderColor: "#333",
              backgroundColor: "#151515",
            }}
          >
            <Text style={{ color: "#FFFFFF", fontWeight: "800" }}>Apply URL</Text>
          </Pressable>
        </View>

        <Pressable
          onPress={() => router.push("/gym-curriculum" as Href)}
          style={{
            borderWidth: 1,
            borderColor: withAlpha("#D4B06A", 0.55),
            backgroundColor: "rgba(212,176,106,0.12)",
            borderRadius: 14,
            padding: 14,
          }}
        >
          <Text style={{ color: "#D4B06A", fontWeight: "900" }}>Curriculum & techniques</Text>
          <Text style={{ color: "#AAB2C2", marginTop: 4 }}>
            Override titles, descriptions, and video links for your gym’s wording — master IDs stay the same.
          </Text>
        </Pressable>

        <View
          style={{
            borderWidth: 1,
            borderColor: "#222",
            backgroundColor: "#101010",
            borderRadius: 14,
            padding: 14,
            gap: 10,
          }}
        >
          <Text style={{ color: "#FFFFFF", fontSize: 17, fontWeight: "800" }}>Student gym QR</Text>
          <Text style={{ color: "#8E96A5", lineHeight: 18 }}>
            Students can scan this QR in Settings to join your gym instantly.
          </Text>
          <View
            style={{
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "#FFFFFF",
              borderRadius: 12,
              padding: 14,
              marginTop: 4,
            }}
          >
            <QRCode value={syncCode} size={220} />
          </View>
          <Pressable
            onPress={refreshShareCode}
            style={{
              borderRadius: 10,
              paddingVertical: 10,
              alignItems: "center",
              borderWidth: 1,
              borderColor: withAlpha(accentColor, 0.75),
              backgroundColor: withAlpha(accentColor, 0.2),
            }}
          >
            <Text style={{ color: "#FFFFFF", fontWeight: "900" }}>Refresh gym QR</Text>
          </Pressable>
          <Text style={{ color: "#8E96A5", fontSize: 12 }}>
            If needed, students can still paste a sync code manually.
          </Text>
        </View>

        <View
          style={{
            borderWidth: 1,
            borderColor: "#222",
            backgroundColor: "#101010",
            borderRadius: 14,
            padding: 14,
            gap: 10,
          }}
        >
          <Text style={{ color: "#FFFFFF", fontSize: 17, fontWeight: "800" }}>Custom gym moves</Text>
          <Text style={{ color: "#8E96A5", lineHeight: 18 }}>
            Add academy-specific moves so they appear in the library and can be tagged in class plans.
          </Text>
          <TextInput
            value={customMoveName}
            onChangeText={setCustomMoveName}
            placeholder="Move name"
            placeholderTextColor="#5D6574"
            style={{
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
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
            {POSITION_TABS.map((position) => {
              const selected = customMovePosition === position;
              return (
                <Pressable
                  key={position}
                  onPress={() => setCustomMovePosition(position)}
                  style={{
                    borderWidth: 1,
                    borderColor: selected ? accentColor : "#2A2A2A",
                    backgroundColor: selected ? withAlpha(accentColor, 0.22) : "#0D0D0D",
                    borderRadius: 999,
                    paddingHorizontal: 10,
                    paddingVertical: 6,
                  }}
                >
                  <Text style={{ color: "#FFFFFF", fontWeight: "700", fontSize: 12 }}>{position}</Text>
                </Pressable>
              );
            })}
          </View>
          <TextInput
            value={customMoveDescription}
            onChangeText={setCustomMoveDescription}
            placeholder="Optional short description"
            placeholderTextColor="#5D6574"
            style={{
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
            onPress={addCustomMove}
            style={{
              borderRadius: 10,
              paddingVertical: 10,
              alignItems: "center",
              borderWidth: 1,
              borderColor: withAlpha(accentColor, 0.75),
              backgroundColor: withAlpha(accentColor, 0.2),
            }}
          >
            <Text style={{ color: "#FFFFFF", fontWeight: "900" }}>Add custom move</Text>
          </Pressable>
          {customTechniques.map((move) => (
            <View
              key={move.id}
              style={{
                borderWidth: 1,
                borderColor: "#242424",
                borderRadius: 10,
                backgroundColor: "#0D0D0D",
                padding: 10,
                gap: 4,
              }}
            >
              <Text style={{ color: "#FFFFFF", fontWeight: "900" }}>{move.name}</Text>
              <Text style={{ color: "#8E96A5", fontSize: 12 }}>{move.position}</Text>
              {move.shortDescription ? <Text style={{ color: "#AAB2C2" }}>{move.shortDescription}</Text> : null}
              <Pressable
                onPress={() => removeCustomTechnique(move.id)}
                style={{
                  alignSelf: "flex-start",
                  marginTop: 4,
                  borderWidth: 1,
                  borderColor: "#5A1F1F",
                  borderRadius: 8,
                  paddingHorizontal: 10,
                  paddingVertical: 6,
                  backgroundColor: "#2A1111",
                }}
              >
                <Text style={{ color: "#FFD6D6", fontWeight: "700" }}>Delete</Text>
              </Pressable>
            </View>
          ))}
        </View>

        <GymScheduleEditor
          accentColor={accentColor}
          schedule={schedule}
          upsertScheduleClass={upsertScheduleClass}
          removeScheduleClass={removeScheduleClass}
          reorderScheduleForDay={reorderScheduleForDay}
          duplicateScheduleClassToDays={duplicateScheduleClassToDays}
          onDragStateChange={setIsDraggingSchedule}
        />
      </NestableScrollContainer>
    </SafeAreaView>
  );
}
