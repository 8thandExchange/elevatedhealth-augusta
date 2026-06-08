/**
 * capture-website-lead (legacy name: send-to-gohighlevel)
 *
 * Stores website chat / voice agent leads in Supabase chat_leads.
 * GHL webhook removed — leads appear in Office Manager Dashboard.
 */
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();

    const {
      name,
      email,
      phone,
      interest,
      chat_summary,
      source = "website_chat",
    } = body;

    console.log("Capturing website lead:", { name, email, phone, interest, source });

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { data: lead, error } = await supabase
      .from("chat_leads")
      .insert({
        name: name || null,
        email: email || null,
        phone: phone || null,
        interest: interest || "General Inquiry",
        source: source === "voice_agent" ? "voice" : source,
        chat_summary: chat_summary || null,
        status: "new",
      })
      .select("id")
      .single();

    if (error) {
      throw new Error(`Failed to save lead: ${error.message}`);
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "Lead captured successfully",
        lead_id: lead.id,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      },
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error capturing lead:", errorMessage);
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      },
    );
  }
});
