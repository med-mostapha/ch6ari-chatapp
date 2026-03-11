import { ChatItem } from "@/components/ChatItem";
import { useAuth } from "@/context/AuthContext";
import { deleteRoom, getUsernameById, getUserRooms } from "@/services/chat";
import { supabase } from "@/services/supabaseClient";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
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
    is_group: boolean;
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

  const fetchRooms = useCallback(async () => {
    if (!session?.user?.id) return;
    setLoading(true);
    const { data } = await getUserRooms(session.user.id);
    setLoading(false);

    if (data) {
      const uniqueRooms = data.filter(
        (v, i, a) => a.findIndex((t) => t.room_id === v.room_id) === i,
      );
      setRooms(uniqueRooms as any);
    }
  }, [session?.user?.id]);

  useEffect(() => {
    if (!session?.user?.id) return;

    fetchRooms();

    const channel = supabase
      .channel("global-sync", {
        config: { broadcast: { self: true } },
      })
      .on("broadcast", { event: "refresh-chats" }, (payload) => {
        if (payload.payload.userId === session.user.id) {
          fetchRooms();
        }
      })
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages" },
        () => fetchRooms(),
      )
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "room_members",
          filter: `user_id=eq.${session.user.id}`,
        },
        () => fetchRooms(),
      )
      // إضافة مستمع لإنشاء الغرف (للمالك)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "rooms",
          filter: `created_by=eq.${session.user.id}`,
        },
        () => fetchRooms(),
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [session?.user?.id, fetchRooms]);

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
            const ownerName = await getUsernameById(session?.user?.id!);
            const { error } = await deleteRoom(roomId, ownerName);
            if (!error) fetchRooms();
          },
        },
      ],
    );
  };

  const filteredRooms = rooms.filter((room) =>
    room.rooms?.name?.toLowerCase().includes(search.toLowerCase()),
  );

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
        data={filteredRooms}
        keyExtractor={(item) => item.room_id}
        refreshing={loading}
        onRefresh={fetchRooms}
        renderItem={({ item }) => {
          const lastMsg = item.rooms?.messages?.[0];
          return (
            <ChatItem
              name={item.rooms?.name || "Group"}
              isGroup={item.rooms?.is_group}
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
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No messages yet</Text>
          </View>
        }
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
