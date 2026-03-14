import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { TextStyle } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const COLORS = {
  bg: "#0A0A0F",
  surface: "#13131A",
  border: "#2A2A3D",
  accent: "#6C63FF",
  textMuted: "#5A5A72",
  textPrimary: "#F1F1F5",
};

export default function TabLayout() {
  const insets = useSafeAreaInsets();

  const TAB_BAR_HEIGHT = 56 + insets.bottom;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: COLORS.accent,
        tabBarInactiveTintColor: COLORS.textMuted,
        tabBarStyle: {
          backgroundColor: COLORS.surface,
          borderTopColor: COLORS.border,
          borderTopWidth: 1,
          height: TAB_BAR_HEIGHT,
          paddingBottom: insets.bottom || 8,
          paddingTop: 8,
        } as TextStyle,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "600",
          letterSpacing: 0.2,
        } as TextStyle,
      }}
    >
      <Tabs.Screen
        name="chats"
        options={{
          title: "Chats",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "chatbubbles" : "chatbubbles-outline"}
              size={24}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "settings" : "settings-outline"}
              size={24}
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}
