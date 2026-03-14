import React, { useEffect, useRef } from "react";
import { Animated, Pressable, StyleSheet, Text, View } from "react-native";

export const C = {
  bg: "#0A0A0F",
  surface: "#13131A",
  border: "#2A2A3D",
  accent: "#6C63FF", // screen 1 — violet
  accent2: "#34D399", // screen 2 — green
  accent3: "#F59E0B", // screen 3 — amber
  textPrimary: "#F1F1F5",
  textSecondary: "#8B8B9E",
  textMuted: "#5A5A72",
  white: "#FFFFFF",
};

export function GlowOrb({
  color = C.accent,
  size = 300,
  top,
  left,
  right,
  bottom,
  delay = 0,
}: {
  color?: string;
  size?: number;
  top?: number;
  left?: number;
  right?: number;
  bottom?: number;
  delay?: number;
}) {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(anim, {
          toValue: 1,
          duration: 3000 + delay,
          useNativeDriver: true,
        }),
        Animated.timing(anim, {
          toValue: 0,
          duration: 3000 + delay,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, []);

  const translateY = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -18],
  });

  const opacity = anim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.1, 0.2, 0.1],
  });

  return (
    <Animated.View
      pointerEvents="none"
      style={{
        position: "absolute",
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: color,
        top,
        left,
        right,
        bottom,
        transform: [{ translateY }],
        opacity,
      }}
    />
  );
}

export function DotIndicator({
  total,
  current,
  accentColor = C.accent,
}: {
  total: number;
  current: number;
  accentColor?: string;
}) {
  return (
    <View style={dotStyles.row}>
      {Array.from({ length: total }).map((_, i) => (
        <View
          key={i}
          style={[
            dotStyles.dot,
            i === current
              ? [dotStyles.dotActive, { backgroundColor: accentColor }]
              : dotStyles.dotInactive,
          ]}
        />
      ))}
    </View>
  );
}

const dotStyles = StyleSheet.create({
  row: {
    flexDirection: "row",
    gap: 7,
    alignItems: "center",
    justifyContent: "center",
  },
  dot: { height: 7, borderRadius: 4 },
  dotActive: { width: 24 },
  dotInactive: { width: 7, backgroundColor: "#2A2A3D" },
});

export function OnboardingButton({
  label,
  onPress,
  color = C.accent,
}: {
  label: string;
  onPress: () => void;
  color?: string;
}) {
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

  return (
    <Pressable onPress={onPress} onPressIn={onPressIn} onPressOut={onPressOut}>
      <Animated.View
        style={[
          btnStyles.btn,
          { backgroundColor: color, shadowColor: color },
          { transform: [{ scale }] },
        ]}
      >
        <Text style={btnStyles.label}>{label}</Text>
      </Animated.View>
    </Pressable>
  );
}

const btnStyles = StyleSheet.create({
  btn: {
    paddingVertical: 17,
    borderRadius: 18,
    alignItems: "center",
    shadowOpacity: 0.45,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },
  label: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: 0.3,
  },
});

export function SlideText({
  title,
  subtitle,
  delay = 0,
}: {
  title: string;
  subtitle: string;
  delay?: number;
}) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(28)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 600,
        delay,
        useNativeDriver: true,
      }),
      Animated.spring(translateY, {
        toValue: 0,
        delay,
        useNativeDriver: true,
        speed: 14,
        bounciness: 4,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View style={{ opacity, transform: [{ translateY }] }}>
      <Text style={textStyles.title}>{title}</Text>
      <Text style={textStyles.subtitle}>{subtitle}</Text>
    </Animated.View>
  );
}

const textStyles = StyleSheet.create({
  title: {
    fontSize: 32,
    fontWeight: "800",
    color: C.textPrimary,
    letterSpacing: -0.8,
    textAlign: "center",
    lineHeight: 40,
    marginBottom: 14,
  },
  subtitle: {
    fontSize: 16,
    color: C.textSecondary,
    textAlign: "center",
    lineHeight: 26,
  },
});

export function FadeInLottie({ children }: { children: React.ReactNode }) {
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.82)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 700,
        useNativeDriver: true,
      }),
      Animated.spring(scale, {
        toValue: 1,
        useNativeDriver: true,
        speed: 10,
        bounciness: 6,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View style={{ opacity, transform: [{ scale }] }}>
      {children}
    </Animated.View>
  );
}
