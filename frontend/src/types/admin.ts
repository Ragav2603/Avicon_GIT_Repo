export type InviteCode = {
  id: string;
  code: string;
  role: 'airline' | 'vendor' | 'consultant';
  max_uses: number | null;
  current_uses: number;
  expires_at: string | null;
  is_active: boolean;
  created_at: string;
};

export type ApprovedDomain = {
  id: string;
  domain: string;
  role: 'airline' | 'vendor' | 'consultant';
  description: string | null;
  is_active: boolean;
  created_at: string;
};

export type SignupRequest = {
  id: string;
  email: string;
  company_name: string;
  requested_role: 'airline' | 'vendor' | 'consultant';
  status: 'pending' | 'approved' | 'rejected';
  admin_notes: string | null;
  created_at: string;
  reviewed_at: string | null;
};
