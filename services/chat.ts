import { supabase } from "./supabaseClient";

export const getUserRooms = async (userId: string) => {
  const { data, error } = await supabase
    .from("room_members")
    .select(
      `
      room_id,
      rooms (
        id,
        name,
        description,
        created_at
      )
    `,
    )
    .eq("user_id", userId);

  return { data, error };
};

export const getRoomMessages = async (roomId: string) => {
  const { data, error } = await supabase
    .from("messages")
    .select(
      `
      id,
      content,
      created_at,
      user_id,
      profiles:user_id (
        username,
        avatar_url
      )
    `,
    )
    .eq("room_id", roomId)
    .order("created_at", { ascending: true });

  return { data, error };
};

export const sendMessage = async (
  roomId: string,
  userId: string,
  content: string,
) => {
  const { data, error } = await supabase
    .from("messages")
    .insert([
      { room_id: roomId, user_id: userId, content: content, type: "text" },
    ]);
  return { data, error };
};
