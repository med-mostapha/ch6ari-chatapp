import { SettingsItem } from "@/components/SettingsItem";
import { useAuth } from "@/context/AuthContext";
import { signOut } from "@/services/auth";
import { useRouter } from "expo-router";
import React from "react";
import { Alert, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function SettingsScreen() {
  const router = useRouter();
  const { session } = useAuth();

  const userMetadata = session?.user?.user_metadata;
  const email = session?.user?.email;
  const username = userMetadata?.display_name || "User";

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

        {/* --- Profile Header Section --- */}
        <View style={styles.profileCard}>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatarText}>
              {username.charAt(0).toUpperCase()}
            </Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{username}</Text>
            <Text style={styles.profileEmail}>{email}</Text>
          </View>
        </View>
        {/* ------------------------------ */}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <SettingsItem
            label="Edit Profile"
            icon="person-outline"
            onPress={() => router.push("/settings/edit-profile")}
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
  header: { marginBottom: 20 },
  title: { fontSize: 28, fontWeight: "800", color: "#111827" },

  profileCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 20,
    marginBottom: 30,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 7,
    elevation: 2,
  },
  avatarContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#2563EB",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  avatarText: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "700",
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
  },
  profileEmail: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 2,
  },

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
