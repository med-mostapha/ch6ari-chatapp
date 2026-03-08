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
