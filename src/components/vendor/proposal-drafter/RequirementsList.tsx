import { memo } from "react";
import { FileText } from "lucide-react";
import { Requirement } from "./types";
import RequirementItem from "./RequirementItem";

interface RequirementsListProps {
  requirements: Requirement[];
  selectedRequirement: string | null;
  onSelectRequirement: (id: string | null) => void;
}

const RequirementsList = ({
  requirements,
  selectedRequirement,
  onSelectRequirement,
}: RequirementsListProps) => {
  return (
    <div className="w-1/2 border-r border-border overflow-y-auto p-4">
      <h4 className="font-semibold mb-4 flex items-center gap-2">
        <FileText className="h-4 w-4" />
        RFP Requirements
      </h4>
      <div className="space-y-3">
        {requirements.map((req) => (
          <RequirementItem
            key={req.id}
            req={req}
            isSelected={selectedRequirement === req.id}
            onSelect={onSelectRequirement}
          />
        ))}
      </div>
    </div>
  );
};

export default memo(RequirementsList);
