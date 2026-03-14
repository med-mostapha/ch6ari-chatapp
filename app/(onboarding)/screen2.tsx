import { useRouter } from "expo-router";
import LottieView from "lottie-react-native";
import React, { useRef } from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  C,
  DotIndicator,
  FadeInLottie,
  GlowOrb,
  OnboardingButton,
  SlideText,
} from "./_shared";

const ACCENT = C.accent2; // Green for this screen

export default function OnboardingScreen2() {
  const router = useRouter();
  const lottieRef = useRef<LottieView>(null);

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* ── Ambient background orbs ── */}
      <GlowOrb color={ACCENT} size={300} top={-60} right={-80} delay={200} />
      <GlowOrb color={ACCENT} size={180} bottom={120} left={-50} delay={1000} />

      <View style={styles.container}>
        {/* ── Skip button ── */}
        <View style={styles.topRow}>
          <TouchableOpacity
            onPress={() => router.back()}
            activeOpacity={0.7}
            style={styles.backBtn}
          >
            <Text style={styles.backText}>←</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => router.replace("/(auth)/login")}
            activeOpacity={0.7}
            style={styles.skipBtn}
          >
            <Text style={styles.skipText}>Skip</Text>
          </TouchableOpacity>
        </View>

        {/* ── Lottie illustration ── */}
        <FadeInLottie>
          <View style={styles.lottieContainer}>
            <View style={[styles.lottieRing, { borderColor: ACCENT + "30" }]} />
            <LottieView
              ref={lottieRef}
              source={require("../../assets/icons/singing-contract.json")}
              style={styles.lottie as ViewStyle}
              autoPlay
              loop
            />
          </View>
        </FadeInLottie>

        {/* ── Text ── */}
        <View style={styles.textSection}>
          <SlideText
            title={"Groups &\nTeamwork"}
            subtitle={
              "Create group chats for your team, family, or friends. Invite members, manage roles, and keep everyone in sync."
            }
            delay={200}
          />

          {/* Feature bullets */}
          <View style={styles.featureList}>
            {[
              { icon: "👥", text: "Unlimited group members" },
              { icon: "⚡", text: "Real-time message sync" },
              { icon: "🛡️", text: "Owner controls & moderation" },
            ].map((f, i) => (
              <View key={i} style={styles.featureRow}>
                <Text style={styles.featureIcon}>{f.icon}</Text>
                <Text style={styles.featureText}>{f.text}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* ── Bottom section ── */}
        <View style={styles.bottomSection}>
          <DotIndicator total={3} current={1} accentColor={ACCENT} />

          <View style={styles.btnWrapper}>
            <OnboardingButton
              label="Next  →"
              onPress={() => router.push("/(onboarding)/screen3")}
              color={ACCENT}
            />
          </View>
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
  skipBtn: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
  },
  skipText: {
    color: C.textMuted,
    fontSize: 13,
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
    width: 230,
    height: 230,
    borderRadius: 115,
    borderWidth: 1.5,
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
    gap: 20,
  },

  // Feature bullets
  featureList: {
    gap: 10,
  },
  featureRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: C.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: C.border,
    paddingVertical: 11,
    paddingHorizontal: 14,
    gap: 12,
  },
  featureIcon: {
    fontSize: 18,
  },
  featureText: {
    fontSize: 14,
    fontWeight: "500",
    color: C.textSecondary,
  },

  // ── Bottom ──
  bottomSection: {
    gap: 24,
  },
  btnWrapper: {},
});
