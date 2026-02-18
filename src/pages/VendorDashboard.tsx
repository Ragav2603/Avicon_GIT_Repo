import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import VendorControlTowerLayout from '@/components/layout/VendorControlTowerLayout';
import VendorStats from '@/components/vendor/VendorStats';
import OpportunityRadar from '@/components/vendor/OpportunityRadar';
import ProposalDrafter from '@/components/vendor/ProposalDrafter';
import ConsultingRequestForm from '@/components/ConsultingRequestForm';

interface RFP {
  id: string;
  title: string;
  description: string | null;
  budget_max: number | null;
  deadline: string | null;
}

const VendorDashboard = () => {
  const { user, role, loading } = useAuth();
  const navigate = useNavigate();
  const [selectedRfp, setSelectedRfp] = useState<RFP | null>(null);
  const [showProposalDrafter, setShowProposalDrafter] = useState(false);

  useEffect(() => {
    if (!loading) {
      if (!user) {
        navigate('/auth');
      } else if (!role) {
        navigate('/onboarding');
      } else if (role !== 'vendor') {
        navigate(`/${role}-dashboard`);
      }
    }
  }, [user, role, loading, navigate]);

  const handleDraftResponse = (rfp: RFP) => {
    setSelectedRfp(rfp);
    setShowProposalDrafter(true);
  };

  if (loading || role !== 'vendor') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <VendorControlTowerLayout 
      title="Opportunity Radar" 
      subtitle="Discover and respond to RFPs from airlines worldwide"
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-8"
      >
        {/* Dashboard Stats */}
        <VendorStats />

        {/* Opportunity Radar Grid */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Open Opportunities</h2>
          <OpportunityRadar onDraftResponse={handleDraftResponse} />
        </div>

        {/* Need Help Section */}
        <ConsultingRequestForm variant="card" />
      </motion.div>

      {/* Proposal Drafter Modal */}
      <ProposalDrafter
        rfp={selectedRfp}
        open={showProposalDrafter}
        onOpenChange={setShowProposalDrafter}
      />
    </VendorControlTowerLayout>
  );
};

export default VendorDashboard;
