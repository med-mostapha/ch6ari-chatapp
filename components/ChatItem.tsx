import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

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
  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      onLongPress={onLongPress}
    >
      <View style={[styles.avatar, isGroup && { backgroundColor: "#10B981" }]}>
        <Text style={styles.avatarText}>
          {isGroup ? (
            <Ionicons name="people" size={24} color="#fff" />
          ) : (
            name.charAt(0).toUpperCase()
          )}
        </Text>
      </View>

      <View style={styles.content}>
        <View style={styles.header}>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Ionicons
              name={isGroup ? "people-outline" : "person-outline"}
              size={16}
              color="#9CA3AF"
              style={{ marginRight: 5 }}
            />
            <Text style={styles.name}>{name}</Text>
          </View>
          <Text style={styles.time}>{time}</Text>
        </View>

        <View style={styles.footer}>
          <Text style={styles.lastMessage} numberOfLines={1}>
            {lastMessage}
          </Text>
          {unreadCount ? (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{unreadCount}</Text>
            </View>
          ) : null}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    padding: 15,
    alignItems: "center",
    backgroundColor: "#fff",
  },
  avatar: {
    width: 55,
    height: 55,
    borderRadius: 27.5,
    backgroundColor: "#2563EB",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: { color: "#fff", fontSize: 20, fontWeight: "bold" },
  content: {
    flex: 1,
    marginLeft: 15,
    borderBottomWidth: 0.5,
    borderBottomColor: "#F3F4F6",
    paddingBottom: 10,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 5,
  },
  name: { fontSize: 16, fontWeight: "700", color: "#111827" },
  time: { fontSize: 12, color: "#9CA3AF" },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  lastMessage: { fontSize: 14, color: "#6B7280", flex: 1, marginRight: 10 },
  badge: {
    backgroundColor: "#2563EB",
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 5,
  },
  badgeText: { color: "#fff", fontSize: 11, fontWeight: "bold" },
});
