import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface WelcomeEmailRequest {
  email: string;
  role: 'airline' | 'vendor' | 'consultant';
}

const getEmailContent = (email: string, role: string) => {
  const roleTemplates = {
    airline: {
      subject: "Welcome to AviCon - Your RFP Management Hub",
      heading: "Welcome, Airline Manager!",
      body: `
        <p>Thank you for joining AviCon! You now have access to our powerful RFP management platform.</p>
        <h3>What you can do:</h3>
        <ul>
          <li>Create and publish RFPs to our verified vendor network</li>
          <li>Receive AI-scored proposals from qualified vendors</li>
          <li>Compare submissions with our intelligent matching system</li>
          <li>Track adoption metrics for your technology solutions</li>
        </ul>
        <p>Ready to get started? <a href="https://avicon.lovable.app/airline-dashboard" style="color: #0ea5e9;">Visit your dashboard</a> to post your first RFP.</p>
      `,
    },
    vendor: {
      subject: "Welcome to AviCon - Connect with Airlines Worldwide",
      heading: "Welcome, Vendor Partner!",
      body: `
        <p>Thank you for joining AviCon! You're now part of our global aviation vendor network.</p>
        <h3>What you can do:</h3>
        <ul>
          <li>Browse open RFPs from airlines around the world</li>
          <li>Submit proposals and showcase your solutions</li>
          <li>Get AI-verified scoring to stand out from competition</li>
          <li>Build your verified vendor profile</li>
        </ul>
        <p>Ready to explore opportunities? <a href="https://avicon.lovable.app/vendor-dashboard" style="color: #0ea5e9;">Visit your dashboard</a> to view active RFPs.</p>
      `,
    },
    consultant: {
      subject: "Welcome to AviCon - Aviation Consulting Platform",
      heading: "Welcome, Aviation Consultant!",
      body: `
        <p>Thank you for joining AviCon! You now have access to our comprehensive adoption auditing tools.</p>
        <h3>What you can do:</h3>
        <ul>
          <li>Conduct adoption audits for airline clients</li>
          <li>Generate AI-powered insights and recommendations</li>
          <li>Manage invite codes and approved domains</li>
          <li>Track utilization metrics across organizations</li>
        </ul>
        <p>Ready to start auditing? <a href="https://avicon.lovable.app/consultant-dashboard" style="color: #0ea5e9;">Visit your dashboard</a> to begin.</p>
      `,
    },
  };

  const template = roleTemplates[role as keyof typeof roleTemplates] || roleTemplates.vendor;

  return {
    subject: template.subject,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f4f4f5;">
        <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
          <div style="background-color: white; border-radius: 12px; padding: 40px; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);">
            <!-- Logo -->
            <div style="text-align: center; margin-bottom: 32px;">
              <h1 style="margin: 0; font-size: 28px; color: #0ea5e9;">
                ✈️ Avi<span style="background: linear-gradient(135deg, #0ea5e9, #8b5cf6); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">Con</span>
              </h1>
            </div>
            
            <!-- Content -->
            <h2 style="color: #18181b; font-size: 24px; margin-bottom: 16px;">${template.heading}</h2>
            <div style="color: #52525b; font-size: 16px; line-height: 1.6;">
              ${template.body}
            </div>
            
            <!-- Footer -->
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
    `,
  };
};

const handler = async (req: Request): Promise<Response> => {
  console.log("send-welcome-email function called");

  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, role }: WelcomeEmailRequest = await req.json();
    
    console.log(`Sending welcome email to ${email} with role ${role}`);

    if (!email || !role) {
      throw new Error("Email and role are required");
    }

    const { subject, html } = getEmailContent(email, role);

    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    if (!RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY is not configured");
    }

    const resendResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "AviCon <onboarding@resend.dev>",
        to: [email],
        subject,
        html,
      }),
    });

    const data = await resendResponse.json();

    if (!resendResponse.ok) {
      console.error("Resend error:", data);
      throw new Error(data.message || "Failed to send email");
    }

    console.log("Email sent successfully:", data);

    return new Response(JSON.stringify({ success: true, data }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error in send-welcome-email function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
