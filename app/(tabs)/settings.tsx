import type { Href } from "expo-router";
import { Link, useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import { CameraView, useCameraPermissions } from "expo-camera";
import { Alert, Modal, Pressable, ScrollView, Switch, Text, TextInput, TouchableWithoutFeedback, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useGymStore, withAlpha } from "../store/gym";
import { setActiveProgressGymId } from "../store/progress";
import { useSyncStore } from "../store/sync";
import { useAuthStore, type AppRole } from "../store/auth";
import { useUiPreferencesStore } from "../store/uiPreferences";
import { exportBackup, importBackup } from "../services/backup";
import { useSessionStore } from "../store/session";

const PRESET_COLORS = [
  "#C8102E",
  "#E10600",
  "#D4B06A",
  "#2E86DE",
  "#7B2CBF",
  "#00A86B",
  "#FF7A00",
  "#F4D35E",
];

export default function SettingsScreen() {
  const router = useRouter();
  const {
    gymName,
    accentColor,
    isGymMode,
    setGymName,
    setAccentColor,
    setIsGymMode,
    linkedGym,
    joinGymFromShareCode,
    leaveLinkedGym,
    resetGymSettings,
  } = useGymStore();
  const [nameInput, setNameInput] = useState(gymName);
  const [colorInput, setColorInput] = useState(accentColor);
  const [syncInput, setSyncInput] = useState("");
  const [scanOpen, setScanOpen] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();
  const [isHandlingScan, setIsHandlingScan] = useState(false);
  const pendingSyncCount = useSyncStore((s) => s.pending.length);
  const lastSyncedAt = useSyncStore((s) => s.lastSyncedAt);
  const lastSyncError = useSyncStore((s) => s.lastSyncError);
  const isSyncing = useSyncStore((s) => s.isSyncing);
  const flushSync = useSyncStore((s) => s.flush);
  const role = useAuthStore((s) => s.role);
  const setRole = useAuthStore((s) => s.setRole);
  const reducedMotion = useUiPreferencesStore((s) => s.reducedMotion);
  const highContrast = useUiPreferencesStore((s) => s.highContrast);
  const textScale = useUiPreferencesStore((s) => s.textScale);
  const setReducedMotion = useUiPreferencesStore((s) => s.setReducedMotion);
  const setHighContrast = useUiPreferencesStore((s) => s.setHighContrast);
  const setTextScale = useUiPreferencesStore((s) => s.setTextScale);
  const [backupJson, setBackupJson] = useState("");
  const email = useSessionStore((s) => s.email);
  const signOut = useSessionStore((s) => s.signOut);

  const modeLabel = useMemo(() => (isGymMode ? "Gym owner mode" : "Personal mode"), [isGymMode]);
  async function onJoinGym() {
    const result = joinGymFromShareCode(syncInput);
    if (!result.ok) {
      Alert.alert("Could not join gym", result.message);
      return;
    }
    const joined = useGymStore.getState().linkedGym;
    if (joined?.gymId) {
      await setActiveProgressGymId(joined.gymId);
    }
    setSyncInput("");
    Alert.alert("Gym synced", "You are now linked to this gym's schedule and curriculum.");
  }
  async function onOpenScanner() {
    if (!permission?.granted) {
      const result = await requestPermission();
      if (!result.granted) {
        Alert.alert("Camera permission needed", "Enable camera permission to scan gym QR codes.");
        return;
      }
    }
    setIsHandlingScan(false);
    setScanOpen(true);
  }

  function onScanPayload(payload: string) {
    if (isHandlingScan) return;
    setIsHandlingScan(true);
    const result = joinGymFromShareCode(payload);
    if (!result.ok) {
      Alert.alert("Could not join gym", result.message);
      setIsHandlingScan(false);
      return;
    }
    const joined = useGymStore.getState().linkedGym;
    if (joined?.gymId) {
      void setActiveProgressGymId(joined.gymId);
    }
    setSyncInput("");
    setScanOpen(false);
    Alert.alert("Gym synced", "You are now linked to this gym's schedule and curriculum.");
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#050505" }} edges={["top"]}>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16, gap: 14, paddingBottom: 32 }}>
        <Text style={{ color: "#FFFFFF", fontSize: 30, fontWeight: "900" }}>Settings</Text>
        <Text style={{ color: "#AAB2C2", lineHeight: 22 }}>
          Brand basics and mode live here. Turn on gym owner mode to unlock the My Gym tab for schedule, logo, and
          curriculum tweaks.
        </Text>

        <View
          style={{
            borderWidth: 1,
            borderColor: "#222",
            backgroundColor: "#101010",
            borderRadius: 14,
            padding: 14,
            gap: 8,
          }}
        >
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
            <View style={{ flex: 1, paddingRight: 12 }}>
              <Text style={{ color: "#FFFFFF", fontSize: 17, fontWeight: "800" }}>{modeLabel}</Text>
              <Text style={{ color: "#8E96A5", marginTop: 4 }}>
                {isGymMode
                  ? "My Gym appears in the tab bar with schedule tools, logo, and technique customization."
                  : "My Gym is hidden. Library, Notes, Profile, and Schedule stay available for personal training."}
              </Text>
            </View>
            <Switch
              value={isGymMode}
              onValueChange={setIsGymMode}
              thumbColor={isGymMode ? "#FFFFFF" : "#D0D0D0"}
              trackColor={{ false: "#3B3B3B", true: withAlpha(accentColor, 0.7) }}
            />
          </View>
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
          <Text style={{ color: "#FFFFFF", fontSize: 17, fontWeight: "800" }}>Account</Text>
          <Text style={{ color: "#AAB2C2" }}>{email ? `Signed in as ${email}` : "Signed in (local session)"}</Text>
          <Pressable
            onPress={() =>
              void signOut().then(() => {
                Alert.alert("Signed out", "You have been signed out.");
                router.replace("/sign-in" as Href);
              })
            }
            style={{
              borderRadius: 10,
              paddingVertical: 10,
              alignItems: "center",
              borderWidth: 1,
              borderColor: "#5A1F1F",
              backgroundColor: "#2A1111",
            }}
          >
            <Text style={{ color: "#FFD6D6", fontWeight: "900" }}>Sign out</Text>
          </Pressable>
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
          <Text style={{ color: "#FFFFFF", fontSize: 17, fontWeight: "800" }}>Account role</Text>
          <Text style={{ color: "#8E96A5", lineHeight: 20 }}>
            Controls gym management capabilities when backend auth is enabled.
          </Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
            {(["student", "coach", "owner"] as AppRole[]).map((candidateRole) => {
              const selected = role === candidateRole;
              return (
                <Pressable
                  key={candidateRole}
                  onPress={() => setRole(candidateRole)}
                  style={{
                    borderWidth: 1,
                    borderColor: selected ? "#D4B06A" : "#2A2A2A",
                    borderRadius: 999,
                    paddingHorizontal: 12,
                    paddingVertical: 8,
                    backgroundColor: selected ? "rgba(212,176,106,0.18)" : "#0D0D0D",
                  }}
                >
                  <Text style={{ color: "#FFFFFF", textTransform: "capitalize", fontWeight: "800" }}>{candidateRole}</Text>
                </Pressable>
              );
            })}
          </View>
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
          <Text style={{ color: "#FFFFFF", fontSize: 17, fontWeight: "800" }}>Accessibility</Text>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
            <Text style={{ color: "#AAB2C2" }}>Reduced motion</Text>
            <Switch value={reducedMotion} onValueChange={setReducedMotion} />
          </View>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
            <Text style={{ color: "#AAB2C2" }}>High contrast accents</Text>
            <Switch value={highContrast} onValueChange={setHighContrast} />
          </View>
          <Text style={{ color: "#8E96A5", fontSize: 12 }}>Text scale: {Math.round(textScale * 100)}%</Text>
          <View style={{ flexDirection: "row", gap: 8 }}>
            {[0.95, 1, 1.1, 1.2].map((scale) => (
              <Pressable
                key={scale}
                onPress={() => setTextScale(scale)}
                style={{
                  borderWidth: 1,
                  borderColor: Math.abs(textScale - scale) < 0.01 ? "#D4B06A" : "#2A2A2A",
                  borderRadius: 999,
                  paddingHorizontal: 10,
                  paddingVertical: 6,
                  backgroundColor: Math.abs(textScale - scale) < 0.01 ? "rgba(212,176,106,0.18)" : "#0D0D0D",
                }}
              >
                <Text style={{ color: "#FFFFFF", fontWeight: "800" }}>{Math.round(scale * 100)}%</Text>
              </Pressable>
            ))}
          </View>
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
          <Text style={{ color: "#8E96A5", fontWeight: "700" }}>Display name</Text>
          <TextInput
            value={nameInput}
            onChangeText={setNameInput}
            placeholder="My Gym"
            placeholderTextColor="#5D6574"
            onBlur={() => setGymName(nameInput)}
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
          <Text style={{ color: "#8E96A5", fontSize: 12 }}>Shown in the header and on the Schedule screen.</Text>
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
          <Text style={{ color: "#FFFFFF", fontSize: 17, fontWeight: "800" }}>Backup & restore</Text>
          <Text style={{ color: "#8E96A5", lineHeight: 20 }}>
            Export all local app data to JSON for safe backup, then paste to restore on this device.
          </Text>
          <View style={{ flexDirection: "row", gap: 8 }}>
            <Pressable
              onPress={() =>
                void exportBackup().then((value) => {
                  setBackupJson(value);
                  Alert.alert("Backup ready", "Backup JSON loaded in the field below.");
                })
              }
              style={{
                flex: 1,
                borderRadius: 10,
                paddingVertical: 10,
                alignItems: "center",
                borderWidth: 1,
                borderColor: withAlpha(accentColor, 0.75),
                backgroundColor: withAlpha(accentColor, 0.2),
              }}
            >
              <Text style={{ color: "#FFFFFF", fontWeight: "900" }}>Export</Text>
            </Pressable>
            <Pressable
              onPress={() =>
                void importBackup(backupJson).then((result) => {
                  if (!result.ok) {
                    Alert.alert("Restore failed", result.message);
                    return;
                  }
                  Alert.alert("Restore complete", "Backup restored. Restart app to reload stores.");
                })
              }
              style={{
                flex: 1,
                borderRadius: 10,
                paddingVertical: 10,
                alignItems: "center",
                borderWidth: 1,
                borderColor: "#333",
                backgroundColor: "#161616",
              }}
            >
              <Text style={{ color: "#FFFFFF", fontWeight: "900" }}>Restore</Text>
            </Pressable>
          </View>
          <TextInput
            value={backupJson}
            onChangeText={setBackupJson}
            placeholder="Backup JSON..."
            placeholderTextColor="#5D6574"
            multiline
            style={{
              minHeight: 120,
              borderWidth: 1,
              borderColor: "#2A2A2A",
              borderRadius: 10,
              backgroundColor: "#0F0F0F",
              color: "#FFFFFF",
              paddingHorizontal: 12,
              paddingVertical: 10,
              textAlignVertical: "top",
            }}
          />
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
          <Text style={{ color: "#8E96A5", fontWeight: "700" }}>Accent color</Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
            {PRESET_COLORS.map((color) => {
              const selected = color.toUpperCase() === accentColor.toUpperCase();
              return (
                <Pressable
                  key={color}
                  onPress={() => {
                    setAccentColor(color);
                    setColorInput(color);
                  }}
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: 999,
                    backgroundColor: color,
                    borderWidth: selected ? 3 : 1,
                    borderColor: selected ? "#FFFFFF" : "#3A3A3A",
                  }}
                />
              );
            })}
          </View>
          <TextInput
            value={colorInput}
            onChangeText={setColorInput}
            onBlur={() => {
              setAccentColor(colorInput);
              setColorInput(useGymStore.getState().accentColor);
            }}
            placeholder="#C8102E"
            placeholderTextColor="#5D6574"
            autoCapitalize="characters"
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
          <View
            style={{
              borderWidth: 1,
              borderColor: withAlpha(accentColor, 0.7),
              backgroundColor: withAlpha(accentColor, 0.18),
              borderRadius: 10,
              padding: 10,
            }}
          >
            <Text style={{ color: "#FFFFFF", fontWeight: "800" }}>Active accent: {accentColor}</Text>
          </View>
        </View>

        {isGymMode ? (
          <Link href="/my-gym" asChild>
            <Pressable
              style={{
                borderWidth: 1,
                borderColor: withAlpha(accentColor, 0.55),
                backgroundColor: withAlpha(accentColor, 0.12),
                borderRadius: 12,
                padding: 14,
              }}
            >
              <Text style={{ color: "#FFFFFF", fontWeight: "900" }}>Open My Gym tools</Text>
              <Text style={{ color: "#AAB2C2", marginTop: 4 }}>Logo, weekly schedule, and curriculum overrides.</Text>
            </Pressable>
          </Link>
        ) : null}

        {!isGymMode ? (
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
            <Text style={{ color: "#FFFFFF", fontSize: 17, fontWeight: "800" }}>Join a gym</Text>
            <Text style={{ color: "#8E96A5", lineHeight: 20 }}>
              Scan your coach&apos;s gym QR code, or paste a manual sync code.
            </Text>
            <Pressable
              onPress={() => void onOpenScanner()}
              style={{
                borderRadius: 10,
                paddingVertical: 10,
                alignItems: "center",
                borderWidth: 1,
                borderColor: withAlpha("#D4B06A", 0.75),
                backgroundColor: "rgba(212,176,106,0.14)",
              }}
            >
              <Text style={{ color: "#FFFFFF", fontWeight: "900" }}>Scan gym QR</Text>
            </Pressable>
            <TextInput
              value={syncInput}
              onChangeText={setSyncInput}
              placeholder="Paste RQSYNC code..."
              placeholderTextColor="#5D6574"
              multiline
              style={{
                minHeight: 90,
                borderWidth: 1,
                borderColor: "#2A2A2A",
                borderRadius: 10,
                backgroundColor: "#0F0F0F",
                color: "#FFFFFF",
                paddingHorizontal: 12,
                paddingVertical: 10,
                textAlignVertical: "top",
              }}
            />
            <Pressable
              onPress={() => void onJoinGym()}
              style={{
                borderRadius: 10,
                paddingVertical: 10,
                alignItems: "center",
                borderWidth: 1,
                borderColor: withAlpha(accentColor, 0.75),
                backgroundColor: withAlpha(accentColor, 0.2),
              }}
            >
              <Text style={{ color: "#FFFFFF", fontWeight: "900" }}>Sync gym</Text>
            </Pressable>
            {linkedGym ? (
              <View
                style={{
                  borderWidth: 1,
                  borderColor: "#2A2A2A",
                  backgroundColor: "#0D0D0D",
                  borderRadius: 10,
                  padding: 10,
                  gap: 6,
                }}
              >
                <Text style={{ color: "#FFFFFF", fontWeight: "800" }}>Connected gym: {linkedGym.gymName}</Text>
                <Text style={{ color: "#8E96A5", fontSize: 12 }}>Gym ID: {linkedGym.gymId}</Text>
                <Pressable
                  onPress={() => {
                    leaveLinkedGym();
                    void setActiveProgressGymId(null);
                  }}
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
                  <Text style={{ color: "#FFD6D6", fontWeight: "700" }}>Leave synced gym</Text>
                </Pressable>
              </View>
            ) : null}
          </View>
        ) : null}

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
          <Text style={{ color: "#FFFFFF", fontSize: 17, fontWeight: "800" }}>Sync center</Text>
          <Text style={{ color: "#8E96A5", lineHeight: 20 }}>
            Reliable event queue for backend sync. Keeps pending updates when offline and retries later.
          </Text>
          <Text style={{ color: "#D4B06A", fontWeight: "800" }}>
            Pending events: {pendingSyncCount} {isSyncing ? "• Syncing..." : ""}
          </Text>
          <Text style={{ color: "#8E96A5", fontSize: 12 }}>
            Last sync: {lastSyncedAt ? new Date(lastSyncedAt).toLocaleString() : "Never"}
          </Text>
          {lastSyncError ? <Text style={{ color: "#F29A9A", fontSize: 12 }}>{lastSyncError}</Text> : null}
          <Pressable
            onPress={() => void flushSync()}
            style={{
              borderRadius: 10,
              paddingVertical: 10,
              alignItems: "center",
              borderWidth: 1,
              borderColor: withAlpha(accentColor, 0.75),
              backgroundColor: withAlpha(accentColor, 0.2),
              opacity: isSyncing ? 0.65 : 1,
            }}
            disabled={isSyncing}
          >
            <Text style={{ color: "#FFFFFF", fontWeight: "900" }}>{isSyncing ? "Syncing..." : "Sync now"}</Text>
          </Pressable>
          <Text style={{ color: "#6F7785", fontSize: 11 }}>
            Configure `EXPO_PUBLIC_ROLLQUEST_SYNC_URL` and optional `EXPO_PUBLIC_ROLLQUEST_SYNC_KEY` to connect backend.
          </Text>
        </View>

        <Pressable
          onPress={resetGymSettings}
          style={{
            borderWidth: 1,
            borderColor: withAlpha(accentColor, 0.8),
            backgroundColor: withAlpha(accentColor, 0.2),
            borderRadius: 12,
            padding: 14,
            alignItems: "center",
          }}
        >
          <Text style={{ color: "#FFFFFF", fontWeight: "900" }}>Reset gym data to defaults</Text>
          <Text style={{ color: "#D8DCE6", fontSize: 12, marginTop: 4, textAlign: "center" }}>
            Clears logo, schedule, technique overrides, name, color, and turns off gym mode.
          </Text>
        </Pressable>
      </ScrollView>

      <Modal transparent visible={scanOpen} animationType="fade">
        <View style={{ flex: 1 }}>
          <TouchableWithoutFeedback onPress={() => setScanOpen(false)}>
            <View style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.75)" }} />
          </TouchableWithoutFeedback>
          <View
            style={{
              marginTop: 70,
              marginHorizontal: 16,
              borderRadius: 14,
              borderWidth: 1,
              borderColor: "#2A2A2A",
              overflow: "hidden",
              backgroundColor: "#0E0E0E",
            }}
          >
            <View style={{ padding: 12, gap: 4 }}>
              <Text style={{ color: "#FFFFFF", fontSize: 18, fontWeight: "900" }}>Scan gym QR</Text>
              <Text style={{ color: "#8E96A5" }}>Center the QR code in view to join the gym.</Text>
            </View>
            <View style={{ height: 360 }}>
              <CameraView
                style={{ flex: 1 }}
                facing="back"
                barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
                onBarcodeScanned={({ data }) => onScanPayload(data)}
              />
            </View>
            <View style={{ padding: 12 }}>
              <Pressable
                onPress={() => setScanOpen(false)}
                style={{
                  borderRadius: 10,
                  paddingVertical: 10,
                  alignItems: "center",
                  borderWidth: 1,
                  borderColor: "#333",
                  backgroundColor: "#151515",
                }}
              >
                <Text style={{ color: "#FFFFFF", fontWeight: "800" }}>Close scanner</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
