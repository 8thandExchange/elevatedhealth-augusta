import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { providerSystemPrompt } from "./prompts.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Authorization required" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);

    if (userError || !userData.user) {
      return new Response(
        JSON.stringify({ error: "Invalid authentication" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const { data: roles } = await supabaseClient
      .from("user_roles")
      .select("role")
      .eq("user_id", userData.user.id);

    const hasAccess = roles?.some((r) => r.role === "admin" || r.role === "staff");
    if (!hasAccess) {
      return new Response(
        JSON.stringify({ error: "Access denied. Staff or admin role required." }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const { message, context } = await req.json();

    let patientStatsAppendix = "";
    if (
      typeof message === "string" &&
      (message.toLowerCase().includes("patient") || message.toLowerCase().includes("how many"))
    ) {
      const { data: patientStats } = await supabaseClient
        .from("patients")
        .select("id, onboarding_status, membership_tier", { count: "exact" })
        .eq("is_archived", false);

      const total = patientStats?.length || 0;
      const active = patientStats?.filter((p) => p.onboarding_status === "treatment_active").length || 0;
      const pending =
        patientStats?.filter((p) => ["pending_invite", "intake_complete"].includes(p.onboarding_status || ""))
          .length || 0;
      const vitalityMembers = patientStats?.filter((p) => p.membership_tier === "vitality").length || 0;
      const conciergeMembers = patientStats?.filter((p) => p.membership_tier === "concierge").length || 0;

      patientStatsAppendix = `

## Live non-archived patients row snapshot (membership_tier reflects legacy DB enum values)
- Total rows returned: ${total}
- onboarding_status treatment_active: ${active}
- onboarding_status pending_invite or intake_complete: ${pending}
- membership_tier vitality: ${vitalityMembers}
- membership_tier concierge: ${conciergeMembers}
`;
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const staffContext =
      typeof context === "string" && context.trim().length > 0 ? context.trim() : "General question";

    const systemMessage = `${providerSystemPrompt}
${patientStatsAppendix}
## Staff-portal context (this request)
${staffContext}`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemMessage },
          { role: "user", content: message },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);

      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }

      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI service credits exhausted. Please contact admin." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }

      throw new Error("AI service unavailable");
    }

    const data = await response.json();
    const assistantMessage = data.choices?.[0]?.message?.content ||
      "I couldn't generate a response. Please try again.";

    return new Response(
      JSON.stringify({ response: assistantMessage }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (error) {
    console.error("Provider chat error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "An error occurred" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
