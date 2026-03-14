import { Ionicons } from "@expo/vector-icons";
import React, { useRef } from "react";
import { Animated, Pressable, StyleSheet, Text, View } from "react-native";

const COLORS = {
  bg: "#0A0A0F",
  surface: "#13131A",
  border: "#2A2A3D",
  accent: "#6C63FF",
  accentDim: "#3D3A6B",
  textPrimary: "#F1F1F5",
  textSecondary: "#8B8B9E",
  textMuted: "#5A5A72",
  white: "#FFFFFF",
  groupAvatar: "#059669", // teal-green for groups
  dmAvatar: "#6C63FF", // accent for DMs
  unreadDot: "#6C63FF",
};

// Generates a consistent color from the first letter
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
  const index = name.charCodeAt(0) % AVATAR_COLORS.length;
  return AVATAR_COLORS[index];
}

interface ChatItemProps {
  name: string;
  lastMessage: string;
  time: string;
  unreadCount?: number;
  onPress: () => void;
  onLongPress: () => void;
  isGroup?: boolean;
}

export const ChatItem = ({
  name,
  lastMessage,
  time,
  unreadCount,
  onPress,
  onLongPress,
  isGroup,
}: ChatItemProps) => {
  const scale = useRef(new Animated.Value(1)).current;

  const onPressIn = () =>
    Animated.spring(scale, {
      toValue: 0.98,
      useNativeDriver: true,
      speed: 50,
    }).start();

  const onPressOut = () =>
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      speed: 50,
    }).start();

  const hasUnread = unreadCount && unreadCount > 0;
  const avatarColor = isGroup ? COLORS.groupAvatar : getAvatarColor(name);

  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
    >
      <Animated.View style={[styles.container, { transform: [{ scale }] }]}>
        {/* ── Avatar ── */}
        <View style={styles.avatarWrapper}>
          {/* Unread ring — only visible when there are unread messages */}
          {hasUnread && <View style={styles.avatarRing} />}

          <View style={[styles.avatar, { backgroundColor: avatarColor }]}>
            {isGroup ? (
              <Ionicons name="people" size={22} color={COLORS.white} />
            ) : (
              <Text style={styles.avatarText}>
                {name.charAt(0).toUpperCase()}
              </Text>
            )}
          </View>
        </View>

        {/* ── Content ── */}
        <View style={styles.content}>
          {/* Top row: name + time */}
          <View style={styles.topRow}>
            <Text
              style={[styles.name, hasUnread && styles.nameUnread]}
              numberOfLines={1}
            >
              {name}
            </Text>
            <Text style={[styles.time, hasUnread && styles.timeUnread]}>
              {time}
            </Text>
          </View>

          {/* Bottom row: last message + badge */}
          <View style={styles.bottomRow}>
            <Text
              style={[
                styles.lastMessage,
                hasUnread && styles.lastMessageUnread,
              ]}
              numberOfLines={1}
            >
              {lastMessage}
            </Text>

            {hasUnread ? (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>
                  {unreadCount > 99 ? "99+" : unreadCount}
                </Text>
              </View>
            ) : (
              // Empty placeholder to keep layout stable
              <View style={styles.badgePlaceholder} />
            )}
          </View>
        </View>
      </Animated.View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingVertical: 12,
    alignItems: "center",
    // Subtle separator at the bottom, aligned with content (not avatar)
  },

  // ── Avatar ──
  avatarWrapper: {
    position: "relative",
    width: 52,
    height: 52,
    marginRight: 14,
  },
  // Glowing ring when unread messages exist
  avatarRing: {
    position: "absolute",
    top: -2,
    left: -2,
    right: -2,
    bottom: -2,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: COLORS.accent,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    color: COLORS.white,
    fontSize: 20,
    fontWeight: "700",
  },

  // ── Content ──
  content: {
    flex: 1,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    paddingBottom: 12,
  },

  // Top row
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 5,
  },
  name: {
    fontSize: 15,
    fontWeight: "600",
    color: COLORS.textSecondary,
    flex: 1,
    marginRight: 8,
  },
  nameUnread: {
    color: COLORS.textPrimary,
    fontWeight: "700",
  },
  time: {
    fontSize: 12,
    color: COLORS.textMuted,
    flexShrink: 0,
  },
  timeUnread: {
    color: COLORS.accent,
    fontWeight: "600",
  },

  // Bottom row
  bottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  lastMessage: {
    fontSize: 13,
    color: COLORS.textMuted,
    flex: 1,
    marginRight: 8,
  },
  lastMessageUnread: {
    color: COLORS.textSecondary,
    fontWeight: "500",
  },

  // Unread badge
  badge: {
    backgroundColor: COLORS.accent,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 6,
    // Subtle glow
    shadowColor: COLORS.accent,
    shadowOpacity: 0.5,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 0 },
    elevation: 3,
  },
  badgePlaceholder: {
    width: 20,
    height: 20,
  },
  badgeText: {
    color: COLORS.white,
    fontSize: 11,
    fontWeight: "700",
  },
});
