// Types for RFPs feature

export interface Requirement {
  text: string;
  type: 'boolean' | 'text' | 'number';
  mandatory: boolean;
  weight: number;
}

export interface ProjectTemplate {
  id: string;
  name: string;
  description: string | null;
  category: string | null;
  icon_name: string | null;
  default_requirements: Requirement[];
  created_at: string;
}

export interface Project {
  id: string;
  title: string;
  status: 'draft' | 'open' | 'review' | 'closed';
  due_date: string | null;
  created_at: string;
  requirements: Requirement[];
  template_id: string | null;
  user_id: string;
}

// Submission types
export interface ProjectSubmission {
  id: string;
  project_id: string;
  vendor_id: string;
  pitch_text: string | null;
  file_paths: string[] | null;
  evaluation_status: string | null;
  ai_score: number | null;
  ai_verification_notes: Record<string, unknown> | null;
  created_at: string | null;
  updated_at: string | null;
}

// API Response types
export interface CreateProjectRequest {
  template_id: string | null;
  title: string;
  due_date?: string;
  requirements?: Requirement[];
}

export interface CreateProjectResponse {
  success: boolean;
  project: Project;
}
