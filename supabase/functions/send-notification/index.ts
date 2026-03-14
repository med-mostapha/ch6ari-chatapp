
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

Deno.serve(async (req: Request) => {
  try {
    const payload = await req.json()
    const { record } = payload

    console.log("Received payload:", JSON.stringify(record))

    if (!record?.room_id || !record?.user_id) {
      return new Response(
        JSON.stringify({ error: "Missing room_id or user_id" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      )
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    )

    const { data: members, error: membersError } = await supabase
      .from("room_members")
      .select(`
        user_id,
        profiles!inner (
          expo_push_token,
          username
        )
      `)
      .eq("room_id", record.room_id)
      .neq("user_id", record.user_id)

    if (membersError) {
      console.error("DB Error:", membersError.message)
      throw new Error(`DB Error: ${membersError.message}`)
    }

    console.log("Members fetched:", JSON.stringify(members))

    const pushTokens: string[] = (members ?? [])
      .map((m: any) => m.profiles?.expo_push_token)
      .filter(
        (token: unknown): token is string =>
          typeof token === "string" && token.startsWith("ExponentPushToken[")
      )

    console.log("Valid tokens:", pushTokens)

    if (pushTokens.length === 0) {
      return new Response(
        JSON.stringify({ message: "No valid tokens found" }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      )
    }

    const { data: sender } = await supabase
      .from("profiles")
      .select("username")
      .eq("id", record.user_id)
      .single()

    const notifications = pushTokens.map((token) => ({
      to: token,
      sound: "default",
      title: sender?.username ?? "Ch6ari",
      body: record.content?.length > 100
        ? record.content.substring(0, 97) + "..."
        : record.content ?? "رسالة جديدة",
      data: { roomId: record.room_id },
      priority: "high",
    }))

    const expoRes = await fetch("https://exp.host/--/api/v2/push/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "Accept-Encoding": "gzip, deflate",
      },
      body: JSON.stringify(notifications),
    })

    if (!expoRes.ok) {
      const errText = await expoRes.text()
      throw new Error(`Expo API failed: ${expoRes.status} — ${errText}`)
    }

    const expoResult = await expoRes.json()
    console.log("Expo result:", JSON.stringify(expoResult))

    return new Response(
      JSON.stringify({ success: true, sent_to: pushTokens.length, expoResult }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    )

  } catch (err: any) {
    console.error("FATAL ERROR:", err.message)
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    )
  }
})

