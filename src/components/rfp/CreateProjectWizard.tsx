import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, Loader2, FileText, CalendarIcon, Check } from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { useCreateProject } from '@/hooks/useProjects';
import { useAuth } from '@/hooks/useAuth';
import TemplateSelector, { PROJECT_TEMPLATES } from './TemplateSelector';
import GoalsBreakersEditor from './GoalsBreakersEditor';
import type { AdoptionGoal } from './AdoptionGoalsEditor';
import type { DealBreaker } from './DealBreakersEditor';
import type { Requirement } from '@/types/projects';

const BASE_STEPS = [
  { id: 1, label: 'Template' },
  { id: 2, label: 'Details' },
  { id: 3, label: 'Goals & Breakers' },
  { id: 4, label: 'Review' },
];

// ... (imports remain)

interface ExtractedData {
  title: string;
  description: string;
  requirements?: { text: string; is_mandatory: boolean; weight: number }[];
  budget?: number | null;
}

interface CreateProjectWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  prefillData?: ExtractedData | null; // Added prop
}

const CreateProjectWizard = ({ open, onOpenChange, onSuccess, prefillData }: CreateProjectWizardProps) => {
  const { user } = useAuth();
  const createProject = useCreateProject();
  const [currentStep, setCurrentStep] = useState(1);

  // Compute step labels — show extracted count on step 3 when prefillData is present
  const extractedCount = prefillData
    ? (prefillData.requirements?.length ?? 0)
    : null;

  const STEPS = BASE_STEPS.map((step) =>
    step.id === 3 && extractedCount !== null && extractedCount > 0
      ? { ...step, label: `Goals & Breakers (${extractedCount} extracted)` }
      : step
  );

  // Form state
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
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
      setDeadline(undefined);
      setAdoptionGoals([]);
      setDealBreakers([]);
    }
  }, [open]);

  // Handle Prefill Data (AI Extraction)
  useEffect(() => {
    if (open && prefillData) {
      console.log("Applying Prefill Data:", prefillData);

      // 1. Set Title
      setTitle(prefillData.title || '');

      // 2. Map Requirements to Goals/Breakers
      if (prefillData.requirements) {
        const goals: AdoptionGoal[] = [];
        const breakers: DealBreaker[] = [];

        prefillData.requirements.forEach((req, idx) => {
          const id = `ai-${idx}`;
          if (req.is_mandatory) {
            breakers.push({ id, text: req.text, enabled: true });
          } else {
            goals.push({ id, text: req.text, enabled: true });
          }
        });

        setAdoptionGoals(goals);
        setDealBreakers(breakers);
      }

      // 3. Skip Template Selection (Use 'custom' implicitly)
      setSelectedTemplateId('custom');

      // 4. Jump to Details Step
      setCurrentStep(2);
    }
  }, [open, prefillData]);

  // Update form when template is selected (Only if NOT using prefill)
  useEffect(() => {
    if (selectedTemplate && !prefillData) {
      if (selectedTemplate.id !== 'custom') {
        setTitle(selectedTemplate.title);
      }
      setAdoptionGoals([...selectedTemplate.adoptionGoals]);
      setDealBreakers([...selectedTemplate.dealBreakers]);
    }
  }, [selectedTemplateId, prefillData]);

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return selectedTemplateId !== null;
      case 2:
        return title.length >= 5;
      case 3:
        return true;
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

  const handleSubmit = () => {
    if (!user) return;

    // Map adoption goals and deal breakers to Requirement[]
    const requirements: Requirement[] = [
      ...adoptionGoals
        .filter((g) => g.enabled && g.text.trim())
        .map((g) => ({
          text: g.text,
          type: 'text' as const,
          mandatory: false,
          weight: 2,
        })),
      ...dealBreakers
        .filter((db) => db.enabled && db.text.trim())
        .map((db) => ({
          text: db.text,
          type: 'boolean' as const,
          mandatory: true,
          weight: 5,
        })),
    ];

    // Resolve template ID: use null for fallback/custom templates (not real UUIDs)
    const isDBTemplate = selectedTemplateId && !PROJECT_TEMPLATES.find(t => t.id === selectedTemplateId);
    const templateId = isDBTemplate ? selectedTemplateId : null;

    createProject.mutate(
      {
        title,
        templateId,
        dueDate: deadline,
        requirements,
      },
      {
        onSuccess: () => {
          onOpenChange(false);
          onSuccess?.();
        },
      }
    );
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
        );
      case 3:
        return (
          <div className="space-y-8">
            <div className="text-center mb-6">
              <h2 className="text-xl font-semibold text-foreground">Goals & Deal Breakers</h2>
              <p className="text-muted-foreground mt-1">
                Toggle pre-filled items, add your own, or drag to reclassify
              </p>
            </div>

            <GoalsBreakersEditor
              goals={adoptionGoals}
              onGoalsChange={setAdoptionGoals}
              dealBreakers={dealBreakers}
              onDealBreakersChange={setDealBreakers}
            />
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
                <p className="text-sm text-muted-foreground">Deadline</p>
                <p className="font-medium">
                  {deadline ? format(deadline, 'PPP') : 'Not specified'}
                </p>
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
            New RFP
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
            <Button onClick={handleSubmit} disabled={createProject.isPending || !canProceed()}>
              {createProject.isPending ? (
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
