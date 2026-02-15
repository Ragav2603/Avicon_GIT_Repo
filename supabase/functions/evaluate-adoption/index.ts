import { createClient } from "npm:@supabase/supabase-js@2";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AuditItem {
  tool_name: string;
  utilization: number;
  sentiment: number;
}

interface AuditRequest {
  airline_id?: string;
  airline_name?: string;
  items: AuditItem[];
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');

    // Get auth token from request
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create Supabase client with service role for admin operations
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Verify the user's token
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid or expired token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if user is a consultant
    const { data: roleData, error: roleError } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single();

    if (roleError || roleData?.role !== 'consultant') {
      return new Response(
        JSON.stringify({ error: 'Only consultants can run audits' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const sanitizeString = (str: string) => str.replace(/[{}\n`]/g, '');

    const AuditItemSchema = z.object({
      tool_name: z.string().min(1).max(100).transform(sanitizeString),
      utilization: z.number().min(0).max(100),
      sentiment: z.number().min(0).max(10),
    });

    const AuditRequestSchema = z.object({
      airline_id: z.string().uuid().optional(),
      airline_name: z.string().min(1).max(100).optional(),
      items: z.array(AuditItemSchema).min(1).max(50),
    }).refine((data) => data.airline_id || data.airline_name, {
      message: "Either airline_id or airline_name must be provided",
      path: ["airline_id"],
    });

    const json = await req.json();
    const validation = AuditRequestSchema.safeParse(json);

    if (!validation.success) {
      return new Response(
        JSON.stringify({ error: 'Validation error', details: validation.error.format() }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Limit items to prevent DoS
    if (items.length > 50) {
      return new Response(
        JSON.stringify({ error: 'Too many items (max 50)' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    const { airline_id, airline_name, items } = validation.data;

    // If airline_name provided but no airline_id, use user's own id as fallback
    // This allows consultants to create audits with just an airline name for demo purposes
    const effectiveAirlineId = airline_id || user.id;

    // Calculate scores for each item
    const scoredItems = items.map(item => {
      // Sanitize inputs to prevent Prompt Injection
      const sanitizedToolName = sanitizeInput(item.tool_name || 'Unknown Tool');
      const utilization = Math.max(0, Math.min(100, Number(item.utilization) || 0));
      const sentiment = Math.max(0, Math.min(10, Number(item.sentiment) || 0));

      // Formula: weighted average of utilization (60%) and sentiment normalized to 100 (40%)
      const utilizationScore = utilization;
      const sentimentScore = (sentiment / 10) * 100;
      const calculatedScore = Math.round((utilizationScore * 0.6) + (sentimentScore * 0.4));
      
      return {
        tool_name: sanitizedToolName,
        utilization_metric: utilization,
        sentiment_score: sentiment,
        calculated_score: calculatedScore,
      };
    });

    // Calculate overall score
    const overallScore = Math.round(
      scoredItems.reduce((sum, item) => sum + item.calculated_score, 0) / scoredItems.length
    );

    // Generate AI recommendations if OpenAI key is available
    let aiSummary = '';
    let recommendations: { tool_name: string; score: number; recommendation: string }[] = [];

    if (openaiApiKey) {
      try {
        const prompt = `You are an aviation technology consultant analyzing digital tool adoption for an airline.

Here is the audit data:
${scoredItems.map(item => `- ${item.tool_name}: Utilization ${item.utilization_metric}%, User Sentiment ${item.sentiment_score}/10, Score: ${item.calculated_score}/100`).join('\n')}

Overall Score: ${overallScore}/100

Provide:
1. A brief executive summary (2-3 sentences) of the airline's digital adoption health.
2. For each tool, provide a specific, actionable recommendation.

Respond in JSON format:
{
  "summary": "...",
  "recommendations": [
    { "tool_name": "...", "recommendation": "..." }
  ]
}`;

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${openaiApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [{ role: 'user', content: prompt }],
            response_format: { type: 'json_object' },
            temperature: 0.7,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          const aiResponse = JSON.parse(data.choices[0].message.content);
          aiSummary = aiResponse.summary;
          
          // Merge AI recommendations with scored items
          recommendations = scoredItems.map(item => {
            const aiRec = aiResponse.recommendations?.find(
              (r: { tool_name: string; recommendation: string }) => 
                r.tool_name.toLowerCase() === item.tool_name.toLowerCase()
            );
            return {
              tool_name: item.tool_name,
              score: item.calculated_score,
              recommendation: aiRec?.recommendation || getDefaultRecommendation(item.calculated_score),
            };
          });
        }
      } catch (aiError) {
        console.error('AI generation error:', aiError);
        // Fall back to default recommendations
        recommendations = scoredItems.map(item => ({
          tool_name: item.tool_name,
          score: item.calculated_score,
          recommendation: getDefaultRecommendation(item.calculated_score),
        }));
        aiSummary = getDefaultSummary(overallScore);
      }
    } else {
      // No OpenAI key, use defaults
      recommendations = scoredItems.map(item => ({
        tool_name: item.tool_name,
        score: item.calculated_score,
        recommendation: getDefaultRecommendation(item.calculated_score),
      }));
      aiSummary = getDefaultSummary(overallScore);
    }

    // Save audit to database
    const { data: audit, error: auditError } = await supabase
      .from('adoption_audits')
      .insert({
        airline_id: effectiveAirlineId,
        consultant_id: user.id,
        overall_score: overallScore,
        audit_date: new Date().toISOString().split('T')[0],
      })
      .select()
      .single();

    if (auditError) {
      console.error('Error saving audit:', auditError);
      throw new Error('Failed to save audit');
    }

    // Save audit items
    const auditItems = scoredItems.map(item => ({
      audit_id: audit.id,
      tool_name: item.tool_name,
      utilization_metric: item.utilization_metric,
      sentiment_score: item.sentiment_score,
      calculated_score: item.calculated_score,
      recommendation: recommendations.find(r => r.tool_name === item.tool_name)?.recommendation || '',
    }));

    const { error: itemsError } = await supabase
      .from('audit_items')
      .insert(auditItems);

    if (itemsError) {
      console.error('Error saving audit items:', itemsError);
    }

    return new Response(
      JSON.stringify({
        audit_id: audit.id,
        overall_score: overallScore,
        summary: aiSummary,
        recommendations,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    console.error('Error in evaluate-adoption:', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function getDefaultRecommendation(score: number): string {
  if (score >= 80) {
    return 'Excellent adoption. Continue current practices and consider sharing best practices across teams.';
  } else if (score >= 60) {
    return 'Good adoption with room for improvement. Focus on user training and gathering feedback.';
  } else if (score >= 40) {
    return 'Moderate adoption. Investigate barriers to usage and consider UX improvements or additional training.';
  } else {
    return 'Low adoption requires immediate attention. Conduct user interviews to identify pain points and blockers.';
  }
}

function getDefaultSummary(score: number): string {
  if (score >= 80) {
    return 'The airline demonstrates strong digital tool adoption across evaluated systems. User engagement and satisfaction are high, indicating effective implementation strategies.';
  } else if (score >= 60) {
    return 'Overall digital adoption is satisfactory with opportunities for improvement. Some tools show strong engagement while others require attention to boost utilization.';
  } else if (score >= 40) {
    return 'Digital adoption is below optimal levels. A comprehensive review of training programs and tool usability is recommended to improve engagement.';
  } else {
    return 'Critical gaps exist in digital tool adoption. Immediate intervention is needed to address usability concerns and user resistance.';
  }
}

function sanitizeInput(input: string): string {
  // Remove potentially dangerous characters for LLM prompts (braces, backticks)
  // and control characters. Limit length to 50 chars.
  return input.replace(/[\n\r`{}]/g, '').trim().slice(0, 50);
}
