import { useState, useMemo } from "react";
import { 
  Sparkles, 
  Loader2, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Eye,
  ArrowUpDown,
  Clock
} from "lucide-react";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { useToast } from "../../hooks/use-toast";
import { supabase } from "../../integrations/supabase/client";

export interface Submission {
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

interface SubmissionReviewTableProps {
  submissions: Submission[];
  onViewProposal: (submission: Submission) => void;
  onRefresh?: () => void;
}

const SubmissionReviewTable = ({ 
  submissions, 
  onViewProposal,
  onRefresh 
}: SubmissionReviewTableProps) => {
  const [verifyingId, setVerifyingId] = useState<string | null>(null);
  const [sortField, setSortField] = useState<keyof Submission>("aiScore");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const { toast } = useToast();

  const handleVerifySubmission = async (submissionId: string) => {
    setVerifyingId(submissionId);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) throw new Error("No active session");

      const response = await fetch(
        "https://aavlayzfaafuwquhhbcx.supabase.co/functions/v1/verify-submission",
        {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${session.access_token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ submission_id: submissionId }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Verification failed (${response.status})`);
      }

      const result = await response.json();
      toast({
        title: "AI Verification Complete",
        description: `Score: ${result.ai_score}% - ${result.compliance_status?.toUpperCase()}`,
      });
      onRefresh?.();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to verify submission.";
      console.error("Verification error:", error);
      toast({ title: "Verification Failed", description: message, variant: "destructive" });
    } finally {
      setVerifyingId(null);
    }
  };

  const handleSort = (field: keyof Submission) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  const sortedSubmissions = useMemo(() => {
    return [...submissions].sort((a, b) => {
      const aVal = a[sortField];
      const bVal = b[sortField];
      if (typeof aVal === "number" && typeof bVal === "number") {
        return sortDirection === "asc" ? aVal - bVal : bVal - aVal;
      }
      if (typeof aVal === "string" && typeof bVal === "string") {
        return sortDirection === "asc" ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }
      if (aVal === null && bVal !== null) return 1;
      if (aVal !== null && bVal === null) return -1;
      return 0;
    });
  }, [submissions, sortField, sortDirection]);

  const getComplianceBadge = (status: "pass" | "fail" | "partial" | "pending") => {
    switch (status) {
      case "pass":
        return <Badge className="bg-green-100 text-green-700 hover:bg-green-100 gap-1"><CheckCircle className="w-3 h-3" />Pass</Badge>;
      case "fail":
        return <Badge className="bg-red-100 text-red-700 hover:bg-red-100 gap-1"><XCircle className="w-3 h-3" />Fail</Badge>;
      case "partial":
        return <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 gap-1"><AlertTriangle className="w-3 h-3" />Partial</Badge>;
      case "pending":
        return <Badge className="bg-muted text-muted-foreground hover:bg-muted gap-1"><Clock className="w-3 h-3" />Pending</Badge>;
    }
  };

  const getScoreColor = (score: number | null) => {
    if (score === null) return "text-muted-foreground";
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-amber-600";
    return "text-red-600";
  };

  return (
    <div className="bg-card rounded-md border border-border overflow-hidden">
      {/* Header */}
      <div className="px-6 py-3 border-b border-border flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Vendor Submissions</h3>
          <p className="text-xs text-muted-foreground">{submissions.length} proposals received</p>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50 hover:bg-muted/50">
              <TableHead 
                className="text-[11px] uppercase font-semibold text-muted-foreground tracking-wide cursor-pointer hover:text-foreground"
                onClick={() => handleSort("vendorName")}
              >
                <div className="flex items-center gap-1">
                  Vendor
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </TableHead>
              <TableHead className="text-[11px] uppercase font-semibold text-muted-foreground tracking-wide">
                Compliance
              </TableHead>
              <TableHead 
                className="text-[11px] uppercase font-semibold text-muted-foreground tracking-wide cursor-pointer hover:text-foreground text-right"
                onClick={() => handleSort("aiScore")}
              >
                <div className="flex items-center justify-end gap-1">
                  AI Score
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </TableHead>
              <TableHead 
                className="text-[11px] uppercase font-semibold text-muted-foreground tracking-wide cursor-pointer hover:text-foreground"
                onClick={() => handleSort("submittedAt")}
              >
                <div className="flex items-center gap-1">
                  Submitted
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </TableHead>
              <TableHead className="text-[11px] uppercase font-semibold text-muted-foreground tracking-wide text-right">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedSubmissions.map((submission) => {
              const isVerifying = verifyingId === submission.id;
              const hasScore = submission.aiScore !== null;
              
              return (
                <TableRow
                  key={submission.id}
                  className="hover:bg-muted/30"
                >
                  <TableCell>
                    <div>
                      <p className="text-sm font-medium text-foreground">{submission.vendorName}</p>
                      <p className="text-xs text-muted-foreground">{submission.vendorEmail}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    {getComplianceBadge(submission.complianceStatus)}
                  </TableCell>
                  <TableCell className="text-right">
                    {isVerifying ? (
                      <div className="flex items-center justify-end gap-2">
                        <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">Analyzing...</span>
                      </div>
                    ) : hasScore ? (
                      <span className={`font-mono font-semibold ${getScoreColor(submission.aiScore)}`}>
                        {submission.aiScore}
                      </span>
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <span className="text-sm font-mono text-muted-foreground">
                      {new Date(submission.submittedAt).toLocaleDateString()}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleVerifySubmission(submission.id)}
                        disabled={isVerifying}
                        className="gap-1 text-xs"
                      >
                        {isVerifying ? (
                          <><Loader2 className="w-3 h-3 animate-spin" />Verifying</>
                        ) : (
                          <><Sparkles className="w-3 h-3" />{hasScore ? "Re-verify" : "Verify"}</>
                        )}
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => onViewProposal(submission)}
                        className="gap-1 text-xs"
                      >
                        <Eye className="w-3 h-3" />
                        View
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* Empty State */}
      {submissions.length === 0 && (
        <div className="p-12 text-center">
          <Eye className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">No submissions yet</p>
        </div>
      )}
    </div>
  );
};

export default SubmissionReviewTable;
