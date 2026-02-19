import { useState } from 'react';
import {
  Loader2, Check, X, Trash2, Plus
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
import { ApprovedDomain } from '@/types/admin';

interface ApprovedDomainsManagerProps {
  domains: ApprovedDomain[];
  loadingData: boolean;
  onUpdate: () => void;
  userId: string | undefined;
}

export const ApprovedDomainsManager = ({ domains, loadingData, onUpdate, userId }: ApprovedDomainsManagerProps) => {
  const { toast } = useToast();
  const [newDomain, setNewDomain] = useState('');
  const [newDomainRole, setNewDomainRole] = useState<'airline' | 'consultant'>('airline');
  const [newDomainDesc, setNewDomainDesc] = useState('');
  const [creatingDomain, setCreatingDomain] = useState(false);

  const createDomain = async () => {
    if (!newDomain.trim()) {
      toast({ title: 'Error', description: 'Please enter a domain', variant: 'destructive' });
      return;
    }

    setCreatingDomain(true);
    try {
      const { error } = await supabase.from('approved_domains').insert({
        domain: newDomain.toLowerCase().trim(),
        role: newDomainRole,
        description: newDomainDesc || null,
        created_by: userId
      });

      if (error) throw error;

      toast({ title: 'Success', description: 'Domain added' });
      setNewDomain('');
      setNewDomainDesc('');
      onUpdate();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      toast({
        title: 'Error',
        description: message.includes('duplicate') ? 'Domain already exists' : 'Failed to add domain',
        variant: 'destructive'
      });
    } finally {
      setCreatingDomain(false);
    }
  };

  const toggleDomainStatus = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('approved_domains')
        .update({ is_active: !currentStatus })
        .eq('id', id);

      if (error) throw error;
      onUpdate();
    } catch (_error) {
      toast({ title: 'Error', description: 'Failed to update domain', variant: 'destructive' });
    }
  };

  const deleteDomain = async (id: string) => {
    try {
      const { error } = await supabase.from('approved_domains').delete().eq('id', id);
      if (error) throw error;
      toast({ title: 'Deleted', description: 'Domain removed' });
      onUpdate();
    } catch (_error) {
      toast({ title: 'Error', description: 'Failed to delete domain', variant: 'destructive' });
    }
  };

  return (
    <div className="space-y-6">
      {/* Create New Domain */}
      <div className="p-6 rounded-xl border border-border bg-card">
        <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add Approved Domain
        </h3>
        <p className="text-sm text-muted-foreground mb-4">
          Users with email addresses from approved domains can register without an invite code.
        </p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="space-y-2">
            <Label>Domain</Label>
            <Input
              value={newDomain}
              onChange={(e) => setNewDomain(e.target.value.toLowerCase())}
              placeholder="company.com"
            />
          </div>
          <div className="space-y-2">
            <Label>Role</Label>
            <Select value={newDomainRole} onValueChange={(v: 'airline' | 'consultant') => setNewDomainRole(v)}>
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
            <Label>Description</Label>
            <Input
              value={newDomainDesc}
              onChange={(e) => setNewDomainDesc(e.target.value)}
              placeholder="Company name"
            />
          </div>
          <div className="flex items-end">
            <Button onClick={createDomain} disabled={creatingDomain} className="w-full">
              {creatingDomain ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Add Domain'}
            </Button>
          </div>
        </div>
      </div>

      {/* Domains Table */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Domain</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loadingData ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                </TableCell>
              </TableRow>
            ) : domains.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  No approved domains yet
                </TableCell>
              </TableRow>
            ) : (
              domains.map((domain) => (
                <TableRow key={domain.id}>
                  <TableCell className="font-mono">{domain.domain}</TableCell>
                  <TableCell className="capitalize">{domain.role}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {domain.description || '-'}
                  </TableCell>
                  <TableCell>
                    <button
                      onClick={() => toggleDomainStatus(domain.id, domain.is_active)}
                      className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                        domain.is_active
                          ? 'bg-green-500/10 text-green-600'
                          : 'bg-red-500/10 text-red-600'
                      }`}
                    >
                      {domain.is_active ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                      {domain.is_active ? 'Active' : 'Inactive'}
                    </button>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteDomain(domain.id)}
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
