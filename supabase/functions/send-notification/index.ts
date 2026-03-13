import { serve } from "std/http/server.ts"
import { createClient } from "supabase"

serve(async (req: Request) => {
  try {
    const payload = await req.json()
    const { record } = payload

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { data: members, error } = await supabase
      .from('room_members')
      .select('user_id, profiles(expo_push_token, username)')
      .eq('room_id', record.room_id)
      .neq('user_id', record.user_id)

    if (error) throw error;

    const pushTokens = members
      ?.map((m: any) => m.profiles?.expo_push_token)
      .filter((token: string | null) => token !== null);

    if (!pushTokens || pushTokens.length === 0) {
      return new Response(JSON.stringify({ message: "No tokens found" }), { 
        status: 200, 
        headers: { "Content-Type": "application/json" } 
      })
    }

    const response = await fetch("https://exp.host/--/api/v2/push/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        to: pushTokens,
        title: "Ch6ari",
        body: record.content,
        data: { roomId: record.room_id },
        sound: "default",
      }),
    });

    const result = await response.json();
    return new Response(JSON.stringify(result), { 
      status: 200, 
      headers: { "Content-Type": "application/json" } 
    })

  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { 
      status: 500, 
      headers: { "Content-Type": "application/json" } 
    })
  }
})