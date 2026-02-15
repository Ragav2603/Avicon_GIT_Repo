import { describe, it } from "vitest";

describe("Console Log Benchmark", () => {
  it("measures performance impact of console.log", () => {
    const submission = {
      id: "uuid-1234",
      vendorName: "Acme Corp",
      vendorEmail: "contact@acme.com",
      pitchText: "We provide the best solution...",
      complianceStatus: "pass",
      aiScore: 95,
      submittedAt: new Date().toISOString(),
      proposalUrl: "https://example.com/proposal.pdf",
      dealBreakerFlags: [],
      weightedScores: {
        "cost": 10,
        "quality": 9
      }
    };

    const iterations = 10000;
    const start = performance.now();

    for (let i = 0; i < iterations; i++) {
      console.log("Viewing proposal:", submission);
    }

    const end = performance.now();
    const duration = end - start;
    console.error(`BENCHMARK_RESULT: ${iterations} iterations took ${duration.toFixed(2)}ms`);
    console.error(`Average time per call: ${(duration / iterations).toFixed(4)}ms`);
  });
});
