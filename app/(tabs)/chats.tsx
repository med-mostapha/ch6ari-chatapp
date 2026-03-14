import { ChatItem } from "@/components/ChatItem";
import { useAuth } from "@/context/AuthContext";
import { deleteRoom, getUsernameById, getUserRooms } from "@/services/chat";
import { supabase } from "@/services/supabaseClient";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import LottieView from "lottie-react-native";
import React, { useCallback, useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const COLORS = {
  bg: "#0A0A0F",
  surface: "#13131A",
  surfaceElevated: "#1C1C27",
  border: "#2A2A3D",
  accent: "#6C63FF",
  textPrimary: "#F1F1F5",
  textSecondary: "#8B8B9E",
  textMuted: "#5A5A72",
  white: "#FFFFFF",
};

interface RoomData {
  room_id: string;
  rooms: {
    id: string;
    name: string;
    is_group: boolean;
    last_message_at: string;
    messages: {
      content: string;
      created_at: string;
      is_read: boolean;
      user_id: string;
    }[];
    room_members: {
      user_id: string;
      profiles: {
        username: string;
      };
    }[];
  };
}

export default function ChatsScreen() {
  const [search, setSearch] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
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
      .channel("global-sync", { config: { broadcast: { self: true } } })
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "rooms" },
        () => fetchRooms(),
      )
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages" },
        () => {
          setTimeout(() => fetchRooms(), 300);
        },
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
      .on("broadcast", { event: "refresh-chats" }, (payload) => {
        if (payload.payload.userId === session.user.id) fetchRooms();
      })
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "messages" },
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
      `Remove your conversation with ${roomName}? This cannot be undone.`,
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

  // Total unread count for the header
  const totalUnread = rooms.reduce((sum, room) => {
    const count =
      room.rooms?.messages?.filter(
        (m) => !m.is_read && m.user_id !== session?.user?.id,
      ).length ?? 0;
    return sum + count;
  }, 0);

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* ── Header ── */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.title}>Messages</Text>
          {totalUnread > 0 && (
            <View style={styles.totalUnreadBadge}>
              <Text style={styles.totalUnreadText}>{totalUnread}</Text>
            </View>
          )}
        </View>

        {/* New Chat Button */}
        <TouchableOpacity
          onPress={() => router.push("/new-chat")}
          style={styles.newChatBtn}
          activeOpacity={0.75}
        >
          <Ionicons name="create-outline" size={20} color={COLORS.accent} />
        </TouchableOpacity>
      </View>

      {/* ── Search Bar ── */}
      <View style={styles.searchWrapper}>
        <View
          style={[
            styles.searchContainer,
            searchFocused && styles.searchContainerFocused,
          ]}
        >
          <Ionicons
            name="search-outline"
            size={17}
            color={searchFocused ? COLORS.accent : COLORS.textMuted}
          />
          <TextInput
            placeholder="Search conversations..."
            placeholderTextColor={COLORS.textMuted}
            style={styles.searchInput}
            value={search}
            onChangeText={setSearch}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
          />
          {search.length > 0 && (
            <Pressable onPress={() => setSearch("")} hitSlop={8}>
              <Ionicons
                name="close-circle"
                size={17}
                color={COLORS.textMuted}
              />
            </Pressable>
          )}
        </View>
      </View>

      {/* ── Chat count label ── */}
      {filteredRooms.length > 0 && (
        <View style={styles.countRow}>
          <Text style={styles.countText}>
            {search
              ? `${filteredRooms.length} result${filteredRooms.length !== 1 ? "s" : ""}`
              : `${filteredRooms.length} conversation${filteredRooms.length !== 1 ? "s" : ""}`}
          </Text>
        </View>
      )}

      {/* ── Chat List ── */}
      <FlatList
        data={filteredRooms}
        keyExtractor={(item) => item.room_id}
        refreshing={loading}
        onRefresh={fetchRooms}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={
          filteredRooms.length === 0 ? styles.emptyListContent : undefined
        }
        renderItem={({ item }) => {
          const sortedMessages = [...(item.rooms?.messages || [])].sort(
            (a, b) =>
              new Date(b.created_at).getTime() -
              new Date(a.created_at).getTime(),
          );
          const lastMsg = sortedMessages[0];

          let displayName = item.rooms?.name;
          if (!item.rooms?.is_group) {
            const otherMember = item.rooms?.room_members?.find(
              (m: any) => m.user_id !== session?.user?.id,
            );
            displayName = otherMember?.profiles?.username || "Unknown";
          }

          const unreadCount = item.rooms?.messages?.filter(
            (m) => !m.is_read && m.user_id !== session?.user?.id,
          ).length;

          return (
            <ChatItem
              name={displayName}
              isGroup={item.rooms?.is_group}
              lastMessage={lastMsg?.content || "No messages yet"}
              unreadCount={unreadCount > 0 ? unreadCount : undefined}
              time={
                item.rooms?.last_message_at
                  ? new Date(item.rooms.last_message_at).toLocaleTimeString(
                      [],
                      {
                        hour: "2-digit",
                        minute: "2-digit",
                      },
                    )
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
            <LottieView
              source={require("../../assets/icons/singing-contract.json")}
              style={styles.emptyLottie as ViewStyle}
              autoPlay
              loop
            />
            <Text style={styles.emptyTitle}>
              {search ? "No results found" : "No conversations yet"}
            </Text>
            <Text style={styles.emptySubtitle}>
              {search
                ? `Nothing matches "${search}"`
                : "Tap the compose button to start your first chat"}
            </Text>
            {!search && (
              <TouchableOpacity
                style={styles.emptyButton}
                onPress={() => router.push("/new-chat")}
                activeOpacity={0.8}
              >
                <Ionicons
                  name="create-outline"
                  size={16}
                  color={COLORS.white}
                />
                <Text style={styles.emptyButtonText}>Start a Chat</Text>
              </TouchableOpacity>
            )}
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },

  // ── Header ──
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 16,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: COLORS.textPrimary,
    letterSpacing: -0.5,
  },
  totalUnreadBadge: {
    backgroundColor: COLORS.accent,
    borderRadius: 10,
    minWidth: 22,
    height: 22,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 6,
    shadowColor: COLORS.accent,
    shadowOpacity: 0.5,
    shadowRadius: 6,
    elevation: 3,
  },
  totalUnreadText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: "700",
  },
  newChatBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    justifyContent: "center",
    alignItems: "center",
  },

  // ── Search ──
  searchWrapper: {
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    paddingHorizontal: 14,
    height: 46,
    gap: 10,
  },
  searchContainerFocused: {
    borderColor: COLORS.accent,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: COLORS.textPrimary,
    paddingVertical: 0,
  },

  // ── Count row ──
  countRow: {
    paddingHorizontal: 20,
    paddingBottom: 8,
  },
  countText: {
    fontSize: 12,
    color: COLORS.textMuted,
    fontWeight: "500",
    letterSpacing: 0.2,
    textTransform: "uppercase",
  },

  // ── Empty state ──
  emptyListContent: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 40,
    paddingTop: 40,
  },
  emptyLottie: {
    width: 180,
    height: 180,
    marginBottom: 8,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.textSecondary,
    textAlign: "center",
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: COLORS.textMuted,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 24,
  },
  emptyButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: COLORS.accent,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    shadowColor: COLORS.accent,
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 4,
  },
  emptyButtonText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: "700",
  },
});
