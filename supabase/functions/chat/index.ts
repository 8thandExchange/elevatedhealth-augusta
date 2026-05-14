import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { z } from "https://deno.land/x/zod@v3.23.8/mod.ts";
import { systemPrompt } from "./prompts.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Input validation schema
const messageSchema = z.object({
  role: z.enum(["user", "assistant", "system"]),
  content: z.string().max(10000, "Message content too long"),
});

const captureLeadInfoSchema = z.object({
  name: z.string().max(100).optional().nullable(),
  email: z.string().email().max(255).optional().nullable(),
  phone: z.string().max(20).optional().nullable(),
  interest: z.string().max(100).optional().nullable(),
}).optional().nullable();

const chatRequestSchema = z.object({
  messages: z.array(messageSchema).max(50, "Too many messages"),
  captureLeadInfo: captureLeadInfoSchema,
});

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const rawBody = await req.json();
    
    // Validate input against schema
    const validationResult = chatRequestSchema.safeParse(rawBody);
    if (!validationResult.success) {
      console.error("Validation error:", validationResult.error.errors);
      return new Response(
        JSON.stringify({ error: "Invalid request format" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    const { messages, captureLeadInfo } = validationResult.data;
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log("Received validated chat request with", messages.length, "messages");

    // If we're capturing lead info, save it to the database and trigger GoHighLevel
    if (captureLeadInfo && SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY) {
      const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
      
      // Summarize the conversation
      const chatSummary = messages
        .filter((m: any) => m.role === "user")
        .map((m: any) => m.content)
        .join(" | ");
      
      const { data: leadData, error } = await supabase.from("chat_leads").insert({
        name: captureLeadInfo.name || null,
        email: captureLeadInfo.email || null,
        phone: captureLeadInfo.phone || null,
        interest: captureLeadInfo.interest || "general",
        chat_summary: chatSummary.substring(0, 500),
        source: "chatbot",
      }).select().single();

      if (error) {
        console.error("Error saving lead:", error);
      } else {
        console.log("Lead captured successfully:", leadData?.id);
        
        // Trigger GoHighLevel webhook
        try {
          const ghlResponse = await fetch(`${SUPABASE_URL}/functions/v1/send-to-gohighlevel`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              name: captureLeadInfo.name,
              email: captureLeadInfo.email,
              phone: captureLeadInfo.phone,
              interest: captureLeadInfo.interest || "general",
              chat_summary: chatSummary.substring(0, 500),
              source: 'website_chat',
              lead_id: leadData?.id
            })
          });
          
          if (ghlResponse.ok) {
            console.log("Lead sent to GoHighLevel successfully");
          } else {
            console.error("GoHighLevel webhook failed:", await ghlResponse.text());
          }
        } catch (ghlError) {
          console.error("Error sending to GoHighLevel:", ghlError);
        }
      }
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          {
            status: 429,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Service temporarily unavailable. Please try again later." }),
          {
            status: 402,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      const errorText = await response.text();
      console.error("AI Gateway error:", response.status, errorText);
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content || "I'm sorry, I couldn't generate a response. Please try again or call us at (706) 760-3470.";

    console.log("AI response generated successfully");

    return new Response(JSON.stringify({ response: reply }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Chat function error:", error);
    return new Response(
      JSON.stringify({ 
        error: "I'm having trouble connecting right now. Please call us at (706) 760-3470 for immediate assistance." 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
