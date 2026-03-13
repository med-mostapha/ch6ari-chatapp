import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

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

  return (
    <View style={styles.header}>
      <TouchableOpacity onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={26} color="#111827" />
      </TouchableOpacity>

      <TouchableOpacity onPress={onDetailsPress} style={styles.titleContainer}>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {selectionMode ? `${selectedCount} Selected` : title}
        </Text>
      </TouchableOpacity>

      <View style={styles.rightIcons}>
        {selectionMode ? (
          <TouchableOpacity onPress={onDeletePress}>
            <Ionicons name="trash-outline" size={26} color="#EF4444" />
          </TouchableOpacity>
        ) : (
          <>
            {isOwner && (
              <TouchableOpacity onPress={onAddUserPress}>
                <Ionicons name="person-add-outline" size={24} color="#2563EB" />
              </TouchableOpacity>
            )}
            <TouchableOpacity onPress={onDetailsPress}>
              <Ionicons
                name="information-circle-outline"
                size={26}
                color="#111827"
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
    height: 60,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
    backgroundColor: "#fff",
  },
  titleContainer: { flex: 1, marginHorizontal: 15 },
  headerTitle: { fontSize: 18, fontWeight: "700", color: "#111827" },
  rightIcons: { flexDirection: "row", gap: 15, alignItems: "center" },
});
