import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { Alert, AppState, FlatList, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// Components
import { MessageBubble } from "@/components/MessageBubble";
import { RoomDetailsModal } from "@/components/RoomDetailsModal";
import { ChatHeader } from "@/components/chat/ChatHeader";
import { ChatInput } from "@/components/chat/ChatInput";

// Services & Context
import { useAuth } from "@/context/AuthContext";
import {
  deleteMessages,
  markMessagesAsRead,
  sendMessage,
} from "@/services/chat";
import { supabase } from "@/services/supabaseClient";

export default function ChatDetailScreen() {
  const { id } = useLocalSearchParams();
  const { session } = useAuth();
  const router = useRouter();
  const flatListRef = useRef<FlatList>(null);

  // State
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [selectionMode, setSelectionMode] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [roomOwner, setRoomOwner] = useState<string | null>(null);
  const [detailsVisible, setDetailsVisible] = useState(false);
  const [roomTitle, setRoomTitle] = useState("Loading...");

  useEffect(() => {
    if (!id || !session?.user?.id) return;

    const initializeChat = async () => {
      await fetchRoomDetails();
      await fetchMessages();
      await markMessagesAsRead(id as string, session.user.id);
    };

    initializeChat();

    // Realtime Subscriptions
    const channel = supabase
      .channel(`room-events-${id}`, {
        config: { broadcast: { self: true } },
      })
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
          filter: `id=eq.${id}`,
        },
        () => {
          Alert.alert("Notice", "This chat has been deleted by the owner.");
          router.replace("/chats");
        },
      )
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages" },
        async (payload) => {
          if (payload.new.room_id !== id) return;

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
    const { data, error } = await supabase
      .from("rooms")
      .select(
        `
        name, 
        is_group, 
        created_by,
        room_members (
          user_id,
          profiles:user_id (username)
        )
      `,
      )
      .eq("id", id)
      .single();

    if (data) {
      const roomData = data as any; // استخدام any هنا يحل مشكلة الـ 'never' فوراً
      setRoomOwner(roomData.created_by);

      if (!roomData.is_group) {
        // البحث عن العضو الآخر
        const otherMember = roomData.room_members?.find(
          (m: any) => m.user_id !== session?.user?.id,
        );

        // استخراج الاسم مع مراعاة احتمال كونه مصفوفة أو كائن
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
      const { data, error } = await supabase
        .from("messages")
        .select("*, profiles(username)")
        .eq("room_id", id)
        .order("created_at", { ascending: true });

      if (data) setMessages(data);
      setTimeout(
        () => flatListRef.current?.scrollToEnd({ animated: false }),
        200,
      );
    } catch (error) {
      console.log("Error loading messages");
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

    const { error } = await sendMessage(id as string, session.user.id, content);
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
    Alert.alert("Delete", `Delete ${selectedIds.length} messages?`, [
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
    ]);
  };

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
        data={messages}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <MessageBubble
            item={item}
            isMine={item.user_id === session?.user?.id}
            isSelected={selectedIds.includes(item.id)}
            selectionMode={selectionMode}
            isOwner={item.user_id === roomOwner}
            onLongPress={() =>
              handleLongPress(item.id, item.user_id === session?.user?.id)
            }
            onPress={() =>
              handlePress(item.id, item.user_id === session?.user?.id)
            }
            formatTime={(d) =>
              new Date(d).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })
            }
          />
        )}
      />

      {!selectionMode && (
        <ChatInput
          value={newMessage}
          onChangeText={setNewMessage}
          onSend={handleSend}
          disabled={isSending}
        />
      )}

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
  container: { flex: 1, backgroundColor: "#fff" },
  listContent: { paddingVertical: 10, paddingHorizontal: 5 },
});
