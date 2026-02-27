import React, { useState, useEffect, useCallback } from 'react';
import {
  Search, BookmarkPlus, Globe, Lock, Users, Sparkles,
  Loader2, Trash2, PenLine, BarChart3, ChevronRight, Tag,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const API = import.meta.env.REACT_APP_BACKEND_URL || '';

interface TeamTemplate {
  id: string;
  user_id: string;
  title: string;
  description: string;
  content: string;
  category: string;
  tags: string[];
  is_shared: boolean;
  author_name: string;
  author_email: string;
  usage_count: number;
  created_at: string;
  updated_at: string;
}

interface TemplateLibraryProps {
  onUseTemplate: (draftId: string, title: string, content: string) => void;
}

const CATEGORY_COLORS: Record<string, string> = {
  'IFE': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  'MRO': 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  'Catering': 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  'Ground Handling': 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  'Connectivity': 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400',
  'Digital': 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400',
  'Safety': 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  'Compliance': 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  'General': 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400',
};

export default function TemplateLibrary({ onUseTemplate }: TemplateLibraryProps) {
  const [templates, setTemplates] = useState<TeamTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [usingId, setUsingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const { toast } = useToast();

  const getAuthHeaders = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.access_token) return null;
    return { 'Authorization': `Bearer ${session.access_token}`, 'Content-Type': 'application/json' };
  };

  const fetchTemplates = useCallback(async () => {
    setLoading(true);
    const headers = await getAuthHeaders();
    if (!headers) { setLoading(false); return; }
    try {
      let url = `${API}/api/team-templates`;
      const params = new URLSearchParams();
      if (activeCategory) params.set('category', activeCategory);
      if (searchQuery) params.set('search', searchQuery);
      if (params.toString()) url += `?${params}`;
      const res = await fetch(url, { headers });
      if (res.ok) setTemplates(await res.json());
    } catch { /* non-critical */ }
    setLoading(false);
  }, [activeCategory, searchQuery]);

  useEffect(() => { fetchTemplates(); }, [fetchTemplates]);

  const handleUseTemplate = async (tmpl: TeamTemplate) => {
    setUsingId(tmpl.id);
    const headers = await getAuthHeaders();
    if (!headers) { setUsingId(null); return; }
    try {
      const res = await fetch(`${API}/api/team-templates/${tmpl.id}/use`, { method: 'POST', headers });
      if (res.ok) {
        const draft = await res.json();
        toast({ title: 'Draft created', description: `New draft from "${tmpl.title}"` });
        onUseTemplate(draft.id, draft.title, draft.content);
      } else {
        const data = await res.json();
        throw new Error(data.detail || 'Failed to create draft');
      }
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    }
    setUsingId(null);
  };

  const handleDelete = async (tmplId: string) => {
    setDeletingId(tmplId);
    const headers = await getAuthHeaders();
    if (!headers) { setDeletingId(null); return; }
    try {
      const res = await fetch(`${API}/api/team-templates/${tmplId}`, { method: 'DELETE', headers });
      if (res.ok) {
        toast({ title: 'Template deleted' });
        fetchTemplates();
      } else {
        const data = await res.json();
        throw new Error(data.detail || 'Delete failed');
      }
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    }
    setDeletingId(null);
  };

  const categories = [...new Set(templates.map(t => t.category))].sort();

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="space-y-4" data-testid="template-library">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold">Template Library</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Reusable templates from your team's successful RFP responses
          </p>
        </div>
        <Badge variant="secondary" className="text-xs gap-1" data-testid="template-count-badge">
          <Users className="h-3 w-3" /> {templates.length} template{templates.length !== 1 ? 's' : ''}
        </Badge>
      </div>

      {/* Search + Category Filter */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            data-testid="template-search-input"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search templates..."
            className="pl-8 h-8 text-xs"
          />
        </div>
      </div>

      {categories.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => setActiveCategory(null)}
            className={`px-2.5 py-1 rounded-md text-[10px] font-medium transition-colors ${
              !activeCategory ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
            data-testid="filter-all"
          >
            All
          </button>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(activeCategory === cat ? null : cat)}
              className={`px-2.5 py-1 rounded-md text-[10px] font-medium transition-colors ${
                activeCategory === cat ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
              data-testid={`filter-${cat.toLowerCase().replace(/\s+/g, '-')}`}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {/* Template Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : templates.length === 0 ? (
        <div className="py-12 text-center">
          <BookmarkPlus className="mx-auto h-10 w-10 text-muted-foreground/15 mb-3" />
          <p className="text-sm text-muted-foreground">No templates yet</p>
          <p className="text-xs text-muted-foreground/60 mt-1 max-w-xs mx-auto">
            {searchQuery || activeCategory
              ? 'Try adjusting your search or category filter.'
              : 'Save a successful RFP draft as a template to build your team\'s library.'}
          </p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-3 max-h-[500px] overflow-y-auto pr-1">
          {templates.map(tmpl => (
            <div
              key={tmpl.id}
              className="border border-border rounded-xl p-4 space-y-3 hover:shadow-sm transition-shadow group"
              data-testid={`team-template-card-${tmpl.id}`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge className={`text-[9px] h-4 px-1.5 ${CATEGORY_COLORS[tmpl.category] || CATEGORY_COLORS['General']}`}>
                      {tmpl.category}
                    </Badge>
                    {tmpl.is_shared ? (
                      <Globe className="h-3 w-3 text-primary" />
                    ) : (
                      <Lock className="h-3 w-3 text-muted-foreground" />
                    )}
                  </div>
                  <h4 className="text-sm font-semibold truncate">{tmpl.title}</h4>
                  {tmpl.description && (
                    <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-2">{tmpl.description}</p>
                  )}
                </div>
              </div>

              {tmpl.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {tmpl.tags.slice(0, 4).map(tag => (
                    <Badge key={tag} variant="outline" className="text-[9px] h-4 px-1.5 gap-0.5">
                      <Tag className="h-2 w-2" /> {tag}
                    </Badge>
                  ))}
                  {tmpl.tags.length > 4 && (
                    <span className="text-[9px] text-muted-foreground">+{tmpl.tags.length - 4}</span>
                  )}
                </div>
              )}

              <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Avatar className="h-5 w-5">
                    <AvatarFallback className="text-[8px] font-semibold bg-primary/10 text-primary">
                      {tmpl.author_name.slice(0, 2).toUpperCase() || 'UN'}
                    </AvatarFallback>
                  </Avatar>
                  <span>{tmpl.author_name || 'Unknown'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="flex items-center gap-0.5">
                    <BarChart3 className="h-2.5 w-2.5" /> {tmpl.usage_count} uses
                  </span>
                  <span>{formatDate(tmpl.created_at)}</span>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  size="sm"
                  className="flex-1 text-xs gap-1"
                  onClick={() => handleUseTemplate(tmpl)}
                  disabled={usingId === tmpl.id}
                  data-testid={`use-template-btn-${tmpl.id}`}
                >
                  {usingId === tmpl.id ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <><Sparkles className="h-3 w-3" /> Use Template</>
                  )}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-xs text-destructive opacity-0 group-hover:opacity-100"
                  onClick={() => handleDelete(tmpl.id)}
                  disabled={deletingId === tmpl.id}
                  data-testid={`delete-template-btn-${tmpl.id}`}
                >
                  {deletingId === tmpl.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <Trash2 className="h-3 w-3" />}
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
