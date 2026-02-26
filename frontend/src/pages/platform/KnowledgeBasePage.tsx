import React, { useState } from 'react';
import PlatformLayout from '@/components/platform/PlatformLayout';
import FolderExplorer from '@/components/platform/knowledge-base/FolderExplorer';
import FileUploadZone from '@/components/platform/knowledge-base/FileUploadZone';
import IntegrationsModal from '@/components/platform/knowledge-base/IntegrationsModal';
import ContextualChat from '@/components/platform/ai-chat/ContextualChat';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BookOpen, MessageSquare } from 'lucide-react';

export default function KnowledgeBasePage() {
  const [selectedDocIds, setSelectedDocIds] = useState<string[]>([]);
  const [selectedDocNames, setSelectedDocNames] = useState<string[]>([]);
  const [activeFolderId, setActiveFolderId] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleDocSelect = (docId: string, selected: boolean) => {
    setSelectedDocIds(prev =>
      selected ? [...prev, docId] : prev.filter(id => id !== docId)
    );
  };

  const handleDeselectDoc = (docId: string) => {
    setSelectedDocIds(prev => prev.filter(id => id !== docId));
    setSelectedDocNames(prev => {
      const idx = selectedDocIds.indexOf(docId);
      return prev.filter((_, i) => i !== idx);
    });
  };

  return (
    <PlatformLayout title="Knowledge Base" subtitle="Manage documents and query with AI">
      <Tabs defaultValue="explorer" className="space-y-4">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="explorer" className="gap-1.5 text-xs">
              <BookOpen className="h-3.5 w-3.5" /> Explorer
            </TabsTrigger>
            <TabsTrigger value="chat" className="gap-1.5 text-xs">
              <MessageSquare className="h-3.5 w-3.5" /> AI Chat
            </TabsTrigger>
          </TabsList>
          <IntegrationsModal />
        </div>

        <TabsContent value="explorer" className="space-y-4">
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

        <TabsContent value="chat">
          <div className="grid lg:grid-cols-2 gap-4">
            <div className="h-[600px]">
              <FolderExplorer
                selectedDocIds={selectedDocIds}
                onDocumentSelect={handleDocSelect}
                selectionMode
              />
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
