import {
  getRoomMembers,
  getUsernameById,
  kickUser,
  leaveRoom,
} from "@/services/chat";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

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
  error: "#F87171",
  errorDim: "rgba(248, 113, 113, 0.1)",
  gold: "#FBBF24",
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
  return AVATAR_COLORS[(name?.charCodeAt(0) ?? 0) % AVATAR_COLORS.length];
}

interface RoomDetailsModalProps {
  visible: boolean;
  onClose: () => void;
  roomId: string;
  currentUserId: string;
  roomOwnerId: string;
  onRoomDeleted: () => void;
}

export const RoomDetailsModal = ({
  visible,
  onClose,
  roomId,
  currentUserId,
  roomOwnerId,
  onRoomDeleted,
}: RoomDetailsModalProps) => {
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const isOwner = currentUserId === roomOwnerId;

  useEffect(() => {
    if (visible) fetchMembers();
  }, [visible]);

  const fetchMembers = async () => {
    setLoading(true);
    const { data } = await getRoomMembers(roomId);
    if (data) setMembers(data);
    setLoading(false);
  };

  const handleKick = (targetId: string, targetName: string) => {
    Alert.alert("Remove Member", `Remove ${targetName} from the group?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Remove",
        style: "destructive",
        onPress: async () => {
          const ownerName = await getUsernameById(currentUserId);
          const { error } = await kickUser(
            roomId,
            targetId,
            targetName,
            ownerName,
          );
          if (!error) fetchMembers();
          else Alert.alert("Error", "Failed to remove member.");
        },
      },
    ]);
  };

  const handleLeaveOrDelete = () => {
    Alert.alert(
      isOwner ? "Delete Group" : "Leave Chat",
      isOwner
        ? "This will permanently delete the group and all messages for everyone."
        : "Are you sure you want to leave this conversation?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: isOwner ? "Delete Forever" : "Leave",
          style: "destructive",
          onPress: async () => {
            const { error } = await leaveRoom(roomId, currentUserId, isOwner);
            if (!error) {
              onClose();
              onRoomDeleted();
            } else {
              Alert.alert("Error", "Action failed. Try again.");
            }
          },
        },
      ],
    );
  };

  return (
    <Modal visible={visible} animationType="fade" transparent>
      <View style={styles.overlay}>
        {/* Tap outside to close */}
        <TouchableOpacity
          style={styles.backdrop}
          onPress={onClose}
          activeOpacity={1}
        />

        <View style={styles.sheet}>
          {/* ── Drag Handle ── */}
          <View style={styles.dragHandle} />

          {/* ── Header ── */}
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>Group Members</Text>
              {!loading && (
                <Text style={styles.memberCount}>
                  {members.length} {members.length === 1 ? "member" : "members"}
                </Text>
              )}
            </View>
            <TouchableOpacity
              onPress={onClose}
              style={styles.closeBtn}
              activeOpacity={0.7}
            >
              <Ionicons name="close" size={18} color={COLORS.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* ── Members List ── */}
          {loading ? (
            <ActivityIndicator
              style={styles.loader}
              color={COLORS.accent}
              size="large"
            />
          ) : (
            <FlatList
              data={members}
              keyExtractor={(item) => item.user_id}
              style={styles.list}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => {
                const name = item.profiles?.username ?? "User";
                const avatarColor = getAvatarColor(name);
                const isItemOwner = item.user_id === roomOwnerId;

                return (
                  <View style={styles.memberRow}>
                    {/* Avatar */}
                    <View
                      style={[styles.avatar, { backgroundColor: avatarColor }]}
                    >
                      <Text style={styles.avatarText}>
                        {name.charAt(0).toUpperCase()}
                      </Text>
                    </View>

                    {/* Name + badges */}
                    <View style={styles.memberInfo}>
                      <Text style={styles.memberName}>{name}</Text>
                      {isItemOwner && (
                        <View style={styles.ownerBadge}>
                          <Ionicons name="star" size={9} color={COLORS.gold} />
                          <Text style={styles.ownerBadgeText}>Owner</Text>
                        </View>
                      )}
                    </View>

                    {/* Kick button — only visible to owner, only for non-owners */}
                    {isOwner && !isItemOwner && (
                      <TouchableOpacity
                        onPress={() => handleKick(item.user_id, name)}
                        style={styles.kickBtn}
                        activeOpacity={0.7}
                      >
                        <Ionicons
                          name="person-remove-outline"
                          size={16}
                          color={COLORS.error}
                        />
                      </TouchableOpacity>
                    )}
                  </View>
                );
              }}
            />
          )}

          {/* ── Danger Action ── */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={styles.dangerBtn}
              onPress={handleLeaveOrDelete}
              activeOpacity={0.8}
            >
              <Ionicons
                name={isOwner ? "trash-outline" : "log-out-outline"}
                size={18}
                color={COLORS.error}
              />
              <Text style={styles.dangerBtnText}>
                {isOwner ? "Delete Group" : "Leave Chat"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
    bottom: 40,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.65)",
  },
  sheet: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: "78%",
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: COLORS.border,
    // Depth shadow upward
    shadowColor: "#000",
    shadowOpacity: 0.6,
    shadowRadius: 30,
    shadowOffset: { width: 0, height: -8 },
    elevation: 20,
  },

  // ── Drag Handle ──
  dragHandle: {
    width: 38,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.border,
    alignSelf: "center",
    marginTop: 12,
    marginBottom: 4,
  },

  // ── Header ──
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingHorizontal: 22,
    paddingTop: 14,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  title: {
    fontSize: 20,
    fontWeight: "800",
    color: COLORS.textPrimary,
    letterSpacing: -0.3,
  },
  memberCount: {
    fontSize: 13,
    color: COLORS.textMuted,
    marginTop: 3,
  },
  closeBtn: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: COLORS.surfaceElevated,
    borderWidth: 1,
    borderColor: COLORS.border,
    justifyContent: "center",
    alignItems: "center",
  },

  // ── List ──
  loader: {
    margin: 40,
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 8,
  },
  memberRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    gap: 12,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    color: COLORS.white,
    fontSize: 17,
    fontWeight: "700",
  },
  memberInfo: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  memberName: {
    fontSize: 15,
    fontWeight: "600",
    color: COLORS.textPrimary,
  },
  ownerBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    backgroundColor: "rgba(251, 191, 36, 0.1)",
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(251, 191, 36, 0.2)",
  },
  ownerBadgeText: {
    fontSize: 10,
    fontWeight: "700",
    color: COLORS.gold,
  },
  kickBtn: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: "rgba(248, 113, 113, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(248, 113, 113, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },

  // ── Footer ──
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  dangerBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    backgroundColor: COLORS.errorDim,
    borderWidth: 1,
    borderColor: "rgba(248, 113, 113, 0.2)",
    paddingVertical: 14,
    borderRadius: 16,
  },
  dangerBtnText: {
    color: COLORS.error,
    fontSize: 15,
    fontWeight: "700",
  },
});
