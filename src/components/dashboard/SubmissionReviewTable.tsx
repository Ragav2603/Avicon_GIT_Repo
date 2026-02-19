import { useState, useMemo } from "react";
import { motion } from "framer-motion";
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
      // Get session token
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        throw new Error("No active session");
      }

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

      // Refresh the submissions list
      onRefresh?.();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to verify submission. Please try again.";
      console.error("Verification error:", error);
      toast({
        title: "Verification Failed",
        description: message,
        variant: "destructive",
      });
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
        return sortDirection === "asc"
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      }

      // Handle null scores
      if (aVal === null && bVal !== null) return 1;
      if (aVal !== null && bVal === null) return -1;

      return 0;
    });
  }, [submissions, sortField, sortDirection]);

  const getComplianceBadge = (status: "pass" | "fail" | "partial" | "pending") => {
    switch (status) {
      case "pass":
        return (
          <Badge className="bg-green-100 text-green-700 hover:bg-green-100 gap-1">
            <CheckCircle className="w-3 h-3" />
            Pass
          </Badge>
        );
      case "fail":
        return (
          <Badge className="bg-red-100 text-red-700 hover:bg-red-100 gap-1">
            <XCircle className="w-3 h-3" />
            Fail
          </Badge>
        );
      case "partial":
        return (
          <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 gap-1">
            <AlertTriangle className="w-3 h-3" />
            Partial
          </Badge>
        );
      case "pending":
        return (
          <Badge className="bg-muted text-muted-foreground hover:bg-muted gap-1">
            <Clock className="w-3 h-3" />
            Pending
          </Badge>
        );
    }
  };

  const getScoreColor = (score: number | null) => {
    if (score === null) return "text-muted-foreground";
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-amber-600";
    return "text-red-600";
  };

  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-border flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h3 className="font-semibold text-foreground">Vendor Submissions</h3>
          <p className="text-sm text-muted-foreground">{submissions.length} proposals received</p>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead 
                className="cursor-pointer hover:text-foreground"
                onClick={() => handleSort("vendorName")}
              >
                <div className="flex items-center gap-1">
                  Vendor Name
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </TableHead>
              <TableHead>Compliance</TableHead>
              <TableHead 
                className="cursor-pointer hover:text-foreground"
                onClick={() => handleSort("aiScore")}
              >
                <div className="flex items-center gap-1">
                  AI Fit Score
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </TableHead>
              <TableHead 
                className="cursor-pointer hover:text-foreground"
                onClick={() => handleSort("submittedAt")}
              >
                <div className="flex items-center gap-1">
                  Submitted
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedSubmissions.map((submission, index) => {
              const isVerifying = verifyingId === submission.id;
              const hasScore = submission.aiScore !== null;
              
              return (
                <motion.tr
                  key={submission.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="group hover:bg-muted/30"
                >
                  <TableCell>
                    <div>
                      <p className="font-medium text-foreground">{submission.vendorName}</p>
                      <p className="text-xs text-muted-foreground">{submission.vendorEmail}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    {getComplianceBadge(submission.complianceStatus)}
                  </TableCell>
                  <TableCell>
                    {isVerifying ? (
                      <div className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin text-secondary" />
                        <span className="text-sm text-muted-foreground">Analyzing...</span>
                      </div>
                    ) : hasScore ? (
                      <div className="flex items-center gap-2">
                        <div className="w-12 h-2 bg-muted rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${
                              submission.aiScore! >= 80 ? "bg-green-500" :
                              submission.aiScore! >= 60 ? "bg-amber-500" : "bg-red-500"
                            }`}
                            style={{ width: `${submission.aiScore}%` }}
                          />
                        </div>
                        <span className={`font-semibold ${getScoreColor(submission.aiScore)}`}>
                          {submission.aiScore}
                        </span>
                      </div>
                    ) : (
                      <span className="text-sm text-muted-foreground">Not verified</span>
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(submission.submittedAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleVerifySubmission(submission.id)}
                        disabled={isVerifying}
                        className="gap-1"
                      >
                        {isVerifying ? (
                          <>
                            <Loader2 className="w-3 h-3 animate-spin" />
                            Verifying
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-3 h-3" />
                            {hasScore ? "Re-verify" : "Verify"}
                          </>
                        )}
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => onViewProposal(submission)}
                        className="gap-1"
                      >
                        <Eye className="w-4 h-4" />
                        View
                      </Button>
                    </div>
                  </TableCell>
                </motion.tr>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* Empty State */}
      {submissions.length === 0 && (
        <div className="p-12 text-center">
          <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
            <Eye className="w-6 h-6 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground">No submissions yet</p>
        </div>
      )}
    </div>
  );
};

export default SubmissionReviewTable;
