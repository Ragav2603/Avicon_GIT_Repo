import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import ControlTowerLayout from '@/components/layout/ControlTowerLayout';
import VendorControlTowerLayout from '@/components/layout/VendorControlTowerLayout';
import ConsultantControlTowerLayout from '@/components/layout/ConsultantControlTowerLayout';
import { GitBranch, Plus, Play, Pause, MoreHorizontal, Clock, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const workflows = [
  {
    id: '1',
    name: 'RFP Auto-Analysis',
    description: 'Automatically analyzes new RFP uploads and extracts structured requirements.',
    status: 'active',
    lastRun: '2 hours ago',
    runs: 47,
  },
  {
    id: '2',
    name: 'Vendor Notification',
    description: 'Sends automated notifications to matched vendors when a new RFP is published.',
    status: 'active',
    lastRun: '5 hours ago',
    runs: 23,
  },
  {
    id: '3',
    name: 'Compliance Gate',
    description: 'Runs compliance checks on submitted proposals before review.',
    status: 'paused',
    lastRun: '1 day ago',
    runs: 12,
  },
];

export default function WorkflowsPage() {
  const { role } = useAuth();

  const Layout = role === 'vendor' ? VendorControlTowerLayout :
    role === 'consultant' ? ConsultantControlTowerLayout :
      ControlTowerLayout;

  return (
    <Layout title="Workflows" subtitle="Automate procurement processes">
      <div className="flex items-center justify-between mb-6">
        <p className="text-sm text-muted-foreground">Create automated workflows to streamline your procurement pipeline.</p>
        <Button size="sm" className="gap-1.5" data-testid="new-workflow-btn">
          <Plus className="h-3.5 w-3.5" /> New Workflow
        </Button>
      </div>

      <div className="space-y-3">
        {workflows.map(wf => (
          <div key={wf.id} className="enterprise-card p-5 flex items-center gap-4" data-testid={`workflow-card-${wf.id}`}>
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <GitBranch className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-sm">{wf.name}</h3>
                <Badge variant={wf.status === 'active' ? 'default' : 'secondary'} className="text-[10px] h-5">
                  {wf.status}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">{wf.description}</p>
            </div>
            <div className="text-right shrink-0 hidden sm:block">
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" /> {wf.lastRun}
              </div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                <CheckCircle className="h-3 w-3" /> {wf.runs} runs
              </div>
            </div>
            <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
    </Layout>
  );
}
