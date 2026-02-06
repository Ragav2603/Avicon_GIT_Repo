// Types for Request Projects feature

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
