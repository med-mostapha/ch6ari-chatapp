import { ChatItem } from "@/components/ChatItem";
import { useAuth } from "@/context/AuthContext";
import { createTestChat, getUserRooms } from "@/services/chat";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
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
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (session?.user?.id) {
      fetchRooms();
    }
  }, [session?.user?.id]);

  const fetchRooms = async () => {
    if (!session?.user?.id) return;
    setLoading(true);
    const { data, error } = await getUserRooms(session.user.id);
    setLoading(false);

    if (data) {
      setRooms(data as any);
    }
  };

  const handleCreateTest = async () => {
    if (!session?.user?.id) return;

    const { error } = await createTestChat(session.user.id, "Test User");
    if (error) {
      console.log("Error creating test chat:", error);
    } else {
      fetchRooms();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Messages</Text>
        <TouchableOpacity onPress={handleCreateTest}>
          <Ionicons name="create-outline" size={26} color="#2563EB" />
        </TouchableOpacity>
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
        keyExtractor={(item) => item.room_id}
        refreshing={loading}
        onRefresh={fetchRooms}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No messages yet</Text>
          </View>
        }
        renderItem={({ item }) => (
          <ChatItem
            name={item.rooms?.name || "Group"}
            lastMessage="Tap to open conversation"
            time="Now"
            onPress={() => router.push(`/chat/${item.room_id}`)}
          />
        )}
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
