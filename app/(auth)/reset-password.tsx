import { updatePassword } from "@/services/auth";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleUpdate = async () => {
    if (password.length < 6) return Alert.alert("Error", "Password too short");

    const { error } = await updatePassword(password);
    if (error) {
      Alert.alert("Error", error.message);
    } else {
      Alert.alert("Success", "Password updated!", [
        { text: "Login", onPress: () => router.replace("/login") },
      ]);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>New Password</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter new password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      <TouchableOpacity style={styles.button} onPress={handleUpdate}>
        <Text style={styles.buttonText}>Update Password</Text>
      </TouchableOpacity>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 28,
    backgroundColor: "#FFF",
    justifyContent: "center",
  },
  backBtn: { position: "absolute", top: 60, left: 20 },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: "#111827",
    marginBottom: 10,
  },
  subtitle: { fontSize: 15, color: "#6B7280", marginBottom: 30 },
  input: {
    backgroundColor: "#F9FAFB",
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    fontSize: 16,
  },
  button: {
    backgroundColor: "#2563EB",
    padding: 16,
    borderRadius: 14,
    alignItems: "center",
    marginTop: 20,
  },
  buttonText: { color: "#FFF", fontWeight: "700", fontSize: 16 },
});
