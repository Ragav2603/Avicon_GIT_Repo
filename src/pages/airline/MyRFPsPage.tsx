import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Plus, FileText, Clock, Users, Calendar, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import SmartRFPCreator from "@/components/dashboard/SmartRFPCreator";
import CreateRFPForm from "@/components/CreateRFPForm";

interface RFP {
  id: string;
  title: string;
  description: string | null;
  budget_max: number | null;
  status: string | null;
  created_at: string;
  deadline: string | null;
  submission_count?: number;
}

const MyRFPsPage = () => {
  const { user, role, loading } = useAuth();
  const navigate = useNavigate();
  const [showSmartCreator, setShowSmartCreator] = useState(false);
  const [showManualForm, setShowManualForm] = useState(false);
  const [prefillData, setPrefillData] = useState<{ title: string; description: string } | null>(null);
  const [rfps, setRfps] = useState<RFP[]>([]);
  const [loadingRfps, setLoadingRfps] = useState(true);

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

  const fetchRfps = async () => {
    if (!user) return;
    
    setLoadingRfps(true);
    try {
      const { data: rfpData, error } = await supabase
        .from("rfps")
        .select("*")
        .eq("airline_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      const rfpsWithCounts = await Promise.all(
        (rfpData || []).map(async (rfp) => {
          const { count } = await supabase
            .from("submissions")
            .select("*", { count: "exact", head: true })
            .eq("rfp_id", rfp.id);
          return { ...rfp, submission_count: count || 0 };
        })
      );

      setRfps(rfpsWithCounts);
    } catch (error) {
      console.error("Error fetching RFPs:", error);
    } finally {
      setLoadingRfps(false);
    }
  };

  useEffect(() => {
    if (user && role === "airline") {
      fetchRfps();
    }
  }, [user, role]);

  const handleAICreate = (extractedData: { title: string; description: string }) => {
    setPrefillData(extractedData);
    setShowSmartCreator(false);
    setShowManualForm(true);
  };

  const handleManualCreate = () => {
    setPrefillData(null);
    setShowManualForm(true);
  };

  if (loading || role !== "airline") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-secondary" />
      </div>
    );
  }

  return (
    <DashboardLayout title="My RFPs" subtitle="Manage and review your RFPs">
      {/* Header Actions */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-muted-foreground">
            {rfps.length} Total
          </Badge>
          <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">
            {rfps.filter(r => r.status === "open").length} Active
          </Badge>
        </div>
        <Button onClick={() => setShowSmartCreator(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Create New RFP
        </Button>
      </div>

      {/* RFP List */}
      {loadingRfps ? (
        <div className="flex items-center justify-center py-12 bg-card rounded-xl border border-border">
          <Loader2 className="h-6 w-6 animate-spin text-secondary" />
        </div>
      ) : rfps.length === 0 ? (
        <div className="text-center py-16 bg-card rounded-xl border border-border">
          <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">No RFPs Yet</h3>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            Create your first RFP to start receiving vendor proposals. Use AI extraction to speed up the process!
          </p>
          <Button onClick={() => setShowSmartCreator(true)} size="lg">
            <Plus className="w-5 h-5 mr-2" />
            Create Your First RFP
          </Button>
        </div>
      ) : (
        <div className="grid gap-4">
          {rfps.map((rfp, index) => (
            <motion.div
              key={rfp.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => navigate(`/rfp/${rfp.id}`)}
              className="p-6 bg-card rounded-xl border border-border hover:border-secondary/50 cursor-pointer transition-all group"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-foreground text-lg group-hover:text-secondary transition-colors">
                      {rfp.title}
                    </h3>
                    <Badge variant={rfp.status === "open" ? "default" : "secondary"}>
                      {rfp.status || "open"}
                    </Badge>
                  </div>
                  <p className="text-muted-foreground text-sm line-clamp-2 mb-4">
                    {rfp.description}
                  </p>
                  
                  <div className="flex flex-wrap items-center gap-4 text-sm">
                    {rfp.budget_max && (
                      <span className="text-muted-foreground">
                        Budget: <span className="text-foreground font-medium">${rfp.budget_max.toLocaleString()}</span>
                      </span>
                    )}
                    {rfp.deadline && (
                      <span className="flex items-center gap-1 text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        Deadline: {new Date(rfp.deadline).toLocaleDateString()}
                      </span>
                    )}
                    <span className="flex items-center gap-1 text-muted-foreground">
                      <Users className="h-4 w-4" />
                      {rfp.submission_count} submissions
                    </span>
                    <span className="flex items-center gap-1 text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      {new Date(rfp.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Smart RFP Creator Modal */}
      <SmartRFPCreator
        open={showSmartCreator}
        onOpenChange={setShowSmartCreator}
        onManualCreate={handleManualCreate}
        onAICreate={handleAICreate}
      />

      {/* Manual Create Form */}
      <CreateRFPForm
        open={showManualForm}
        onOpenChange={setShowManualForm}
        onSuccess={fetchRfps}
        prefillData={prefillData}
      />
    </DashboardLayout>
  );
};

export default MyRFPsPage;
