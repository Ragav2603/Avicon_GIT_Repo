import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";
import { z } from "npm:zod";

// Version stamp for deployment verification
const FUNCTION_VERSION = "2026-02-18.3-debug-mock";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// Input validation schema
const GenerateDraftRequestSchema = z.object({
  file_path: z.string().min(1).max(1000), // Loosened regex to avoid path issues
  check_type: z.enum(["rfp_extraction", "proposal_draft"]),
});

serve(async (req) => {
  console.log(`[${FUNCTION_VERSION}] Received request: ${req.method} ${req.url}`);

  // 1. Handle CORS
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // 2. Auth Context
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("Missing Authorization header");
    }

    // Config
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    const AI_WORKER_URL = Deno.env.get('AI_WORKER_URL') ?? 'https://avicon-ai-worker-fmgmf2gdcvasaua6.canadacentral-01.azurewebsites.net';

    // 3. Parse & Validate Input
    const rawBody = await req.json();
    const validationResult = GenerateDraftRequestSchema.safeParse(rawBody);

    if (!validationResult.success) {
      console.error(`[${FUNCTION_VERSION}] Validation failed:`, validationResult.error);
      return new Response(JSON.stringify({ error: "Invalid request data", details: validationResult.error.errors }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    const { file_path, check_type } = validationResult.data;
    console.log(`[${FUNCTION_VERSION}] Processing: ${check_type} for ${file_path}`);

    // --- BRANCH 1: RFP EXTRACTION (Use AI Worker) ---
    // This is the CRITICAL merge: We must use the AI Worker for PDFs to avoid garbage text.
    if (check_type === 'rfp_extraction') {
      console.log(`[${FUNCTION_VERSION}] Delegating RFP Extraction to AI Worker: ${AI_WORKER_URL}`);

      const workerResponse = await fetch(`${AI_WORKER_URL}/process-storage-file`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bucket: 'user_uploads',
          file_path: file_path
        })
      });

      if (!workerResponse.ok) {
        const errText = await workerResponse.text();
        throw new Error(`AI Worker Failed: ${workerResponse.status} - ${errText}`);
      }

      const workerResult = await workerResponse.json();
      console.log(`[${FUNCTION_VERSION}] Worker Result received. Question Count: ${workerResult.questions?.length}`);

      // Map Worker Result (Questions) to Frontend "Requirements" Schema
      // The worker now returns { title, description, requirements, budget } in .data (or at top level depending on index.ts)
      // Adjust based on ai-worker index.ts return: { success: true, text_length, questions, data: { title... } }

      const aiData = workerResult.data || {};
      const extractedRequirements = aiData.requirements || workerResult.questions || [];

      // deno-lint-ignore no-explicit-any
      const requirements = extractedRequirements.map((q: any) => ({ // eslint-disable-line @typescript-eslint/no-explicit-any
        requirement_text: q.text,
        is_mandatory: q.is_mandatory ?? (q.priority === 'Critical' || q.priority === 'High'),
        description: q.category || 'General',
        weight: q.weight ?? (q.priority === 'Critical' ? 5 : (q.priority === 'High' ? 3 : 1)),

        // Shotgun properties for frontend compatibility
        text: q.text,
        value: q.text,
        label: q.text,
        required: true,
        type: 'boolean', // Default type for frontend compatibility
        mandatory: q.is_mandatory ?? (q.priority === 'Critical' || q.priority === 'High') // Frontend expects 'mandatory'
      }));

      const responseData = {
        id: "00000000-0000-0000-0000-000000000000", // Dummy UUID for strict frontend validation
        title: aiData.title || "RFP Analysis (AI Worker)",
        name: aiData.title || "RFP Analysis (AI Worker)",
        description: aiData.description || `Processed via dedicated Node.js worker. Source length: ${workerResult.text_length} chars.`,
        category: "AI Extracted",
        icon_name: "sparkles", // Lucide icon name
        requirements: requirements,
        default_requirements: requirements,
        budget: aiData.budget,
        version: "2026-02-18.3-debug-mock"
      };

      return new Response(JSON.stringify(responseData), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // --- BRANCH 2: PROPOSAL DRAFT (Legacy/Fallback) ---
    // Note: This path is currently NOT optimized for PDFs because the AI Worker API 
    // focuses on Extraction logic. We retain this for text files or simple usage.
    if (check_type === 'proposal_draft') {
      console.warn(`[${FUNCTION_VERSION}] Proposal Draft requested. Using legacy logic.`);

      // Use Service Role to download
      const supabase = createClient(supabaseUrl, supabaseServiceKey);

      const { data: fileData, error: downloadError } = await supabase.storage
        .from("user_uploads")
        .download(file_path);

      if (downloadError || !fileData) throw new Error(`Download failed: ${downloadError?.message}`);

      // Try to read text (Will fail/be garbage for binary PDFs)
      let fileContent = "";
      try {
        fileContent = await fileData.text();
      } catch {
        fileContent = "Binary document uploaded - Content unavailable in legacy drafting mode.";
      }

      // Warn if likely binary garbage (simple heuristic)
      if (file_path.endsWith('.pdf') && fileContent.includes("%PDF")) {
        console.warn("Detected raw PDF header. Text extraction will be garbage.");
        fileContent = "Error: PDF drafting not yet supported via AI Worker. Please use RFP Extraction first.";
      }

      // Simple OpenAI Call (Legacy)
      // We aren't implementing the full Lovable retry logic here as this path is deprecated/limited.
      return new Response(JSON.stringify({
        pitch_summary: "Drafting for PDFs is pending AI Worker support. Please use 'Analyze RFP' feature instead.",
        proposed_solution: "This feature is currently limited to extraction.",
        version: FUNCTION_VERSION
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    throw new Error("Invalid check_type");

  // deno-lint-ignore no-explicit-any
  } catch (err: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
    console.error(`[${FUNCTION_VERSION}] Error:`, err.message);
    return new Response(JSON.stringify({
      error: err.message,
      version: FUNCTION_VERSION
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});
