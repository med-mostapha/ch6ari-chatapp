import { MessageBubble } from "@/components/MessageBubble";
import { useAuth } from "@/context/AuthContext";
import { deleteMessages, getRoomMessages, sendMessage } from "@/services/chat";
import { supabase } from "@/services/supabaseClient";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ChatDetailScreen() {
  const { id } = useLocalSearchParams();
  const { session } = useAuth();
  const router = useRouter();
  const flatListRef = useRef<FlatList>(null);

  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [selectionMode, setSelectionMode] = useState(false);
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    fetchMessages();

    const channel = supabase
      .channel(`room-${id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `room_id=eq.${id}`,
        },
        (payload) => {
          setMessages((prev) => {
            const exists = prev.some((m) => m.id === payload.new.id);
            if (exists) return prev;
            const filtered = prev.filter(
              (m) =>
                !(
                  m.id.toString().startsWith("temp-") &&
                  m.content === payload.new.content
                ),
            );
            return [...filtered, payload.new];
          });
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

    return () => {
      supabase.removeChannel(channel);
    };
  }, [id]);

  useEffect(() => {
    if (messages.length > 0 && !selectionMode) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  const fetchMessages = async () => {
    try {
      const { data, error } = await getRoomMessages(id as string);
      if (error) throw error;
      if (data) setMessages(data);
    } catch (error) {
      Alert.alert("Error", "Failed to load chat history.");
    }
  };

  const handleSend = async () => {
    if (!newMessage.trim() || !session?.user?.id || isSending) return;

    const content = newMessage.trim();
    setNewMessage("");
    setIsSending(true);

    const tempId = `temp-${Date.now()}`;
    const tempMsg = {
      id: tempId,
      content,
      user_id: session.user.id,
      room_id: id,
      created_at: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, tempMsg]);

    const { error } = await sendMessage(id as string, session.user.id, content);
    setIsSending(false);

    if (error) {
      setMessages((prev) => prev.filter((m) => m.id !== tempId));
      setNewMessage(content);
      Alert.alert("Failed to send", "Please check your connection.");
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
      `Delete ${selectedIds.length} messages for everyone?`,
      [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", style: "destructive", onPress: processDelete },
      ],
    );
  };

  const processDelete = async () => {
    const { error } = await deleteMessages(selectedIds);
    if (error) {
      Alert.alert("Error", "Could not delete messages.");
    } else {
      setSelectionMode(false);
      setSelectedIds([]);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      {/* Dynamic Header */}
      <View style={styles.header}>
        {selectionMode ? (
          <View style={styles.headerContent}>
            <TouchableOpacity
              onPress={() => {
                setSelectionMode(false);
                setSelectedIds([]);
              }}
            >
              <Ionicons name="close" size={26} color="#111827" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>
              {selectedIds.length} Selected
            </Text>
            <TouchableOpacity onPress={confirmDelete}>
              <Ionicons name="trash-outline" size={26} color="#EF4444" />
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.headerContent}>
            <TouchableOpacity onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={26} color="#111827" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Chat Room</Text>
            <View style={{ width: 26 }} />
          </View>
        )}
      </View>

      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => {
          const isMine = item.user_id === session?.user?.id;
          return (
            <MessageBubble
              item={item}
              isMine={isMine}
              isSelected={selectedIds.includes(item.id)}
              selectionMode={selectionMode}
              onLongPress={() => handleLongPress(item.id, isMine)}
              onPress={() => handlePress(item.id, isMine)}
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

      {/* Input Area */}
      {!selectionMode && (
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
        >
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              placeholder="Type a message..."
              value={newMessage}
              onChangeText={setNewMessage}
              multiline
            />
            <TouchableOpacity
              style={[
                styles.sendBtn,
                !newMessage.trim() && styles.sendBtnDisabled,
              ]}
              onPress={handleSend}
              disabled={!newMessage.trim() || isSending}
            >
              <Ionicons name="send" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  header: {
    height: 60,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
    justifyContent: "center",
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 15,
  },
  headerTitle: { fontSize: 18, fontWeight: "700", color: "#111827" },
  listContent: { paddingVertical: 10 },
  inputWrapper: {
    flexDirection: "row",
    padding: 15,
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
    backgroundColor: "#fff",
  },
  input: {
    flex: 1,
    backgroundColor: "#F9FAFB",
    borderRadius: 22,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginRight: 10,
    fontSize: 16,
    maxHeight: 100,
  },
  sendBtn: {
    backgroundColor: "#2563EB",
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
  },
  sendBtnDisabled: { backgroundColor: "#93C5FD" },
});
