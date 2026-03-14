import { supabase } from "@/services/supabaseClient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Redirect } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  StyleSheet,
  Text,
  View,
} from "react-native";

const ONBOARDING_KEY = "has_seen_onboarding";

type RouteDecision = "loading" | "onboarding" | "login" | "chats";

export default function Index() {
  const [decision, setDecision] = useState<RouteDecision>("loading");

  // Branded loading animations
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoScale = useRef(new Animated.Value(0.7)).current;
  const dotOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Animate the splash logo in
    Animated.parallel([
      Animated.timing(logoOpacity, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.spring(logoScale, {
        toValue: 1,
        useNativeDriver: true,
        speed: 10,
        bounciness: 8,
      }),
    ]).start();

    Animated.timing(dotOpacity, {
      toValue: 1,
      duration: 400,
      delay: 400,
      useNativeDriver: true,
    }).start();

    // Route decision logic
    const decide = async () => {
      try {
        // Step 1: has the user seen onboarding?
        const seen = await AsyncStorage.getItem(ONBOARDING_KEY);

        if (!seen) {
          setTimeout(() => setDecision("onboarding"), 800);
          return;
        }

        // Step 2: is there a valid Supabase session?
        const {
          data: { session },
        } = await supabase.auth.getSession();

        setTimeout(() => setDecision(session ? "chats" : "login"), 800);
      } catch (e) {
        // On any error, fall back to login
        setTimeout(() => setDecision("login"), 800);
      }
    };

    decide();
  }, []);

  // ── Route once decision is made ──
  if (decision === "onboarding") {
    return <Redirect href="/(onboarding)/screen1" />;
  }
  if (decision === "login") {
    return <Redirect href="/(auth)/login" />;
  }
  if (decision === "chats") {
    return <Redirect href="/(tabs)/chats" />;
  }

  // ── Branded splash / loading screen ──
  return (
    <View style={styles.container}>
      {/* Ambient glow */}
      <View style={styles.glow} />

      {/* Logo mark */}
      <Animated.View
        style={[
          styles.logoContainer,
          { opacity: logoOpacity, transform: [{ scale: logoScale }] },
        ]}
      >
        {/* Icon */}
        <View style={styles.logoIconBox}>
          <Text style={styles.logoIcon}>💬</Text>
        </View>
        <Text style={styles.logoText}>ChatApp</Text>
        <Text style={styles.logoTagline}>Messages that matter</Text>
      </Animated.View>

      {/* Loading indicator */}
      <Animated.View style={[styles.loadingRow, { opacity: dotOpacity }]}>
        <ActivityIndicator size="small" color="#6C63FF" />
        <Text style={styles.loadingText}>Loading...</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0A0A0F",
    justifyContent: "center",
    alignItems: "center",
  },

  // Ambient glow behind the logo
  glow: {
    position: "absolute",
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: "#6C63FF",
    opacity: 0.07,
  },

  // Logo
  logoContainer: {
    alignItems: "center",
    gap: 10,
  },
  logoIconBox: {
    width: 80,
    height: 80,
    borderRadius: 24,
    backgroundColor: "#13131A",
    borderWidth: 1,
    borderColor: "#2A2A3D",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 4,
    // Subtle glow
    shadowColor: "#6C63FF",
    shadowOpacity: 0.3,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
  logoIcon: {
    fontSize: 36,
  },
  logoText: {
    fontSize: 28,
    fontWeight: "800",
    color: "#F1F1F5",
    letterSpacing: -0.5,
  },
  logoTagline: {
    fontSize: 14,
    color: "#5A5A72",
    fontWeight: "500",
  },

  // Loading row at the bottom
  loadingRow: {
    position: "absolute",
    bottom: 60,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  loadingText: {
    fontSize: 13,
    color: "#5A5A72",
    fontWeight: "500",
  },
});
