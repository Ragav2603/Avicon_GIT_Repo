import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, X, Loader2, DollarSign, FileText, CalendarIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { z } from 'zod';

const rfpSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters').max(200),
  description: z.string().min(20, 'Description must be at least 20 characters').max(5000),
  budget_max: z.number().min(1000, 'Budget must be at least $1,000').optional(),
  deadline: z.date().optional(),
});

interface Requirement {
  text: string;
  is_mandatory: boolean;
  weight: number;
}

interface CreateRFPFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

const CreateRFPForm = ({ open, onOpenChange, onSuccess }: CreateRFPFormProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [budgetMax, setBudgetMax] = useState('');
  const [deadline, setDeadline] = useState<Date | undefined>(undefined);
  const [requirements, setRequirements] = useState<Requirement[]>([
    { text: '', is_mandatory: true, weight: 1 }
  ]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const addRequirement = () => {
    setRequirements([...requirements, { text: '', is_mandatory: false, weight: 1 }]);
  };

  const removeRequirement = (index: number) => {
    if (requirements.length > 1) {
      setRequirements(requirements.filter((_, i) => i !== index));
    }
  };

  const updateRequirement = (index: number, field: keyof Requirement, value: string | boolean | number) => {
    const updated = [...requirements];
    updated[index] = { ...updated[index], [field]: value };
    setRequirements(updated);
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setBudgetMax('');
    setDeadline(undefined);
    setRequirements([{ text: '', is_mandatory: true, weight: 1 }]);
    setErrors({});
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({ title: 'Error', description: 'You must be logged in', variant: 'destructive' });
      return;
    }

    // Validate form
    try {
      rfpSchema.parse({
        title,
        description,
        budget_max: budgetMax ? parseFloat(budgetMax) : undefined,
        deadline: deadline,
      });
      setErrors({});
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          fieldErrors[err.path[0] as string] = err.message;
        });
        setErrors(fieldErrors);
        return;
      }
    }

    // Validate requirements
    const validRequirements = requirements.filter(r => r.text.trim().length > 0);
    if (validRequirements.length === 0) {
      setErrors({ requirements: 'Add at least one requirement' });
      return;
    }

    setIsSubmitting(true);

    try {
      // Create RFP
      const { data: rfp, error: rfpError } = await supabase
        .from('rfps')
        .insert({
          airline_id: user.id,
          title,
          description,
          budget_max: budgetMax ? parseFloat(budgetMax) : null,
          deadline: deadline ? deadline.toISOString() : null,
          status: 'open',
        })
        .select()
        .single();

      if (rfpError) throw rfpError;

      // Create requirements
      const { error: reqError } = await supabase
        .from('rfp_requirements')
        .insert(
          validRequirements.map(r => ({
            rfp_id: rfp.id,
            requirement_text: r.text,
            is_mandatory: r.is_mandatory,
            weight: r.weight,
          }))
        );

      if (reqError) throw reqError;

      toast({ title: 'Success', description: 'RFP created successfully!' });
      resetForm();
      onOpenChange(false);
      onSuccess?.();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create RFP',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Create New RFP
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">RFP Title *</Label>
            <Input
              id="title"
              placeholder="e.g., Aircraft Maintenance Management System"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={errors.title ? 'border-destructive' : ''}
            />
            {errors.title && <p className="text-sm text-destructive">{errors.title}</p>}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              placeholder="Describe what you're looking for, your goals, and any specific needs..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={`min-h-[120px] ${errors.description ? 'border-destructive' : ''}`}
            />
            {errors.description && <p className="text-sm text-destructive">{errors.description}</p>}
          </div>

          {/* Budget */}
          <div className="space-y-2">
            <Label htmlFor="budget">Maximum Budget (USD)</Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="budget"
                type="number"
                placeholder="100000"
                value={budgetMax}
                onChange={(e) => setBudgetMax(e.target.value)}
                className={`pl-8 ${errors.budget_max ? 'border-destructive' : ''}`}
              />
            </div>
            {errors.budget_max && <p className="text-sm text-destructive">{errors.budget_max}</p>}
          </div>

          {/* Deadline */}
          <div className="space-y-2">
            <Label htmlFor="deadline">Deadline</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !deadline && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {deadline ? format(deadline, "PPP") : "Pick a deadline"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={deadline}
                  onSelect={setDeadline}
                  initialFocus
                  disabled={(date) => date < new Date()}
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Requirements */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Requirements *</Label>
              <Button type="button" variant="outline" size="sm" onClick={addRequirement}>
                <Plus className="h-4 w-4 mr-1" />
                Add
              </Button>
            </div>
            
            {errors.requirements && (
              <p className="text-sm text-destructive">{errors.requirements}</p>
            )}

            <div className="space-y-3">
              {requirements.map((req, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex gap-3 items-start p-3 rounded-lg bg-muted/50"
                >
                  <div className="flex-1 space-y-2">
                    <Input
                      placeholder="e.g., Must support real-time fleet tracking"
                      value={req.text}
                      onChange={(e) => updateRequirement(index, 'text', e.target.value)}
                    />
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <Checkbox
                          id={`mandatory-${index}`}
                          checked={req.is_mandatory}
                          onCheckedChange={(checked) => 
                            updateRequirement(index, 'is_mandatory', checked as boolean)
                          }
                        />
                        <Label htmlFor={`mandatory-${index}`} className="text-sm">
                          Mandatory
                        </Label>
                      </div>
                      <div className="flex items-center gap-2">
                        <Label className="text-sm">Weight:</Label>
                        <Input
                          type="number"
                          min="1"
                          max="10"
                          value={req.weight}
                          onChange={(e) => updateRequirement(index, 'weight', parseInt(e.target.value) || 1)}
                          className="w-16 h-8"
                        />
                      </div>
                    </div>
                  </div>
                  {requirements.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeRequirement(index)}
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </motion.div>
              ))}
            </div>
          </div>

          {/* Submit */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button type="submit" className="flex-1" disabled={isSubmitting}>
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                'Publish RFP'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateRFPForm;
