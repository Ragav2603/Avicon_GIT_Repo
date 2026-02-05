import { createClient } from "npm:@supabase/supabase-js@2";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

// Input validation schemas
const VerifyRequestSchema = z.object({
  invite_token: z.string().uuid("Invalid invite token format"),
  action: z.literal('verify'),
});

const SubmitRequestSchema = z.object({
  invite_token: z.string().uuid("Invalid invite token format"),
  action: z.literal('submit'),
  pitch_text: z.string().min(10, "Pitch text must be at least 10 characters").max(50000, "Pitch text too long"),
  vendor_email: z.string().email("Invalid email format").max(255),
  vendor_name: z.string().max(255).optional(),
});

const MagicLinkRequestSchema = z.discriminatedUnion('action', [
  VerifyRequestSchema,
  SubmitRequestSchema,
]);

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Parse and validate request body
    const rawBody = await req.json();
    const validationResult = MagicLinkRequestSchema.safeParse(rawBody);
    
    if (!validationResult.success) {
      return new Response(
        JSON.stringify({ 
          error: 'Invalid request data', 
          details: validationResult.error.errors 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const body = validationResult.data;
    const { invite_token, action } = body;

    // Look up the vendor invite
    const { data: invite, error: inviteError } = await supabase
      .from('vendor_invites')
      .select(`
        id,
        rfp_id,
        vendor_email,
        expires_at,
        used_at,
        rfps (
          id,
          title,
          description,
          budget_max,
          deadline,
          status,
          airline_id
        )
      `)
      .eq('invite_token', invite_token)
      .single();

    if (inviteError || !invite) {
      return new Response(
        JSON.stringify({ error: 'Invalid or expired invite link' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if expired
    if (new Date(invite.expires_at) < new Date()) {
      return new Response(
        JSON.stringify({ error: 'This invite link has expired' }),
        { status: 410, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if RFP is still open
    const rfp = invite.rfps as { id: string; title: string; description: string; budget_max: number; deadline: string; status: string; airline_id: string } | null;
    if (!rfp || rfp.status !== 'open') {
      return new Response(
        JSON.stringify({ error: 'This Request Project is no longer accepting submissions' }),
        { status: 410, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Handle verify action - return RFP details
    if (action === 'verify') {
      // Fetch requirements
      const { data: requirements } = await supabase
        .from('rfp_requirements')
        .select('*')
        .eq('rfp_id', invite.rfp_id)
        .order('weight', { ascending: false });

      return new Response(
        JSON.stringify({
          success: true,
          rfp: {
            id: rfp.id,
            title: rfp.title,
            description: rfp.description,
            budget_max: rfp.budget_max,
            deadline: rfp.deadline,
          },
          requirements: requirements || [],
          already_used: !!invite.used_at,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Handle submit action
    if (action === 'submit') {
      const { pitch_text, vendor_email, vendor_name } = body;

      // Check if already submitted
      if (invite.used_at) {
        return new Response(
          JSON.stringify({ error: 'A response has already been submitted using this link' }),
          { status: 409, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Find or create a temporary vendor profile
      let vendorId: string;
      
      // Check if vendor exists
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', vendor_email.toLowerCase())
        .single();

      if (existingProfile) {
        vendorId = existingProfile.id;
      } else {
        // Create a magic-link user entry (pseudo-user for tracking)
        // In production, you might use Supabase Auth createUser
        const { data: newProfile, error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: crypto.randomUUID(),
            email: vendor_email.toLowerCase(),
            company_name: vendor_name || null,
            role: 'vendor',
          })
          .select()
          .single();

        if (profileError) {
          console.error('Profile creation error:', profileError);
          return new Response(
            JSON.stringify({ error: 'Failed to create vendor profile' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        vendorId = newProfile.id;
      }

      // Create the submission
      const { data: submission, error: submissionError } = await supabase
        .from('submissions')
        .insert({
          rfp_id: invite.rfp_id,
          vendor_id: vendorId,
          pitch_text,
          status: 'submitted',
          response_status: 'pending',
        })
        .select()
        .single();

      if (submissionError) {
        console.error('Submission error:', submissionError);
        return new Response(
          JSON.stringify({ error: 'Failed to submit response' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Mark invite as used
      await supabase
        .from('vendor_invites')
        .update({ used_at: new Date().toISOString() })
        .eq('id', invite.id);

      return new Response(
        JSON.stringify({
          success: true,
          submission_id: submission.id,
          message: 'Your response has been submitted successfully!',
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Invalid action' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Magic link error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
