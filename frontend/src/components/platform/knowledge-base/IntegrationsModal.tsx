import React, { useState, useEffect, useCallback } from 'react';
import {
  Link2, Check, X, Loader2, Cloud, HardDrive, FileSpreadsheet,
  ChevronRight, Download, AlertCircle, Plug,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetTrigger,
} from '@/components/ui/sheet';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const API = import.meta.env.REACT_APP_BACKEND_URL || '';

interface Integration {
  id: string;
  provider: string;
  name: string;
  status: string;
  connected_at: string | null;
  account_email: string | null;
}

interface ProviderFile {
  id: string;
  name: string;
  size_mb: number;
  mime_type: string;
  last_modified: string | null;
  provider: string;
}

const providerIcons: Record<string, React.ElementType> = {
  sharepoint: Cloud,
  onedrive: HardDrive,
  gdocs: FileSpreadsheet,
};

const providerColors: Record<string, string> = {
  sharepoint: 'from-blue-500/10 to-blue-600/5 text-blue-600',
  onedrive: 'from-sky-500/10 to-sky-600/5 text-sky-600',
  gdocs: 'from-green-500/10 to-green-600/5 text-green-600',
};

export default function IntegrationsModal() {
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [loading, setLoading] = useState(false);
  const [connecting, setConnecting] = useState<string | null>(null);
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);
  const [providerFiles, setProviderFiles] = useState<ProviderFile[]>([]);
  const [loadingFiles, setLoadingFiles] = useState(false);
  const [syncing, setSyncing] = useState<string | null>(null);

  const { toast } = useToast();

  const getAuthHeaders = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.access_token) return null;
    return { 'Authorization': `Bearer ${session.access_token}`, 'Content-Type': 'application/json' };
  };

  const fetchIntegrations = useCallback(async () => {
    setLoading(true);
    const headers = await getAuthHeaders();
    if (!headers) { setLoading(false); return; }
    try {
      const res = await fetch(`${API}/api/integrations`, { headers });
      if (res.ok) setIntegrations(await res.json());
    } catch { /* non-critical */ }
    setLoading(false);
  }, []);

  const handleConnect = async (provider: string) => {
    setConnecting(provider);
    const headers = await getAuthHeaders();
    if (!headers) { setConnecting(null); return; }
    try {
      const res = await fetch(`${API}/api/integrations/${provider}/connect`, {
        method: 'POST', headers,
        body: JSON.stringify({ provider }),
      });
      if (res.ok) {
        toast({ title: `${provider} connected`, description: 'You can now browse and sync files.' });
        fetchIntegrations();
      } else {
        const data = await res.json();
        toast({ title: 'Connection failed', description: data.detail, variant: 'destructive' });
      }
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    }
    setConnecting(null);
  };

  const handleDisconnect = async (provider: string) => {
    const headers = await getAuthHeaders();
    if (!headers) return;
    try {
      await fetch(`${API}/api/integrations/${provider}/disconnect`, { method: 'DELETE', headers });
      toast({ title: `${provider} disconnected` });
      setSelectedProvider(null);
      fetchIntegrations();
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    }
  };

  const handleBrowseFiles = async (provider: string) => {
    setSelectedProvider(provider);
    setLoadingFiles(true);
    const headers = await getAuthHeaders();
    if (!headers) { setLoadingFiles(false); return; }
    try {
      const res = await fetch(`${API}/api/integrations/${provider}/files`, { headers });
      if (res.ok) setProviderFiles(await res.json());
      else {
        const data = await res.json();
        toast({ title: 'Error', description: data.detail, variant: 'destructive' });
        setProviderFiles([]);
      }
    } catch { setProviderFiles([]); }
    setLoadingFiles(false);
  };

  const handleSyncFile = async (file: ProviderFile) => {
    setSyncing(file.id);
    const headers = await getAuthHeaders();
    if (!headers) { setSyncing(null); return; }
    try {
      const res = await fetch(`${API}/api/integrations/${file.provider}/sync/${file.id}`, {
        method: 'POST', headers,
      });
      const data = await res.json();
      toast({ title: 'File synced', description: data.message || `'${file.name}' synced to KB` });
    } catch (err: any) {
      toast({ title: 'Sync failed', description: err.message, variant: 'destructive' });
    }
    setSyncing(null);
  };

  return (
    <Sheet onOpenChange={(open) => { if (open) fetchIntegrations(); else setSelectedProvider(null); }}>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1.5 text-xs" data-testid="sync-integrations-btn">
          <Link2 className="h-3.5 w-3.5" /> Sync from Integrations
        </Button>
      </SheetTrigger>
      <SheetContent className="w-[420px] sm:w-[480px]" aria-describedby="integrations-desc">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Plug className="h-5 w-5" /> External Integrations
          </SheetTitle>
          <SheetDescription id="integrations-desc">
            Connect your document storage providers to sync files into your Knowledge Base.
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-3">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : integrations.length === 0 && !selectedProvider ? (
            <div className="text-center py-12 space-y-2">
              <Link2 className="mx-auto h-8 w-8 text-muted-foreground/20" />
              <p className="text-sm text-muted-foreground">Sign in to manage integrations</p>
              <p className="text-xs text-muted-foreground/60">Authentication is required to connect external providers.</p>
            </div>
          ) : selectedProvider ? (
            /* File browser view */
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Button variant="ghost" size="sm" onClick={() => setSelectedProvider(null)} className="gap-1 text-xs">
                  <ChevronRight className="h-3 w-3 rotate-180" /> Back
                </Button>
                <Badge variant="secondary" className="text-xs capitalize">{selectedProvider}</Badge>
              </div>
              {loadingFiles ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
              ) : providerFiles.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">No files found</p>
              ) : (
                <div className="space-y-1.5 max-h-[400px] overflow-y-auto">
                  {providerFiles.map(file => (
                    <div key={file.id} className="flex items-center gap-3 px-3 py-2.5 rounded-lg border border-border hover:bg-muted/30 transition-colors group" data-testid={`provider-file-${file.id}`}>
                      <FileSpreadsheet className="h-4 w-4 text-muted-foreground shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{file.name}</p>
                        <p className="text-[10px] text-muted-foreground">{file.size_mb} MB &middot; {file.last_modified}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 shrink-0"
                        onClick={() => handleSyncFile(file)}
                        disabled={syncing === file.id}
                        data-testid={`sync-file-btn-${file.id}`}
                      >
                        {syncing === file.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />}
                      </Button>
                    </div>
                  ))}
                </div>
              )}
              <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800">
                <AlertCircle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                <p className="text-[11px] text-amber-700 dark:text-amber-400">
                  File sync is a preview. Actual download requires provider API keys to be configured.
                </p>
              </div>
            </div>
          ) : (
            /* Provider list */
            integrations.map(integration => {
              const Icon = providerIcons[integration.provider] || Cloud;
              const colors = providerColors[integration.provider] || '';
              const isConnected = integration.status === 'connected';

              return (
                <div key={integration.provider} className="border border-border rounded-xl p-4 space-y-3" data-testid={`integration-card-${integration.provider}`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${colors} flex items-center justify-center`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold">{integration.name}</p>
                      {isConnected ? (
                        <p className="text-[10px] text-muted-foreground">
                          Connected as {integration.account_email}
                        </p>
                      ) : (
                        <p className="text-[10px] text-muted-foreground">Not connected</p>
                      )}
                    </div>
                    <Badge variant={isConnected ? 'default' : 'secondary'} className="text-[10px] h-5 capitalize">
                      {isConnected ? <><Check className="h-2.5 w-2.5 mr-0.5" /> Connected</> : 'Disconnected'}
                    </Badge>
                  </div>
                  <div className="flex gap-2">
                    {isConnected ? (
                      <>
                        <Button variant="outline" size="sm" className="flex-1 text-xs gap-1" onClick={() => handleBrowseFiles(integration.provider)} data-testid={`browse-files-${integration.provider}`}>
                          <FileSpreadsheet className="h-3 w-3" /> Browse Files
                        </Button>
                        <Button variant="ghost" size="sm" className="text-xs text-destructive" onClick={() => handleDisconnect(integration.provider)} data-testid={`disconnect-${integration.provider}`}>
                          <X className="h-3 w-3 mr-1" /> Disconnect
                        </Button>
                      </>
                    ) : (
                      <Button variant="outline" size="sm" className="flex-1 text-xs gap-1" onClick={() => handleConnect(integration.provider)} disabled={connecting === integration.provider} data-testid={`connect-${integration.provider}`}>
                        {connecting === integration.provider ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <Link2 className="h-3 w-3 mr-1" />}
                        Connect {integration.name}
                      </Button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
