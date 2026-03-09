import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface MessageBubbleProps {
  item: any;
  isMine: boolean;
  isSelected: boolean;
  onLongPress: () => void;
  onPress: () => void;
  selectionMode: boolean;
  formatTime: (date: string) => string;
}

export const MessageBubble = ({
  item,
  isMine,
  isSelected,
  onLongPress,
  onPress,
  selectionMode,
  formatTime,
}: MessageBubbleProps) => {
  const isTemp = item.id.toString().startsWith("temp-");

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onLongPress={onLongPress}
      onPress={onPress}
      style={[
        styles.wrapper,
        isMine ? styles.myWrapper : styles.theirWrapper,
        isSelected && styles.selectedWrapper,
      ]}
    >
      {selectionMode && (
        <Ionicons
          name={isSelected ? "checkbox" : "square-outline"}
          size={20}
          color="#2563EB"
          style={styles.checkIcon}
        />
      )}
      <View
        style={[styles.bubble, isMine ? styles.myBubble : styles.theirBubble]}
      >
        <Text style={[styles.text, isMine ? styles.myText : styles.theirText]}>
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
              size={14}
              color={isTemp ? "rgba(255,255,255,0.5)" : "#fff"}
            />
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  myWrapper: { justifyContent: "flex-end" },
  theirWrapper: { justifyContent: "flex-start" },
  selectedWrapper: { backgroundColor: "rgba(37, 99, 235, 0.1)" },
  checkIcon: { marginRight: 10 },
  bubble: {
    maxWidth: "75%",
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 4,
    borderRadius: 18,
    minWidth: 80,
  },
  myBubble: { backgroundColor: "#2563EB", borderBottomRightRadius: 4 },
  theirBubble: { backgroundColor: "#b3b3b3", borderBottomLeftRadius: 4 },
  text: { fontSize: 16 },
  myText: { color: "#fff" },
  theirText: { color: "#111827" },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    marginTop: 2,
  },
  time: { fontSize: 10, marginRight: 4 },
  myTime: { color: "rgba(255,255,255,0.7)" },
  theirTime: { color: "#9CA3AF" },
});
