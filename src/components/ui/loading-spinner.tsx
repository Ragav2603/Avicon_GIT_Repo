import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export const LoadingSpinner = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <div
      className={cn("flex h-[50vh] w-full items-center justify-center", className)}
      {...props}
    >
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );
};
