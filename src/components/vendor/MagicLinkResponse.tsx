import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Loader2, 
  Send, 
  FileText, 
  Calendar, 
  DollarSign, 
  CheckCircle2,
  AlertCircle,
  Shield,
  Building2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

interface Requirement {
  id: string;
  requirement_text: string;
  is_mandatory: boolean;
  weight: number;
}

interface RFPDetails {
  id: string;
  title: string;
  description: string | null;
  budget_max: number | null;
  deadline: string | null;
}

interface MagicLinkResponseProps {
  inviteToken: string;
}

const MagicLinkResponse = ({ inviteToken }: MagicLinkResponseProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rfp, setRfp] = useState<RFPDetails | null>(null);
  const [requirements, setRequirements] = useState<Requirement[]>([]);
  const [alreadyUsed, setAlreadyUsed] = useState(false);

  // Form state
  const [vendorName, setVendorName] = useState('');
  const [vendorEmail, setVendorEmail] = useState('');
  const [pitchText, setPitchText] = useState('');

  useEffect(() => {
    verifyLink();
  }, [inviteToken]);

  const verifyLink = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/magic-link-respond`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            invite_token: inviteToken,
            action: 'verify',
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Invalid or expired link');
        return;
      }

      setRfp(data.rfp);
      setRequirements(data.requirements || []);
      setAlreadyUsed(data.already_used);
    } catch (_err) {
      setError('Failed to verify link. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!vendorEmail || !pitchText) {
      toast({
        title: 'Missing Information',
        description: 'Please fill in all required fields.',
        variant: 'destructive',
      });
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/magic-link-respond`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            invite_token: inviteToken,
            action: 'submit',
            pitch_text: pitchText,
            vendor_email: vendorEmail,
            vendor_name: vendorName,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit response');
      }

      setSubmitted(true);
      toast({
        title: 'Response Submitted!',
        description: 'Your proposal has been submitted successfully.',
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Submission failed';
      toast({
        title: 'Submission Failed',
        description: message,
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Verifying your invite link...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="max-w-md w-full text-center">
          <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="h-8 w-8 text-red-500" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">Link Unavailable</h1>
          <p className="text-muted-foreground">{error}</p>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full text-center"
        >
          <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="h-8 w-8 text-green-500" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">Response Submitted!</h1>
          <p className="text-muted-foreground mb-4">
            Thank you for your submission. The airline will review your proposal and get back to you.
          </p>
          <Badge className="bg-primary/10 text-primary">
            Reference: {rfp?.title}
          </Badge>
        </motion.div>
      </div>
    );
  }

  if (alreadyUsed) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="max-w-md w-full text-center">
          <div className="w-16 h-16 rounded-full bg-amber-500/10 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="h-8 w-8 text-amber-500" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">Already Submitted</h1>
          <p className="text-muted-foreground">
            A response has already been submitted using this link. Each invite can only be used once.
          </p>
        </div>
      </div>
    );
  }

  const mandatoryReqs = requirements.filter(r => r.is_mandatory);
  const optionalReqs = requirements.filter(r => !r.is_mandatory);

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <FileText className="h-6 w-6 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">
            Submit Your Proposal
          </h1>
          <p className="text-muted-foreground">
            No account required. Submit your response directly.
          </p>
        </motion.div>

        {/* RFP Details Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-card rounded-xl border border-border p-6 mb-6"
        >
          <h2 className="text-xl font-semibold text-foreground mb-2">{rfp?.title}</h2>
          <p className="text-muted-foreground mb-4">{rfp?.description}</p>

          <div className="flex flex-wrap gap-4 text-sm">
            {rfp?.budget_max && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <DollarSign className="h-4 w-4" />
                <span>Budget: ${rfp.budget_max.toLocaleString()}</span>
              </div>
            )}
            {rfp?.deadline && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>Deadline: {new Date(rfp.deadline).toLocaleDateString()}</span>
              </div>
            )}
          </div>
        </motion.div>

        {/* Requirements */}
        {requirements.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-card rounded-xl border border-border p-6 mb-6"
          >
            <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
              <Shield className="h-4 w-4 text-primary" />
              Requirements to Address
            </h3>

            {mandatoryReqs.length > 0 && (
              <div className="mb-4">
                <p className="text-sm text-red-600 font-medium mb-2">
                  Mandatory (Deal Breakers)
                </p>
                <ul className="space-y-2">
                  {mandatoryReqs.map((req) => (
                    <li
                      key={req.id}
                      className="flex items-start gap-2 text-sm p-2 rounded bg-red-500/5 border border-red-500/20"
                    >
                      <span className="text-foreground">{req.requirement_text.replace('[DEAL BREAKER] ', '')}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {optionalReqs.length > 0 && (
              <div>
                <p className="text-sm text-muted-foreground font-medium mb-2">
                  Preferred
                </p>
                <ul className="space-y-2">
                  {optionalReqs.map((req) => (
                    <li
                      key={req.id}
                      className="flex items-start gap-2 text-sm p-2 rounded bg-muted/50"
                    >
                      <span className="text-foreground">{req.requirement_text.replace('[GOAL] ', '')}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </motion.div>
        )}

        {/* Response Form */}
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          onSubmit={handleSubmit}
          className="bg-card rounded-xl border border-border p-6 space-y-6"
        >
          <h3 className="font-semibold text-foreground flex items-center gap-2">
            <Building2 className="h-4 w-4 text-primary" />
            Your Information
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="vendorName">Company Name</Label>
              <Input
                id="vendorName"
                placeholder="Your company name"
                value={vendorName}
                onChange={(e) => setVendorName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="vendorEmail">Email Address *</Label>
              <Input
                id="vendorEmail"
                type="email"
                placeholder="you@company.com"
                value={vendorEmail}
                onChange={(e) => setVendorEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="pitchText">Your Proposal *</Label>
            <Textarea
              id="pitchText"
              placeholder="Describe how you meet the requirements, your relevant experience, and why you're the best fit..."
              value={pitchText}
              onChange={(e) => setPitchText(e.target.value)}
              className="min-h-[200px]"
              required
            />
            <p className="text-xs text-muted-foreground">
              Be specific about how you address each requirement listed above.
            </p>
          </div>

          <Button
            type="submit"
            size="lg"
            className="w-full"
            disabled={submitting || !vendorEmail || !pitchText}
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Submit Proposal
              </>
            )}
          </Button>
        </motion.form>
      </div>
    </div>
  );
};

export default MagicLinkResponse;
