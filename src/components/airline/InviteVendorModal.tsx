import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Mail, 
  Loader2, 
  Copy, 
  CheckCircle2, 
  Send,
  Link2,
  Plus,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface InviteVendorModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  rfpId: string;
  rfpTitle: string;
}

interface InviteResult {
  email: string;
  token: string;
  link: string;
}

const InviteVendorModal = ({ open, onOpenChange, rfpId, rfpTitle }: InviteVendorModalProps) => {
  const { toast } = useToast();
  const [emails, setEmails] = useState<string[]>(['']);
  const [sending, setSending] = useState(false);
  const [sentInvites, setSentInvites] = useState<InviteResult[]>([]);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const addEmailField = () => {
    setEmails([...emails, '']);
  };

  const removeEmailField = (index: number) => {
    if (emails.length > 1) {
      setEmails(emails.filter((_, i) => i !== index));
    }
  };

  const updateEmail = (index: number, value: string) => {
    const newEmails = [...emails];
    newEmails[index] = value;
    setEmails(newEmails);
  };

  const sendInvites = async () => {
    const validEmails = emails.filter(e => e.trim() && e.includes('@'));
    
    if (validEmails.length === 0) {
      toast({
        title: 'No Valid Emails',
        description: 'Please enter at least one valid email address.',
        variant: 'destructive',
      });
      return;
    }

    setSending(true);
    const results: InviteResult[] = [];

    // Helper function to hash token in browser
    const hashToken = async (token: string): Promise<string> => {
      const encoder = new TextEncoder();
      const data = encoder.encode(token);
      const hashBuffer = await crypto.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    };

    try {
      for (const email of validEmails) {
        // Generate token client-side
        const inviteToken = crypto.randomUUID();
        const tokenHash = await hashToken(inviteToken);

        // Create vendor invite with pre-computed hash
        const { data: invite, error } = await supabase
          .from('vendor_invites')
          .insert({
            rfp_id: rfpId,
            vendor_email: email.toLowerCase().trim(),
            invite_token: inviteToken,
            invite_token_hash: tokenHash,
          })
          .select()
          .single();

        if (error) {
          console.error('Invite error:', error);
          continue;
        }

        // Use the client-generated token for the link (shown once, never stored readable)
        const link = `${window.location.origin}/respond/${inviteToken}`;
        results.push({
          email: email.trim(),
          token: inviteToken,
          link,
        });
      }

      if (results.length > 0) {
        setSentInvites(results);
        toast({
          title: 'Invites Created',
          description: `Created ${results.length} invite link(s). Share them with vendors.`,
        });
      } else {
        toast({
          title: 'Failed',
          description: 'Could not create any invite links.',
          variant: 'destructive',
        });
      }
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message,
        variant: 'destructive',
      });
    } finally {
      setSending(false);
    }
  };

  const copyLink = async (link: string, index: number) => {
    await navigator.clipboard.writeText(link);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
    toast({
      title: 'Copied!',
      description: 'Magic link copied to clipboard.',
    });
  };

  const resetForm = () => {
    setEmails(['']);
    setSentInvites([]);
    setCopiedIndex(null);
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      if (!isOpen) resetForm();
      onOpenChange(isOpen);
    }}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-primary" />
            Invite Vendors
          </DialogTitle>
          <DialogDescription>
            Generate magic links for vendors to respond to "{rfpTitle}" without creating an account.
          </DialogDescription>
        </DialogHeader>

        {sentInvites.length === 0 ? (
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Vendor Emails</Label>
              {emails.map((email, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    type="email"
                    placeholder="vendor@company.com"
                    value={email}
                    onChange={(e) => updateEmail(index, e.target.value)}
                  />
                  {emails.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeEmailField(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addEmailField}
              className="w-full"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Another Email
            </Button>

            <Button
              onClick={sendInvites}
              disabled={sending || emails.every(e => !e.trim())}
              className="w-full"
            >
              {sending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating Links...
                </>
              ) : (
                <>
                  <Link2 className="h-4 w-4 mr-2" />
                  Generate Magic Links
                </>
              )}
            </Button>
          </div>
        ) : (
          <div className="space-y-4 py-4">
            <div className="flex items-center gap-2 text-green-600 mb-4">
              <CheckCircle2 className="h-5 w-5" />
              <span className="font-medium">{sentInvites.length} invite(s) created!</span>
            </div>

            <div className="space-y-3">
              {sentInvites.map((invite, index) => (
                <motion.div
                  key={invite.token}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-3 rounded-lg border bg-muted/30"
                >
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="secondary">{invite.email}</Badge>
                  </div>
                  <div className="flex gap-2">
                    <Input
                      value={invite.link}
                      readOnly
                      className="text-xs bg-background"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyLink(invite.link, index)}
                    >
                      {copiedIndex === index ? (
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="flex gap-2 pt-2">
              <Button
                variant="outline"
                onClick={resetForm}
                className="flex-1"
              >
                Create More
              </Button>
              <Button
                onClick={() => onOpenChange(false)}
                className="flex-1"
              >
                Done
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default InviteVendorModal;
