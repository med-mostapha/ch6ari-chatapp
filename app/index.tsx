import { Redirect } from "expo-router";

export default function Index() {
  // Logic to check if user is logged in (e.g., from a global state or hook)
  const isAuthenticated = false;

  if (!isAuthenticated) {
    return <Redirect href="/login" />;
  }

  return <Redirect href="/(tabs)/chats" />;
}
