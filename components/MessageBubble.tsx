import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

const COLORS = {
  bg: "#0A0A0F",
  myBubble: "#6C63FF",
  myBubbleDeep: "#5A52E0",
  theirBubble: "#1C1C27",
  theirBubbleBorder: "#2A2A3D",
  accent: "#6C63FF",
  textPrimary: "#F1F1F5",
  textSecondary: "#8B8B9E",
  textMuted: "#5A5A72",
  white: "#FFFFFF",
  error: "#F87171",
  selectionBg: "rgba(108, 99, 255, 0.12)",
  systemBg: "rgba(255,255,255,0.05)",
  systemBorder: "#2A2A3D",
};

// Generate a consistent color for each username
const USERNAME_COLORS = [
  "#A78BFA",
  "#34D399",
  "#60A5FA",
  "#F472B6",
  "#FBBF24",
  "#6EE7B7",
  "#93C5FD",
  "#FCA5A5",
];

function getUsernameColor(name: string): string {
  return USERNAME_COLORS[name.charCodeAt(0) % USERNAME_COLORS.length];
}

interface MessageBubbleProps {
  item: any;
  isMine: boolean;
  isSelected: boolean;
  onLongPress: () => void;
  onPress: () => void;
  selectionMode: boolean;
  formatTime: (date: string) => string;
  isOwner: boolean;
}

export const MessageBubble = ({
  item,
  isMine,
  isSelected,
  onLongPress,
  onPress,
  selectionMode,
  formatTime,
  isOwner,
}: MessageBubbleProps) => {
  const isTemp = item.id.toString().startsWith("temp-");
  const username = item.profiles?.username || "User";
  const usernameColor = getUsernameColor(username);

  // ── System Message ────────────────────────────────────────────────────────
  if (item.type === "system") {
    return (
      <View style={styles.systemContainer}>
        <View style={styles.systemBadge}>
          <Ionicons
            name="information-circle-outline"
            size={12}
            color={COLORS.textMuted}
            style={{ marginRight: 5 }}
          />
          <Text style={styles.systemText}>{item.content}</Text>
        </View>
      </View>
    );
  }

  // ── Normal Message ────────────────────────────────────────────────────────
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onLongPress={onLongPress}
      onPress={onPress}
      style={[
        styles.wrapper,
        isMine ? styles.myWrapper : styles.theirWrapper,
        isSelected && styles.selectedWrapper,
        isTemp && styles.tempWrapper,
      ]}
    >
      {/* Selection checkbox */}
      {selectionMode && (
        <View style={styles.checkboxContainer}>
          <View
            style={[styles.checkbox, isSelected && styles.checkboxSelected]}
          >
            {isSelected && (
              <Ionicons name="checkmark" size={12} color={COLORS.white} />
            )}
          </View>
        </View>
      )}

      {/* ── Bubble ── */}
      <View
        style={[
          styles.bubble,
          isMine ? styles.myBubble : styles.theirBubble,
          isSelected &&
            (isMine ? styles.myBubbleSelected : styles.theirBubbleSelected),
        ]}
      >
        {/* Username row (only for others in group) */}
        {!isMine && (
          <View style={styles.usernameRow}>
            <Text style={[styles.usernameText, { color: usernameColor }]}>
              {username}
            </Text>
            {isOwner && (
              <View style={styles.ownerBadge}>
                <Ionicons name="star" size={9} color="#FBBF24" />
                <Text style={styles.ownerText}>Owner</Text>
              </View>
            )}
          </View>
        )}

        {/* Message text */}
        <Text style={[styles.text, isMine ? styles.myText : styles.theirText]}>
          {item.content}
        </Text>

        {/* Footer: time + read receipt */}
        <View style={styles.footer}>
          <Text
            style={[styles.time, isMine ? styles.myTime : styles.theirTime]}
          >
            {formatTime(item.created_at)}
          </Text>
          {isMine && (
            <Ionicons
              name={isTemp ? "time-outline" : "checkmark-done"}
              size={13}
              color={
                isTemp ? "rgba(255,255,255,0.35)" : "rgba(255,255,255,0.85)"
              }
            />
          )}
        </View>
      </View>

      {/* ── Bubble Tail ──
          A small triangle that visually "points" the bubble toward the sender.
          My messages: right side tail
          Their messages: left side tail
      */}
      {isMine ? (
        <View style={styles.myTail} />
      ) : (
        <View style={styles.theirTail} />
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  // ── Wrapper ──
  wrapper: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingVertical: 3,
    paddingHorizontal: 14,
    position: "relative",
  },
  myWrapper: {
    justifyContent: "flex-end",
  },
  theirWrapper: {
    justifyContent: "flex-start",
  },
  selectedWrapper: {
    backgroundColor: COLORS.selectionBg,
    borderRadius: 12,
  },
  tempWrapper: {
    opacity: 0.65,
  },

  // ── Checkbox ──
  checkboxContainer: {
    marginRight: 10,
    justifyContent: "center",
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: COLORS.textMuted,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "transparent",
  },
  checkboxSelected: {
    backgroundColor: COLORS.accent,
    borderColor: COLORS.accent,
  },

  // ── Bubble ──
  bubble: {
    maxWidth: "76%",
    paddingHorizontal: 13,
    paddingTop: 8,
    paddingBottom: 6,
    borderRadius: 18,
    minWidth: 80,
  },
  myBubble: {
    backgroundColor: COLORS.myBubble,
    borderBottomRightRadius: 4, // Flattened corner where tail attaches
    marginRight: 6, // space for tail
  },
  theirBubble: {
    backgroundColor: COLORS.theirBubble,
    borderWidth: 1,
    borderColor: COLORS.theirBubbleBorder,
    borderBottomLeftRadius: 4, // Flattened corner where tail attaches
    marginLeft: 6, // space for tail
  },
  myBubbleSelected: {
    backgroundColor: "#5A52E0",
  },
  theirBubbleSelected: {
    backgroundColor: "#252535",
  },

  // ── Bubble Tails ──
  // Triangle pointing right for my messages
  myTail: {
    position: "absolute",
    right: 10,
    bottom: 3,
    width: 0,
    height: 0,
    borderTopWidth: 6,
    borderTopColor: "transparent",
    borderLeftWidth: 8,
    borderLeftColor: COLORS.myBubble,
    borderBottomWidth: 0,
  },
  // Triangle pointing left for their messages
  theirTail: {
    position: "absolute",
    left: 10,
    bottom: 3,
    width: 0,
    height: 0,
    borderTopWidth: 6,
    borderTopColor: "transparent",
    borderRightWidth: 8,
    borderRightColor: COLORS.theirBubble,
    borderBottomWidth: 0,
  },

  // ── Username ──
  usernameRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 3,
    gap: 6,
  },
  usernameText: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.1,
  },
  ownerBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    backgroundColor: "rgba(251, 191, 36, 0.12)",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  ownerText: {
    fontSize: 10,
    color: "#FBBF24",
    fontWeight: "700",
  },

  // ── Text ──
  text: {
    fontSize: 15,
    lineHeight: 21,
  },
  myText: {
    color: COLORS.white,
  },
  theirText: {
    color: COLORS.textPrimary,
  },

  // ── Footer ──
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    marginTop: 4,
    gap: 4,
  },
  time: {
    fontSize: 10,
    letterSpacing: 0.2,
  },
  myTime: {
    color: "rgba(255,255,255,0.55)",
  },
  theirTime: {
    color: COLORS.textMuted,
  },

  // ── System Message ──
  systemContainer: {
    alignItems: "center",
    marginVertical: 10,
    width: "100%",
  },
  systemBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.systemBg,
    borderWidth: 1,
    borderColor: COLORS.systemBorder,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
  },
  systemText: {
    fontSize: 12,
    color: COLORS.textMuted,
    fontStyle: "italic",
  },
});
