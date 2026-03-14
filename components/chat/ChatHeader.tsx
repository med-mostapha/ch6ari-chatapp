import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

const COLORS = {
  bg: "#0A0A0F",
  surface: "#13131A",
  surfaceElevated: "#1C1C27",
  border: "#2A2A3D",
  accent: "#6C63FF",
  accentDim: "rgba(108, 99, 255, 0.15)",
  textPrimary: "#F1F1F5",
  textSecondary: "#8B8B9E",
  textMuted: "#5A5A72",
  white: "#FFFFFF",
  error: "#F87171",
  errorDim: "rgba(248, 113, 113, 0.12)",
  selectionBg: "rgba(108, 99, 255, 0.12)",
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
  return AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length];
}

interface ChatHeaderProps {
  title: string;
  selectionMode: boolean;
  selectedCount: number;
  isOwner: boolean;
  onDeletePress: () => void;
  onDetailsPress: () => void;
  onAddUserPress: () => void;
}

export const ChatHeader = ({
  title,
  selectionMode,
  selectedCount,
  isOwner,
  onDeletePress,
  onDetailsPress,
  onAddUserPress,
}: ChatHeaderProps) => {
  const router = useRouter();
  const avatarColor = getAvatarColor(title || "U");

  return (
    <View style={[styles.header, selectionMode && styles.headerSelectionMode]}>
      {/* ── Back Button ── */}
      <TouchableOpacity
        onPress={() => {
          if (selectionMode) return; // handled by cancel logic if needed
          router.back();
        }}
        style={styles.iconBtn}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        activeOpacity={0.7}
      >
        <Ionicons
          name="arrow-back"
          size={20}
          color={selectionMode ? COLORS.accent : COLORS.textPrimary}
        />
      </TouchableOpacity>

      {/* ── Title Area ── */}
      <TouchableOpacity
        onPress={onDetailsPress}
        style={styles.titleContainer}
        activeOpacity={0.7}
        disabled={selectionMode}
      >
        {!selectionMode ? (
          <View style={styles.titleRow}>
            {/* Mini avatar */}
            <View style={[styles.miniAvatar, { backgroundColor: avatarColor }]}>
              <Text style={styles.miniAvatarText}>
                {title.charAt(0).toUpperCase()}
              </Text>
            </View>
            <View style={styles.titleTextBlock}>
              <Text style={styles.headerTitle} numberOfLines={1}>
                {title}
              </Text>
              <Text style={styles.tapHint}>tap for details</Text>
            </View>
          </View>
        ) : (
          // Selection mode title
          <View style={styles.selectionTitleRow}>
            <View style={styles.selectionCountBox}>
              <Text style={styles.selectionCountText}>{selectedCount}</Text>
            </View>
            <Text style={styles.selectionTitle}>
              {selectedCount === 1 ? "message selected" : "messages selected"}
            </Text>
          </View>
        )}
      </TouchableOpacity>

      {/* ── Right Icons ── */}
      <View style={styles.rightIcons}>
        {selectionMode ? (
          // Delete button in selection mode
          <TouchableOpacity
            onPress={onDeletePress}
            style={[styles.iconBtn, styles.iconBtnDestructive]}
            activeOpacity={0.7}
          >
            <Ionicons name="trash-outline" size={18} color={COLORS.error} />
          </TouchableOpacity>
        ) : (
          <>
            {isOwner && (
              <TouchableOpacity
                onPress={onAddUserPress}
                style={styles.iconBtn}
                activeOpacity={0.7}
              >
                <Ionicons
                  name="person-add-outline"
                  size={19}
                  color={COLORS.textSecondary}
                />
              </TouchableOpacity>
            )}
            <TouchableOpacity
              onPress={onDetailsPress}
              style={styles.iconBtn}
              activeOpacity={0.7}
            >
              <Ionicons
                name="ellipsis-vertical"
                size={19}
                color={COLORS.textSecondary}
              />
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    height: 62,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    gap: 8,
  },
  headerSelectionMode: {
    backgroundColor: COLORS.selectionBg,
    borderBottomColor: COLORS.accent + "40",
  },

  // ── Back / icon buttons ──
  iconBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: COLORS.surfaceElevated,
    borderWidth: 1,
    borderColor: COLORS.border,
    justifyContent: "center",
    alignItems: "center",
  },
  iconBtnDestructive: {
    backgroundColor: COLORS.errorDim,
    borderColor: COLORS.error + "40",
  },

  // ── Title ──
  titleContainer: {
    flex: 1,
    justifyContent: "center",
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  miniAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  miniAvatarText: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: "700",
  },
  titleTextBlock: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.textPrimary,
    letterSpacing: -0.2,
  },
  tapHint: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 1,
  },

  // Selection mode
  selectionTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  selectionCountBox: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: COLORS.accent,
    justifyContent: "center",
    alignItems: "center",
  },
  selectionCountText: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: "800",
  },
  selectionTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: COLORS.accent,
  },

  // Right icons
  rightIcons: {
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
  },
});
