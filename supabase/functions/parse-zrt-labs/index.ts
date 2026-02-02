import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

interface ParsedLabResult {
  collectionDate: string | null;
  patientName: string | null;
  estradiol: number | null;
  progesterone: number | null;
  testosterone: number | null;
  dheas: number | null;
  cortisol: number | null;
  pgE2Ratio: number | null;
  confidence: {
    overall: number;
    fields: Record<string, number>;
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const { pdfBase64, mimeType = 'application/pdf' } = await req.json();

    if (!pdfBase64) {
      throw new Error('PDF data is required');
    }

    // Use Gemini 2.5 Flash for faster, reliable extraction
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: `Extract hormone values from this ZRT Laboratory Saliva Profile III report. Return ONLY valid JSON, no markdown.

Extract these values from the TEST RESULTS table:
- collectionDate: from "Samples Collected" in YYYY-MM-DD format
- patientName: full name
- estradiol: number in pg/mL
- progesterone: number in pg/mL
- testosterone: number in pg/mL  
- dheas: number in ng/mL
- cortisol: morning value in ng/mL
- pgE2Ratio: the Pg/E2 ratio number

Return this exact JSON structure:
{"collectionDate":"2026-01-19","patientName":"Name Here","estradiol":2.1,"progesterone":20,"testosterone":19,"dheas":1.2,"cortisol":8.3,"pgE2Ratio":10,"confidence":{"overall":0.95,"fields":{"estradiol":0.99,"progesterone":0.99,"testosterone":0.99,"dheas":0.99,"cortisol":0.99,"pgE2Ratio":0.99}}}

Use null for any values not found. Return ONLY the JSON object.`
              },
              {
                type: 'image_url',
                image_url: {
                  url: `data:${mimeType};base64,${pdfBase64}`
                }
              }
            ]
          }
        ],
        max_tokens: 500,
        temperature: 0,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI API error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ success: false, error: 'Rate limit exceeded. Please try again in a moment.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ success: false, error: 'AI credits exhausted. Please add funds.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      throw new Error(`AI API call failed [${response.status}]`);
    }

    const aiResult = await response.json();
    const content = aiResult.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error('No response from AI model');
    }

    console.log('AI raw response:', content);

    // Parse the JSON from the response
    let parsedResult: ParsedLabResult;
    try {
      // Clean up the response - remove markdown code blocks if present
      let jsonStr = content.trim();
      
      // Remove markdown code fences
      jsonStr = jsonStr.replace(/^```json\s*/i, '');
      jsonStr = jsonStr.replace(/^```\s*/i, '');
      jsonStr = jsonStr.replace(/\s*```$/i, '');
      jsonStr = jsonStr.trim();
      
      // Try to find JSON object boundaries
      const startIdx = jsonStr.indexOf('{');
      const endIdx = jsonStr.lastIndexOf('}');
      
      if (startIdx !== -1 && endIdx !== -1 && endIdx > startIdx) {
        jsonStr = jsonStr.substring(startIdx, endIdx + 1);
      }
      
      // Check if JSON appears truncated (unbalanced braces)
      let braceCount = 0;
      for (const char of jsonStr) {
        if (char === '{') braceCount++;
        if (char === '}') braceCount--;
      }
      
      // If truncated, try to repair by closing open braces
      if (braceCount > 0) {
        console.log('Detected truncated JSON, attempting repair...');
        // Remove trailing comma if present
        jsonStr = jsonStr.replace(/,\s*$/, '');
        // Close any open objects
        while (braceCount > 0) {
          jsonStr += '}';
          braceCount--;
        }
      }
      
      parsedResult = JSON.parse(jsonStr);
      
      // Validate required structure
      if (typeof parsedResult !== 'object' || parsedResult === null) {
        throw new Error('Invalid response structure');
      }
      
      // Ensure confidence object exists
      if (!parsedResult.confidence) {
        parsedResult.confidence = {
          overall: 0.9,
          fields: {
            estradiol: 0.9,
            progesterone: 0.9,
            testosterone: 0.9,
            dheas: 0.9,
            cortisol: 0.9,
            pgE2Ratio: 0.9
          }
        };
      }
      
    } catch (parseError) {
      console.error('Failed to parse AI response:', content);
      console.error('Parse error:', parseError);
      throw new Error('Failed to parse lab results from PDF. Please try again or enter values manually.');
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        data: parsedResult 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error: unknown) {
    console.error('Error parsing ZRT labs:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
