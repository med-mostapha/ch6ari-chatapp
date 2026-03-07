import { signUp } from "@/services/auth";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import LottieView from "lottie-react-native";
import React, { useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type ValidationStatus = "default" | "valid" | "invalid";

export default function RegisterScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Validation States
  const [emailStatus, setEmailStatus] = useState<ValidationStatus>("default");
  const [passwordStatus, setPasswordStatus] =
    useState<ValidationStatus>("default");
  const [usernameStatus, setUsernameStatus] =
    useState<ValidationStatus>("default");
  const [errorMsg, setErrorMsg] = useState("");

  const router = useRouter();
  const animation = useRef<LottieView>(null);
  const shakeAnimation = useRef(new Animated.Value(0)).current;

  // Shake Logic
  const triggerShake = () => {
    Animated.sequence([
      Animated.timing(shakeAnimation, {
        toValue: 10,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnimation, {
        toValue: -10,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnimation, {
        toValue: 10,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnimation, {
        toValue: 0,
        duration: 50,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const validateInputs = () => {
    const emailRegex = /\S+@\S+\.\S+/;
    const isEmailValid = emailRegex.test(email);
    const isUsernameValid = username.length >= 4;
    const isPasswordValid = password.length >= 6;

    setEmailStatus(isEmailValid ? "valid" : "invalid");
    setUsernameStatus(isUsernameValid ? "valid" : "invalid");
    setPasswordStatus(isPasswordValid ? "valid" : "invalid");

    if (!isEmailValid || !isPasswordValid || !isUsernameValid) {
      triggerShake();
      setErrorMsg(
        !isEmailValid
          ? "Invalid email format"
          : !isPasswordValid
            ? "Password too short"
            : "Username too short",
      );

      // Reset after 3 seconds
      setTimeout(() => {
        setEmailStatus("default");
        setPasswordStatus("default");
        setErrorMsg("");
      }, 3000);
      return false;
    }
    return true;
  };

  const handleRegister = async () => {
    if (!validateInputs()) return;

    setLoading(true);
    const { error } = await signUp(email, password, username);
    setLoading(false);

    if (error) {
      setEmailStatus("invalid");
      setUsernameStatus("invalid");
      setPasswordStatus("invalid");
      Alert.alert("Error", error.message);
    } else {
      Alert.alert("Success", "Check your email to verify!", [
        { text: "OK", onPress: () => router.replace("/login") },
      ]);
    }
  };

  const getBorderColor = (status: ValidationStatus) => {
    if (status === "valid") return "#10B981";
    if (status === "invalid") return "#EF4444";
    return "#F3F4F6";
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        <StatusBar barStyle="dark-content" />
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.iconContainer}>
            <LottieView
              ref={animation}
              source={require("../../assets/icons/singing-contract.json")}
              style={{ width: 150, height: 150 }}
              autoPlay
              loop
            />
          </View>

          <View style={styles.header}>
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Join us to get started</Text>
          </View>

          <Animated.View
            style={[
              styles.form,
              { transform: [{ translateX: shakeAnimation }] },
            ]}
          >
            {/* Username Feild */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>User Name</Text>
              <TextInput
                style={[
                  styles.input,
                  { borderColor: getBorderColor(usernameStatus) },
                ]}
                placeholder="Enter Username"
                placeholderTextColor="#9CA3AF"
                keyboardType="ascii-capable"
                autoCapitalize="none"
                value={username}
                onChangeText={setUsername}
              />
            </View>

            {/* Email Field */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email Address</Text>
              <TextInput
                style={[
                  styles.input,
                  { borderColor: getBorderColor(emailStatus) },
                ]}
                placeholder="name@example.com"
                placeholderTextColor="#9CA3AF"
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
              />
            </View>

            {/* Password Field */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Password</Text>
              <View style={styles.passwordWrapper}>
                <TextInput
                  style={[
                    styles.input,
                    styles.passwordInput,
                    { borderColor: getBorderColor(passwordStatus) },
                  ]}
                  placeholder="Min. 6 characters"
                  placeholderTextColor="#9CA3AF"
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={setPassword}
                />
                <TouchableOpacity
                  style={styles.eyeBtn}
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <Ionicons
                    name={showPassword ? "eye" : "eye-off"}
                    size={22}
                    color="#9CA3AF"
                  />
                </TouchableOpacity>
              </View>
            </View>

            {errorMsg ? <Text style={styles.errorText}>{errorMsg}</Text> : null}

            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleRegister}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Sign Up</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => router.replace("/login")}
              style={styles.footerLink}
            >
              <Text style={styles.footerText}>
                Have an account? <Text style={styles.linkBold}>Login</Text>
              </Text>
            </TouchableOpacity>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#FFFFFF" },
  container: { flex: 1 },
  scrollContainer: { flexGrow: 1, paddingHorizontal: 28, paddingBottom: 40 },
  iconContainer: { alignItems: "center", marginTop: 20, marginBottom: 20 },
  header: { marginBottom: 30, alignItems: "center" },
  title: { fontSize: 28, fontWeight: "800", color: "#111827" },
  subtitle: { fontSize: 14, color: "#6B7280", marginTop: 4 },
  form: { width: "100%" },
  inputGroup: { marginBottom: 20 },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
    marginLeft: 4,
  },
  input: {
    backgroundColor: "#F9FAFB",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 14,
    fontSize: 14,
    color: "#111827",
    borderWidth: 1.5,
  },
  passwordWrapper: { justifyContent: "center" },
  passwordInput: { paddingRight: 50 },
  eyeBtn: { position: "absolute", right: 16 },
  errorText: {
    color: "#EF4444",
    textAlign: "center",
    marginBottom: 10,
    fontSize: 13,
    fontWeight: "500",
  },
  button: {
    backgroundColor: "#2563EB",
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: "center",
    marginTop: 10,
    shadowColor: "#2563EB",
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonDisabled: { backgroundColor: "#93C5FD" },
  buttonText: { color: "#FFFFFF", fontSize: 16, fontWeight: "700" },
  footerLink: { marginTop: 25 },
  footerText: { textAlign: "center", color: "#6B7280", fontSize: 15 },
  linkBold: { color: "#2563EB", fontWeight: "700" },
});
