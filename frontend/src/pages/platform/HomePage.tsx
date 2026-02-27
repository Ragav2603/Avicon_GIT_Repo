import React, { useState, useEffect } from 'react';
import PlatformLayout from '@/components/platform/PlatformLayout';
import { useAuth } from '@/hooks/useAuth';
import {
  BookOpen, Bot, GitBranch, Calendar, FileText,
  ArrowRight, Sparkles, TrendingUp, Clock, FolderOpen,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

const API = import.meta.env.REACT_APP_BACKEND_URL || '';

interface Stats {
  total_documents: number;
  total_folders: number;
  queries_today: number;
  avg_response_ms: number;
  active_drafts: number;
}

const quickLinks = [
  { label: 'Knowledge Base', description: 'Manage documents & folders', icon: BookOpen, path: '/platform/knowledge-base', color: 'from-blue-500/10 to-blue-600/5' },
  { label: 'AI Agents', description: 'Configure AI assistants', icon: Bot, path: '/platform/agents', color: 'from-violet-500/10 to-violet-600/5' },
  { label: 'Workflows', description: 'Automate procurement flows', icon: GitBranch, path: '/platform/workflows', color: 'from-emerald-500/10 to-emerald-600/5' },
  { label: 'Meetings', description: 'Schedule & track meetings', icon: Calendar, path: '/platform/meetings', color: 'from-amber-500/10 to-amber-600/5' },
];

export default function HomePage() {
  const { user, profile } = useAuth();
  const userName = profile?.company_name || 'User';
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.access_token) return;
        const res = await fetch(`${API}/api/stats`, {
          headers: { 'Authorization': `Bearer ${session.access_token}` },
        });
        if (res.ok) setStats(await res.json());
      } catch {
        // Stats are non-critical
      }
    };
    fetchStats();
  }, [user]);

  const statCards = [
    { label: 'Documents', value: stats?.total_documents ?? '—', icon: FileText },
    { label: 'Folders', value: stats?.total_folders ?? '—', icon: FolderOpen },
    { label: 'Queries Today', value: stats?.queries_today ?? '—', icon: Sparkles },
    { label: 'Active Drafts', value: stats?.active_drafts ?? '—', icon: TrendingUp },
  ];

  return (
    <PlatformLayout title="Home" subtitle={`Welcome back, ${userName}`}>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map(s => (
          <div key={s.label} className="enterprise-card p-5" data-testid={`stat-card-${s.label.toLowerCase().replace(/\s+/g, '-')}`}>
            <div className="flex items-center justify-between mb-2">
              <p className="text-[11px] font-semibold text-muted-foreground tracking-widest uppercase">{s.label}</p>
              <s.icon className="h-4 w-4 text-muted-foreground/40" />
            </div>
            <p className="text-2xl font-bold font-mono text-foreground tracking-tight">{s.value}</p>
          </div>
        ))}
      </div>

      <div>
        <h2 className="text-sm font-semibold text-foreground mb-3">Quick Actions</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickLinks.map(item => (
            <Link
              key={item.path}
              to={item.path}
              className="enterprise-card p-5 group block"
              data-testid={`quick-link-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
            >
              <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${item.color} flex items-center justify-center mb-3 transition-transform group-hover:scale-105`}>
                <item.icon className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-semibold text-sm text-foreground mb-0.5">{item.label}</h3>
              <p className="text-xs text-muted-foreground">{item.description}</p>
              <ArrowRight className="h-4 w-4 text-primary mt-3 opacity-0 group-hover:opacity-100 transition-opacity" />
            </Link>
          ))}
        </div>
      </div>
    </PlatformLayout>
  );
}
