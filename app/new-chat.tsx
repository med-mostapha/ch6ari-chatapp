import { useAuth } from "@/context/AuthContext";
import { searchUsers, startNewChat } from "@/services/chat";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function NewChatScreen() {
  const [query, setQuery] = useState("");
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const { session } = useAuth();
  const router = useRouter();

  const handleSearch = async (text: string) => {
    setQuery(text);
    if (text.length < 2) {
      setUsers([]);
      return;
    }
    setLoading(true);
    const { data } = await searchUsers(text, session?.user?.id!);
    if (data) setUsers(data);
    setLoading(false);
  };

  const handleCreateChat = async (targetUser: any) => {
    if (!session?.user?.id) return;

    setLoading(true);
    const { data, error } = await startNewChat(
      session.user.id,
      targetUser.id,
      targetUser.full_name,
    );
    setLoading(false);

    if (data) {
      router.replace(`/chat/${data.id}`);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="close" size={28} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.title}>New Message</Text>
        <View style={{ width: 28 }} />
      </View>

      <View style={styles.searchBar}>
        <Ionicons name="search" size={20} color="#9CA3AF" />
        <TextInput
          placeholder="Search by name..."
          style={styles.input}
          value={query}
          onChangeText={handleSearch}
          autoFocus
        />
      </View>

      {loading && (
        <ActivityIndicator style={{ marginTop: 20 }} color="#2563EB" />
      )}

      <FlatList
        data={users}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.userItem}
            onPress={() => handleCreateChat(item)}
          >
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{item.full_name?.[0]}</Text>
            </View>
            <Text style={styles.userName}>{item.full_name}</Text>
            <Ionicons name="chevron-forward" size={20} color="#D1D5DB" />
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 20,
  },
  title: { fontSize: 18, fontWeight: "700" },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    margin: 20,
    padding: 12,
    borderRadius: 12,
  },
  input: { flex: 1, marginLeft: 10, fontSize: 16 },
  userItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  avatar: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    backgroundColor: "#2563EB",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  avatarText: { color: "#fff", fontSize: 18, fontWeight: "bold" },
  userName: { flex: 1, fontSize: 16, fontWeight: "500" },
});
