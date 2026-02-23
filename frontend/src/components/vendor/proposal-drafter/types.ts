export interface RFP {
  id: string;
  title: string;
  description: string | null;
  budget_max: number | null;
  deadline: string | null;
}

export interface Requirement {
  id: string;
  requirement_text: string;
  is_mandatory: boolean | null;
  weight: number | null;
}

export type Step = 'upload' | 'analyzing' | 'editor';

export interface GapAnalysisItem {
  requirementId: string;
  status: 'met' | 'partial' | 'missing';
  finding: string;
  recommendation: string;
}

export interface AIAnalysisResult {
  complianceScore: number;
  gapAnalysis: GapAnalysisItem[];
  draftProposal: string;
  dealBreakers: string[];
  strengths: string[];
}
