import { Ionicons } from "@expo/vector-icons";
import SimpleLineIcons from "@expo/vector-icons/SimpleLineIcons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
const COLORS = {
  bg: "#0A0A0F",
  myBubble: "#6C63FF",
  theirBubble: "#1C1C27",
  theirBubbleBorder: "#2A2A3D",
  accent: "#6C63FF",
  textPrimary: "#F1F1F5",
  textMuted: "#5A5A72",
  white: "#FFFFFF",
  selectionBg: "rgba(108, 99, 255, 0.12)",
  systemBg: "rgba(255,255,255,0.03)",
  systemBorder: "#1E1E2D",
};

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

interface Reaction {
  id: string;
  emoji: string;
  user_id: string;
}

interface MessageBubbleProps {
  item: any;
  isMine: boolean;
  isSelected: boolean;
  onLongPress: () => void;
  onPress: () => void;
  onReactionPress: (messageId: string) => void;
  onReactionToggle: (messageId: string, emoji: string) => void;
  selectionMode: boolean;
  formatTime: (date: string) => string;
  isOwner: boolean;
  reactions: Reaction[];
  currentUserId: string;
}

export const MessageBubble = ({
  item,
  isMine,
  isSelected,
  onLongPress,
  onPress,
  onReactionPress,
  onReactionToggle,
  selectionMode,
  formatTime,
  isOwner,
  reactions = [],
  currentUserId,
}: MessageBubbleProps) => {
  const isTemp = item.id.toString().startsWith("temp-");
  const username = item.profiles?.username || "User";
  const usernameColor = getUsernameColor(username);

  const groupedReactions = reactions.reduce(
    (acc: Record<string, Reaction[]>, r) => {
      if (!acc[r.emoji]) acc[r.emoji] = [];
      acc[r.emoji].push(r);
      return acc;
    },
    {},
  );

  // ── System Message
  if (item.type === "system") {
    return (
      <View style={styles.systemContainer}>
        <View style={styles.systemBadge}>
          <Ionicons
            name="information-circle-outline"
            size={11}
            color={COLORS.textMuted}
            style={{ marginRight: 4 }}
          />
          <Text style={styles.systemText} numberOfLines={2}>
            {item.content}
          </Text>
        </View>
      </View>
    );
  }

  // ── Normal Message
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

      <View
        style={[
          styles.bubbleOuter,
          isMine ? styles.bubbleOuterMine : styles.bubbleOuterTheirs,
        ]}
      >
        {/* Bubble */}
        <View
          style={[
            styles.bubble,
            isMine ? styles.myBubble : styles.theirBubble,
            isSelected &&
              (isMine ? styles.myBubbleSelected : styles.theirBubbleSelected),
          ]}
        >
          {/* Username */}
          {!isMine && (
            <View style={styles.usernameRow}>
              <Text
                style={[styles.usernameText, { color: usernameColor }]}
                numberOfLines={1}
              >
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

          <Text
            style={[styles.text, isMine ? styles.myText : styles.theirText]}
          >
            {item.content}
          </Text>

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

        {Object.keys(groupedReactions).length > 0 && (
          <View
            style={[
              styles.reactionsRow,
              isMine ? styles.reactionsRowMine : styles.reactionsRowTheirs,
            ]}
          >
            {Object.entries(groupedReactions).map(([emoji, users]) => {
              const iReacted = users.some((r) => r.user_id === currentUserId);
              return (
                <TouchableOpacity
                  key={emoji}
                  style={[
                    styles.reactionChip,
                    iReacted && styles.reactionChipActive,
                  ]}
                  onPress={() => onReactionToggle(item.id, emoji)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.reactionEmoji}>{emoji}</Text>
                  <Text
                    style={[
                      styles.reactionCount,
                      iReacted && styles.reactionCountActive,
                    ]}
                  >
                    {users.length}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {!selectionMode && (
          <TouchableOpacity
            style={[
              styles.reactionBtn,
              isMine ? styles.reactionBtnMine : styles.reactionBtnTheirs,
            ]}
            onPress={() => onReactionPress(item.id)}
            activeOpacity={0.7}
          >
            <Text style={styles.reactionBtnText}>
              <SimpleLineIcons
                name="like"
                size={12}
                color="hsla(0, 0%, 100%, 0.25)"
              />
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {isMine ? (
        <View style={styles.myTail} />
      ) : (
        <View style={styles.theirTail} />
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingVertical: 3,
    paddingHorizontal: 14,
  },
  myWrapper: { justifyContent: "flex-end" },
  theirWrapper: { justifyContent: "flex-start" },
  selectedWrapper: { backgroundColor: COLORS.selectionBg, borderRadius: 12 },
  tempWrapper: { opacity: 0.65 },

  checkboxContainer: { marginRight: 10, justifyContent: "center" },
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

  bubbleOuter: {
    position: "relative",
  },
  bubbleOuterMine: {
    paddingLeft: 30,
    alignItems: "flex-end",
  },
  bubbleOuterTheirs: {
    paddingRight: 30,
    alignItems: "flex-start",
  },

  reactionBtn: {
    position: "absolute",
    bottom: 6,
    width: 26,
    height: 26,
    borderRadius: 13,
    justifyContent: "center",
    alignItems: "center",
  },
  reactionBtnMine: {
    left: 0,
  },
  reactionBtnTheirs: {
    right: 0,
  },
  reactionBtnText: { fontSize: 18 },

  bubble: {
    maxWidth: "100%",
    paddingHorizontal: 13,
    paddingTop: 8,
    paddingBottom: 6,
    borderRadius: 18,
    minWidth: 80,
  },
  myBubble: {
    backgroundColor: COLORS.myBubble,
    borderBottomRightRadius: 4,
    marginRight: 6,
  },
  theirBubble: {
    backgroundColor: COLORS.theirBubble,
    borderWidth: 1,
    borderColor: COLORS.theirBubbleBorder,
    borderBottomLeftRadius: 4,
    marginLeft: 6,
  },
  myBubbleSelected: { backgroundColor: "#5A52E0" },
  theirBubbleSelected: { backgroundColor: "#252535" },

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
    flexShrink: 1,
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
  ownerText: { fontSize: 10, color: "#FBBF24", fontWeight: "700" },

  text: { fontSize: 15, lineHeight: 21 },
  myText: { color: COLORS.white },
  theirText: { color: COLORS.textPrimary },

  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    marginTop: 4,
    gap: 4,
  },
  time: { fontSize: 10, letterSpacing: 0.2 },
  myTime: { color: "rgba(255,255,255,0.55)" },
  theirTime: { color: COLORS.textMuted },

  reactionsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 4,
    marginTop: 4,
    marginHorizontal: 6,
  },
  reactionsRowMine: { justifyContent: "flex-end" },
  reactionsRowTheirs: { justifyContent: "flex-start" },
  reactionChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    backgroundColor: "rgba(255,255,255,0.07)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  reactionChipActive: {
    backgroundColor: "rgba(108, 99, 255, 0.2)",
    borderColor: "#6C63FF",
  },
  reactionEmoji: { fontSize: 14 },
  reactionCount: { fontSize: 12, color: COLORS.textMuted, fontWeight: "600" },
  reactionCountActive: { color: "#6C63FF" },

  systemContainer: {
    alignItems: "center",
    marginVertical: 8,
    paddingHorizontal: 20,
  },
  systemBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.systemBg,
    borderWidth: 1,
    borderColor: COLORS.systemBorder,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    maxWidth: "90%",
  },
  systemText: {
    fontSize: 11,
    color: "#4A4A62",
    fontStyle: "italic",
    flexShrink: 1,
  },
});
