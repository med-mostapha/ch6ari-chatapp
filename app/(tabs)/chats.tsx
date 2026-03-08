import { useAuth } from "@/context/AuthContext";
import { getUserRooms } from "@/services/chat";
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { FlatList, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface RoomData {
  room_id: string;
  rooms: {
    id: string;
    name: string;
    description: string | null;
    created_at: string;
  };
}

export default function ChatsScreen() {
  const [search, setSearch] = useState("");

  const { session } = useAuth();
  const [rooms, setRooms] = useState<RoomData[]>([]);

  // const handleCreateTest = async () => {
  //   if (!session?.user?.id) return;

  //   const { error } = await createTestChat(session.user.id, "Test User");
  //   if (error) {
  //     console.log("Error creating test chat:", error);
  //   } else {
  //     fetchRooms();
  //   }
  // };

  const fetchRooms = async () => {
    const { data, error } = await getUserRooms(session?.user?.id!);
    if (data) setRooms(data as any);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Messages</Text>
        <Ionicons name="create-outline" size={26} color="#2563EB" />
      </View>

      <View style={styles.searchContainer}>
        <Ionicons name="search-outline" size={20} color="#9CA3AF" />
        <TextInput
          placeholder="Search chats..."
          style={styles.searchInput}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      <FlatList
        data={rooms}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No messages yet</Text>
          </View>
        }
        renderItem={null}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFFFFF" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  title: { fontSize: 32, fontWeight: "800", color: "#111827" },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    marginHorizontal: 20,
    paddingHorizontal: 15,
    borderRadius: 12,
    height: 45,
    marginBottom: 20,
  },
  searchInput: { flex: 1, marginLeft: 10, fontSize: 16 },
  emptyContainer: { flex: 1, alignItems: "center", marginTop: 100 },
  emptyText: { color: "#9CA3AF", fontSize: 16 },
});
