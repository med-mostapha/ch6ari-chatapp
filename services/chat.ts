import { supabase } from "./supabaseClient";

export const deleteMessages = async (messageIds: string[]) => {
  try {
    const { error } = await supabase
      .from("messages")
      .delete()
      .in("id", messageIds);

    return { error };
  } catch (err) {
    return { error: err };
  }
};

export const deleteRoom = async (roomId: string) => {
  try {
    const { error } = await supabase.from("rooms").delete().eq("id", roomId);

    return { error };
  } catch (error) {
    return { error };
  }
};

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

export const startNewChat = async (
  currentUserId: string,
  targetUserId: string,
  targetUserName: string,
) => {
  try {
    const { data: existingRooms, error: searchError } = await supabase.rpc(
      "get_existing_chat_room",
      {
        user1: currentUserId,
        user2: targetUserId,
      },
    );

    if (existingRooms && existingRooms.length > 0) {
      return { data: existingRooms[0], error: null };
    }

    const { data: room, error: roomError } = await supabase
      .from("rooms")
      .insert([{ name: targetUserName || "New Chat" }])
      .select()
      .single();

    if (roomError) throw roomError;

    const { error: membersError } = await supabase.from("room_members").insert([
      { room_id: room.id, user_id: currentUserId },
      { room_id: room.id, user_id: targetUserId },
    ]);

    if (membersError) throw membersError;

    return { data: room, error: null };
  } catch (error) {
    console.error("Error starting chat:", error);
    return { data: null, error };
  }
};

export const searchUsers = async (query: string, currentUserId: string) => {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, username, avatar_url")
    .ilike("username", `%${query}%`)
    .neq("id", currentUserId)
    .limit(10);

  return { data, error };
};

export const createRoom = async (name: string, userId: string) => {
  try {
    const { data, error } = await supabase
      .from("rooms")
      .insert([
        {
          name,
          created_by: userId,
        },
      ])
      .select()
      .single();

    if (error) throw error;

    await supabase
      .from("room_members")
      .insert([{ room_id: data.id, user_id: userId }]);

    return { data, error: null };
  } catch (error) {
    return { data: null, error };
  }
};

export const inviteUserToRoom = async (
  roomId: string,
  targetUserId: string,
) => {
  try {
    const { data: exists } = await supabase
      .from("room_members")
      .select("id")
      .match({ room_id: roomId, user_id: targetUserId })
      .single();

    if (exists) return { error: { message: "User already in room" } };

    const { error } = await supabase
      .from("room_members")
      .insert([{ room_id: roomId, user_id: targetUserId }]);

    return { error };
  } catch (error) {
    return { error };
  }
};
