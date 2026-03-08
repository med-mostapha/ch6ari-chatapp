import { supabase } from "./supabaseClient";

// دالة لجلب الغرف التي يشارك فيها المستخدم حالياً
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
