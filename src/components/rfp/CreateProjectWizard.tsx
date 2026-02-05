import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, Loader2, FileText, DollarSign, CalendarIcon, Check } from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import TemplateSelector, { PROJECT_TEMPLATES, ProjectTemplate } from './TemplateSelector';
import AdoptionGoalsEditor, { AdoptionGoal } from './AdoptionGoalsEditor';
import DealBreakersEditor, { DealBreaker } from './DealBreakersEditor';

const STEPS = [
  { id: 1, label: 'Template' },
  { id: 2, label: 'Details' },
  { id: 3, label: 'Goals & Breakers' },
  { id: 4, label: 'Review' },
];

interface CreateProjectWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

const CreateProjectWizard = ({ open, onOpenChange, onSuccess }: CreateProjectWizardProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [budgetMax, setBudgetMax] = useState('');
  const [deadline, setDeadline] = useState<Date | undefined>(undefined);
  const [adoptionGoals, setAdoptionGoals] = useState<AdoptionGoal[]>([]);
  const [dealBreakers, setDealBreakers] = useState<DealBreaker[]>([]);

  // Get selected template
  const selectedTemplate = PROJECT_TEMPLATES.find((t) => t.id === selectedTemplateId);

  // Reset form when dialog closes
  useEffect(() => {
    if (!open) {
      setCurrentStep(1);
      setSelectedTemplateId(null);
      setTitle('');
      setDescription('');
      setBudgetMax('');
      setDeadline(undefined);
      setAdoptionGoals([]);
      setDealBreakers([]);
    }
  }, [open]);

  // Update form when template is selected
  useEffect(() => {
    if (selectedTemplate) {
      if (selectedTemplate.id !== 'custom') {
        setTitle(selectedTemplate.title);
        setDescription(`Request for ${selectedTemplate.description.toLowerCase()}`);
        if (selectedTemplate.suggestedBudget) {
          setBudgetMax(selectedTemplate.suggestedBudget.toString());
        }
      }
      setAdoptionGoals([...selectedTemplate.adoptionGoals]);
      setDealBreakers([...selectedTemplate.dealBreakers]);
    }
  }, [selectedTemplateId]);

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return selectedTemplateId !== null;
      case 2:
        return title.length >= 5 && description.length >= 20;
      case 3:
        return true; // Goals and breakers are optional
      case 4:
        return true;
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    if (!user) {
      toast({ title: 'Error', description: 'You must be logged in', variant: 'destructive' });
      return;
    }

    setIsSubmitting(true);

    try {
      // Build requirements from adoption goals and deal breakers
      const requirements = [
        ...adoptionGoals
          .filter((g) => g.enabled && g.text.trim())
          .map((g) => ({
            text: `[GOAL] ${g.text}`,
            is_mandatory: false,
            weight: 2,
          })),
        ...dealBreakers
          .filter((db) => db.enabled && db.text.trim())
          .map((db) => ({
            text: `[DEAL BREAKER] ${db.text}`,
            is_mandatory: true,
            weight: 5,
          })),
      ];

      // Create the RFP
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

      // Create requirements if any
      if (requirements.length > 0) {
        const { error: reqError } = await supabase
          .from('rfp_requirements')
          .insert(
            requirements.map((r) => ({
              rfp_id: rfp.id,
              requirement_text: r.text,
              is_mandatory: r.is_mandatory,
              weight: r.weight,
            }))
          );

        if (reqError) throw reqError;
      }

      toast({ title: 'Success', description: 'Request Project created successfully!' });
      onOpenChange(false);
      onSuccess?.();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create project',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <TemplateSelector
            selectedTemplate={selectedTemplateId}
            onSelectTemplate={setSelectedTemplateId}
          />
        );
      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-xl font-semibold text-foreground">Project Details</h2>
              <p className="text-muted-foreground mt-1">
                Describe what you're looking for
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">Project Title *</Label>
              <Input
                id="title"
                placeholder="e.g., Aircraft Maintenance Management System"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                placeholder="Describe what you're looking for, your goals, and any specific needs..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="min-h-[120px]"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    className="pl-8"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Deadline</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        'w-full justify-start text-left font-normal',
                        !deadline && 'text-muted-foreground'
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {deadline ? format(deadline, 'PPP') : 'Pick a deadline'}
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
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-8">
            <div className="text-center mb-6">
              <h2 className="text-xl font-semibold text-foreground">Goals & Deal Breakers</h2>
              <p className="text-muted-foreground mt-1">
                Toggle pre-filled items or add your own
              </p>
            </div>

            <AdoptionGoalsEditor goals={adoptionGoals} onGoalsChange={setAdoptionGoals} />
            <DealBreakersEditor dealBreakers={dealBreakers} onDealBreakersChange={setDealBreakers} />
          </div>
        );
      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-xl font-semibold text-foreground">Review & Publish</h2>
              <p className="text-muted-foreground mt-1">
                Confirm your project details before publishing
              </p>
            </div>

            <div className="space-y-4">
              <div className="p-4 rounded-lg border bg-muted/30">
                <p className="text-sm text-muted-foreground">Template</p>
                <p className="font-medium">{selectedTemplate?.title || 'Custom'}</p>
              </div>

              <div className="p-4 rounded-lg border bg-muted/30">
                <p className="text-sm text-muted-foreground">Project Title</p>
                <p className="font-medium">{title}</p>
              </div>

              <div className="p-4 rounded-lg border bg-muted/30">
                <p className="text-sm text-muted-foreground">Description</p>
                <p className="text-sm">{description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-lg border bg-muted/30">
                  <p className="text-sm text-muted-foreground">Budget</p>
                  <p className="font-medium">
                    {budgetMax ? `$${parseInt(budgetMax).toLocaleString()}` : 'Not specified'}
                  </p>
                </div>
                <div className="p-4 rounded-lg border bg-muted/30">
                  <p className="text-sm text-muted-foreground">Deadline</p>
                  <p className="font-medium">
                    {deadline ? format(deadline, 'PPP') : 'Not specified'}
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-lg border bg-muted/30">
                <p className="text-sm text-muted-foreground mb-2">
                  Adoption Goals ({adoptionGoals.filter((g) => g.enabled && g.text).length})
                </p>
                <ul className="space-y-1">
                  {adoptionGoals
                    .filter((g) => g.enabled && g.text)
                    .map((g) => (
                      <li key={g.id} className="text-sm flex items-center gap-2">
                        <Check className="h-3 w-3 text-primary" />
                        {g.text}
                      </li>
                    ))}
                </ul>
              </div>

              <div className="p-4 rounded-lg border bg-muted/30">
                <p className="text-sm text-muted-foreground mb-2">
                  Deal Breakers ({dealBreakers.filter((db) => db.enabled && db.text).length})
                </p>
                <ul className="space-y-1">
                  {dealBreakers
                    .filter((db) => db.enabled && db.text)
                    .map((db) => (
                      <li key={db.id} className="text-sm flex items-center gap-2">
                        <Check className="h-3 w-3 text-destructive" />
                        {db.text}
                      </li>
                    ))}
                </ul>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            New Request Project
          </DialogTitle>
        </DialogHeader>

        {/* Progress Steps */}
        <div className="flex items-center justify-between mb-6 px-4">
          {STEPS.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div
                className={cn(
                  'flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium transition-colors',
                  currentStep >= step.id
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground'
                )}
              >
                {currentStep > step.id ? <Check className="h-4 w-4" /> : step.id}
              </div>
              <span
                className={cn(
                  'ml-2 text-sm hidden sm:inline',
                  currentStep >= step.id ? 'text-foreground' : 'text-muted-foreground'
                )}
              >
                {step.label}
              </span>
              {index < STEPS.length - 1 && (
                <div
                  className={cn(
                    'w-12 sm:w-24 h-0.5 mx-2',
                    currentStep > step.id ? 'bg-primary' : 'bg-muted'
                  )}
                />
              )}
            </div>
          ))}
        </div>

        {/* Step Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="min-h-[400px]"
          >
            {renderStepContent()}
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex justify-between pt-6 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={currentStep === 1 ? () => onOpenChange(false) : handleBack}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            {currentStep === 1 ? 'Cancel' : 'Back'}
          </Button>

          {currentStep < STEPS.length ? (
            <Button onClick={handleNext} disabled={!canProceed()}>
              Next
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Button onClick={handleSubmit} disabled={isSubmitting || !canProceed()}>
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  Publish Project
                  <Check className="h-4 w-4 ml-2" />
                </>
              )}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreateProjectWizard;
