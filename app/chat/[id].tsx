import { useAuth } from "@/context/AuthContext";
import { getRoomMessages, sendMessage } from "@/services/chat";
import { supabase } from "@/services/supabaseClient";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
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
  const flatListRef = useRef<FlatList>(null);

  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");

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
            // التحقق مما إذا كانت الرسالة موجودة بالفعل (لتجنب التكرار)
            const exists = prev.some((m) => m.id === payload.new.id);
            if (exists) return prev;

            // إذا كان هناك رسالة مؤقتة بنفس المحتوى، نقوم بإزالتها وإضافة الحقيقية
            const updatedList = prev.filter(
              (m) =>
                !(
                  m.id.toString().startsWith("temp-") &&
                  m.content === payload.new.content
                ),
            );

            return [...updatedList, payload.new];
          });
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [id]);

  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  const fetchMessages = async () => {
    const { data } = await getRoomMessages(id as string);
    if (data) setMessages(data);
  };

  const formatMessageTime = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const handleSend = async () => {
    if (!newMessage.trim() || !session?.user?.id) return;

    const content = newMessage.trim();
    setNewMessage("");

    const tempId = `temp-${Date.now()}`;
    const tempMessage = {
      id: tempId,
      content,
      user_id: session.user.id,
      room_id: id,
      created_at: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, tempMessage]);

    const { error } = await sendMessage(id as string, session.user.id, content);

    if (error) {
      console.error("Send error:", error);
      setMessages((prev) => prev.filter((m) => m.id !== tempId));
      setNewMessage(content);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.messagesList}
        renderItem={({ item }) => {
          const isMine = item.user_id === session?.user?.id;
          const isTemp = item.id.toString().startsWith("temp-");

          return (
            <View
              style={[
                styles.messageWrapper,
                isMine ? styles.myWrapper : styles.theirWrapper,
              ]}
            >
              <View
                style={[
                  styles.messageBubble,
                  isMine ? styles.myMessage : styles.theirMessage,
                ]}
              >
                <Text
                  style={[
                    styles.messageText,
                    isMine ? styles.myText : styles.theirText,
                  ]}
                >
                  {item.content}
                </Text>

                <View style={styles.messageFooter}>
                  <Text
                    style={[
                      styles.timeText,
                      isMine ? styles.myTimeText : styles.theirTimeText,
                    ]}
                  >
                    {formatMessageTime(item.created_at)}
                  </Text>
                  {isMine && (
                    <Ionicons
                      name={isTemp ? "time-outline" : "checkmark-done"}
                      size={15}
                      color={isTemp ? "rgba(255,255,255,0.5)" : "#fff"}
                      style={{ marginLeft: 4 }}
                    />
                  )}
                </View>
              </View>
            </View>
          );
        }}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
      >
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Type a message..."
            placeholderTextColor={"#858585"}
            value={newMessage}
            onChangeText={setNewMessage}
            multiline
          />
          <TouchableOpacity style={styles.sendButton} onPress={handleSend}>
            <Ionicons name="send" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  messagesList: { padding: 20 },
  messageWrapper: { width: "100%", flexDirection: "row", marginVertical: 4 },
  myWrapper: { justifyContent: "flex-end" },
  theirWrapper: { justifyContent: "flex-start" },
  messageBubble: {
    maxWidth: "80%",
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 4,
    borderRadius: 18,
    minWidth: 80,
  },
  myMessage: { backgroundColor: "#2563EB", borderBottomRightRadius: 4 },
  theirMessage: { backgroundColor: "#F3F4F6", borderBottomLeftRadius: 4 },
  messageText: { fontSize: 16 },
  myText: { color: "#fff" },
  theirText: { color: "#111827" },
  messageFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    marginTop: 2,
  },
  timeText: { fontSize: 10 },
  myTimeText: { color: "rgba(255, 255, 255, 0.7)" },
  theirTimeText: { color: "#9CA3AF" },
  inputContainer: {
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
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginRight: 10,
    fontSize: 16,
    maxHeight: 100,
  },
  sendButton: {
    backgroundColor: "#2563EB",
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
});
