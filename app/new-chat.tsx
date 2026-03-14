/**
 * app/new-chat.tsx
 * Fix: Modal backdrop was overlapping the card using absoluteFill.
 * Solution: The Pressable IS the overlay — nested Pressable on the
 * card uses e.stopPropagation() to prevent taps inside from closing it.
 */

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
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const COLORS = {
  bg: "#0A0A0F",
  surface: "#13131A",
  inputBg: "#1C1C27",
  border: "#2A2A3D",
  accent: "#6C63FF",
  accentDim: "rgba(108, 99, 255, 0.15)",
  textPrimary: "#F1F1F5",
  textSecondary: "#8B8B9E",
  textMuted: "#5A5A72",
  white: "#FFFFFF",
  success: "#34D399",
};

const AVATAR_COLORS = [
  "#6C63FF",
  "#EF4444",
  "#F59E0B",
  "#10B981",
  "#3B82F6",
  "#EC4899",
  "#8B5CF6",
  "#06B6D4",
];

function getAvatarColor(name: string): string {
  if (!name) return AVATAR_COLORS[0];
  return AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length];
}

export default function NewChatScreen() {
  const { roomId } = useLocalSearchParams();
  const { session } = useAuth();
  const router = useRouter();

  const [query, setQuery] = useState("");
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [currentUsername, setCurrentUsername] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);

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
    setActionLoading(targetUser.id);
    if (roomId) {
      const { error } = await inviteUserToRoom(
        roomId as string,
        targetUser.id,
        session.user.id,
        currentUsername,
        targetUser.username,
      );
      setActionLoading(null);
      if (error) Alert.alert("Notice", "Failed to add member");
      else router.back();
    } else {
      const { data } = await startNewChat(
        session.user.id,
        targetUser.id,
        targetUser.username,
      );
      setActionLoading(null);
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
      setGroupName("");
      router.replace(`/chat/${data.id}`);
    } else {
      setLoading(false);
      Alert.alert("Error", "Could not create group");
    }
  };

  const closeModal = () => {
    setModalVisible(false);
    setGroupName("");
  };

  const isAddMode = !!roomId;

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* ────────────────────────────────────────────────────
          ✅ FIXED MODAL
          Pattern:
            <Pressable overlay onPress=close>      ← dark bg, closes on tap outside
              <Pressable card onPress=stopProp>    ← the card, blocks event bubbling
                ...content...
              </Pressable>
            </Pressable>
      ──────────────────────────────────────────────────── */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        statusBarTranslucent
      >
        <Pressable style={styles.modalOverlay} onPress={closeModal}>
          {/* Card — stopPropagation prevents taps here from reaching the overlay */}
          <Pressable
            style={styles.modalCard}
            onPress={(e) => e.stopPropagation()}
          >
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>New Group</Text>
            <Text style={styles.modalSubtitle}>
              Give your group a name to get started
            </Text>

            <View style={styles.modalInputWrapper}>
              <Ionicons
                name="people-outline"
                size={16}
                color={COLORS.textMuted}
              />
              <TextInput
                placeholder="Group name..."
                placeholderTextColor={COLORS.textMuted}
                style={styles.modalInput}
                value={groupName}
                onChangeText={setGroupName}
                autoFocus
                maxLength={40}
              />
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                onPress={closeModal}
                style={styles.cancelBtn}
                activeOpacity={0.7}
              >
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleCreateGroup}
                style={[
                  styles.createBtn,
                  !groupName.trim() && styles.createBtnDisabled,
                ]}
                disabled={!groupName.trim() || loading}
                activeOpacity={0.8}
              >
                {loading ? (
                  <ActivityIndicator color={COLORS.white} size="small" />
                ) : (
                  <Text style={styles.createText}>Create</Text>
                )}
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      {/* ── Header ── */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.closeBtn}
          activeOpacity={0.7}
        >
          <Ionicons name="close" size={18} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.title}>
          {isAddMode ? "Add Member" : "New Message"}
        </Text>
        <View style={styles.closeBtn} />
      </View>

      {/* ── Search Bar ── */}
      <View style={styles.searchWrapper}>
        <View
          style={[styles.searchBar, searchFocused && styles.searchBarFocused]}
        >
          <Ionicons
            name="search-outline"
            size={17}
            color={searchFocused ? COLORS.accent : COLORS.textMuted}
          />
          <TextInput
            placeholder="Search by username..."
            placeholderTextColor={COLORS.textMuted}
            style={styles.searchInput}
            value={query}
            onChangeText={handleSearch}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            autoFocus={!isAddMode}
          />
          {query.length > 0 && (
            <Pressable
              onPress={() => {
                setQuery("");
                setUsers([]);
              }}
              hitSlop={8}
            >
              <Ionicons
                name="close-circle"
                size={17}
                color={COLORS.textMuted}
              />
            </Pressable>
          )}
        </View>
      </View>

      {/* ── List ── */}
      <FlatList
        data={users}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          !isAddMode ? (
            <TouchableOpacity
              style={styles.groupCard}
              onPress={() => setModalVisible(true)}
              activeOpacity={0.8}
            >
              <View style={styles.groupIconBox}>
                <Ionicons name="people" size={22} color={COLORS.white} />
              </View>
              <View style={styles.groupTextBlock}>
                <Text style={styles.groupTitle}>Create New Group</Text>
                <Text style={styles.groupSubtitle}>
                  Start a group conversation
                </Text>
              </View>
              <Ionicons
                name="chevron-forward"
                size={16}
                color={COLORS.textMuted}
              />
            </TouchableOpacity>
          ) : null
        }
        ListEmptyComponent={
          query.length === 0 ? (
            <View style={styles.hintContainer}>
              <Ionicons
                name="search-outline"
                size={40}
                color={COLORS.textMuted}
              />
              <Text style={styles.hintText}>
                {isAddMode
                  ? "Search for a user to add to this group"
                  : "Search for someone to start a conversation"}
              </Text>
            </View>
          ) : query.length < 2 ? (
            <View style={styles.hintContainer}>
              <Text style={styles.hintText}>Keep typing...</Text>
            </View>
          ) : !loading ? (
            <View style={styles.hintContainer}>
              <Text style={styles.hintText}>No users found for "{query}"</Text>
            </View>
          ) : null
        }
        renderItem={({ item }) => {
          const avatarColor = getAvatarColor(item.username);
          const isActing = actionLoading === item.id;
          return (
            <TouchableOpacity
              style={styles.userRow}
              onPress={() => handleAction(item)}
              activeOpacity={0.75}
              disabled={!!actionLoading}
            >
              <View
                style={[styles.userAvatar, { backgroundColor: avatarColor }]}
              >
                <Text style={styles.userAvatarText}>
                  {item.username?.charAt(0).toUpperCase()}
                </Text>
              </View>
              <Text style={styles.userName}>{item.username}</Text>
              {isActing ? (
                <ActivityIndicator size="small" color={COLORS.accent} />
              ) : (
                <View style={styles.addIconBox}>
                  <Ionicons
                    name={
                      isAddMode ? "person-add-outline" : "chatbubble-outline"
                    }
                    size={16}
                    color={COLORS.accent}
                  />
                </View>
              )}
            </TouchableOpacity>
          );
        }}
      />

      {loading && users.length === 0 && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={COLORS.accent} />
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.bg },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    backgroundColor: COLORS.surface,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: COLORS.inputBg,
    borderWidth: 1,
    borderColor: COLORS.border,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 17,
    fontWeight: "700",
    color: COLORS.textPrimary,
    letterSpacing: -0.2,
  },

  searchWrapper: { paddingHorizontal: 20, paddingVertical: 14 },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    paddingHorizontal: 14,
    height: 48,
    gap: 10,
  },
  searchBarFocused: { borderColor: COLORS.accent },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: COLORS.textPrimary,
    paddingVertical: 0,
  },

  listContent: { paddingHorizontal: 20, paddingBottom: 30 },

  groupCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 14,
    marginBottom: 16,
    gap: 14,
  },
  groupIconBox: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: COLORS.success,
    justifyContent: "center",
    alignItems: "center",
  },
  groupTextBlock: { flex: 1 },
  groupTitle: { fontSize: 15, fontWeight: "700", color: COLORS.textPrimary },
  groupSubtitle: { fontSize: 12, color: COLORS.textMuted, marginTop: 2 },

  userRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    gap: 14,
  },
  userAvatar: {
    width: 46,
    height: 46,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  userAvatarText: { color: COLORS.white, fontSize: 18, fontWeight: "700" },
  userName: {
    flex: 1,
    fontSize: 15,
    fontWeight: "600",
    color: COLORS.textPrimary,
  },
  addIconBox: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: COLORS.accentDim,
    borderWidth: 1,
    borderColor: COLORS.accent + "40",
    justifyContent: "center",
    alignItems: "center",
  },

  hintContainer: { alignItems: "center", paddingTop: 48, gap: 12 },
  hintText: {
    fontSize: 14,
    color: COLORS.textMuted,
    textAlign: "center",
    lineHeight: 20,
    maxWidth: 220,
  },

  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(10,10,15,0.6)",
  },

  // ── Modal ──────────────────────────────────────────────────────────────────
  // ✅ Overlay = the Pressable itself (full screen dark bg, closes on tap outside)
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.72)",
    justifyContent: "flex-end",
  },
  // ✅ Card = nested Pressable, blocks event bubbling with e.stopPropagation()
  modalCard: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    paddingBottom: 40,
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: COLORS.border,
  },
  modalHandle: {
    width: 38,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.border,
    alignSelf: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: COLORS.textPrimary,
    letterSpacing: -0.3,
    marginBottom: 4,
  },
  modalSubtitle: { fontSize: 13, color: COLORS.textMuted, marginBottom: 20 },
  modalInputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.inputBg,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    paddingHorizontal: 14,
    height: 52,
    marginBottom: 24,
    gap: 10,
  },
  modalInput: {
    flex: 1,
    fontSize: 15,
    color: COLORS.textPrimary,
    paddingVertical: 0,
  },
  modalButtons: { flexDirection: "row", justifyContent: "flex-end", gap: 12 },
  cancelBtn: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: COLORS.inputBg,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cancelText: { color: COLORS.textSecondary, fontWeight: "600", fontSize: 14 },
  createBtn: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: COLORS.accent,
    shadowColor: COLORS.accent,
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 4,
    minWidth: 80,
    alignItems: "center",
  },
  createBtnDisabled: {
    backgroundColor: "#3D3A6B",
    shadowOpacity: 0,
    elevation: 0,
  },
  createText: { color: COLORS.white, fontWeight: "700", fontSize: 14 },
});
