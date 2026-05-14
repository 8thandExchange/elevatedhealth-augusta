import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

/** Minimal instructions while voice service is restructured (legacy PUBLIC_KNOWLEDGE removed). */
const VOICE_INSTRUCTIONS =
  `You are a voice assistant for Elevated Health Augusta. This service line is being restructured. For now, direct all callers to: 'Thank you for calling Elevated Health Augusta. We're not available to take your call right now. Please leave a message at the tone, or visit elevatedhealthaugusta.com to book a $79 Wellness Assessment.' Then end the call gracefully.`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    if (!OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY is not set");
    }

    const response = await fetch("https://api.openai.com/v1/realtime/sessions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-realtime-preview-2024-12-17",
        voice: "sage",
        turn_detection: {
          type: "server_vad",
          threshold: 0.65,
          prefix_padding_ms: 500,
          silence_duration_ms: 1500,
        },
        instructions: VOICE_INSTRUCTIONS,
        tools: [
          {
            type: "function",
            name: "capture_lead",
            description:
              "Capture a potential patient's contact information when they express interest in services or want to be contacted. Call this when you have their name and phone/email.",
            parameters: {
              type: "object",
              properties: {
                name: {
                  type: "string",
                  description: "The caller's full name",
                },
                phone: {
                  type: "string",
                  description: "The caller's phone number",
                },
                email: {
                  type: "string",
                  description: "The caller's email address",
                },
                interest: {
                  type: "string",
                  enum: [
                    "wellness_assessment",
                    "hormone",
                    "weight_loss",
                    "peptides",
                    "iv_therapy",
                    "sexual_wellness",
                    "hair_restoration",
                    "general",
                  ],
                  description: "The primary service the caller is interested in",
                },
                notes: {
                  type: "string",
                  description: "Brief summary of what the caller mentioned or their situation",
                },
              },
              required: ["interest"],
            },
          },
        ],
        tool_choice: "auto",
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("OpenAI session error:", response.status, errorText);
      throw new Error(`Failed to create session: ${response.status}`);
    }

    const data = await response.json();
    console.log("Voice session created (minimal instructions)");

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Voice session error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
