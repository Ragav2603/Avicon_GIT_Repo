import { memo } from "react";
import { CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Requirement } from "./types";

interface RequirementItemProps {
  req: Requirement;
  isSelected: boolean;
  onSelect: (id: string | null) => void;
}

const RequirementItem = ({ req, isSelected, onSelect }: RequirementItemProps) => {
  return (
    <div
      onClick={() => onSelect(isSelected ? null : req.id)}
      className={`p-3 rounded-lg border cursor-pointer transition-all ${
        isSelected
          ? "border-primary bg-primary/5"
          : "border-border hover:border-primary/50"
      }`}
    >
      <div className="flex items-start gap-2">
        <div className="flex-1">
          <p className="text-sm">{req.requirement_text}</p>
          <div className="flex items-center gap-2 mt-2">
            {req.is_mandatory && (
              <Badge variant="destructive" className="text-xs">
                Mandatory
              </Badge>
            )}
            <Badge variant="outline" className="text-xs">
              Weight: {req.weight}%
            </Badge>
          </div>
        </div>
        <CheckCircle2 className="h-4 w-4 text-success flex-shrink-0" />
      </div>
    </div>
  );
};

export default memo(RequirementItem);
