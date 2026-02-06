import { createClient } from "npm:@supabase/supabase-js@2";
import { z } from "npm:zod@3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// Request validation schema
const createProjectSchema = z.object({
  template_id: z.string().uuid().nullable(),
  title: z.string().min(1, "Title is required").max(200),
  due_date: z.string().datetime().optional().nullable(),
  requirements: z.array(z.object({
    text: z.string(),
    type: z.enum(['boolean', 'text', 'number']).default('boolean'),
    mandatory: z.boolean().default(false),
    weight: z.number().min(0).max(10).default(1),
  })).optional(),
});

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify authorization
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Missing authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create Supabase client with user's token
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: { Authorization: authHeader },
      },
    });

    // Get the authenticated user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Parse and validate request body
    const body = await req.json();
    const validationResult = createProjectSchema.safeParse(body);
    
    if (!validationResult.success) {
      return new Response(
        JSON.stringify({ 
          error: "Validation failed", 
          details: validationResult.error.errors 
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { template_id, title, due_date, requirements: customRequirements } = validationResult.data;

    // Determine requirements to use
    let projectRequirements = customRequirements || [];

    // If template_id is provided, fetch and merge template requirements
    if (template_id) {
      const { data: template, error: templateError } = await supabase
        .from("project_templates")
        .select("default_requirements")
        .eq("id", template_id)
        .single();

      if (templateError) {
        console.error("Template fetch error:", templateError);
        // Continue without template requirements if not found
      } else if (template?.default_requirements) {
        // Use template requirements if no custom ones provided
        if (!customRequirements || customRequirements.length === 0) {
          projectRequirements = template.default_requirements as typeof projectRequirements;
        }
      }
    }

    // Create the project
    const { data: project, error: projectError } = await supabase
      .from("projects")
      .insert({
        user_id: user.id,
        title,
        template_id,
        due_date: due_date || null,
        requirements: projectRequirements,
        status: "draft",
      })
      .select()
      .single();

    if (projectError) {
      console.error("Project creation error:", projectError);
      return new Response(
        JSON.stringify({ error: "Failed to create project", details: projectError.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Project created: ${project.id} by user ${user.id}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        project 
      }),
      { 
        status: 201, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );

  } catch (error) {
    console.error("Unexpected error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
