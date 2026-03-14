import { Ionicons } from "@expo/vector-icons";
import React, { useRef } from "react";
import { Animated, Pressable, StyleSheet, Text, View } from "react-native";

const COLORS = {
  surface: "#13131A",
  border: "#2A2A3D",
  accent: "#6C63FF",
  accentDim: "rgba(108, 99, 255, 0.15)",
  textPrimary: "#F1F1F5",
  textSecondary: "#8B8B9E",
  textMuted: "#5A5A72",
  error: "#F87171",
  errorDim: "rgba(248, 113, 113, 0.12)",
  iconDefault: "rgba(139, 139, 158, 0.15)",
  white: "#FFFFFF",
};

interface SettingsItemProps {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  destructive?: boolean;
  subtitle?: string;
  badge?: string;
  iconColor?: string;
  iconBgColor?: string;
}

export const SettingsItem = ({
  label,
  icon,
  onPress,
  destructive,
  subtitle,
  badge,
  iconColor,
  iconBgColor,
}: SettingsItemProps) => {
  const scale = useRef(new Animated.Value(1)).current;

  const onPressIn = () =>
    Animated.spring(scale, {
      toValue: 0.98,
      useNativeDriver: true,
      speed: 50,
    }).start();

  const onPressOut = () =>
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      speed: 50,
    }).start();

  // Resolve colors
  const resolvedIconColor = destructive
    ? COLORS.error
    : (iconColor ?? COLORS.textSecondary);

  const resolvedIconBg = destructive
    ? COLORS.errorDim
    : (iconBgColor ?? COLORS.iconDefault);

  return (
    <Pressable onPress={onPress} onPressIn={onPressIn} onPressOut={onPressOut}>
      <Animated.View style={[styles.container, { transform: [{ scale }] }]}>
        {/* ── Icon Box ── */}
        <View style={[styles.iconBox, { backgroundColor: resolvedIconBg }]}>
          <Ionicons name={icon} size={20} color={resolvedIconColor} />
        </View>

        {/* ── Labels ── */}
        <View style={styles.textBlock}>
          <Text style={[styles.label, destructive && styles.destructiveLabel]}>
            {label}
          </Text>
          {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
        </View>

        {/* ── Right side ── */}
        <View style={styles.rightSide}>
          {badge && (
            <View style={styles.badgeContainer}>
              <Text style={styles.badgeText}>{badge}</Text>
            </View>
          )}
          <Ionicons name="chevron-forward" size={16} color={COLORS.textMuted} />
        </View>
      </Animated.View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  textBlock: {
    flex: 1,
  },
  label: {
    fontSize: 15,
    fontWeight: "600",
    color: COLORS.textPrimary,
  },
  destructiveLabel: {
    color: COLORS.error,
  },
  subtitle: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  rightSide: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  badgeContainer: {
    backgroundColor: COLORS.accent,
    borderRadius: 6,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  badgeText: {
    color: COLORS.white,
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
});
