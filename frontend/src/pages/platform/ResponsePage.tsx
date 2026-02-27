import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import ControlTowerLayout from '@/components/layout/ControlTowerLayout';
import VendorControlTowerLayout from '@/components/layout/VendorControlTowerLayout';
import ConsultantControlTowerLayout from '@/components/layout/ConsultantControlTowerLayout';
import ResponseWizard from '@/components/platform/response-wizard/ResponseWizard';

export default function ResponsePage() {
  const { role } = useAuth();

  const Layout = role === 'vendor' ? VendorControlTowerLayout :
    role === 'consultant' ? ConsultantControlTowerLayout :
      ControlTowerLayout;

  return (
    <Layout title="RFP Response" subtitle="AI-powered response drafting wizard">
      <div data-testid="response-page">
        <ResponseWizard />
      </div>
    </Layout>
  );
}
