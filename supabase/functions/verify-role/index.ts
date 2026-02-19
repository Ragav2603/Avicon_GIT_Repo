import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient, SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Input validation schema
const verifyRoleSchema = z.object({
  role: z.enum(["airline", "vendor", "consultant"]),
  inviteCode: z.string().max(50).regex(/^[A-Za-z0-9-]*$/).optional()
});

const ROLES_REQUIRING_VERIFICATION = ["airline", "consultant"];
const RATE_LIMIT_WINDOW_MS = 3600000; // 1 hour
const RATE_LIMIT_MAX_REQUESTS = 10;

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

serve(async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("verify-role: Processing request");

    // Get the authorization header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      console.log("verify-role: No authorization header");
      return new Response(
        JSON.stringify({ error: "Missing authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create Supabase client with service role for admin operations
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Create client with user's auth token for verification
    const supabaseUser = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        global: { headers: { Authorization: authHeader } },
        auth: { persistSession: false },
      }
    );

    // Verify the user
    const { data: { user }, error: userError } = await supabaseUser.auth.getUser();
    if (userError || !user) {
      console.log("verify-role: Invalid user token", userError?.message);
      return new Response(
        JSON.stringify({ error: "Invalid authentication token" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("verify-role: User authenticated", user.id);

    // Check rate limit
    const { allowed, remaining } = await checkRateLimit(supabaseAdmin, user.id, "verify-role");
    if (!allowed) {
      console.log("verify-role: Rate limit exceeded for user", user.id);
      return new Response(
        JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
        { 
          status: 429, 
          headers: { 
            ...corsHeaders, 
            "Content-Type": "application/json",
            "X-RateLimit-Remaining": "0",
            "Retry-After": "3600"
          } 
        }
      );
    }

    // Parse and validate request body with Zod
    let validatedBody;
    try {
      const rawBody = await req.json();
      validatedBody = verifyRoleSchema.parse(rawBody);
    } catch (zodError) {
      console.log("verify-role: Validation error", zodError);
      return new Response(
        JSON.stringify({ error: "Invalid request format" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { role, inviteCode } = validatedBody;
    console.log("verify-role: Validated input", { role, hasInviteCode: !!inviteCode });

    // Check if user already has a role (use limit(1) to avoid PGRST116 when multiple rows exist)
    const { data: existingRoles, error: roleCheckError } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .limit(1);

    if (roleCheckError) {
      console.error("verify-role: Error checking existing role", roleCheckError);
      return new Response(
        JSON.stringify({ error: "Failed to verify existing role" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const existingRole = existingRoles && existingRoles.length > 0 ? existingRoles[0] : null;

    if (existingRole) {
      console.log("verify-role: User already has role", existingRole.role);
      return new Response(
        JSON.stringify({ error: "User already has an assigned role", existingRole: existingRole.role }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // For roles requiring verification, check email domain first, then invite code
    if (ROLES_REQUIRING_VERIFICATION.includes(role)) {
      const userEmail = user.email || "";
      const emailDomain = userEmail.split("@")[1]?.toLowerCase();
      
      console.log("verify-role: Checking verification for role", role, "email domain:", emailDomain);

      // Check if email domain is approved for this role
      let domainApproved = false;
      if (emailDomain) {
        const { data: approvedDomain, error: domainError } = await supabaseAdmin
          .from("approved_domains")
          .select("*")
          .eq("domain", emailDomain)
          .eq("role", role)
          .eq("is_active", true)
          .maybeSingle();

        if (domainError) {
          console.error("verify-role: Error checking domain", domainError);
        } else if (approvedDomain) {
          domainApproved = true;
          console.log("verify-role: Email domain approved", emailDomain);
        }
      }

      // If domain not approved, require invite code
      if (!domainApproved) {
        if (!inviteCode || inviteCode.trim() === "") {
          console.log("verify-role: Missing invite code for role", role);
          return new Response(
            JSON.stringify({ 
              error: "Verification required",
              requiresInvite: true,
              message: `An invite code is required to register as ${role === 'airline' ? 'an Airline Manager' : 'a Consultant'}. Alternatively, use an email from an approved domain.`
            }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        // Validate the invite code using service role (bypasses RLS)
        const { data: inviteData, error: inviteError } = await supabaseAdmin
          .from("invite_codes")
          .select("*")
          .eq("code", inviteCode.trim().toUpperCase())
          .eq("role", role)
          .eq("is_active", true)
          .maybeSingle();

        if (inviteError) {
          console.error("verify-role: Error checking invite code", inviteError);
          return new Response(
            JSON.stringify({ error: "Failed to verify invite code" }),
            { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        if (!inviteData) {
          console.log("verify-role: Invalid invite code", inviteCode);
          return new Response(
            JSON.stringify({ 
              error: "Invalid invite code",
              message: "The invite code is invalid or not authorized for this role."
            }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        // Use atomic RPC function to redeem code (handles concurrency/race conditions)
        const { data: rpcData, error: rpcError } = await supabaseAdmin.rpc("redeem_invite_code", {
          invite_id: inviteData.id,
          user_id: user.id
        });

        if (rpcError) {
          console.error("verify-role: Error executing redemption RPC", rpcError);
          return new Response(
            JSON.stringify({ error: "Failed to verify invite code" }),
            { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        // Cast response as needed since rpc returns any or generic
        const result = rpcData as { success: boolean; error?: string };

        if (!result.success) {
          console.log("verify-role: Invite redemption failed", result.error);

          let errorMessage = "Invalid invite code";
          if (result.error === "Invite code expired") {
            errorMessage = "This invite code has expired.";
          } else if (result.error === "Invite code exhausted") {
            errorMessage = "This invite code has reached its maximum number of uses.";
          } else if (result.error === "Code already used by this user" || result.error === "Code already used") {
            errorMessage = "You have already used this invite code.";
          }

          return new Response(
            JSON.stringify({ 
              error: result.error,
              message: errorMessage
            }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        console.log("verify-role: Invite code validated and redeemed successfully", inviteCode);
      }
    }

    // Insert the role
    const { error: insertError } = await supabaseAdmin
      .from("user_roles")
      .insert({
        user_id: user.id,
        role: role,
      } as never);

    if (insertError) {
      console.error("verify-role: Error inserting role", insertError);
      return new Response(
        JSON.stringify({ error: "Failed to assign role" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("verify-role: Role assigned successfully", { userId: user.id, role });

    return new Response(
      JSON.stringify({ 
        success: true, 
        role,
        message: `Successfully registered as ${role}`
      }),
      { 
        status: 200, 
        headers: { 
          ...corsHeaders, 
          "Content-Type": "application/json",
          "X-RateLimit-Remaining": String(remaining)
        } 
      }
    );

  } catch (error) {
    console.error("verify-role: Unexpected error", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});