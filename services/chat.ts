import { supabase } from "./supabaseClient";

// services/chat.ts

// services/chat.ts

export const getUserRooms = async (userId: string) => {
  const { data, error } = await supabase
    .from("room_members")
    .select(
      `
      room_id,
      rooms (
        id,
        name,
        messages (
          content,
          created_at
        )
      )
    `,
    )
    .eq("user_id", userId)
    .order("created_at", {
      referencedTable: "rooms.messages",
      ascending: false,
    });

  return { data, error };
};

export const createTestChat = async (userId: string, otherUserName: string) => {
  // 1. Create room
  const { data: room, error: roomError } = await supabase
    .from("rooms")
    .insert([{ name: otherUserName, created_by: userId }])
    .select()
    .single();

  if (roomError) return { error: roomError };

  // 2.Add user as member in room
  const { error: memberError } = await supabase
    .from("room_members")
    .insert([{ room_id: room.id, user_id: userId, role: "owner" }]);

  return { data: room, error: memberError };
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
