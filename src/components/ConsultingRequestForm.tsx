import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Loader2, HelpCircle, MessageSquare, Send, ClipboardCheck, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { z } from 'zod';

const requestSchema = z.object({
  problem_area: z.enum(['process', 'tooling', 'strategy'], {
    required_error: 'Please select a problem area',
  }),
  focus_system: z.string().optional(),
  message: z
    .string()
    .min(10, 'Message must be at least 10 characters')
    .max(2000, 'Message must be less than 2000 characters'),
});

type ProblemArea = 'process' | 'tooling' | 'strategy';

const problemAreaLabels: Record<ProblemArea, { label: string; description: string }> = {
  process: { label: 'Process & Workflow', description: 'Workflow and operational challenges' },
  tooling: { label: 'Technology & Tooling', description: 'Technology and software adoption' },
  strategy: { label: 'Strategy & Planning', description: 'Long-term planning and optimization' },
};

interface FocusSystem {
  id: string;
  title: string;
  type: 'rfp' | 'vendor';
}

interface ConsultingRequestFormProps {
  variant?: 'button' | 'card' | 'audit';
  className?: string;
}

const ConsultingRequestForm = ({ variant = 'button', className }: ConsultingRequestFormProps) => {
  const { user, role } = useAuth();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [problemArea, setProblemArea] = useState<ProblemArea | ''>('');
  const [focusSystem, setFocusSystem] = useState<string>('');
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [focusSystems, setFocusSystems] = useState<FocusSystem[]>([]);
  const [loadingSystems, setLoadingSystems] = useState(false);

  // Fetch RFPs for the user when dialog opens
  useEffect(() => {
    if (open && user && role === 'airline') {
      fetchFocusSystems();
    }
  }, [open, user, role]);

  const fetchFocusSystems = async () => {
    if (!user) return;
    setLoadingSystems(true);
    try {
      const { data: rfps, error } = await supabase
        .from('rfps')
        .select('id, title')
        .eq('airline_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const systems: FocusSystem[] = (rfps || []).map((rfp) => ({
        id: rfp.id,
        title: rfp.title,
        type: 'rfp' as const,
      }));

      setFocusSystems(systems);
    } catch (error) {
      console.error('Error fetching focus systems:', error);
    } finally {
      setLoadingSystems(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast({
        title: 'Please sign in',
        description: 'You need to be logged in to submit a request.',
        variant: 'destructive',
      });
      return;
    }

    // Validate
    const result = requestSchema.safeParse({ problem_area: problemArea, focus_system: focusSystem, message });
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        fieldErrors[err.path[0] as string] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }
    setErrors({});

    setIsSubmitting(true);

    try {
      // Include focus_system in message if selected
      const fullMessage = focusSystem 
        ? `[Focus: ${focusSystems.find(s => s.id === focusSystem)?.title || focusSystem}]\n\n${message.trim()}`
        : message.trim();

      const { data: insertedRequest, error } = await supabase
        .from('consulting_requests')
        .insert({
          user_id: user.id,
          problem_area: problemArea,
          message: fullMessage,
        })
        .select()
        .single();

      if (error) throw error;

      // Send notification to consultants
      try {
        await supabase.functions.invoke('notify-consulting-request', {
          body: {
            requestId: insertedRequest.id,
            problemArea: problemArea,
            message: fullMessage,
            requesterEmail: user.email || 'Unknown',
          },
        });
      } catch (notifyError) {
        console.error('Failed to send consultant notification:', notifyError);
      }

      toast({
        title: 'Request Sent!',
        description: 'An Adoption Architect will contact you shortly.',
      });

      // Reset form
      setProblemArea('');
      setFocusSystem('');
      setMessage('');
      setOpen(false);
    } catch (error: any) {
      console.error('Error submitting request:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to submit request. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const triggerContent =
    variant === 'audit' ? (
      <motion.div
        whileHover={{ scale: 1.01 }}
        className={`p-6 rounded-xl border border-primary/20 bg-gradient-to-br from-primary/5 via-accent/5 to-secondary/5 cursor-pointer hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5 transition-all ${className}`}
      >
        <div className="flex items-start gap-4">
          <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center flex-shrink-0 shadow-lg">
            <ClipboardCheck className="h-7 w-7 text-primary-foreground" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-lg text-foreground mb-1">Request Adoption Audit</h3>
            <p className="text-sm text-muted-foreground mb-3">
              Need to prove ROI? Our consultants verify adoption metrics and benchmark your performance.
            </p>
            <span className="inline-flex items-center gap-2 text-sm font-medium text-primary">
              <Target className="h-4 w-4" />
              Get Expert Verification
            </span>
          </div>
        </div>
      </motion.div>
    ) : variant === 'card' ? (
      <motion.div
        whileHover={{ scale: 1.02 }}
        className={`p-6 rounded-xl border border-border bg-gradient-to-br from-primary/5 to-accent/5 cursor-pointer hover:border-primary/50 transition-colors ${className}`}
      >
        <div className="flex items-start gap-4">
          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
            <HelpCircle className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground mb-1">Need Adoption Help?</h3>
            <p className="text-sm text-muted-foreground">
              Get expert guidance on process optimization, tooling adoption, or strategic planning.
            </p>
          </div>
        </div>
      </motion.div>
    ) : (
      <Button variant="outline" className={className}>
        <HelpCircle className="h-4 w-4 mr-2" />
        Need Adoption Help?
      </Button>
    );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{triggerContent}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ClipboardCheck className="h-5 w-5 text-primary" />
            Request Adoption Audit
          </DialogTitle>
          <DialogDescription>
            Our Adoption Architects will review your systems and provide actionable recommendations.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Problem Area */}
          <div className="space-y-2">
            <Label htmlFor="problem-area">Problem Area *</Label>
            <Select
              value={problemArea}
              onValueChange={(value) => setProblemArea(value as ProblemArea)}
            >
              <SelectTrigger
                id="problem-area"
                className={errors.problem_area ? 'border-destructive' : ''}
              >
                <SelectValue placeholder="Select an area" />
              </SelectTrigger>
              <SelectContent>
                {(Object.keys(problemAreaLabels) as ProblemArea[]).map((key) => (
                  <SelectItem key={key} value={key}>
                    <div className="flex flex-col">
                      <span>{problemAreaLabels[key].label}</span>
                      <span className="text-xs text-muted-foreground">
                        {problemAreaLabels[key].description}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.problem_area && (
              <p className="text-sm text-destructive">{errors.problem_area}</p>
            )}
          </div>

          {/* Focus System - Only show for airlines with RFPs */}
          {role === 'airline' && (
            <div className="space-y-2">
              <Label htmlFor="focus-system">Focus System (Optional)</Label>
              <Select
                value={focusSystem}
                onValueChange={setFocusSystem}
                disabled={loadingSystems}
              >
                <SelectTrigger id="focus-system">
                  {loadingSystems ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <SelectValue placeholder="Select an RFP or Vendor" />
                  )}
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">General / Not Specific</SelectItem>
                  {focusSystems.map((system) => (
                    <SelectItem key={system.id} value={system.id}>
                      <div className="flex items-center gap-2">
                        <span className="text-xs uppercase text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                          {system.type}
                        </span>
                        <span>{system.title}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Choose a specific RFP or vendor to focus the audit on
              </p>
            </div>
          )}

          {/* Message */}
          <div className="space-y-2">
            <Label htmlFor="message">Describe Your Challenge *</Label>
            <Textarea
              id="message"
              placeholder="Tell us about the challenges you're facing and what kind of help you need..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className={`min-h-[120px] ${errors.message ? 'border-destructive' : ''}`}
            />
            {errors.message && <p className="text-sm text-destructive">{errors.message}</p>}
            <p className="text-xs text-muted-foreground">{message.length}/2000 characters</p>
          </div>

          {/* Submit */}
          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button type="submit" className="flex-1" disabled={isSubmitting}>
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Submit Request
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ConsultingRequestForm;
