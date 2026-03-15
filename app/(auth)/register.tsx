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
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const COLORS = {
  bg: "#0A0A0F",
  surface: "#13131A",
  inputBg: "#1C1C27",
  border: "#2A2A3D",
  borderValid: "#34D399",
  borderInvalid: "#F87171",
  accent: "#6C63FF",
  accentLight: "#8B83FF",
  textPrimary: "#F1F1F5",
  textSecondary: "#8B8B9E",
  textMuted: "#5A5A72",
  white: "#FFFFFF",
  error: "#F87171",
  success: "#34D399",
};

type ValidationStatus = "default" | "valid" | "invalid";

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

  const onPressIn = () => {
    Animated.spring(scale, {
      toValue: 0.96,
      useNativeDriver: true,
      speed: 50,
    }).start();
  };

  const onPressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      speed: 50,
    }).start();
  };

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

function InputField({
  label,
  status,
  children,
}: {
  label: string;
  status: ValidationStatus;
  children: React.ReactNode;
}) {
  const borderColor =
    status === "valid"
      ? COLORS.borderValid
      : status === "invalid"
        ? COLORS.borderInvalid
        : COLORS.border;

  return (
    <View style={styles.inputGroup}>
      <Text style={styles.label}>{label}</Text>
      <View style={[styles.inputWrapper, { borderColor }]}>
        {status !== "default" && (
          <View
            style={[
              styles.statusDot,
              {
                backgroundColor:
                  status === "valid"
                    ? COLORS.borderValid
                    : COLORS.borderInvalid,
              },
            ]}
          />
        )}
        {children}
      </View>
    </View>
  );
}

function PasswordStrength({ password }: { password: string }) {
  const getStrength = () => {
    if (password.length === 0) return 0;
    if (password.length < 6) return 1;
    if (password.length < 10) return 2;
    return 3;
  };

  const strength = getStrength();
  const labels = ["", "Weak", "Good", "Strong"];
  const colors = ["", COLORS.error, "#FBBF24", COLORS.success];

  if (password.length === 0) return null;

  return (
    <View style={styles.strengthContainer}>
      <View style={styles.strengthBars}>
        {[1, 2, 3].map((i) => (
          <View
            key={i}
            style={[
              styles.strengthBar,
              {
                backgroundColor:
                  i <= strength ? colors[strength] : COLORS.border,
              },
            ]}
          />
        ))}
      </View>
      <Text style={[styles.strengthLabel, { color: colors[strength] }]}>
        {labels[strength]}
      </Text>
    </View>
  );
}

export default function RegisterScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [emailStatus, setEmailStatus] = useState<ValidationStatus>("default");
  const [passwordStatus, setPasswordStatus] =
    useState<ValidationStatus>("default");
  const [usernameStatus, setUsernameStatus] =
    useState<ValidationStatus>("default");
  const [errorMsg, setErrorMsg] = useState("");

  const router = useRouter();
  const animation = useRef<LottieView>(null);
  const shakeAnimation = useRef(new Animated.Value(0)).current;

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
    const isEmailValid = /\S+@\S+\.\S+/.test(email);
    const isUsernameValid = username.length >= 4;
    const isPasswordValid = password.length >= 6;

    setEmailStatus(isEmailValid ? "valid" : "invalid");
    setUsernameStatus(isUsernameValid ? "valid" : "invalid");
    setPasswordStatus(isPasswordValid ? "valid" : "invalid");

    if (!isEmailValid || !isPasswordValid || !isUsernameValid) {
      triggerShake();
      setErrorMsg(
        !isUsernameValid
          ? "Username must be at least 4 characters"
          : !isEmailValid
            ? "Invalid email format"
            : "Password must be at least 6 characters",
      );
      setTimeout(() => {
        setEmailStatus("default");
        setPasswordStatus("default");
        setUsernameStatus("default");
        setErrorMsg("");
      }, 3000);
      return false;
    }
    return true;
  };

  const handleRegister = async () => {
    if (!validateInputs()) return;
    setLoading(true);

    const { data, error } = await signUp(email, password, username);
    setLoading(false);

    if (error) {
      setEmailStatus("invalid");
      setUsernameStatus("invalid");
      setPasswordStatus("invalid");
      setErrorMsg(error.message ?? "Registration failed");
      triggerShake();
      return;
    }

    Alert.alert(
      "✅ Almost there!",
      "Check your email to verify your account.",
      [{ text: "Got it", onPress: () => router.replace("/login") }],
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* ── Lottie Animation ── */}
          <View style={styles.iconContainer}>
            <View style={styles.lottieGlow} />
            <LottieView
              ref={animation}
              source={require("../../assets/icons/singing-contract.json")}
              style={styles.lottie as ViewStyle}
              autoPlay
              loop
            />
          </View>

          {/* ── Header ── */}
          <View style={styles.header}>
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Join and start messaging today</Text>
          </View>

          {/* ── Form Card ── */}
          <Animated.View
            style={[
              styles.card,
              { transform: [{ translateX: shakeAnimation }] },
            ]}
          >
            {/* Username */}
            <InputField label="Username" status={usernameStatus}>
              <Ionicons
                name="person-outline"
                size={16}
                color={COLORS.textMuted}
                style={styles.fieldIcon}
              />
              <TextInput
                style={styles.inputText}
                placeholder="Min. 4 characters"
                placeholderTextColor={COLORS.textMuted}
                autoCapitalize="none"
                value={username}
                onChangeText={setUsername}
              />
            </InputField>

            {/* Email */}
            <InputField label="Email Address" status={emailStatus}>
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
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
              />
            </InputField>

            <InputField label="Password" status={passwordStatus}>
              <Ionicons
                name="lock-closed-outline"
                size={16}
                color={COLORS.textMuted}
                style={styles.fieldIcon}
              />
              <TextInput
                style={[styles.inputText, styles.passwordInput]}
                placeholder="Min. 6 characters"
                placeholderTextColor={COLORS.textMuted}
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={setPassword}
              />
              <TouchableOpacity
                style={styles.eyeBtn}
                onPress={() => setShowPassword(!showPassword)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons
                  name={showPassword ? "eye-outline" : "eye-off-outline"}
                  size={20}
                  color={COLORS.textSecondary}
                />
              </TouchableOpacity>
            </InputField>

            <PasswordStrength password={password} />

            {/* Error Message */}
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
              label="Create Account"
              onPress={handleRegister}
              loading={loading}
              disabled={loading}
            />

            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Footer */}
            <TouchableOpacity
              onPress={() => router.replace("/login")}
              style={styles.footerLink}
              activeOpacity={0.7}
            >
              <Text style={styles.footerText}>
                Already have an account?{"  "}
                <Text style={styles.linkBold}>Sign In</Text>
              </Text>
            </TouchableOpacity>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  container: { flex: 1 },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingBottom: 40,
    justifyContent: "center",
  },

  // ── Lottie ──
  iconContainer: {
    alignItems: "center",
    marginTop: 20,
    marginBottom: 8,
    position: "relative",
  },
  lottieGlow: {
    position: "absolute",
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: COLORS.accent,
    opacity: 0.08,
    top: 15,
  },
  lottie: {
    width: 130,
    height: 130,
  },

  // ── Header ──
  header: {
    alignItems: "center",
    marginBottom: 28,
  },
  title: {
    fontSize: 30,
    fontWeight: "800",
    color: COLORS.textPrimary,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 6,
    letterSpacing: 0.1,
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
    paddingHorizontal: 14,
    height: 52,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 8,
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
  passwordInput: {
    paddingRight: 8,
  },
  eyeBtn: {
    padding: 4,
  },

  // ── Password Strength ──
  strengthContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: -8,
    marginBottom: 14,
  },
  strengthBars: {
    flexDirection: "row",
    gap: 4,
    flex: 1,
  },
  strengthBar: {
    flex: 1,
    height: 3,
    borderRadius: 2,
  },
  strengthLabel: {
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 0.3,
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

  // ── Divider ──
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 20,
    gap: 12,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.border,
  },
  dividerText: {
    color: COLORS.textMuted,
    fontSize: 13,
    fontWeight: "500",
  },

  // ── Footer ──
  footerLink: {
    alignItems: "center",
  },
  footerText: {
    color: COLORS.textSecondary,
    fontSize: 14,
  },
  linkBold: {
    color: COLORS.accent,
    fontWeight: "700",
  },
});
