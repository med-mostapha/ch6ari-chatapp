import React from "react";
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
} from "react-native";

const EMOJIS = ["👍", "❤️", "😂", "😮", "😢", "👏"];

const COLORS = {
  surface: "#1C1C27",
  border: "#2A2A3D",
  white: "#FFFFFF",
};

interface ReactionPickerProps {
  visible: boolean;
  onClose: () => void;
  onSelectEmoji: (emoji: string) => void;
  selectedEmojis: string[];
}

export const ReactionPicker = ({
  visible,
  onClose,
  onSelectEmoji,
  selectedEmojis,
}: ReactionPickerProps) => {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.picker} onPress={(e) => e.stopPropagation()}>
          {EMOJIS.map((emoji) => {
            const isSelected = selectedEmojis.includes(emoji);
            return (
              <TouchableOpacity
                key={emoji}
                style={[styles.emojiBtn, isSelected && styles.emojiBtnSelected]}
                onPress={() => {
                  onSelectEmoji(emoji);
                  onClose();
                }}
                activeOpacity={0.7}
              >
                <Text style={styles.emoji}>{emoji}</Text>
              </TouchableOpacity>
            );
          })}
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  picker: {
    flexDirection: "row",
    backgroundColor: COLORS.surface,
    borderRadius: 40,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 6,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: "#000",
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 10,
  },
  emojiBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
  },
  emojiBtnSelected: {
    backgroundColor: "rgba(108, 99, 255, 0.25)",
    borderWidth: 1.5,
    borderColor: "#6C63FF",
  },
  emoji: {
    fontSize: 26,
  },
});
