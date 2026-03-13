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

export const updatePushToken = async (userId: string, token: string) => {
  const { error } = await supabase
    .from("profiles")
    .update({ expo_push_token: token })
    .eq("id", userId);
  
  return { error };
};