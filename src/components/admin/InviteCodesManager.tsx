import { useState } from 'react';
import {
  Loader2, RefreshCw, Users, Calendar, Check, X, Trash2, Plus
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { InviteCode } from '@/types/admin';

interface InviteCodesManagerProps {
  inviteCodes: InviteCode[];
  loadingData: boolean;
  onUpdate: () => void;
  userId: string | undefined;
}

export const InviteCodesManager = ({ inviteCodes, loadingData, onUpdate, userId }: InviteCodesManagerProps) => {
  const { toast } = useToast();
  const [newCode, setNewCode] = useState('');
  const [newCodeRole, setNewCodeRole] = useState<'airline' | 'consultant'>('airline');
  const [newCodeMaxUses, setNewCodeMaxUses] = useState('100');
  const [newCodeExpires, setNewCodeExpires] = useState('');
  const [creatingCode, setCreatingCode] = useState(false);

  const generateCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setNewCode(code);
  };

  const createInviteCode = async () => {
    if (!newCode.trim()) {
      toast({ title: 'Error', description: 'Please enter a code', variant: 'destructive' });
      return;
    }

    setCreatingCode(true);
    try {
      const { error } = await supabase.from('invite_codes').insert({
        code: newCode.toUpperCase().trim(),
        role: newCodeRole,
        max_uses: newCodeMaxUses ? parseInt(newCodeMaxUses) : null,
        expires_at: newCodeExpires || null,
        created_by: userId
      });

      if (error) throw error;

      toast({ title: 'Success', description: 'Invite code created' });
      setNewCode('');
      setNewCodeMaxUses('100');
      setNewCodeExpires('');
      onUpdate();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      toast({
        title: 'Error',
        description: message.includes('duplicate') ? 'Code already exists' : 'Failed to create code',
        variant: 'destructive'
      });
    } finally {
      setCreatingCode(false);
    }
  };

  const toggleCodeStatus = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('invite_codes')
        .update({ is_active: !currentStatus })
        .eq('id', id);

      if (error) throw error;
      onUpdate();
    } catch (_error) {
      toast({ title: 'Error', description: 'Failed to update code', variant: 'destructive' });
    }
  };

  const deleteInviteCode = async (id: string) => {
    try {
      const { error } = await supabase.from('invite_codes').delete().eq('id', id);
      if (error) throw error;
      toast({ title: 'Deleted', description: 'Invite code removed' });
      onUpdate();
    } catch (_error) {
      toast({ title: 'Error', description: 'Failed to delete code', variant: 'destructive' });
    }
  };

  return (
    <div className="space-y-6">
      {/* Create New Code */}
      <div className="p-6 rounded-xl border border-border bg-card">
        <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Create New Invite Code
        </h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="space-y-2">
            <Label>Code</Label>
            <div className="flex gap-2">
              <Input
                value={newCode}
                onChange={(e) => setNewCode(e.target.value.toUpperCase())}
                placeholder="INVITE123"
              />
              <Button variant="outline" size="icon" onClick={generateCode} title="Generate">
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Role</Label>
            <Select value={newCodeRole} onValueChange={(v: 'airline' | 'consultant') => setNewCodeRole(v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="airline">Airline</SelectItem>
                <SelectItem value="consultant">Consultant</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Max Uses</Label>
            <Input
              type="number"
              value={newCodeMaxUses}
              onChange={(e) => setNewCodeMaxUses(e.target.value)}
              placeholder="100"
            />
          </div>
          <div className="space-y-2">
            <Label>Expires (Optional)</Label>
            <Input
              type="date"
              value={newCodeExpires}
              onChange={(e) => setNewCodeExpires(e.target.value)}
            />
          </div>
          <div className="flex items-end">
            <Button onClick={createInviteCode} disabled={creatingCode} className="w-full">
              {creatingCode ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Create'}
            </Button>
          </div>
        </div>
      </div>

      {/* Codes Table */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Code</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Usage</TableHead>
              <TableHead>Expires</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loadingData ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                </TableCell>
              </TableRow>
            ) : inviteCodes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  No invite codes yet
                </TableCell>
              </TableRow>
            ) : (
              inviteCodes.map((code) => (
                <TableRow key={code.id}>
                  <TableCell className="font-mono font-medium">{code.code}</TableCell>
                  <TableCell className="capitalize">{code.role}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {code.current_uses}/{code.max_uses || '∞'}
                    </div>
                  </TableCell>
                  <TableCell>
                    {code.expires_at ? (
                      <div className="flex items-center gap-1 text-sm">
                        <Calendar className="h-3 w-3" />
                        {new Date(code.expires_at).toLocaleDateString()}
                      </div>
                    ) : (
                      <span className="text-muted-foreground">Never</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <button
                      onClick={() => toggleCodeStatus(code.id, code.is_active)}
                      className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                        code.is_active
                          ? 'bg-success/10 text-success'
                          : 'bg-destructive/10 text-destructive'
                      }`}
                    >
                      {code.is_active ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                      {code.is_active ? 'Active' : 'Inactive'}
                    </button>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteInviteCode(code.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
