import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
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

    // Use Gemini 2.5 Pro for vision-based PDF extraction
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-pro',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: `You are a medical lab result parser. Extract hormone values from this ZRT Laboratory Saliva Profile III test report.

IMPORTANT: Extract ONLY the numeric values exactly as shown. Look for these specific tests in the "TEST RESULTS" section:

Required fields to extract:
1. Collection Date (format: MM/DD/YY from "Samples Collected" line)
2. Patient Name (from "Patient Name" field)
3. Estradiol - look for value in pg/mL
4. Progesterone - look for value in pg/mL (may have "L" or "H" flag)
5. Testosterone - look for value in pg/mL
6. DHEAS - look for value in ng/mL (may have "L" or "H" flag)
7. Cortisol - look for morning value in ng/mL
8. Pg/E2 Ratio - look for ratio value (may have "L" or "H" flag)

Return a JSON object with this exact structure:
{
  "collectionDate": "YYYY-MM-DD",
  "patientName": "Full Name",
  "estradiol": 2.1,
  "progesterone": 20,
  "testosterone": 19,
  "dheas": 1.2,
  "cortisol": 8.3,
  "pgE2Ratio": 10,
  "confidence": {
    "overall": 0.95,
    "fields": {
      "estradiol": 0.99,
      "progesterone": 0.99,
      "testosterone": 0.99,
      "dheas": 0.99,
      "cortisol": 0.99,
      "pgE2Ratio": 0.99
    }
  }
}

If a value is not found or unreadable, set it to null.
Convert dates to YYYY-MM-DD format (e.g., 01/19/26 becomes 2026-01-19).
ONLY return the JSON object, no other text.`
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
        max_tokens: 1000,
        temperature: 0.1,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`AI API call failed [${response.status}]: ${errorText}`);
    }

    const aiResult = await response.json();
    const content = aiResult.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error('No response from AI model');
    }

    // Parse the JSON from the response
    let parsedResult: ParsedLabResult;
    try {
      // Clean up the response - remove markdown code blocks if present
      let jsonStr = content.trim();
      if (jsonStr.startsWith('```json')) {
        jsonStr = jsonStr.slice(7);
      }
      if (jsonStr.startsWith('```')) {
        jsonStr = jsonStr.slice(3);
      }
      if (jsonStr.endsWith('```')) {
        jsonStr = jsonStr.slice(0, -3);
      }
      parsedResult = JSON.parse(jsonStr.trim());
    } catch (parseError) {
      console.error('Failed to parse AI response:', content);
      throw new Error('Failed to parse lab results from PDF');
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
