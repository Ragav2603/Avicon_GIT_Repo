/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi } from 'vitest';
import { fetchSubmissionsWithVendors } from '../lib/api/rfp';

// Mock Supabase client
const mockSingle = vi.fn();
const mockEq = vi.fn();
const mockSelect = vi.fn();
const mockFrom = vi.fn();
const mockIn = vi.fn(); // New mock for 'in'

const mockSupabase = {
  from: mockFrom,
};

// Update mocks to support both 'eq' and 'in'
mockFrom.mockReturnValue({
  select: mockSelect,
});
mockSelect.mockReturnValue({
  eq: mockEq,
  in: mockIn,
});
mockEq.mockReturnValue({
  single: mockSingle,
});

// The N+1 logic to test (replicated from RFPDetails.tsx)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function fetchSubmissionsWithVendorsNPlus1(subData: any[], supabase: any) {
  return await Promise.all(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (subData || []).map(async (sub: any) => {
      const { data: profile } = await supabase
        .from('profiles')
        .select('company_name, email')
        .eq('id', sub.vendor_id)
        .single();

      // Generate dummy AI score if not present (random 0-100)
      const aiScore = sub.ai_score ?? Math.floor(Math.random() * 101);

      return {
        ...sub,
        ai_score: aiScore,
        vendor_name: profile?.company_name || 'Unknown Vendor',
        vendor_email: profile?.email || null,
      };
    })
  );
}

describe('RFP Details N+1 Benchmark', () => {
  it('should make N calls for N submissions (N+1 pattern)', async () => {
    const submissions = Array.from({ length: 10 }, (_, i) => ({
      id: `sub-${i}`,
      vendor_id: `vendor-${i}`,
      ai_score: null,
    }));

    // Reset mocks
    mockFrom.mockClear();
    mockSelect.mockClear();
    mockEq.mockClear();
    mockSingle.mockClear();
    mockIn.mockClear();

    // Setup return value
    mockSingle.mockResolvedValue({
        data: { company_name: 'Test Corp', email: 'test@example.com' }
    });

    await fetchSubmissionsWithVendorsNPlus1(submissions, mockSupabase);

    // Assert that .from('profiles') was called for each submission
    expect(mockFrom).toHaveBeenCalledTimes(10);
    // Also verify it was called with 'profiles'
    expect(mockFrom).toHaveBeenCalledWith('profiles');
  });

  it('should make 1 call for N submissions (Optimized)', async () => {
    const submissions = Array.from({ length: 10 }, (_, i) => ({
      id: `sub-${i}`,
      vendor_id: `vendor-${i}`,
      ai_score: null,
    }));

    // Reset mocks
    mockFrom.mockClear();
    mockSelect.mockClear();
    mockEq.mockClear();
    mockSingle.mockClear();
    mockIn.mockClear();

    // Setup return value for optimized call
    // in() returns a Promise resolving to { data, error }
    mockIn.mockResolvedValue({
      data: submissions.map((s) => ({
        id: s.vendor_id,
        company_name: `Company for ${s.vendor_id}`,
        email: `email@${s.vendor_id}.com`,
      })),
      error: null,
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = await fetchSubmissionsWithVendors(submissions, mockSupabase as any);

    // Assert that .from('profiles') was called exactly once
    expect(mockFrom).toHaveBeenCalledTimes(1);
    expect(mockFrom).toHaveBeenCalledWith('profiles');

    // Assert that .in was called exactly once
    expect(mockIn).toHaveBeenCalledTimes(1);

    // Check if result has correct data
    expect(result).toHaveLength(10);
    expect(result[0].vendor_name).toBe('Company for vendor-0');
    expect(result[9].vendor_name).toBe('Company for vendor-9');
  });
});
