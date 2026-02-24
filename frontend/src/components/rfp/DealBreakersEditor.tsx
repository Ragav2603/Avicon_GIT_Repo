import { Plus, X, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';

export interface DealBreaker {
  id: string;
  text: string;
  enabled: boolean;
  weight: number;
}

interface DealBreakersEditorProps {
  dealBreakers: DealBreaker[];
  onDealBreakersChange: (dealBreakers: DealBreaker[]) => void;
}

const DealBreakersEditor = ({ dealBreakers, onDealBreakersChange }: DealBreakersEditorProps) => {
  const toggleDealBreaker = (id: string) => {
    onDealBreakersChange(
      dealBreakers.map((db) => (db.id === id ? { ...db, enabled: !db.enabled } : db))
    );
  };

  const updateDealBreaker = (id: string, updates: Partial<DealBreaker>) => {
    onDealBreakersChange(
      dealBreakers.map((db) => (db.id === id ? { ...db, ...updates } : db))
    );
  };

  const addDealBreaker = () => {
    onDealBreakersChange([
      ...dealBreakers,
      { id: `custom-${Date.now()}`, text: '', enabled: true, weight: 20 },
    ]);
  };

  const removeDealBreaker = (id: string) => {
    onDealBreakersChange(dealBreakers.filter((db) => db.id !== id));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-destructive">
        <ShieldAlert className="h-5 w-5" />
        <h3 className="font-semibold text-foreground">Deal Breakers</h3>
      </div>
      <p className="text-sm text-muted-foreground">
        Non-negotiable requirements. Assign weights.
      </p>

      <div className="space-y-3">
        {dealBreakers.map((db) => (
          <div
            key={db.id}
            className="flex items-center gap-3 p-3 rounded-lg border bg-card"
          >
            <Switch
              id={`db-${db.id}`}
              checked={db.enabled}
              onCheckedChange={() => toggleDealBreaker(db.id)}
            />
            <Input
              value={db.text}
              onChange={(e) => updateDealBreaker(db.id, { text: e.target.value })}
              placeholder="e.g., SOC2 Type II Compliant"
              className="flex-1 border-0 bg-transparent focus-visible:ring-0 px-0"
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => removeDealBreaker(db.id)}
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
        onClick={addDealBreaker}
        className="w-full"
      >
        <Plus className="h-4 w-4 mr-2" />
        Add Custom Deal Breaker
      </Button>
    </div>
  );
};

export default DealBreakersEditor;
