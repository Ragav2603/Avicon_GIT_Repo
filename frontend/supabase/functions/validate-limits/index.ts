import { serve } from "https://deno.land/std@0.177.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1"

/**
 * validate-limits — Enforce organizational quotas
 *
 * Checks:
 * 1. File size <= 20MB
 * 2. Folder count <= 10/user, 20/org
 * 3. Document count <= 100/org
 */

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const LIMITS = {
    MAX_FILE_SIZE_MB: 20,
    MAX_FOLDERS_PER_USER: 10,
    MAX_FOLDERS_PER_ORG: 20,
    MAX_DOCS_PER_ORG: 100,
}

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const authHeader = req.headers.get('Authorization')
        if (!authHeader) {
            return new Response(JSON.stringify({ error: 'Unauthorized' }), {
                status: 401,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            })
        }

        const supabase = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_ANON_KEY') ?? '',
            { global: { headers: { Authorization: authHeader } } }
        )

        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) {
            return new Response(JSON.stringify({ error: 'Invalid token' }), {
                status: 401,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            })
        }

        const { check_type, file_size_mb, organization_id } = await req.json()

        switch (check_type) {
            case 'file_upload': {
                // Check file size
                if (file_size_mb > LIMITS.MAX_FILE_SIZE_MB) {
                    return new Response(JSON.stringify({
                        allowed: false,
                        reason: `File size (${file_size_mb}MB) exceeds limit (${LIMITS.MAX_FILE_SIZE_MB}MB)`,
                    }), {
                        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                    })
                }

                // Check doc count
                const { count: docCount } = await supabase
                    .from('kb_documents')
                    .select('*', { count: 'exact', head: true })
                    .eq('user_id', user.id)

                if ((docCount ?? 0) >= LIMITS.MAX_DOCS_PER_ORG) {
                    return new Response(JSON.stringify({
                        allowed: false,
                        reason: `Document limit reached (${LIMITS.MAX_DOCS_PER_ORG})`,
                    }), {
                        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                    })
                }

                return new Response(JSON.stringify({
                    allowed: true,
                    current_docs: docCount,
                    limit: LIMITS.MAX_DOCS_PER_ORG,
                }), {
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                })
            }

            case 'create_folder': {
                const { count: userFolders } = await supabase
                    .from('kb_folders')
                    .select('*', { count: 'exact', head: true })
                    .eq('user_id', user.id)

                if ((userFolders ?? 0) >= LIMITS.MAX_FOLDERS_PER_USER) {
                    return new Response(JSON.stringify({
                        allowed: false,
                        reason: `Folder limit reached (${LIMITS.MAX_FOLDERS_PER_USER}/user)`,
                    }), {
                        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                    })
                }

                if (organization_id) {
                    const { count: orgFolders } = await supabase
                        .from('kb_folders')
                        .select('*', { count: 'exact', head: true })
                        .eq('organization_id', organization_id)

                    if ((orgFolders ?? 0) >= LIMITS.MAX_FOLDERS_PER_ORG) {
                        return new Response(JSON.stringify({
                            allowed: false,
                            reason: `Organization folder limit reached (${LIMITS.MAX_FOLDERS_PER_ORG})`,
                        }), {
                            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                        })
                    }
                }

                return new Response(JSON.stringify({
                    allowed: true,
                    current_folders: userFolders,
                    limit: LIMITS.MAX_FOLDERS_PER_USER,
                }), {
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                })
            }

            default:
                return new Response(JSON.stringify({ error: `Unknown check_type: ${check_type}` }), {
                    status: 400,
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                })
        }

    } catch (error: any) {
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
    }
})
