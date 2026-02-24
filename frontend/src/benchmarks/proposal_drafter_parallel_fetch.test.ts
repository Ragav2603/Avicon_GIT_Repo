import { describe, it, expect } from "vitest";

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function generateDraft() {
  await sleep(100);
  return { pitch_summary: "Summary", proposed_solution: "Solution" };
}

async function analyzeProposal() {
  await sleep(150);
  return { data: { complianceScore: 80, gapAnalysis: [] }, error: null };
}

describe("ProposalDrafter Parallel Fetch Benchmark", () => {
  it("measures serial execution time", async () => {
    const start = performance.now();

    // Serial execution
    const draftData = await generateDraft();
    const analysisResult = await analyzeProposal();

    const end = performance.now();
    const duration = end - start;

    console.log(`Serial execution took: ${duration.toFixed(2)}ms`);
    expect(duration).toBeGreaterThanOrEqual(250); // 100 + 150
  });

  it("measures parallel execution time", async () => {
    const start = performance.now();

    // Parallel execution
    const draftPromise = generateDraft();
    const analysisPromise = analyzeProposal();

    const [draftData, analysisResult] = await Promise.all([draftPromise, analysisPromise]);

    const end = performance.now();
    const duration = end - start;

    console.log(`Parallel execution took: ${duration.toFixed(2)}ms`);
    expect(duration).toBeLessThan(250);
    expect(duration).toBeGreaterThanOrEqual(150); // max(100, 150)
  });
});
