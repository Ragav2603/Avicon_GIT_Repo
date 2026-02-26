import React from 'react';
import PlatformLayout from '@/components/platform/PlatformLayout';
import { useAuth } from '@/hooks/useAuth';
import {
  BookOpen, Bot, GitBranch, Calendar, FileText,
  ArrowRight, Sparkles, TrendingUp, Clock,
} from 'lucide-react';
import { Link } from 'react-router-dom';

const quickLinks = [
  { label: 'Knowledge Base', description: 'Manage documents & folders', icon: BookOpen, path: '/platform/knowledge-base', color: 'from-blue-500/10 to-blue-600/5' },
  { label: 'AI Agents', description: 'Configure AI assistants', icon: Bot, path: '/platform/agents', color: 'from-violet-500/10 to-violet-600/5' },
  { label: 'Workflows', description: 'Automate procurement flows', icon: GitBranch, path: '/platform/workflows', color: 'from-emerald-500/10 to-emerald-600/5' },
  { label: 'Meetings', description: 'Schedule & track meetings', icon: Calendar, path: '/platform/meetings', color: 'from-amber-500/10 to-amber-600/5' },
];

const stats = [
  { label: 'Documents', value: '—', icon: FileText },
  { label: 'Queries Today', value: '—', icon: Sparkles },
  { label: 'Avg Response', value: '—', icon: Clock },
  { label: 'Active Workflows', value: '—', icon: TrendingUp },
];

export default function HomePage() {
  const { profile } = useAuth();
  const userName = profile?.company_name || 'User';

  return (
    <PlatformLayout title="Home" subtitle={`Welcome back, ${userName}`}>
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map(s => (
          <div key={s.label} className="enterprise-card p-5">
            <div className="flex items-center justify-between mb-2">
              <p className="text-[11px] font-semibold text-muted-foreground tracking-widest uppercase">{s.label}</p>
              <s.icon className="h-4 w-4 text-muted-foreground/40" />
            </div>
            <p className="text-2xl font-bold font-mono text-foreground tracking-tight">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Quick Links */}
      <div>
        <h2 className="text-sm font-semibold text-foreground mb-3">Quick Actions</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickLinks.map(item => (
            <Link
              key={item.path}
              to={item.path}
              className="enterprise-card p-5 group block"
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
