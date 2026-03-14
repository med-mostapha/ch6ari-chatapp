import { AuthProvider, useAuth } from "@/context/AuthContext";
import { updatePushToken } from "@/services/profileService";
import Constants from "expo-constants";
import * as Device from "expo-device";
import * as Linking from "expo-linking";
import * as Notifications from "expo-notifications";
import { Stack, useRouter, useSegments } from "expo-router";
import { useEffect, useRef } from "react";
import { ActivityIndicator, Platform, StyleSheet, View } from "react-native";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

// app/_layout.tsx - عدّل الـ function هذي مؤقتاً
async function registerForPushNotificationsAsync() {
  let token;

  console.log("🔔 [1] Starting push registration...");
  console.log("🔔 [2] Is physical device:", Device.isDevice);
  console.log("🔔 [3] Platform:", Platform.OS);

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#6C63FF",
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();
    console.log("🔔 [4] Existing permission:", existingStatus);

    let finalStatus = existingStatus;
    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    console.log("🔔 [5] Final permission:", finalStatus);

    if (finalStatus !== "granted") {
      console.log("❌ Permission not granted!");
      return;
    }

    const projectId =
      Constants?.expoConfig?.extra?.eas?.projectId ??
      Constants?.easConfig?.projectId;

    console.log("🔔 [6] ProjectId:", projectId);

    try {
      token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
      console.log("✅ [7] Token:", token);
    } catch (e: any) {
      console.log("❌ [7] Error fetching token:", e.message);
    }
  } else {
    console.log("❌ Not a physical device!");
  }

  return token;
}

function RootLayoutNav() {
  const { session, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  const notificationListener = useRef<Notifications.Subscription | null>(null);
  const responseListener = useRef<Notifications.Subscription | null>(null);

  useEffect(() => {
    if (session?.user?.id) {
      registerForPushNotificationsAsync().then(async (token) => {
        if (token) await updatePushToken(session.user.id, token);
      });

      notificationListener.current =
        Notifications.addNotificationReceivedListener((notification) => {
          console.log("Notification Received:", notification);
        });

      responseListener.current =
        Notifications.addNotificationResponseReceivedListener((response) => {
          const roomId = response.notification.request.content.data?.roomId;
          if (roomId) router.push(`/chat/${roomId}`);
        });

      return () => {
        notificationListener.current?.remove();
        responseListener.current?.remove();
      };
    }
  }, [session?.user?.id]);

  useEffect(() => {
    const handleDeepLink = (event: { url: string }) => {
      const data = Linking.parse(event.url);
      if (data.path === "reset-password") {
        router.replace("/(auth)/reset-password");
      }
    };

    const subscription = Linking.addEventListener("url", handleDeepLink);
    const checkInitialUrl = async () => {
      const url = await Linking.getInitialURL();
      if (url) handleDeepLink({ url });
    };
    checkInitialUrl();

    return () => subscription.remove();
  }, []);

  useEffect(() => {
    if (loading) return;
    const inAuthGroup = segments[0] === "(auth)";
    const isResetting = segments[1] === "reset-password";

    if (!session && !inAuthGroup) {
      router.replace("/(auth)/login");
    } else if (session && inAuthGroup && !isResetting) {
      router.replace("/(tabs)/chats");
    }
  }, [session, loading, segments]);

  // ── Premium loading screen ──
  if (loading) {
    return (
      <View style={loadingStyles.container}>
        <ActivityIndicator size="large" color="#6C63FF" />
      </View>
    );
  }

  return (
    <Stack>
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="chat" options={{ headerShown: false }} />
      <Stack.Screen
        name="new-chat"
        options={{ headerShown: false, presentation: "modal" }}
      />
      <Stack.Screen name="edit-profile" options={{ headerShown: false }} />
      <Stack.Screen name="(onboarding)" options={{ headerShown: false }} />
    </Stack>
  );
}

const loadingStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0A0A0F",
    justifyContent: "center",
    alignItems: "center",
  },
});

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootLayoutNav />
    </AuthProvider>
  );
}
