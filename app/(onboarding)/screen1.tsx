import {
  C,
  DotIndicator,
  FadeInLottie,
  GlowOrb,
  OnboardingButton,
  SlideText,
} from "@/components/onboarding/shared";
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

export default function OnboardingScreen1() {
  const router = useRouter();
  const lottieRef = useRef<LottieView>(null);

  return (
    <SafeAreaView style={styles.safeArea}>
      <GlowOrb color={C.accent} size={340} top={-80} left={-100} delay={0} />
      <GlowOrb
        color={C.accent}
        size={200}
        bottom={100}
        right={-60}
        delay={800}
      />

      <View style={styles.container}>
        {/* ── Top row ── */}
        <View style={styles.topRow}>
          <View />
          <TouchableOpacity
            onPress={() => router.replace("/(auth)/login")}
            activeOpacity={0.7}
            style={styles.skipBtn}
          >
            <Text style={styles.skipText}>Skip</Text>
          </TouchableOpacity>
        </View>

        {/* ── Lottie ── */}
        <FadeInLottie>
          <View style={styles.lottieContainer}>
            <View
              style={[styles.lottieRing, { borderColor: C.accent + "30" }]}
            />
            <LottieView
              ref={lottieRef}
              source={require("../../assets/onboarding/chating_1.json")}
              style={styles.lottie as ViewStyle}
              autoPlay
              loop
            />
          </View>
        </FadeInLottie>

        {/* ── Text ── */}
        <View style={styles.textSection}>
          <SlideText
            title={"Connect\nInstantly"}
            subtitle="Send messages, share moments, and stay in touch with the people who matter most — all in one place."
            delay={200}
          />
        </View>

        {/* ── Bottom ── */}
        <View style={styles.bottomSection}>
          <DotIndicator total={3} current={0} accentColor={C.accent} />
          <OnboardingButton
            label="Next  →"
            onPress={() => router.push("/(onboarding)/screen2")}
            color={C.accent}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: C.bg },
  container: { flex: 1, paddingHorizontal: 28, paddingBottom: 20 },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 8,
    marginBottom: 16,
  },
  skipBtn: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
  },
  skipText: { color: C.textMuted, fontSize: 13, fontWeight: "600" },
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
  lottie: { width: 200, height: 200 },
  textSection: { flex: 1, justifyContent: "center", paddingHorizontal: 8 },
  bottomSection: { gap: 24 },
});
