import * as FileSystem from "expo-file-system/legacy";
import * as ImagePicker from "expo-image-picker";
import { Platform } from "react-native";

export async function pickGymLogoFromLibrary(): Promise<string | undefined> {
  const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!perm.granted) return undefined;

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: true,
    aspect: [1, 1],
    quality: 0.85,
  });

  if (result.canceled || !result.assets[0]?.uri) return undefined;
  const src = result.assets[0].uri;

  if (Platform.OS === "web") {
    return src;
  }

  const dir = FileSystem.documentDirectory;
  if (!dir) return src;

  const dest = `${dir}gym-logo-${Date.now()}.jpg`;
  await FileSystem.copyAsync({ from: src, to: dest });
  return dest;
}
