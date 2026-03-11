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
    Alert.alert(
      "Kick Member",
      `Are you sure you want to remove ${targetName} from the group?`,
      [
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
            if (!error) {
              fetchMembers();
            } else {
              Alert.alert("Error", "Failed to remove member.");
            }
          },
        },
      ],
    );
  };

  const handleLeaveOrDelete = () => {
    const title = isOwner ? "Delete Group" : "Leave Chat";
    const message = isOwner
      ? "As the owner, deleting this group will remove everyone and all messages. Are you sure?"
      : "Are you sure you want to leave this conversation?";

    Alert.alert(title, message, [
      { text: "Cancel", style: "cancel" },
      {
        text: isOwner ? "Delete" : "Leave",
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
    ]);
  };

  return (
    <Modal visible={visible} animationType="fade" transparent>
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>Group Members</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="#111827" />
            </TouchableOpacity>
          </View>

          {loading ? (
            <ActivityIndicator style={{ margin: 20 }} color="#2563EB" />
          ) : (
            <FlatList
              data={members}
              keyExtractor={(item) => item.user_id}
              renderItem={({ item }) => (
                <View style={styles.memberItem}>
                  <View style={styles.avatar}>
                    <Text style={styles.avatarText}>
                      {item.profiles?.username?.[0].toUpperCase()}
                    </Text>
                  </View>
                  <Text style={styles.username}>{item.profiles?.username}</Text>

                  {item.user_id === roomOwnerId ? (
                    <View style={styles.ownerBadge}>
                      <Text style={styles.ownerText}>Owner</Text>
                    </View>
                  ) : (
                    isOwner && (
                      <TouchableOpacity
                        onPress={() =>
                          handleKick(item.user_id, item.profiles?.username)
                        }
                        style={styles.kickBtn}
                      >
                        <Ionicons
                          name="person-remove-outline"
                          size={20}
                          color="#EF4444"
                        />
                      </TouchableOpacity>
                    )
                  )}
                </View>
              )}
            />
          )}

          <TouchableOpacity
            style={styles.leaveBtn}
            onPress={handleLeaveOrDelete}
          >
            <Ionicons
              name={isOwner ? "trash-outline" : "log-out-outline"}
              size={20}
              color="#EF4444"
            />
            <Text style={styles.leaveBtnText}>
              {isOwner ? "Delete Group" : "Leave Chat"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  container: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    height: "75%",
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 25,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  title: { fontSize: 22, fontWeight: "800", color: "#111827" },
  memberItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
  },
  avatar: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    backgroundColor: "#EFF6FF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  avatarText: { fontWeight: "bold", color: "#2563EB", fontSize: 16 },
  username: { flex: 1, fontSize: 17, fontWeight: "500", color: "#374151" },
  ownerBadge: {
    backgroundColor: "#FEF2F2",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  ownerText: { color: "#EF4444", fontSize: 13, fontWeight: "bold" },
  kickBtn: {
    padding: 8,
    backgroundColor: "#FFF1F2",
    borderRadius: 8,
  },
  leaveBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 15,
    padding: 18,
    backgroundColor: "#FFF1F2",
    borderRadius: 15,
  },
  leaveBtnText: {
    color: "#EF4444",
    fontSize: 17,
    fontWeight: "800",
    marginLeft: 10,
  },
});
