import { useState } from 'react';
import { motion } from 'framer-motion';
import VendorDashboardLayout from '@/components/vendor/VendorDashboardLayout';
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
  const [selectedRfp, setSelectedRfp] = useState<RFP | null>(null);
  const [showProposalDrafter, setShowProposalDrafter] = useState(false);

  const handleDraftResponse = (rfp: RFP) => {
    setSelectedRfp(rfp);
    setShowProposalDrafter(true);
  };

  return (
    <VendorDashboardLayout 
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
    </VendorDashboardLayout>
  );
};

export default VendorDashboard;
