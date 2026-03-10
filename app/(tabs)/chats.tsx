import { ChatItem } from "@/components/ChatItem";
import { useAuth } from "@/context/AuthContext";
import { deleteRoom, getUserRooms } from "@/services/chat";
import { supabase } from "@/services/supabaseClient";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
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
    messages: {
      content: string;
      created_at: string;
    }[];
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

  useEffect(() => {
    fetchRooms();

    const channel = supabase
      .channel("schema-db-changes")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages" },
        () => {
          fetchRooms();
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [session?.user?.id]);

  const confirmDeleteRoom = (roomId: string, roomName: string) => {
    Alert.alert(
      "Delete Chat",
      `Are you sure you want to delete the chat with ${roomName}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            const { error } = await deleteRoom(roomId);
            if (error) Alert.alert("Error", "Failed to delete room");
            else fetchRooms();
          },
        },
      ],
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Messages</Text>
        <TouchableOpacity onPress={() => router.push("/new-chat")}>
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
        renderItem={({ item }) => {
          const lastMsg = item.rooms?.messages?.[0];

          return (
            <ChatItem
              name={item.rooms?.name || "Group"}
              lastMessage={lastMsg?.content || "No messages yet"}
              time={
                lastMsg
                  ? new Date(lastMsg.created_at).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : ""
              }
              onPress={() => router.push(`/chat/${item.room_id}`)}
              onLongPress={() =>
                confirmDeleteRoom(item.room_id, item.rooms?.name)
              }
            />
          );
        }}
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
