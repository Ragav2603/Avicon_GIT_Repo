import { serve } from "https://deno.land/std@0.177.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1"

/**
 * sync-external-provider — OAuth stub for OneDrive/SharePoint/Google Docs
 *
 * This edge function handles:
 * 1. Initiating OAuth flow for external providers
 * 2. Listing files from connected external sources
 * 3. Syncing selected files into the user's KB
 */

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        // Verify authentication
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

        const { action, provider, folder_id } = await req.json()

        switch (action) {
            case 'initiate_oauth': {
                // Stub: Return OAuth URL for the provider
                const oauthUrls: Record<string, string> = {
                    sharepoint: 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize',
                    onedrive: 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize',
                    gdocs: 'https://accounts.google.com/o/oauth2/v2/auth',
                }

                return new Response(JSON.stringify({
                    status: 'stub',
                    message: `OAuth flow for ${provider} - requires client_id configuration`,
                    oauth_url: oauthUrls[provider] || null,
                    required_scopes: provider === 'gdocs'
                        ? ['https://www.googleapis.com/auth/drive.readonly']
                        : ['Files.Read.All', 'Sites.Read.All'],
                }), {
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                })
            }

            case 'list_files': {
                // Stub: Return mock file listing
                return new Response(JSON.stringify({
                    status: 'stub',
                    message: `File listing for ${provider} - requires OAuth token`,
                    files: [
                        { id: 'mock-1', name: 'RFP_Template_2025.docx', size_mb: 2.4, type: 'docx' },
                        { id: 'mock-2', name: 'Vendor_Compliance_Matrix.xlsx', size_mb: 1.1, type: 'xlsx' },
                        { id: 'mock-3', name: 'Technical_Specifications.pdf', size_mb: 5.7, type: 'pdf' },
                    ],
                }), {
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                })
            }

            case 'sync_file': {
                // Stub: Sync a specific file to KB
                return new Response(JSON.stringify({
                    status: 'stub',
                    message: 'File sync requires active OAuth connection and storage configuration',
                    target_folder_id: folder_id,
                }), {
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                })
            }

            default:
                return new Response(JSON.stringify({ error: `Unknown action: ${action}` }), {
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
