import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

interface ParsedLabResult {
  collectionDate: string | null;
  patientName: string | null;
  labSource: 'zrt' | 'labcorp' | 'unknown';
  // ZRT saliva fields
  estradiol: number | null;
  progesterone: number | null;
  testosterone: number | null;
  dheas: number | null;
  cortisol: number | null;
  pgE2Ratio: number | null;
  // LabCorp blood fields
  hematocrit: number | null;
  psa: number | null;
  alt: number | null;
  ast: number | null;
  a1c: number | null;
  tsh: number | null;
  freeT3: number | null;
  freeT4: number | null;
  vitaminD: number | null;
  fastingInsulin: number | null;
  triglycerides: number | null;
  hdl: number | null;
  ldl: number | null;
  confidence: {
    overall: number;
    fields: Record<string, number>;
  };
}

function buildPrompt(): string {
  return `You are a medical lab result extraction system. Analyze this lab report PDF and extract values.

FIRST, determine the lab source:
- If you see "ZRT Laboratory" or "Saliva Profile" → labSource = "zrt"
- If you see "LabCorp" or "Laboratory Corporation" → labSource = "labcorp"
- Otherwise → labSource = "unknown"

Extract ALL available values from the report. Return ONLY valid JSON, no markdown.

For ZRT reports, extract:
- collectionDate, patientName, estradiol (pg/mL), progesterone (pg/mL), testosterone (pg/mL), dheas (ng/mL), cortisol (morning ng/mL), pgE2Ratio

For LabCorp reports, extract:
- collectionDate, patientName, hematocrit (%), psa (ng/mL), alt (U/L), ast (U/L), a1c (%), tsh (mIU/L), freeT3 (pg/mL), freeT4 (ng/dL), vitaminD (ng/mL), fastingInsulin (uIU/mL), triglycerides (mg/dL), hdl (mg/dL), ldl (mg/dL)

For unknown sources, extract whatever hormone or blood values you can identify.

Return this JSON structure:
{"labSource":"zrt","collectionDate":"2026-01-19","patientName":"Name Here","estradiol":2.1,"progesterone":20,"testosterone":19,"dheas":1.2,"cortisol":8.3,"pgE2Ratio":10,"hematocrit":null,"psa":null,"alt":null,"ast":null,"a1c":null,"tsh":null,"freeT3":null,"freeT4":null,"vitaminD":null,"fastingInsulin":null,"triglycerides":null,"hdl":null,"ldl":null,"confidence":{"overall":0.95,"fields":{"estradiol":0.99}}}

Use null for any values not found. Return ONLY the JSON object.`;
}

function repairJson(jsonStr: string): string {
  // Remove markdown code fences
  jsonStr = jsonStr.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/i, '').trim();

  // Find JSON boundaries
  const startIdx = jsonStr.indexOf('{');
  const endIdx = jsonStr.lastIndexOf('}');
  if (startIdx !== -1 && endIdx !== -1 && endIdx > startIdx) {
    jsonStr = jsonStr.substring(startIdx, endIdx + 1);
  }

  // Fix truncated JSON
  let braceCount = 0;
  for (const char of jsonStr) {
    if (char === '{') braceCount++;
    if (char === '}') braceCount--;
  }
  if (braceCount > 0) {
    jsonStr = jsonStr.replace(/,\s*$/, '');
    while (braceCount > 0) { jsonStr += '}'; braceCount--; }
  }

  return jsonStr;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) throw new Error('LOVABLE_API_KEY is not configured');

    const { pdfBase64, mimeType = 'application/pdf' } = await req.json();
    if (!pdfBase64) throw new Error('PDF data is required');

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [{
          role: 'user',
          content: [
            { type: 'text', text: buildPrompt() },
            { type: 'image_url', image_url: { url: `data:${mimeType};base64,${pdfBase64}` } }
          ]
        }],
        max_tokens: 800,
        temperature: 0,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI API error:', response.status, errorText);
      if (response.status === 429) {
        return new Response(JSON.stringify({ success: false, error: 'Rate limit exceeded. Please try again in a moment.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ success: false, error: 'AI credits exhausted. Please add funds.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }
      throw new Error(`AI API call failed [${response.status}]`);
    }

    const aiResult = await response.json();
    const content = aiResult.choices?.[0]?.message?.content;
    if (!content) throw new Error('No response from AI model');

    console.log('AI raw response:', content);

    let parsedResult: ParsedLabResult;
    try {
      const jsonStr = repairJson(content.trim());
      parsedResult = JSON.parse(jsonStr);

      if (typeof parsedResult !== 'object' || parsedResult === null) {
        throw new Error('Invalid response structure');
      }

      // Default labSource
      if (!parsedResult.labSource) parsedResult.labSource = 'unknown';

      // Ensure confidence
      if (!parsedResult.confidence) {
        parsedResult.confidence = { overall: 0.9, fields: {} };
      }
    } catch (parseError) {
      console.error('Failed to parse AI response:', content, parseError);
      throw new Error('Failed to parse lab results from PDF. Please try again or enter values manually.');
    }

    return new Response(
      JSON.stringify({ success: true, data: parsedResult }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    console.error('Error parsing labs:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
