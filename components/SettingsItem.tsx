import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface SettingsItemProps {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  destructive?: boolean;
}

export const SettingsItem = ({
  label,
  icon,
  onPress,
  destructive,
}: SettingsItemProps) => {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <View style={[styles.iconBox, destructive && styles.destructiveIconBox]}>
        <Ionicons
          name={icon}
          size={22}
          color={destructive ? "#EF4444" : "#4B5563"}
        />
      </View>
      <Text style={[styles.label, destructive && styles.destructiveLabel]}>
        {label}
      </Text>
      <Ionicons name="chevron-forward" size={20} color="#D1D5DB" />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    marginBottom: 8,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  destructiveIconBox: {
    backgroundColor: "#FEE2E2",
  },
  label: {
    flex: 1,
    fontSize: 16,
    fontWeight: "500",
    color: "#1F2937",
  },
  destructiveLabel: {
    color: "#EF4444",
  },
});
