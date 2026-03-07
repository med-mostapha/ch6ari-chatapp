import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="register"
        options={{
          headerTitle: "Register",
          headerTitleAlign: "center",
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="login"
        options={{
          headerTitle: "Login",
          headerTitleAlign: "center",
          headerShown: false,
        }}
      />
    </Stack>
  );
}
