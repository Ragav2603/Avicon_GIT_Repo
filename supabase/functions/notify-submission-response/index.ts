import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface NotifyRequest {
  submission_id: string;
  response_status: 'accepted' | 'rejected' | 'shortlisted';
  response_message?: string;
}

const statusLabels = {
  accepted: { label: 'Accepted', emoji: '✅', color: '#22c55e' },
  rejected: { label: 'Not Selected', emoji: '❌', color: '#ef4444' },
  shortlisted: { label: 'Shortlisted', emoji: '⭐', color: '#f59e0b' },
};

const handler = async (req: Request): Promise<Response> => {
  console.log("notify-submission-response function called");

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        global: { headers: { Authorization: authHeader } },
        auth: { persistSession: false },
      }
    );

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Validate JWT
    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);
    
    if (claimsError || !claimsData?.claims) {
      console.error("Invalid token:", claimsError);
      return new Response(
        JSON.stringify({ error: "Invalid token" }),
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const airlineId = claimsData.claims.sub as string;
    const { submission_id, response_status, response_message }: NotifyRequest = await req.json();

    if (!submission_id || !response_status) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Get submission details with RFP and vendor info
    const { data: submission, error: subError } = await supabaseAdmin
      .from("submissions")
      .select("id, vendor_id, rfp_id")
      .eq("id", submission_id)
      .single();

    if (subError || !submission) {
      console.error("Submission fetch error:", subError);
      return new Response(
        JSON.stringify({ error: "Submission not found" }),
        { status: 404, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Verify the airline owns this RFP
    const { data: rfp, error: rfpError } = await supabaseAdmin
      .from("rfps")
      .select("id, title, airline_id")
      .eq("id", submission.rfp_id)
      .single();

    if (rfpError || !rfp || rfp.airline_id !== airlineId) {
      console.error("RFP verification failed:", rfpError);
      return new Response(
        JSON.stringify({ error: "Unauthorized to respond to this submission" }),
        { status: 403, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Get airline info
    const { data: airline } = await supabaseAdmin
      .from("profiles")
      .select("company_name")
      .eq("id", airlineId)
      .single();

    // Get vendor email
    const { data: vendor, error: vendorError } = await supabaseAdmin
      .from("profiles")
      .select("email, company_name")
      .eq("id", submission.vendor_id)
      .single();

    if (vendorError || !vendor?.email) {
      console.error("Vendor fetch error:", vendorError);
      return new Response(
        JSON.stringify({ error: "Vendor not found" }),
        { status: 404, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Update the submission with the response
    const { error: updateError } = await supabaseAdmin
      .from("submissions")
      .update({
        response_status,
        airline_response: response_message || null,
      })
      .eq("id", submission_id);

    if (updateError) {
      console.error("Update error:", updateError);
      throw new Error("Failed to update submission");
    }

    console.log(`Sending response notification to ${vendor.email} for submission: ${submission_id}`);

    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    if (!RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY is not configured");
    }

    const status = statusLabels[response_status];
    const airlineName = airline?.company_name || 'The airline';

    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f4f4f5;">
        <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
          <div style="background-color: white; border-radius: 12px; padding: 40px; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);">
            <div style="text-align: center; margin-bottom: 32px;">
              <h1 style="margin: 0; font-size: 28px; color: #0ea5e9;">
                ✈️ Avi<span style="background: linear-gradient(135deg, #0ea5e9, #8b5cf6); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">Con</span>
              </h1>
            </div>
            
            <h2 style="color: #18181b; font-size: 24px; margin-bottom: 16px;">Proposal Update ${status.emoji}</h2>
            
            <div style="color: #52525b; font-size: 16px; line-height: 1.6;">
              <p>Hello${vendor.company_name ? ` ${vendor.company_name}` : ''},</p>
              
              <p>${airlineName} has responded to your proposal!</p>
              
              <div style="background-color: #f4f4f5; border-radius: 8px; padding: 20px; margin: 24px 0;">
                <p style="margin: 0 0 8px 0;"><strong>RFP:</strong> ${rfp.title}</p>
                <p style="margin: 0 0 8px 0;"><strong>Status:</strong> <span style="color: ${status.color}; font-weight: 600;">${status.label}</span></p>
                ${response_message ? `<p style="margin: 12px 0 0 0; padding-top: 12px; border-top: 1px solid #e4e4e7;"><strong>Message:</strong><br/>${response_message}</p>` : ''}
              </div>
              
              ${response_status === 'accepted' ? `
                <p>Congratulations! The airline has selected your proposal. They may reach out directly for next steps.</p>
              ` : response_status === 'shortlisted' ? `
                <p>Great news! Your proposal has been shortlisted for further consideration. Stay tuned for updates.</p>
              ` : `
                <p>Thank you for your submission. While your proposal wasn't selected this time, we encourage you to continue exploring other opportunities on AviCon.</p>
              `}
              
              <div style="text-align: center; margin: 32px 0;">
                <a href="https://avicon.lovable.app/vendor-dashboard" style="display: inline-block; background: linear-gradient(135deg, #0ea5e9, #8b5cf6); color: white; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600;">
                  View Dashboard
                </a>
              </div>
            </div>
            
            <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e4e4e7; text-align: center;">
              <p style="color: #a1a1aa; font-size: 14px; margin: 0;">
                Questions? Reply to this email or contact support@avicon.app
              </p>
            </div>
          </div>
          
          <p style="text-align: center; color: #a1a1aa; font-size: 12px; margin-top: 20px;">
            © 2026 AviCon. All rights reserved.
          </p>
        </div>
      </body>
      </html>
    `;

    const resendResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "AviCon <onboarding@resend.dev>",
        to: [vendor.email],
        subject: `${status.emoji} Proposal ${status.label}: ${rfp.title}`,
        html: emailHtml,
      }),
    });

    const data = await resendResponse.json();

    if (!resendResponse.ok) {
      console.error("Resend error:", data);
      throw new Error(data.message || "Failed to send email");
    }

    console.log("Email sent successfully:", data);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error in notify-submission-response:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
