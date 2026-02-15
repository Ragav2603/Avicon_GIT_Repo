import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '../../integrations/supabase/types';

interface SubmissionBase {
  id: string;
  vendor_id: string;
  ai_score: number | null;
  [key: string]: unknown;
}

interface VendorProfile {
    company_name: string | null;
    email: string | null;
}

export async function fetchSubmissionsWithVendors(
  submissions: SubmissionBase[],
  supabase: SupabaseClient<Database>
) {
  if (!submissions || submissions.length === 0) {
    return [];
  }

  // 1. Collect all unique vendor IDs
  const vendorIds = Array.from(new Set(submissions.map((s) => s.vendor_id)));

  // 2. Fetch all profiles in one query
  const { data: profiles, error } = await supabase
    .from('profiles')
    .select('id, company_name, email')
    .in('id', vendorIds);

  if (error) {
    console.error('Error fetching vendor profiles:', error);
    throw error;
  }

  // 3. Create a map for quick lookup
  const profileMap = new Map<string, VendorProfile>();
  profiles?.forEach((p) => {
    profileMap.set(p.id, { company_name: p.company_name, email: p.email });
  });

  // 4. Map submissions to include vendor info
  return submissions.map((sub) => {
    const profile = profileMap.get(sub.vendor_id);

    // Generate dummy AI score if not present (random 0-100)
    // Note: This logic preserves the original behavior
    const aiScore = sub.ai_score ?? Math.floor(Math.random() * 101);

    return {
      ...sub,
      ai_score: aiScore,
      vendor_name: profile?.company_name || 'Unknown Vendor',
      vendor_email: profile?.email || null,
    };
  });
}
