import React from 'react';
import PlatformLayout from '@/components/platform/PlatformLayout';
import ResponseWizard from '@/components/platform/response-wizard/ResponseWizard';

export default function ResponsePage() {
  return (
    <PlatformLayout title="RFP Response" subtitle="AI-powered response drafting wizard">
      <ResponseWizard />
    </PlatformLayout>
  );
}
