import React, { useState, useEffect } from 'react';
import {
  CheckCircle, FileText, ChevronRight, Loader2,
  BookOpen, Copy, Download, Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import FolderExplorer from '../knowledge-base/FolderExplorer';

const API = import.meta.env.REACT_APP_BACKEND_URL || '';

interface Template {
  id: string;
  name: string;
  category: string;
  description: string;
}

export default function ResponseWizard() {
  const [step, setStep] = useState<1 | 2>(1);
  const [selectedDocIds, setSelectedDocIds] = useState<string[]>([]);
  const [rfpContext, setRfpContext] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [draft, setDraft] = useState('');
  const [generating, setGenerating] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetch(`${API}/api/rfp-response/templates`)
      .then(r => r.json())
      .then(setTemplates)
      .catch(console.error);
  }, []);

  const handleDocSelect = (docId: string, selected: boolean) => {
    setSelectedDocIds(prev =>
      selected ? [...prev, docId] : prev.filter(id => id !== docId)
    );
  };

  const handleGenerate = async () => {
    if (!rfpContext.trim()) {
      toast({ title: 'Missing context', description: 'Please enter the RFP requirement.', variant: 'destructive' });
      return;
    }

    setGenerating(true);
    setDraft('');

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) throw new Error('Not authenticated');

      const res = await fetch(`${API}/api/rfp-response/draft`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          rfp_context: rfpContext,
          document_ids: selectedDocIds,
          template_id: selectedTemplate,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setDraft(data.draft);
        setStep(2);
        toast({ title: 'Draft generated', description: `Generated in ${data.latency_ms}ms` });
      } else {
        throw new Error(data.detail || 'Generation failed');
      }
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setGenerating(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(draft);
    toast({ title: 'Copied to clipboard' });
  };

  const templatesByCategory = templates.reduce<Record<string, Template[]>>((acc, t) => {
    (acc[t.category] = acc[t.category] || []).push(t);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      {/* Step indicator */}
      <div className="flex items-center gap-3">
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium ${
          step === 1 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
        }`}>
          {step > 1 ? <CheckCircle className="h-4 w-4" /> : <span className="font-mono">1</span>}
          Search & Context
        </div>
        <ChevronRight className="h-4 w-4 text-muted-foreground" />
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium ${
          step === 2 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
        }`}>
          <span className="font-mono">2</span>
          Draft & Edit
        </div>
      </div>

      {step === 1 ? (
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Left: Document selector */}
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-semibold mb-1">Select Reference Documents</h3>
              <p className="text-xs text-muted-foreground">Choose KB documents to provide context for the AI draft</p>
            </div>
            <div className="h-[400px]">
              <FolderExplorer
                selectedDocIds={selectedDocIds}
                onDocumentSelect={handleDocSelect}
                selectionMode
              />
            </div>
            {selectedDocIds.length > 0 && (
              <Badge variant="secondary" className="text-xs">
                {selectedDocIds.length} document{selectedDocIds.length !== 1 ? 's' : ''} selected
              </Badge>
            )}
          </div>

          {/* Right: RFP context + templates */}
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-semibold mb-1">RFP Requirement</h3>
              <p className="text-xs text-muted-foreground">Paste the RFP section or describe what you need</p>
            </div>
            <Textarea
              value={rfpContext}
              onChange={e => setRfpContext(e.target.value)}
              placeholder="e.g., Provide a detailed response for the In-Flight Entertainment system requirements including content licensing, hardware specifications, and integration timelines..."
              className="min-h-[160px] text-sm"
            />

            <div>
              <h3 className="text-sm font-semibold mb-2">Aviation Templates</h3>
              <div className="space-y-2">
                {Object.entries(templatesByCategory).map(([cat, tpls]) => (
                  <div key={cat}>
                    <p className="text-[10px] font-semibold text-muted-foreground tracking-widest uppercase mb-1">{cat}</p>
                    <div className="grid grid-cols-1 gap-1.5">
                      {tpls.map(t => (
                        <button
                          key={t.id}
                          onClick={() => setSelectedTemplate(prev => prev === t.id ? null : t.id)}
                          className={`text-left px-3 py-2.5 rounded-lg border transition-colors ${
                            selectedTemplate === t.id
                              ? 'border-primary bg-primary/5'
                              : 'border-border hover:border-primary/30'
                          }`}
                        >
                          <p className="text-sm font-medium">{t.name}</p>
                          <p className="text-[10px] text-muted-foreground mt-0.5">{t.description}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <Button onClick={handleGenerate} disabled={generating || !rfpContext.trim()} className="w-full">
              {generating ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Generating Draft...</>
              ) : (
                <><Sparkles className="h-4 w-4 mr-2" /> Generate RFP Response</>
              )}
            </Button>
          </div>
        </div>
      ) : (
        /* Step 2: Draft Editor */
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold">Generated Draft</h3>
              <p className="text-xs text-muted-foreground">Review and edit the AI-generated response</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setStep(1)}>
                <BookOpen className="h-3.5 w-3.5 mr-1.5" /> Back to Context
              </Button>
              <Button variant="outline" size="sm" onClick={handleCopy}>
                <Copy className="h-3.5 w-3.5 mr-1.5" /> Copy
              </Button>
            </div>
          </div>
          <Textarea
            value={draft}
            onChange={e => setDraft(e.target.value)}
            className="min-h-[500px] font-mono text-sm leading-relaxed"
          />
        </div>
      )}
    </div>
  );
}
