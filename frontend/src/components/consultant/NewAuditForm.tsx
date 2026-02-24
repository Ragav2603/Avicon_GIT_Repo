import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Loader2, Building2, Wrench, Sparkles, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AuditItem {
  id: string;
  tool_name: string;
  utilization: number;
  sentiment: number;
}

interface AuditResult {
  audit_id: string;
  overall_score: number;
  summary: string;
  recommendations: {
    tool_name: string;
    score: number;
    recommendation: string;
  }[];
}

interface NewAuditFormProps {
  onAuditComplete: (result: AuditResult) => void;
  onCancel?: () => void;
}

const generateId = () => Math.random().toString(36).substring(2, 9);

export const NewAuditForm = ({ onAuditComplete, onCancel }: NewAuditFormProps) => {
  const { toast } = useToast();
  const [airlineName, setAirlineName] = useState('');
  const [auditItems, setAuditItems] = useState<AuditItem[]>([
    { id: generateId(), tool_name: '', utilization: 50, sentiment: 5 },
  ]);
  const [isRunning, setIsRunning] = useState(false);

  const addAuditItem = () => {
    setAuditItems([
      ...auditItems,
      { id: generateId(), tool_name: '', utilization: 50, sentiment: 5 },
    ]);
  };

  const removeAuditItem = (id: string) => {
    if (auditItems.length > 1) {
      setAuditItems(auditItems.filter((item) => item.id !== id));
    }
  };

  const updateAuditItem = (id: string, field: keyof AuditItem, value: string | number) => {
    setAuditItems(
      auditItems.map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      )
    );
  };

  const runAudit = async () => {
    if (!airlineName.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Please enter an airline name.',
        variant: 'destructive',
      });
      return;
    }

    const invalidItems = auditItems.filter((item) => !item.tool_name.trim());
    if (invalidItems.length > 0) {
      toast({
        title: 'Validation Error',
        description: 'Please enter a name for all tools.',
        variant: 'destructive',
      });
      return;
    }

    setIsRunning(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('Not authenticated');
      }

      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const response = await fetch(
        `${supabaseUrl}/functions/v1/evaluate-adoption`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            airline_name: airlineName.trim(),
            items: auditItems.map((item) => ({
              tool_name: item.tool_name,
              utilization: item.utilization,
              sentiment: item.sentiment,
            })),
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to run audit');
      }

      const result = await response.json();
      onAuditComplete(result);

      toast({
        title: 'Audit Complete',
        description: 'Digital adoption audit has been processed successfully.',
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'An error occurred while running the audit.';
      console.error('Audit error:', error);
      toast({
        title: 'Audit Failed',
        description: message,
        variant: 'destructive',
      });
    } finally {
      setIsRunning(false);
    }
  };

  const isValid = airlineName.trim() && auditItems.every((i) => i.tool_name.trim());

  return (
    <div className="space-y-6">
      {/* Airline Name Input */}
      <div className="space-y-2">
        <Label className="flex items-center gap-2 text-foreground font-medium">
          <Building2 className="h-4 w-4 text-accent" />
          Airline Name
        </Label>
        <Input
          placeholder="e.g., Delta Airlines, Emirates, etc."
          value={airlineName}
          onChange={(e) => setAirlineName(e.target.value)}
          className="border-border focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all"
        />
      </div>

      {/* Audit Items */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label className="flex items-center gap-2 text-foreground font-medium">
            <Wrench className="h-4 w-4 text-accent" />
            Tools to Audit
          </Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addAuditItem}
            className="border-border hover:bg-accent/10 hover:text-accent transition-colors"
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Tool
          </Button>
        </div>

        <AnimatePresence mode="popLayout">
          {auditItems.map((item, _index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="p-4 rounded-lg border border-border bg-muted/30 space-y-4"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 space-y-2">
                  <Label htmlFor={`tool-${item.id}`} className="text-sm text-muted-foreground">
                    Tool Name
                  </Label>
                  <Input
                    id={`tool-${item.id}`}
                    placeholder="e.g., Crew Rostering, Flight Planning"
                    value={item.tool_name}
                    onChange={(e) => updateAuditItem(item.id, 'tool_name', e.target.value)}
                    className="border-border focus:ring-2 focus:ring-accent/20 focus:border-accent"
                  />
                </div>
                {auditItems.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="shrink-0 text-muted-foreground hover:text-destructive transition-colors"
                    onClick={() => removeAuditItem(item.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Utilization Slider */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm text-muted-foreground">Utilization</Label>
                    <span className="text-sm font-semibold text-foreground tabular-nums">
                      {item.utilization}%
                    </span>
                  </div>
                  <Slider
                    value={[item.utilization]}
                    onValueChange={(value) => updateAuditItem(item.id, 'utilization', value[0])}
                    max={100}
                    step={1}
                    className="cursor-pointer"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>0%</span>
                    <span>100%</span>
                  </div>
                </div>

                {/* Sentiment Rating */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm text-muted-foreground">User Sentiment</Label>
                    <span className="text-sm font-semibold text-foreground flex items-center gap-1 tabular-nums">
                      <Star className="h-3 w-3 text-warning fill-warning" />
                      {item.sentiment}/10
                    </span>
                  </div>
                  <Slider
                    value={[item.sentiment]}
                    onValueChange={(value) => updateAuditItem(item.id, 'sentiment', value[0])}
                    min={1}
                    max={10}
                    step={1}
                    className="cursor-pointer"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>1</span>
                    <span>10</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            className="flex-1"
            disabled={isRunning}
          >
            Cancel
          </Button>
        )}
        <Button
          onClick={runAudit}
          disabled={isRunning || !isValid}
          className="flex-1 bg-accent hover:bg-accent/90"
          size="lg"
        >
          {isRunning ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4 mr-2" />
              Run Analysis
            </>
          )}
        </Button>
      </div>

      {isRunning && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-sm text-center text-muted-foreground"
        >
          Analyzing adoption metrics with AI... This may take 5-10 seconds.
        </motion.p>
      )}
    </div>
  );
};
