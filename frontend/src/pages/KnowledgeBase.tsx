import React from 'react';
import { AIChatbot } from '@/components/Chat/AIChatbot';
import { ControlTowerLayout } from '@/components/layout/ControlTowerLayout';
import VendorControlTowerLayout from '@/components/layout/VendorControlTowerLayout';
import ConsultantControlTowerLayout from '@/components/layout/ConsultantControlTowerLayout';
import { useAuth } from '@/hooks/useAuth';
import { BrainCircuit } from 'lucide-react';

const KnowledgeBase = () => {
    const { role } = useAuth();

    const content = (
        <div className="max-w-5xl mx-auto space-y-6">
            <div className="flex flex-col space-y-2">
                <h1 className="text-3xl font-bold tracking-tight">AI Knowledge Base</h1>
                <p className="text-muted-foreground text-lg">
                    Query your secure project documentation and past proposal data.
                </p>
            </div>

            <div className="bg-card rounded-xl border shadow-sm p-1">
                <AIChatbot />
            </div>
        </div>
    );

    // Select layout based on role
    if (role === 'vendor') {
        return (
            <VendorControlTowerLayout
                title="Knowledge Base"
                subtitle="AI-Powered Proposal Intel"
            >
                {content}
            </VendorControlTowerLayout>
        );
    }

    if (role === 'consultant') {
        return (
            <ConsultantControlTowerLayout
                title="Knowledge Base"
                subtitle="Cross-Client Research Hub"
            >
                {content}
            </ConsultantControlTowerLayout>
        );
    }

    // Default to Airline/Manager layout
    return (
        <ControlTowerLayout
            title="Knowledge Base"
            subtitle="Unified Project Intelligence"
        >
            {content}
        </ControlTowerLayout>
    );
};

export default KnowledgeBase;
