import { useEffect, useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  ArrowLeft, 
  FileText, 
  Calendar, 
  DollarSign, 
  Users,
  Clock,
  Loader2,
  Settings
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import SubmissionReviewTable, { Submission } from "@/components/dashboard/SubmissionReviewTable";

interface RFP {
  id: string;
  title: string;
  description: string | null;
  budget_max: number | null;
  status: string | null;
  created_at: string;
  deadline: string | null;
  project_context: string | null;
  evaluation_criteria: string | null;
}

const RFPDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const { user, role, loading } = useAuth();
  const navigate = useNavigate();
  const [rfp, setRfp] = useState<RFP | null>(null);
  const [loadingRfp, setLoadingRfp] = useState(true);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loadingSubmissions, setLoadingSubmissions] = useState(true);

  useEffect(() => {
    if (!loading) {
      if (!user) {
        navigate("/auth");
      } else if (!role) {
        navigate("/onboarding");
      } else if (role !== "airline") {
        navigate(`/${role}-dashboard`);
      }
    }
  }, [user, role, loading, navigate]);

  const fetchSubmissions = useCallback(async () => {
    if (!id) return;
    
    setLoadingSubmissions(true);
    try {
      const { data, error } = await supabase
        .from("submissions")
        .select(`
          id,
          pitch_text,
          ai_score,
          response_status,
          created_at,
          vendor_id,
          profiles:vendor_id (
            email,
            company_name
          )
        `)
        .eq("rfp_id", id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Transform to Submission interface
      const transformedSubmissions: Submission[] = (data || []).map((sub: any) => ({
        id: sub.id,
        vendorName: sub.profiles?.company_name || "Unknown Vendor",
        vendorEmail: sub.profiles?.email || "",
        pitchText: sub.pitch_text || "",
        complianceStatus: (sub.response_status as "pass" | "fail" | "partial") || "pending",
        aiScore: sub.ai_score,
        submittedAt: sub.created_at,
      }));

      setSubmissions(transformedSubmissions);
    } catch (error) {
      console.error("Error fetching submissions:", error);
    } finally {
      setLoadingSubmissions(false);
    }
  }, [id]);

  useEffect(() => {
    const fetchRfp = async () => {
      if (!id) return;
      
      setLoadingRfp(true);
      try {
        const { data, error } = await supabase
          .from("rfps")
          .select("*")
          .eq("id", id)
          .single();

        if (error) throw error;
        setRfp(data);
      } catch (error) {
        console.error("Error fetching RFP:", error);
      } finally {
        setLoadingRfp(false);
      }
    };

    if (user && role === "airline") {
      fetchRfp();
      fetchSubmissions();
    }
  }, [id, user, role, fetchSubmissions]);

  const handleViewProposal = (submission: Submission) => {
    // In real implementation, open proposal detail modal or navigate
    console.log("Viewing proposal:", submission);
  };

  if (loading || role !== "airline") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-secondary" />
      </div>
    );
  }

  if (loadingRfp) {
    return (
      <DashboardLayout title="RFP Details" subtitle="Loading...">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-secondary" />
        </div>
      </DashboardLayout>
    );
  }

  if (!rfp) {
    return (
      <DashboardLayout title="RFP Not Found" subtitle="">
        <div className="text-center py-12">
          <p className="text-muted-foreground">RFP not found</p>
          <Button onClick={() => navigate("/airline-dashboard/rfps")} className="mt-4">
            Back to My RFPs
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title={rfp.title} subtitle="RFP Details & Submissions">
      {/* Back Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => navigate("/airline-dashboard/rfps")}
        className="mb-6"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to My RFPs
      </Button>

      {/* RFP Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card rounded-xl border border-border p-6 mb-6"
      >
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <Badge variant={rfp.status === "open" ? "default" : "secondary"} className="text-sm">
                {rfp.status || "open"}
              </Badge>
            </div>
            <p className="text-muted-foreground mb-4 max-w-2xl">
              {rfp.description}
            </p>
            
            <div className="flex flex-wrap items-center gap-6 text-sm">
              {rfp.budget_max && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <DollarSign className="w-4 h-4" />
                  <span>Budget: <span className="text-foreground font-medium">${rfp.budget_max.toLocaleString()}</span></span>
                </div>
              )}
              {rfp.deadline && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  <span>Deadline: {new Date(rfp.deadline).toLocaleDateString()}</span>
                </div>
              )}
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="w-4 h-4" />
                <span>Created: {new Date(rfp.created_at).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
          
          <Button variant="outline" size="sm">
            <Settings className="w-4 h-4 mr-2" />
            Edit RFP
          </Button>
        </div>
      </motion.div>

      {/* Tabs */}
      <Tabs defaultValue="submissions" className="space-y-6">
        <TabsList>
          <TabsTrigger value="submissions" className="gap-2">
            <Users className="w-4 h-4" />
            Submissions
          </TabsTrigger>
          <TabsTrigger value="details" className="gap-2">
            <FileText className="w-4 h-4" />
            RFP Details
          </TabsTrigger>
        </TabsList>

        <TabsContent value="submissions">
          {loadingSubmissions ? (
            <div className="flex items-center justify-center py-12 bg-card rounded-xl border border-border">
              <Loader2 className="h-6 w-6 animate-spin text-secondary" />
            </div>
          ) : (
            <SubmissionReviewTable 
              submissions={submissions}
              onViewProposal={handleViewProposal}
              onRefresh={fetchSubmissions}
            />
          )}
        </TabsContent>

        <TabsContent value="details">
          <div className="bg-card rounded-xl border border-border p-6 space-y-6">
            {rfp.project_context && (
              <div>
                <h3 className="font-semibold text-foreground mb-2">Project Context</h3>
                <p className="text-muted-foreground whitespace-pre-wrap">{rfp.project_context}</p>
              </div>
            )}
            {rfp.evaluation_criteria && (
              <div>
                <h3 className="font-semibold text-foreground mb-2">Evaluation Criteria</h3>
                <p className="text-muted-foreground whitespace-pre-wrap">{rfp.evaluation_criteria}</p>
              </div>
            )}
            {!rfp.project_context && !rfp.evaluation_criteria && (
              <p className="text-muted-foreground text-center py-8">
                No additional details available for this RFP.
              </p>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
};

export default RFPDetailPage;
