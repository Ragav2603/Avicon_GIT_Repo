import { useRef, useState } from 'react';
import { Plus, X, Target, ShieldAlert, GripVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import type { AdoptionGoal } from './AdoptionGoalsEditor';
import type { DealBreaker } from './DealBreakersEditor';

type ListId = 'goals' | 'breakers';

interface DragState {
  sourceList: ListId;
  sourceIndex: number;
}

interface GoalsBreakersEditorProps {
  goals: AdoptionGoal[];
  onGoalsChange: (goals: AdoptionGoal[]) => void;
  dealBreakers: DealBreaker[];
  onDealBreakersChange: (breakers: DealBreaker[]) => void;
}

// Helper type to handle items moving between lists
type MovableItem = AdoptionGoal | DealBreaker;

const GoalsBreakersEditor = ({
  goals,
  onGoalsChange,
  dealBreakers,
  onDealBreakersChange,
}: GoalsBreakersEditorProps) => {
  const dragRef = useRef<DragState | null>(null);
  const [dragOver, setDragOver] = useState<{ list: ListId; index: number } | null>(null);

  /* ── Goals helpers ────────────────────────────────── */
  const toggleGoal = (id: string) =>
    onGoalsChange(goals.map((g) => (g.id === id ? { ...g, enabled: !g.enabled } : g)));
  const updateGoalText = (id: string, text: string) =>
    onGoalsChange(goals.map((g) => (g.id === id ? { ...g, text } : g)));
  const removeGoal = (id: string) => onGoalsChange(goals.filter((g) => g.id !== id));
  const addGoal = () =>
    onGoalsChange([...goals, { id: `goal-${Date.now()}`, text: '', enabled: true, weight: 1 }]);

  /* ── Deal-breaker helpers ─────────────────────────── */
  const toggleBreaker = (id: string) =>
    onDealBreakersChange(
      dealBreakers.map((db) => (db.id === id ? { ...db, enabled: !db.enabled } : db))
    );
  const updateBreakerText = (id: string, text: string) =>
    onDealBreakersChange(
      dealBreakers.map((db) => (db.id === id ? { ...db, text } : db))
    );
  const removeBreaker = (id: string) =>
    onDealBreakersChange(dealBreakers.filter((db) => db.id !== id));
  const addBreaker = () =>
    onDealBreakersChange([
      ...dealBreakers,
      { id: `brk-${Date.now()}`, text: '', enabled: true, weight: 1 },
    ]);

  /* ── Drag handlers ────────────────────────────────── */
  const onDragStart = (list: ListId, index: number) => {
    dragRef.current = { sourceList: list, sourceIndex: index };
  };

  const onDragOverItem = (e: React.DragEvent, list: ListId, index: number) => {
    e.preventDefault();
    setDragOver({ list, index });
  };

  const onDragOverZone = (e: React.DragEvent, list: ListId) => {
    e.preventDefault();
    // highlight empty list zone
    if (dragOver?.list !== list) setDragOver({ list, index: -1 });
  };

  const onDrop = (targetList: ListId, targetIndex: number) => {
    const drag = dragRef.current;
    if (!drag) return;

    const { sourceList, sourceIndex } = drag;

    /* same-list reorder */
    if (sourceList === targetList) {
      if (sourceList === 'goals') {
        const next = [...goals];
        const [moved] = next.splice(sourceIndex, 1);
        const insertAt = targetIndex < 0 ? next.length : targetIndex;
        next.splice(insertAt, 0, moved);
        onGoalsChange(next);
      } else {
        const next = [...dealBreakers];
        const [moved] = next.splice(sourceIndex, 1);
        const insertAt = targetIndex < 0 ? next.length : targetIndex;
        next.splice(insertAt, 0, moved);
        onDealBreakersChange(next);
      }
    } else {
      /* cross-list move */
      if (sourceList === 'goals') {
        const nextGoals = [...goals];
        const [moved] = nextGoals.splice(sourceIndex, 1);
        onGoalsChange(nextGoals);

        const next = [...dealBreakers];
        const insertAt = targetIndex < 0 ? next.length : targetIndex;
        // Fix for "Unexpected any"
        const weight = (moved as { weight?: number }).weight ?? 1;
        next.splice(insertAt, 0, { id: moved.id, text: moved.text, enabled: moved.enabled, weight });
        onDealBreakersChange(next);
      } else {
        const nextBreakers = [...dealBreakers];
        const [moved] = nextBreakers.splice(sourceIndex, 1);
        onDealBreakersChange(nextBreakers);

        const next = [...goals];
        const insertAt = targetIndex < 0 ? next.length : targetIndex;
        // Fix for "Unexpected any"
        const weight = (moved as { weight?: number }).weight ?? 1;
        next.splice(insertAt, 0, { id: moved.id, text: moved.text, enabled: moved.enabled, weight });
        onGoalsChange(next);
      }
    }

    dragRef.current = null;
    setDragOver(null);
  };

  const onDragEnd = () => {
    dragRef.current = null;
    setDragOver(null);
  };

  /* ── Shared item renderer ─────────────────────────── */
  const renderItem = (
    id: string,
    text: string,
    enabled: boolean,
    list: ListId,
    index: number,
    onToggle: () => void,
    onText: (v: string) => void,
    onRemove: () => void,
    placeholder: string
  ) => {
    const isTarget =
      dragOver?.list === list && dragOver?.index === index && dragRef.current !== null;

    return (
      <div
        key={id}
        draggable
        onDragStart={() => onDragStart(list, index)}
        onDragOver={(e) => onDragOverItem(e, list, index)}
        onDrop={() => onDrop(list, index)}
        onDragEnd={onDragEnd}
        className={cn(
          'flex items-center gap-3 p-3 rounded-lg border bg-card transition-all duration-150 cursor-default',
          isTarget && 'border-primary/60 bg-primary/5 scale-[0.99]',
          dragRef.current &&
            dragRef.current.sourceList === list &&
            dragRef.current.sourceIndex === index &&
            'opacity-50'
        )}
      >
        {/* Drag handle */}
        <GripVertical
          className="h-4 w-4 text-muted-foreground/50 cursor-grab active:cursor-grabbing shrink-0"
        />
        <Switch
          id={`item-${id}`}
          checked={enabled}
          onCheckedChange={onToggle}
        />
        <Input
          value={text}
          onChange={(e) => onText(e.target.value)}
          placeholder={placeholder}
          title={text}
          className="flex-1 border-0 bg-transparent focus-visible:ring-0 px-0 text-sm truncate"
        />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onRemove}
          className="h-8 w-8 text-muted-foreground hover:text-destructive shrink-0"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    );
  };

  /* ── Empty drop zone ──────────────────────────────── */
  const EmptyZone = ({ list }: { list: ListId }) => (
    <div
      onDragOver={(e) => onDragOverZone(e, list)}
      onDrop={() => onDrop(list, -1)}
      className={cn(
        'flex items-center justify-center h-16 rounded-lg border-2 border-dashed text-sm text-muted-foreground transition-colors',
        dragOver?.list === list ? 'border-primary/50 bg-primary/5 text-primary' : 'border-muted'
      )}
    >
      Drop here
    </div>
  );

  return (
    <div className="grid md:grid-cols-2 gap-6">
      {/* ── Adoption Goals ── */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-primary">
          <Target className="h-5 w-5" />
          <h3 className="font-semibold">Adoption Goals</h3>
        </div>
        <p className="text-xs text-muted-foreground">
          Measurable success criteria. Drag items across columns to reclassify.
        </p>

        <div className="space-y-2 min-h-[80px]">
          {goals.length === 0 ? (
            <EmptyZone list="goals" />
          ) : (
            goals.map((g, i) =>
              renderItem(
                g.id, g.text, g.enabled,
                'goals', i,
                () => toggleGoal(g.id),
                (v) => updateGoalText(g.id, v),
                () => removeGoal(g.id),
                'e.g., Reduce processing time by 50%'
              )
            )
          )}
          {/* Drop zone at the end when list is non-empty */}
          {goals.length > 0 && (
            <div
              onDragOver={(e) => onDragOverZone(e, 'goals')}
              onDrop={() => onDrop('goals', -1)}
              className={cn(
                'h-6 rounded transition-colors',
                dragOver?.list === 'goals' && dragOver.index === -1
                  ? 'bg-primary/10'
                  : 'bg-transparent'
              )}
            />
          )}
        </div>

        <Button type="button" variant="outline" size="sm" onClick={addGoal} className="w-full">
          <Plus className="h-4 w-4 mr-2" />
          Add Goal
        </Button>
      </div>

      {/* ── Deal Breakers ── */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-destructive">
          <ShieldAlert className="h-5 w-5" />
          <h3 className="font-semibold text-foreground">Deal Breakers</h3>
        </div>
        <p className="text-xs text-muted-foreground">
          Non-negotiable requirements. Drag items across columns to reclassify.
        </p>

        <div className="space-y-2 min-h-[80px]">
          {dealBreakers.length === 0 ? (
            <EmptyZone list="breakers" />
          ) : (
            dealBreakers.map((db, i) =>
              renderItem(
                db.id, db.text, db.enabled,
                'breakers', i,
                () => toggleBreaker(db.id),
                (v) => updateBreakerText(db.id, v),
                () => removeBreaker(db.id),
                'e.g., SOC2 Type II Compliant'
              )
            )
          )}
          {dealBreakers.length > 0 && (
            <div
              onDragOver={(e) => onDragOverZone(e, 'breakers')}
              onDrop={() => onDrop('breakers', -1)}
              className={cn(
                'h-6 rounded transition-colors',
                dragOver?.list === 'breakers' && dragOver.index === -1
                  ? 'bg-destructive/10'
                  : 'bg-transparent'
              )}
            />
          )}
        </div>

        <Button type="button" variant="outline" size="sm" onClick={addBreaker} className="w-full">
          <Plus className="h-4 w-4 mr-2" />
          Add Deal Breaker
        </Button>
      </div>
    </div>
  );
};

export default GoalsBreakersEditor;
