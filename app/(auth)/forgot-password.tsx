import { resetPassword } from "@/services/auth";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const COLORS = {
  bg: "#0A0A0F",
  surface: "#13131A",
  inputBg: "#1C1C27",
  border: "#2A2A3D",
  borderInvalid: "#F87171",
  accent: "#6C63FF",
  textPrimary: "#F1F1F5",
  textSecondary: "#8B8B9E",
  textMuted: "#5A5A72",
  white: "#FFFFFF",
  error: "#F87171",
  success: "#34D399",
};

function PrimaryButton({
  onPress,
  loading,
  label,
  disabled,
}: {
  onPress: () => void;
  loading: boolean;
  label: string;
  disabled: boolean;
}) {
  const scale = useRef(new Animated.Value(1)).current;

  const onPressIn = () =>
    Animated.spring(scale, {
      toValue: 0.96,
      useNativeDriver: true,
      speed: 50,
    }).start();
  const onPressOut = () =>
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      speed: 50,
    }).start();

  return (
    <Pressable
      onPress={onPress}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      disabled={disabled}
    >
      <Animated.View
        style={[
          styles.button,
          disabled && styles.buttonDisabled,
          { transform: [{ scale }] },
        ]}
      >
        {loading ? (
          <ActivityIndicator color={COLORS.white} />
        ) : (
          <Text style={styles.buttonText}>{label}</Text>
        )}
      </Animated.View>
    </Pressable>
  );
}

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const router = useRouter();

  const handleReset = async () => {
    const isEmailValid = /\S+@\S+\.\S+/.test(email);
    if (!isEmailValid) {
      setErrorMsg("Please enter a valid email address");
      return;
    }

    setLoading(true);
    setErrorMsg("");
    const { error } = await resetPassword(email);
    setLoading(false);

    if (error) {
      setErrorMsg(error.message);
    } else {
      // Show success state inline instead of Alert — more polished UX
      setSent(true);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />

      {/* ── Back Button ── */}
      <TouchableOpacity
        onPress={() => router.back()}
        style={styles.backBtn}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        activeOpacity={0.7}
      >
        <View style={styles.backBtnInner}>
          <Ionicons name="arrow-back" size={18} color={COLORS.textPrimary} />
        </View>
      </TouchableOpacity>

      <View style={styles.container}>
        {/* ── Icon ── */}
        <View style={styles.iconContainer}>
          <View style={styles.iconCircle}>
            <Ionicons
              name={sent ? "checkmark-circle-outline" : "lock-open-outline"}
              size={32}
              color={sent ? COLORS.success : COLORS.accent}
            />
          </View>
        </View>

        {/* ── Header ── */}
        <Text style={styles.title}>
          {sent ? "Email Sent!" : "Reset Password"}
        </Text>
        <Text style={styles.subtitle}>
          {sent
            ? `We've sent a reset link to\n${email}`
            : "Enter your email and we'll send you a\nlink to reset your password."}
        </Text>

        {/* ── Card ── */}
        <View style={styles.card}>
          {!sent ? (
            <>
              {/* Email Input */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Email Address</Text>
                <View
                  style={[
                    styles.inputWrapper,
                    errorMsg ? { borderColor: COLORS.borderInvalid } : {},
                  ]}
                >
                  <Ionicons
                    name="mail-outline"
                    size={16}
                    color={COLORS.textMuted}
                    style={styles.fieldIcon}
                  />
                  <TextInput
                    style={styles.inputText}
                    placeholder="name@example.com"
                    placeholderTextColor={COLORS.textMuted}
                    value={email}
                    onChangeText={(t) => {
                      setEmail(t);
                      setErrorMsg("");
                    }}
                    autoCapitalize="none"
                    keyboardType="email-address"
                  />
                </View>
              </View>

              {/* Error */}
              {errorMsg ? (
                <View style={styles.errorContainer}>
                  <Ionicons
                    name="alert-circle-outline"
                    size={14}
                    color={COLORS.error}
                  />
                  <Text style={styles.errorText}>{errorMsg}</Text>
                </View>
              ) : null}

              <PrimaryButton
                label="Send Reset Link"
                onPress={handleReset}
                loading={loading}
                disabled={loading}
              />
            </>
          ) : (
            /* ── Success State ── */
            <>
              <View style={styles.successBox}>
                <Text style={styles.successText}>
                  Check your inbox and follow the instructions in the email. The
                  link expires in 1 hour.
                </Text>
              </View>

              <PrimaryButton
                label="Back to Sign In"
                onPress={() => router.replace("/login")}
                loading={false}
                disabled={false}
              />

              {/* Resend option */}
              <TouchableOpacity
                onPress={() => setSent(false)}
                style={styles.resendBtn}
                activeOpacity={0.7}
              >
                <Text style={styles.resendText}>
                  Didn't receive it? Send again
                </Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  backBtn: {
    position: "absolute",
    top: 56,
    left: 20,
    zIndex: 10,
  },
  backBtnInner: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: "center",
    justifyContent: "center",
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: "center",
  },

  // ── Icon ──
  iconContainer: {
    alignItems: "center",
    marginBottom: 24,
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 22,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: "center",
    justifyContent: "center",
  },

  // ── Header ──
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: COLORS.textPrimary,
    letterSpacing: -0.5,
    textAlign: "center",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 28,
  },

  // ── Card ──
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: "#000",
    shadowOpacity: 0.4,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
    elevation: 10,
  },

  // ── Input ──
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.textSecondary,
    letterSpacing: 0.3,
    textTransform: "uppercase",
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.inputBg,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    paddingHorizontal: 14,
    height: 52,
  },
  fieldIcon: {
    marginRight: 10,
  },
  inputText: {
    flex: 1,
    fontSize: 15,
    color: COLORS.textPrimary,
    paddingVertical: 0,
  },

  // ── Error ──
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(248, 113, 113, 0.1)",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "rgba(248, 113, 113, 0.2)",
  },
  errorText: {
    color: COLORS.error,
    fontSize: 13,
    fontWeight: "500",
    flex: 1,
  },

  // ── Button ──
  button: {
    backgroundColor: COLORS.accent,
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: "center",
    shadowColor: COLORS.accent,
    shadowOpacity: 0.45,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  buttonDisabled: {
    backgroundColor: "#3D3A6B",
    shadowOpacity: 0,
    elevation: 0,
  },
  buttonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.3,
  },

  // ── Success ──
  successBox: {
    backgroundColor: "rgba(52, 211, 153, 0.08)",
    borderWidth: 1,
    borderColor: "rgba(52, 211, 153, 0.2)",
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
  },
  successText: {
    color: COLORS.success,
    fontSize: 13,
    lineHeight: 20,
    textAlign: "center",
  },
  resendBtn: {
    alignItems: "center",
    marginTop: 16,
  },
  resendText: {
    color: COLORS.textSecondary,
    fontSize: 13,
    textDecorationLine: "underline",
  },
});
