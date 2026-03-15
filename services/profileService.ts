import { Platform } from "react-native";
import { supabase } from "./supabaseClient";

export const createProfile = async (userId: string, username: string) => {
  const { data, error } = await supabase.from("profiles").insert([
    {
      id: userId,
      username: username,
    },
  ]);

  return { data, error };
};

export const updatePushToken = async (
  userId: string,
  token: string,
) => {
  const { error } = await supabase
    .from("push_tokens")
    .upsert(
      {
        user_id: userId,
        token,
        platform: Platform.OS, 
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id, token" }
    );

  return { error };
};

export const removePushToken = async (
  userId: string,
  token: string,
) => {
  const { error } = await supabase
    .from("push_tokens")
    .delete()
    .eq("user_id", userId)
    .eq("token", token);

  return { error };
};