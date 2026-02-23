import { Plus, X, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';

export interface AdoptionGoal {
  id: string;
  text: string;
  enabled: boolean;
  weight: number;
}

interface AdoptionGoalsEditorProps {
  goals: AdoptionGoal[];
  onGoalsChange: (goals: AdoptionGoal[]) => void;
}

const AdoptionGoalsEditor = ({ goals, onGoalsChange }: AdoptionGoalsEditorProps) => {
  const toggleGoal = (id: string) => {
    onGoalsChange(
      goals.map((g) => (g.id === id ? { ...g, enabled: !g.enabled } : g))
    );
  };

  const updateGoal = (id: string, updates: Partial<AdoptionGoal>) => {
    onGoalsChange(goals.map((g) => (g.id === id ? { ...g, ...updates } : g)));
  };

  const addGoal = () => {
    onGoalsChange([
      ...goals,
      { id: `custom-${Date.now()}`, text: '', enabled: true, weight: 10 },
    ]);
  };

  const removeGoal = (id: string) => {
    onGoalsChange(goals.filter((g) => g.id !== id));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-primary">
        <Target className="h-5 w-5" />
        <h3 className="font-semibold">Adoption Goals</h3>
      </div>
      <p className="text-sm text-muted-foreground">
        Define measurable success criteria. Assign weights (should sum to 100 with deal breakers).
      </p>

      <div className="space-y-3">
        {goals.map((goal) => (
          <div
            key={goal.id}
            className="flex items-center gap-3 p-3 rounded-lg border bg-card"
          >
            <Switch
              id={`goal-${goal.id}`}
              checked={goal.enabled}
              onCheckedChange={() => toggleGoal(goal.id)}
            />
            <div className="flex-1 flex gap-2">
              <Input
                value={goal.text}
                onChange={(e) => updateGoal(goal.id, { text: e.target.value })}
                placeholder="e.g., Reduce manual processing time by 50%"
                className="flex-1 border-0 bg-transparent focus-visible:ring-0 px-0"
              />
              <div className="w-20">
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={goal.weight}
                  onChange={(e) => updateGoal(goal.id, { weight: parseInt(e.target.value) || 0 })}
                  className="h-8 text-right"
                  placeholder="%"
                />
              </div>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => removeGoal(goal.id)}
              className="h-8 w-8 text-muted-foreground hover:text-destructive"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>

      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={addGoal}
        className="w-full"
      >
        <Plus className="h-4 w-4 mr-2" />
        Add Custom Goal
      </Button>
    </div>
  );
};

export default AdoptionGoalsEditor;
