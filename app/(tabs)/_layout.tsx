import { FontAwesome6, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { useGymStore } from "../store/gym";

export default function TabLayout() {
  const accentColor = useGymStore((state) => state.accentColor);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarHideOnKeyboard: true,
        tabBarActiveTintColor: accentColor,
        tabBarInactiveTintColor: '#8C8F9A',
        tabBarStyle: {
          backgroundColor: '#090909',
          borderTopColor: '#1A1A1A',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => <Ionicons name="home" color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="library"
        options={{
          title: 'Library',
          tabBarIcon: ({ color, size }) => <MaterialCommunityIcons name="bookshelf" color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="my-gym"
        options={{
          title: 'My Gym',
          tabBarIcon: ({ color, size }) => <FontAwesome6 name="dumbbell" color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="notes"
        options={{
          title: 'Notes',
          tabBarIcon: ({ color, size }) => <MaterialCommunityIcons name="notebook-edit-outline" color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => <Ionicons name="person" color={color} size={size} />,
        }}
      />
    </Tabs>
  );
}
