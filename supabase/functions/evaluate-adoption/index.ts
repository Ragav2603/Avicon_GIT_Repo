import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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

serve(async (req) => {
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

    const body: AuditRequest = await req.json();
    const { airline_id, airline_name, items } = body;

    // Support either airline_id or airline_name
    if ((!airline_id && !airline_name) || !items || items.length === 0) {
      return new Response(
        JSON.stringify({ error: 'airline_id or airline_name and items are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // If airline_name provided but no airline_id, use user's own id as fallback
    // This allows consultants to create audits with just an airline name for demo purposes
    const effectiveAirlineId = airline_id || user.id;

    // Calculate scores for each item
    const scoredItems = items.map(item => {
      // Formula: weighted average of utilization (60%) and sentiment normalized to 100 (40%)
      const utilizationScore = item.utilization;
      const sentimentScore = (item.sentiment / 10) * 100;
      const calculatedScore = Math.round((utilizationScore * 0.6) + (sentimentScore * 0.4));
      
      return {
        tool_name: item.tool_name,
        utilization_metric: item.utilization,
        sentiment_score: item.sentiment,
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
