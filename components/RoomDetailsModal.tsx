import { getRoomMembers, leaveRoom } from "@/services/chat";
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
            <Text style={styles.title}>Group Details</Text>
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
                      {item.profiles?.username?.[0]}
                    </Text>
                  </View>
                  <Text style={styles.username}>{item.profiles?.username}</Text>
                  {item.user_id === roomOwnerId && (
                    <View style={styles.ownerBadge}>
                      <Text style={styles.ownerText}>Owner</Text>
                    </View>
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
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: "70%",
    padding: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  title: { fontSize: 20, fontWeight: "bold" },
  memberItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  avatarText: { fontWeight: "bold", color: "#2563EB" },
  username: { flex: 1, fontSize: 16, color: "#111827" },
  ownerBadge: {
    backgroundColor: "#FEE2E2",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  ownerText: { color: "#EF4444", fontSize: 12, fontWeight: "bold" },
  leaveBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
  },
  leaveBtnText: {
    color: "#EF4444",
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 10,
  },
});
