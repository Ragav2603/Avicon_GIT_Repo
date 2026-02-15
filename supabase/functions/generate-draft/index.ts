import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

// Version stamp for deployment verification
const FUNCTION_VERSION = "2026-02-06.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Input validation schema
const GenerateDraftRequestSchema = z.object({
  file_path: z.string().min(1).max(1000).regex(/^[a-zA-Z0-9_\-\/\.]+$/, "Invalid file path format"),
  check_type: z.enum(["rfp_extraction", "proposal_draft"]),
});

function safeUrlForLogs(raw: string): string {
  try {
    const u = new URL(raw);
    // Don’t log query string or anything sensitive
    return `${u.origin}${u.pathname}`;
  } catch {
    return "(invalid url)";
  }
}

/**
 * Azure OpenAI can be configured either as:
 * 1) Full chat completions URL (recommended): https://.../openai/deployments/<deployment>/chat/completions?api-version=...
 * 2) Base resource endpoint: https://...openai.azure.com
 *    In that case we construct the chat completions URL using env deployment + api-version.
 */
function buildAzureChatCompletionsUrl(endpoint: string): string {
  // If it already looks like a full Azure OpenAI Chat Completions URL, keep it
  if (/\/openai\/deployments\//.test(endpoint) && /\/chat\/completions/.test(endpoint)) {
    return endpoint;
  }

  const deployment = Deno.env.get("AZURE_OPENAI_DEPLOYMENT") || "gpt-4o";
  const apiVersion = Deno.env.get("AZURE_OPENAI_API_VERSION") || "2025-01-01-preview";

  const base = endpoint.replace(/\/+$/, "");
  return `${base}/openai/deployments/${deployment}/chat/completions?api-version=${encodeURIComponent(apiVersion)}`;
}

// Helper to extract Azure diagnostic headers
function extractAzureHeaders(response: Response): Record<string, string | null> {
  return {
    "x-ms-request-id": response.headers.get("x-ms-request-id"),
    "x-ms-region": response.headers.get("x-ms-region"),
    "apim-request-id": response.headers.get("apim-request-id"),
    "content-type": response.headers.get("content-type"),
    "content-length": response.headers.get("content-length"),
  };
}

// Helper to call Azure with retry logic
async function callAzureWithRetry(
  endpoint: string,
  apiKey: string,
  payload: object,
  timeoutMs: number = 60000
): Promise<{ response: Response; text: string; headers: Record<string, string | null>; attempt: number }> {
  const maxRetries = 2;
  let lastError: Error | null = null;
  let lastResponse: Response | null = null;
  let lastText = "";
  let lastHeaders: Record<string, string | null> = {};

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "api-key": apiKey,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      lastResponse = response;
      lastHeaders = extractAzureHeaders(response);
      lastText = await response.text();

      console.log(
        `[${FUNCTION_VERSION}] Azure attempt ${attempt}: status=${response.status}, statusText=${response.statusText}, url=${safeUrlForLogs(endpoint)}, headers=${JSON.stringify(lastHeaders)}, bodyLength=${lastText.length}`
      );

      // If we got a non-empty response body or a non-2xx status, return it
      if (lastText.length > 0 || !response.ok) {
        return { response, text: lastText, headers: lastHeaders, attempt };
      }

      // Empty body on 200 - retry with backoff
      if (attempt < maxRetries) {
        console.log(`[${FUNCTION_VERSION}] Empty response body on attempt ${attempt}, retrying in 500ms...`);
        await new Promise((resolve) => setTimeout(resolve, 500));
      }
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      console.error(`[${FUNCTION_VERSION}] Azure fetch error on attempt ${attempt}:`, lastError.message);

      if (lastError.name === "AbortError") {
        throw new Error(`Azure request timed out after ${timeoutMs}ms`);
      }

      if (attempt < maxRetries) {
        await new Promise((resolve) => setTimeout(resolve, 500));
      }
    }
  }

  // If we exhausted retries with empty responses
  if (lastResponse && lastText.length === 0) {
    return { response: lastResponse, text: lastText, headers: lastHeaders, attempt: maxRetries };
  }

  throw lastError || new Error("Unknown error calling Azure OpenAI");
}

serve(async (req) => {
  console.log(`[${FUNCTION_VERSION}] Received request: ${req.method}`);

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Validate authorization header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ error: "Missing or invalid authorization header", version: FUNCTION_VERSION }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verify JWT token
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    const supabaseAuth = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });

    const { data: { user }, error: authError } = await supabaseAuth.auth.getUser();
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Invalid or expired token", version: FUNCTION_VERSION }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Parse and validate request body
    const rawTextBody = await req.text();
    if (!rawTextBody) {
      return new Response(
        JSON.stringify({ error: "Empty request body", version: FUNCTION_VERSION }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let rawBody: unknown;
    try {
      rawBody = JSON.parse(rawTextBody);
    } catch (e) {
      console.error(`[${FUNCTION_VERSION}] Request JSON parse error:`, e);
      return new Response(
        JSON.stringify({ error: "Invalid JSON in request body", version: FUNCTION_VERSION }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const validationResult = GenerateDraftRequestSchema.safeParse(rawBody);
    
    if (!validationResult.success) {
      return new Response(
        JSON.stringify({ 
          error: "Invalid request data", 
          details: validationResult.error.errors,
          version: FUNCTION_VERSION
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { file_path, check_type } = validationResult.data;
    console.log(`[${FUNCTION_VERSION}] Processing file: ${file_path}, check_type: ${check_type}`);

    // Create Supabase client with service role for storage access
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Download the file from storage
    const { data: fileData, error: downloadError } = await supabase.storage
      .from("user_uploads")
      .download(file_path);

    if (downloadError || !fileData) {
      console.error(`[${FUNCTION_VERSION}] Download error:`, downloadError);
      return new Response(
        JSON.stringify({ error: "Failed to download file", details: downloadError?.message, version: FUNCTION_VERSION }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Convert file to text
    let fileContent = "";
    try {
      fileContent = await fileData.text();
    } catch {
      fileContent = "Binary document uploaded - extracting structured content";
    }

    // Check Azure credentials
    const AZURE_OPENAI_API_KEY = Deno.env.get("AZURE_OPENAI_API_KEY");
    const AZURE_OPENAI_ENDPOINT = Deno.env.get("AZURE_OPENAI_ENDPOINT");
    if (!AZURE_OPENAI_API_KEY || !AZURE_OPENAI_ENDPOINT) {
      return new Response(
        JSON.stringify({ error: "Azure OpenAI credentials are not configured", version: FUNCTION_VERSION }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const azureUrl = buildAzureChatCompletionsUrl(AZURE_OPENAI_ENDPOINT);
    console.log(`[${FUNCTION_VERSION}] Azure URL (sanitized): ${safeUrlForLogs(azureUrl)}`);

    // Build prompts
    let systemPrompt: string;
    let userPrompt: string;

    if (check_type === "rfp_extraction") {
      systemPrompt = `You are an expert RFP analyst for the aviation industry. Your task is to extract structured information from uploaded documents to create Request for Proposal (RFP) templates.

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
      userPrompt = `Please analyze this document and extract RFP information:\n\n${fileContent.substring(0, 15000)}`;
    } else {
      systemPrompt = `You are an expert proposal writer for aviation technology vendors. Your task is to analyze uploaded documents (previous proposals, capability statements, API docs) and generate a compelling proposal pitch.

Based on the document content, create:
1. **pitch_summary**: A concise 2-3 paragraph executive summary (150-300 words) that highlights key value propositions, differentiators, and why the vendor is the best choice
2. **proposed_solution**: A detailed solution description (300-600 words) covering:
   - Technical approach and architecture
   - Key features and capabilities  
   - Implementation methodology
   - Support and SLA commitments
   - Compliance and security posture

Write in a professional, confident tone suitable for enterprise aviation clients. Focus on business outcomes and ROI.

Respond ONLY with valid JSON in this exact format:
{
  "pitch_summary": "string",
  "proposed_solution": "string"
}`;
      userPrompt = `Please analyze this vendor document and generate a proposal draft:\n\n${fileContent.substring(0, 15000)}`;
    }

    const payload = {
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      max_tokens: 4000,
      temperature: 0.7,
    };

    // Call Azure with retry and timeout
    let azureResult;
    try {
      azureResult = await callAzureWithRetry(azureUrl, AZURE_OPENAI_API_KEY, payload, 60000);
    } catch (error) {
      console.error(`[${FUNCTION_VERSION}] Azure call failed:`, error);
      return new Response(
        JSON.stringify({ 
          error: error instanceof Error ? error.message : "Azure OpenAI request failed",
          version: FUNCTION_VERSION
        }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { response: aiResponse, text: aiText, headers: azureHeaders, attempt } = azureResult;

    // Handle non-OK responses
    if (!aiResponse.ok) {
      console.error(`[${FUNCTION_VERSION}] Azure error: status=${aiResponse.status}, body=${aiText}`);
      
      // Try to extract Azure error details
      let azureError: { error?: { code?: string; message?: string } } = {};
      try {
        azureError = JSON.parse(aiText);
      } catch {
        // Not JSON, use raw text
      }

      const errorCode = azureError?.error?.code || aiResponse.status.toString();
      const errorMessage = azureError?.error?.message || aiText || "Unknown Azure error";

      if (aiResponse.status === 429) {
        return new Response(
          JSON.stringify({ 
            error: "Rate limit exceeded. Please try again later.",
            code: errorCode,
            version: FUNCTION_VERSION,
            azure_request_id: azureHeaders["x-ms-request-id"]
          }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      if (aiResponse.status === 402) {
        return new Response(
          JSON.stringify({ 
            error: "AI credits exhausted. Please add funds.",
            code: errorCode,
            version: FUNCTION_VERSION,
            azure_request_id: azureHeaders["x-ms-request-id"]
          }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Handle other common Azure errors
      return new Response(
        JSON.stringify({ 
          error: `Azure OpenAI error: ${errorMessage}`,
          code: errorCode,
          status: aiResponse.status,
          version: FUNCTION_VERSION,
          azure_request_id: azureHeaders["x-ms-request-id"]
        }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Handle empty response after retries
    if (!aiText || aiText.length === 0) {
      console.error(`[${FUNCTION_VERSION}] Azure returned empty body after ${attempt} attempts`);
      return new Response(
        JSON.stringify({ 
          error: "Azure OpenAI returned an empty response body after retries",
          attempts: attempt,
          version: FUNCTION_VERSION,
          azure_request_id: azureHeaders["x-ms-request-id"],
          azure_status: aiResponse.status
        }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Parse Azure response
    let aiData: { choices?: Array<{ message?: { content?: string } }> };
    try {
      aiData = JSON.parse(aiText);
    } catch (e) {
      console.error(`[${FUNCTION_VERSION}] Azure response JSON parse error:`, e, "Body length:", aiText.length);
      return new Response(
        JSON.stringify({ 
          error: "Azure OpenAI returned invalid JSON",
          version: FUNCTION_VERSION,
          azure_request_id: azureHeaders["x-ms-request-id"]
        }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const content = aiData.choices?.[0]?.message?.content;

    if (!content) {
      console.error(`[${FUNCTION_VERSION}] No content in Azure response:`, JSON.stringify(aiData).substring(0, 500));
      return new Response(
        JSON.stringify({ 
          error: "No content in AI response",
          version: FUNCTION_VERSION,
          azure_request_id: azureHeaders["x-ms-request-id"]
        }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Parse the extracted JSON from AI content
    let extracted;
    try {
      const jsonStr = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      extracted = JSON.parse(jsonStr);
    } catch (parseError) {
      console.error(`[${FUNCTION_VERSION}] Parse extracted content error:`, parseError);
      return new Response(
        JSON.stringify({ 
          error: "Failed to parse AI response content",
          version: FUNCTION_VERSION,
          azure_request_id: azureHeaders["x-ms-request-id"]
        }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate and normalize the response based on check_type
    let result;
    if (check_type === "rfp_extraction") {
      result = {
        title: String(extracted.title || "Untitled RFP").substring(0, 200),
        description: String(extracted.description || "").substring(0, 5000),
        requirements: Array.isArray(extracted.requirements) 
          ? extracted.requirements.map((r: { text?: string; is_mandatory?: boolean; weight?: number }) => ({
              text: String(r.text || ""),
              is_mandatory: Boolean(r.is_mandatory),
              weight: Math.min(10, Math.max(1, Number(r.weight) || 5)),
            }))
          : [],
        budget: extracted.budget ? Number(extracted.budget) : null,
        version: FUNCTION_VERSION,
      };
    } else {
      result = {
        pitch_summary: String(extracted.pitch_summary || "").substring(0, 3000),
        proposed_solution: String(extracted.proposed_solution || "").substring(0, 6000),
        version: FUNCTION_VERSION,
      };
    }

    console.log(`[${FUNCTION_VERSION}] Success: extracted ${check_type}`);
    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error(`[${FUNCTION_VERSION}] Unexpected error:`, error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Unknown error",
        version: FUNCTION_VERSION
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
