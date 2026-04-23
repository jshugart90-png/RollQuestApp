import { Image } from "expo-image";
import React, { useCallback, useEffect, useState } from "react";
import { Text, View, type ImageStyle, type StyleProp, type ViewStyle } from "react-native";
import { withAlpha } from "../store/gym";

type Props = {
  uri?: string;
  size: number;
  borderRadius?: number;
  fallbackLabel?: string;
  accentColor: string;
  /** Applied to the image and to the fallback container. */
  style?: StyleProp<ViewStyle | ImageStyle>;
};

export function GymLogoImage({
  uri,
  size,
  borderRadius = 8,
  fallbackLabel = "RQ",
  accentColor,
  style,
}: Props) {
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [uri]);

  const onError = useCallback(() => setFailed(true), []);

  if (!uri || failed) {
    return (
      <View
        style={[
          {
            width: size,
            height: size,
            borderRadius,
            alignItems: "center",
            justifyContent: "center",
            borderWidth: 1,
            borderColor: withAlpha(accentColor, 0.7),
            backgroundColor: withAlpha(accentColor, 0.16),
          },
          style,
        ]}
      >
        <Text style={{ color: "#FFFFFF", fontWeight: "900", fontSize: Math.round(size * 0.45) }}>{fallbackLabel}</Text>
      </View>
    );
  }

  return (
    <Image
      source={{ uri }}
      onError={onError}
      style={[
        { width: size, height: size, borderRadius, borderWidth: 1, borderColor: "#2A2A2A" } satisfies ImageStyle,
        style as StyleProp<ImageStyle>,
      ]}
      contentFit="cover"
      cachePolicy="memory-disk"
      transition={120}
    />
  );
}
