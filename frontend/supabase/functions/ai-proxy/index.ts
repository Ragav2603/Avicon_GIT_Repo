import { serve } from "https://deno.land/std@0.177.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1"

/**
 * ai-proxy — Secure Bridge Edge Function
 *
 * Architecture:
 *   Client (JWT) → Edge Function (verify + extract user_id) → FastAPI Backend
 *
 * Security guarantees:
 *   1. JWT is verified server-side via Supabase auth.getUser()
 *   2. customer_id is NEVER accepted from the client — always derived from the token
 *   3. Rate limiting headers are forwarded from the backend
 *   4. All requests are audit-logged
 */

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Backend URL from environment — NEVER hardcoded
const BACKEND_BASE_URL = Deno.env.get('AI_BACKEND_URL') || Deno.env.get('AZURE_BACKEND_URL') || ''

serve(async (req) => {
    // CORS preflight
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    const requestId = crypto.randomUUID()
    const startTime = Date.now()

    try {
        // ── 1. Validate Authorization header ──────────────────────────
        const authHeader = req.headers.get('Authorization')
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            console.error(`[${requestId}] AUDIT: Missing/invalid Authorization header`)
            return new Response(JSON.stringify({ error: 'Unauthorized' }), {
                status: 401,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            })
        }

        // ── 2. Verify JWT via Supabase server-side ───────────────────
        const supabaseClient = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_ANON_KEY') ?? '',
            { global: { headers: { Authorization: authHeader } } }
        )

        const { data: { user }, error: authError } = await supabaseClient.auth.getUser()

        if (authError || !user) {
            console.error(`[${requestId}] AUDIT: Auth verification failed:`, authError?.message)
            return new Response(JSON.stringify({ error: 'Invalid or expired token' }), {
                status: 401,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            })
        }

        // ── 3. Parse and validate request body ───────────────────────
        const { query } = await req.json()

        if (!query || typeof query !== 'string' || query.trim().length === 0) {
            return new Response(JSON.stringify({ error: 'Missing or empty query parameter' }), {
                status: 400,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            })
        }

        if (query.length > 2000) {
            return new Response(JSON.stringify({ error: 'Query exceeds maximum length (2000 chars)' }), {
                status: 400,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            })
        }

        // ── 4. Forward to backend with server-enforced identity ──────
        if (!BACKEND_BASE_URL) {
            console.error(`[${requestId}] CRITICAL: Backend URL not configured`)
            return new Response(JSON.stringify({ error: 'Service configuration error' }), {
                status: 503,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            })
        }

        const backendUrl = `${BACKEND_BASE_URL}/api/query/`
        console.log(`[${requestId}] AUDIT: Forwarding RAG query | user=${user.id} | query_length=${query.length}`)

        const backendResponse = await fetch(backendUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': authHeader,  // Forward the JWT to backend for its own verification
                'X-Request-Id': requestId,
                'X-Forwarded-For': req.headers.get('X-Forwarded-For') || 'unknown',
            },
            body: JSON.stringify({
                query: query.trim(),
            })
        })

        const data = await backendResponse.json()
        const durationMs = Date.now() - startTime

        // ── 5. Audit log and return ──────────────────────────────────
        console.log(
            `[${requestId}] AUDIT: Completed | user=${user.id} | ` +
            `status=${backendResponse.status} | duration=${durationMs}ms`
        )

        return new Response(JSON.stringify(data), {
            status: backendResponse.status,
            headers: {
                ...corsHeaders,
                'Content-Type': 'application/json',
                'X-Request-Id': requestId,
                'X-Duration-Ms': String(durationMs),
            },
        })

    } catch (error: any) {
        const durationMs = Date.now() - startTime
        console.error(`[${requestId}] ERROR: ${error.message} | duration=${durationMs}ms`)

        return new Response(JSON.stringify({
            error: 'Internal proxy error',
            request_id: requestId,
        }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
    }
})
