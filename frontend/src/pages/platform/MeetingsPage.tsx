import React from 'react';
import PlatformLayout from '@/components/platform/PlatformLayout';
import { Calendar, Plus, Video, Clock, Users, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const meetings = [
  {
    id: '1',
    title: 'IFE Vendor Technical Review',
    date: 'Today, 3:00 PM',
    participants: 4,
    type: 'video',
    status: 'upcoming',
  },
  {
    id: '2',
    title: 'MRO Proposal Q&A Session',
    date: 'Tomorrow, 10:00 AM',
    participants: 6,
    type: 'video',
    status: 'upcoming',
  },
  {
    id: '3',
    title: 'Catering RFP Evaluation Committee',
    date: 'Mar 1, 2:00 PM',
    participants: 8,
    type: 'in-person',
    status: 'scheduled',
  },
];

export default function MeetingsPage() {
  return (
    <PlatformLayout title="Meetings" subtitle="Schedule and track procurement meetings">
      <div className="flex items-center justify-between mb-6">
        <p className="text-sm text-muted-foreground">Manage meetings with vendors, stakeholders, and evaluation committees.</p>
        <Button size="sm" className="gap-1.5">
          <Plus className="h-3.5 w-3.5" /> Schedule Meeting
        </Button>
      </div>

      <div className="space-y-3">
        {meetings.map(m => (
          <div key={m.id} className="enterprise-card p-5 flex items-center gap-4">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              {m.type === 'video' ? (
                <Video className="h-5 w-5 text-primary" />
              ) : (
                <MapPin className="h-5 w-5 text-primary" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-sm">{m.title}</h3>
              <div className="flex items-center gap-3 mt-1">
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" /> {m.date}
                </span>
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Users className="h-3 w-3" /> {m.participants} participants
                </span>
              </div>
            </div>
            <Badge variant={m.status === 'upcoming' ? 'default' : 'secondary'} className="text-[10px] h-5 capitalize">
              {m.status}
            </Badge>
          </div>
        ))}
      </div>
    </PlatformLayout>
  );
}
