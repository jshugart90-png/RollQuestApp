import type { Href } from "expo-router";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Alert, Pressable, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { isSupabaseConfigured } from "./services/supabase/client";
import { useSessionStore } from "./store/session";

export default function SignInScreen() {
  const router = useRouter();
  const signInWithPassword = useSessionStore((s) => s.signInWithPassword);
  const isLoading = useSessionStore((s) => s.isLoading);
  const authError = useSessionStore((s) => s.authError);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function onSignIn() {
    const result = await signInWithPassword(email, password);
    if (!result.ok) {
      Alert.alert("Sign in failed", result.message);
      return;
    }
    router.replace("/schedule" as Href);
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#040404" }} edges={["top", "bottom"]}>
      <View style={{ flex: 1, padding: 20, justifyContent: "center", gap: 14 }}>
        <Text style={{ color: "#6E7788", fontWeight: "800", letterSpacing: 1.4 }}>ROLLQUEST</Text>
        <Text style={{ color: "#FFFFFF", fontSize: 32, fontWeight: "900" }}>Sign in</Text>
        <Text style={{ color: "#AAB2C2", lineHeight: 22 }}>
          {isSupabaseConfigured()
            ? "Secure account sign-in powered by Supabase."
            : "Supabase not configured yet. Local sign-in fallback is active for development."}
        </Text>

        <TextInput
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          placeholder="Email"
          placeholderTextColor="#5D6574"
          style={input}
        />
        <TextInput
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          placeholder="Password"
          placeholderTextColor="#5D6574"
          style={input}
        />
        {authError ? <Text style={{ color: "#F29A9A" }}>{authError}</Text> : null}
        <Pressable
          onPress={() => void onSignIn()}
          disabled={isLoading}
          style={({ pressed }) => ({
            borderRadius: 12,
            borderWidth: 1,
            borderColor: "#C8102E",
            backgroundColor: pressed ? "rgba(200,16,46,0.3)" : "rgba(200,16,46,0.2)",
            paddingVertical: 14,
            alignItems: "center",
            opacity: isLoading ? 0.65 : 1,
          })}
        >
          <Text style={{ color: "#FFFFFF", fontWeight: "900", fontSize: 16 }}>{isLoading ? "Signing in..." : "Continue"}</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const input = {
  borderWidth: 1,
  borderColor: "#2A2A2A",
  borderRadius: 12,
  backgroundColor: "#0F0F0F",
  color: "#FFFFFF",
  paddingHorizontal: 14,
  paddingVertical: 12,
  fontSize: 16,
} as const;
