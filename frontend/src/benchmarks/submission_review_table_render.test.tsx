import { describe, it, expect } from "vitest";
import SubmissionReviewTable from "../components/dashboard/SubmissionReviewTable";

describe("SubmissionReviewTable Optimization", () => {
  it("should be wrapped in React.memo", () => {
    // Check if the component is a Memo component
    // In React, memo components have $$typeof as Symbol.for('react.memo')
    const REACT_MEMO_TYPE = Symbol.for('react.memo');
    // @ts-expect-error - Internal React property
    expect(SubmissionReviewTable.$$typeof).toBe(REACT_MEMO_TYPE);
  });
});
