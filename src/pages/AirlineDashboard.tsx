import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  Plus, 
  FileText, 
  Users, 
  TrendingUp, 
  Clock, 
  ArrowRight,
  BarChart3,
  CheckCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import SmartRFPCreator from "@/components/dashboard/SmartRFPCreator";
import CreateRFPForm from "@/components/CreateRFPForm";
import { Loader2 } from "lucide-react";

interface RFP {
  id: string;
  title: string;
  status: string | null;
  created_at: string;
  submission_count?: number;
}

const AirlineDashboard = () => {
  const { user, role, loading } = useAuth();
  const navigate = useNavigate();
  const [showSmartCreator, setShowSmartCreator] = useState(false);
  const [showManualForm, setShowManualForm] = useState(false);
  const [prefillData, setPrefillData] = useState<{ title: string; description: string } | null>(null);
  const [rfps, setRfps] = useState<RFP[]>([]);
  const [loadingRfps, setLoadingRfps] = useState(true);
  const [stats, setStats] = useState({
    totalRfps: 0,
    activeRfps: 0,
    totalSubmissions: 0,
    avgScore: 0,
  });

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
        .order("created_at", { ascending: false })
        .limit(5);

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

      // Calculate stats
      const { count: totalRfps } = await supabase
        .from("rfps")
        .select("*", { count: "exact", head: true })
        .eq("airline_id", user.id);

      const { count: activeRfps } = await supabase
        .from("rfps")
        .select("*", { count: "exact", head: true })
        .eq("airline_id", user.id)
        .eq("status", "open");

      setStats({
        totalRfps: totalRfps || 0,
        activeRfps: activeRfps || 0,
        totalSubmissions: rfpsWithCounts.reduce((acc, rfp) => acc + (rfp.submission_count || 0), 0),
        avgScore: 78, // Mock for now
      });
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

  const statCards = [
    { label: "Total RFPs", value: stats.totalRfps, icon: FileText, color: "secondary" },
    { label: "Active RFPs", value: stats.activeRfps, icon: Clock, color: "green-500" },
    { label: "Total Submissions", value: stats.totalSubmissions, icon: Users, color: "accent" },
    { label: "Avg. AI Score", value: `${stats.avgScore}%`, icon: BarChart3, color: "warning" },
  ];

  return (
    <DashboardLayout title="Overview" subtitle="Welcome back, Airline Manager">
      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-card rounded-xl border border-border p-5"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <p className="text-2xl font-bold text-foreground mt-1">{stat.value}</p>
              </div>
              <div className={`w-10 h-10 rounded-lg bg-${stat.color}/10 flex items-center justify-center`}>
                <stat.icon className={`w-5 h-5 text-${stat.color}`} />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mb-8"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-foreground">Quick Actions</h2>
        </div>
        
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Button
            variant="outline"
            className="h-auto p-6 flex flex-col items-start text-left justify-start hover:border-secondary/50 hover:bg-secondary/5"
            onClick={() => setShowSmartCreator(true)}
          >
            <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center mb-3">
              <Plus className="w-6 h-6 text-secondary" />
            </div>
            <h3 className="font-semibold text-foreground">Create New RFP</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Use AI extraction or start from scratch
            </p>
          </Button>

          <Button
            variant="outline"
            className="h-auto p-6 flex flex-col items-start text-left justify-start hover:border-secondary/50 hover:bg-secondary/5"
            onClick={() => navigate("/airline-dashboard/rfps")}
          >
            <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mb-3">
              <FileText className="w-6 h-6 text-accent" />
            </div>
            <h3 className="font-semibold text-foreground">View My RFPs</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Manage and review your active RFPs
            </p>
          </Button>

          <Button
            variant="outline"
            className="h-auto p-6 flex flex-col items-start text-left justify-start hover:border-secondary/50 hover:bg-secondary/5"
            onClick={() => navigate("/airline-dashboard/adoption")}
          >
            <div className="w-12 h-12 rounded-xl bg-warning/10 flex items-center justify-center mb-3">
              <TrendingUp className="w-6 h-6 text-warning" />
            </div>
            <h3 className="font-semibold text-foreground">Adoption Tracker</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Monitor tool adoption and ROI
            </p>
          </Button>
        </div>
      </motion.div>

      {/* Recent RFPs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-foreground">Recent RFPs</h2>
          <Button variant="ghost" size="sm" onClick={() => navigate("/airline-dashboard/rfps")}>
            View All
            <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </div>

        {loadingRfps ? (
          <div className="flex items-center justify-center py-12 bg-card rounded-xl border border-border">
            <Loader2 className="h-6 w-6 animate-spin text-secondary" />
          </div>
        ) : rfps.length === 0 ? (
          <div className="text-center py-12 bg-card rounded-xl border border-border">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-4">No RFPs yet. Create your first one!</p>
            <Button onClick={() => setShowSmartCreator(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create RFP
            </Button>
          </div>
        ) : (
          <div className="bg-card rounded-xl border border-border overflow-hidden">
            {rfps.map((rfp, index) => (
              <div
                key={rfp.id}
                onClick={() => navigate(`/rfp/${rfp.id}`)}
                className={`p-4 flex items-center justify-between hover:bg-muted/30 cursor-pointer transition-colors ${
                  index !== rfps.length - 1 ? "border-b border-border" : ""
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center">
                    <FileText className="w-5 h-5 text-secondary" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{rfp.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {rfp.submission_count} submissions • {rfp.status || "open"}
                    </p>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-muted-foreground" />
              </div>
            ))}
          </div>
        )}
      </motion.div>

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

export default AirlineDashboard;
