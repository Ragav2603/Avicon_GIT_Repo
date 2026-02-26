import React, { useCallback, useState } from 'react';
import { Upload, FileUp, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const API = import.meta.env.REACT_APP_BACKEND_URL || '';
const MAX_SIZE = 20 * 1024 * 1024;

interface FileUploadZoneProps {
  folderId: string | null;
  onUploadComplete: () => void;
}

export default function FileUploadZone({ folderId, onUploadComplete }: FileUploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const { toast } = useToast();

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') setIsDragging(true);
    else if (e.type === 'dragleave') setIsDragging(false);
  }, []);

  const uploadFile = async (file: File) => {
    if (!folderId) {
      toast({ title: 'Select a folder', description: 'Please select or create a folder first.', variant: 'destructive' });
      return;
    }

    if (file.size > MAX_SIZE) {
      toast({ title: 'File too large', description: 'Maximum file size is 20MB.', variant: 'destructive' });
      return;
    }

    setUploading(true);
    setUploadStatus('idle');

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) throw new Error('Not authenticated');

      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch(`${API}/api/kb/folders/${folderId}/upload`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${session.access_token}` },
        body: formData,
      });

      if (res.ok) {
        setUploadStatus('success');
        toast({ title: 'Upload complete', description: `"${file.name}" uploaded successfully.` });
        onUploadComplete();
      } else {
        const err = await res.json();
        throw new Error(err.detail || 'Upload failed');
      }
    } catch (err: any) {
      setUploadStatus('error');
      toast({ title: 'Upload failed', description: err.message, variant: 'destructive' });
    } finally {
      setUploading(false);
      setTimeout(() => setUploadStatus('idle'), 3000);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) uploadFile(file);
  }, [folderId]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) uploadFile(file);
    e.target.value = '';
  };

  return (
    <div
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
      className={`relative rounded-xl border-2 border-dashed p-8 text-center transition-all ${
        isDragging
          ? 'border-primary bg-primary/5 scale-[1.01]'
          : uploadStatus === 'success'
          ? 'border-emerald-500/50 bg-emerald-50/50 dark:bg-emerald-950/20'
          : uploadStatus === 'error'
          ? 'border-destructive/50 bg-destructive/5'
          : 'border-border hover:border-primary/30 hover:bg-muted/30'
      }`}
    >
      {uploading ? (
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 text-primary animate-spin" />
          <p className="text-sm font-medium text-foreground">Uploading...</p>
        </div>
      ) : uploadStatus === 'success' ? (
        <div className="flex flex-col items-center gap-3">
          <CheckCircle className="h-8 w-8 text-emerald-500" />
          <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">Upload complete</p>
        </div>
      ) : uploadStatus === 'error' ? (
        <div className="flex flex-col items-center gap-3">
          <AlertCircle className="h-8 w-8 text-destructive" />
          <p className="text-sm font-medium text-destructive">Upload failed. Try again.</p>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-3">
          <div className="h-12 w-12 rounded-xl bg-muted/50 flex items-center justify-center">
            <FileUp className="h-5 w-5 text-muted-foreground" />
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">Drop files here</p>
            <p className="text-xs text-muted-foreground mt-1">PDF, DOCX, XLSX, CSV, TXT up to 20MB</p>
          </div>
          <label>
            <input
              type="file"
              className="hidden"
              accept=".pdf,.docx,.xlsx,.pptx,.csv,.txt,.md,.doc,.xls"
              onChange={handleFileSelect}
              disabled={!folderId}
            />
            <Button variant="outline" size="sm" className="text-xs" asChild disabled={!folderId}>
              <span><Upload className="h-3.5 w-3.5 mr-1.5" /> Browse Files</span>
            </Button>
          </label>
        </div>
      )}
    </div>
  );
}
