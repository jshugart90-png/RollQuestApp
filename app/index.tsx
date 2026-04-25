import type { Href } from "expo-router";
import { Redirect } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { useGymStore } from "./store/gym";

export default function RootIndex() {
  const [hydrated, setHydrated] = useState(() => useGymStore.persist.hasHydrated());
  const hasCompletedOnboarding = useGymStore((s) => s.hasCompletedOnboarding);

  useEffect(() => {
    if (useGymStore.persist.hasHydrated()) {
      setHydrated(true);
      return;
    }
    const unsub = useGymStore.persist.onFinishHydration(() => setHydrated(true));
    return unsub;
  }, []);

  if (!hydrated) {
    return (
      <View style={{ flex: 1, backgroundColor: "#030303", alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator size="large" color="#C8102E" />
      </View>
    );
  }

  if (!hasCompletedOnboarding) {
    return <Redirect href={"/onboarding" as Href} />;
  }

  return <Redirect href={"/schedule" as Href} />;
}
