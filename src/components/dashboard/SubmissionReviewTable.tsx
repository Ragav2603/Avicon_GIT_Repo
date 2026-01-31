import { useState } from "react";
import { motion } from "framer-motion";
import { 
  Sparkles, 
  Loader2, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Eye,
  ExternalLink,
  ArrowUpDown
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";

interface Submission {
  id: string;
  vendorName: string;
  vendorEmail: string;
  price: number;
  complianceStatus: "pass" | "fail" | "partial";
  aiScore: number;
  submittedAt: string;
  proposalUrl?: string;
}

interface SubmissionReviewTableProps {
  submissions: Submission[];
  onViewProposal: (submission: Submission) => void;
}

// Mock data for demo
const mockSubmissions: Submission[] = [
  {
    id: "1",
    vendorName: "TechCorp Solutions",
    vendorEmail: "sales@techcorp.io",
    price: 450000,
    complianceStatus: "pass",
    aiScore: 92,
    submittedAt: "2024-01-28",
  },
  {
    id: "2",
    vendorName: "CloudNine Systems",
    vendorEmail: "proposals@cloudnine.com",
    price: 380000,
    complianceStatus: "pass",
    aiScore: 87,
    submittedAt: "2024-01-27",
  },
  {
    id: "3",
    vendorName: "DataStream Inc",
    vendorEmail: "bids@datastream.io",
    price: 520000,
    complianceStatus: "partial",
    aiScore: 74,
    submittedAt: "2024-01-26",
  },
  {
    id: "4",
    vendorName: "SkyTech Partners",
    vendorEmail: "rfp@skytech.co",
    price: 290000,
    complianceStatus: "fail",
    aiScore: 45,
    submittedAt: "2024-01-25",
  },
  {
    id: "5",
    vendorName: "AeroDigital Corp",
    vendorEmail: "enterprise@aerodigital.com",
    price: 410000,
    complianceStatus: "pass",
    aiScore: 89,
    submittedAt: "2024-01-24",
  },
];

const SubmissionReviewTable = ({ 
  submissions = mockSubmissions, 
  onViewProposal 
}: SubmissionReviewTableProps) => {
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationComplete, setVerificationComplete] = useState(false);
  const [sortField, setSortField] = useState<keyof Submission>("aiScore");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const { toast } = useToast();

  const handleRunVerification = async () => {
    setIsVerifying(true);
    setVerificationComplete(false);

    // Simulate AI verification process
    await new Promise(resolve => setTimeout(resolve, 2500));

    setIsVerifying(false);
    setVerificationComplete(true);

    toast({
      title: "AI Verification Complete",
      description: "All submissions have been re-scored against RFP requirements.",
    });

    // Reset complete status after a delay
    setTimeout(() => setVerificationComplete(false), 3000);
  };

  const handleSort = (field: keyof Submission) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  const sortedSubmissions = [...submissions].sort((a, b) => {
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
    
    return 0;
  });

  const getComplianceBadge = (status: "pass" | "fail" | "partial") => {
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
    }
  };

  const getScoreColor = (score: number) => {
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
        
        <Button 
          onClick={handleRunVerification}
          disabled={isVerifying}
          className="gap-2"
        >
          {isVerifying ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Verifying...
            </>
          ) : verificationComplete ? (
            <>
              <CheckCircle className="w-4 h-4" />
              Verified!
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              Run AI Verification
            </>
          )}
        </Button>
      </div>

      {/* Verification Progress */}
      {isVerifying && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="px-4 py-3 bg-secondary/5 border-b border-border"
        >
          <div className="flex items-center gap-3">
            <Loader2 className="w-4 h-4 text-secondary animate-spin" />
            <div className="flex-1">
              <p className="text-sm font-medium text-secondary">Running AI Verification</p>
              <p className="text-xs text-muted-foreground">Analyzing proposals against RFP requirements...</p>
            </div>
            <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-secondary"
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ duration: 2.5 }}
              />
            </div>
          </div>
        </motion.div>
      )}

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
              <TableHead 
                className="cursor-pointer hover:text-foreground"
                onClick={() => handleSort("price")}
              >
                <div className="flex items-center gap-1">
                  Price
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
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedSubmissions.map((submission, index) => (
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
                <TableCell className="font-medium">
                  ${submission.price.toLocaleString()}
                </TableCell>
                <TableCell>
                  {getComplianceBadge(submission.complianceStatus)}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div className="w-12 h-2 bg-muted rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${
                          submission.aiScore >= 80 ? "bg-green-500" :
                          submission.aiScore >= 60 ? "bg-amber-500" : "bg-red-500"
                        }`}
                        style={{ width: `${submission.aiScore}%` }}
                      />
                    </div>
                    <span className={`font-semibold ${getScoreColor(submission.aiScore)}`}>
                      {submission.aiScore}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {new Date(submission.submittedAt).toLocaleDateString()}
                </TableCell>
                <TableCell className="text-right">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => onViewProposal(submission)}
                    className="gap-1"
                  >
                    <Eye className="w-4 h-4" />
                    View
                  </Button>
                </TableCell>
              </motion.tr>
            ))}
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
