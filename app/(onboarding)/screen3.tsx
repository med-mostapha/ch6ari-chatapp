import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import LottieView from "lottie-react-native";
import React, { useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { C, DotIndicator, FadeInLottie, GlowOrb, SlideText } from "./_shared";

const ACCENT = C.accent3; // Amber for this screen

const ONBOARDING_KEY = "has_seen_onboarding";

export default function OnboardingScreen3() {
  const router = useRouter();
  const lottieRef = useRef<LottieView>(null);
  const [loading, setLoading] = useState(false);

  const scale = useRef(new Animated.Value(1)).current;

  const onPressIn = () =>
    Animated.spring(scale, {
      toValue: 0.95,
      useNativeDriver: true,
      speed: 60,
    }).start();
  const onPressOut = () =>
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      speed: 60,
    }).start();

  const handleGetStarted = async () => {
    setLoading(true);
    // Mark onboarding as complete — index.tsx will read this
    await AsyncStorage.setItem(ONBOARDING_KEY, "true");
    setLoading(false);
    // Navigate to login
    router.replace("/(auth)/login");
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* ── Ambient background orbs ── */}
      <GlowOrb color={ACCENT} size={320} top={-100} left={-60} delay={400} />
      <GlowOrb color={ACCENT} size={150} bottom={80} right={-40} delay={1200} />

      <View style={styles.container}>
        {/* ── Top row: back only ── */}
        <View style={styles.topRow}>
          <TouchableOpacity
            onPress={() => router.back()}
            activeOpacity={0.7}
            style={styles.backBtn}
          >
            <Text style={styles.backText}>←</Text>
          </TouchableOpacity>
          {/* Step counter */}
          <View style={styles.stepBadge}>
            <Text style={styles.stepText}>3 of 3</Text>
          </View>
        </View>

        {/* ── Lottie illustration ── */}
        <FadeInLottie>
          <View style={styles.lottieContainer}>
            <View style={[styles.lottieRing, { borderColor: ACCENT + "35" }]} />
            {/* Outer decorative ring */}
            <View
              style={[styles.lottieRingOuter, { borderColor: ACCENT + "15" }]}
            />
            <LottieView
              ref={lottieRef}
              source={require("../../assets/icons/business-analysis.json")}
              style={styles.lottie as ViewStyle}
              autoPlay
              loop
            />
          </View>
        </FadeInLottie>

        {/* ── Text ── */}
        <View style={styles.textSection}>
          <SlideText
            title={"Never Miss\na Message"}
            subtitle={
              "Get instant push notifications so you're always the first to reply — even when the app is closed."
            }
            delay={200}
          />

          {/* Highlight card */}
          <View style={[styles.highlightCard, { borderColor: ACCENT + "30" }]}>
            <View
              style={[
                styles.highlightIconBox,
                { backgroundColor: ACCENT + "18" },
              ]}
            >
              <Text style={styles.highlightIcon}>🔔</Text>
            </View>
            <View style={styles.highlightText}>
              <Text style={[styles.highlightTitle, { color: ACCENT }]}>
                Smart Notifications
              </Text>
              <Text style={styles.highlightSub}>
                Only get notified for what matters to you
              </Text>
            </View>
          </View>
        </View>

        {/* ── Bottom section ── */}
        <View style={styles.bottomSection}>
          <DotIndicator total={3} current={2} accentColor={ACCENT} />

          {/* Main CTA */}
          <Pressable
            onPress={handleGetStarted}
            onPressIn={onPressIn}
            onPressOut={onPressOut}
            disabled={loading}
          >
            <Animated.View
              style={[
                styles.ctaBtn,
                { backgroundColor: ACCENT, shadowColor: ACCENT },
                { transform: [{ scale }] },
              ]}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.ctaBtnText}>Get Started 🚀</Text>
              )}
            </Animated.View>
          </Pressable>

          {/* Already have account */}
          <TouchableOpacity
            onPress={async () => {
              await AsyncStorage.setItem(ONBOARDING_KEY, "true");
              router.replace("/(auth)/login");
            }}
            activeOpacity={0.7}
            style={styles.loginLink}
          >
            <Text style={styles.loginLinkText}>
              Already have an account?{"  "}
              <Text style={[styles.loginLinkBold, { color: ACCENT }]}>
                Sign In
              </Text>
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: C.bg,
  },
  container: {
    flex: 1,
    paddingHorizontal: 28,
    paddingBottom: 20,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 8,
    marginBottom: 16,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
    justifyContent: "center",
    alignItems: "center",
  },
  backText: {
    color: C.textPrimary,
    fontSize: 18,
    fontWeight: "700",
  },
  stepBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
  },
  stepText: {
    color: C.textMuted,
    fontSize: 12,
    fontWeight: "600",
  },

  // ── Lottie ──
  lottieContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
    position: "relative",
  },
  lottieRing: {
    position: "absolute",
    width: 220,
    height: 220,
    borderRadius: 110,
    borderWidth: 1.5,
  },
  lottieRingOuter: {
    position: "absolute",
    width: 260,
    height: 260,
    borderRadius: 130,
    borderWidth: 1,
  },
  lottie: {
    width: 200,
    height: 200,
  },

  // ── Text ──
  textSection: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 8,
    gap: 18,
  },
  highlightCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: C.surface,
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    gap: 12,
  },
  highlightIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  highlightIcon: {
    fontSize: 22,
  },
  highlightText: {
    flex: 1,
  },
  highlightTitle: {
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 3,
  },
  highlightSub: {
    fontSize: 12,
    color: C.textMuted,
  },

  // ── Bottom ──
  bottomSection: {
    gap: 16,
  },
  ctaBtn: {
    paddingVertical: 17,
    borderRadius: 18,
    alignItems: "center",
    shadowOpacity: 0.45,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },
  ctaBtnText: {
    color: C.white,
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: 0.3,
  },
  loginLink: {
    alignItems: "center",
    paddingVertical: 4,
  },
  loginLinkText: {
    color: C.textMuted,
    fontSize: 14,
  },
  loginLinkBold: {
    fontWeight: "700",
  },
});
