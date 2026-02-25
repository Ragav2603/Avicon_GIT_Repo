import { serve } from "https://deno.land/std@0.177.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1"

/**
 * ai-proxy — Secure Bridge Edge Function
 *
 * Architecture:
 *   Client (JWT) → Edge Function (verify project access) → FastAPI Backend (SSE Stream)
 */

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const BACKEND_BASE_URL = Deno.env.get('AI_BACKEND_URL') || Deno.env.get('AZURE_BACKEND_URL') || ''

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    const requestId = crypto.randomUUID()
    const startTime = Date.now()
    const url = new URL(req.url)
    const path = url.pathname.split('/').pop() || ''

    try {
        const authHeader = req.headers.get("Authorization");
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return new Response(JSON.stringify({ error: 'Unauthorized' }), {
                status: 401,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            })
        }

        const supabaseClient = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_ANON_KEY') ?? '',
            { global: { headers: { Authorization: authHeader } } }
        )

        const { data: { user }, error: authError } = await supabaseClient.auth.getUser()
        if (authError || !user) {
            return new Response(JSON.stringify({ error: 'Invalid or expired token' }), {
                status: 401,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            })
        }

        if (!BACKEND_BASE_URL) {
            return new Response(JSON.stringify({ error: 'Service configuration error' }), { status: 503, headers: corsHeaders })
        }

        let targetUrl = ''
        let projectId = ''
        const fetchOptions: RequestInit = {
            method: 'POST',
            headers: {
                'Authorization': authHeader,
                'X-Request-Id': requestId,
                'X-Forwarded-For': req.headers.get('X-Forwarded-For') || 'unknown',
            }
        }

        if (path === 'upload') {
            targetUrl = `${BACKEND_BASE_URL}/upload/`
            const incomingFormData = await req.formData()
            projectId = incomingFormData.get('project_id')?.toString() || ''

            if (!projectId) throw new Error("project_id is missing");

            const outgoingFormData = new FormData()
            outgoingFormData.append('file', incomingFormData.get('file')!)
            outgoingFormData.append('project_id', projectId)
            fetchOptions.body = outgoingFormData
        } else {
            targetUrl = `${BACKEND_BASE_URL}/query/`
            const body = await req.json()
            projectId = body.project_id
            const query = body.query

            if (!projectId || !query) {
                return new Response(JSON.stringify({ error: 'Missing project_id or query' }), { status: 400, headers: corsHeaders })
            }

            fetchOptions.headers = { ...fetchOptions.headers, 'Content-Type': 'application/json' }
            fetchOptions.body = JSON.stringify({ query: query.trim(), project_id: projectId })
        }

        // ── Verify Project Access via RLS ──
        const { data: projectAccess, error: accessError } = await supabaseClient
            .from('projects')
            .select('id')
            .eq('id', projectId)
            .single();

        if (accessError || !projectAccess) {
            console.error(`[${requestId}] Forbidden project access attempt by ${user.id} for ${projectId}`)
            return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403, headers: corsHeaders })
        }

        const backendResponse = await fetch(targetUrl, fetchOptions)
        const contentType = backendResponse.headers.get("content-type")

        // Support Server-Sent Events (SSE) streaming
        if (contentType && contentType.includes("text/event-stream")) {
            return new Response(backendResponse.body, {
                status: backendResponse.status,
                headers: {
                    ...corsHeaders,
                    'Content-Type': 'text/event-stream',
                    'Cache-Control': 'no-cache',
                    'Connection': 'keep-alive'
                }
            });
        }

        // Normal JSON handling
        if (contentType && contentType.includes("application/json")) {
            const responseData = await backendResponse.json()
            return new Response(JSON.stringify(responseData), {
                status: backendResponse.status,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            })
        }

        // Fallback error
        const rawText = await backendResponse.text()
        console.error(`[${requestId}] ERROR: Backend returned non-JSON: ${rawText.slice(0, 200)}`)
        return new Response(JSON.stringify({ error: 'Backend communication error' }), { status: 502, headers: corsHeaders })

    } catch (error: any) {
        return new Response(JSON.stringify({ error: error.message || 'Internal proxy error' }), { status: 500, headers: corsHeaders })
    }
})
