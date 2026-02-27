import { serve } from "https://deno.land/std@0.177.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1"

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
}

const BACKEND_BASE_URL = Deno.env.get('AI_BACKEND_URL') || Deno.env.get('AZURE_BACKEND_URL') || Deno.env.get('PYTHON_AI_BACKEND_URL') || ''

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    const requestId = crypto.randomUUID()
    const startTime = Date.now()
    const url = new URL(req.url)
    const path = url.pathname.split('/').pop() || ''

    try {
        // ── Health-check diagnostic endpoint ──
        if (path === 'health') {
            const diagnostics: Record<string, unknown> = {
                request_id: requestId,
                backend_url_configured: !!BACKEND_BASE_URL,
                timestamp: new Date().toISOString(),
            }
            if (BACKEND_BASE_URL) {
                try {
                    const healthResp = await fetch(`${BACKEND_BASE_URL}/health`, {
                        signal: AbortSignal.timeout(10000),
                    })
                    const healthBody = await healthResp.text()
                    diagnostics.backend_reachable = true
                    diagnostics.backend_status = healthResp.status
                    diagnostics.backend_response = healthBody.slice(0, 200)
                } catch (e: any) {
                    diagnostics.backend_reachable = false
                    diagnostics.backend_error = e.message
                }
            }
            return new Response(JSON.stringify(diagnostics), {
                status: 200,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            })
        }

        const authHeader = req.headers.get("Authorization");
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            console.error(`[${requestId}] AUDIT: Missing/invalid Authorization header`)
            return new Response(JSON.stringify({ error: 'Unauthorized', request_id: requestId }), {
                status: 401,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            })
        }

        const supabaseClient = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_ANON_KEY') ?? '',
            { global: { headers: { Authorization: authHeader } } }
        )

        const token = authHeader.replace('Bearer ', '')
        const { data, error: claimsError } = await supabaseClient.auth.getClaims(token)

        if (claimsError || !data?.claims) {
            console.error(`[${requestId}] AUDIT: Auth verification failed:`, claimsError?.message)
            return new Response(JSON.stringify({ error: 'Invalid or expired token', request_id: requestId }), {
                status: 401,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            })
        }

        const user = { id: data.claims.sub as string }

        if (!BACKEND_BASE_URL) {
            console.error(`[${requestId}] CRITICAL: Backend URL not configured`)
            return new Response(JSON.stringify({ error: 'Service configuration error: backend URL not set', request_id: requestId }), {
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

        if (path === 'upload') {
            targetUrl = `${BACKEND_BASE_URL}/upload/`
            const incomingFormData = await req.formData()
            const outgoingFormData = new FormData()
            const file = incomingFormData.get('file')
            if (!file) throw new Error("No file provided in request")
            outgoingFormData.append('file', file)
            outgoingFormData.append('customer_id', user.id)
            // Also forward project_id if present
            const projectId = incomingFormData.get('project_id')
            if (projectId) outgoingFormData.append('project_id', projectId.toString())
            fetchOptions.body = outgoingFormData
            console.log(`[${requestId}] AUDIT: Forwarding Upload | user=${user.id}`)
        } else {
            targetUrl = `${BACKEND_BASE_URL}/query/`
            const body = await req.json()
            const query = body.query
            if (!query || typeof query !== 'string' || query.trim().length === 0) {
                return new Response(JSON.stringify({ error: 'Missing or empty query parameter', request_id: requestId }), {
                    status: 400,
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                })
            }
            fetchOptions.headers = { ...fetchOptions.headers, 'Content-Type': 'application/json' }
            fetchOptions.body = JSON.stringify({
                query: query.trim(),
                customer_id: user.id,
                project_id: body.project_id || undefined,
            })
            console.log(`[${requestId}] AUDIT: Forwarding Query | user=${user.id}`)
        }

        const backendResponse = await fetch(targetUrl, fetchOptions)
        const contentType = backendResponse.headers.get("content-type")
        const durationMs = Date.now() - startTime

        // ── Handle non-2xx: capture and relay backend error details ──
        if (!backendResponse.ok) {
            const rawBody = await backendResponse.text()
            console.error(`[${requestId}] BACKEND_ERROR: status=${backendResponse.status} | duration=${durationMs}ms | body=${rawBody.slice(0, 500)}`)

            // Try to parse as JSON for structured error
            let errorDetail: string
            try {
                const parsed = JSON.parse(rawBody)
                errorDetail = parsed.detail || parsed.error || parsed.message || rawBody.slice(0, 300)
            } catch {
                errorDetail = rawBody.slice(0, 300) || `Backend returned ${backendResponse.status}`
            }

            return new Response(JSON.stringify({
                error: `Backend error (${backendResponse.status})`,
                detail: errorDetail,
                request_id: requestId,
                backend_status: backendResponse.status,
                duration_ms: durationMs,
            }), {
                status: backendResponse.status,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            })
        }

        // ── Support SSE streaming ──
        if (contentType && contentType.includes("text/event-stream")) {
            console.log(`[${requestId}] AUDIT: SSE stream | duration=${durationMs}ms`)
            return new Response(backendResponse.body, {
                status: backendResponse.status,
                headers: {
                    ...corsHeaders,
                    'Content-Type': 'text/event-stream',
                    'Cache-Control': 'no-cache',
                    'Connection': 'keep-alive',
                }
            })
        }

        // ── Normal JSON ──
        if (contentType && contentType.includes("application/json")) {
            const responseData = await backendResponse.json()
            console.log(`[${requestId}] AUDIT: Completed | status=${backendResponse.status} | duration=${durationMs}ms`)
            return new Response(JSON.stringify(responseData), {
                status: backendResponse.status,
                headers: { ...corsHeaders, 'Content-Type': 'application/json', 'X-Duration-Ms': String(durationMs) },
            })
        }

        // ── Fallback ──
        const rawText = await backendResponse.text()
        console.error(`[${requestId}] ERROR: Backend returned non-JSON: ${rawText.slice(0, 200)}`)
        return new Response(JSON.stringify({ error: 'Backend communication error', detail: rawText.slice(0, 200), request_id: requestId }), {
            status: 502,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })

    } catch (error: any) {
        const durationMs = Date.now() - startTime
        console.error(`[${requestId}] ERROR: ${error.message} | duration=${durationMs}ms`)
        return new Response(JSON.stringify({ error: error.message || 'Internal proxy error', request_id: requestId }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
    }
})
