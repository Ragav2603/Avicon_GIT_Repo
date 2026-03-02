import { render, screen, fireEvent, within } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import SubmissionReviewTable, { Submission } from "../dashboard/SubmissionReviewTable.tsx";
import { BrowserRouter } from "react-router-dom";

// Mock TooltipProvider since it might be used by some shadcn components
import { TooltipProvider } from "@radix-ui/react-tooltip";

const MockWrapper = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>
    <TooltipProvider>{children}</TooltipProvider>
  </BrowserRouter>
);

const mockSubmissions: Submission[] = [
  {
    id: "1",
    vendorName: "Beta Corp",
    vendorEmail: "beta@example.com",
    complianceStatus: "pass",
    aiScore: 85,
    submittedAt: "2023-01-02T00:00:00.000Z",
  },
  {
    id: "2",
    vendorName: "Alpha Inc",
    vendorEmail: "alpha@example.com",
    complianceStatus: "fail",
    aiScore: 60,
    submittedAt: "2023-01-01T00:00:00.000Z",
  },
  {
    id: "3",
    vendorName: "Gamma LLC",
    vendorEmail: "gamma@example.com",
    complianceStatus: "pending",
    aiScore: null,
    submittedAt: "2023-01-03T00:00:00.000Z",
  },
];

describe("SubmissionReviewTable", () => {
  it("renders correctly with submissions", () => {
    render(
      <MockWrapper>
        <SubmissionReviewTable
          submissions={mockSubmissions}
          onViewProposal={() => {}}
        />
      </MockWrapper>
    );

    expect(screen.getByText("Beta Corp")).toBeInTheDocument();
    expect(screen.getByText("Alpha Inc")).toBeInTheDocument();
    expect(screen.getByText("Gamma LLC")).toBeInTheDocument();
  });

  it("sorts by Vendor Name when header is clicked", () => {
    render(
      <MockWrapper>
        <SubmissionReviewTable
          submissions={mockSubmissions}
          onViewProposal={() => {}}
        />
      </MockWrapper>
    );

    // Initial state: Sorted by AI Score (desc) -> Beta (85), Alpha (60), Gamma (null)
    const rows = screen.getAllByRole("row");
    expect(rows[1]).toHaveTextContent("Beta Corp");
    expect(rows[2]).toHaveTextContent("Alpha Inc");
    expect(rows[3]).toHaveTextContent("Gamma LLC");

    // Click Vendor Name header
    const vendorHeader = screen.getByText("Vendor");
    fireEvent.click(vendorHeader);

    // Sort by Vendor Name (desc) on first click
    const rowsAfterSort = screen.getAllByRole("row");
    expect(rowsAfterSort[1]).toHaveTextContent("Gamma LLC");
    expect(rowsAfterSort[2]).toHaveTextContent("Beta Corp");
    expect(rowsAfterSort[3]).toHaveTextContent("Alpha Inc");

    // Click again -> Ascending
    fireEvent.click(vendorHeader);
    const rowsAfterSortAsc = screen.getAllByRole("row");
    expect(rowsAfterSortAsc[1]).toHaveTextContent("Alpha Inc");
    expect(rowsAfterSortAsc[2]).toHaveTextContent("Beta Corp");
    expect(rowsAfterSortAsc[3]).toHaveTextContent("Gamma LLC");
  });

  it("headers are accessible sort buttons", () => {
    render(
      <MockWrapper>
        <SubmissionReviewTable
          submissions={mockSubmissions}
          onViewProposal={() => {}}
        />
      </MockWrapper>
    );

    // Headers should contain a button
    const vendorHeader = screen.getByRole("columnheader", { name: /Vendor/i });
    const vendorButton = within(vendorHeader).getByRole("button");
    expect(vendorButton).toBeInTheDocument();

    const scoreHeader = screen.getByRole("columnheader", { name: /AI Score/i });
    const scoreButton = within(scoreHeader).getByRole("button");
    expect(scoreButton).toBeInTheDocument();

    const submittedHeader = screen.getByRole("columnheader", { name: /Submitted/i });
    const submittedButton = within(submittedHeader).getByRole("button");
    expect(submittedButton).toBeInTheDocument();

    // Check aria-sort on columnheader
    // Initial state: AI Score descending
    expect(scoreHeader).toHaveAttribute("aria-sort", "descending");
    expect(vendorHeader).toHaveAttribute("aria-sort", "none");

    // Click vendor button
    fireEvent.click(vendorButton);
    expect(vendorHeader).toHaveAttribute("aria-sort", "descending");

    // Click vendor button again
    fireEvent.click(vendorButton);
    expect(vendorHeader).toHaveAttribute("aria-sort", "ascending");
  });
});
