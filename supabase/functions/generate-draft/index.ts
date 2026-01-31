import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Missing authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { file_path, check_type } = await req.json();

    if (!file_path) {
      return new Response(
        JSON.stringify({ error: "Missing file_path" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (check_type !== "rfp_extraction") {
      return new Response(
        JSON.stringify({ error: "Invalid check_type. Expected 'rfp_extraction'" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create Supabase client with service role for storage access
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Download the file from storage
    const { data: fileData, error: downloadError } = await supabase.storage
      .from("user_uploads")
      .download(file_path);

    if (downloadError || !fileData) {
      console.error("Download error:", downloadError);
      return new Response(
        JSON.stringify({ error: "Failed to download file", details: downloadError?.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Convert file to text (for PDF/DOC we'd need more processing, but we'll extract what we can)
    let fileContent = "";
    try {
      fileContent = await fileData.text();
    } catch {
      // For binary files, we'll use a placeholder message
      fileContent = "Binary document uploaded - extracting structured content";
    }

    // Call Lovable AI for extraction
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(
        JSON.stringify({ error: "LOVABLE_API_KEY is not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const systemPrompt = `You are an expert RFP analyst for the aviation industry. Your task is to extract structured information from uploaded documents to create Request for Proposal (RFP) templates.

Extract the following information:
1. **Title**: A clear, concise title for the RFP (max 100 chars)
2. **Description**: A comprehensive description of the project needs (200-500 words)
3. **Requirements**: A list of 3-8 specific requirements, each with:
   - text: The requirement description
   - is_mandatory: Whether it's required (true) or nice-to-have (false)
   - weight: Importance from 1-10
4. **Budget**: Estimated budget range in USD (just the number, no currency symbols)

If the document doesn't contain clear information for a field, make reasonable inferences based on industry standards for aviation/airline technology projects.

Respond ONLY with valid JSON in this exact format:
{
  "title": "string",
  "description": "string",
  "requirements": [
    { "text": "string", "is_mandatory": boolean, "weight": number }
  ],
  "budget": number or null
}`;

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { 
            role: "user", 
            content: `Please analyze this document and extract RFP information:\n\n${fileContent.substring(0, 15000)}` 
          },
        ],
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error("AI API error:", aiResponse.status, errorText);
      
      if (aiResponse.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (aiResponse.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add funds." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      return new Response(
        JSON.stringify({ error: "AI processing failed" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const aiData = await aiResponse.json();
    const content = aiData.choices?.[0]?.message?.content;

    if (!content) {
      return new Response(
        JSON.stringify({ error: "No response from AI" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Parse the JSON response
    let extracted;
    try {
      // Remove markdown code blocks if present
      const jsonStr = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      extracted = JSON.parse(jsonStr);
    } catch (parseError) {
      console.error("Parse error:", parseError, "Content:", content);
      return new Response(
        JSON.stringify({ error: "Failed to parse AI response", raw: content }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate and normalize the response
    const result = {
      title: String(extracted.title || "Untitled RFP").substring(0, 200),
      description: String(extracted.description || "").substring(0, 5000),
      requirements: Array.isArray(extracted.requirements) 
        ? extracted.requirements.map((r: any) => ({
            text: String(r.text || ""),
            is_mandatory: Boolean(r.is_mandatory),
            weight: Math.min(10, Math.max(1, Number(r.weight) || 5)),
          }))
        : [],
      budget: extracted.budget ? Number(extracted.budget) : null,
    };

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Unexpected error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
