import React from 'react';
import { Users, Eye, PenLine } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface Editor {
  user_id: string;
  name: string;
  email: string;
  action: string;
}

interface DraftPresenceProps {
  editors: Editor[];
  currentUserId?: string;
}

export default function DraftPresence({ editors, currentUserId }: DraftPresenceProps) {
  const otherEditors = editors.filter(e => e.user_id !== currentUserId);

  if (otherEditors.length === 0) return null;

  return (
    <div className="flex items-center gap-2" data-testid="draft-presence">
      <Users className="h-3.5 w-3.5 text-muted-foreground" />
      <div className="flex -space-x-2">
        {otherEditors.slice(0, 4).map(editor => (
          <Avatar key={editor.user_id} className="h-6 w-6 border-2 border-background">
            <AvatarFallback className="text-[9px] font-semibold bg-primary/10 text-primary">
              {editor.name.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        ))}
      </div>
      <span className="text-[10px] text-muted-foreground">
        {otherEditors.length === 1
          ? `${otherEditors[0].name} is ${otherEditors[0].action}`
          : `${otherEditors.length} people ${otherEditors[0]?.action || 'viewing'}`}
      </span>
      {otherEditors.some(e => e.action === 'editing') && (
        <Badge variant="secondary" className="text-[9px] h-4 gap-1 px-1.5">
          <PenLine className="h-2.5 w-2.5" /> Live editing
        </Badge>
      )}
    </div>
  );
}
