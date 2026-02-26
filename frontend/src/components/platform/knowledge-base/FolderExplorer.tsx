import React, { useState, useEffect, useCallback } from 'react';
import {
  Folder, FolderPlus, FileText, Upload, Search, MoreHorizontal,
  Trash2, Edit2, ChevronRight, File, Lock, Globe, BookOpen,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const API = import.meta.env.REACT_APP_BACKEND_URL || '';

interface KBFolder {
  id: string;
  name: string;
  is_private: boolean;
  document_count: number;
  created_at: string;
}

interface KBDocument {
  id: string;
  folder_id: string;
  name: string;
  file_size_mb: number;
  source_type: string;
  status: string;
  created_at: string;
}

interface FolderExplorerProps {
  selectedDocIds: string[];
  onDocumentSelect?: (docId: string, selected: boolean) => void;
  selectionMode?: boolean;
}

export default function FolderExplorer({ selectedDocIds, onDocumentSelect, selectionMode = false }: FolderExplorerProps) {
  const [folders, setFolders] = useState<KBFolder[]>([]);
  const [activeFolderId, setActiveFolderId] = useState<string | null>(null);
  const [documents, setDocuments] = useState<KBDocument[]>([]);
  const [loading, setLoading] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [newFolderPrivate, setNewFolderPrivate] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const { toast } = useToast();

  const getAuthHeaders = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.access_token) throw new Error('Not authenticated');
    return { 'Authorization': `Bearer ${session.access_token}` };
  };

  const fetchFolders = useCallback(async () => {
    try {
      setLoading(true);
      const headers = await getAuthHeaders();
      const res = await fetch(`${API}/api/kb/folders`, { headers });
      if (res.ok) {
        const data = await res.json();
        setFolders(data);
      }
    } catch (err) {
      console.error('Failed to fetch folders', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchFolders(); }, [fetchFolders]);

  const fetchDocuments = async (folderId: string) => {
    try {
      const headers = await getAuthHeaders();
      const res = await fetch(`${API}/api/kb/folders/${folderId}/documents`, { headers });
      if (res.ok) {
        const data = await res.json();
        setDocuments(data);
      }
    } catch (err) {
      console.error('Failed to fetch documents', err);
    }
  };

  const handleFolderClick = (folderId: string) => {
    setActiveFolderId(folderId);
    fetchDocuments(folderId);
  };

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return;
    try {
      const headers = await getAuthHeaders();
      const res = await fetch(`${API}/api/kb/folders`, {
        method: 'POST',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newFolderName.trim(), is_private: newFolderPrivate }),
      });
      if (res.ok) {
        toast({ title: 'Folder created', description: `"${newFolderName}" has been created.` });
        setNewFolderName('');
        setCreateDialogOpen(false);
        fetchFolders();
      } else {
        const err = await res.json();
        toast({ title: 'Error', description: err.detail || 'Failed to create folder', variant: 'destructive' });
      }
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    }
  };

  const handleDeleteFolder = async (folderId: string) => {
    try {
      const headers = await getAuthHeaders();
      await fetch(`${API}/api/kb/folders/${folderId}`, { method: 'DELETE', headers });
      toast({ title: 'Folder deleted' });
      if (activeFolderId === folderId) {
        setActiveFolderId(null);
        setDocuments([]);
      }
      fetchFolders();
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    }
  };

  const handleDeleteDocument = async (docId: string) => {
    try {
      const headers = await getAuthHeaders();
      await fetch(`${API}/api/kb/documents/${docId}`, { method: 'DELETE', headers });
      toast({ title: 'Document deleted' });
      if (activeFolderId) fetchDocuments(activeFolderId);
      fetchFolders();
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    }
  };

  const filteredFolders = folders.filter(f =>
    f.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeFolder = folders.find(f => f.id === activeFolderId);

  return (
    <div className="flex h-full gap-0 border border-border rounded-xl overflow-hidden bg-card">
      {/* Sidebar — Folder list */}
      <div className="w-72 shrink-0 border-r border-border flex flex-col">
        <div className="p-3 border-b border-border/50 space-y-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Search folders..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-8 h-8 text-xs"
            />
          </div>
          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="w-full h-8 text-xs gap-1.5">
                <FolderPlus className="h-3.5 w-3.5" /> New Folder
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Create Folder</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-2">
                <div className="space-y-2">
                  <Label htmlFor="folder-name">Folder Name</Label>
                  <Input
                    id="folder-name"
                    value={newFolderName}
                    onChange={e => setNewFolderName(e.target.value)}
                    placeholder="e.g., RFP Documents Q3"
                    onKeyDown={e => e.key === 'Enter' && handleCreateFolder()}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="folder-private">Private Folder</Label>
                  <Switch id="folder-private" checked={newFolderPrivate} onCheckedChange={setNewFolderPrivate} />
                </div>
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="ghost" size="sm">Cancel</Button>
                </DialogClose>
                <Button size="sm" onClick={handleCreateFolder} disabled={!newFolderName.trim()}>
                  Create
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className="flex-1 overflow-y-auto p-1.5">
          {loading ? (
            <div className="p-4 text-center text-xs text-muted-foreground">Loading...</div>
          ) : filteredFolders.length === 0 ? (
            <div className="p-6 text-center">
              <Folder className="mx-auto h-8 w-8 text-muted-foreground/30 mb-2" />
              <p className="text-xs text-muted-foreground">No folders yet</p>
            </div>
          ) : (
            filteredFolders.map(folder => (
              <button
                key={folder.id}
                onClick={() => handleFolderClick(folder.id)}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-left transition-colors group ${
                  activeFolderId === folder.id
                    ? 'bg-primary/10 text-primary'
                    : 'hover:bg-muted/50 text-foreground'
                }`}
              >
                <Folder className={`h-4 w-4 shrink-0 ${activeFolderId === folder.id ? 'text-primary' : 'text-muted-foreground'}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{folder.name}</p>
                  <p className="text-[10px] text-muted-foreground">{folder.document_count} files</p>
                </div>
                {folder.is_private ? (
                  <Lock className="h-3 w-3 text-muted-foreground/50 shrink-0" />
                ) : (
                  <Globe className="h-3 w-3 text-muted-foreground/50 shrink-0" />
                )}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <span className="opacity-0 group-hover:opacity-100 transition-opacity" onClick={e => e.stopPropagation()}>
                      <MoreHorizontal className="h-3.5 w-3.5 text-muted-foreground cursor-pointer hover:text-foreground" />
                    </span>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleDeleteFolder(folder.id)} className="text-destructive">
                      <Trash2 className="h-3.5 w-3.5 mr-2" /> Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Main — Document list */}
      <div className="flex-1 flex flex-col">
        {activeFolder ? (
          <>
            <div className="p-4 border-b border-border/50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Folder className="h-4 w-4 text-primary" />
                <h3 className="font-semibold text-sm">{activeFolder.name}</h3>
                <Badge variant="secondary" className="text-[10px] h-5">
                  {documents.length} files
                </Badge>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              {documents.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center">
                  <FileText className="h-10 w-10 text-muted-foreground/20 mb-3" />
                  <p className="text-sm text-muted-foreground">No documents in this folder</p>
                  <p className="text-xs text-muted-foreground/60 mt-1">Upload files to get started</p>
                </div>
              ) : (
                <div className="space-y-1">
                  {documents.map(doc => {
                    const isSelected = selectedDocIds.includes(doc.id);
                    return (
                      <div
                        key={doc.id}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors group ${
                          isSelected ? 'bg-primary/10 border border-primary/20' : 'hover:bg-muted/50'
                        }`}
                        onClick={() => selectionMode && onDocumentSelect?.(doc.id, !isSelected)}
                        role={selectionMode ? 'checkbox' : undefined}
                        aria-checked={selectionMode ? isSelected : undefined}
                      >
                        {selectionMode && (
                          <div className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 ${
                            isSelected ? 'bg-primary border-primary' : 'border-muted-foreground/30'
                          }`}>
                            {isSelected && <ChevronRight className="h-3 w-3 text-primary-foreground" />}
                          </div>
                        )}
                        <File className="h-4 w-4 text-muted-foreground shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{doc.name}</p>
                          <p className="text-[10px] text-muted-foreground">
                            {doc.file_size_mb} MB &middot; {doc.source_type}
                          </p>
                        </div>
                        <Badge variant="secondary" className="text-[10px] h-5 capitalize">{doc.status}</Badge>
                        {!selectionMode && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 opacity-0 group-hover:opacity-100"
                            onClick={() => handleDeleteDocument(doc.id)}
                            aria-label={`Delete ${doc.name}`}
                          >
                            <Trash2 className="h-3.5 w-3.5 text-destructive" />
                          </Button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="h-full flex flex-col items-center justify-center p-8">
            <BookOpen className="h-12 w-12 text-muted-foreground/15 mb-4" />
            <p className="text-sm font-medium text-muted-foreground">Select a folder</p>
            <p className="text-xs text-muted-foreground/60 mt-1">Choose a folder from the sidebar to view its documents</p>
          </div>
        )}
      </div>
    </div>
  );
}

import { BookOpen } from 'lucide-react';
