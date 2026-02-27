import React, { useState } from 'react';
import { BookmarkPlus, Loader2, Globe, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogDescription, DialogTrigger,
} from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const API = import.meta.env.REACT_APP_BACKEND_URL || '';

const CATEGORIES = [
  'IFE', 'MRO', 'Catering', 'Ground Handling', 'Connectivity',
  'Digital', 'Safety', 'Compliance', 'General',
];

interface SaveAsTemplateDialogProps {
  draftContent: string;
  draftTitle: string;
  onSaved?: () => void;
}

export default function SaveAsTemplateDialog({ draftContent, draftTitle, onSaved }: SaveAsTemplateDialogProps) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('General');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [isShared, setIsShared] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const handleOpen = (isOpen: boolean) => {
    setOpen(isOpen);
    if (isOpen) {
      setTitle(draftTitle ? `${draftTitle} Template` : '');
      setDescription('');
      setCategory('General');
      setTags([]);
      setTagInput('');
      setIsShared(true);
    }
  };

  const handleAddTag = () => {
    const tag = tagInput.trim().toLowerCase();
    if (tag && !tags.includes(tag) && tags.length < 10) {
      setTags(prev => [...prev, tag]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setTags(prev => prev.filter(t => t !== tag));
  };

  const handleSave = async () => {
    if (!title.trim()) {
      toast({ title: 'Title required', variant: 'destructive' });
      return;
    }
    setSaving(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) throw new Error('Not authenticated');

      const res = await fetch(`${API}/api/team-templates`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          content: draftContent,
          category,
          tags,
          is_shared: isShared,
        }),
      });

      if (res.ok) {
        toast({ title: 'Template saved', description: isShared ? 'Shared with your organization.' : 'Saved as personal template.' });
        setOpen(false);
        onSaved?.();
      } else {
        const data = await res.json();
        throw new Error(data.detail || 'Save failed');
      }
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    }
    setSaving(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1.5" data-testid="save-as-template-btn">
          <BookmarkPlus className="h-3.5 w-3.5" /> Save as Template
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg" aria-describedby="save-template-desc">
        <DialogHeader>
          <DialogTitle>Save as Team Template</DialogTitle>
          <DialogDescription id="save-template-desc">
            Save this draft as a reusable template for your team.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="tmpl-title">Template Name</Label>
            <Input
              id="tmpl-title"
              data-testid="template-title-input"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g., IFE Procurement Response v2"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="tmpl-desc">Description</Label>
            <Textarea
              id="tmpl-desc"
              data-testid="template-description-input"
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Brief description of when to use this template..."
              className="min-h-[60px] text-sm"
            />
          </div>
          <div className="space-y-2">
            <Label>Category</Label>
            <div className="flex flex-wrap gap-1.5">
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                    category === cat
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted hover:bg-muted/80 text-muted-foreground'
                  }`}
                  data-testid={`category-${cat.toLowerCase().replace(/\s+/g, '-')}`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <Label>Tags</Label>
            <div className="flex gap-2">
              <Input
                data-testid="template-tag-input"
                value={tagInput}
                onChange={e => setTagInput(e.target.value)}
                placeholder="Add a tag..."
                className="text-sm"
                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
              />
              <Button size="sm" variant="outline" onClick={handleAddTag} disabled={!tagInput.trim()}>Add</Button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-1">
                {tags.map(tag => (
                  <Badge key={tag} variant="secondary" className="text-xs gap-1 cursor-pointer" onClick={() => handleRemoveTag(tag)}>
                    {tag} &times;
                  </Badge>
                ))}
              </div>
            )}
          </div>
          <div className="flex items-center justify-between p-3 rounded-lg border border-border">
            <div className="flex items-center gap-2">
              {isShared ? <Globe className="h-4 w-4 text-primary" /> : <Lock className="h-4 w-4 text-muted-foreground" />}
              <div>
                <p className="text-sm font-medium">{isShared ? 'Shared with team' : 'Personal only'}</p>
                <p className="text-[10px] text-muted-foreground">
                  {isShared ? 'Everyone in your org can use this template' : 'Only you can see and use this template'}
                </p>
              </div>
            </div>
            <Switch
              checked={isShared}
              onCheckedChange={setIsShared}
              data-testid="template-shared-toggle"
            />
          </div>
          <Button onClick={handleSave} disabled={saving || !title.trim()} className="w-full" data-testid="confirm-save-template-btn">
            {saving ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Saving...</> : <><BookmarkPlus className="h-4 w-4 mr-2" /> Save Template</>}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
