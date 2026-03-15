import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

Deno.serve(async (req: Request) => {
  try {
    const payload = await req.json()
    const { record } = payload

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
        push_tokens!inner (
          token,
          platform
        )
      `)
      .eq("room_id", record.room_id)
      .neq("user_id", record.user_id)

    if (membersError) {
      throw new Error(`DB Error: ${membersError.message}`)
    }

    const validTokens: string[] = (members ?? [])
      .flatMap((m: any) => m.push_tokens ?? [])
      .map((t: any) => t.token)
      .filter(
        (token: unknown): token is string =>
          typeof token === "string" && token.startsWith("ExponentPushToken[")
      )

    if (validTokens.length === 0) {
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

    const notifications = validTokens.map((token) => ({
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

    return new Response(
      JSON.stringify({ success: true, sent_to: validTokens.length, expoResult }),
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