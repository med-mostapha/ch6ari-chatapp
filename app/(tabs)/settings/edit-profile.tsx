import { useAuth } from "@/context/AuthContext";
import { updateProfile } from "@/services/auth";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function EditProfileScreen() {
  const { session } = useAuth();
  const router = useRouter();

  const [username, setUsername] = useState(
    session?.user?.user_metadata?.display_name || "",
  );
  const [loading, setLoading] = useState(false);

  const handleUpdate = async () => {
    if (username.trim().length < 3) {
      return Alert.alert("Error", "Username must be at least 3 characters");
    }

    setLoading(true);
    const { error } = await updateProfile(username);
    setLoading(false);

    if (error) {
      Alert.alert("Update Failed", error.message);
    } else {
      Alert.alert("Success", "Profile updated successfully!", [
        { text: "OK", onPress: () => router.back() },
      ]);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Profile</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Username</Text>
          <TextInput
            style={styles.input}
            value={username}
            onChangeText={setUsername}
            placeholder="Enter new username"
            placeholderTextColor="#9CA3AF"
            autoCapitalize="none"
          />
        </View>

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleUpdate}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Save Changes</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFFFFF" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  backBtn: { marginRight: 15 },
  headerTitle: { fontSize: 20, fontWeight: "700", color: "#111827" },
  content: { padding: 25 },
  inputGroup: { marginBottom: 25 },
  label: { fontSize: 14, fontWeight: "600", color: "#374151", marginBottom: 8 },
  input: {
    backgroundColor: "#F9FAFB",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    fontSize: 16,
    color: "#111827",
  },
  button: {
    backgroundColor: "#2563EB",
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: "center",
    shadowColor: "#2563EB",
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 5,
  },
  buttonDisabled: { backgroundColor: "#93C5FD" },
  buttonText: { color: "#FFFFFF", fontSize: 16, fontWeight: "700" },
});
