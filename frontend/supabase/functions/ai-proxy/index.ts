import { serve } from "https://deno.land/std@0.177.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1"

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
}

// Function to safely extract subpath regardless of Supabase URL format
function getSubPath(urlPath: string): string {
    const parts = urlPath.split('/').filter(Boolean);
    const proxyIdx = parts.indexOf('ai-proxy');
    if (proxyIdx !== -1 && proxyIdx < parts.length - 1) {
        return parts.slice(proxyIdx + 1).join('/');
    }
    return '';
}

const BACKEND_BASE_URL = Deno.env.get('AI_BACKEND_URL') || Deno.env.get('AZURE_BACKEND_URL') || Deno.env.get('PYTHON_AI_BACKEND_URL') || ''

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    const requestId = crypto.randomUUID()
    const startTime = Date.now()
    const url = new URL(req.url)
    const subPath = getSubPath(url.pathname);

    console.log(`[${requestId}] INCOMING: ${req.method} ${url.pathname} | subPath=${subPath}`);

    try {
        if (subPath === 'health' || (url.pathname.endsWith('/ai-proxy') && !subPath)) {
            if (!subPath && req.method === 'GET') {
                return new Response(JSON.stringify({ status: 'ok', message: 'Avicon AI Proxy is active' }), {
                    status: 200,
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                });
            }
        }

        const authHeader = req.headers.get("Authorization");
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            console.error(`[${requestId}] ERROR: Unauthorized - Missing header`)
            return new Response(JSON.stringify({ error: 'Unauthorized', detail: 'Missing Authorization header', request_id: requestId }), {
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
        let userId: string | undefined;
        try {
            const { data, error } = await (supabaseClient.auth as any).getClaims(token);
            if (!error && data?.claims?.sub) {
                userId = data.claims.sub;
            } else {
                const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token);
                if (!userError && user) userId = user.id;
            }
        } catch (e) {
            const { data: { user } } = await supabaseClient.auth.getUser(token);
            userId = user?.id;
        }

        if (!userId) {
            console.error(`[${requestId}] ERROR: Forbidden - Invalid token`)
            return new Response(JSON.stringify({ error: 'Forbidden', detail: 'Invalid or expired token', request_id: requestId }), {
                status: 403,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            })
        }

        if (!BACKEND_BASE_URL) {
            console.error(`[${requestId}] ERROR: Configuration - Backend URL missing`)
            return new Response(JSON.stringify({ error: 'Configuration Error', detail: 'Backend URL not set in secrets', request_id: requestId }), {
                status: 503,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            })
        }

        const base = BACKEND_BASE_URL.replace(/\/+$/, '');
        let targetUrl = '';
        const fetchOptions: RequestInit = {
            method: req.method,
            headers: {
                'Authorization': authHeader,
                'X-Request-Id': requestId,
                'X-Forwarded-For': req.headers.get('X-Forwarded-For') || 'unknown',
            }
        }

        if (subPath === 'upload') {
            targetUrl = `${base}/api/documents/upload`;
            const incomingFormData = await req.formData()
            const outgoingFormData = new FormData()
            const file = incomingFormData.get('file')
            if (!file) throw new Error("No file provided in request")
            outgoingFormData.append('file', file)
            outgoingFormData.append('customer_id', userId)
            const projectId = incomingFormData.get('project_id')
            if (projectId) outgoingFormData.append('project_id', projectId.toString())
            fetchOptions.body = outgoingFormData
            console.log(`[${requestId}] PROXY: Legacy Upload -> ${targetUrl}`);

        } else if (subPath === 'query') {
            targetUrl = `${base}/api/query/`;
            const body = await req.json()
            fetchOptions.headers = { ...fetchOptions.headers, 'Content-Type': 'application/json' }
            fetchOptions.body = JSON.stringify({
                query: body.query || '',
                customer_id: userId,
                project_id: body.project_id || undefined,
            })
            console.log(`[${requestId}] PROXY: Legacy Query -> ${targetUrl}`);

        } else {
            let finalPath = subPath;
            if (base.endsWith('/api') && subPath.startsWith('api/')) {
                finalPath = subPath.substring(4);
            }
            targetUrl = `${base}/${finalPath}${url.search}`;

            const contentType = req.headers.get('Content-Type');
            if (contentType) {
                fetchOptions.headers = { ...fetchOptions.headers, 'Content-Type': contentType };
            }

            if (req.method !== 'GET' && req.method !== 'HEAD') {
                fetchOptions.body = req.body;
                (fetchOptions as any).duplex = 'half';
            }
            console.log(`[${requestId}] PROXY: ${req.method} -> ${targetUrl}`);
        }

        const backendResponse = await fetch(targetUrl, fetchOptions)
        const responseHeaders = backendResponse.headers.get("content-type")
        const durationMs = Date.now() - startTime

        if (!backendResponse.ok) {
            const rawBody = await backendResponse.text()
            console.error(`[${requestId}] BACKEND_ERROR: ${backendResponse.status} | ${rawBody.slice(0, 200)}`)
            return new Response(rawBody, {
                status: backendResponse.status,
                headers: { ...corsHeaders, 'Content-Type': responseHeaders || 'application/json' },
            })
        }

        if (responseHeaders && responseHeaders.includes("text/event-stream")) {
            return new Response(backendResponse.body, {
                status: backendResponse.status,
                headers: { ...corsHeaders, 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache' }
            })
        }

        const responseData = await backendResponse.arrayBuffer();
        console.log(`[${requestId}] COMPLETED: ${backendResponse.status} | ${durationMs}ms`);

        return new Response(responseData, {
            status: backendResponse.status,
            headers: {
                ...corsHeaders,
                'Content-Type': responseHeaders || 'application/json',
                'X-Duration-Ms': String(durationMs)
            },
        })

    } catch (error: any) {
        const durationMs = Date.now() - startTime
        console.error(`[${requestId}] PROXY_CRASH: ${error.message}`);
        return new Response(JSON.stringify({
            error: 'Proxy Error',
            detail: error.message,
            request_id: requestId,
            duration_ms: durationMs
        }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
    }
})
