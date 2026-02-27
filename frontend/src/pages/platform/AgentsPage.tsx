import React from 'react';
import PlatformLayout from '@/components/platform/PlatformLayout';
import { Bot, Plus, Sparkles, ToggleLeft, Settings2, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const agents = [
  {
    id: '1',
    name: 'RFP Analyst',
    description: 'Analyzes RFP documents and extracts key requirements, deadlines, and compliance criteria.',
    status: 'active',
    category: 'Analysis',
  },
  {
    id: '2',
    name: 'Vendor Matcher',
    description: 'Matches vendor capabilities to RFP requirements using knowledge base context.',
    status: 'active',
    category: 'Matching',
  },
  {
    id: '3',
    name: 'Compliance Checker',
    description: 'Verifies proposal compliance against aviation industry regulations (FAA, EASA).',
    status: 'inactive',
    category: 'Compliance',
  },
  {
    id: '4',
    name: 'Draft Writer',
    description: 'Generates professional RFP response drafts based on templates and reference documents.',
    status: 'active',
    category: 'Content',
  },
];

export default function AgentsPage() {
  return (
    <PlatformLayout title="AI Agents" subtitle="Configure and manage your AI assistants">
      <div className="flex items-center justify-between mb-6">
        <p className="text-sm text-muted-foreground">AI agents process your documents and automate procurement tasks.</p>
        <Button size="sm" className="gap-1.5" data-testid="create-agent-btn">
          <Plus className="h-3.5 w-3.5" /> Create Agent
        </Button>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {agents.map(agent => (
          <div key={agent.id} className="enterprise-card p-5" data-testid={`agent-card-${agent.id}`}>
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Bot className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm">{agent.name}</h3>
                  <Badge variant={agent.status === 'active' ? 'default' : 'secondary'} className="text-[10px] h-5 mt-0.5">
                    {agent.status}
                  </Badge>
                </div>
              </div>
              <Button variant="ghost" size="icon" className="h-8 w-8" aria-label={`Settings for ${agent.name}`}>
                <Settings2 className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">{agent.description}</p>
            <div className="flex items-center gap-2 mt-3">
              <Badge variant="outline" className="text-[10px] h-5">{agent.category}</Badge>
            </div>
          </div>
        ))}
      </div>
    </PlatformLayout>
  );
}
