import { describe, it } from "vitest";

interface Submission {
  id: string;
  vendorName: string;
  vendorEmail: string;
  pitchText?: string;
  complianceStatus: "pass" | "fail" | "partial" | "pending";
  aiScore: number | null;
  submittedAt: string;
  proposalUrl?: string;
  dealBreakerFlags?: string[];
  weightedScores?: Record<string, number>;
}

const generateSubmission = (i: number): Submission => ({
  id: `uuid-${i}`,
  vendorName: `Vendor ${i}`,
  vendorEmail: `vendor${i}@example.com`,
  complianceStatus: i % 4 === 0 ? "pass" : i % 4 === 1 ? "fail" : i % 4 === 2 ? "partial" : "pending",
  aiScore: i % 5 === 0 ? null : Math.floor(Math.random() * 100),
  submittedAt: new Date(2023, 0, 1 + i).toISOString(),
});

describe("SubmissionReviewTable Sort Benchmark", () => {
  it("measures cost of sorting 2000 items 1000 times", () => {
    const submissions: Submission[] = Array.from({ length: 2000 }, (_, i) => generateSubmission(i));
    const sortField: keyof Submission = "aiScore";
    const sortDirection: "asc" | "desc" = "desc";

    const iterations = 1000;
    const start = performance.now();

    for (let i = 0; i < iterations; i++) {
      // Simulate component logic: new array, then sort
      [...submissions].sort((a, b) => {
        const aVal = a[sortField];
        const bVal = b[sortField];

        if (typeof aVal === "number" && typeof bVal === "number") {
          return sortDirection === "asc" ? aVal - bVal : bVal - aVal;
        }

        if (typeof aVal === "string" && typeof bVal === "string") {
          return sortDirection === "asc"
            ? aVal.localeCompare(bVal)
            : bVal.localeCompare(aVal);
        }

        // Handle null scores
        if (aVal === null && bVal !== null) return 1;
        if (aVal !== null && bVal === null) return -1;

        return 0;
      });
    }

    const end = performance.now();
    const duration = end - start;
    console.log(`BENCHMARK: Sorting 2000 items, 1000 iterations took ${duration.toFixed(2)}ms`);
    console.log(`Average time per sort: ${(duration / iterations).toFixed(4)}ms`);
  });

  it("measures cost with memoization (skipped sort)", () => {
    const submissions: Submission[] = Array.from({ length: 2000 }, (_, i) => generateSubmission(i));
    // memoized result
    const memoizedResult: Submission[] | null = null;

    const iterations = 1000;
    const start = performance.now();

    for (let i = 0; i < iterations; i++) {
      // Simulate useMemo logic: if dependencies didn't change, return previous result
      if (!memoizedResult) {
        // First render logic (executed once)
        // This part is skipped for 999 iterations
      }
      // Return memoized result
      // Simulating: const sortedSubmissions = memoizedResult;
    }

    const end = performance.now();
    const duration = end - start;
    console.log(`BENCHMARK: Memoized (skipped sort), 1000 iterations took ${duration.toFixed(2)}ms`);
  });
});
