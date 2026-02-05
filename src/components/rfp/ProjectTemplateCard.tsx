import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProjectTemplateCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  isSelected?: boolean;
  onClick: () => void;
}

const ProjectTemplateCard = ({
  title,
  description,
  icon: Icon,
  isSelected,
  onClick,
}: ProjectTemplateCardProps) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'group relative flex flex-col items-center gap-4 p-6 rounded-xl border-2 transition-all duration-200 text-left w-full',
        'hover:border-primary hover:shadow-enterprise-sm hover:-translate-y-0.5',
        isSelected
          ? 'border-primary bg-primary/5 shadow-enterprise-sm'
          : 'border-border bg-card'
      )}
    >
      <div
        className={cn(
          'flex h-14 w-14 items-center justify-center rounded-xl transition-colors',
          isSelected
            ? 'bg-primary text-primary-foreground'
            : 'bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary'
        )}
      >
        <Icon className="h-7 w-7" />
      </div>
      <div className="text-center">
        <h3 className="font-semibold text-foreground">{title}</h3>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      </div>
      {isSelected && (
        <div className="absolute top-3 right-3 h-3 w-3 rounded-full bg-primary" />
      )}
    </button>
  );
};

export default ProjectTemplateCard;
