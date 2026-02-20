import { render, screen, fireEvent } from "@testing-library/react";
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
    // Actually default is aiScore desc.
    // 85 (Beta), 60 (Alpha), null (Gamma)

    const rows = screen.getAllByRole("row");
    // Row 0 is header. Rows 1, 2, 3 are data.
    expect(rows[1]).toHaveTextContent("Beta Corp");
    expect(rows[2]).toHaveTextContent("Alpha Inc");
    expect(rows[3]).toHaveTextContent("Gamma LLC");

    // Click Vendor Name header
    const vendorHeader = screen.getByText("Vendor");
    fireEvent.click(vendorHeader);

    // Should sort by Vendor Name (desc) because default direction set to desc when changing field?
    // Code says:
    // if (sortField === field) { toggle } else { setSortField(field); setSortDirection("desc"); }
    // So clicking Vendor Name first time -> Vendor Name DESC
    // Gamma, Beta, Alpha

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
});
