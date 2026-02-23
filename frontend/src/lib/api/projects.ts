import { supabase } from '@/integrations/supabase/client';
import type { ProjectTemplate, Project, Requirement, ProjectSubmission } from '@/types/projects';
import type { Json } from '@/integrations/supabase/types';

/**
 * Safely parse requirements from Json type
 */
function parseRequirements(json: Json | null): Requirement[] {
  if (!json || !Array.isArray(json)) return [];
  return json as unknown as Requirement[];
}

/**
 * Fetch all project templates
 * Used to populate the "Start New Project" modal
 */
export async function getProjectTemplates(): Promise<ProjectTemplate[]> {
  const { data, error } = await supabase
    .from('project_templates')
    .select('*')
    .order('name')
    .limit(100);

  if (error) throw error;
  
  // Transform default_requirements from Json to typed array
  return (data || []).map(template => ({
    ...template,
    default_requirements: parseRequirements(template.default_requirements),
  }));
}

/**
 * Create a new project using an edge function
 * Duplicates template requirements to the new project
 */
export async function createProject(
  title: string,
  templateId: string | null,
  dueDate?: Date,
  customRequirements?: Requirement[]
): Promise<Project> {
  const { data, error } = await supabase.functions.invoke('create-project', {
    body: {
      template_id: templateId,
      title: title,
      due_date: dueDate?.toISOString(),
      requirements: customRequirements,
    },
  });

  if (error) throw error;
  return data.project as Project;
}

/**
 * Fetch all projects for the current user
 * Used for the main Dashboard view
 */
export async function getUserProjects(): Promise<Project[]> {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  
  // Transform requirements from Json to typed array
  return (data || []).map(project => ({
    ...project,
    status: project.status as Project['status'],
    requirements: parseRequirements(project.requirements),
  }));
}

/**
 * Fetch a single project by ID
 */
export async function getProjectById(id: string): Promise<Project | null> {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null; // Not found
    throw error;
  }
  
  return {
    ...data,
    status: data.status as Project['status'],
    requirements: parseRequirements(data.requirements),
  };
}

/**
 * Update a project's status
 */
export async function updateProjectStatus(
  id: string,
  status: Project['status']
): Promise<void> {
  const { error } = await supabase
    .from('projects')
    .update({ status })
    .eq('id', id);

  if (error) throw error;
}

/**
 * Update project details
 */
export async function updateProject(
  id: string,
  updates: Partial<Pick<Project, 'title' | 'due_date' | 'requirements' | 'status'>>
): Promise<Project> {
  const dbUpdates: Record<string, unknown> = { ...updates };
  if (updates.requirements) {
    dbUpdates.requirements = updates.requirements as unknown as Json;
  }
  
  const { data, error } = await supabase
    .from('projects')
    .update(dbUpdates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  
  return {
    ...data,
    status: data.status as Project['status'],
    requirements: parseRequirements(data.requirements),
  };
}

/**
 * Submit a proposal for a project (vendor)
 */
export async function submitProposal(
  projectId: string,
  file: File,
  pitchText: string
): Promise<ProjectSubmission> {
  // 1. Upload file
  const filePath = `proposals/${crypto.randomUUID()}-${file.name}`;
  const { error: uploadError } = await supabase.storage
    .from('proposals')
    .upload(filePath, file);

  if (uploadError) throw uploadError;

  // 2. Create submission record
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('project_submissions')
    .insert({
      project_id: projectId,
      vendor_id: user.id,
      pitch_text: pitchText,
      file_paths: [filePath],
      evaluation_status: 'pending',
    })
    .select()
    .single();

  if (error) throw error;
  return data as unknown as ProjectSubmission;
}

/**
 * Trigger AI verification for a submission
 */
export async function triggerVerification(submissionId: string) {
  const { data, error } = await supabase.functions.invoke('verify-submission', {
    body: { submission_id: submissionId },
  });

  if (error) throw error;
  return data;
}

/**
 * Fetch submissions for a project
 */
export async function getProjectSubmissions(projectId: string): Promise<ProjectSubmission[]> {
  const { data, error } = await supabase
    .from('project_submissions')
    .select('*')
    .eq('project_id', projectId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data || []) as unknown as ProjectSubmission[];
}
