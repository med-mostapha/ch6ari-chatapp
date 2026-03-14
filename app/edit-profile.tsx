import { useAuth } from "@/context/AuthContext";
import { updateProfile } from "@/services/auth";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const COLORS = {
  bg: "#0A0A0F",
  surface: "#13131A",
  inputBg: "#1C1C27",
  border: "#2A2A3D",
  accent: "#6C63FF",
  accentDim: "rgba(108, 99, 255, 0.15)",
  textPrimary: "#F1F1F5",
  textSecondary: "#8B8B9E",
  textMuted: "#5A5A72",
  white: "#FFFFFF",
  error: "#F87171",
  success: "#34D399",
};

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
  if (!name) return AVATAR_COLORS[0];
  return AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length];
}

export default function EditProfileScreen() {
  const { session } = useAuth();
  const router = useRouter();

  const [username, setUsername] = useState(
    session?.user?.user_metadata?.display_name || "",
  );
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  const scale = useRef(new Animated.Value(1)).current;
  const avatarColor = getAvatarColor(username);

  const onPressIn = () =>
    Animated.spring(scale, {
      toValue: 0.96,
      useNativeDriver: true,
      speed: 50,
    }).start();
  const onPressOut = () =>
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      speed: 50,
    }).start();

  const handleUpdate = async () => {
    if (username.trim().length < 3) {
      return Alert.alert("Error", "Username must be at least 3 characters");
    }

    setLoading(true);
    const { error } = await updateProfile(username.trim());
    setLoading(false);

    if (error) {
      Alert.alert("Update Failed", error.message);
    } else {
      setSaved(true);
      setTimeout(() => {
        setSaved(false);
        router.back();
      }, 1200);
    }
  };

  const email = session?.user?.email ?? "";

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* ── Header ── */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backBtn}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          activeOpacity={0.7}
        >
          <View style={styles.backBtnInner}>
            <Ionicons name="arrow-back" size={18} color={COLORS.textPrimary} />
          </View>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Profile</Text>
        {/* Spacer to center the title */}
        <View style={styles.backBtn} />
      </View>

      <View style={styles.content}>
        {/* ── Avatar Preview ── */}
        <View style={styles.avatarSection}>
          <View
            style={[styles.avatarOuter, { borderColor: avatarColor + "55" }]}
          >
            <View style={[styles.avatar, { backgroundColor: avatarColor }]}>
              <Text style={styles.avatarText}>
                {(username || "?").charAt(0).toUpperCase()}
              </Text>
            </View>
          </View>
          <Text style={styles.avatarHint}>Your avatar updates as you type</Text>
        </View>

        {/* ── Form Card ── */}
        <View style={styles.card}>
          {/* Email (read-only) */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email Address</Text>
            <View style={[styles.inputWrapper, styles.inputReadOnly]}>
              <Ionicons
                name="mail-outline"
                size={16}
                color={COLORS.textMuted}
                style={styles.fieldIcon}
              />
              <Text style={styles.readOnlyText} numberOfLines={1}>
                {email}
              </Text>
              <View style={styles.lockedBadge}>
                <Ionicons
                  name="lock-closed"
                  size={10}
                  color={COLORS.textMuted}
                />
              </View>
            </View>
          </View>

          {/* Username (editable) */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Username</Text>
            <View style={styles.inputWrapper}>
              <Ionicons
                name="person-outline"
                size={16}
                color={COLORS.textMuted}
                style={styles.fieldIcon}
              />
              <TextInput
                style={styles.inputText}
                value={username}
                onChangeText={(t) => {
                  setUsername(t);
                  setSaved(false);
                }}
                placeholder="Enter new username"
                placeholderTextColor={COLORS.textMuted}
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>
            <Text style={styles.inputHint}>Min. 3 characters, no spaces</Text>
          </View>

          {/* Save Button */}
          <Pressable
            onPress={handleUpdate}
            onPressIn={onPressIn}
            onPressOut={onPressOut}
            disabled={loading || saved}
          >
            <Animated.View
              style={[
                styles.button,
                (loading || saved) && styles.buttonDisabled,
                saved && styles.buttonSuccess,
                { transform: [{ scale }] },
              ]}
            >
              {loading ? (
                <ActivityIndicator color={COLORS.white} />
              ) : saved ? (
                <View style={styles.savedRow}>
                  <Ionicons
                    name="checkmark-circle"
                    size={18}
                    color={COLORS.white}
                  />
                  <Text style={styles.buttonText}>Saved!</Text>
                </View>
              ) : (
                <Text style={styles.buttonText}>Save Changes</Text>
              )}
            </Animated.View>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },

  // ── Header ──
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    backgroundColor: COLORS.surface,
  },
  backBtn: {
    width: 38,
  },
  backBtnInner: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: COLORS.inputBg,
    borderWidth: 1,
    borderColor: COLORS.border,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: COLORS.textPrimary,
    letterSpacing: -0.2,
  },

  // ── Content ──
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 32,
  },

  // ── Avatar ──
  avatarSection: {
    alignItems: "center",
    marginBottom: 32,
  },
  avatarOuter: {
    width: 90,
    height: 90,
    borderRadius: 28,
    borderWidth: 2,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  avatar: {
    width: 78,
    height: 78,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    color: COLORS.white,
    fontSize: 30,
    fontWeight: "800",
  },
  avatarHint: {
    fontSize: 12,
    color: COLORS.textMuted,
    fontStyle: "italic",
  },

  // ── Card ──
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },

  // ── Input ──
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.textSecondary,
    letterSpacing: 0.3,
    textTransform: "uppercase",
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.inputBg,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    paddingHorizontal: 14,
    height: 52,
  },
  inputReadOnly: {
    opacity: 0.6,
  },
  fieldIcon: {
    marginRight: 10,
  },
  inputText: {
    flex: 1,
    fontSize: 15,
    color: COLORS.textPrimary,
    paddingVertical: 0,
  },
  readOnlyText: {
    flex: 1,
    fontSize: 15,
    color: COLORS.textSecondary,
  },
  lockedBadge: {
    marginLeft: 8,
  },
  inputHint: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 6,
    marginLeft: 4,
  },

  // ── Button ──
  button: {
    backgroundColor: COLORS.accent,
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: "center",
    shadowColor: COLORS.accent,
    shadowOpacity: 0.4,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  buttonDisabled: {
    shadowOpacity: 0,
    elevation: 0,
  },
  buttonSuccess: {
    backgroundColor: COLORS.success,
    shadowColor: COLORS.success,
    shadowOpacity: 0.4,
  },
  buttonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  savedRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
});
