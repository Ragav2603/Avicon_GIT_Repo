import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Calendar, 
  DollarSign,
  Building2,
  Clock,
  FileEdit,
  Loader2,
  Filter,
  Search
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface RFP {
  id: string;
  title: string;
  description: string | null;
  budget_max: number | null;
  status: string | null;
  created_at: string;
  deadline: string | null;
  airline_id: string;
  has_submitted?: boolean;
  matchStatus?: 'eligible' | 'gap' | 'ineligible';
  matchReason?: string;
}

interface OpportunityRadarProps {
  onDraftResponse: (rfp: RFP) => void;
}

// Mock match status generator for demo
const getMatchStatus = (rfpId: string): { status: 'eligible' | 'gap' | 'ineligible'; reason: string } => {
  const hash = rfpId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const mod = hash % 3;
  
  if (mod === 0) return { status: 'eligible', reason: 'US Data Residency ✓ | SOC2 ✓ | ISO 27001 ✓' };
  if (mod === 1) return { status: 'gap', reason: 'Missing: API Documentation' };
  return { status: 'ineligible', reason: 'Missing: ISO 27001 Certification' };
};

const OpportunityRadar = ({ onDraftResponse }: OpportunityRadarProps) => {
  const { user } = useAuth();
  const [rfps, setRfps] = useState<RFP[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  useEffect(() => {
    fetchRfps();
  }, [user]);

  const fetchRfps = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Only fetch open RFPs - withdrawn RFPs won't appear
      const { data: rfpData, error } = await supabase
        .from('rfps')
        .select('*')
        .eq('status', 'open')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const { data: submissions } = await supabase
        .from('submissions')
        .select('rfp_id')
        .eq('vendor_id', user.id);

      const submittedRfpIds = new Set((submissions || []).map(s => s.rfp_id));

      const rfpsWithStatus = (rfpData || []).map(rfp => {
        const match = getMatchStatus(rfp.id);
        return {
          ...rfp,
          has_submitted: submittedRfpIds.has(rfp.id),
          matchStatus: match.status,
          matchReason: match.reason,
        };
      });

      setRfps(rfpsWithStatus);
    } catch (error) {
      console.error('Error fetching RFPs:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredRfps = rfps.filter(rfp => {
    const matchesSearch = rfp.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rfp.description?.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (filterStatus === "all") return matchesSearch;
    return matchesSearch && rfp.matchStatus === filterStatus;
  });

  const getDaysUntilDeadline = (deadline: string | null) => {
    if (!deadline) return null;
    const days = Math.ceil((new Date(deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    return days;
  };

  const getMatchBadge = (status: string) => {
    switch (status) {
      case 'eligible':
        return (
          <Badge className="bg-green-500/10 text-green-600 border-green-500/20 hover:bg-green-500/20">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            100% Eligible
          </Badge>
        );
      case 'gap':
        return (
          <Badge className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20 hover:bg-yellow-500/20">
            <AlertTriangle className="h-3 w-3 mr-1" />
            Gap Analysis Required
          </Badge>
        );
      case 'ineligible':
        return (
          <Badge className="bg-red-500/10 text-red-600 border-red-500/20 hover:bg-red-500/20">
            <XCircle className="h-3 w-3 mr-1" />
            Ineligible
          </Badge>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search opportunities..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Filter by match" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Opportunities</SelectItem>
            <SelectItem value="eligible">100% Eligible</SelectItem>
            <SelectItem value="gap">Gap Analysis Required</SelectItem>
            <SelectItem value="ineligible">Ineligible</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Smart Grid */}
      {filteredRfps.length === 0 ? (
        <div className="text-center py-16 bg-muted/30 rounded-xl border border-border">
          <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No opportunities match your criteria</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filteredRfps.map((rfp, index) => {
            const daysLeft = getDaysUntilDeadline(rfp.deadline);
            const isUrgent = daysLeft !== null && daysLeft <= 7;

            return (
              <motion.div
                key={rfp.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`group relative p-6 rounded-xl border bg-card hover:shadow-lg transition-all ${
                  rfp.matchStatus === 'eligible' ? 'border-green-500/30 hover:border-green-500/50' :
                  rfp.matchStatus === 'gap' ? 'border-yellow-500/30 hover:border-yellow-500/50' :
                  'border-red-500/30 hover:border-red-500/50'
                }`}
              >
                {/* Urgency indicator */}
                {isUrgent && (
                  <div className="absolute -top-2 -right-2">
                    <span className="flex h-6 w-6">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-6 w-6 bg-orange-500 items-center justify-center">
                        <Clock className="h-3 w-3 text-white" />
                      </span>
                    </span>
                  </div>
                )}

                {/* Match Status Badge */}
                <div className="mb-4">
                  {getMatchBadge(rfp.matchStatus || 'gap')}
                </div>

                {/* Title */}
                <h3 className="font-semibold text-foreground text-lg mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                  {rfp.title}
                </h3>

                {/* Description */}
                <p className="text-muted-foreground text-sm line-clamp-2 mb-4">
                  {rfp.description || 'No description provided'}
                </p>

                {/* Match Reason */}
                <div className="text-xs text-muted-foreground bg-muted/50 rounded-lg p-2 mb-4">
                  {rfp.matchReason}
                </div>

                {/* Meta Info */}
                <div className="flex flex-wrap gap-3 text-sm text-muted-foreground mb-4">
                  {rfp.budget_max && (
                    <span className="flex items-center gap-1">
                      <DollarSign className="h-3.5 w-3.5" />
                      ${rfp.budget_max.toLocaleString()}
                    </span>
                  )}
                  {rfp.deadline && (
                    <span className={`flex items-center gap-1 ${isUrgent ? 'text-orange-500 font-medium' : ''}`}>
                      <Calendar className="h-3.5 w-3.5" />
                      {daysLeft !== null ? (
                        daysLeft <= 0 ? 'Expired' : `${daysLeft}d left`
                      ) : (
                        new Date(rfp.deadline).toLocaleDateString()
                      )}
                    </span>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  {rfp.has_submitted ? (
                    <Button variant="outline" className="flex-1" disabled>
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      Submitted
                    </Button>
                  ) : (
                    <Button 
                      className="flex-1"
                      onClick={() => onDraftResponse(rfp)}
                      disabled={rfp.matchStatus === 'ineligible'}
                    >
                      <FileEdit className="h-4 w-4 mr-2" />
                      Draft Response
                    </Button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default OpportunityRadar;
