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

export const deleteRoom = async (roomId: string, ownerName: string) => {
  try {
    await supabase.from("messages").insert([
      {
        room_id: roomId,
        content: `⚠️ ${ownerName} has deleted this group.`,
        type: "system",
      },
    ]);

    await new Promise((resolve) => setTimeout(resolve, 500));

    const { error } = await supabase.from("rooms").delete().eq("id", roomId);

    if (error) {
      console.error("Supabase Delete Error:", error);
      return { error };
    }

    return { error: null };
  } catch (error) {
    console.error("Catch Delete Error:", error);
    return { error };
  }
};

export const kickUser = async (
  roomId: string,
  targetUserId: string,
  targetUserName: string,
  ownerName: string,
) => {
  try {
    await supabase.from("messages").insert([
      {
        room_id: roomId,
        user_id: null,
        content: `🚫 ${ownerName} removed ${targetUserName} from the group.`,
        type: "system",
      },
    ]);

    await supabase.channel(`room-events-${roomId}`).send({
      type: "broadcast",
      event: "user-kicked",
      payload: { userId: targetUserId },
    });

    const { error } = await supabase
      .from("room_members")
      .delete()
      .match({ room_id: roomId, user_id: targetUserId });

    return { error };
  } catch (error) {
    console.error("Kick Error:", error);
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
        is_group,
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
    const { data: existingRooms } = await supabase
      .from("room_members")
      .select("room_id, rooms!inner(is_group)")
      .eq("user_id", currentUserId)
      .eq("rooms.is_group", false);

    let targetRoom = null;
    if (existingRooms) {
      for (const r of existingRooms) {
        const { data: member } = await supabase
          .from("room_members")
          .select("id")
          .eq("room_id", r.room_id)
          .eq("user_id", targetUserId)
          .single();
        if (member) {
          targetRoom = r;
          break;
        }
      }
    }

    if (targetRoom) {
      return { data: { id: targetRoom.room_id }, error: null };
    }

    const { data: room, error: roomError } = await supabase
      .from("rooms")
      .insert([{ name: targetUserName, is_group: false }])
      .select()
      .single();

    if (roomError) throw roomError;

    await supabase.from("room_members").insert([
      { room_id: room.id, user_id: currentUserId },
      { room_id: room.id, user_id: targetUserId },
    ]);

    return { data: room, error: null };
  } catch (error) {
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
          is_group: true,
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

export const notifyRefresh = async (userId: string) => {
  await supabase.channel("global-sync").send({
    type: "broadcast",
    event: "refresh-chats",
    payload: { userId },
  });
};

export const inviteUserToRoom = async (
  roomId: string,
  targetUserId: string,
  inviterId: string,
  inviterName: string,
  targetUserName: string,
) => {
  try {
    const { data: existingMember } = await supabase
      .from("room_members")
      .select("id")
      .match({ room_id: roomId, user_id: targetUserId })
      .single();

    if (existingMember) {
      return { error: "User is already in this room" };
    }

    const { error: inviteError } = await supabase
      .from("room_members")
      .insert([{ room_id: roomId, user_id: targetUserId }]);

    if (inviteError) return { error: inviteError };

    await supabase.from("messages").insert([
      {
        room_id: roomId,
        user_id: null,
        content: `➕ ${inviterName} added ${targetUserName}`,
        type: "system",
      },
    ]);

    await supabase.channel("global-sync").send({
      type: "broadcast",
      event: "refresh-chats",
      payload: { userId: targetUserId },
    });

    return { error: null };
  } catch (error) {
    console.error("Invite Error:", error);
    return { error };
  }
};

export const getRoomMembers = async (roomId: string) => {
  try {
    const { data, error } = await supabase
      .from("room_members")
      .select(
        `
        user_id,
        profiles:user_id (
          username,
          avatar_url
        )
      `,
      )
      .eq("room_id", roomId);

    return { data, error };
  } catch (error) {
    return { data: null, error };
  }
};

export const getUsernameById = async (userId: string) => {
  const { data } = await supabase
    .from("profiles")
    .select("username")
    .eq("id", userId)
    .single();
  return data?.username || "Unknown User";
};

export const leaveRoom = async (
  roomId: string,
  userId: string,
  isOwner: boolean,
) => {
  try {
    if (isOwner) {
      const ownerName = await getUsernameById(userId);
      return await deleteRoom(roomId, ownerName);
    } else {
      const username = await getUsernameById(userId);

      await supabase.from("messages").insert([
        {
          room_id: roomId,
          user_id: userId,
          content: `${username} left the chat`,
          type: "system",
        },
      ]);

      const { error } = await supabase
        .from("room_members")
        .delete()
        .match({ room_id: roomId, user_id: userId });

      return { error };
    }
  } catch (error) {
    return { error };
  }
};
