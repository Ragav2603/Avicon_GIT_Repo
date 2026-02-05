import { createClient } from "npm:@supabase/supabase-js@2";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

// Input validation schema
const FitScoreRequestSchema = z.object({
  submission_id: z.string().uuid("Invalid submission_id format"),
});

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Validate authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ error: 'Missing or invalid authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify JWT token
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabaseAuth = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });

    const { data: { user }, error: authError } = await supabaseAuth.auth.getUser();
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid or expired token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse and validate request body
    const rawBody = await req.json();
    const validationResult = FitScoreRequestSchema.safeParse(rawBody);
    
    if (!validationResult.success) {
      return new Response(
        JSON.stringify({ 
          error: 'Invalid request data', 
          details: validationResult.error.errors 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { submission_id } = validationResult.data;

    // Create service role client for database operations
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch submission with RFP
    const { data: submission, error: fetchError } = await supabase
      .from('submissions')
      .select(`
        id,
        pitch_text,
        rfp_id,
        rfps (
          id,
          title,
          description
        )
      `)
      .eq('id', submission_id)
      .single();

    if (fetchError || !submission) {
      return new Response(
        JSON.stringify({ error: 'Submission not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch RFP requirements
    const { data: requirements } = await supabase
      .from('rfp_requirements')
      .select('*')
      .eq('rfp_id', submission.rfp_id)
      .order('weight', { ascending: false });

    if (!requirements || requirements.length === 0) {
      // No requirements to score against
      await supabase
        .from('submissions')
        .update({
          fit_score: 100,
          deal_breaker_flags: [],
          weighted_scores: {},
        })
        .eq('id', submission_id);

      return new Response(
        JSON.stringify({
          fit_score: 100,
          deal_breaker_flags: [],
          weighted_scores: {},
          message: 'No requirements to evaluate against',
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Call AI to evaluate the proposal against requirements
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      return new Response(
        JSON.stringify({ error: 'LOVABLE_API_KEY is not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const requirementsList = requirements.map((r, i) => 
      `${i + 1}. "${r.requirement_text}" (Weight: ${r.weight || 1}, ${r.is_mandatory ? 'MANDATORY - Deal Breaker if missing' : 'Optional'})`
    ).join('\n');

    const systemPrompt = `You are an expert procurement analyst evaluating vendor proposals against specific requirements. Analyze the proposal and score how well it addresses each requirement.

For each requirement, provide:
1. A score from 0-100 (0 = not addressed, 100 = fully addressed with evidence)
2. Whether it's matched (true/false) - must be true if score >= 60
3. Brief reasoning

CRITICAL: For mandatory requirements marked as "Deal Breaker", a score below 60 means the vendor fails that requirement.

Respond in this exact JSON format:
{
  "requirement_scores": [
    {
      "requirement_index": 1,
      "score": 85,
      "matched": true,
      "reasoning": "Proposal clearly addresses this with specific features..."
    }
  ],
  "overall_assessment": "Brief summary of strengths and gaps"
}`;

    const userPrompt = `Evaluate this vendor proposal against the requirements:

**Requirements to evaluate:**
${requirementsList}

**Vendor Proposal:**
${submission.pitch_text || 'No proposal text provided'}

Analyze each requirement and provide scores.`;

    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-3-flash-preview',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
      }),
    });

    if (!aiResponse.ok) {
      if (aiResponse.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (aiResponse.status === 402) {
        return new Response(
          JSON.stringify({ error: 'AI credits exhausted. Please add funds.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      throw new Error('AI evaluation failed');
    }

    const aiData = await aiResponse.json();
    const content = aiData.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error('No response from AI');
    }

    // Parse AI response
    let evaluation;
    try {
      const jsonStr = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      evaluation = JSON.parse(jsonStr);
    } catch {
      throw new Error('Failed to parse AI response');
    }

    // Calculate weighted fit score
    let totalWeight = 0;
    let weightedScore = 0;
    const dealBreakerFlags: string[] = [];
    const weightedScores: Record<string, number> = {};

    requirements.forEach((req, index) => {
      const aiScore = evaluation.requirement_scores?.find((s: { requirement_index: number }) => s.requirement_index === index + 1);
      const score = aiScore?.score || 0;
      const weight = req.weight || 1;
      
      totalWeight += weight;
      weightedScore += score * weight;
      weightedScores[req.id] = score;

      // Check for deal breakers
      if (req.is_mandatory && score < 60) {
        dealBreakerFlags.push(req.requirement_text);
      }
    });

    // Calculate final fit score (0-100)
    let fitScore = totalWeight > 0 ? Math.round(weightedScore / totalWeight) : 0;

    // Apply penalty for deal breakers
    if (dealBreakerFlags.length > 0) {
      fitScore = Math.min(fitScore, 59); // Cap at 59 if any deal breakers
    }

    // Update submission with scores
    const { error: updateError } = await supabase
      .from('submissions')
      .update({
        fit_score: fitScore,
        deal_breaker_flags: dealBreakerFlags,
        weighted_scores: weightedScores,
        ai_score: fitScore, // Also update legacy ai_score for compatibility
        response_status: dealBreakerFlags.length > 0 ? 'fail' : fitScore >= 80 ? 'pass' : 'partial',
      })
      .eq('id', submission_id);

    if (updateError) {
      console.error('Update error:', updateError);
    }

    return new Response(
      JSON.stringify({
        success: true,
        fit_score: fitScore,
        deal_breaker_flags: dealBreakerFlags,
        weighted_scores: weightedScores,
        overall_assessment: evaluation.overall_assessment || '',
        has_deal_breakers: dealBreakerFlags.length > 0,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Fit score error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
