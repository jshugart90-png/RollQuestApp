import { Tabs } from 'expo-router';
import { useColorScheme } from 'react-native';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colorScheme === 'dark' ? '#111' : '#fff',
        },
      }}
    >
      {/* Add your tabs here as you build them */}
      <Tabs.Screen name="index" options={{ title: 'Home' }} />
      {/* <Tabs.Screen name="learn" options={{ title: 'Learn' }} /> */}
      {/* <Tabs.Screen name="drills" options={{ title: 'Drills' }} /> etc. */}
    </Tabs>
  );
}
