import { motion } from "framer-motion";
import { FileUp, FileText, X, Sparkles, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ProposalUploadStepProps {
  uploadedFiles: File[];
  onUpload: (files: FileList | null) => void;
  onRemove: (index: number) => void;
  onStartAnalysis: () => void;
  onSkip: () => void;
}

const ProposalUploadStep = ({
  uploadedFiles,
  onUpload,
  onRemove,
  onStartAnalysis,
  onSkip,
}: ProposalUploadStepProps) => {
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onUpload(e.dataTransfer.files);
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="h-full p-6 flex flex-col"
    >
      <div className="text-center mb-6">
        <h3 className="text-xl font-semibold mb-2">Upload Source Documents</h3>
        <p className="text-muted-foreground">
          Upload previous proposals, API docs, or capability statements to auto-generate your response
        </p>
      </div>

      {/* Drop Zone */}
      <div
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className="flex-1 border-2 border-dashed border-border rounded-xl hover:border-primary/50 transition-colors flex flex-col items-center justify-center gap-4 cursor-pointer bg-muted/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        onClick={() => document.getElementById('file-upload')?.click()}
        role="button"
        tabIndex={0}
        aria-label="Upload proposal documents"
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            document.getElementById('file-upload')?.click();
          }
        }}
      >
        <div className="p-4 rounded-full bg-primary/10">
          <FileUp className="h-10 w-10 text-primary" />
        </div>
        <div className="text-center">
          <p className="font-medium">Drop files here or click to browse</p>
          <p className="text-sm text-muted-foreground mt-1">
            PDF, DOCX, or TXT files up to 10MB
          </p>
        </div>
        <input
          id="file-upload"
          type="file"
          multiple
          accept=".pdf,.docx,.txt"
          className="hidden"
          onChange={(e) => onUpload(e.target.files)}
        />
      </div>

      {/* Uploaded Files */}
      {uploadedFiles.length > 0 && (
        <div className="mt-4 space-y-2">
          {uploadedFiles.map((file, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 bg-muted rounded-lg"
            >
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">{file.name}</span>
                <span className="text-xs text-muted-foreground">
                  ({(file.size / 1024).toFixed(1)} KB)
                </span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                aria-label={`Remove ${file.name}`}
                onClick={(e) => {
                  e.stopPropagation();
                  onRemove(index);
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3 mt-6">
        <Button variant="outline" className="flex-1" onClick={onSkip}>
          Skip & Start Manually
        </Button>
        <Button
          className="flex-1"
          onClick={onStartAnalysis}
          disabled={uploadedFiles.length === 0}
        >
          <Sparkles className="h-4 w-4 mr-2" />
          Analyze & Generate
          <ChevronRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </motion.div>
  );
};

export default ProposalUploadStep;
