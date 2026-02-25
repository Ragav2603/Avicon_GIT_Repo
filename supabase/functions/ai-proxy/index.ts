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
        const authHeader = req.headers.get("Authorization");
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            console.error(`[${requestId}] AUDIT: Missing/invalid Authorization header`)
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

        const token = authHeader.replace('Bearer ', '')
        const { data, error: claimsError } = await supabaseClient.auth.getClaims(token)

        if (claimsError || !data?.claims) {
            console.error(`[${requestId}] AUDIT: Auth verification failed:`, claimsError?.message)
            return new Response(JSON.stringify({ error: 'Invalid or expired token' }), {
                status: 401,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            })
        }

        const user = { id: data.claims.sub as string }

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

        if (path === 'upload') {
            targetUrl = `${BACKEND_BASE_URL}/upload/`
            const incomingFormData = await req.formData()
            const outgoingFormData = new FormData()
            const file = incomingFormData.get('file')
            if (!file) throw new Error("No file provided in request")
            outgoingFormData.append('file', file)
            outgoingFormData.append('customer_id', user.id)
            fetchOptions.body = outgoingFormData
            console.log(`[${requestId}] AUDIT: Forwarding Upload | user=${user.id}`)
        } else {
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
            fetchOptions.body = JSON.stringify({ query: query.trim(), customer_id: user.id })
            console.log(`[${requestId}] AUDIT: Forwarding Query | user=${user.id}`)
        }

        const backendResponse = await fetch(targetUrl, fetchOptions)
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
            headers: { ...corsHeaders, 'Content-Type': 'application/json', 'X-Duration-Ms': String(durationMs) },
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
