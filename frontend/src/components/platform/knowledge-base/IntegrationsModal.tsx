import React, { useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  CloudUpload, HardDrive, Globe, FileSpreadsheet, Link2,
  ExternalLink, FileText, AlertCircle,
} from 'lucide-react';

const integrations = [
  {
    id: 'local',
    name: 'Local Upload',
    icon: HardDrive,
    status: 'active' as const,
    description: 'Upload files directly from your computer',
  },
  {
    id: 'sharepoint',
    name: 'SharePoint',
    icon: Globe,
    status: 'setup_required' as const,
    description: 'Connect to Microsoft SharePoint document libraries',
  },
  {
    id: 'onedrive',
    name: 'OneDrive',
    icon: CloudUpload,
    status: 'setup_required' as const,
    description: 'Import files from Microsoft OneDrive',
  },
  {
    id: 'gdocs',
    name: 'Google Docs',
    icon: FileSpreadsheet,
    status: 'setup_required' as const,
    description: 'Connect to Google Drive and Docs',
  },
];

const mockFiles = [
  { id: '1', name: 'RFP_Template_2025.docx', size: '2.4 MB', type: 'docx' },
  { id: '2', name: 'Vendor_Compliance_Matrix.xlsx', size: '1.1 MB', type: 'xlsx' },
  { id: '3', name: 'Technical_Specifications.pdf', size: '5.7 MB', type: 'pdf' },
];

export default function IntegrationsModal() {
  const [selectedTab, setSelectedTab] = useState('local');

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1.5 text-xs">
          <Link2 className="h-3.5 w-3.5" /> Sync from Integrations
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-full sm:max-w-lg">
        <SheetHeader>
          <SheetTitle className="text-base">External Integrations</SheetTitle>
        </SheetHeader>

        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="mt-4">
          <TabsList className="w-full grid grid-cols-4">
            {integrations.map(int => (
              <TabsTrigger key={int.id} value={int.id} className="text-xs gap-1">
                <int.icon className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">{int.name.split(' ')[0]}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          {integrations.map(int => (
            <TabsContent key={int.id} value={int.id} className="mt-4 space-y-4">
              <div className="flex items-start gap-3 p-4 rounded-lg border border-border bg-muted/30">
                <div className="h-10 w-10 rounded-lg bg-background flex items-center justify-center shrink-0">
                  <int.icon className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-sm">{int.name}</h4>
                    <Badge variant={int.status === 'active' ? 'default' : 'secondary'} className="text-[10px] h-5">
                      {int.status === 'active' ? 'Active' : 'Setup Required'}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{int.description}</p>
                </div>
              </div>

              {int.id === 'local' ? (
                <div className="text-center py-6">
                  <p className="text-sm text-muted-foreground">
                    Use the drag-and-drop upload zone in the Knowledge Base to upload local files.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 p-3 rounded-lg border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/30">
                    <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0" />
                    <p className="text-xs text-amber-700 dark:text-amber-300">
                      OAuth configuration required. Contact your admin to set up {int.name} integration.
                    </p>
                  </div>

                  <div className="space-y-1">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Preview — Files Available</p>
                    {mockFiles.map(file => (
                      <div key={file.id} className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-muted/50">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm truncate">{file.name}</p>
                          <p className="text-[10px] text-muted-foreground">{file.size}</p>
                        </div>
                        <Button variant="ghost" size="sm" className="h-7 text-xs" disabled>
                          <ExternalLink className="h-3 w-3 mr-1" /> Sync
                        </Button>
                      </div>
                    ))}
                  </div>

                  <Button className="w-full" variant="outline" disabled>
                    <Link2 className="h-4 w-4 mr-2" /> Connect {int.name}
                  </Button>
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}
