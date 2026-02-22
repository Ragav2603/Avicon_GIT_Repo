import { memo } from "react";
import { FileText, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Requirement } from "./types";

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
          <div
            key={req.id}
            onClick={() =>
              onSelectRequirement(
                req.id === selectedRequirement ? null : req.id
              )
            }
            className={`p-3 rounded-lg border cursor-pointer transition-all ${
              selectedRequirement === req.id
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
        ))}
      </div>
    </div>
  );
};

export default memo(RequirementsList);
