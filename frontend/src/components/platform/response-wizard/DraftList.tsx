import React from 'react';
import { FileText, Clock, Trash2, ChevronRight, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface Draft {
  id: string;
  title: string;
  version: number;
  last_saved_at: string;
  active_editors: Array<{ name: string; action: string }>;
}

interface DraftListProps {
  drafts: Draft[];
  onSelect: (draftId: string) => void;
  onDelete: (draftId: string) => void;
  onCreate: () => void;
  activeDraftId: string | null;
}

export default function DraftList({ drafts, onSelect, onDelete, onCreate, activeDraftId }: DraftListProps) {
  const formatTime = (iso: string) => {
    const d = new Date(iso);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    if (diff < 60_000) return 'Just now';
    if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`;
    if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h ago`;
    return d.toLocaleDateString();
  };

  return (
    <div className="space-y-3" data-testid="draft-list">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">Saved Drafts</h3>
        <Button size="sm" variant="outline" onClick={onCreate} className="gap-1.5 text-xs" data-testid="new-draft-btn">
          <Plus className="h-3 w-3" /> New Draft
        </Button>
      </div>

      {drafts.length === 0 ? (
        <div className="py-8 text-center">
          <FileText className="mx-auto h-8 w-8 text-muted-foreground/15 mb-2" />
          <p className="text-sm text-muted-foreground">No saved drafts yet</p>
          <p className="text-xs text-muted-foreground/60 mt-0.5">Create a new draft or generate one from a template</p>
        </div>
      ) : (
        <div className="space-y-1.5">
          {drafts.map(draft => (
            <div
              key={draft.id}
              data-testid={`draft-item-${draft.id}`}
              onClick={() => onSelect(draft.id)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg border cursor-pointer transition-all group ${
                activeDraftId === draft.id
                  ? 'border-primary bg-primary/5'
                  : 'border-transparent hover:bg-muted/50 hover:border-border'
              }`}
            >
              <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{draft.title}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                    <Clock className="h-2.5 w-2.5" /> {formatTime(draft.last_saved_at)}
                  </span>
                  <Badge variant="secondary" className="text-[9px] h-4">v{draft.version}</Badge>
                  {draft.active_editors.length > 0 && (
                    <Badge variant="default" className="text-[9px] h-4 gap-0.5">
                      {draft.active_editors.length} active
                    </Badge>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 opacity-0 group-hover:opacity-100"
                  onClick={(e) => { e.stopPropagation(); onDelete(draft.id); }}
                  data-testid={`delete-draft-btn-${draft.id}`}
                >
                  <Trash2 className="h-3.5 w-3.5 text-destructive" />
                </Button>
                <ChevronRight className="h-4 w-4 text-muted-foreground/40" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
