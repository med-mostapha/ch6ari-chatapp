import { SettingsItem } from "@/components/SettingsItem";
import { useAuth } from "@/context/AuthContext";
import { signOut } from "@/services/auth";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const COLORS = {
  bg: "#0A0A0F",
  surface: "#13131A",
  border: "#2A2A3D",
  accent: "#6C63FF",
  accentDim: "rgba(108, 99, 255, 0.15)",
  textPrimary: "#F1F1F5",
  textSecondary: "#8B8B9E",
  textMuted: "#5A5A72",
  white: "#FFFFFF",
  error: "#F87171",
  errorDim: "rgba(248, 113, 113, 0.12)",
  success: "#34D399",
  warning: "#FBBF24",
};

// Returns a consistent color from the name
const AVATAR_COLORS = [
  "#6C63FF",
  "#EF4444",
  "#F59E0B",
  "#10B981",
  "#3B82F6",
  "#EC4899",
  "#8B5CF6",
  "#06B6D4",
];

function getAvatarColor(name: string): string {
  return AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length];
}

export default function SettingsScreen() {
  const router = useRouter();
  const { session } = useAuth();

  const userMetadata = session?.user?.user_metadata;
  const email = session?.user?.email ?? "";
  const username = userMetadata?.display_name || "User";
  const avatarColor = getAvatarColor(username);

  const handleLogout = () => {
    Alert.alert(
      "Sign Out",
      "You'll need to sign in again to access your messages.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Sign Out",
          style: "destructive",
          onPress: async () => {
            const { error } = await signOut();
            if (error) Alert.alert("Error", error.message);
          },
        },
      ],
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Page Title ── */}
        <View style={styles.pageHeader}>
          <Text style={styles.pageTitle}>Settings</Text>
        </View>

        {/* ── Profile Hero Card ── */}
        <TouchableOpacity
          style={styles.profileCard}
          onPress={() => router.push("/edit-profile")}
          activeOpacity={0.8}
        >
          {/* Accent bar at top of card */}
          <View
            style={[styles.cardAccentBar, { backgroundColor: avatarColor }]}
          />

          <View style={styles.profileCardInner}>
            {/* Avatar */}
            <View style={[styles.avatar, { backgroundColor: avatarColor }]}>
              <Text style={styles.avatarText}>
                {username.charAt(0).toUpperCase()}
              </Text>
            </View>

            {/* Info */}
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{username}</Text>
              <Text style={styles.profileEmail} numberOfLines={1}>
                {email}
              </Text>
              <View style={styles.profileStatusRow}>
                <View style={styles.onlineDot} />
                <Text style={styles.profileStatusText}>Active now</Text>
              </View>
            </View>

            {/* Edit arrow */}
            <View style={styles.editIconContainer}>
              <Ionicons
                name="pencil-outline"
                size={16}
                color={COLORS.textMuted}
              />
            </View>
          </View>
        </TouchableOpacity>

        {/* ── Account Section ── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <SettingsItem
            label="Edit Profile"
            icon="person-outline"
            onPress={() => router.push("/edit-profile")}
            iconColor={COLORS.accent}
            iconBgColor={COLORS.accentDim}
          />
          <SettingsItem
            label="Notifications"
            icon="notifications-outline"
            onPress={() => {}}
            iconColor={COLORS.warning}
            iconBgColor="rgba(251, 191, 36, 0.12)"
            badge="New"
          />
        </View>

        {/* ── Privacy & Security ── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Privacy & Security</Text>
          <SettingsItem
            label="Privacy Policy"
            icon="shield-checkmark-outline"
            onPress={() => {}}
            iconColor={COLORS.success}
            iconBgColor="rgba(52, 211, 153, 0.12)"
          />
          <SettingsItem
            label="Help Center"
            icon="help-circle-outline"
            onPress={() => {}}
            iconColor="#60A5FA"
            iconBgColor="rgba(96, 165, 250, 0.12)"
          />
        </View>

        {/* ── Danger Zone ── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Danger Zone</Text>
          <SettingsItem
            label="Sign Out"
            icon="log-out-outline"
            onPress={handleLogout}
            destructive
          />
        </View>

        {/* ── Version Footer ── */}
        <View style={styles.footer}>
          <Ionicons name="chatbubbles" size={20} color={COLORS.textMuted} />
          <Text style={styles.footerText}>ChatApp v1.0.0</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },

  // ── Page Header ──
  pageHeader: {
    paddingTop: 8,
    paddingBottom: 20,
  },
  pageTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: COLORS.textPrimary,
    letterSpacing: -0.5,
  },

  // ── Profile Card ──
  profileCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 28,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },
  cardAccentBar: {
    height: 4,
    width: "100%",
  },
  profileCardInner: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
  },
  avatar: {
    width: 58,
    height: 58,
    borderRadius: 29,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  avatarText: {
    color: COLORS.white,
    fontSize: 22,
    fontWeight: "800",
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 17,
    fontWeight: "700",
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  profileEmail: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginBottom: 6,
  },
  profileStatusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  onlineDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: "#34D399",
  },
  profileStatusText: {
    fontSize: 12,
    color: "#34D399",
    fontWeight: "500",
  },
  editIconContainer: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: COLORS.bg,
    borderWidth: 1,
    borderColor: COLORS.border,
    justifyContent: "center",
    alignItems: "center",
  },

  // ── Sections ──
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.textMuted,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 10,
    marginLeft: 4,
  },

  // ── Footer ──
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 8,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  footerText: {
    fontSize: 13,
    color: COLORS.textMuted,
    fontWeight: "500",
  },
});
