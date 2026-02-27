import React, { useState } from 'react';
import PlatformLayout from '@/components/platform/PlatformLayout';
import FolderExplorer from '@/components/platform/knowledge-base/FolderExplorer';
import FileUploadZone from '@/components/platform/knowledge-base/FileUploadZone';
import IntegrationsModal from '@/components/platform/knowledge-base/IntegrationsModal';
import ContextualChat from '@/components/platform/ai-chat/ContextualChat';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BookOpen, MessageSquare } from 'lucide-react';

export default function KnowledgeBasePage() {
  const [selectedDocs, setSelectedDocs] = useState<{ id: string; name: string }[]>([]);
  const [activeFolderId, setActiveFolderId] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const selectedDocIds = selectedDocs.map(d => d.id);
  const selectedDocNames = selectedDocs.map(d => d.name);

  const handleDocSelect = (docId: string, docName: string, selected: boolean) => {
    setSelectedDocs(prev =>
      selected
        ? [...prev, { id: docId, name: docName }]
        : prev.filter(d => d.id !== docId)
    );
  };

  const handleDeselectDoc = (docId: string) => {
    setSelectedDocs(prev => prev.filter(d => d.id !== docId));
  };

  return (
    <PlatformLayout title="Knowledge Base" subtitle="Manage documents and query with AI">
      <Tabs defaultValue="explorer" className="space-y-4" data-testid="kb-tabs">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="explorer" className="gap-1.5 text-xs" data-testid="kb-tab-explorer">
              <BookOpen className="h-3.5 w-3.5" /> Explorer
            </TabsTrigger>
            <TabsTrigger value="chat" className="gap-1.5 text-xs" data-testid="kb-tab-chat">
              <MessageSquare className="h-3.5 w-3.5" /> AI Chat
            </TabsTrigger>
          </TabsList>
          <IntegrationsModal />
        </div>

        <TabsContent value="explorer" className="space-y-4" data-testid="kb-explorer-tab">
          <div className="h-[480px]">
            <FolderExplorer
              key={refreshKey}
              selectedDocIds={selectedDocIds}
              onDocumentSelect={handleDocSelect}
              onFolderChange={setActiveFolderId}
              selectionMode={false}
            />
          </div>
          <FileUploadZone
            folderId={activeFolderId}
            onUploadComplete={() => setRefreshKey(k => k + 1)}
          />
          <div className="flex items-center justify-between text-[10px] text-muted-foreground px-1">
            <span>Max 20 documents per user &middot; 100 per organization</span>
            <span>Max file size: 20 MB</span>
          </div>
        </TabsContent>

        <TabsContent value="chat" data-testid="kb-chat-tab">
          <div className="grid lg:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold">Select Documents</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">Choose documents from your KB to provide context</p>
                </div>
                {selectedDocIds.length > 0 && (
                  <span className="text-xs font-medium text-primary" data-testid="selected-docs-count">
                    {selectedDocIds.length} selected
                  </span>
                )}
              </div>
              <div className="h-[560px]">
                <FolderExplorer
                  selectedDocIds={selectedDocIds}
                  onDocumentSelect={handleDocSelect}
                  selectionMode
                />
              </div>
            </div>
            <div className="h-[600px]">
              <ContextualChat
                selectedDocIds={selectedDocIds}
                selectedDocNames={selectedDocNames}
                onDeselectDoc={handleDeselectDoc}
              />
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </PlatformLayout>
  );
}
