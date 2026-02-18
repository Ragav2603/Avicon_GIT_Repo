import { createClient } from "npm:@supabase/supabase-js@2";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// HTML escaping function to prevent XSS in emails
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// Input validation schema
const requestSchema = z.object({
  rfp_id: z.string().uuid("Invalid RFP ID format"),
  // Legacy fields (optional/ignored)
  // Optional fields for backward compatibility, but values are ignored for security
  vendor_name: z.string().optional(),
  rfp_title: z.string().optional(),
});

Deno.serve(async (req: Request): Promise<Response> => {
  console.log("notify-proposal-submitted function called");

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
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      console.error("Invalid token:", userError);
      return new Response(
        JSON.stringify({ error: "Invalid token" }),
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const vendor_id = user.id;

    // Validate input
    const rawBody = await req.json();
    const parseResult = requestSchema.safeParse(rawBody);
    
    if (!parseResult.success) {
      console.error("Validation error:", parseResult.error.errors);
      return new Response(
        JSON.stringify({ error: "Invalid input", details: parseResult.error.errors }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const { rfp_id } = parseResult.data;

    // Verify submission exists for this vendor and RFP
    const { data: submission, error: subError } = await supabaseAdmin
      .from("submissions")
      .select("id")
      .eq("rfp_id", rfp_id)
      .eq("vendor_id", vendor_id)
      .maybeSingle();

    if (subError) {
       console.error("Submission check error:", subError);
       return new Response(
        JSON.stringify({ error: "Database error checking submission" }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    if (!submission) {
      console.error(`Unauthorized notification attempt: Vendor ${vendor_id} for RFP ${rfp_id}`);
      return new Response(
        JSON.stringify({ error: "Unauthorized: No submission found for this RFP" }),
        { status: 403, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Get the airline's email and RFP title from the RFP
    const { data: rfp, error: rfpError } = await supabaseAdmin
      .from("rfps")
      .select("title, airline_id")
      .eq("id", rfp_id)
      .single();

    if (rfpError || !rfp) {
      console.error("RFP fetch error:", rfpError);
      return new Response(
        JSON.stringify({ error: "RFP not found" }),
        { status: 404, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Get the airline's email from the RFP
    const rfp_title = rfp.title;

    const { data: airline, error: airlineError } = await supabaseAdmin
      .from("profiles")
      .select("email, company_name")
      .eq("id", rfp.airline_id)
      .single();

    if (airlineError || !airline?.email) {
      console.error("Airline fetch error:", airlineError);
      return new Response(
        JSON.stringify({ error: "Airline not found" }),
        { status: 404, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Get vendor's company name from profile
    const { data: vendorProfile, error: vendorError } = await supabaseAdmin
      .from("profiles")
      .select("company_name")
      .eq("id", vendor_id)
      .single();

    if (vendorError) {
      console.error("Vendor profile fetch error:", vendorError);
      return new Response(
        JSON.stringify({ error: "Vendor profile not found" }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const vendor_name = vendorProfile?.company_name || "A Vendor";

    console.log(`Sending proposal notification to ${airline.email} for RFP: ${rfp_title}`);

    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    if (!RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY is not configured");
    }

    // Escape user-controlled inputs to prevent XSS
    const safeRfpTitle = escapeHtml(rfp_title);
    const safeVendorName = escapeHtml(vendor_name);
    const safeCompanyName = airline.company_name ? escapeHtml(airline.company_name) : '';

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
            
            <h2 style="color: #18181b; font-size: 24px; margin-bottom: 16px;">New Proposal Received! 🎉</h2>
            
            <div style="color: #52525b; font-size: 16px; line-height: 1.6;">
              <p>Hello${safeCompanyName ? ` ${safeCompanyName}` : ''},</p>
              
              <p>Great news! You've received a new proposal for your RFP:</p>
              
              <div style="background-color: #f4f4f5; border-radius: 8px; padding: 20px; margin: 24px 0;">
                <p style="margin: 0 0 8px 0;"><strong>RFP:</strong> ${safeRfpTitle}</p>
                <p style="margin: 0;"><strong>Vendor:</strong> ${safeVendorName}</p>
              </div>
              
              <p>Log in to your dashboard to review the proposal and see how well it matches your requirements.</p>
              
              <div style="text-align: center; margin: 32px 0;">
                <a href="https://avicon.lovable.app/rfp/${rfp_id}" style="display: inline-block; background: linear-gradient(135deg, #0ea5e9, #8b5cf6); color: white; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600;">
                  View Proposal
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
        to: [airline.email],
        subject: `New Proposal Received: ${safeRfpTitle}`,
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
  } catch (error: unknown) {
    console.error("Error in notify-proposal-submitted:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
});
