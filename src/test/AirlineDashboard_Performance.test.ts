/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi } from 'vitest';

// Simulate network delay
const NETWORK_LATENCY_MS = 50;
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Mock Data
const mockProjects = Array.from({ length: 5 }, (_, i) => ({
  id: `rfp-${i}`,
  title: `Project ${i}`,
  created_at: new Date().toISOString(),
  airline_id: 'user-123'
}));

// Mock Supabase Client Factory
const createMockSupabase = () => {
  return {
    from: (table: string) => {
      const queryState = {
        table,
        select: '',
        eqs: [] as { field: string; value: any }[],
        order: null as any,
        limit: null as number,
        isCount: false
      };

      const builder = {
        select: (columns: string, options?: { count?: string, head?: boolean }) => {
          queryState.select = columns;
          if (options?.count) queryState.isCount = true;
          return builder;
        },
        eq: (field: string, value: any) => {
          queryState.eqs.push({ field, value });
          return builder;
        },
        order: (field: string, options?: any) => {
          queryState.order = { field, options };
          return builder;
        },
        limit: (n: number) => {
          queryState.limit = n;
          return builder;
        },
        // Execute the query
        then: async (resolve: (value: any) => void, reject: (reason: any) => void) => {
          await delay(NETWORK_LATENCY_MS);

          if (queryState.table === 'rfps') {
            if (queryState.select === '*, submissions(count)') {
               // Optimized query
               const data = mockProjects.map(p => ({
                 ...p,
                 submissions: [{ count: 3 }] // Mock count
               }));
               resolve({ data, error: null });
            } else {
               // Standard query
               resolve({ data: mockProjects, error: null });
            }
          } else if (queryState.table === 'submissions') {
             // Count query
             resolve({ count: 3, data: [], error: null });
          } else {
             resolve({ data: [], error: null });
          }
        }
      };
      return builder;
    }
  };
};

describe('AirlineDashboard Performance Benchmark', () => {
  it('compares N+1 query vs Optimized query performance', async () => {
    const supabase = createMockSupabase();
    const user = { id: 'user-123' };

    // --- Baseline: N+1 Query ---
    const startBaseline = performance.now();

    // 1. Fetch Projects
    const { data: projectData } = await supabase
      .from("rfps")
      .select("*")
      .eq("airline_id", user.id)
      .order("created_at", { ascending: false })
      .limit(5);

    // 2. Fetch counts for each project
    const projectsWithCountsBaseline = await Promise.all(
      (projectData || []).map(async (project: any) => {
        const { count } = await supabase
          .from("submissions")
          .select("*", { count: "exact", head: true })
          .eq("rfp_id", project.id);
        return { ...project, submission_count: count || 0 };
      })
    );

    const endBaseline = performance.now();
    const durationBaseline = endBaseline - startBaseline;

    console.log(`Baseline (N+1) Duration: ${durationBaseline.toFixed(2)}ms`);


    // --- Optimized: Single Query ---
    const startOptimized = performance.now();

    // 1. Fetch Projects with embedded submission count
    const { data: projectDataOptimized } = await supabase
        .from("rfps")
        .select("*, submissions(count)")
        .eq("airline_id", user.id)
        .order("created_at", { ascending: false })
        .limit(5);

    // Transform data to match structure if necessary
    const projectsWithCountsOptimized = (projectDataOptimized || []).map((project: any) => ({
        ...project,
        submission_count: project.submissions?.[0]?.count || 0
    }));

    const endOptimized = performance.now();
    const durationOptimized = endOptimized - startOptimized;

    console.log(`Optimized Duration: ${durationOptimized.toFixed(2)}ms`);

    // --- Assertions ---
    expect(projectsWithCountsBaseline).toHaveLength(5);
    expect(projectsWithCountsOptimized).toHaveLength(5);
    expect(projectsWithCountsBaseline[0].submission_count).toBe(3);
    expect(projectsWithCountsOptimized[0].submission_count).toBe(3);

    // Optimized should be significantly faster because N+1 does:
    // 1. Fetch RFPs (50ms)
    // 2. Fetch counts in parallel (50ms) -> Total 100ms + overhead
    // Optimized does:
    // 1. Fetch RFPs+counts (50ms) -> Total 50ms + overhead

    // Note: JS execution overhead is negligible compared to 50ms network delay.
    // However, we want to ensure it is at least faster.
    expect(durationOptimized).toBeLessThan(durationBaseline);
  });
});
