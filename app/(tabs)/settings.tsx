import { SettingsItem } from "@/components/SettingsItem";
import { signOut } from "@/services/auth";
import { useRouter } from "expo-router";
import React from "react";
import { Alert, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function SettingsScreen() {
  const router = useRouter();

  const handleLogout = () => {
    Alert.alert("Sign Out", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          const { error } = await signOut();
          if (error) {
            Alert.alert("Error", error.message);
          } else {
            // The AuthProvider in _layout.tsx will detect the
            // null session and redirect to /login automatically.
          }
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Settings</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <SettingsItem
            label="Edit Profile"
            icon="person-outline"
            onPress={() => {}}
          />
          <SettingsItem
            label="Notifications"
            icon="notifications-outline"
            onPress={() => {}}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Support</Text>
          <SettingsItem
            label="Help Center"
            icon="help-circle-outline"
            onPress={() => {}}
          />
          <SettingsItem
            label="Privacy Policy"
            icon="shield-checkmark-outline"
            onPress={() => {}}
          />
        </View>

        <View style={styles.section}>
          <SettingsItem
            label="Logout"
            icon="log-out-outline"
            onPress={handleLogout}
            destructive
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F9FAFB" },
  scrollContent: { padding: 20 },
  header: { marginBottom: 24 },
  title: { fontSize: 28, fontWeight: "800", color: "#111827" },
  section: { marginBottom: 24 },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: "#9CA3AF",
    textTransform: "uppercase",
    marginBottom: 8,
    marginLeft: 4,
  },
});
