import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Upload, 
  FileText, 
  Sparkles, 
  PenTool, 
  Loader2, 
  CheckCircle,
  FileUp,
  AlertCircle,
  ChevronDown,
  ArrowRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import rfpGraphic from "@/assets/rfp-ai-extract.png";

interface Requirement {
  text: string;
  is_mandatory: boolean;
  weight: number;
}

interface ExtractedData {
  title: string;
  description: string;
  requirements?: Requirement[];
  budget?: number | null;
}

interface SmartRFPCreatorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onManualCreate: () => void;
  onAICreate: (extractedData: ExtractedData) => void;
}

interface ErrorDetails {
  message: string;
  version?: string;
  azure_request_id?: string;
  status?: number;
  code?: string;
}

interface StructuredError extends ErrorDetails {
  isStructured: boolean;
}

const SmartRFPCreator = ({ open, onOpenChange, onManualCreate, onAICreate }: SmartRFPCreatorProps) => {
  const { user } = useAuth();
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [scanComplete, setScanComplete] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [errorDetails, setErrorDetails] = useState<ErrorDetails | null>(null);
  const { toast } = useToast();

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      processFile(files[0]);
    }
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      processFile(files[0]);
    }
  };

  const processFile = async (file: File) => {
    const validTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
    
    if (!validTypes.includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: "Please upload a PDF, Word document, or text file.",
        variant: "destructive",
      });
      return;
    }

    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to upload files.",
        variant: "destructive",
      });
      return;
    }

    setUploadedFile(file);
    setErrorDetails(null);
    setIsUploading(true);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("user_uploads")
        .upload(filePath, file);

      if (uploadError) {
        throw new Error(`Upload failed: ${uploadError.message}`);
      }

      setIsUploading(false);
      setIsAnalyzing(true);

      const { data, error: functionError } = await supabase.functions.invoke("generate-draft", {
        body: {
          file_path: filePath,
          check_type: "rfp_extraction",
        },
      });

      if (functionError) {
        const details: ErrorDetails = {
          message: functionError.message || "Analysis failed",
        };
        throw { ...details, isStructured: true };
      }

      if (data?.error) {
        const details: ErrorDetails = {
          message: data.error,
          version: data.version,
          azure_request_id: data.azure_request_id,
          status: data.status,
          code: data.code,
        };
        throw { ...details, isStructured: true };
      }

      setScanComplete(true);
      setIsAnalyzing(false);

      await new Promise(resolve => setTimeout(resolve, 800));

      onAICreate(data);
      resetState();

    } catch (error) {
      console.error("AI extraction error:", error);
      setIsUploading(false);
      setIsAnalyzing(false);
      
      let details: ErrorDetails;

      if (
        typeof error === 'object' &&
        error !== null &&
        'isStructured' in error &&
        (error as { isStructured: unknown }).isStructured === true
      ) {
        const structError = error as StructuredError;
        details = {
          message: structError.message,
          version: structError.version,
          azure_request_id: structError.azure_request_id,
          status: structError.status,
          code: structError.code,
        };
      } else {
        details = {
          message: error instanceof Error ? error.message : "Failed to analyze document",
        };
      }
      
      setErrorDetails(details);
      
      toast({
        title: "Extraction Failed",
        description: details.message,
        variant: "destructive",
      });
    }
  };

  const resetState = () => {
    setUploadedFile(null);
    setIsUploading(false);
    setIsAnalyzing(false);
    setScanComplete(false);
    setErrorDetails(null);
  };

  const handleClose = () => {
    resetState();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl p-0 overflow-hidden gap-0">
        <AnimatePresence mode="wait">
          {(isUploading || isAnalyzing || scanComplete || errorDetails) ? (
            <motion.div
              key="scanning"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex flex-col items-center justify-center py-16 px-6"
            >
              {errorDetails ? (
                <>
                  <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
                    <AlertCircle className="w-8 h-8 text-destructive" />
                  </div>
                  <p className="mt-5 text-base font-semibold text-destructive">Extraction Failed</p>
                  <p className="text-sm text-muted-foreground mt-1.5 text-center max-w-sm">{errorDetails.message}</p>
                  
                  {(errorDetails.version || errorDetails.azure_request_id || errorDetails.code) && (
                    <Collapsible className="mt-4 w-full max-w-sm">
                      <CollapsibleTrigger className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors mx-auto">
                        <ChevronDown className="w-3 h-3" />
                        Technical details
                      </CollapsibleTrigger>
                      <CollapsibleContent className="mt-2 p-3 bg-muted rounded-lg text-xs font-mono space-y-1">
                        {errorDetails.version && <p>Version: {errorDetails.version}</p>}
                        {errorDetails.azure_request_id && <p>Request ID: {errorDetails.azure_request_id}</p>}
                        {errorDetails.code && <p>Code: {errorDetails.code}</p>}
                        {errorDetails.status && <p>Status: {errorDetails.status}</p>}
                      </CollapsibleContent>
                    </Collapsible>
                  )}
                  
                  <Button variant="outline" size="sm" className="mt-4" onClick={resetState}>
                    Try Again
                  </Button>
                </>
              ) : (isUploading || isAnalyzing) ? (
                <>
                  <div className="relative">
                    <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center">
                      {isUploading ? (
                        <Upload className="w-9 h-9 text-primary" />
                      ) : (
                        <Sparkles className="w-9 h-9 text-primary" />
                      )}
                    </div>
                    <motion.div
                      className="absolute inset-0 rounded-2xl border-2 border-primary"
                      animate={{ scale: [1, 1.15, 1], opacity: [0.4, 0, 0.4] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    />
                  </div>

                  <p className="mt-6 text-base font-semibold text-foreground">
                    {isUploading ? "Uploading your document…" : "Extracting requirements…"}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1 text-center max-w-xs">
                    {isUploading
                      ? "Securely transferring your file."
                      : "Our AI is reading and structuring your RFP. This may take a moment."}
                  </p>
                  <p className="text-xs text-muted-foreground mt-3 font-mono">{uploadedFile?.name}</p>

                  {/* Progress bar */}
                  <div className="mt-5 w-56 h-1.5 bg-muted rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-primary rounded-full"
                      initial={{ width: "0%" }}
                      animate={{ width: isUploading ? "30%" : "95%" }}
                      transition={{ duration: isUploading ? 2 : 8, ease: "easeOut" }}
                    />
                  </div>

                  {/* Step indicators */}
                  <div className="mt-6 flex items-center gap-6 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                      {isUploading ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" />
                      ) : (
                        <CheckCircle className="w-3.5 h-3.5 text-primary" />
                      )}
                      <span className={isUploading ? "text-foreground font-medium" : "text-primary"}>Upload</span>
                    </div>
                    <div className="w-6 h-px bg-border" />
                    <div className="flex items-center gap-1.5">
                      {isAnalyzing ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" />
                      ) : (
                        <div className="w-3.5 h-3.5 rounded-full border border-border" />
                      )}
                      <span className={isAnalyzing ? "text-foreground font-medium" : ""}>Analyze</span>
                    </div>
                    <div className="w-6 h-px bg-border" />
                    <div className="flex items-center gap-1.5">
                      <div className="w-3.5 h-3.5 rounded-full border border-border" />
                      <span>Done</span>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", damping: 15 }}
                    className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center"
                  >
                    <CheckCircle className="w-8 h-8 text-primary" />
                  </motion.div>
                  <p className="mt-5 text-sm font-semibold text-primary">Extraction Complete!</p>
                  <p className="text-xs text-muted-foreground mt-1">Opening form…</p>
                </>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="options"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {/* Header with graphic */}
              <div className="px-8 pt-8 pb-6 flex items-start gap-6">
                <div className="flex-1 min-w-0">
                  <DialogHeader className="p-0 space-y-0">
                    <DialogTitle className="text-xl font-semibold text-foreground">
                      Create New RFP
                    </DialogTitle>
                  </DialogHeader>
                  <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                    Start from a template or let AI extract requirements from an existing document — saving hours of manual entry.
                  </p>
                </div>
                <img
                  src={rfpGraphic}
                  alt="AI document extraction"
                  className="w-28 h-28 object-contain flex-shrink-0 hidden sm:block"
                />
              </div>

              <div className="border-t border-border" />

              {/* Options */}
              <div className="p-6 space-y-3">
                {/* AI Extraction option */}
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`relative rounded-lg border p-5 transition-all cursor-pointer group ${
                    isDragging 
                      ? "border-primary bg-primary/5" 
                      : "border-border hover:border-primary/40 hover:bg-muted/40"
                  }`}
                >
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={handleFileSelect}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  
                  <div className="flex items-center gap-4">
                    <div className="w-11 h-11 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Sparkles className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-semibold text-foreground">
                          AI Extraction
                        </h3>
                        <span className="px-1.5 py-0.5 rounded bg-primary/10 text-primary text-[10px] font-medium uppercase tracking-wide">
                          Recommended
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Upload a PDF or Word doc — we'll extract title, requirements, and budget automatically.
                      </p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <div className="flex gap-1">
                        <span className="px-1.5 py-0.5 rounded bg-muted text-[10px] text-muted-foreground font-mono">.PDF</span>
                        <span className="px-1.5 py-0.5 rounded bg-muted text-[10px] text-muted-foreground font-mono">.DOCX</span>
                      </div>
                      <Upload className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                  </div>
                </div>

                {/* Manual Builder option */}
                <div
                  onClick={() => {
                    onManualCreate();
                    handleClose();
                  }}
                  className="rounded-lg border border-border p-5 hover:border-muted-foreground/30 hover:bg-muted/40 transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-11 h-11 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                      <PenTool className="w-5 h-5 text-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold text-foreground">
                        Manual Builder
                      </h3>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Start from a blank template and define requirements step by step.
                      </p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors flex-shrink-0" />
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
};

export default SmartRFPCreator;
