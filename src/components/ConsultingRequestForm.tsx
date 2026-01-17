import { useState } from 'react';
import { motion } from 'framer-motion';
import { Loader2, HelpCircle, MessageSquare, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
  message: z
    .string()
    .min(10, 'Message must be at least 10 characters')
    .max(2000, 'Message must be less than 2000 characters'),
});

type ProblemArea = 'process' | 'tooling' | 'strategy';

const problemAreaLabels: Record<ProblemArea, { label: string; description: string }> = {
  process: { label: 'Process', description: 'Workflow and operational challenges' },
  tooling: { label: 'Tooling', description: 'Technology and software adoption' },
  strategy: { label: 'Strategy', description: 'Long-term planning and optimization' },
};

interface ConsultingRequestFormProps {
  variant?: 'button' | 'card';
  className?: string;
}

const ConsultingRequestForm = ({ variant = 'button', className }: ConsultingRequestFormProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [problemArea, setProblemArea] = useState<ProblemArea | ''>('');
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

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
    const result = requestSchema.safeParse({ problem_area: problemArea, message });
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
      const { error } = await supabase.from('consulting_requests').insert({
        user_id: user.id,
        problem_area: problemArea,
        message: message.trim(),
      });

      if (error) throw error;

      toast({
        title: 'Request Submitted',
        description: 'A consultant will contact you shortly.',
      });

      // Reset form
      setProblemArea('');
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
    variant === 'card' ? (
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
            <MessageSquare className="h-5 w-5 text-primary" />
            Request Consulting Help
          </DialogTitle>
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
