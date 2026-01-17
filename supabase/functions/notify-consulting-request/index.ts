import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ConsultingRequestNotification {
  requestId: string;
  problemArea: string;
  message: string;
  requesterEmail: string;
}

const problemAreaLabels: Record<string, string> = {
  process: "Process & Workflow",
  tooling: "Technology & Tooling",
  strategy: "Strategy & Planning",
};

const handler = async (req: Request): Promise<Response> => {
  console.log("notify-consulting-request function called");

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

    const { requestId, problemArea, message, requesterEmail }: ConsultingRequestNotification = await req.json();

    console.log("Received notification request:", { requestId, problemArea, requesterEmail });

    // Fetch all consultant emails
    const { data: consultants, error: consultantError } = await supabaseAdmin
      .from("profiles")
      .select("email")
      .eq("role", "consultant");

    if (consultantError) {
      console.error("Error fetching consultants:", consultantError);
      throw consultantError;
    }

    console.log("Found consultants:", consultants?.length || 0);

    if (!consultants || consultants.length === 0) {
      console.log("No consultants found to notify");
      return new Response(
        JSON.stringify({ message: "No consultants to notify" }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const consultantEmails = consultants
      .filter((c) => c.email)
      .map((c) => c.email as string);

    if (consultantEmails.length === 0) {
      console.log("No consultant emails found");
      return new Response(
        JSON.stringify({ message: "No consultant emails found" }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const problemLabel = problemAreaLabels[problemArea] || problemArea;

    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    if (!RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY is not configured");
    }

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
            
            <h2 style="color: #18181b; font-size: 24px; margin-bottom: 16px;">New Consulting Request 📋</h2>
            
            <div style="color: #52525b; font-size: 16px; line-height: 1.6;">
              <p>Hello Consultant,</p>
              
              <p>A new consulting request has been submitted and requires your attention:</p>
              
              <div style="background-color: #f4f4f5; border-radius: 8px; padding: 20px; margin: 24px 0;">
                <p style="margin: 0 0 8px 0;"><strong>From:</strong> ${requesterEmail}</p>
                <p style="margin: 0 0 8px 0;"><strong>Problem Area:</strong> ${problemLabel}</p>
                <p style="margin: 0;"><strong>Request ID:</strong> ${requestId}</p>
              </div>
              
              <div style="background-color: #fefce8; border: 1px solid #fef08a; border-radius: 8px; padding: 20px; margin: 24px 0;">
                <p style="margin: 0 0 8px 0; font-weight: 600; color: #854d0e;">Message:</p>
                <p style="margin: 0; color: #713f12; white-space: pre-wrap;">${message}</p>
              </div>
              
              <p>Please log in to your consultant dashboard to review and respond to this request.</p>
              
              <div style="text-align: center; margin: 32px 0;">
                <a href="https://avicon.lovable.app/consultant-dashboard" style="display: inline-block; background: linear-gradient(135deg, #0ea5e9, #8b5cf6); color: white; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600;">
                  View Request
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

    // Send email to all consultants
    const resendResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "AviCon <onboarding@resend.dev>",
        to: consultantEmails,
        subject: `New Consulting Request: ${problemLabel}`,
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
    console.error("Error in notify-consulting-request:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
