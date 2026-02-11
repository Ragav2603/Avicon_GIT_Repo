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
  requestId: z.string().uuid("Invalid request ID format"),
  problemArea: z.enum(['process', 'tooling', 'strategy'], {
    errorMap: () => ({ message: "Problem area must be 'process', 'tooling', or 'strategy'" })
  }),
  message: z.string().min(10, "Message must be at least 10 characters").max(2000, "Message must be less than 2000 characters"),
  // requesterEmail removed to prevent spoofing
});

const problemAreaLabels: Record<string, string> = {
  process: "Process & Workflow",
  tooling: "Technology & Tooling",
  strategy: "Strategy & Planning",
};

Deno.serve(async (req: Request): Promise<Response> => {
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

    // Validate JWT using getUser instead of insecure getClaims
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      console.error("Invalid user token:", userError);
      return new Response(
        JSON.stringify({ error: "Invalid token" }),
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const requesterEmail = user.email;
    if (!requesterEmail) {
      return new Response(
        JSON.stringify({ error: "User email required" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

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

    const { requestId, problemArea, message } = parseResult.data;

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

    // Escape user-controlled inputs to prevent XSS
    const safeRequesterEmail = escapeHtml(requesterEmail);
    const safeProblemLabel = escapeHtml(problemLabel);
    const safeRequestId = escapeHtml(requestId);
    const safeMessage = escapeHtml(message);

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
                <p style="margin: 0 0 8px 0;"><strong>From:</strong> ${safeRequesterEmail}</p>
                <p style="margin: 0 0 8px 0;"><strong>Problem Area:</strong> ${safeProblemLabel}</p>
                <p style="margin: 0;"><strong>Request ID:</strong> ${safeRequestId}</p>
              </div>
              
              <div style="background-color: #fefce8; border: 1px solid #fef08a; border-radius: 8px; padding: 20px; margin: 24px 0;">
                <p style="margin: 0 0 8px 0; font-weight: 600; color: #854d0e;">Message:</p>
                <p style="margin: 0; color: #713f12; white-space: pre-wrap;">${safeMessage}</p>
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
        subject: `New Consulting Request: ${safeProblemLabel}`,
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
    console.error("Error in notify-consulting-request:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
});
