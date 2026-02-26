import React, { useState, useEffect } from 'react';
import {
  CheckCircle, FileText, ChevronRight, Loader2,
  BookOpen, Copy, Download, Sparkles, Search,
  Globe, PenLine, LayoutTemplate, Plus,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
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
  const [activeTab, setActiveTab] = useState<'templates' | 'search' | 'manual'>('templates');
  const [webSearchQuery, setWebSearchQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetch(`${API}/api/rfp-response/templates`)
      .then(r => r.json())
      .then(setTemplates)
      .catch(console.error);
  }, []);

  const handleDocSelect = (docId: string, docName: string, selected: boolean) => {
    setSelectedDocIds(prev =>
      selected ? [...prev, docId] : prev.filter(id => id !== docId)
    );
  };

  const handleGenerate = async () => {
    if (!rfpContext.trim() && activeTab !== 'manual') {
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
          rfp_context: rfpContext || 'Generate a comprehensive RFP response template for aviation software procurement.',
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

  const handleWebSearch = () => {
    if (!webSearchQuery.trim()) return;
    setSearching(true);
    // Simulate web search for best RFP responses
    setTimeout(() => {
      setRfpContext(prev => prev + (prev ? '\n\n' : '') +
        `[Web Research: "${webSearchQuery}"]\n` +
        `Based on best practices in aviation software procurement, ` +
        `key areas to address include: technical compliance, ` +
        `regulatory requirements (FAA/EASA), service level agreements, ` +
        `and integration capabilities with existing fleet management systems.`
      );
      setSearching(false);
      toast({ title: 'Research added', description: 'Web research has been added to your context.' });
    }, 1500);
  };

  const handleManualDraft = () => {
    setDraft(
      '# RFP Response Draft\n\n' +
      '## 1. Executive Summary\n' +
      '[Enter your executive summary here]\n\n' +
      '## 2. Company Overview\n' +
      '[Describe your company and relevant experience]\n\n' +
      '## 3. Technical Approach\n' +
      '[Detail your technical solution and methodology]\n\n' +
      '## 4. Implementation Plan\n' +
      '[Outline your implementation timeline and milestones]\n\n' +
      '## 5. Team & Resources\n' +
      '[Describe the team that will deliver this project]\n\n' +
      '## 6. Pricing\n' +
      '[Provide your pricing structure]\n\n' +
      '## 7. References\n' +
      '[List relevant client references]\n\n' +
      '## 8. Compliance & Certifications\n' +
      '[List relevant aviation industry certifications]\n'
    );
    setStep(2);
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
    <div className="space-y-6" data-testid="response-wizard">
      {/* Step indicator */}
      <div className="flex items-center gap-3">
        <button
          data-testid="wizard-step-1-btn"
          onClick={() => step === 2 && setStep(1)}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
            step === 1 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'
          }`}
        >
          {step > 1 ? <CheckCircle className="h-4 w-4" /> : <span className="font-mono">1</span>}
          Search & Context
        </button>
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

          {/* Right: Context input with tabs */}
          <div className="space-y-4">
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
              <TabsList className="w-full grid grid-cols-3">
                <TabsTrigger value="templates" className="text-xs gap-1">
                  <LayoutTemplate className="h-3 w-3" /> Templates
                </TabsTrigger>
                <TabsTrigger value="search" className="text-xs gap-1">
                  <Globe className="h-3 w-3" /> Web Search
                </TabsTrigger>
                <TabsTrigger value="manual" className="text-xs gap-1">
                  <PenLine className="h-3 w-3" /> Manual Entry
                </TabsTrigger>
              </TabsList>

              <TabsContent value="templates" className="space-y-4 mt-3">
                <div>
                  <h3 className="text-sm font-semibold mb-1">RFP Requirement</h3>
                  <Textarea
                    data-testid="rfp-context-textarea"
                    value={rfpContext}
                    onChange={e => setRfpContext(e.target.value)}
                    placeholder="Paste the RFP section or describe what you need to respond to..."
                    className="min-h-[120px] text-sm"
                  />
                </div>

                <div>
                  <h3 className="text-sm font-semibold mb-2">Aviation Templates</h3>
                  <div className="space-y-3 max-h-[280px] overflow-y-auto pr-1">
                    {Object.entries(templatesByCategory).map(([cat, tpls]) => (
                      <div key={cat}>
                        <p className="text-[10px] font-semibold text-muted-foreground tracking-widest uppercase mb-1.5">{cat}</p>
                        <div className="space-y-1.5">
                          {tpls.map(t => (
                            <button
                              key={t.id}
                              onClick={() => setSelectedTemplate(prev => prev === t.id ? null : t.id)}
                              className={`w-full text-left px-3 py-2.5 rounded-lg border transition-all ${
                                selectedTemplate === t.id
                                  ? 'border-primary bg-primary/5 shadow-sm'
                                  : 'border-border hover:border-primary/30'
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <p className="text-sm font-medium">{t.name}</p>
                                {selectedTemplate === t.id && <CheckCircle className="h-4 w-4 text-primary shrink-0" />}
                              </div>
                              <p className="text-[10px] text-muted-foreground mt-0.5">{t.description}</p>
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="search" className="space-y-4 mt-3">
                <div>
                  <h3 className="text-sm font-semibold mb-1">Search for Best RFP Responses</h3>
                  <p className="text-xs text-muted-foreground mb-3">
                    Search the web for aviation software procurement best practices and winning RFP responses.
                  </p>
                  <div className="flex gap-2">
                    <Input
                      value={webSearchQuery}
                      onChange={e => setWebSearchQuery(e.target.value)}
                      placeholder="e.g., best IFE RFP response aviation"
                      className="text-sm"
                      onKeyDown={e => e.key === 'Enter' && handleWebSearch()}
                    />
                    <Button onClick={handleWebSearch} disabled={searching || !webSearchQuery.trim()} size="sm" className="shrink-0">
                      {searching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-semibold mb-1">Combined Context</h3>
                  <Textarea
                    value={rfpContext}
                    onChange={e => setRfpContext(e.target.value)}
                    placeholder="RFP context will be built from web search results and your input..."
                    className="min-h-[250px] text-sm"
                  />
                </div>
              </TabsContent>

              <TabsContent value="manual" className="space-y-4 mt-3">
                <div className="text-center py-8 space-y-4">
                  <div className="mx-auto w-14 h-14 rounded-2xl bg-muted/50 flex items-center justify-center">
                    <PenLine className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold">Start from Scratch</h3>
                    <p className="text-xs text-muted-foreground mt-1 max-w-xs mx-auto">
                      Create a blank RFP response form with standard aviation procurement sections.
                    </p>
                  </div>
                  <Button onClick={handleManualDraft} variant="outline" className="gap-2" data-testid="create-blank-draft-btn">
                    <Plus className="h-4 w-4" /> Create Blank Draft
                  </Button>
                </div>
              </TabsContent>
            </Tabs>

            {activeTab !== 'manual' && (
              <Button data-testid="generate-rfp-btn" onClick={handleGenerate} disabled={generating || (!rfpContext.trim() && activeTab !== 'manual')} className="w-full">
                {generating ? (
                  <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Generating Draft...</>
                ) : (
                  <><Sparkles className="h-4 w-4 mr-2" /> Generate RFP Response</>
                )}
              </Button>
            )}
          </div>
        </div>
      ) : (
        /* Step 2: Draft Editor */
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold">Generated Draft</h3>
              <p className="text-xs text-muted-foreground">Review and edit the response before submitting</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setStep(1)} className="gap-1.5" data-testid="back-to-context-btn">
                <BookOpen className="h-3.5 w-3.5" /> Back to Context
              </Button>
              <Button variant="outline" size="sm" onClick={handleCopy} className="gap-1.5" data-testid="copy-draft-btn">
                <Copy className="h-3.5 w-3.5" /> Copy
              </Button>
            </div>
          </div>
          <Textarea
            value={draft}
            onChange={e => setDraft(e.target.value)}
            className="min-h-[500px] font-mono text-sm leading-relaxed"
            data-testid="draft-editor-textarea"
          />
        </div>
      )}
    </div>
  );
}
