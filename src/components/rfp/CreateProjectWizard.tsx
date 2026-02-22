import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, Loader2, FileText, CalendarIcon, Check, Scale } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
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
  { id: 3, label: 'Requirements' },
  { id: 4, label: 'Review' },
];

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
      ? { ...step, label: `Requirements (${extractedCount} extracted)` }
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


      // 1. Set Title
      setTitle(prefillData.title || '');

      // 2. Map Requirements to Goals/Breakers
      if (prefillData.requirements) {
        const goals: AdoptionGoal[] = [];
        const breakers: DealBreaker[] = [];

        prefillData.requirements.forEach((req, idx) => {
          const id = `ai-${idx}`;
          const weight = req.weight || 0;
          // Force ALL AI-extracted items into Requirements, never Deal Breakers
          goals.push({ id, text: req.text, enabled: true, weight });
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
      // Fix for "Unexpected any" error
      setAdoptionGoals(selectedTemplate.adoptionGoals.map(g => ({ ...g, weight: (g as { weight?: number }).weight || 10 })));
      setDealBreakers(selectedTemplate.dealBreakers.map(db => ({ ...db, weight: (db as { weight?: number }).weight || 20 })));
    }
  }, [selectedTemplateId, prefillData, selectedTemplate]);

  // Calculate Total Weight of ENABLED requirements only (deal breakers are pass/fail, no weight)
  const totalWeight = adoptionGoals
    .filter(g => g.enabled)
    .reduce((sum, item) => sum + (item.weight || 0), 0);

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return selectedTemplateId !== null;
      case 2:
        return title.length >= 5;
      case 3:
        return totalWeight === 100; // MUST equal 100%
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
          weight: g.weight || 0,
        })),
      ...dealBreakers
        .filter((db) => db.enabled && db.text.trim())
        .map((db) => ({
          text: db.text,
          type: 'boolean' as const,
          mandatory: true,
          weight: 0,
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
          <div className="space-y-4">
            <div className="text-center mb-2">
              <h2 className="text-base font-semibold text-foreground">Project Details</h2>
              <p className="text-sm text-muted-foreground">
                Describe what you're looking for
              </p>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="title" className="text-sm">Project Title *</Label>
              <Input
                id="title"
                placeholder="e.g., Aircraft Maintenance Management System"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm">Deadline</Label>
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
                    onSelect={(day) => {
                      setDeadline(day);
                    }}
                    initialFocus
                    disabled={(date) => date < new Date()}
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-4">
            <div className="text-center mb-2">
              <h2 className="text-base font-semibold text-foreground">Requirements & Deal Breakers</h2>
              <p className="text-sm text-muted-foreground">
                Set weights for each item (must sum to 100%). Drag to reclassify.
              </p>
               <div className="mt-4 flex items-center justify-center gap-3 flex-wrap">
                <div className={cn(
                  "inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium border",
                  totalWeight === 100 ? "bg-success/10 text-success border-success/30" : "bg-warning/10 text-warning border-warning/30"
                )}>
                  <span>Total Weight: {totalWeight}%</span>
                  {totalWeight !== 100 && <span className="text-xs opacity-80">(Must sum to 100)</span>}
                  {totalWeight === 100 && <Check className="h-4 w-4" />}
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const enabledGoals = adoptionGoals.filter(g => g.enabled);
                    const total = enabledGoals.length;
                    if (total === 0) return;
                    const base = Math.floor(100 / total);
                    const remainder = 100 - base * total;
                    let idx = 0;
                    setAdoptionGoals(adoptionGoals.map(g => {
                      if (!g.enabled) return { ...g, weight: 0 };
                      const w = base + (idx < remainder ? 1 : 0);
                      idx++;
                      return { ...g, weight: w };
                    }));
                  }}
                  className="gap-1.5"
                >
                  <Scale className="h-3.5 w-3.5" />
                  Distribute Evenly
                </Button>
              </div>
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
          <div className="space-y-4">
            <div className="text-center mb-2">
              <h2 className="text-base font-semibold text-foreground">Review & Publish</h2>
              <p className="text-sm text-muted-foreground">
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
                  Requirements ({adoptionGoals.filter((g) => g.enabled && g.text).length})
                </p>
                <ul className="space-y-1">
                  {adoptionGoals
                    .filter((g) => g.enabled && g.text)
                    .map((g) => (
                      <li key={g.id} className="text-sm flex items-center justify-between gap-2">
                        <span className="flex items-center gap-2">
                          <Check className="h-3 w-3 text-primary" />
                          {g.text}
                        </span>
                        <span className="text-xs text-muted-foreground font-mono">{g.weight}%</span>
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
                        <span className="flex-1">{db.text}</span>
                        <Badge variant="destructive" className="text-[10px] shrink-0">Pass/Fail</Badge>
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
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto p-4 sm:p-6 gap-3">
        <DialogHeader className="pb-0">
          <DialogTitle className="flex items-center gap-2 text-base">
            <FileText className="h-4 w-4 text-primary" />
            New RFP
          </DialogTitle>
        </DialogHeader>

        {/* Progress Steps */}
        <div className="flex items-center justify-between px-2">
          {STEPS.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div
                className={cn(
                  'flex items-center justify-center w-7 h-7 rounded-full text-xs font-medium transition-colors',
                  currentStep >= step.id
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground'
                )}
              >
                {currentStep > step.id ? <Check className="h-3.5 w-3.5" /> : step.id}
              </div>
              <span
                className={cn(
                  'ml-1.5 text-xs hidden sm:inline',
                  currentStep >= step.id ? 'text-foreground' : 'text-muted-foreground'
                )}
              >
                {step.label}
              </span>
              {index < STEPS.length - 1 && (
                <div
                  className={cn(
                    'w-8 sm:w-16 h-0.5 mx-1.5',
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
            transition={{ duration: 0.15 }}
            className="min-h-[200px]"
          >
            {renderStepContent()}
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex justify-between pt-3 border-t">
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
