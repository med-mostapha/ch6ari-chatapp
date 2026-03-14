import { Ionicons } from "@expo/vector-icons";
import React, { useRef } from "react";
import {
  Animated,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from "react-native";

const COLORS = {
  bg: "#0A0A0F",
  surface: "#13131A",
  inputBg: "#1C1C27",
  border: "#2A2A3D",
  accent: "#6C63FF",
  textPrimary: "#F1F1F5",
  textMuted: "#5A5A72",
  white: "#FFFFFF",
};

interface ChatInputProps {
  value: string;
  onChangeText: (text: string) => void;
  onSend: () => void;
  disabled: boolean;
}

export const ChatInput = ({
  value,
  onChangeText,
  onSend,
  disabled,
}: ChatInputProps) => {
  const scale = useRef(new Animated.Value(1)).current;
  const canSend = value.trim().length > 0 && !disabled;

  const onPressIn = () => {
    if (!canSend) return;
    Animated.spring(scale, {
      toValue: 0.88,
      useNativeDriver: true,
      speed: 60,
    }).start();
  };

  const onPressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      speed: 60,
    }).start();
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
    >
      <View style={styles.container}>
        {/* ── Input field ── */}
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.input}
            placeholder="Message..."
            placeholderTextColor={COLORS.textMuted}
            value={value}
            onChangeText={onChangeText}
            multiline
            maxLength={2000}
          />
        </View>

        {/* ── Send Button ── */}
        <Pressable
          onPress={onSend}
          onPressIn={onPressIn}
          onPressOut={onPressOut}
          disabled={!canSend}
        >
          <Animated.View
            style={[
              styles.sendBtn,
              !canSend && styles.sendBtnDisabled,
              { transform: [{ scale }] },
            ]}
          >
            <Ionicons
              name="send"
              size={17}
              color={canSend ? COLORS.white : COLORS.textMuted}
              style={styles.sendIcon}
            />
          </Animated.View>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    backgroundColor: COLORS.surface,
    gap: 10,
  },

  // ── Input ──
  inputWrapper: {
    flex: 1,
    backgroundColor: COLORS.inputBg,
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    paddingHorizontal: 16,
    paddingVertical: 10,
    minHeight: 44,
    maxHeight: 120,
    justifyContent: "center",
  },
  input: {
    fontSize: 15,
    color: COLORS.textPrimary,
    paddingVertical: 0, // Removes Android default padding
    lineHeight: 20,
  },

  // ── Send Button ──
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.accent,
    justifyContent: "center",
    alignItems: "center",
    // Glow when active
    shadowColor: COLORS.accent,
    shadowOpacity: 0.55,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
    elevation: 5,
    marginBottom: 0,
  },
  sendBtnDisabled: {
    backgroundColor: COLORS.inputBg,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    shadowOpacity: 0,
    elevation: 0,
  },
  sendIcon: {
    marginLeft: 2,
  },
});
