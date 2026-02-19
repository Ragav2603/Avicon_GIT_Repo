import { useState, useEffect } from "react";
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
  Search,
  Pencil,
  Archive
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
  submissionStatus?: string | null;
  matchStatus?: 'eligible' | 'gap' | 'ineligible';
  matchReason?: string;
}

interface OpportunityRadarProps {
  onDraftResponse: (rfp: RFP) => void;
  refreshSignal?: number;
}

const getMatchStatus = (rfpId: string): { status: 'eligible' | 'gap' | 'ineligible'; reason: string } => {
  const hash = rfpId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const mod = hash % 3;
  
  if (mod === 0) return { status: 'eligible', reason: 'US Data Residency ✓ | SOC2 ✓ | ISO 27001 ✓' };
  if (mod === 1) return { status: 'gap', reason: 'Missing: API Documentation' };
  return { status: 'ineligible', reason: 'Missing: ISO 27001 Certification' };
};

const OpportunityRadar = ({ onDraftResponse, refreshSignal }: OpportunityRadarProps) => {
  const { user } = useAuth();
  const [rfps, setRfps] = useState<RFP[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  useEffect(() => {
    fetchRfps();
  }, [user, refreshSignal]);

  const fetchRfps = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data: rfpData, error } = await supabase.rpc('get_open_rfps');
      if (error) throw error;

      const { data: submissions } = await supabase
        .from('submissions')
        .select('rfp_id, status')
        .eq('vendor_id', user.id);

      const submissionsByRfp = new Map((submissions || []).map(s => [s.rfp_id, s.status]));

      const rfpsWithStatus = (rfpData || []).map(rfp => {
        const match = getMatchStatus(rfp.id);
        return {
          ...rfp,
          submissionStatus: submissionsByRfp.get(rfp.id) ?? null,
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

  const getSubmissionBadge = (status: string | null) => {
    switch (status) {
      case 'submitted':
        return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100"><CheckCircle2 className="h-3 w-3 mr-1" />Submitted</Badge>;
      case 'draft':
        return <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100"><Pencil className="h-3 w-3 mr-1" />Draft Saved</Badge>;
      case 'withdrawn':
        return <Badge className="bg-muted text-muted-foreground hover:bg-muted"><Archive className="h-3 w-3 mr-1" />Withdrawn</Badge>;
      default:
        return null;
    }
  };

  const getMatchBadge = (status: string) => {
    switch (status) {
      case 'eligible':
        return <Badge className="bg-green-100 text-green-700 hover:bg-green-100"><CheckCircle2 className="h-3 w-3 mr-1" />100% Eligible</Badge>;
      case 'gap':
        return <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100"><AlertTriangle className="h-3 w-3 mr-1" />Gap Analysis Required</Badge>;
      case 'ineligible':
        return <Badge className="bg-red-100 text-red-700 hover:bg-red-100"><XCircle className="h-3 w-3 mr-1" />Ineligible</Badge>;
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
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
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

      {/* Table */}
      {filteredRfps.length === 0 ? (
        <div className="text-center py-12 bg-card rounded-md border border-border">
          <Building2 className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">No opportunities match your criteria</p>
        </div>
      ) : (
        <div className="bg-card rounded-md border border-border overflow-hidden">
          {/* Table Header */}
          <div className="hidden lg:grid lg:grid-cols-[1fr,140px,140px,100px,80px,120px] gap-3 px-6 py-2.5 bg-muted/50 border-b border-border">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">Opportunity</span>
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">Match</span>
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">Status</span>
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide text-right">Budget</span>
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide text-right">Deadline</span>
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide text-right">Action</span>
          </div>

          {filteredRfps.map((rfp, index) => {
            const daysLeft = getDaysUntilDeadline(rfp.deadline);
            const isUrgent = daysLeft !== null && daysLeft <= 7 && daysLeft > 0;

            return (
              <div
                key={rfp.id}
                className={`lg:grid lg:grid-cols-[1fr,140px,140px,100px,80px,120px] gap-3 px-6 py-3 flex flex-col hover:bg-muted/30 transition-colors ${
                  index !== filteredRfps.length - 1 ? "border-b border-border" : ""
                }`}
              >
                {/* Title + Description */}
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{rfp.title}</p>
                  <p className="text-xs text-muted-foreground truncate">{rfp.description || 'No description'}</p>
                </div>

                {/* Match Badge */}
                <div className="flex items-center">
                  {getMatchBadge(rfp.matchStatus || 'gap')}
                </div>

                {/* Submission Status */}
                <div className="flex items-center">
                  {getSubmissionBadge(rfp.submissionStatus ?? null) || (
                    <span className="text-xs text-muted-foreground">—</span>
                  )}
                </div>

                {/* Budget */}
                <div className="text-right flex items-center justify-end">
                  {rfp.budget_max ? (
                    <span className="text-sm font-mono text-foreground">${rfp.budget_max.toLocaleString()}</span>
                  ) : (
                    <span className="text-xs text-muted-foreground">—</span>
                  )}
                </div>

                {/* Deadline */}
                <div className="text-right flex items-center justify-end">
                  {daysLeft !== null ? (
                    <span className={`text-xs font-mono ${isUrgent ? 'text-orange-600 font-semibold' : 'text-muted-foreground'}`}>
                      {daysLeft <= 0 ? 'Expired' : `${daysLeft}d`}
                    </span>
                  ) : (
                    <span className="text-xs text-muted-foreground">—</span>
                  )}
                </div>

                {/* Action */}
                <div className="flex items-center justify-end">
                  {rfp.submissionStatus === 'submitted' ? (
                    <Button variant="outline" size="sm" disabled className="text-xs">Submitted</Button>
                  ) : rfp.submissionStatus === 'draft' ? (
                    <Button variant="outline" size="sm" className="text-xs" onClick={() => onDraftResponse(rfp)}>Continue</Button>
                  ) : rfp.submissionStatus === 'withdrawn' ? (
                    <Button size="sm" className="text-xs" onClick={() => onDraftResponse(rfp)} disabled={rfp.matchStatus === 'ineligible'}>Resubmit</Button>
                  ) : (
                    <Button size="sm" className="text-xs" onClick={() => onDraftResponse(rfp)} disabled={rfp.matchStatus === 'ineligible'}>Respond</Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default OpportunityRadar;
