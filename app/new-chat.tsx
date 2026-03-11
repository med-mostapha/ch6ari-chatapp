import { useAuth } from "@/context/AuthContext";
import {
  createRoom,
  inviteUserToRoom,
  searchUsers,
  startNewChat,
} from "@/services/chat";
import { supabase } from "@/services/supabaseClient";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function NewChatScreen() {
  const { roomId } = useLocalSearchParams();
  const { session } = useAuth();
  const router = useRouter();

  const [query, setQuery] = useState("");
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [currentUsername, setCurrentUsername] = useState("");

  useEffect(() => {
    const getProfile = async () => {
      const { data } = await supabase
        .from("profiles")
        .select("username")
        .eq("id", session?.user?.id)
        .single();
      if (data) setCurrentUsername(data.username);
    };
    getProfile();
  }, [session]);

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

  const handleAction = async (targetUser: any) => {
    if (!session?.user?.id) return;

    setLoading(true);

    if (roomId) {
      const { error } = await inviteUserToRoom(
        roomId as string,
        targetUser.id,
        session.user.id,
        currentUsername,
        targetUser.username,
      );
      setLoading(false);

      if (error) {
        Alert.alert("Notice", "Failed to add member");
      } else {
        router.back();
      }
    } else {
      const { data, error } = await startNewChat(
        session.user.id,
        targetUser.id,
        targetUser.username,
      );
      setLoading(false);
      if (data) router.replace(`/chat/${data.id}`);
    }
  };

  const handleCreateGroup = async () => {
    if (!groupName.trim() || !session?.user?.id) return;
    setLoading(true);
    const { data, error } = await createRoom(groupName.trim(), session.user.id);

    if (data && !error) {
      await supabase.from("messages").insert([
        {
          room_id: data.id,
          user_id: session.user.id,
          content: `${currentUsername} created the group "${groupName.trim()}"`,
          type: "system",
        },
      ]);

      setLoading(false);
      setModalVisible(false);
      router.replace(`/chat/${data.id}`);
    } else {
      setLoading(false);
      Alert.alert("Error", "Could not create group");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Modal visible={modalVisible} animationType="fade" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>New Group</Text>
            <TextInput
              placeholder="Enter group name..."
              style={styles.modalInput}
              value={groupName}
              onChangeText={setGroupName}
              autoFocus
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                style={styles.cancelBtn}
              >
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleCreateGroup}
                style={styles.createBtn}
              >
                <Text style={styles.createText}>Create</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="close" size={28} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.title}>
          {roomId ? "Add Member" : "New Message"}
        </Text>
        <View style={{ width: 28 }} />
      </View>

      <View style={styles.searchBar}>
        <Ionicons name="search" size={20} color="#9CA3AF" />
        <TextInput
          placeholder="Search by name..."
          style={styles.input}
          value={query}
          onChangeText={handleSearch}
        />
      </View>

      <FlatList
        data={users}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={
          !roomId ? (
            <TouchableOpacity
              style={styles.groupOption}
              onPress={() => setModalVisible(true)}
            >
              <View style={styles.groupIcon}>
                <Ionicons name="people" size={24} color="#fff" />
              </View>
              <Text style={styles.groupText}>Create New Group</Text>
            </TouchableOpacity>
          ) : null
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.userItem}
            onPress={() => handleAction(item)}
          >
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{item.username?.[0]}</Text>
            </View>
            <Text style={styles.userName}>{item.username}</Text>
            <Ionicons name="add-circle-outline" size={24} color="#2563EB" />
          </TouchableOpacity>
        )}
      />

      {loading && (
        <ActivityIndicator size="large" style={styles.loader} color="#2563EB" />
      )}
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
  groupOption: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  groupIcon: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    backgroundColor: "#10B981",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  groupText: { fontSize: 16, fontWeight: "600", color: "#10B981" },
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
  loader: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: [{ translateX: -25 }, { translateY: -25 }],
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    width: "80%",
    padding: 20,
    borderRadius: 15,
  },
  modalTitle: { fontSize: 20, fontWeight: "bold", marginBottom: 15 },
  modalInput: {
    backgroundColor: "#F3F4F6",
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
  },
  modalButtons: { flexDirection: "row", justifyContent: "flex-end" },
  cancelBtn: { marginRight: 20, padding: 10 },
  cancelText: { color: "#6B7280", fontWeight: "600" },
  createBtn: {
    backgroundColor: "#2563EB",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  createText: { color: "#fff", fontWeight: "bold" },
});
