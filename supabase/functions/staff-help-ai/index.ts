import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

type AuthResult =
  | { ok: true; user_id: string; roles: string[] }
  | { ok: false; status: number; error: string };

async function requireProviderSideRole(req: Request): Promise<AuthResult> {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader) {
    return { ok: false, status: 401, error: "Missing Authorization header" };
  }

  const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
  const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
  const supabaseAuth = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: authHeader } },
  });
  const { data: userData, error: userErr } = await supabaseAuth.auth.getUser();
  if (userErr || !userData?.user) {
    return { ok: false, status: 401, error: "Invalid or expired session" };
  }

  const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
  const { data: rolesRows } = await supabaseAdmin
    .from("user_roles")
    .select("role")
    .eq("user_id", userData.user.id);

  const roles = (rolesRows || []).map((r) => r.role);
  const ok = roles.some((r) =>
    r === "admin" || r === "staff" || r === "provider" || r === "business_admin"
  );
  if (!ok) {
    return { ok: false, status: 403, error: "Provider-side role required" };
  }

  return { ok: true, user_id: userData.user.id, roles };
}

function redactLikelyPII(input: string): string {
  return input
    .replace(/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi, "[REDACTED_EMAIL]")
    .replace(/\b(\+?1[\s-]?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}\b/g, "[REDACTED_PHONE]");
}

const KNOWLEDGE_BASE = `
You are the internal staff help assistant for Elevated Health Augusta (EHA).
Goal: Give concise, step-by-step instructions for using the staff portal.

Hard rules:
- NO medical advice. NO dosing. NO diagnosis. If asked, advise to escalate to the clinician/medical director.
- Do not request or retain patient identifiers. If the user mentions a patient name/email/phone, ignore it and answer generically.
- If an action requires admin permissions, say so clearly.
- Prefer sending the user to the exact route in the staff portal.

Key staff portal routes:
- My Schedule (provider availability + time off): /provider/schedule
- Office Schedule (office-wide day/week view): /office/schedule
- Provider Dashboard (patients, tasks, labs, messaging): /provider/dashboard
- Inventory: /inventory
- Formulary: /formulary

How to: Update schedule (recurring availability)
1) Go to /provider/schedule
2) Click+drag on the calendar grid to create availability blocks
3) Confirm you're viewing the correct week (Mon–Sun)
4) If patients can't find times, confirm availability exists for that day/time

How to: Block time off (PTO / lunch / meeting)
1) Go to /provider/schedule
2) Use Time Off / block tool to set start/end
3) Save; refresh if needed; confirm block covers full window

If booking questions:
- IV Therapy is direct booking on the public site (/iv-lounge). No consult required.
- Hormones/peptides/weight loss start with $79 Wellness Assessment (public booking flow).
In staff portal, use Office Schedule to coordinate when someone is stuck.
`;

async function callLovableChat(apiKey: string, messages: Array<{ role: string; content: string }>) {
  const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash",
      messages,
      temperature: 0.2,
      max_tokens: 500,
    }),
  });

  if (!resp.ok) {
    const text = await resp.text();
    console.error("staff-help-ai: LLM error", resp.status, text);
    if (resp.status === 429) return { ok: false, status: 429, error: "Rate limit. Try again in a moment." };
    if (resp.status === 402) return { ok: false, status: 402, error: "AI credits exhausted. Contact admin." };
    return { ok: false, status: 500, error: "AI service error." };
  }

  const json = await resp.json();
  const content = json?.choices?.[0]?.message?.content;
  if (!content) return { ok: false, status: 500, error: "No AI response." };
  return { ok: true, content };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const auth = await requireProviderSideRole(req);
  if (!auth.ok) {
    return new Response(JSON.stringify({ error: auth.error }), {
      status: auth.status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const body = await req.json();
    const questionRaw = String(body?.question || "").trim();
    const pathname = String(body?.pathname || "").trim();

    if (!questionRaw) {
      return new Response(JSON.stringify({ error: "question is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const question = redactLikelyPII(questionRaw);

    const messages = [
      { role: "system", content: KNOWLEDGE_BASE },
      {
        role: "user",
        content:
          `User role(s): ${auth.roles.join(", ")}\n` +
          `Current page: ${pathname || "(unknown)"}\n\n` +
          `Question: ${question}\n\n` +
          "Answer with short steps and (when relevant) the exact portal route to click next.",
      },
    ];

    const ai = await callLovableChat(LOVABLE_API_KEY, messages);
    if (!ai.ok) {
      return new Response(JSON.stringify({ error: ai.error }), {
        status: ai.status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ answer: ai.content }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("staff-help-ai error:", err);
    return new Response(JSON.stringify({ error: "Unexpected error." }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

