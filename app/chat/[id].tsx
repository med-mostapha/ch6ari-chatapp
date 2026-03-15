import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Alert,
  AppState,
  FlatList,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// Components
import { MessageBubble } from "@/components/MessageBubble";
import { RoomDetailsModal } from "@/components/RoomDetailsModal";
import { ChatHeader } from "@/components/chat/ChatHeader";
import { ChatInput } from "@/components/chat/ChatInput";
import { ReactionPicker } from "@/components/chat/ReactionPicker";

// Services & Context
import { useAuth } from "@/context/AuthContext";
import {
  addReaction,
  deleteMessages,
  getReactions,
  markMessagesAsRead,
  removeReaction,
  sendMessage,
} from "@/services/chat";
import { supabase } from "@/services/supabaseClient";

const COLORS = {
  bg: "#0A0A0F",
  surface: "#13131A",
  border: "#2A2A3D",
  accent: "#6C63FF",
  textMuted: "#5A5A72",
};

// ── Types ─────────────────────────────────────────────────────────────────────
interface Reaction {
  id: string;
  emoji: string;
  user_id: string;
}

function getDateLabel(dateStr: string): string {
  const date = new Date(dateStr);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  if (date.toDateString() === today.toDateString()) return "Today";
  if (date.toDateString() === yesterday.toDateString()) return "Yesterday";
  return date.toLocaleDateString([], {
    weekday: "long",
    month: "short",
    day: "numeric",
  });
}

function DateSeparator({ label }: { label: string }) {
  return (
    <View style={sepStyles.container}>
      <View style={sepStyles.line} />
      <Text style={sepStyles.label}>{label}</Text>
      <View style={sepStyles.line} />
    </View>
  );
}

const sepStyles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 14,
    paddingHorizontal: 20,
    gap: 10,
  },
  line: { flex: 1, height: 1, backgroundColor: COLORS.border },
  label: {
    fontSize: 11,
    fontWeight: "600",
    color: COLORS.textMuted,
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
});

export default function ChatDetailScreen() {
  const { id } = useLocalSearchParams();
  const roomId = Array.isArray(id) ? id[0] : (id as string);
  const { session } = useAuth();
  const router = useRouter();
  const flatListRef = useRef<FlatList>(null);

  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [selectionMode, setSelectionMode] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [roomOwner, setRoomOwner] = useState<string | null>(null);
  const [detailsVisible, setDetailsVisible] = useState(false);
  const [roomTitle, setRoomTitle] = useState("Loading...");

  // Reactions state
  const [reactions, setReactions] = useState<Record<string, Reaction[]>>({});
  const [pickerVisible, setPickerVisible] = useState(false);
  const [activeMessageId, setActiveMessageId] = useState<string | null>(null);

  useEffect(() => {
    if (!id || !session?.user?.id) return;

    const initializeChat = async () => {
      await fetchRoomDetails();
      await fetchMessages();
      await markMessagesAsRead(roomId as string, session.user.id);
    };

    initializeChat();

    const channel = supabase
      .channel(`room-events-${id}`, { config: { broadcast: { self: true } } })
      .on("broadcast", { event: "user-kicked" }, (payload) => {
        if (payload.payload.userId === session.user.id) {
          Alert.alert("Notice", "You have been removed from this chat.");
          router.replace("/chats");
        }
      })
      .on(
        "postgres_changes",
        {
          event: "DELETE",
          schema: "public",
          table: "rooms",
          filter: `id=eq.${roomId}`,
        },
        () => {
          Alert.alert("Notice", "This chat has been deleted by the owner.");
          router.replace("/chats");
        },
      )
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `room_id=eq.${roomId}`,
        },
        async (payload) => {
          if (payload.new.user_id !== session.user.id) {
            await markMessagesAsRead(id as string, session.user.id);
          }
          const { data: profile } = await supabase
            .from("profiles")
            .select("username")
            .eq("id", payload.new.user_id)
            .single();

          const msgWithProfile = {
            ...payload.new,
            profiles: profile || { username: "User" },
          };

          setMessages((prev) => {
            if (prev.some((m) => m.id === payload.new.id)) return prev;
            return [
              ...prev.filter((m) => !m.id.toString().startsWith("temp-")),
              msgWithProfile,
            ];
          });
          setTimeout(
            () => flatListRef.current?.scrollToEnd({ animated: true }),
            100,
          );
        },
      )
      .on(
        "postgres_changes",
        { event: "DELETE", schema: "public", table: "messages" },
        (payload) => {
          setMessages((prev) => prev.filter((m) => m.id !== payload.old.id));
        },
      )
      //  Realtime reactions
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "reactions" },
        async (payload) => {
          const msgId =
            (payload.new as any)?.message_id ||
            (payload.old as any)?.message_id;
          if (msgId) await fetchReactionsForMessage(msgId);
        },
      )
      .subscribe();

    const appStateSub = AppState.addEventListener("change", (nextAppState) => {
      if (nextAppState === "active") fetchMessages();
    });

    return () => {
      appStateSub.remove();
      supabase.removeChannel(channel);
    };
  }, [id, session?.user?.id]);

  const fetchRoomDetails = async () => {
    const { data } = await supabase
      .from("rooms")
      .select(
        `name, is_group, created_by, room_members (user_id, profiles:user_id (username))`,
      )
      .eq("id", roomId)
      .single();

    if (data) {
      const roomData = data as any;
      setRoomOwner(roomData.created_by);
      if (!roomData.is_group) {
        const otherMember = roomData.room_members?.find(
          (m: any) => m.user_id !== session?.user?.id,
        );
        let otherUsername = "Chat";
        if (otherMember?.profiles) {
          otherUsername = Array.isArray(otherMember.profiles)
            ? otherMember.profiles[0]?.username
            : otherMember.profiles?.username;
        }
        setRoomTitle(otherUsername || "Chat");
      } else {
        setRoomTitle(roomData.name);
      }
    }
  };

  const fetchMessages = async () => {
    try {
      const { data } = await supabase
        .from("messages")
        .select("*, profiles(username)")
        .eq("room_id", roomId)
        .order("created_at", { ascending: true });

      if (data) {
        setMessages(data);
        const ids = data
          .filter((m) => !m.id.toString().startsWith("temp-"))
          .map((m) => m.id);
        if (ids.length > 0) await fetchReactionsForMessages(ids);
      }
      setTimeout(
        () => flatListRef.current?.scrollToEnd({ animated: false }),
        200,
      );
    } catch {
      console.log("Error loading messages");
    }
  };

  const fetchReactionsForMessages = async (messageIds: string[]) => {
    const { data } = await supabase
      .from("reactions")
      .select("id, emoji, user_id, message_id")
      .in("message_id", messageIds);

    if (data) {
      const grouped: Record<string, Reaction[]> = {};
      data.forEach((r: any) => {
        if (!grouped[r.message_id]) grouped[r.message_id] = [];
        grouped[r.message_id].push(r);
      });
      setReactions(grouped);
    }
  };

  const fetchReactionsForMessage = async (messageId: string) => {
    const { data } = await getReactions(messageId);
    if (data) {
      setReactions((prev) => ({
        ...prev,
        [messageId]: data as Reaction[],
      }));
    }
  };

  const handleSend = async () => {
    if (!newMessage.trim() || !session?.user?.id || isSending) return;
    const content = newMessage.trim();
    setNewMessage("");
    setIsSending(true);
    const tempId = `temp-${Date.now()}`;
    setMessages((prev) => [
      ...prev,
      {
        id: tempId,
        content,
        user_id: session.user.id,
        room_id: id,
        created_at: new Date().toISOString(),
        profiles: { username: "You" },
      },
    ]);
    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 50);
    const { error } = await sendMessage(
      roomId as string,
      session.user.id,
      content,
    );
    setIsSending(false);
    if (error) {
      setMessages((prev) => prev.filter((m) => m.id !== tempId));
      setNewMessage(content);
      Alert.alert("Error", "Message not sent.");
    }
  };

  const handleLongPress = (messageId: string, isMine: boolean) => {
    if (!isMine) return;
    setSelectionMode(true);
    setSelectedIds([messageId]);
  };

  const handlePress = (messageId: string, isMine: boolean) => {
    if (selectionMode && isMine) {
      setSelectedIds((prev) =>
        prev.includes(messageId)
          ? prev.filter((i) => i !== messageId)
          : [...prev, messageId],
      );
    }
  };

  const confirmDelete = () => {
    Alert.alert(
      "Delete Messages",
      `Delete ${selectedIds.length} message${selectedIds.length > 1 ? "s" : ""}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            const { error } = await deleteMessages(selectedIds);
            if (!error) {
              setSelectionMode(false);
              setSelectedIds([]);
            }
          },
        },
      ],
    );
  };

  const handleReactionPress = useCallback((messageId: string) => {
    setActiveMessageId(messageId);
    setPickerVisible(true);
  }, []);

  const handleReactionToggle = useCallback(
    async (messageId: string, emoji: string) => {
      if (!session?.user?.id) return;
      const existing = reactions[messageId] ?? [];
      const myReaction = existing.find(
        (r) => r.user_id === session.user.id && r.emoji === emoji,
      );
      if (myReaction) {
        await removeReaction(messageId, session.user.id, emoji);
      } else {
        await addReaction(messageId, session.user.id, emoji);
      }
      await fetchReactionsForMessage(messageId);
    },
    [reactions, session?.user?.id],
  );

  const handleSelectEmoji = useCallback(
    async (emoji: string) => {
      if (!activeMessageId || !session?.user?.id) return;
      await handleReactionToggle(activeMessageId, emoji);
    },
    [activeMessageId, handleReactionToggle],
  );

  const messagesWithSeparators = React.useMemo(() => {
    const result: any[] = [];
    let lastDateLabel = "";
    for (const msg of messages) {
      const label = getDateLabel(msg.created_at);
      if (label !== lastDateLabel) {
        result.push({ id: `sep-${msg.created_at}`, type: "separator", label });
        lastDateLabel = label;
      }
      result.push(msg);
    }
    return result;
  }, [messages]);

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <ChatHeader
        title={roomTitle}
        selectionMode={selectionMode}
        selectedCount={selectedIds.length}
        isOwner={roomOwner === session?.user?.id}
        onDeletePress={confirmDelete}
        onDetailsPress={() => setDetailsVisible(true)}
        onAddUserPress={() =>
          router.push({ pathname: "/new-chat", params: { roomId: id } })
        }
      />

      <FlatList
        ref={flatListRef}
        data={messagesWithSeparators}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        progressViewOffset={10}
        renderItem={({ item }) => {
          if (item.type === "separator") {
            return <DateSeparator label={item.label} />;
          }
          return (
            <MessageBubble
              item={item}
              isMine={item.user_id === session?.user?.id}
              isSelected={selectedIds.includes(item.id)}
              selectionMode={selectionMode}
              isOwner={item.user_id === roomOwner}
              reactions={reactions[item.id] ?? []}
              currentUserId={session?.user?.id!}
              onLongPress={() =>
                handleLongPress(item.id, item.user_id === session?.user?.id)
              }
              onPress={() =>
                handlePress(item.id, item.user_id === session?.user?.id)
              }
              onReactionPress={handleReactionPress}
              onReactionToggle={handleReactionToggle}
              formatTime={(d) =>
                new Date(d).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })
              }
            />
          );
        }}
      />

      {!selectionMode && (
        <ChatInput
          value={newMessage}
          onChangeText={setNewMessage}
          onSend={handleSend}
          disabled={isSending}
        />
      )}

      {/*  Reaction Picker */}
      <ReactionPicker
        visible={pickerVisible}
        onClose={() => setPickerVisible(false)}
        onSelectEmoji={handleSelectEmoji}
        selectedEmojis={
          activeMessageId
            ? (reactions[activeMessageId] ?? [])
                .filter((r) => r.user_id === session?.user?.id)
                .map((r) => r.emoji)
            : []
        }
      />

      <RoomDetailsModal
        visible={detailsVisible}
        onClose={() => setDetailsVisible(false)}
        roomId={id as string}
        currentUserId={session?.user?.id!}
        roomOwnerId={roomOwner!}
        onRoomDeleted={() => router.replace("/chats")}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  listContent: { paddingVertical: 12, paddingHorizontal: 2 },
});
