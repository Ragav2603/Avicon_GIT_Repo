import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface Requirement {
  id: string;
  requirement_text: string;
  is_mandatory: boolean | null;
  weight: number | null;
}

interface AnalysisRequest {
  rfpTitle: string;
  rfpDescription: string | null;
  requirements: Requirement[];
  proposalContent?: string;
  uploadedDocsSummary?: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const { rfpTitle, rfpDescription, requirements, proposalContent, uploadedDocsSummary }: AnalysisRequest = await req.json();

    const systemPrompt = `You are an expert RFP compliance analyst for the aviation industry. Your task is to analyze vendor proposals against RFP requirements and provide:
1. A compliance score (0-100)
2. Gap analysis identifying missing or weak areas
3. AI-generated draft responses that address each requirement

Be specific, actionable, and focus on what matters most for aviation procurement.`;

    const requirementsList = requirements
      .map((r, i) => `${i + 1}. ${r.requirement_text} ${r.is_mandatory ? '[MANDATORY]' : '[OPTIONAL]'} (Weight: ${r.weight || 10}%)`)
      .join('\n');

    const userPrompt = `Analyze the following RFP and generate a comprehensive proposal draft.

**RFP Title:** ${rfpTitle}
**RFP Description:** ${rfpDescription || 'No description provided'}

**Requirements:**
${requirementsList}

${uploadedDocsSummary ? `**Vendor's Source Documents Summary:**\n${uploadedDocsSummary}\n` : ''}
${proposalContent ? `**Current Draft:**\n${proposalContent}\n` : ''}

Please provide:
1. A compliance score (0-100) based on how well the proposal addresses requirements
2. A detailed gap analysis identifying any missing or weak areas
3. A complete, professional draft proposal that addresses ALL requirements

Format your response as JSON with this structure:
{
  "complianceScore": number,
  "gapAnalysis": [
    {
      "requirementId": "string",
      "status": "met" | "partial" | "missing",
      "finding": "string",
      "recommendation": "string"
    }
  ],
  "draftProposal": "string (markdown formatted)",
  "dealBreakers": ["string array of critical missing items"],
  "strengths": ["string array of strong points"]
}`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add more credits." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const aiResponse = await response.json();
    const content = aiResponse.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("No response from AI");
    }

    // Try to parse JSON from the response
    let parsedResult;
    try {
      // Extract JSON from markdown code blocks if present
      const jsonMatch = content.match(/```json\n?([\s\S]*?)\n?```/) || content.match(/```\n?([\s\S]*?)\n?```/);
      const jsonStr = jsonMatch ? jsonMatch[1] : content;
      parsedResult = JSON.parse(jsonStr.trim());
    } catch (parseError) {
      // If parsing fails, return a structured response with the raw content
      console.error("Failed to parse AI response as JSON:", parseError);
      parsedResult = {
        complianceScore: 75,
        gapAnalysis: [],
        draftProposal: content,
        dealBreakers: [],
        strengths: [],
      };
    }

    return new Response(JSON.stringify(parsedResult), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("analyze-proposal error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
