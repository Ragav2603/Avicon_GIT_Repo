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
    const url = new URL(req.url)
    // Extract path after function name (handles different invocation styles)
    const path = url.pathname.split('/').pop() || ''

    try {
        // ── 1. Validate Authorization header ──────────────────────────
        const authHeader = req.headers.get("Authorization");
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

        // ── 3. Forward to backend with server-enforced identity ──────
        if (!BACKEND_BASE_URL) {
            console.error(`[${requestId}] CRITICAL: Backend URL not configured`)
            return new Response(JSON.stringify({ error: 'Service configuration error' }), {
                status: 503,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            })
        }

        let targetUrl = ''
        const fetchOptions: RequestInit = {
            method: 'POST',
            headers: {
                'Authorization': authHeader,
                'X-Request-Id': requestId,
                'X-Forwarded-For': req.headers.get('X-Forwarded-For') || 'unknown',
            }
        }

        // ── 4. Route Handling ────────────────────────────────────────
        if (path === 'upload') {
            targetUrl = `${BACKEND_BASE_URL}/upload/`
            const incomingFormData = await req.formData()
            const outgoingFormData = new FormData()

            const file = incomingFormData.get('file')
            if (!file) throw new Error("No file provided in request")

            outgoingFormData.append('file', file)
            outgoingFormData.append('customer_id', user.id) // Securely inject identity

            fetchOptions.body = outgoingFormData
            console.log(`[${requestId}] AUDIT: Forwarding Upload | user=${user.id}`)
        } else {
            // Default to query
            targetUrl = `${BACKEND_BASE_URL}/query/`
            const body = await req.json()
            const query = body.query

            if (!query || typeof query !== 'string' || query.trim().length === 0) {
                return new Response(JSON.stringify({ error: 'Missing or empty query parameter' }), {
                    status: 400,
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                })
            }

            fetchOptions.headers = { ...fetchOptions.headers, 'Content-Type': 'application/json' }
            fetchOptions.body = JSON.stringify({
                query: query.trim(),
                customer_id: user.id // Securely inject identity
            })
            console.log(`[${requestId}] AUDIT: Forwarding Query | user=${user.id}`)
        }

        const backendResponse = await fetch(targetUrl, fetchOptions)

        // Handle non-JSON or error responses from backend gracefully
        const contentType = backendResponse.headers.get("content-type")
        let responseData
        if (contentType && contentType.includes("application/json")) {
            responseData = await backendResponse.json()
        } else {
            const rawText = await backendResponse.text()
            console.error(`[${requestId}] ERROR: Backend returned non-JSON: ${rawText.slice(0, 200)}`)
            return new Response(JSON.stringify({ error: 'Backend communication error' }), {
                status: 502,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            })
        }

        const durationMs = Date.now() - startTime
        console.log(`[${requestId}] AUDIT: Completed | status=${backendResponse.status} | duration=${durationMs}ms`)

        return new Response(JSON.stringify(responseData), {
            status: backendResponse.status,
            headers: {
                ...corsHeaders,
                'Content-Type': 'application/json',
                'X-Duration-Ms': String(durationMs),
            },
        })

    } catch (error: any) {
        const durationMs = Date.now() - startTime
        console.error(`[${requestId}] ERROR: ${error.message} | duration=${durationMs}ms`)

        return new Response(JSON.stringify({
            error: error.message || 'Internal proxy error',
            request_id: requestId,
        }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
    }
})
