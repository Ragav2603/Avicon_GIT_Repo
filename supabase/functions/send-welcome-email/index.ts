import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient, SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Input validation schema
const emailRequestSchema = z.object({
  role: z.enum(["airline", "vendor", "consultant"])
});

const RATE_LIMIT_WINDOW_MS = 86400000; // 24 hours
const RATE_LIMIT_MAX_REQUESTS = 5; // Max 5 welcome emails per day

interface RateLimitRecord {
  id: string;
  user_id: string;
  endpoint: string;
  request_count: number;
  window_start: string;
}

// Check rate limit for a user/endpoint combination
async function checkRateLimit(
  supabaseAdmin: SupabaseClient,
  userId: string,
  endpoint: string
): Promise<{ allowed: boolean; remaining: number }> {
  const windowStart = new Date(Date.now() - RATE_LIMIT_WINDOW_MS).toISOString();
  
  // Get current rate limit record
  const { data, error: fetchError } = await supabaseAdmin
    .from("rate_limits")
    .select("*")
    .eq("user_id", userId)
    .eq("endpoint", endpoint)
    .gte("window_start", windowStart)
    .maybeSingle();

  const rateLimit = data as RateLimitRecord | null;

  if (fetchError) {
    console.error("Rate limit fetch error:", fetchError);
    // Allow on error to prevent blocking legitimate requests
    return { allowed: true, remaining: RATE_LIMIT_MAX_REQUESTS };
  }

  if (!rateLimit) {
    // No recent record, create new one
    await supabaseAdmin
      .from("rate_limits")
      .upsert({
        user_id: userId,
        endpoint: endpoint,
        request_count: 1,
        window_start: new Date().toISOString()
      } as never, { onConflict: "user_id,endpoint" });
    
    return { allowed: true, remaining: RATE_LIMIT_MAX_REQUESTS - 1 };
  }

  if (rateLimit.request_count >= RATE_LIMIT_MAX_REQUESTS) {
    return { allowed: false, remaining: 0 };
  }

  // Increment count
  await supabaseAdmin
    .from("rate_limits")
    .update({ request_count: rateLimit.request_count + 1 } as never)
    .eq("id", rateLimit.id);

  return { allowed: true, remaining: RATE_LIMIT_MAX_REQUESTS - rateLimit.request_count - 1 };
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
    // Verify authentication
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      console.error("No authorization header provided");
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

    // Create admin client for rate limiting
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Validate JWT and get user
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      console.error("Invalid token:", userError);
      return new Response(
        JSON.stringify({ error: "Invalid token" }),
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const userEmail = user.email;
    const userId = user.id;
    
    if (!userEmail) {
      console.error("No email in user claims");
      return new Response(
        JSON.stringify({ error: "User email not found" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Check rate limit
    const { allowed, remaining } = await checkRateLimit(supabaseAdmin, userId, "send-welcome-email");
    if (!allowed) {
      console.log("send-welcome-email: Rate limit exceeded for user", userId);
      return new Response(
        JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
        { 
          status: 429, 
          headers: { 
            "Content-Type": "application/json", 
            ...corsHeaders,
            "X-RateLimit-Remaining": "0",
            "Retry-After": "86400"
          } 
        }
      );
    }

    // Parse and validate request body with Zod
    let validatedBody;
    try {
      const rawBody = await req.json();
      validatedBody = emailRequestSchema.parse(rawBody);
    } catch (zodError) {
      console.error("Validation error:", zodError);
      return new Response(
        JSON.stringify({ error: "Invalid request format" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const { role } = validatedBody;
    
    console.log(`Sending welcome email to user: ${userId} with role ${role}`);

    const { subject, html } = getEmailContent(userEmail, role);

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
        to: [userEmail],
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
      headers: { 
        "Content-Type": "application/json", 
        ...corsHeaders,
        "X-RateLimit-Remaining": String(remaining)
      },
    });
  } catch (error: unknown) {
    console.error("Error in send-welcome-email function:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);