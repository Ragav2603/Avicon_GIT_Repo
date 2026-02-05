import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

interface CSVRow {
  tool_name?: string;
  user_id?: string;
  login_count?: number;
  last_login?: string;
  session_duration_minutes?: number;
  sentiment_rating?: number;
}

interface ProcessedTool {
  tool_name: string;
  total_users: number;
  active_users: number;
  avg_sessions: number;
  avg_sentiment: number;
  utilization_score: number;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Verify user token
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid or expired token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify consultant role
    const { data: roleData, error: roleError } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single();

    if (roleError || roleData?.role !== 'consultant') {
      return new Response(
        JSON.stringify({ error: 'Only consultants can process adoption data' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { csv_data, airline_name, file_name } = await req.json();

    if (!csv_data || !airline_name) {
      return new Response(
        JSON.stringify({ error: 'Missing csv_data or airline_name' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse CSV data (assuming it's already parsed as JSON array)
    const rows: CSVRow[] = Array.isArray(csv_data) ? csv_data : [];

    if (rows.length === 0) {
      return new Response(
        JSON.stringify({ error: 'No data rows found in CSV' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Group by tool and calculate metrics
    const toolMetrics: Record<string, {
      users: Set<string>;
      logins: number[];
      sentiments: number[];
      sessions: number[];
    }> = {};

    rows.forEach((row) => {
      const toolName = row.tool_name || 'Unknown Tool';
      
      if (!toolMetrics[toolName]) {
        toolMetrics[toolName] = {
          users: new Set(),
          logins: [],
          sentiments: [],
          sessions: [],
        };
      }

      if (row.user_id) {
        toolMetrics[toolName].users.add(row.user_id);
      }
      if (row.login_count !== undefined) {
        toolMetrics[toolName].logins.push(row.login_count);
      }
      if (row.sentiment_rating !== undefined) {
        toolMetrics[toolName].sentiments.push(row.sentiment_rating);
      }
      if (row.session_duration_minutes !== undefined) {
        toolMetrics[toolName].sessions.push(row.session_duration_minutes);
      }
    });

    // Calculate processed tools
    const processedTools: ProcessedTool[] = Object.entries(toolMetrics).map(([toolName, metrics]) => {
      const totalUsers = metrics.users.size;
      const avgLogins = metrics.logins.length > 0 
        ? metrics.logins.reduce((a, b) => a + b, 0) / metrics.logins.length 
        : 0;
      const avgSentiment = metrics.sentiments.length > 0 
        ? metrics.sentiments.reduce((a, b) => a + b, 0) / metrics.sentiments.length 
        : 5;
      const avgSessions = metrics.sessions.length > 0 
        ? metrics.sessions.reduce((a, b) => a + b, 0) / metrics.sessions.length 
        : 0;

      // Calculate utilization score (0-100) based on login frequency and session duration
      // Assuming 20+ logins/month and 60+ min/session is optimal
      const loginScore = Math.min(100, (avgLogins / 20) * 100);
      const sessionScore = Math.min(100, (avgSessions / 60) * 100);
      const utilizationScore = Math.round((loginScore * 0.6) + (sessionScore * 0.4));

      return {
        tool_name: toolName,
        total_users: totalUsers,
        active_users: metrics.logins.filter(l => l > 0).length,
        avg_sessions: Math.round(avgSessions),
        avg_sentiment: Math.round(avgSentiment * 10) / 10,
        utilization_score: utilizationScore,
      };
    });

    // Create audit items from processed data
    const auditItems = processedTools.map((tool) => ({
      tool_name: tool.tool_name,
      utilization: tool.utilization_score,
      sentiment: Math.round(tool.avg_sentiment),
    }));

    // Call evaluate-adoption to generate the full audit
    const evalResponse = await fetch(`${supabaseUrl}/functions/v1/evaluate-adoption`, {
      method: 'POST',
      headers: {
        Authorization: authHeader,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        airline_name,
        items: auditItems,
      }),
    });

    if (!evalResponse.ok) {
      const errorData = await evalResponse.json();
      throw new Error(errorData.error || 'Failed to generate audit');
    }

    const auditResult = await evalResponse.json();

    // Save upload record
    await supabase
      .from('adoption_data_uploads')
      .insert({
        audit_id: auditResult.audit_id,
        consultant_id: user.id,
        file_name: file_name || 'uploaded_data.csv',
        records_processed: rows.length,
        upload_status: 'completed',
        processed_at: new Date().toISOString(),
        raw_data: {
          tools_processed: processedTools.length,
          total_records: rows.length,
        },
      });

    return new Response(
      JSON.stringify({
        success: true,
        audit_id: auditResult.audit_id,
        overall_score: auditResult.overall_score,
        summary: auditResult.summary,
        recommendations: auditResult.recommendations,
        processed_data: {
          tools_analyzed: processedTools.length,
          records_processed: rows.length,
          tools: processedTools,
        },
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('CSV processing error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
